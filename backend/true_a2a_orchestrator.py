"""
True A2A Multi-Agent Orchestrator - Implements complete Option 2 + Option 3
Combines dedicated backends with A2A handover protocol for true multi-agent collaboration
"""

import logging
import requests
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

from a2a_handover_manager import A2AHandoverManager, AgentExecutionResult

logger = logging.getLogger(__name__)

@dataclass
class OrchestrationPlan:
    """Plan for multi-agent orchestration"""
    query: str
    requires_multi_agent: bool
    agent_chain: List[Dict]
    estimated_time: float
    complexity: str

@dataclass
class OrchestrationResult:
    """Result from multi-agent orchestration"""
    success: bool
    orchestration_type: str
    agent_chain: List[Dict]
    handover_results: List[AgentExecutionResult]
    final_response: str
    total_execution_time: float
    backends_used: List[str]
    handover_trace: List[Dict]

class TrueA2AOrchestrator:
    """True A2A Multi-Agent Orchestrator with dedicated backends and handover protocol"""
    
    def __init__(self, a2a_service_url: str = "http://localhost:5008"):
        self.a2a_service_url = a2a_service_url
        self.handover_manager = A2AHandoverManager(a2a_service_url)
        
        # Multi-domain keywords that require multiple agents
        self.multi_domain_keywords = [
            'creative', 'marketing', 'ad', 'advertisement', 'design', 'writing', 'content',
            'analysis', 'research', 'planning', 'strategy', 'development', 'implementation'
        ]
        
        # Agent capability mappings
        self.agent_capabilities = {
            'car': ['automotive', 'vehicle', 'transportation', 'car', 'truck', 'auto'],
            'creative': ['creative', 'marketing', 'ad', 'advertisement', 'design', 'writing', 'content'],
            'weather': ['weather', 'climate', 'temperature', 'forecast', 'meteorology'],
            'technical': ['technical', 'programming', 'code', 'development', 'software'],
            'business': ['business', 'strategy', 'planning', 'management', 'finance']
        }
    
    def process_query(self, query: str, session_id: str) -> Dict:
        """Process query using true A2A multi-agent orchestration"""
        logger.info(f"[{session_id}] 🎯 Processing query with True A2A Multi-Agent Orchestration: {query}")
        
        try:
            # Stage 1: Query Analysis & Multi-Agent Detection
            analysis = self._analyze_query_for_multi_agent(query)
            
            if not analysis['requires_multi_agent']:
                # Single agent execution
                return self._execute_single_agent(query, session_id)
            else:
                # Multi-agent A2A handover chain
                return self._execute_multi_agent_chain(query, analysis, session_id)
                
        except Exception as e:
            logger.error(f"[{session_id}] True A2A orchestration error: {e}")
            return {
                "success": False,
                "error": str(e),
                "orchestration_type": "true_a2a_multi_agent",
                "session_id": session_id
            }
    
    def _analyze_query_for_multi_agent(self, query: str) -> Dict:
        """Analyze query to determine if multi-agent orchestration is needed"""
        query_lower = query.lower()
        
        # Check for multi-domain keywords
        multi_domain_found = any(keyword in query_lower for keyword in self.multi_domain_keywords)
        
        # Check for multiple domains
        domains_found = []
        for domain, keywords in self.agent_capabilities.items():
            if any(keyword in query_lower for keyword in keywords):
                domains_found.append(domain)
        
        requires_multi_agent = multi_domain_found and len(domains_found) > 1
        
        return {
            "query": query,
            "requires_multi_agent": requires_multi_agent,
            "domains_found": domains_found,
            "multi_domain_keywords": multi_domain_found,
            "complexity": "high" if requires_multi_agent else "low"
        }
    
    def _execute_single_agent(self, query: str, session_id: str) -> Dict:
        """Execute single agent (fallback for simple queries)"""
        logger.info(f"[{session_id}] 🔄 Executing single agent for simple query")
        
        # Get orchestration-enabled agents
        agents = self._get_orchestration_agents()
        if not agents:
            return {
                "success": False,
                "error": "No orchestration-enabled agents available",
                "orchestration_type": "true_a2a_single_agent",
                "session_id": session_id
            }
        
        # Select best agent
        selected_agent = self._select_best_agent(query, agents, session_id)
        if not selected_agent:
            return {
                "success": False,
                "error": "No suitable agent found",
                "orchestration_type": "true_a2a_single_agent",
                "session_id": session_id
            }
        
        # Execute single agent
        context = {"original_query": query, "previous_results": []}
        result = self.handover_manager.execute_agent_with_context(
            agent_id=selected_agent['id'],
            task=query,
            context=context,
            backend_url=selected_agent['dedicated_ollama_backend']['host']
        )
        
        return {
            "success": result.handover_ready,
            "orchestration_type": "true_a2a_single_agent",
            "session_id": session_id,
            "agent_info": {
                "name": result.agent_name,
                "id": result.agent_id,
                "confidence": result.confidence
            },
            "execution_info": {
                "backend_used": result.backend_used,
                "execution_time": result.execution_time,
                "success": result.handover_ready
            },
            "response": result.response,
            "analysis": {
                "stage_1_query_analysis": {"output": {"query": query, "intent": "single_agent_execution"}},
                "stage_2_agent_matching": {"output": {"matched_agents": [selected_agent]}},
                "stage_3_contextual_routing": {"output": {"routed_to": result.agent_name, "task": query}},
                "stage_4_agent_execution": {"output": {"executions": [{
                    "agent_name": result.agent_name,
                    "agent_id": result.agent_id,
                    "success": result.handover_ready,
                    "response": result.response,
                    "backend_used": result.backend_used,
                    "execution_time": result.execution_time
                }]}},
                "stage_5_synthesis": {"output": {"final_response": result.response}}
            }
        }
    
    def _execute_multi_agent_chain(self, query: str, analysis: Dict, session_id: str) -> Dict:
        """Execute multi-agent A2A handover chain"""
        logger.info(f"[{session_id}] 🔄 Executing multi-agent A2A handover chain")
        
        # Get orchestration-enabled agents
        agents = self._get_orchestration_agents()
        if not agents:
            return {
                "success": False,
                "error": "No orchestration-enabled agents available",
                "orchestration_type": "true_a2a_multi_agent",
                "session_id": session_id
            }
        
        # Create agent execution plan
        agent_plan = self._create_agent_execution_plan(query, analysis, agents)
        
        # Execute A2A handover chain
        results = []
        context = {"original_query": query, "previous_results": []}
        handover_trace = []
        
        for i, step in enumerate(agent_plan):
            logger.info(f"[{session_id}] 🚀 Executing step {i+1}: {step['agent_name']}")
            
            # Execute agent with context
            result = self.handover_manager.execute_agent_with_context(
                agent_id=step['agent_id'],
                task=step['task'],
                context=context,
                backend_url=step['dedicated_backend']['host']
            )
            
            results.append(result)
            
            # Prepare handover context for next agent
            if i < len(agent_plan) - 1:  # Not the last agent
                context = self.handover_manager.prepare_handover_context(result, context)
                
                # Log handover
                handover = self.handover_manager.initiate_handover(
                    from_agent_id=step['agent_id'],
                    to_agent_id=agent_plan[i+1]['agent_id'],
                    context=context,
                    task=agent_plan[i+1]['task']
                )
                
                handover_trace.append({
                    "from_agent": step['agent_name'],
                    "to_agent": agent_plan[i+1]['agent_name'],
                    "handover_id": handover.id,
                    "context_passed": len(context.get('previous_results', []))
                })
                
                logger.info(f"[{session_id}] 🔄 A2A Handover: {step['agent_name']} → {agent_plan[i+1]['agent_name']}")
        
        # Synthesize final response
        final_response = self.handover_manager.synthesize_multi_agent_response(results, query)
        
        total_execution_time = sum(r.execution_time for r in results)
        backends_used = list(set(r.backend_used for r in results))
        
        logger.info(f"[{session_id}] ✅ Multi-agent A2A orchestration completed: {len(results)} agents, {total_execution_time:.2f}s")
        
        return {
            "success": True,
            "orchestration_type": "true_a2a_multi_agent",
            "session_id": session_id,
            "agent_chain": agent_plan,
            "handover_results": [
                {
                    "agent_name": r.agent_name,
                    "agent_id": r.agent_id,
                    "task": r.task,
                    "response": r.response,
                    "execution_time": r.execution_time,
                    "backend_used": r.backend_used,
                    "confidence": r.confidence
                } for r in results
            ],
            "final_response": final_response,
            "total_execution_time": total_execution_time,
            "backends_used": backends_used,
            "handover_trace": handover_trace,
            "analysis": {
                "stage_1_query_analysis": {"output": {"query": query, "intent": "multi_agent_a2a_orchestration", "domains": analysis['domains_found']}},
                "stage_2_agent_matching": {"output": {"matched_agents": agent_plan}},
                "stage_3_contextual_routing": {"output": {"routed_to": [step['agent_name'] for step in agent_plan], "handover_chain": handover_trace}},
                "stage_4_agent_execution": {"output": {"executions": [
                    {
                        "agent_name": r.agent_name,
                        "agent_id": r.agent_id,
                        "success": r.handover_ready,
                        "response": r.response,
                        "backend_used": r.backend_used,
                        "execution_time": r.execution_time
                    } for r in results
                ]}},
                "stage_5_synthesis": {"output": {"final_response": final_response, "synthesis_method": "multi_agent_combination"}}
            }
        }
    
    def _create_agent_execution_plan(self, query: str, analysis: Dict, agents: List[Dict]) -> List[Dict]:
        """Create execution plan for multi-agent orchestration"""
        query_lower = query.lower()
        plan = []
        
        # Determine which agents are needed based on domains found
        needed_agents = []
        for domain in analysis['domains_found']:
            for agent in agents:
                agent_name_lower = agent['name'].lower()
                if domain in agent_name_lower or any(keyword in agent_name_lower for keyword in self.agent_capabilities.get(domain, [])):
                    if agent not in needed_agents:
                        needed_agents.append(agent)
        
        # Create execution plan
        for i, agent in enumerate(needed_agents):
            if i == 0:
                # First agent gets the main task
                task = f"Analyze and provide initial response for: {query}"
            else:
                # Subsequent agents build on previous results
                task = f"Build upon previous analysis and provide specialized input for: {query}"
            
            plan.append({
                "step": i + 1,
                "agent_id": agent['id'],
                "agent_name": agent['name'],
                "task": task,
                "dedicated_backend": agent['dedicated_ollama_backend'],
                "capabilities": agent.get('capabilities', [])
            })
        
        return plan
    
    def _get_orchestration_agents(self) -> List[Dict]:
        """Get orchestration-enabled agents with dedicated backends"""
        try:
            response = requests.get(f"{self.a2a_service_url}/api/a2a/orchestration-agents", timeout=10)
            if response.status_code == 200:
                data = response.json()
                agents = data.get("agents", [])
                
                # Filter agents with running dedicated backends
                active_agents = []
                for agent in agents:
                    dedicated_backend = agent.get('dedicated_ollama_backend', {})
                    if dedicated_backend.get('status') == 'running':
                        active_agents.append(agent)
                
                logger.info(f"🔍 Found {len(active_agents)} orchestration-enabled agents with running backends")
                return active_agents
            else:
                logger.warning(f"Failed to get orchestration agents: HTTP {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error getting orchestration agents: {e}")
            return []
    
    def _select_best_agent(self, query: str, agents: List[Dict], session_id: str) -> Optional[Dict]:
        """Select best agent for single agent execution"""
        query_lower = query.lower()
        best_agent = None
        best_confidence = 0.0
        
        for agent in agents:
            confidence = self._calculate_match_confidence(query_lower, agent)
            
            if confidence > best_confidence:
                best_confidence = confidence
                best_agent = agent
        
        if best_confidence >= 0.6:
            logger.info(f"[{session_id}] ✅ Selected agent: {best_agent['name']} (confidence: {best_confidence:.2f})")
            return best_agent
        
        # Fallback to first available agent
        if agents:
            logger.info(f"[{session_id}] 🔄 Using fallback agent: {agents[0]['name']}")
            return agents[0]
        
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
        
        return confidence
