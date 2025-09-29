#!/usr/bin/env python3
"""
Enhanced 5-Stage Orchestrator
Streamlined workflow matching user's desired flow:
Stage 1: 🧠 Intelligent Query Analysis & Task Decomposition
Stage 2: 🎯 Smart Agent-to-Task Matching with Contextual Assignment
Stage 3: 📤 Contextual Task Routing with Proper Handovers
Stage 4: 🤖 Agent Execution with Rich Context
Stage 5: ✨ Final Synthesis with Complete Traceability
"""

import json
import logging
import requests
import uuid
from datetime import datetime
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Enhanced5StageOrchestrator:
    """5-Stage Intelligent Orchestrator with Streamlined Workflow"""
    
    def __init__(self, ollama_base_url: str = "http://localhost:11434", orchestrator_model: str = "qwen3:1.7b"):
        self.ollama_base_url = ollama_base_url
        self.orchestrator_model = orchestrator_model
        self.strands_sdk_url = "http://localhost:5006"
        self.a2a_service_url = "http://localhost:5008"
        
        logger.info("Enhanced 5-Stage Orchestrator initialized")
        logger.info(f"Ollama URL: {self.ollama_base_url}")
        logger.info(f"Model: {self.orchestrator_model}")
        logger.info(f"Strands SDK URL: {self.strands_sdk_url}")
        logger.info(f"A2A Service URL: {self.a2a_service_url}")
    
    def analyze_query_with_5stage_orchestrator(self, query: str) -> Dict:
        """Main entry point for 5-stage orchestration"""
        session_id = str(uuid.uuid4())
        logger.info(f"[{session_id}] 🚀 Starting 5-Stage Orchestrator Analysis")
        logger.info(f"[{session_id}] Query: {query[:100]}...")
        
        # Initialize complete data flow structure
        complete_data_flow = {
            "original_query": query,
            "session_id": session_id,
            "stages": {},
            "data_exchanges": [],
            "handoffs": [],
            "orchestrator_processing": [],
            "final_synthesis": {}
        }
        
        try:
            # Stage 1: Intelligent Query Analysis & Task Decomposition
            logger.info(f"[{session_id}] 🧠 Stage 1: Intelligent Query Analysis & Task Decomposition")
            stage_1_result = self._stage_1_intelligent_analysis(query, session_id)
            complete_data_flow["stages"]["stage_1_analysis"] = stage_1_result
            
            # Stage 2: Smart Agent-to-Task Matching with Contextual Assignment
            logger.info(f"[{session_id}] 🎯 Stage 2: Smart Agent-to-Task Matching with Contextual Assignment")
            stage_2_result = self._stage_2_agent_matching(query, stage_1_result, session_id)
            complete_data_flow["stages"]["stage_2_matching"] = stage_2_result
            
            # Stage 3: Contextual Task Routing with Proper Handovers
            logger.info(f"[{session_id}] 📤 Stage 3: Contextual Task Routing with Proper Handovers")
            stage_3_result = self._stage_3_contextual_routing(query, stage_1_result, stage_2_result, session_id)
            complete_data_flow["stages"]["stage_3_routing"] = stage_3_result
            
            # Stage 4: Agent Execution with Rich Context
            logger.info(f"[{session_id}] 🤖 Stage 4: Agent Execution with Rich Context")
            stage_4_result = self._stage_4_agent_execution(query, stage_3_result, session_id)
            complete_data_flow["stages"]["stage_4_execution"] = stage_4_result
            
            # Stage 5: Final Synthesis with Complete Traceability
            logger.info(f"[{session_id}] ✨ Stage 5: Final Synthesis with Complete Traceability")
            stage_5_result = self._stage_5_final_synthesis(query, stage_4_result, complete_data_flow, session_id)
            complete_data_flow["stages"]["stage_5_synthesis"] = stage_5_result
            
            # Update complete data flow with final results
            complete_data_flow["final_synthesis"] = stage_5_result
            
            logger.info(f"[{session_id}] ✅ 5-Stage orchestration completed successfully")
            
            return {
                "success": True,
                "session_id": session_id,
                "analysis": {
                    "stage_1_analysis": stage_1_result,
                    "stage_2_matching": stage_2_result,
                    "stage_3_routing": stage_3_result,
                    "stage_4_execution": stage_4_result,
                    "stage_5_synthesis": stage_5_result
                },
                "complete_data_flow": complete_data_flow,
                "agent_selection": {
                    "total_available": len(stage_2_result.get('output', {}).get('available_agents', [])),
                    "selected_agents": [agent.get('agent_name', 'Unknown') for agent in stage_2_result.get('output', {}).get('matched_agents', [])],
                    "selection_reasoning": "5-Stage LLM-driven intelligent matching and contextual routing"
                },
                "execution_details": {
                    "strategy": stage_3_result.get('output', {}).get('routing_strategy', 'sequential'),
                    "total_agents": len(stage_2_result.get('output', {}).get('matched_agents', [])),
                    "successful_agents": len(stage_4_result.get('output', {}).get('execution_results', [])),
                    "total_execution_time": stage_4_result.get('output', {}).get('total_execution_time', 0)
                },
                "response": stage_5_result.get('output', {}).get('final_response', '5-Stage orchestration completed successfully')
            }
            
        except Exception as e:
            logger.error(f"[{session_id}] 5-Stage orchestration error: {e}")
            return {
                "success": False,
                "session_id": session_id,
                "error": str(e),
                "complete_data_flow": complete_data_flow
            }
    
    def _stage_1_intelligent_analysis(self, query: str, session_id: str) -> Dict:
        """Stage 1: Intelligent Query Analysis & Task Decomposition"""
        try:
            # First discover available agents to inform task decomposition
            available_agents = self._discover_available_agents(session_id)
            agent_names = [agent.get('name', agent.get('agent_name', 'Unknown')) for agent in available_agents]
            
            prompt = f"""Perform comprehensive query analysis and task decomposition:

QUERY: "{query}"

AVAILABLE AGENTS: {agent_names}

Analyze this query and decompose it into specific, actionable tasks that can be handled by the available agents above. Consider:
1. What is the main goal and user intent?
2. What are the specific sub-tasks needed?
3. Which of the available agents can handle each task?
4. What is the optimal execution sequence?
5. What context needs to be passed between tasks?

IMPORTANT: Only use agent types that match the available agents: {agent_names}
Do NOT create fake agent types like "DataRetrievalAgent" or "DataAnalysisAgent".

Provide detailed analysis in JSON format:
{{
    "success": true,
    "domain": "domain_name",
    "complexity": "simple/moderate/complex",
    "user_intent": "detailed intent analysis",
    "task_decomposition": [
        {{
            "task_id": "task_1",
            "task_name": "specific task name",
            "description": "detailed task description",
            "required_capability": "specific capability needed",
            "agent_type": "one of: {agent_names}",
            "input_context": "what context this task needs",
            "output_context": "what context this task provides",
            "priority": 1,
            "execution_order": 1
        }}
    ],
    "execution_strategy": "sequential/parallel/hybrid",
    "success_criteria": ["criterion1", "criterion2"],
    "confidence": 0.95
}}"""

            response = self._call_llm(prompt, session_id, "Stage 1 Analysis")
            if response.get('success'):
                logger.info(f"[{session_id}] ✅ Intelligent task decomposition completed: {len(response.get('task_decomposition', []))} tasks identified")
                return {
                    "input": query,
                    "output": response,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                raise Exception("Stage 1 analysis failed")
                
        except Exception as e:
            logger.error(f"[{session_id}] Stage 1 error: {e}")
            return {
                "input": query,
                "output": {
                    "success": False,
                    "error": str(e),
                    "domain": "general",
                    "complexity": "moderate",
                    "task_decomposition": [
                        {
                            "task_id": "task_1",
                            "task_name": "Primary Task",
                            "description": f"Complete the user request: {query}",
                            "required_capability": "general_assistance",
                            "agent_type": "general_agent",
                            "input_context": "Original user query",
                            "output_context": "Completed response",
                            "priority": 1,
                            "execution_order": 1
                        }
                    ],
                    "execution_strategy": "sequential",
                    "confidence": 0.5
                },
                "timestamp": datetime.now().isoformat()
            }
    
    def _stage_2_agent_matching(self, query: str, stage_1_result: Dict, session_id: str) -> Dict:
        """Stage 2: Smart Agent-to-Task Matching with Contextual Assignment"""
        try:
            # Discover available agents
            available_agents = self._discover_available_agents(session_id)
            task_decomposition = stage_1_result.get('output', {}).get('task_decomposition', [])
            
            matched_agents = []
            
            # Match agents to specific tasks
            for task in task_decomposition:
                best_agent = self._find_best_agent_for_task(task, available_agents, session_id)
                if best_agent:
                    matched_agents.append(best_agent)
                    logger.info(f"[{session_id}] 🎯 Matched agent {best_agent.get('agent_name', best_agent.get('name', 'Unknown Agent'))} to task '{task['task_name']}' (confidence: {best_agent['confidence']:.2f})")
            
            # Fallback if no matches found - use any available orchestration-enabled agent
            if not matched_agents and available_agents:
                logger.info(f"[{session_id}] 🚨 No specific agent matches found, using fallback to available orchestration-enabled agents")
                for agent in available_agents:
                    if agent.get('orchestration_enabled', False):
                        matched_agents.append({
                            "agent_id": agent.get("id", agent.get("agent_id", "unknown")),
                            "agent_name": agent.get("name", agent.get("agent_name", "Unknown Agent")),
                            "task": "General Task",
                            "task_description": f"Complete the user request: {query}",
                            "input_context": query,
                            "output_context": "Completed response",
                            "confidence": 0.9,  # High confidence for fallback
                            "execution_order": len(matched_agents) + 1,
                            "fallback_reason": "No specific agent matches found"
                        })
                        logger.info(f"[{session_id}] ✅ Fallback: Using {agent.get('name', 'Unknown Agent')} for general task completion")
                        break  # Use only the first available orchestration-enabled agent
            
            return {
                "input": {
                    "query": query,
                    "available_agents": len(available_agents),
                    "task_decomposition": len(task_decomposition)
                },
                "output": {
                    "success": True,
                    "available_agents": available_agents,
                    "matched_agents": matched_agents,
                    "matching_strategy": "intelligent_task_decomposition" if task_decomposition else "capability_based"
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[{session_id}] Stage 2 error: {e}")
            return {
                "input": {},
                "output": {
                    "success": False,
                    "error": str(e),
                    "available_agents": [],
                    "matched_agents": []
                },
                "timestamp": datetime.now().isoformat()
            }
    
    def _stage_3_contextual_routing(self, query: str, stage_1_result: Dict, stage_2_result: Dict, session_id: str) -> Dict:
        """Stage 3: Contextual Task Routing with Proper Handovers"""
        try:
            matched_agents = stage_2_result.get('output', {}).get('matched_agents', [])
            task_decomposition = stage_1_result.get('output', {}).get('task_decomposition', [])
            
            routing_plan = []
            handover_plan = []
            
            # Create contextual routing plan for each agent
            for i, agent in enumerate(matched_agents):
                # Prepare contextual task for this agent
                contextual_task = self._prepare_contextual_task_for_agent(
                    agent, query, task_decomposition, session_id, i
                )
                
                # Prepare handover context for next agent
                handover_context = self._prepare_handover_context(
                    agent, matched_agents, i, session_id
                )
                
                routing_plan.append({
                    "agent_id": agent.get("agent_id", agent.get("id", "unknown")),
                    "agent_name": agent.get("agent_name", agent.get("name", "Unknown Agent")),
                    "contextual_task": contextual_task,
                    "input_context": agent.get("input_context", "Original user query"),
                    "output_context": agent.get("output_context", "Completed response"),
                    "execution_order": i + 1
                })
                
                if i < len(matched_agents) - 1:  # Not the last agent
                    handover_plan.append({
                        "from_agent": agent.get("agent_name", agent.get("name", "Unknown Agent")),
                        "to_agent": matched_agents[i + 1].get("agent_name", matched_agents[i + 1].get("name", "Unknown Agent")),
                        "handover_context": handover_context,
                        "handover_type": "sequential_contextual"
                    })
            
            logger.info(f"[{session_id}] 📤 Prepared contextual routing for {len(routing_plan)} agents with {len(handover_plan)} handovers")
            
            return {
                "input": {
                    "query": query,
                    "matched_agents": len(matched_agents),
                    "task_decomposition": len(task_decomposition)
                },
                "output": {
                    "success": True,
                    "routing_strategy": "sequential_contextual",
                    "routing_plan": routing_plan,
                    "handover_plan": handover_plan,
                    "total_handovers": len(handover_plan)
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[{session_id}] Stage 3 error: {e}")
            return {
                "input": {},
                "output": {
                    "success": False,
                    "error": str(e),
                    "routing_plan": [],
                    "handover_plan": []
                },
                "timestamp": datetime.now().isoformat()
            }
    
    def _stage_4_agent_execution(self, query: str, stage_3_result: Dict, session_id: str) -> Dict:
        """Stage 4: Agent Execution with Rich Context"""
        try:
            routing_plan = stage_3_result.get('output', {}).get('routing_plan', [])
            handover_plan = stage_3_result.get('output', {}).get('handover_plan', [])
            
            if not routing_plan:
                logger.warning(f"[{session_id}] No agents to execute")
                return {
                    "input": {"routing_plan": []},
                    "output": {
                        "success": True,
                        "execution_results": [],
                        "message_flow": [],
                        "total_execution_time": 0
                    },
                    "timestamp": datetime.now().isoformat()
                }
            
            logger.info(f"[{session_id}] 🤖 Executing {len(routing_plan)} agents with contextual routing")
            
            execution_results = []
            message_flow = []
            total_execution_time = 0
            previous_output = ""
            
            # Execute agents sequentially with contextual routing
            for i, routing_info in enumerate(routing_plan):
                try:
                    agent_id = routing_info["agent_id"]
                    agent_name = routing_info["agent_name"]
                    contextual_task = routing_info["contextual_task"]
                    
                    logger.info(f"[{session_id}] Executing agent {agent_name} (Order: {i + 1})")
                    
                    # Execute agent with contextual task via A2A Service for true handover
                    orchestration_context = {
                        "stage": "execution",
                        "agent_order": i + 1,
                        "total_agents": len(routing_plan),
                        "previous_output": previous_output,
                        "handover_context": handover_plan[i] if i < len(handover_plan) else {}
                    }
                    agent_response = self._execute_agent_via_a2a_service(
                        agent_id, contextual_task, session_id, orchestration_context
                    )
                    
                    if agent_response.get("success"):
                        execution_results.append({
                            "agent_id": agent_id,
                            "agent_name": agent_name,
                            "task": routing_info.get("contextual_task", ""),
                            "output": agent_response.get("response", ""),
                            "execution_time": agent_response.get("execution_time", 0),
                            "execution_order": i + 1
                        })
                        
                        total_execution_time += agent_response.get("execution_time", 0)
                        previous_output = agent_response.get("response", "")
                        
                        # Record message flow
                        message_flow.append({
                            "from": "orchestrator" if i == 0 else routing_plan[i-1]["agent_name"],
                            "to": agent_name,
                            "message": contextual_task[:200] + "..." if len(contextual_task) > 200 else contextual_task,
                            "response": previous_output[:200] + "..." if len(previous_output) > 200 else previous_output,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        logger.info(f"[{session_id}] ✅ Agent {agent_name} executed successfully")
                    else:
                        logger.error(f"[{session_id}] ❌ Agent {agent_name} failed: {agent_response.get('error')}")
                        
                except Exception as e:
                    logger.error(f"[{session_id}] Error executing agent {routing_info['agent_name']}: {e}")
                    continue
            
            logger.info(f"[{session_id}] 🤖 Agent execution completed: {len(execution_results)} successful, {total_execution_time:.2f}s total")
            
            return {
                "input": {
                    "routing_plan": len(routing_plan),
                    "handover_plan": len(handover_plan)
                },
                "output": {
                    "success": len(execution_results) > 0,
                    "execution_results": execution_results,
                    "message_flow": message_flow,
                    "total_execution_time": total_execution_time,
                    "successful_agents": len(execution_results)
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[{session_id}] Stage 4 error: {e}")
            return {
                "input": {},
                "output": {
                    "success": False,
                    "error": str(e),
                    "execution_results": [],
                    "message_flow": [],
                    "total_execution_time": 0
                },
                "timestamp": datetime.now().isoformat()
            }
    
    def _stage_5_final_synthesis(self, query: str, stage_4_result: Dict, complete_data_flow: Dict, session_id: str) -> Dict:
        """Stage 5: Final Synthesis with Complete Traceability"""
        try:
            execution_results = stage_4_result.get('output', {}).get('execution_results', [])
            message_flow = stage_4_result.get('output', {}).get('message_flow', [])
            
            # Combine all agent outputs into final response
            final_response = self._combine_agent_results(execution_results, query)
            
            # Create comprehensive traceability report
            traceability_report = {
                "query_analysis": complete_data_flow["stages"].get("stage_1_analysis", {}),
                "agent_matching": complete_data_flow["stages"].get("stage_2_matching", {}),
                "contextual_routing": complete_data_flow["stages"].get("stage_3_routing", {}),
                "execution_details": stage_4_result,
                "performance_metrics": {
                    "total_agents_executed": len(execution_results),
                    "total_execution_time": stage_4_result.get('output', {}).get('total_execution_time', 0),
                    "success_rate": len(execution_results) / max(1, len(complete_data_flow["stages"].get("stage_2_matching", {}).get('output', {}).get('matched_agents', []))),
                    "message_exchanges": len(message_flow)
                }
            }
            
            logger.info(f"[{session_id}] ✨ Final synthesis completed: {len(execution_results)} agents, {len(message_flow)} messages")
            
            return {
                "input": {
                    "execution_results": len(execution_results),
                    "message_flow": len(message_flow)
                },
                "output": {
                    "success": True,
                    "final_response": final_response,
                    "traceability_report": traceability_report,
                    "synthesis_metadata": {
                        "total_agents": len(execution_results),
                        "execution_time": stage_4_result.get('output', {}).get('total_execution_time', 0),
                        "message_flow": message_flow
                    }
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[{session_id}] Stage 5 error: {e}")
            return {
                "input": {},
                "output": {
                    "success": False,
                    "error": str(e),
                    "final_response": "Synthesis failed",
                    "traceability_report": {}
                },
                "timestamp": datetime.now().isoformat()
            }
    
    # Helper methods
    def _discover_available_agents(self, session_id: str) -> List[Dict]:
        """Discover orchestration-enabled agents from A2A Service"""
        try:
            # Get orchestration-enabled agents from A2A Service
            response = requests.get("http://localhost:5008/api/a2a/orchestration-agents", timeout=10)
            if response.status_code == 200:
                data = response.json()
                agents = data.get("agents", [])
                logger.info(f"[{session_id}] 🔍 Discovered {len(agents)} orchestration-enabled agents")
                
                # Process agents to ensure consistent field names
                processed_agents = []
                for agent in agents:
                    processed_agents.append({
                        'id': agent.get('id', 'unknown'),
                        'agent_id': agent.get('id', 'unknown'),
                        'name': agent.get('name', 'Unknown Agent'),
                        'agent_name': agent.get('name', 'Unknown Agent'),
                        'status': 'orchestration_ready',
                        'capabilities': agent.get('capabilities', []),
                        'dedicated_ollama_backend': agent.get('dedicated_ollama_backend', {}),
                        'a2a_status': agent.get('a2a_status', 'registered'),
                        'orchestration_enabled': agent.get('orchestration_enabled', True)
                    })
                
                return processed_agents
            else:
                logger.warning(f"[{session_id}] Failed to discover orchestration agents: HTTP {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"[{session_id}] Orchestration agent discovery error: {e}")
            return []
    
    def _find_best_agent_for_task(self, task: Dict, available_agents: List[Dict], session_id: str) -> Dict:
        """Find the best agent for a specific task"""
        best_agent = None
        best_confidence = 0.0
        
        for agent in available_agents:
            confidence = self._calculate_agent_task_match(
                task.get('required_capability', 'general_assistance'),
                agent.get('capabilities', []),
                agent.get('name', 'Unknown')
            )
            
            if confidence > best_confidence:
                best_confidence = confidence
                best_agent = {
                    "agent_id": agent.get("id", agent.get("agent_id", "unknown")),
                    "agent_name": agent.get("name", agent.get("agent_name", "Unknown Agent")),
                    "task": task.get("task_name", "General Task"),
                    "task_description": task.get("description", ""),
                    "input_context": task.get("input_context", "Original user query"),
                    "output_context": task.get("output_context", "Completed response"),
                    "confidence": confidence,
                    "execution_order": task.get("execution_order", 1)
                }
        
        return best_agent
    
    def _calculate_agent_task_match(self, required_capability: str, agent_capabilities: list, agent_name: str) -> float:
        """Calculate confidence score for agent-task matching"""
        try:
            base_confidence = 0.5
            
            # Agent name-based matching (handle trailing spaces)
            agent_name_lower = agent_name.strip().lower()
            required_capability_lower = required_capability.lower()
            
            # Weather Agent specific matching
            if 'weather' in agent_name_lower and ('weather' in required_capability_lower or 'climate' in required_capability_lower or 'temperature' in required_capability_lower):
                base_confidence = 0.95
            elif 'creative' in agent_name_lower and 'creative' in required_capability_lower:
                base_confidence = 0.95
            elif 'learning' in agent_name_lower and ('educational' in required_capability_lower or 'teaching' in required_capability_lower):
                base_confidence = 0.95
            elif 'technical' in agent_name_lower and 'technical' in required_capability_lower:
                base_confidence = 0.95
            elif 'assistant' in agent_name_lower:
                base_confidence = 0.8
            # General agent matching for any agent with matching name
            elif any(word in required_capability_lower for word in agent_name_lower.split()):
                base_confidence = 0.85
            
            # Capability-based matching
            for capability in agent_capabilities:
                if required_capability.lower() in capability.lower():
                    base_confidence = min(0.95, base_confidence + 0.2)
            
            return base_confidence
            
        except Exception:
            return 0.5
    
    def _prepare_contextual_task_for_agent(self, agent: Dict, query: str, task_decomposition: List[Dict], session_id: str, agent_index: int) -> str:
        """Prepare specific contextual task for an agent"""
        try:
            task_name = agent.get('task', 'General Task')
            task_description = agent.get('task_description', '')
            input_context = agent.get('input_context', 'Original user query')
            
            if task_name != 'General Task' and task_description:
                contextual_task = f"""Task: {task_name}

Description: {task_description}

Context: {input_context}

Original User Query: "{query}"

Please complete this specific task as part of a multi-agent workflow. Focus on your assigned role and provide output that will help the next agent in the sequence."""
                logger.info(f"[{session_id}] 🎯 Prepared specific task for agent {agent_index}: {task_name}")
            else:
                contextual_task = query
                logger.info(f"[{session_id}] 📝 Using original query for agent {agent_index}")
            
            return contextual_task
            
        except Exception as e:
            logger.error(f"[{session_id}] Error preparing contextual task: {e}")
            return query
    
    def _prepare_handover_context(self, agent: Dict, matched_agents: List[Dict], agent_index: int, session_id: str) -> str:
        """Prepare handover context for next agent"""
        try:
            if agent_index < len(matched_agents) - 1:
                next_agent = matched_agents[agent_index + 1]
                handover_context = f"""Handover from {agent['agent_name']} to {next_agent['agent_name']}:
- Previous task: {agent.get('task', 'General Task')}
- Next task: {next_agent.get('task', 'General Task')}
- Context flow: {agent.get('output_context', 'Completed response')} → {next_agent.get('input_context', 'Previous agent output')}"""
                return handover_context
            return ""
            
        except Exception as e:
            logger.error(f"[{session_id}] Error preparing handover context: {e}")
            return ""
    
    def _execute_agent_via_a2a_service(self, agent_id: str, task: str, session_id: str, orchestration_context: Dict = None) -> Dict:
        """Execute an agent via A2A Service for true handover with dedicated Ollama backend"""
        try:
            logger.info(f"[{session_id}] Executing agent {agent_id} via A2A Service for true handover")
            
            response = requests.post(
                f"{self.a2a_service_url}/api/a2a/agents/{agent_id}/execute-enhanced",
                json={
                    "input": task,
                    "metadata": {
                        "orchestration_context": orchestration_context or {},
                        "session_id": session_id,
                        "dedicated_backend": True,
                        "from_agent_id": "system_orchestrator",
                        "message_type": "task_execution"
                    }
                },
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "response": result.get("response", ""),
                    "execution_time": result.get("execution_time", 0),
                    "a2a_metadata": result.get("a2a_metadata", {}),
                    "backend_used": "dedicated_a2a_backend"
                }
            else:
                return {
                    "success": False,
                    "error": f"A2A Service HTTP {response.status_code}: {response.text}",
                    "execution_time": 0
                }
                
        except Exception as e:
            logger.error(f"[{session_id}] A2A Service execution error: {e}")
            return {
                "success": False,
                "error": str(e),
                "execution_time": 0
            }
    
    def _combine_agent_results(self, execution_results: List[Dict], query: str) -> str:
        """Combine agent results into final response"""
        if not execution_results:
            return "No agents executed successfully."
        
        combined_response = f"Multi-agent orchestration results for: {query}\n\n"
        
        for i, result in enumerate(execution_results):
            combined_response += f"**{result['agent_name']}:**\n"
            combined_response += f"{result['output']}\n\n"
        
        return combined_response.strip()
    
    def _call_llm(self, prompt: str, session_id: str, stage_name: str = "LLM Call") -> Dict:
        """Call Ollama LLM with error handling"""
        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.orchestrator_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,
                        "top_p": 0.9
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                llm_response = result.get("response", "").strip()
                
                # Try to parse as JSON
                try:
                    if llm_response.startswith('{') and llm_response.endswith('}'):
                        return json.loads(llm_response)
                    else:
                        # Try to extract JSON from response
                        start_idx = llm_response.find('{')
                        end_idx = llm_response.rfind('}') + 1
                        if start_idx != -1 and end_idx > start_idx:
                            json_str = llm_response[start_idx:end_idx]
                            return json.loads(json_str)
                except json.JSONDecodeError:
                    pass
                
                # Return as plain text if JSON parsing fails
                return {
                    "success": True,
                    "response": llm_response,
                    "raw_response": llm_response
                }
            else:
                logger.error(f"[{session_id}] LLM call failed: HTTP {response.status_code}")
                return {"success": False, "error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            logger.error(f"[{session_id}] LLM call error: {e}")
            return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Test the orchestrator
    orchestrator = Enhanced5StageOrchestrator()
    result = orchestrator.analyze_query_with_5stage_orchestrator("write me a short poem about Singapore and rain")
    print(json.dumps(result, indent=2))
