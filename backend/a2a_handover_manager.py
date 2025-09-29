"""
A2A Handover Manager - Implements Option 3: True A2A Multi-Agent Orchestration
Handles agent-to-agent communication, context passing, and handover protocols
"""

import uuid
import requests
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class A2AHandover:
    """A2A Handover between agents"""
    id: str
    from_agent_id: str
    to_agent_id: str
    context: Dict[str, Any]
    task: str
    status: str = "initiated"
    timestamp: datetime = None
    result: Optional[Dict] = None
    execution_time: float = 0.0
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

@dataclass
class AgentExecutionResult:
    """Result from agent execution"""
    agent_id: str
    agent_name: str
    task: str
    response: str
    execution_time: float
    backend_used: str
    context_received: Dict
    handover_ready: bool = True
    confidence: float = 0.0

class A2AHandoverManager:
    """Manages A2A handover protocol for multi-agent orchestration"""
    
    def __init__(self, a2a_service_url: str = "http://localhost:5008"):
        self.a2a_service_url = a2a_service_url
        self.active_handovers = {}  # handover_id -> A2AHandover
        self.handover_history = []
        self.agent_backends = {}  # agent_id -> backend_config
    
    def initiate_handover(self, from_agent_id: str, to_agent_id: str, 
                         context: Dict, task: str) -> A2AHandover:
        """Initiate A2A handover between agents"""
        handover_id = str(uuid.uuid4())
        
        handover = A2AHandover(
            id=handover_id,
            from_agent_id=from_agent_id,
            to_agent_id=to_agent_id,
            context=context,
            task=task,
            status="initiated"
        )
        
        self.active_handovers[handover_id] = handover
        
        logger.info(f"🔄 A2A Handover initiated: {from_agent_id} → {to_agent_id} (ID: {handover_id})")
        
        return handover
    
    def execute_agent_with_context(self, agent_id: str, task: str, 
                                 context: Dict, backend_url: str) -> AgentExecutionResult:
        """Execute agent with A2A context"""
        agent_name = self._get_agent_name(agent_id)
        
        logger.info(f"🚀 Executing agent {agent_name} with A2A context")
        
        # Prepare contextual input for agent
        contextual_input = self._prepare_contextual_input(agent_id, task, context)
        
        start_time = datetime.now()
        
        try:
            # Execute on dedicated backend
            response = requests.post(
                f"{backend_url}/api/generate",
                json={
                    "model": "qwen3:1.7b",
                    "prompt": contextual_input,
                    "stream": False
                },
                timeout=120
            )
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            if response.status_code == 200:
                result_data = response.json()
                agent_response = result_data.get("response", "")
                
                logger.info(f"✅ Agent {agent_name} executed successfully in {execution_time:.2f}s")
                
                return AgentExecutionResult(
                    agent_id=agent_id,
                    agent_name=agent_name,
                    task=task,
                    response=agent_response,
                    execution_time=execution_time,
                    backend_used=backend_url,
                    context_received=context,
                    handover_ready=True,
                    confidence=self._calculate_confidence(agent_response)
                )
            else:
                logger.error(f"❌ Agent {agent_name} execution failed: HTTP {response.status_code}")
                return AgentExecutionResult(
                    agent_id=agent_id,
                    agent_name=agent_name,
                    task=task,
                    response=f"Execution failed: HTTP {response.status_code}",
                    execution_time=execution_time,
                    backend_used=backend_url,
                    context_received=context,
                    handover_ready=False,
                    confidence=0.0
                )
                
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"❌ Agent {agent_name} execution error: {e}")
            return AgentExecutionResult(
                agent_id=agent_id,
                agent_name=agent_name,
                task=task,
                response=f"Execution error: {str(e)}",
                execution_time=execution_time,
                backend_used=backend_url,
                context_received=context,
                handover_ready=False,
                confidence=0.0
            )
    
    def _prepare_contextual_input(self, agent_id: str, task: str, context: Dict) -> str:
        """Prepare contextual input for agent with A2A handover context"""
        agent_name = self._get_agent_name(agent_id)
        
        # Extract previous results if available
        previous_results = context.get('previous_results', [])
        original_query = context.get('original_query', '')
        
        contextual_input = f"""A2A HANDOVER CONTEXT:
You are {agent_name} receiving an A2A handover in a multi-agent orchestration workflow.

ORIGINAL USER QUERY: {original_query}

YOUR SPECIFIC TASK: {task}

PREVIOUS AGENT RESULTS:
"""
        
        if previous_results:
            for i, result in enumerate(previous_results, 1):
                contextual_input += f"""
Agent {i}: {result.get('agent_name', 'Unknown')}
Result: {result.get('response', 'No response')[:200]}...
Execution Time: {result.get('execution_time', 0):.2f}s
"""
        else:
            contextual_input += "No previous results available."
        
        contextual_input += f"""

INSTRUCTIONS:
- You are {agent_name} in an A2A multi-agent collaboration
- Build upon the previous results if available
- Provide your specialized output for the task: {task}
- Be concise but comprehensive
- Prepare your output for potential handover to the next agent
- Focus on your area of expertise while considering the overall context

Remember: You are part of a coordinated multi-agent system working together to solve: {original_query}
"""
        
        return contextual_input
    
    def _get_agent_name(self, agent_id: str) -> str:
        """Get agent name from agent ID"""
        # Try to get from A2A service
        try:
            response = requests.get(f"{self.a2a_service_url}/api/a2a/agents", timeout=5)
            if response.status_code == 200:
                agents = response.json().get('agents', [])
                for agent in agents:
                    if agent.get('id') == agent_id:
                        return agent.get('name', 'Unknown Agent')
        except:
            pass
        
        # Fallback to extracting from agent ID
        if agent_id.startswith('a2a_'):
            return agent_id[4:].replace('_', ' ').title()
        return agent_id.replace('_', ' ').title()
    
    def _calculate_confidence(self, response: str) -> float:
        """Calculate confidence score based on response quality"""
        if not response or len(response.strip()) < 10:
            return 0.0
        
        # Simple confidence calculation based on response length and content
        confidence = min(0.95, len(response) / 1000)  # Longer responses get higher confidence
        
        # Boost confidence for structured responses
        if any(keyword in response.lower() for keyword in ['analysis', 'recommendation', 'solution', 'result']):
            confidence = min(0.95, confidence + 0.1)
        
        return confidence
    
    def prepare_handover_context(self, result: AgentExecutionResult, 
                               original_context: Dict) -> Dict:
        """Prepare context for handover to next agent"""
        # Update previous results
        previous_results = original_context.get('previous_results', [])
        previous_results.append({
            'agent_id': result.agent_id,
            'agent_name': result.agent_name,
            'task': result.task,
            'response': result.response,
            'execution_time': result.execution_time,
            'backend_used': result.backend_used,
            'confidence': result.confidence
        })
        
        return {
            'original_query': original_context.get('original_query', ''),
            'previous_results': previous_results,
            'last_agent': result.agent_name,
            'last_result': result.response,
            'total_execution_time': sum(r.get('execution_time', 0) for r in previous_results),
            'handover_count': len(previous_results)
        }
    
    def synthesize_multi_agent_response(self, results: List[AgentExecutionResult], 
                                      original_query: str) -> str:
        """Synthesize final response from multiple agent results"""
        if not results:
            return "No agent results available for synthesis."
        
        synthesis = f"""MULTI-AGENT ORCHESTRATION RESULTS

Original Query: {original_query}

AGENT EXECUTION CHAIN:
"""
        
        total_time = 0
        for i, result in enumerate(results, 1):
            synthesis += f"""
{i}. {result.agent_name} (Backend: {result.backend_used})
   Task: {result.task}
   Execution Time: {result.execution_time:.2f}s
   Confidence: {result.confidence:.2f}
   Response: {result.response[:300]}{'...' if len(result.response) > 300 else ''}
"""
            total_time += result.execution_time
        
        synthesis += f"""
SYNTHESIS:
Total Execution Time: {total_time:.2f}s
Agents Coordinated: {len(results)}
Backends Used: {len(set(r.backend_used for r in results))}

COMBINED RESPONSE:
"""
        
        # Combine the most relevant parts of each response
        for result in results:
            if result.confidence > 0.5:  # Only include high-confidence results
                synthesis += f"\n{result.agent_name}: {result.response}\n"
        
        return synthesis
    
    def get_handover_status(self, handover_id: str) -> Optional[Dict]:
        """Get status of a specific handover"""
        if handover_id in self.active_handovers:
            handover = self.active_handovers[handover_id]
            return {
                "id": handover.id,
                "from_agent": handover.from_agent_id,
                "to_agent": handover.to_agent_id,
                "status": handover.status,
                "timestamp": handover.timestamp.isoformat(),
                "task": handover.task
            }
        return None
    
    def get_all_handovers(self) -> List[Dict]:
        """Get all handovers (active and completed)"""
        all_handovers = []
        
        # Active handovers
        for handover in self.active_handovers.values():
            all_handovers.append({
                "id": handover.id,
                "from_agent": handover.from_agent_id,
                "to_agent": handover.to_agent_id,
                "status": handover.status,
                "timestamp": handover.timestamp.isoformat(),
                "task": handover.task,
                "type": "active"
            })
        
        # Historical handovers
        for handover in self.handover_history:
            all_handovers.append({
                "id": handover.id,
                "from_agent": handover.from_agent_id,
                "to_agent": handover.to_agent_id,
                "status": handover.status,
                "timestamp": handover.timestamp.isoformat(),
                "task": handover.task,
                "type": "completed"
            })
        
        return sorted(all_handovers, key=lambda x: x['timestamp'], reverse=True)
