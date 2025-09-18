"""
Workflow API Endpoints
FastAPI endpoints for multi-agent workflow execution
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import asyncio
import json
from datetime import datetime

from workflow_engine import workflow_engine, WorkflowDefinition, WorkflowNode, NodeType
from agent_communicator import agent_communicator

# Pydantic models for API
class WorkflowNodeRequest(BaseModel):
    id: str
    type: str
    name: str
    config: Dict[str, Any]
    position: Dict[str, float]
    connections: List[str] = []

class WorkflowDefinitionRequest(BaseModel):
    name: str
    description: str
    nodes: List[WorkflowNodeRequest]
    edges: List[Dict[str, str]]
    entry_point: str

class WorkflowExecutionRequest(BaseModel):
    workflow_id: str
    user_input: str

class AgentRegistrationRequest(BaseModel):
    agent_id: str
    name: str
    role: str
    model: str
    capabilities: List[str]
    temperature: float = 0.7
    max_tokens: int = 1000

# Initialize workflow engine with agent communicator
workflow_engine.register_agent_communicator(agent_communicator)

def setup_workflow_routes(app: FastAPI):
    """Setup workflow-related routes"""
    
    @app.post("/api/workflows/create")
    async def create_workflow(workflow_request: WorkflowDefinitionRequest):
        """Create a new workflow definition"""
        try:
            # Convert request to workflow definition
            nodes = []
            for node_req in workflow_request.nodes:
                node = WorkflowNode(
                    id=node_req.id,
                    type=NodeType(node_req.type),
                    name=node_req.name,
                    config=node_req.config,
                    position=node_req.position,
                    connections=node_req.connections
                )
                nodes.append(node)
            
            workflow_def = WorkflowDefinition(
                id=f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                name=workflow_request.name,
                description=workflow_request.description,
                nodes=nodes,
                edges=workflow_request.edges,
                entry_point=workflow_request.entry_point,
                created_at=datetime.now()
            )
            
            # Store workflow definition
            workflow_engine.workflow_definitions[workflow_def.id] = workflow_def
            
            return {
                "workflow_id": workflow_def.id,
                "status": "created",
                "message": f"Workflow '{workflow_def.name}' created successfully"
            }
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    @app.post("/api/workflows/execute")
    async def execute_workflow(execution_request: WorkflowExecutionRequest, background_tasks: BackgroundTasks):
        """Execute a workflow"""
        try:
            # Create workflow session
            session_id = await workflow_engine.create_workflow_session(
                execution_request.workflow_id,
                execution_request.user_input
            )
            
            # Start execution in background
            background_tasks.add_task(workflow_engine.execute_workflow, session_id)
            
            return {
                "session_id": session_id,
                "status": "started",
                "message": "Workflow execution started"
            }
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    @app.get("/api/workflows/session/{session_id}/status")
    async def get_workflow_status(session_id: str):
        """Get workflow execution status"""
        try:
            status = workflow_engine.get_session_status(session_id)
            return status
        except Exception as e:
            raise HTTPException(status_code=404, detail=str(e))
    
    @app.get("/api/workflows/session/{session_id}/result")
    async def get_workflow_result(session_id: str):
        """Get workflow execution result"""
        try:
            session = workflow_engine.active_sessions.get(session_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            
            return {
                "session_id": session_id,
                "status": session.status.value,
                "result": session.context.current_data,
                "agent_outputs": session.context.agent_outputs,
                "execution_path": [
                    {
                        "step_id": step.step_id,
                        "node_name": step.node_id,
                        "node_type": step.node_type.value,
                        "agent_id": step.agent_id,
                        "output": step.output_data,
                        "completed_at": step.completed_at.isoformat() if step.completed_at else None
                    }
                    for step in session.execution_path
                ]
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/agents/register")
    async def register_agent(agent_request: AgentRegistrationRequest):
        """Register an agent for workflow execution"""
        try:
            agent_config = {
                "name": agent_request.name,
                "role": agent_request.role,
                "model": agent_request.model,
                "capabilities": agent_request.capabilities,
                "temperature": agent_request.temperature,
                "max_tokens": agent_request.max_tokens
            }
            
            agent_communicator.register_agent(agent_request.agent_id, agent_config)
            
            return {
                "agent_id": agent_request.agent_id,
                "status": "registered",
                "message": f"Agent '{agent_request.name}' registered successfully"
            }
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    @app.get("/api/agents/available")
    async def get_available_agents():
        """Get list of available agents"""
        try:
            agents = await agent_communicator.get_available_agents()
            return {"agents": agents}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/agents/{agent_id}/test")
    async def test_agent(agent_id: str):
        """Test connection to a specific agent"""
        try:
            result = await agent_communicator.test_agent_connection(agent_id)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/workflows/definitions")
    async def get_workflow_definitions():
        """Get all workflow definitions"""
        try:
            workflows = {}
            for workflow_id, workflow_def in workflow_engine.workflow_definitions.items():
                workflows[workflow_id] = {
                    "id": workflow_def.id,
                    "name": workflow_def.name,
                    "description": workflow_def.description,
                    "node_count": len(workflow_def.nodes),
                    "created_at": workflow_def.created_at.isoformat()
                }
            
            return {"workflows": workflows}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/workflows/quick-execute")
    async def quick_execute_workflow(request: Dict[str, Any]):
        """Quick execute a simple linear workflow"""
        try:
            agent_ids = request.get('agent_ids', [])
            user_input = request.get('user_input', '')
            
            if not agent_ids:
                raise ValueError("No agents specified")
            
            # Create a simple linear workflow
            nodes = []
            edges = []
            
            for i, agent_id in enumerate(agent_ids):
                node = WorkflowNode(
                    id=f"agent_{i}",
                    type=NodeType.AGENT,
                    name=f"Agent {i+1}",
                    config={"agent_id": agent_id},
                    position={"x": i * 200, "y": 100},
                    connections=[]
                )
                nodes.append(node)
                
                if i > 0:
                    edges.append({"from": f"agent_{i-1}", "to": f"agent_{i}"})
            
            # Create workflow definition
            workflow_def = WorkflowDefinition(
                id=f"quick_workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                name="Quick Workflow",
                description="Auto-generated linear workflow",
                nodes=nodes,
                edges=edges,
                entry_point="agent_0",
                created_at=datetime.now()
            )
            
            # Store and execute
            workflow_engine.workflow_definitions[workflow_def.id] = workflow_def
            session_id = await workflow_engine.create_workflow_session(workflow_def.id, user_input)
            
            # Execute synchronously for quick results
            result = await workflow_engine.execute_workflow(session_id)
            
            return result
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

# Example workflow templates
EXAMPLE_WORKFLOWS = {
    "customer_analysis": {
        "name": "Customer Analysis Workflow",
        "description": "Analyze customer complaint and provide resolution",
        "nodes": [
            {
                "id": "cvm_agent",
                "type": "agent",
                "name": "CVM Analysis",
                "config": {"agent_id": "cvm_agent"},
                "position": {"x": 100, "y": 100},
                "connections": ["handoff_node"]
            },
            {
                "id": "handoff_node",
                "type": "handoff",
                "name": "Smart Handoff",
                "config": {
                    "strategy": "expertise",
                    "available_agents": ["risk_agent", "resolution_agent"]
                },
                "position": {"x": 300, "y": 100},
                "connections": ["aggregator"]
            },
            {
                "id": "aggregator",
                "type": "aggregator",
                "name": "Combine Results",
                "config": {"method": "consensus"},
                "position": {"x": 500, "y": 100},
                "connections": []
            }
        ],
        "edges": [
            {"from": "cvm_agent", "to": "handoff_node"},
            {"from": "handoff_node", "to": "aggregator"}
        ],
        "entry_point": "cvm_agent"
    }
}