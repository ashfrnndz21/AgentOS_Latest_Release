"""
Multi-Agent Workflow Engine
Orchestrates execution flow between agents with real handoffs and context management
"""

import asyncio
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import json
import logging

logger = logging.getLogger(__name__)

class WorkflowStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ERROR = "error"
    CANCELLED = "cancelled"

class NodeType(Enum):
    AGENT = "agent"
    DECISION = "decision"
    HANDOFF = "handoff"
    HUMAN = "human"
    MEMORY = "memory"
    GUARDRAIL = "guardrail"
    AGGREGATOR = "aggregator"
    MONITOR = "monitor"

@dataclass
class WorkflowContext:
    """Shared context that flows through the workflow"""
    session_id: str
    user_input: str
    current_data: Dict[str, Any]
    agent_outputs: Dict[str, Any]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

@dataclass
class ExecutionStep:
    """Individual step in workflow execution"""
    step_id: str
    node_id: str
    node_type: NodeType
    agent_id: Optional[str]
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]]
    status: WorkflowStatus
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error_message: Optional[str]

@dataclass
class WorkflowNode:
    """Individual node in the workflow"""
    id: str
    type: NodeType
    name: str
    config: Dict[str, Any]
    position: Dict[str, float]
    connections: List[str]  # Connected node IDs

@dataclass
class WorkflowDefinition:
    """Complete workflow definition"""
    id: str
    name: str
    description: str
    nodes: List[WorkflowNode]
    edges: List[Dict[str, str]]  # {from: node_id, to: node_id}
    entry_point: str  # Starting node ID
    created_at: datetime

@dataclass
class WorkflowSession:
    """Active workflow execution session"""
    session_id: str
    workflow_id: str
    status: WorkflowStatus
    context: WorkflowContext
    current_node: Optional[str]
    execution_path: List[ExecutionStep]
    created_at: datetime
    updated_at: datetime

