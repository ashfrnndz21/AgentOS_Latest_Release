"""
FastAPI endpoints for Real Strands Framework Integration
Provides REST API for Strands agents with Ollama model provider
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime

from strands_integration import strands_ollama_service

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/strands", tags=["strands-framework"])

# Pydantic models for API
class StrandsAgentConfig(BaseModel):
    name: str = Field(..., description="Agent name")
    description: Optional[str] = Field("", description="Agent description")
    model: Dict[str, Any] = Field(..., description="Model configuration")
    reasoning_patterns: Dict[str, bool] = Field(default_factory=dict, description="Reasoning patterns")
    memory_enabled: bool = Field(True, description="Enable conversation memory")
    tools: Optional[List[str]] = Field(default_factory=list, description="Available tools")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Model temperature")
    max_tokens: int = Field(2000, gt=0, description="Maximum tokens")

class MessageRequest(BaseModel):
    agent_id: str = Field(..., description="Agent ID")
    message: str = Field(..., description="User message")

class AgentResponse(BaseModel):
    agent_id: str
    name: str
    model: str
    status: str
    created_at: str
    capabilities: List[str]
    tools: List[str]

class ExecutionResponse(BaseModel):
    response: str
    metadata: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    ollama_status: str
    agents_count: int
    total_conversations: int
    service: str
    timestamp: str

# API Endpoints

@router.post("/agents", response_model=AgentResponse)
async def create_strands_agent(config: StrandsAgentConfig):
    """
    Create a new Strands agent with Ollama model provider
    
    This endpoint creates a real Strands framework agent that uses
    Ollama as the model provider for local AI execution.
    """
    try:
        logger.info(f"Creating Strands agent: {config.name} with model: {config.model}")
        
        # Validate model configuration
        if not config.model.get('model_name'):
            raise HTTPException(
                status_code=400, 
                detail="Model name is required in model configuration"
            )
        
        # Create agent using Strands service
        agent_data = await strands_ollama_service.create_strands_agent(config.dict())
        
        return AgentResponse(**agent_data)
        
    except ValueError as e:
        logger.error(f"Validation error creating agent: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating Strands agent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")

@router.get("/agents")
async def list_strands_agents():
    """
    List all Strands agents
    
    Returns a list of all created Strands agents with their
    current status and configuration details.
    """
    try:
        agents = strands_ollama_service.list_agents()
        return {"agents": agents, "count": len(agents)}
        
    except Exception as e:
        logger.error(f"Error listing agents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list agents: {str(e)}")

@router.get("/agents/{agent_id}")
async def get_strands_agent(agent_id: str):
    """
    Get detailed information about a specific Strands agent
    
    Returns comprehensive details about the agent including
    conversation history, performance metrics, and configuration.
    """
    try:
        agent_data = strands_ollama_service.get_agent(agent_id)
        return agent_data
        
    except ValueError as e:
        logger.error(f"Agent not found: {agent_id}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get agent: {str(e)}")

@router.post("/agents/execute", response_model=ExecutionResponse)
async def execute_strands_agent(request: MessageRequest):
    """
    Execute a Strands agent with a user message
    
    Sends a message to the specified Strands agent and returns
    the AI-generated response along with execution metadata.
    """
    try:
        logger.info(f"Executing agent {request.agent_id} with message: {request.message[:50]}...")
        
        # Execute agent using Strands framework
        result = await strands_ollama_service.execute_agent(
            request.agent_id, 
            request.message
        )
        
        return ExecutionResponse(**result)
        
    except ValueError as e:
        logger.error(f"Agent execution error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error executing agent {request.agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")

@router.get("/agents/{agent_id}/conversations")
async def get_agent_conversations(agent_id: str):
    """
    Get conversation history for a specific agent
    
    Returns the complete conversation history including
    user messages, agent responses, and metadata.
    """
    try:
        conversations = strands_ollama_service.get_agent_conversations(agent_id)
        return {
            "agent_id": agent_id,
            "conversations": conversations,
            "count": len(conversations)
        }
        
    except ValueError as e:
        logger.error(f"Agent not found for conversations: {agent_id}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting conversations for {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get conversations: {str(e)}")

@router.delete("/agents/{agent_id}")
async def delete_strands_agent(agent_id: str):
    """
    Delete a Strands agent
    
    Permanently removes the agent and all associated
    conversation history and configuration.
    """
    try:
        success = strands_ollama_service.delete_agent(agent_id)
        
        if success:
            return {"message": f"Agent {agent_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Agent not found")
            
    except Exception as e:
        logger.error(f"Error deleting agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete agent: {str(e)}")

@router.get("/health", response_model=HealthResponse)
async def strands_health_check():
    """
    Check the health status of the Strands-Ollama service
    
    Returns the current status of the service including
    Ollama connectivity, agent count, and system health.
    """
    try:
        health_data = await strands_ollama_service.health_check()
        return HealthResponse(**health_data)
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return HealthResponse(
            status="unhealthy",
            ollama_status="unknown",
            agents_count=0,
            total_conversations=0,
            service="strands-ollama",
            timestamp=datetime.now().isoformat()
        )

@router.get("/models")
async def list_available_models():
    """
    List available Ollama models for Strands agents
    
    Returns all Ollama models that can be used as
    model providers for Strands agents.
    """
    try:
        # Import Ollama service to get available models
        import sys
        import os
        sys.path.append(os.path.dirname(__file__))
        from ollama_service import ollama_service
        
        models = await ollama_service.list_models()
        
        # Format models for Strands compatibility
        strands_models = []
        for model in models:
            strands_models.append({
                "model_id": model["name"],
                "name": model["name"],
                "size": model.get("size_gb", 0),
                "family": model.get("family", "Unknown"),
                "capabilities": {
                    "chat": True,
                    "tools": model.get("is_code_model", False),
                    "structured_output": model.get("is_code_model", False)
                },
                "provider": "ollama"
            })
        
        return {
            "models": strands_models,
            "count": len(strands_models),
            "provider": "ollama"
        }
        
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")

@router.get("/capabilities")
async def get_strands_capabilities():
    """
    Get available Strands framework capabilities
    
    Returns information about supported reasoning patterns,
    tools, and other Strands framework features.
    """
    return {
        "reasoning_patterns": {
            "chain_of_thought": {
                "name": "Chain of Thought",
                "description": "Step-by-step reasoning process",
                "supported": True
            },
            "tree_of_thought": {
                "name": "Tree of Thought", 
                "description": "Multiple reasoning path exploration",
                "supported": True
            },
            "reflection": {
                "name": "Reflection",
                "description": "Self-evaluation and improvement",
                "supported": True
            }
        },
        "tools": {
            "web_search": "Search the web for information",
            "calculator": "Perform mathematical calculations", 
            "file_reader": "Read and analyze files",
            "code_executor": "Execute code snippets",
            "memory_search": "Search conversation memory"
        },
        "memory_systems": {
            "conversation": "Persistent conversation memory",
            "semantic": "Semantic knowledge storage",
            "episodic": "Event-based memory"
        },
        "model_providers": ["ollama"],
        "structured_output": True,
        "tool_calling": True,
        "version": "1.0.0"
    }

# Note: Exception handlers are added at the app level, not router level