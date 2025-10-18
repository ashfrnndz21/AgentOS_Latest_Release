#!/usr/bin/env python3
"""
Improved Multi-Agent Orchestrator
Combines the best of your current system with reference architecture patterns
"""

import asyncio
import httpx
import json
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# 1. STANDARDIZED SCHEMAS (Reference Architecture)
# ============================================================================

class AgentCapability(str, Enum):
    SUMMARIZE = "summarize"
    CREATE_PRESENTATION = "create_presentation"
    WEB_RESEARCH = "web_research"
    CODE_GENERATION = "code_generation"
    CREATIVE_WRITING = "creative_writing"
    TECHNICAL_ANALYSIS = "technical_analysis"

@dataclass
class AgentSchema:
    """Standardized agent schema following reference architecture"""
    id: str
    name: str
    description: str
    endpoint: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    capabilities: List[AgentCapability]
    weight_vector: Optional[List[float]] = None
    status: str = "active"

class QueryIn(BaseModel):
    """Standardized query input"""
    query: str
    payload: Optional[Dict[str, Any]] = None

class OrchestratorResponse(BaseModel):
    """Standardized orchestrator response"""
    status: str
    result: Optional[Dict[str, Any]] = None
    execution_time: float
    agents_used: List[str]
    session_id: str

# ============================================================================
# 2. AGENT REGISTRY (Enhanced Reference Architecture)
# ============================================================================

class ImprovedAgentRegistry:
    """Enhanced agent registry with health monitoring"""
    
    def __init__(self):
        self.agents: Dict[str, AgentSchema] = {}
        self._register_default_agents()
    
    def _register_default_agents(self):
        """Register your existing agents with standardized schema"""
        
        # Creative Assistant
        self.agents["creative_assistant"] = AgentSchema(
            id="creative_assistant",
            name="Creative Assistant",
            description="Generates creative content, stories, and poems",
            endpoint="http://localhost:5031/api/main-orchestrator/orchestrate",  # Your existing endpoint
            input_schema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "context": {"type": "object"}
                }
            },
            output_schema={
                "type": "object",
                "properties": {
                    "content": {"type": "string"},
                    "metadata": {"type": "object"}
                }
            },
            capabilities=[AgentCapability.CREATIVE_WRITING],
            weight_vector=[0.9, 0.1]  # High creative, low technical
        )
        
        # Technical Expert
        self.agents["technical_expert"] = AgentSchema(
            id="technical_expert",
            name="Technical Expert",
            description="Generates code and performs technical analysis",
            endpoint="http://localhost:5031/api/main-orchestrator/orchestrate",  # Your existing endpoint
            input_schema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "context": {"type": "object"}
                }
            },
            output_schema={
                "type": "object",
                "properties": {
                    "code": {"type": "string"},
                    "analysis": {"type": "object"}
                }
            },
            capabilities=[AgentCapability.CODE_GENERATION, AgentCapability.TECHNICAL_ANALYSIS],
            weight_vector=[0.1, 0.9]  # Low creative, high technical
        )
        
        logger.info(f"✅ Registered {len(self.agents)} agents")
    
    def get_agents_by_capability(self, capability: AgentCapability) -> List[AgentSchema]:
        """Get agents that have a specific capability"""
        return [agent for agent in self.agents.values() if capability in agent.capabilities]
    
    def get_all_agents(self) -> List[AgentSchema]:
        """Get all registered agents"""
        return list(self.agents.values())
    
    async def health_check_agent(self, agent: AgentSchema) -> bool:
        """Check if agent is healthy"""
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{agent.endpoint.replace('/orchestrate', '/health')}")
                return response.status_code == 200
        except Exception as e:
            logger.warning(f"Health check failed for {agent.name}: {e}")
            return False

# ============================================================================
# 3. HYBRID ROUTING ENGINE (Best of Both Worlds)
# ============================================================================