class WorkflowEngine:
    """Core workflow execution engine"""
    
    def __init__(self):
        self.active_sessions: Dict[str, WorkflowSession] = {}
        self.workflow_definitions: Dict[str, WorkflowDefinition] = {}
        self.agent_communicator = None  # Will be injected
        
    def register_agent_communicator(self, communicator):
        """Register the agent communication service"""
        self.agent_communicator = communicator
        
    async def create_workflow_session(self, workflow_id: str, user_input: str) -> str:
        """Create a new workflow execution session"""
        session_id = str(uuid.uuid4())
        
        # Initialize context
        context = WorkflowContext(
            session_id=session_id,
            user_input=user_input,
            current_data={},
            agent_outputs={},
            metadata={},
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Create session
        session = WorkflowSession(
            session_id=session_id,
            workflow_id=workflow_id,
            status=WorkflowStatus.PENDING,
            context=context,
            current_node=None,
            execution_path=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        self.active_sessions[session_id] = session
        logger.info(f"Created workflow session {session_id} for workflow {workflow_id}")
        
        return session_id
    
    async def execute_workflow(self, session_id: str) -> Dict[str, Any]:
        """Execute a workflow session"""
        session = self.active_sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
            
        workflow = self.workflow_definitions.get(session.workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {session.workflow_id} not found")
            
        try:
            session.status = WorkflowStatus.RUNNING
            session.current_node = workflow.entry_point
            session.updated_at = datetime.now()
            
            logger.info(f"Starting workflow execution for session {session_id}")
            
            # Execute workflow nodes
            result = await self._execute_node_sequence(session, workflow)
            
            session.status = WorkflowStatus.COMPLETED
            session.updated_at = datetime.now()
            
            return {
                "session_id": session_id,
                "status": "completed",
                "result": result,
                "execution_path": [asdict(step) for step in session.execution_path]
            }
            
        except Exception as e:
            session.status = WorkflowStatus.ERROR
            session.updated_at = datetime.now()
            logger.error(f"Workflow execution failed for session {session_id}: {str(e)}")
            
            return {
                "session_id": session_id,
                "status": "error",
                "error": str(e),
                "execution_path": [asdict(step) for step in session.execution_path]
            }
    
    async def _execute_node_sequence(self, session: WorkflowSession, workflow: WorkflowDefinition) -> Any:
        """Execute sequence of nodes in the workflow"""
        current_node_id = session.current_node
        max_iterations = 50  # Prevent infinite loops
        iteration = 0
        
        while current_node_id and iteration < max_iterations:
            iteration += 1
            
            # Find current node
            current_node = next((n for n in workflow.nodes if n.id == current_node_id), None)
            if not current_node:
                raise ValueError(f"Node {current_node_id} not found in workflow")
            
            logger.info(f"Executing node {current_node.name} ({current_node.type.value})")
            
            # Execute node
            step_result = await self._execute_node(session, current_node)
            
            # Record execution step
            step = ExecutionStep(
                step_id=str(uuid.uuid4()),
                node_id=current_node.id,
                node_type=current_node.type,
                agent_id=current_node.config.get('agent_id'),
                input_data=session.context.current_data.copy(),
                output_data=step_result,
                status=WorkflowStatus.COMPLETED,
                started_at=datetime.now(),
                completed_at=datetime.now(),
                error_message=None
            )
            
            session.execution_path.append(step)
            
            # Update context with result
            if step_result:
                session.context.current_data.update(step_result)
                session.context.updated_at = datetime.now()
            
            # Determine next node
            next_node_id = await self._determine_next_node(session, current_node, workflow, step_result)
            
            if not next_node_id:
                # End of workflow
                break
                
            current_node_id = next_node_id
            session.current_node = current_node_id
        
        # Return final result
        return session.context.current_data
    
    async def _execute_node(self, session: WorkflowSession, node: WorkflowNode) -> Dict[str, Any]:
        """Execute a single workflow node"""
        
        if node.type == NodeType.AGENT:
            return await self._execute_agent_node(session, node)
        elif node.type == NodeType.DECISION:
            return await self._execute_decision_node(session, node)
        elif node.type == NodeType.HANDOFF:
            return await self._execute_handoff_node(session, node)
        elif node.type == NodeType.AGGREGATOR:
            return await self._execute_aggregator_node(session, node)
        elif node.type == NodeType.HUMAN:
            return await self._execute_human_node(session, node)
        elif node.type == NodeType.MEMORY:
            return await self._execute_memory_node(session, node)
        elif node.type == NodeType.GUARDRAIL:
            return await self._execute_guardrail_node(session, node)
        elif node.type == NodeType.MONITOR:
            return await self._execute_monitor_node(session, node)
        else:
            raise ValueError(f"Unknown node type: {node.type}")
    
    async def _execute_agent_node(self, session: WorkflowSession, node: WorkflowNode) -> Dict[str, Any]:
        """Execute an agent node"""
        if not self.agent_communicator:
            raise ValueError("Agent communicator not registered")
        
        agent_id = node.config.get('agent_id')
        if not agent_id:
            raise ValueError(f"No agent_id specified for agent node {node.id}")
        
        # Prepare task for agent
        task_data = {
            "user_input": session.context.user_input,
            "context": session.context.current_data,
            "previous_outputs": session.context.agent_outputs,
            "node_config": node.config
        }
        
        # Send task to agent
        logger.info(f"Sending task to agent {agent_id}")
        agent_response = await self.agent_communicator.send_task_to_agent(agent_id, task_data)
        
        # Store agent output
        session.context.agent_outputs[agent_id] = agent_response
        
        return {
            "agent_id": agent_id,
            "agent_response": agent_response,
            "node_output": agent_response.get('content', '')
        }
    
    async def _execute_decision_node(self, session: WorkflowSession, node: WorkflowNode) -> Dict[str, Any]:
        """Execute a decision node"""
        conditions = node.config.get('conditions', [])
        
        for condition in conditions:
            if await self._evaluate_condition(session, condition):
                return {
                    "decision": condition.get('name', 'true'),
                    "next_node": condition.get('next_node'),
                    "condition_met": True
                }
        
        # Default path
        return {
            "decision": "default",
            "next_node": node.config.get('default_next'),
            "condition_met": False
        }
    
    async def _execute_handoff_node(self, session: WorkflowSession, node: WorkflowNode) -> Dict[str, Any]:
        """Execute a handoff node"""
        handoff_config = node.config
        
        # Determine target agent based on criteria
        target_agent = await self._determine_handoff_target(session, handoff_config)
        
        # Prepare handoff context
        handoff_context = {
            "summary": session.context.current_data.get('summary', ''),
            "previous_agent": session.context.current_data.get('current_agent'),
            "target_agent": target_agent,
            "handoff_reason": handoff_config.get('strategy', 'automatic'),
            "context_data": session.context.current_data
        }
        
        return {
            "handoff_executed": True,
            "target_agent": target_agent,
            "handoff_context": handoff_context,
            "current_agent": target_agent
        }
    
    async def _execute_aggregator_node(self, session: WorkflowSession, node: WorkflowNode) -> Dict[str, Any]:
        """Execute an aggregator node"""
        method = node.config.get('method', 'consensus')
        agent_responses = session.context.agent_outputs
        
        if method == 'consensus':
            # Simple consensus - combine all responses
            combined_response = "\n\n".join([
                f"Agent {agent_id}: {response.get('content', '')}"
                for agent_id, response in agent_responses.items()
            ])
        elif method == 'weighted-average':
            # Weighted by confidence scores
            weighted_responses = []
            for agent_id, response in agent_responses.items():
                confidence = response.get('confidence', 1.0)
                weighted_responses.append(f"[Confidence: {confidence}] {response.get('content', '')}")
            combined_response = "\n\n".join(weighted_responses)
        else:
            # Default: simple concatenation
            combined_response = str(agent_responses)
        
        return {
            "aggregation_method": method,
            "combined_response": combined_response,
            "agent_count": len(agent_responses)
        }
    
    async def _execute_human_node(self, session: WorkflowSession, node: WorkflowNode) -> Dict[str, Any]:
        """Execute a human input node"""
        # For now, return a placeholder - in real implementation, this would pause workflow
        return {
            "human_input_required": True,
            "input_type": node.config.get('input_type', 'text'),
            "prompt": node.config.get('prompt', 'Human input required'),
            "status": "waiting_for_input"
        }
    
    async def _execute_memory_node(self, session: WorkflowSession, node: WorkflowNode) -> Dict[str, Any]:
        """Execute a memory storage node"""
        operation = node.config.get('operation', 'store')
        
        if operation == 'store':
            # Store current context in memory
            memory_key = node.config.get('key', f"memory_{node.id}")
            session.context.metadata[memory_key] = session.context.current_data.copy()
            
            return {
                "memory_operation": "store",
                "memory_key": memory_key,
                "stored_data_size": len(str(session.context.current_data))
            }
        elif operation == 'retrieve':
            # Retrieve from memory
            memory_key = node.config.get('key')
            retrieved_data = session.context.metadata.get(memory_key, {})
            
            return {
                "memory_operation": "retrieve",
                "memory_key": memory_key,
                "retrieved_data": retrieved_data
            }
        
        return {"memory_operation": operation}
    
    async def _execute_guardrail_node(self, session: WorkflowSession, node: WorkflowNode) -> Dict[str, Any]:
        """Execute a guardrail validation node"""
        safety_level = node.config.get('safety_level', 'medium')
        
        # Simple safety check - in real implementation, this would use actual safety models
        current_content = str(session.context.current_data)
        
        # Basic content filtering
        unsafe_keywords = ['hack', 'exploit', 'malicious', 'harmful']
        safety_violations = [word for word in unsafe_keywords if word.lower() in current_content.lower()]
        
        is_safe = len(safety_violations) == 0
        
        return {
            "safety_check": "completed",
            "is_safe": is_safe,
            "safety_level": safety_level,
            "violations": safety_violations,
            "action": "continue" if is_safe else "block"
        }
    
    async def _execute_monitor_node(self, session: WorkflowSession, node: WorkflowNode) -> Dict[str, Any]:
        """Execute a monitoring node"""
        metrics = {
            "execution_time": (datetime.now() - session.created_at).total_seconds(),
            "steps_completed": len(session.execution_path),
            "agents_involved": len(session.context.agent_outputs),
            "context_size": len(str(session.context.current_data))
        }
        
        return {
            "monitoring": "active",
            "metrics": metrics,
            "status": "healthy"
        }
    
    async def _determine_next_node(self, session: WorkflowSession, current_node: WorkflowNode, 
                                 workflow: WorkflowDefinition, step_result: Dict[str, Any]) -> Optional[str]:
        """Determine the next node to execute"""
        
        # Check if step result specifies next node (for decision nodes)
        if step_result and 'next_node' in step_result:
            return step_result['next_node']
        
        # Find connected nodes
        edges = [e for e in workflow.edges if e['from'] == current_node.id]
        
        if not edges:
            # End of workflow
            return None
        
        if len(edges) == 1:
            # Single path
            return edges[0]['to']
        
        # Multiple paths - use first one for now
        # In real implementation, this would use more sophisticated routing
        return edges[0]['to']
    
    async def _evaluate_condition(self, session: WorkflowSession, condition: Dict[str, Any]) -> bool:
        """Evaluate a decision condition"""
        condition_type = condition.get('type', 'simple')
        
        if condition_type == 'simple':
            # Simple key-value check
            key = condition.get('key')
            expected_value = condition.get('value')
            actual_value = session.context.current_data.get(key)
            
            return actual_value == expected_value
        
        elif condition_type == 'contains':
            # Check if context contains specific text
            search_text = condition.get('text', '').lower()
            context_text = str(session.context.current_data).lower()
            
            return search_text in context_text
        
        # Default: always true
        return True
    
    async def _determine_handoff_target(self, session: WorkflowSession, handoff_config: Dict[str, Any]) -> str:
        """Determine target agent for handoff"""
        strategy = handoff_config.get('strategy', 'automatic')
        
        if strategy == 'automatic':
            # Simple round-robin or first available
            available_agents = handoff_config.get('available_agents', [])
            if available_agents:
                return available_agents[0]
        
        # Default fallback
        return handoff_config.get('default_agent', 'default_agent')
    
    def get_session_status(self, session_id: str) -> Dict[str, Any]:
        """Get current status of a workflow session"""
        session = self.active_sessions.get(session_id)
        if not session:
            return {"error": "Session not found"}
        
        return {
            "session_id": session_id,
            "status": session.status.value,
            "current_node": session.current_node,
            "steps_completed": len(session.execution_path),
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat()
        }

# Global workflow engine instance
workflow_engine = WorkflowEngine()