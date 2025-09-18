from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import uuid
from datetime import datetime

router = APIRouter()

# In-memory storage (replace with database in production)
agents_db = {}

@router.get("/agents")
async def list_agents():
    """List all agents"""
    return {"agents": list(agents_db.values())}

@router.post("/agents")
async def create_agent(agent_data: Dict[str, Any]):
    """Create a new agent"""
    agent_id = str(uuid.uuid4())
    agent = {
        "id": agent_id,
        "name": agent_data.get("name"),
        "type": agent_data.get("type", "ollama"),
        "model": agent_data.get("model", "llama3.2:latest"),
        "status": "inactive",
        "created": datetime.now().isoformat(),
        "lastActive": None,
        "config": agent_data.get("config", {})
    }
    agents_db[agent_id] = agent
    return {"agent_id": agent_id, "agent": agent}

@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get agent by ID"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"agent": agents_db[agent_id]}

@router.put("/agents/{agent_id}")
async def update_agent(agent_id: str, agent_data: Dict[str, Any]):
    """Update agent"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agents_db[agent_id].update(agent_data)
    return {"agent": agents_db[agent_id]}

@router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete agent"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    del agents_db[agent_id]
    return {"message": "Agent deleted successfully"}

@router.post("/agents/{agent_id}/start")
async def start_agent(agent_id: str):
    """Start agent"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agents_db[agent_id]["status"] = "active"
    agents_db[agent_id]["lastActive"] = datetime.now().isoformat()
    return {"message": "Agent started", "agent": agents_db[agent_id]}

@router.post("/agents/{agent_id}/stop")
async def stop_agent(agent_id: str):
    """Stop agent"""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agents_db[agent_id]["status"] = "inactive"
    return {"message": "Agent stopped", "agent": agents_db[agent_id]}