class ImprovedRoutingEngine:
    """Hybrid routing: simple rules + LLM for complex cases"""
    
    def __init__(self, registry: ImprovedAgentRegistry):
        self.registry = registry
        self.simple_routing_rules = {
            "summarize": [AgentCapability.SUMMARIZE],
            "summary": [AgentCapability.SUMMARIZE],
            "creative": [AgentCapability.CREATIVE_WRITING],
            "story": [AgentCapability.CREATIVE_WRITING],
            "poem": [AgentCapability.CREATIVE_WRITING],
            "code": [AgentCapability.CODE_GENERATION],
            "python": [AgentCapability.CODE_GENERATION],
            "technical": [AgentCapability.TECHNICAL_ANALYSIS],
            "analysis": [AgentCapability.TECHNICAL_ANALYSIS],
            "research": [AgentCapability.WEB_RESEARCH],
            "presentation": [AgentCapability.CREATE_PRESENTATION],
            "ppt": [AgentCapability.CREATE_PRESENTATION]
        }
    
    def parse_query_to_tasks(self, query: str) -> List[AgentCapability]:
        """Parse query using simple rules first"""
        query_lower = query.lower()
        tasks = []
        
        # Check for simple routing rules
        for keyword, capabilities in self.simple_routing_rules.items():
            if keyword in query_lower:
                tasks.extend(capabilities)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_tasks = []
        for task in tasks:
            if task not in seen:
                seen.add(task)
                unique_tasks.append(task)
        
        return unique_tasks
    
    def route_query(self, query: str) -> List[AgentSchema]:
        """Route query to appropriate agents"""
        tasks = self.parse_query_to_tasks(query)
        
        if not tasks:
            # Fallback: check if it's a multi-agent query
            if any(word in query.lower() for word in ["and", "then", "also", "both"]):
                # Multi-agent query - use both creative and technical
                return [
                    self.registry.agents["creative_assistant"],
                    self.registry.agents["technical_expert"]
                ]
            else:
                # Default to creative assistant
                return [self.registry.agents["creative_assistant"]]
        
        # Find agents for each task
        selected_agents = []
        for task in tasks:
            agents = self.registry.get_agents_by_capability(task)
            selected_agents.extend(agents)
        
        # Remove duplicates
        seen = set()
        unique_agents = []
        for agent in selected_agents:
            if agent.id not in seen:
                seen.add(agent.id)
                unique_agents.append(agent)
        
        return unique_agents

# ============================================================================
# 4. ROBUST EXECUTION ENGINE (Production-Ready)
# ============================================================================

