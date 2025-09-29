#!/usr/bin/env python3
"""
Modern System Orchestrator - A2A Multi-Agent Query
- Direct integration with A2A orchestration-enabled agents
- Intelligent agent selection based on capabilities
- Direct agent execution via dedicated backends
- Streamlined orchestration flow
"""

import json
import uuid
import logging
import requests
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class OrchestrationResult:
    """Result of orchestration execution"""
    success: bool
    agent_name: str
    agent_id: str
    response: str
    execution_time: float
    backend_used: str
    capabilities_used: List[str]

class ModernSystemOrchestrator:
    """Modern System Orchestrator for A2A Multi-Agent Queries"""
    
    def __init__(self):
        self.a2a_service_url = "http://localhost:5008"
        self.strands_sdk_url = "http://localhost:5006"
        self.ollama_base_url = "http://localhost:11434"
        
        logger.info("🚀 Modern System Orchestrator initialized")
        logger.info("🎯 Direct A2A orchestration-enabled agent integration")
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """Process query through modern orchestration"""
        session_id = str(uuid.uuid4())
        logger.info(f"[{session_id}] 🎯 Processing query: {query[:50]}...")
        
        try:
            # Step 1: Get orchestration-enabled agents
            orchestration_agents = self._get_orchestration_agents()
            logger.info(f"[{session_id}] 🔍 Found {len(orchestration_agents)} orchestration-enabled agents")
            
            if not orchestration_agents:
                return {
                    "success": False,
                    "error": "No orchestration-enabled agents available",
                    "session_id": session_id
                }
            
            # Step 2: Intelligent agent selection
            selected_agent = self._select_best_agent(query, orchestration_agents, session_id)
            if not selected_agent:
                return {
                    "success": False,
                    "error": "No suitable agent found for query",
                    "session_id": session_id
                }
            
            logger.info(f"[{session_id}] ✅ Selected agent: {selected_agent['name']} (confidence: {selected_agent['confidence']:.2f})")
            
            # Step 3: Direct agent execution
            execution_result = self._execute_agent_directly(selected_agent, query, session_id)
            
            # Step 4: Format response
            return self._format_response(execution_result, selected_agent, session_id)
            
        except Exception as e:
            logger.error(f"[{session_id}] ❌ Orchestration error: {e}")
            return {
                "success": False,
                "error": str(e),
                "session_id": session_id
            }
    
    def _get_orchestration_agents(self) -> List[Dict]:
        """Get orchestration-enabled agents from A2A service"""
        try:
            response = requests.get(f"{self.a2a_service_url}/api/a2a/orchestration-agents", timeout=10)
            if response.status_code == 200:
                data = response.json()
                agents = data.get('agents', [])
                logger.info(f"🔍 Retrieved {len(agents)} orchestration-enabled agents")
                return agents
            else:
                logger.error(f"Failed to get orchestration agents: HTTP {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error getting orchestration agents: {e}")
            return []
    
    def _select_best_agent(self, query: str, agents: List[Dict], session_id: str) -> Optional[Dict]:
        """Intelligent agent selection based on query and capabilities"""
        query_lower = query.lower()
        best_agent = None
        best_confidence = 0.0
        
        # Check for multi-domain queries that might benefit from multiple agents
        multi_domain_keywords = ['creative', 'marketing', 'ad', 'advertisement', 'design', 'writing', 'content']
        has_creative_elements = any(keyword in query_lower for keyword in multi_domain_keywords)
        
        for agent in agents:
            confidence = self._calculate_match_confidence(query_lower, agent)
            
            # Boost confidence for creative agents on multi-domain queries
            if has_creative_elements and 'creative' in agent.get('name', '').lower():
                confidence = min(0.95, confidence + 0.3)
                logger.info(f"[{session_id}] 🎨 Boosted confidence for Creative agent on multi-domain query: {confidence:.2f}")
            
            if confidence > best_confidence:
                best_confidence = confidence
                best_agent = agent.copy()
                best_agent['confidence'] = confidence
        
        # Only return agent if confidence is above threshold
        if best_confidence >= 0.6:
            return best_agent
        
        # Fallback: use any orchestration-enabled agent
        if agents:
            fallback_agent = agents[0].copy()
            fallback_agent['confidence'] = 0.8
            fallback_agent['fallback_reason'] = "No specific match found, using available agent"
            logger.info(f"[{session_id}] 🔄 Using fallback agent: {fallback_agent['name']}")
            return fallback_agent
        
        return None
    
    def _calculate_match_confidence(self, query_lower: str, agent: Dict) -> float:
        """Calculate confidence score for agent-query matching"""
        confidence = 0.5
        agent_name = agent.get('name', '').lower().strip()
        capabilities = agent.get('capabilities', [])
        
        # Name-based matching
        if 'car' in agent_name and ('car' in query_lower or 'vehicle' in query_lower or 'automotive' in query_lower):
            confidence = 0.95
        elif 'weather' in agent_name and ('weather' in query_lower or 'temperature' in query_lower or 'climate' in query_lower):
            confidence = 0.95
        elif 'creative' in agent_name and ('creative' in query_lower or 'writing' in query_lower or 'art' in query_lower or 'marketing' in query_lower or 'ad' in query_lower):
            confidence = 0.95
        elif 'technical' in agent_name and ('technical' in query_lower or 'programming' in query_lower or 'code' in query_lower):
            confidence = 0.95
        elif 'assistant' in agent_name:
            confidence = 0.8
        
        # Capability-based matching
        for capability in capabilities:
            if capability.lower() in query_lower:
                confidence = min(0.95, confidence + 0.2)
        
        # General keyword matching
        agent_keywords = agent_name.split()
        for keyword in agent_keywords:
            if keyword in query_lower:
                confidence = min(0.95, confidence + 0.1)
        
        return confidence
    
    def _execute_agent_directly(self, agent: Dict, query: str, session_id: str) -> OrchestrationResult:
        """Execute agent directly via its dedicated backend"""
        # Use the original Strands SDK agent ID, not the A2A agent ID
        agent_id = agent.get('strands_agent_id') or agent.get('original_strands_id')
        if not agent_id:
            # Fallback: extract from A2A agent ID if it has the pattern a2a_<original_id>
            a2a_id = agent.get('id', '')
            if a2a_id.startswith('a2a_'):
                agent_id = a2a_id[4:]  # Remove 'a2a_' prefix
        
        agent_name = agent.get('name', 'Unknown Agent')
        dedicated_backend = agent.get('dedicated_ollama_backend', {})
        
        logger.info(f"[{session_id}] 🚀 Executing agent {agent_name} directly")
        
        try:
            # Use dedicated Ollama backend if available and running
            if dedicated_backend and dedicated_backend.get('status') == 'running':
                ollama_url = dedicated_backend.get('host', self.ollama_base_url)
                model = dedicated_backend.get('model', 'qwen3:1.7b')
                logger.info(f"[{session_id}] 📡 Using dedicated Ollama backend: {ollama_url} with model: {model}")
            else:
                # Fallback to main Ollama instance
                ollama_url = self.ollama_base_url
                model = dedicated_backend.get('model', 'qwen3:1.7b') if dedicated_backend else 'qwen3:1.7b'
                logger.info(f"[{session_id}] 📡 Using main Ollama backend: {ollama_url} with model: {model} (dedicated backend not available)")
            
            # Prepare contextual task
            contextual_task = self._prepare_contextual_task(agent, query)
            
            # Execute via Strands SDK with dedicated backend
            start_time = datetime.now()
            
            response = requests.post(
                f"{self.strands_sdk_url}/api/strands-sdk/agents/{agent_id}/execute",
                json={
                    "input": contextual_task,
                    "session_id": session_id,
                    "ollama_backend": ollama_url
                },
                timeout=120
            )
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            if response.status_code == 200:
                result = response.json()
                return OrchestrationResult(
                    success=True,
                    agent_name=agent_name,
                    agent_id=agent_id,
                    response=result.get('response', ''),
                    execution_time=execution_time,
                    backend_used=f"{ollama_url} (dedicated model: {model})",
                    capabilities_used=agent.get('capabilities', [])
                )
            else:
                logger.error(f"[{session_id}] Agent execution failed: HTTP {response.status_code}")
                return OrchestrationResult(
                    success=False,
                    agent_name=agent_name,
                    agent_id=agent_id,
                    response=f"Execution failed: HTTP {response.status_code}",
                    execution_time=execution_time,
                    backend_used=ollama_url,
                    capabilities_used=agent.get('capabilities', [])
                )
                
        except Exception as e:
            logger.error(f"[{session_id}] Agent execution error: {e}")
            return OrchestrationResult(
                success=False,
                agent_name=agent_name,
                agent_id=agent_id,
                response=f"Execution error: {str(e)}",
                execution_time=0,
                backend_used="unknown",
                capabilities_used=agent.get('capabilities', [])
            )
    
    def _prepare_contextual_task(self, agent: Dict, query: str) -> str:
        """Prepare contextual task for agent execution"""
        agent_name = agent.get('name', 'Unknown Agent')
        capabilities = agent.get('capabilities', [])
        
        contextual_task = f"""You are {agent_name}, a specialized AI assistant.

Your capabilities: {', '.join(capabilities) if capabilities else 'general assistance'}

User Query: {query}

Please provide a comprehensive and helpful response to the user's query, drawing on your specialized knowledge and capabilities."""
        
        return contextual_task
    
    def _format_response(self, result: OrchestrationResult, agent: Dict, session_id: str) -> Dict[str, Any]:
        """Format orchestration response"""
        return {
            "success": result.success,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "orchestration_type": "modern_direct_a2a",
            "agent_info": {
                "name": result.agent_name,
                "id": result.agent_id,
                "capabilities": result.capabilities_used,
                "confidence": agent.get('confidence', 0.8),
                "fallback_reason": agent.get('fallback_reason', None)
            },
            "execution_info": {
                "backend_used": result.backend_used,
                "execution_time": result.execution_time,
                "success": result.success
            },
            "response": result.response,
            "analysis": {
                "stage_1_query_analysis": {
                    "input": {"query": "User query processed"},
                    "output": {"task_decomposition": ["Direct agent execution"]},
                    "timestamp": datetime.now().isoformat()
                },
                "stage_2_agent_matching": {
                    "input": {"available_agents": 1},
                    "output": {
                        "matched_agents": [{
                            "agent_name": result.agent_name,
                            "confidence": agent.get('confidence', 0.8),
                            "task": "Direct execution",
                            "execution_order": 1
                        }]
                    },
                    "timestamp": datetime.now().isoformat()
                },
                "stage_3_contextual_routing": {
                    "input": {"query": "Contextual task preparation"},
                    "output": {"routing_strategy": "direct_execution"},
                    "timestamp": datetime.now().isoformat()
                },
                "stage_4_agent_execution": {
                    "input": {"agent_id": result.agent_id},
                    "output": {
                        "executions": [{
                            "agent_name": result.agent_name,
                            "success": result.success,
                            "response": result.response,
                            "execution_time": result.execution_time,
                            "backend_used": result.backend_used
                        }]
                    },
                    "timestamp": datetime.now().isoformat()
                },
                "stage_5_synthesis": {
                    "input": {"execution_results": "Agent response"},
                    "output": {
                        "final_response": result.response,
                        "synthesis_strategy": "direct_response"
                    },
                    "timestamp": datetime.now().isoformat()
                }
            }
        }
