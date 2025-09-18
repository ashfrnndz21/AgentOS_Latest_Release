"""
Agent Communication Service
Handles communication between workflow engine and real Ollama agents
"""

import asyncio
import aiohttp
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

class AgentCommunicator:
    """Handles communication with real Ollama agents"""
    
    def __init__(self, ollama_base_url: str = "http://localhost:11434"):
        self.ollama_base_url = ollama_base_url
        self.agent_registry: Dict[str, Dict[str, Any]] = {}
        
    def register_agent(self, agent_id: str, agent_config: Dict[str, Any]):
        """Register an agent for workflow execution"""
        self.agent_registry[agent_id] = {
            **agent_config,
            'registered_at': datetime.now(),
            'status': 'available'
        }
        logger.info(f"Registered agent {agent_id} with model {agent_config.get('model')}")
    
    async def send_task_to_agent(self, agent_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send a task to a specific agent and get response"""
        
        agent_config = self.agent_registry.get(agent_id)
        if not agent_config:
            raise ValueError(f"Agent {agent_id} not registered")
        
        try:
            # Prepare the prompt for the agent
            prompt = await self._prepare_agent_prompt(agent_config, task_data)
            
            # Send request to Ollama
            response = await self._call_ollama_agent(agent_config, prompt)
            
            # Process and return response
            return {
                'agent_id': agent_id,
                'content': response.get('response', ''),
                'model': agent_config.get('model'),
                'confidence': self._calculate_confidence(response),
                'processing_time': response.get('total_duration', 0) / 1000000,  # Convert to ms
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error communicating with agent {agent_id}: {str(e)}")
            return {
                'agent_id': agent_id,
                'content': f"Error: Failed to communicate with agent - {str(e)}",
                'error': True,
                'timestamp': datetime.now().isoformat()
            }
    
    async def _prepare_agent_prompt(self, agent_config: Dict[str, Any], task_data: Dict[str, Any]) -> str:
        """Prepare a contextual prompt for the agent based on its role and the task"""
        
        role = agent_config.get('role', 'Assistant')
        capabilities = agent_config.get('capabilities', [])
        user_input = task_data.get('user_input', '')
        context = task_data.get('context', {})
        previous_outputs = task_data.get('previous_outputs', {})
        
        # Build contextual prompt
        prompt_parts = []
        
        # Role and capabilities
        prompt_parts.append(f"You are a {role} with the following capabilities: {', '.join(capabilities)}")
        
        # Context from previous agents
        if previous_outputs:
            prompt_parts.append("\nPrevious agent outputs:")
            for prev_agent_id, prev_output in previous_outputs.items():
                content = prev_output.get('content', '')[:200]  # Limit context length
                prompt_parts.append(f"- {prev_agent_id}: {content}")
        
        # Current workflow context
        if context:
            relevant_context = self._extract_relevant_context(context, capabilities)
            if relevant_context:
                prompt_parts.append(f"\nRelevant context: {relevant_context}")
        
        # Specific instructions based on role
        if 'cvm' in role.lower() or 'customer' in role.lower():
            prompt_parts.append("\nFocus on customer journey analysis, segmentation, and value optimization.")
        elif 'analyst' in role.lower():
            prompt_parts.append("\nProvide data-driven insights and predictive analysis.")
        elif 'risk' in role.lower():
            prompt_parts.append("\nEvaluate potential risks and compliance considerations.")
        
        # Main task
        prompt_parts.append(f"\nTask: {user_input}")
        
        # Instructions for workflow integration
        prompt_parts.append("\nProvide a clear, actionable response that can be used by other agents in the workflow.")
        
        return "\n".join(prompt_parts)
    
    async def _call_ollama_agent(self, agent_config: Dict[str, Any], prompt: str) -> Dict[str, Any]:
        """Make actual API call to Ollama"""
        
        model = agent_config.get('model', 'llama3')
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": agent_config.get('temperature', 0.7),
                "top_p": agent_config.get('top_p', 0.9),
                "max_tokens": agent_config.get('max_tokens', 1000)
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.ollama_base_url}/api/generate",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                
                if response.status != 200:
                    raise Exception(f"Ollama API error: {response.status}")
                
                result = await response.json()
                return result
    
    def _extract_relevant_context(self, context: Dict[str, Any], capabilities: List[str]) -> str:
        """Extract context relevant to agent's capabilities"""
        
        relevant_items = []
        
        # Map capabilities to context keys
        capability_mapping = {
            'customer-analysis': ['customer', 'user', 'client'],
            'risk-assessment': ['risk', 'compliance', 'security'],
            'data-analysis': ['data', 'metrics', 'analytics'],
            'document-processing': ['document', 'text', 'content']
        }
        
        for capability in capabilities:
            if capability in capability_mapping:
                for key_pattern in capability_mapping[capability]:
                    for context_key, context_value in context.items():
                        if key_pattern.lower() in context_key.lower():
                            relevant_items.append(f"{context_key}: {str(context_value)[:100]}")
        
        return "; ".join(relevant_items[:3])  # Limit to top 3 relevant items
    
    def _calculate_confidence(self, ollama_response: Dict[str, Any]) -> float:
        """Calculate confidence score based on Ollama response metrics"""
        
        # Simple confidence calculation based on response characteristics
        response_text = ollama_response.get('response', '')
        
        if not response_text:
            return 0.0
        
        # Factors that increase confidence
        confidence = 0.5  # Base confidence
        
        # Length factor (reasonable length responses are more confident)
        if 50 <= len(response_text) <= 500:
            confidence += 0.2
        
        # Certainty indicators
        certainty_words = ['definitely', 'clearly', 'obviously', 'certainly', 'confirmed']
        uncertainty_words = ['maybe', 'possibly', 'might', 'unclear', 'uncertain']
        
        certainty_count = sum(1 for word in certainty_words if word in response_text.lower())
        uncertainty_count = sum(1 for word in uncertainty_words if word in response_text.lower())
        
        confidence += (certainty_count * 0.1) - (uncertainty_count * 0.1)
        
        # Clamp between 0 and 1
        return max(0.0, min(1.0, confidence))
    
    async def get_available_agents(self) -> Dict[str, Dict[str, Any]]:
        """Get list of available registered agents"""
        return {
            agent_id: {
                'name': config.get('name', agent_id),
                'role': config.get('role', 'Unknown'),
                'model': config.get('model', 'Unknown'),
                'capabilities': config.get('capabilities', []),
                'status': config.get('status', 'unknown'),
                'registered_at': config.get('registered_at', '').isoformat() if config.get('registered_at') else ''
            }
            for agent_id, config in self.agent_registry.items()
        }
    
    async def test_agent_connection(self, agent_id: str) -> Dict[str, Any]:
        """Test connection to a specific agent"""
        
        try:
            test_response = await self.send_task_to_agent(agent_id, {
                'user_input': 'Hello, please respond with a brief acknowledgment.',
                'context': {},
                'previous_outputs': {}
            })
            
            return {
                'agent_id': agent_id,
                'status': 'connected' if not test_response.get('error') else 'error',
                'response_time': test_response.get('processing_time', 0),
                'test_response': test_response.get('content', '')[:100]
            }
            
        except Exception as e:
            return {
                'agent_id': agent_id,
                'status': 'error',
                'error': str(e)
            }

# Global agent communicator instance
agent_communicator = AgentCommunicator()