class ImprovedExecutionEngine:
    """Robust agent execution with retry logic and error handling"""
    
    def __init__(self, registry: ImprovedAgentRegistry):
        self.registry = registry
    
    async def execute_agent_with_retry(
        self, 
        agent: AgentSchema, 
        payload: dict, 
        max_retries: int = 3,
        timeout: int = 30
    ) -> Dict[str, Any]:
        """Execute agent with retry logic and exponential backoff"""
        
        for attempt in range(max_retries):
            try:
                logger.info(f"🚀 Executing {agent.name} (attempt {attempt + 1}/{max_retries})")
                
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.post(agent.endpoint, json=payload)
                    response.raise_for_status()
                    
                    result = response.json()
                    logger.info(f"✅ {agent.name} executed successfully")
                    return result
                    
            except httpx.TimeoutException:
                logger.warning(f"⏰ Timeout for {agent.name} (attempt {attempt + 1})")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise HTTPException(status_code=504, detail=f"Agent {agent.name} timed out")
                    
            except httpx.HTTPStatusError as e:
                logger.warning(f"❌ HTTP error for {agent.name}: {e}")
                if e.response.status_code >= 500 and attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                else:
                    raise HTTPException(status_code=e.response.status_code, detail=f"Agent {agent.name} failed: {e}")
                    
            except Exception as e:
                logger.error(f"💥 Unexpected error for {agent.name}: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                else:
                    raise HTTPException(status_code=500, detail=f"Agent {agent.name} error: {e}")
        
        raise HTTPException(status_code=500, detail=f"Agent {agent.name} failed after {max_retries} attempts")
    
    async def execute_agents_sequentially(
        self, 
        agents: List[AgentSchema], 
        query: str, 
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Execute agents sequentially with context passing"""
        
        results = {}
        context = context or {}
        
        for i, agent in enumerate(agents):
            # Prepare payload
            payload = {
                "query": query,
                "context": context,
                "previous_results": results,
                "agent_index": i,
                "total_agents": len(agents)
            }
            
            # Execute agent
            result = await self.execute_agent_with_retry(agent, payload)
            results[agent.id] = {
                "agent_name": agent.name,
                "result": result,
                "timestamp": time.time()
            }
            
            # Update context for next agent
            context[f"{agent.id}_result"] = result
        
        return results
    
    async def execute_agents_parallel(
        self, 
        agents: List[AgentSchema], 
        query: str, 
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Execute agents in parallel (for independent tasks)"""
        
        context = context or {}
        tasks = []
        
        for agent in agents:
            payload = {
                "query": query,
                "context": context
            }
            task = self.execute_agent_with_retry(agent, payload)
            tasks.append((agent, task))
        
        # Execute all agents in parallel
        results = {}
        for agent, task in tasks:
            try:
                result = await task
                results[agent.id] = {
                    "agent_name": agent.name,
                    "result": result,
                    "timestamp": time.time()
                }
            except Exception as e:
                logger.error(f"❌ Parallel execution failed for {agent.name}: {e}")
                results[agent.id] = {
                    "agent_name": agent.name,
                    "error": str(e),
                    "timestamp": time.time()
                }
        
        return results

# ============================================================================
# 5. MAIN ORCHESTRATOR (Clean & Simple)
# ============================================================================

class ImprovedOrchestrator:
    """Main orchestrator combining all components"""
    
    def __init__(self):
        self.registry = ImprovedAgentRegistry()
        self.routing_engine = ImprovedRoutingEngine(self.registry)
        self.execution_engine = ImprovedExecutionEngine(self.registry)
    
    async def process_query(self, query: str, context: Dict[str, Any] = None) -> OrchestratorResponse:
        """Main query processing pipeline"""
        
        start_time = time.time()
        session_id = f"session_{int(time.time())}"
        
        try:
            logger.info(f"🎯 Processing query: {query[:50]}...")
            
            # Step 1: Route query to agents
            selected_agents = self.routing_engine.route_query(query)
            logger.info(f"🔍 Selected {len(selected_agents)} agents: {[a.name for a in selected_agents]}")
            
            if not selected_agents:
                raise HTTPException(status_code=400, detail="No suitable agents found")
            
            # Step 2: Determine execution strategy
            if len(selected_agents) == 1:
                # Single agent - direct execution
                execution_strategy = "single"
            elif any(word in query.lower() for word in ["then", "and", "also"]):
                # Sequential execution for dependent tasks
                execution_strategy = "sequential"
            else:
                # Parallel execution for independent tasks
                execution_strategy = "parallel"
            
            logger.info(f"⚡ Execution strategy: {execution_strategy}")
            
            # Step 3: Execute agents
            if execution_strategy == "single":
                results = await self.execution_engine.execute_agents_sequential(selected_agents, query, context)
            elif execution_strategy == "sequential":
                results = await self.execution_engine.execute_agents_sequential(selected_agents, query, context)
            else:  # parallel
                results = await self.execution_engine.execute_agents_parallel(selected_agents, query, context)
            
            # Step 4: Synthesize response
            final_result = self._synthesize_results(results, query)
            
            execution_time = time.time() - start_time
            
            return OrchestratorResponse(
                status="success",
                result=final_result,
                execution_time=execution_time,
                agents_used=[agent.name for agent in selected_agents],
                session_id=session_id
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"💥 Orchestration failed: {e}")
            
            return OrchestratorResponse(
                status="error",
                result={"error": str(e)},
                execution_time=execution_time,
                agents_used=[],
                session_id=session_id
            )
    
    def _synthesize_results(self, results: Dict[str, Any], query: str) -> Dict[str, Any]:
        """Synthesize results from multiple agents"""
        
        if len(results) == 1:
            # Single agent result
            agent_id, agent_result = next(iter(results.items()))
            return {
                "type": "single_agent",
                "agent": agent_result["agent_name"],
                "content": agent_result["result"],
                "raw_results": results
            }
        else:
            # Multi-agent result - combine intelligently
            synthesized = {
                "type": "multi_agent",
                "agents_used": [result["agent_name"] for result in results.values()],
                "combined_content": "",
                "individual_results": {},
                "raw_results": results
            }
            
            # Simple combination logic
            for agent_id, agent_result in results.items():
                synthesized["individual_results"][agent_id] = agent_result["result"]
                
                # Extract content from result
                if isinstance(agent_result["result"], dict):
                    content = agent_result["result"].get("final_response", 
                             agent_result["result"].get("result", 
                             agent_result["result"].get("content", str(agent_result["result"]))))
                else:
                    content = str(agent_result["result"])
                
                if content:
                    synthesized["combined_content"] += f"\n\n=== {agent_result['agent_name']} ===\n{content}"
            
            return synthesized

# ============================================================================
# 6. FASTAPI APPLICATION
# ============================================================================

app = FastAPI(title="Improved Multi-Agent Orchestrator", version="1.0.0")

# Initialize orchestrator
orchestrator = ImprovedOrchestrator()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "agents_registered": len(orchestrator.registry.get_all_agents())
    }

@app.get("/agents")
async def list_agents():
    """List all registered agents"""
    agents = orchestrator.registry.get_all_agents()
    return {
        "agents": [
            {
                "id": agent.id,
                "name": agent.name,
                "description": agent.description,
                "capabilities": [cap.value for cap in agent.capabilities],
                "status": agent.status
            }
            for agent in agents
        ]
    }

@app.post("/query", response_model=OrchestratorResponse)
async def handle_query(payload: QueryIn):
    """Main query endpoint"""
    return await orchestrator.process_query(payload.query, payload.payload)

@app.post("/orchestrate")
async def orchestrate_endpoint(payload: QueryIn):
    """Alternative orchestration endpoint (compatible with existing system)"""
    result = await orchestrator.process_query(payload.query, payload.payload)
    
    # Transform to match existing system format
    return {
        "status": result.status,
        "orchestration_result": result.result,
        "execution_time": result.execution_time,
        "agents_used": result.agents_used,
        "session_id": result.session_id,
        "success": result.status == "success"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5035, log_level="info")



