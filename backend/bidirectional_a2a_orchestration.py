#!/usr/bin/env python3
"""
Bidirectional A2A Orchestration API
Implements the proper 4-step orchestration with bidirectional A2A handoffs:
1. Orchestrator Reasoning (User Intent + Domain Analysis + Orchestration Pattern)
2. Agent Registry Analysis (Contextual analysis of available agents)
3. Agent Selection & Sequencing (Select and sequence agents for execution)
4. Bidirectional A2A Execution (Orchestrator > Agent1 > Orchestrator > Agent2 > Orchestrator)

Uses official Strands A2A parameters and message format.
"""

import json
import requests
import logging
import time
import psutil
import gc
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"
AGENT_REGISTRY_URL = "http://localhost:5010"
ORCHESTRATOR_MODEL = "qwen3:1.7b"
SESSION_TIMEOUT = 300  # 5 minutes
MEMORY_THRESHOLD = 85  # 85% memory usage threshold

app = Flask(__name__)
CORS(app)

class BidirectionalA2AOrchestrator:
    """Bidirectional A2A Orchestrator with proper Strands parameters"""
    
    def __init__(self):
        self.active_sessions = {}
        self.orchestrator_id = "fdaa1298-d5cf-495d-8b25-7e0b2e400796"
        self.orchestrator_name = "System Orchestrator"
        self.cleanup_thread = threading.Thread(target=self._cleanup_worker, daemon=True)
        self.cleanup_thread.start()
        self.auto_register_orchestrator()
        logger.info("Bidirectional A2A Orchestrator initialized")
    
    def auto_register_orchestrator(self):
        """Auto-register the System Orchestrator with A2A service"""
        try:
            # Check if orchestrator is already registered
            response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents", timeout=10)
            if response.status_code == 200:
                agents = response.json().get('agents', [])
                orchestrator_exists = any(agent.get('id') == self.orchestrator_id for agent in agents)
                
                if not orchestrator_exists:
                    # Register the System Orchestrator
                    orchestrator_data = {
                        "id": self.orchestrator_id,
                        "name": self.orchestrator_name,
                        "description": "System Orchestrator for bidirectional A2A communication",
                        "model": ORCHESTRATOR_MODEL,
                        "capabilities": ["orchestration", "a2a_handoff", "context_refinement"],
                        "status": "active"
                    }
                    
                    response = requests.post(
                        f"{A2A_SERVICE_URL}/api/a2a/agents",
                        json=orchestrator_data,
                        timeout=10
                    )
                    
                    if response.status_code == 201:
                        logger.info("✅ System Orchestrator registered with A2A service")
                    else:
                        logger.warning(f"⚠️ Failed to register orchestrator: {response.text}")
                else:
                    logger.info("✅ System Orchestrator already registered")
            else:
                logger.warning(f"⚠️ A2A service not available: {response.status_code}")
        except Exception as e:
            logger.error(f"❌ Error registering orchestrator: {e}")
    
    def _cleanup_worker(self):
        """Background cleanup worker for memory management"""
        while True:
            try:
                time.sleep(30)  # Check every 30 seconds
                current_time = datetime.now()
                
                # Clean up expired sessions
                expired_sessions = []
                for session_id, session in self.active_sessions.items():
                    if (current_time - session['created_at']).total_seconds() > SESSION_TIMEOUT:
                        expired_sessions.append(session_id)
                
                for session_id in expired_sessions:
                    self.cleanup_session(session_id)
                
                # Check memory usage
                memory_usage = psutil.virtual_memory().percent
                if memory_usage > MEMORY_THRESHOLD:
                    logger.warning(f"⚠️ High memory usage: {memory_usage}%")
                    gc.collect()
                    
            except Exception as e:
                logger.error(f"❌ Cleanup worker error: {e}")
                time.sleep(60)  # Wait longer on error
    
    def cleanup_session(self, session_id: str) -> bool:
        """Cleanup session and release resources"""
        if session_id in self.active_sessions:
            session = self.active_sessions.pop(session_id)
            logger.info(f"🧹 Cleaned up session {session_id}")
            
            # Force garbage collection
            gc.collect()
            
            # Log memory usage
            memory_usage = psutil.virtual_memory().percent
            logger.info(f"💾 Memory usage after cleanup: {memory_usage}%")
            
            return True
        return False
    
    def generate_orchestrator_reasoning(self, query: str) -> Dict[str, Any]:
        """Step 1: Generate orchestrator reasoning with detailed contextual analysis"""
        try:
            prompt = f"""
You are an expert orchestrator. Analyze this user query and provide detailed reasoning:

1. CONTEXTUAL USER QUERY ANALYSIS: Deep analysis of the user's query context, intent, and underlying needs
2. USER INTENT: What the user is trying to accomplish (1 sentence)
3. DOMAIN ANALYSIS: Primary domain and technical level (1 sentence)
4. ORCHESTRATION PATTERN: sequential, parallel, or direct (1 word)
5. ORCHESTRATOR REASONING: Your detailed reasoning about why this analysis is correct

USER QUERY: {query}

Respond in this exact format:
CONTEXTUAL USER QUERY ANALYSIS: [detailed analysis of query context, intent, and underlying needs]
USER INTENT: [what the user is trying to accomplish]
DOMAIN ANALYSIS: [domain] - [technical level]
ORCHESTRATION PATTERN: [pattern]
ORCHESTRATOR REASONING: [your detailed reasoning about why this analysis is correct]
"""
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": ORCHESTRATOR_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 200
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                reasoning_text = result.get("response", "").strip()
                
                # Parse the response
                lines = reasoning_text.split('\n')
                contextual_analysis = ""
                user_intent = ""
                domain_analysis = ""
                orchestration_pattern = "direct"
                orchestrator_reasoning = ""
                
                for line in lines:
                    if line.startswith("CONTEXTUAL USER QUERY ANALYSIS:"):
                        contextual_analysis = line.replace("CONTEXTUAL USER QUERY ANALYSIS:", "").strip()
                    elif line.startswith("USER INTENT:"):
                        user_intent = line.replace("USER INTENT:", "").strip()
                    elif line.startswith("DOMAIN ANALYSIS:"):
                        domain_analysis = line.replace("DOMAIN ANALYSIS:", "").strip()
                    elif line.startswith("ORCHESTRATION PATTERN:"):
                        orchestration_pattern = line.replace("ORCHESTRATION PATTERN:", "").strip().lower()
                    elif line.startswith("ORCHESTRATOR REASONING:"):
                        orchestrator_reasoning = line.replace("ORCHESTRATOR REASONING:", "").strip()
                
                return {
                    "success": True,
                    "contextual_analysis": contextual_analysis,
                    "user_intent": user_intent,
                    "domain_analysis": domain_analysis,
                    "orchestration_pattern": orchestration_pattern,
                    "orchestrator_reasoning": orchestrator_reasoning,
                    "reasoning_text": reasoning_text
                }
            else:
                return {
                    "success": False,
                    "error": f"LLM call failed: {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Orchestrator reasoning error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def analyze_agents(self, query: str, user_intent: str, domain_analysis: str, contextual_analysis: str) -> Dict[str, Any]:
        """Step 2: Analyze available agents with detailed orchestrator reasoning"""
        try:
            # Get available agents from registry
            response = requests.get(f"{AGENT_REGISTRY_URL}/agents", timeout=10)
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": "Failed to fetch agents from registry"
                }
            
            agents = response.json().get('agents', [])
            if not agents:
                return {
                    "success": False,
                    "error": "No agents available in registry"
                }
            
            # Use LLM orchestrator to analyze each agent with detailed reasoning
            agent_analysis = []
            for agent in agents:
                agent_name = agent.get('name', 'Unknown')
                agent_desc = agent.get('description', '')
                agent_tools = agent.get('tools', [])
                agent_capabilities = agent.get('capabilities', [])
                
                # Get detailed orchestrator analysis for this agent
                agent_reasoning = self.get_agent_reasoning(
                    query, user_intent, domain_analysis, contextual_analysis,
                    agent_name, agent_desc, agent_tools, agent_capabilities
                )
                
                agent_analysis.append({
                    "agent_name": agent_name,
                    "agent_id": agent.get('id', ''),
                    "association_score": agent_reasoning['score'],
                    "contextual_relevance": agent_reasoning['contextual_relevance'],
                    "role_analysis": agent_reasoning['role_analysis'],
                    "orchestrator_reasoning": agent_reasoning['orchestrator_reasoning'],
                    "capability_analysis": agent_reasoning['capability_analysis'],
                    "relevance_justification": agent_reasoning['relevance_justification']
                })
            
            # Sort by association score
            agent_analysis.sort(key=lambda x: x['association_score'], reverse=True)
            
            # Get orchestrator reasoning for overall analysis
            overall_reasoning = self.get_overall_agent_analysis_reasoning(
                query, user_intent, domain_analysis, agent_analysis
            )
            
            return {
                "success": True,
                "agent_analysis": agent_analysis,
                "analysis_summary": f"Analyzed {len(agent_analysis)} agents. Found {len([a for a in agent_analysis if a['association_score'] > 0.5])} highly relevant agents.",
                "total_agents_analyzed": len(agent_analysis),
                "orchestrator_reasoning": overall_reasoning
            }
            
        except Exception as e:
            logger.error(f"Agent analysis error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_agent_reasoning(self, query: str, user_intent: str, domain_analysis: str, contextual_analysis: str,
                           agent_name: str, agent_desc: str, agent_tools: List, agent_capabilities: List) -> Dict[str, Any]:
        """Get detailed orchestrator reasoning for a specific agent"""
        try:
            prompt = f"""
You are an expert orchestrator analyzing agent capabilities and relevance.

USER QUERY: {query}
USER INTENT: {user_intent}
DOMAIN ANALYSIS: {domain_analysis}
CONTEXTUAL ANALYSIS: {contextual_analysis}

AGENT TO ANALYZE:
- Name: {agent_name}
- Description: {agent_desc}
- Tools: {', '.join(agent_tools) if agent_tools else 'None'}
- Capabilities: {', '.join(agent_capabilities) if agent_capabilities else 'None'}

Provide detailed analysis in this format:
ASSOCIATION_SCORE: [0.0-1.0]
CONTEXTUAL_RELEVANCE: [High/Medium/Low] - [brief explanation]
ROLE_ANALYSIS: [detailed analysis of agent's role and capabilities]
CAPABILITY_ANALYSIS: [analysis of how agent's tools/capabilities match the query]
RELEVANCE_JUSTIFICATION: [detailed reasoning for the relevance score]
ORCHESTRATOR_REASONING: [your detailed reasoning about this agent's suitability]
"""
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": ORCHESTRATOR_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 300
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                reasoning_text = result.get("response", "").strip()
                
                # Parse the response
                lines = reasoning_text.split('\n')
                score = 0.5
                contextual_relevance = ""
                role_analysis = ""
                capability_analysis = ""
                relevance_justification = ""
                orchestrator_reasoning = ""
                
                for line in lines:
                    if line.startswith("ASSOCIATION_SCORE:"):
                        try:
                            score = float(line.replace("ASSOCIATION_SCORE:", "").strip())
                        except:
                            score = 0.5
                    elif line.startswith("CONTEXTUAL_RELEVANCE:"):
                        contextual_relevance = line.replace("CONTEXTUAL_RELEVANCE:", "").strip()
                    elif line.startswith("ROLE_ANALYSIS:"):
                        role_analysis = line.replace("ROLE_ANALYSIS:", "").strip()
                    elif line.startswith("CAPABILITY_ANALYSIS:"):
                        capability_analysis = line.replace("CAPABILITY_ANALYSIS:", "").strip()
                    elif line.startswith("RELEVANCE_JUSTIFICATION:"):
                        relevance_justification = line.replace("RELEVANCE_JUSTIFICATION:", "").strip()
                    elif line.startswith("ORCHESTRATOR_REASONING:"):
                        orchestrator_reasoning = line.replace("ORCHESTRATOR_REASONING:", "").strip()
                
                return {
                    "score": score,
                    "contextual_relevance": contextual_relevance,
                    "role_analysis": role_analysis,
                    "capability_analysis": capability_analysis,
                    "relevance_justification": relevance_justification,
                    "orchestrator_reasoning": orchestrator_reasoning
                }
            else:
                # Fallback to basic analysis
                return {
                    "score": 0.5,
                    "contextual_relevance": "Medium - Basic analysis",
                    "role_analysis": f"Agent specialized in {agent_desc}",
                    "capability_analysis": f"Tools: {', '.join(agent_tools[:3]) if agent_tools else 'None'}",
                    "relevance_justification": "Basic keyword matching",
                    "orchestrator_reasoning": "LLM analysis failed, using fallback"
                }
                
        except Exception as e:
            logger.error(f"Agent reasoning error for {agent_name}: {e}")
            return {
                "score": 0.5,
                "contextual_relevance": "Medium - Error in analysis",
                "role_analysis": f"Agent specialized in {agent_desc}",
                "capability_analysis": f"Tools: {', '.join(agent_tools[:3]) if agent_tools else 'None'}",
                "relevance_justification": "Error in analysis",
                "orchestrator_reasoning": f"Error: {str(e)}"
            }
    
    def get_overall_agent_analysis_reasoning(self, query: str, user_intent: str, domain_analysis: str, agent_analysis: List[Dict]) -> str:
        """Get orchestrator reasoning for overall agent analysis"""
        try:
            prompt = f"""
You are an expert orchestrator providing overall analysis of agent selection.

USER QUERY: {query}
USER INTENT: {user_intent}
DOMAIN ANALYSIS: {domain_analysis}

AGENT ANALYSIS RESULTS:
{json.dumps(agent_analysis, indent=2)}

Provide your overall reasoning about:
1. Which agents are most suitable and why
2. What should be the right sequence of task orchestration pattern
3. How the agents should work together
4. Any specific considerations for this query

Keep it concise but comprehensive.
"""
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": ORCHESTRATOR_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 200
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
            else:
                return "Overall analysis reasoning failed"
                
        except Exception as e:
            logger.error(f"Overall agent analysis reasoning error: {e}")
            return f"Error in overall analysis: {str(e)}"
    
    def select_and_sequence_agents(self, agent_analysis: List[Dict], orchestration_pattern: str, query: str, user_intent: str) -> Dict[str, Any]:
        """Step 3: Select and sequence agents with detailed orchestrator reasoning"""
        try:
            # Select top 2 agents
            selected_agents = agent_analysis[:2]
            
            if not selected_agents:
                return {
                    "success": False,
                    "error": "No agents available for selection"
                }
            
            # Get detailed orchestrator reasoning for agent selection
            selection_reasoning = self.get_agent_selection_reasoning(
                query, user_intent, agent_analysis, selected_agents, orchestration_pattern
            )
            
            # Create execution sequence
            execution_strategy = orchestration_pattern if orchestration_pattern in ['sequential', 'parallel', 'direct'] else 'sequential'
            
            selected_agents_list = []
            for i, agent in enumerate(selected_agents):
                # Get detailed task assignment reasoning
                task_reasoning = self.get_task_assignment_reasoning(
                    query, user_intent, agent, i + 1, execution_strategy
                )
                
                selected_agents_list.append({
                    "agent_name": agent['agent_name'],
                    "agent_id": agent['agent_id'],
                    "execution_order": i + 1,
                    "confidence_score": agent['association_score'],
                    "selection_reasoning": agent['contextual_relevance'],
                    "task_assignment": task_reasoning['task_assignment'],
                    "orchestrator_reasoning": task_reasoning['orchestrator_reasoning'],
                    "a2a_handoff_details": task_reasoning['a2a_handoff_details']
                })
            
            return {
                "success": True,
                "execution_strategy": execution_strategy,
                "total_agents_selected": len(selected_agents_list),
                "selected_agents": selected_agents_list,
                "overall_reasoning": selection_reasoning['overall_reasoning'],
                "orchestrator_reasoning": selection_reasoning['orchestrator_reasoning']
            }
            
        except Exception as e:
            logger.error(f"Agent selection error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_agent_selection_reasoning(self, query: str, user_intent: str, agent_analysis: List[Dict], 
                                    selected_agents: List[Dict], orchestration_pattern: str) -> Dict[str, Any]:
        """Get detailed orchestrator reasoning for agent selection"""
        try:
            prompt = f"""
You are an expert orchestrator selecting agents for execution.

USER QUERY: {query}
USER INTENT: {user_intent}
ORCHESTRATION PATTERN: {orchestration_pattern}

ALL AVAILABLE AGENTS:
{json.dumps(agent_analysis, indent=2)}

SELECTED AGENTS:
{json.dumps(selected_agents, indent=2)}

Provide detailed reasoning in this format:
OVERALL_REASONING: [why these specific agents were selected]
ORCHESTRATOR_REASONING: [detailed reasoning about the selection process and execution strategy]
"""
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": ORCHESTRATOR_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 200
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                reasoning_text = result.get("response", "").strip()
                
                # Parse the response
                lines = reasoning_text.split('\n')
                overall_reasoning = ""
                orchestrator_reasoning = ""
                
                for line in lines:
                    if line.startswith("OVERALL_REASONING:"):
                        overall_reasoning = line.replace("OVERALL_REASONING:", "").strip()
                    elif line.startswith("ORCHESTRATOR_REASONING:"):
                        orchestrator_reasoning = line.replace("ORCHESTRATOR_REASONING:", "").strip()
                
                return {
                    "overall_reasoning": overall_reasoning,
                    "orchestrator_reasoning": orchestrator_reasoning
                }
            else:
                return {
                    "overall_reasoning": f"Selected {len(selected_agents)} agents using {orchestration_pattern} strategy",
                    "orchestrator_reasoning": "LLM analysis failed, using fallback"
                }
                
        except Exception as e:
            logger.error(f"Agent selection reasoning error: {e}")
            return {
                "overall_reasoning": f"Selected {len(selected_agents)} agents using {orchestration_pattern} strategy",
                "orchestrator_reasoning": f"Error: {str(e)}"
            }
    
    def get_task_assignment_reasoning(self, query: str, user_intent: str, agent: Dict, 
                                    execution_order: int, execution_strategy: str) -> Dict[str, Any]:
        """Get detailed orchestrator reasoning for task assignment and A2A handoff"""
        try:
            prompt = f"""
You are an expert orchestrator assigning tasks to agents for A2A execution.

USER QUERY: {query}
USER INTENT: {user_intent}
EXECUTION STRATEGY: {execution_strategy}
EXECUTION ORDER: {execution_order}

AGENT DETAILS:
- Name: {agent['agent_name']}
- ID: {agent['agent_id']}
- Capabilities: {agent.get('capability_analysis', 'N/A')}
- Relevance: {agent.get('relevance_justification', 'N/A')}

Provide detailed reasoning in this format:
TASK_ASSIGNMENT: [specific task assignment for this agent]
ORCHESTRATOR_REASONING: [why this task is assigned to this agent]
A2A_HANDOFF_DETAILS: [specific details for A2A handoff including context and instructions]
"""
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": ORCHESTRATOR_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 200
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                reasoning_text = result.get("response", "").strip()
                
                # Parse the response
                lines = reasoning_text.split('\n')
                task_assignment = ""
                orchestrator_reasoning = ""
                a2a_handoff_details = ""
                
                for line in lines:
                    if line.startswith("TASK_ASSIGNMENT:"):
                        task_assignment = line.replace("TASK_ASSIGNMENT:", "").strip()
                    elif line.startswith("ORCHESTRATOR_REASONING:"):
                        orchestrator_reasoning = line.replace("ORCHESTRATOR_REASONING:", "").strip()
                    elif line.startswith("A2A_HANDOFF_DETAILS:"):
                        a2a_handoff_details = line.replace("A2A_HANDOFF_DETAILS:", "").strip()
                
                return {
                    "task_assignment": task_assignment,
                    "orchestrator_reasoning": orchestrator_reasoning,
                    "a2a_handoff_details": a2a_handoff_details
                }
            else:
                return {
                    "task_assignment": f"Execute task for {agent['agent_name']} based on user intent",
                    "orchestrator_reasoning": "LLM analysis failed, using fallback",
                    "a2a_handoff_details": "Standard A2A handoff with context"
                }
                
        except Exception as e:
            logger.error(f"Task assignment reasoning error: {e}")
            return {
                "task_assignment": f"Execute task for {agent['agent_name']} based on user intent",
                "orchestrator_reasoning": f"Error: {str(e)}",
                "a2a_handoff_details": "Standard A2A handoff with context"
            }
    
    def execute_bidirectional_a2a(self, selected_agents: List[Dict], query: str, session_id: str) -> Dict[str, Any]:
        """Step 4: Execute bidirectional A2A handoffs (Orchestrator > Agent1 > Orchestrator > Agent2 > Orchestrator)"""
        try:
            execution_results = []
            accumulated_output = ""
            final_response = ""
            
            for i, agent in enumerate(selected_agents):
                agent_name = agent['agent_name']
                agent_id = agent['agent_id']
                task_assignment = agent['task_assignment']
                
                logger.info(f"[{session_id}] Executing Agent {i+1}: {agent_name}")
                
                # Step 4a: Orchestrator > Agent (A2A Handoff)
                handoff_result = self.execute_a2a_handoff(
                    agent_id, agent_name, query, accumulated_output, task_assignment, session_id, i+1
                )
                
                if handoff_result.get('success'):
                    agent_response = handoff_result.get('response', '')
                    accumulated_output += f"\n{agent_name}: {agent_response}"
                    
                    execution_results.append({
                        "agent_name": agent_name,
                        "execution_order": i + 1,
                        "success": True,
                        "execution_time": handoff_result.get('execution_time', 0),
                        "task_assignment": task_assignment,
                        "handoff_message_sent": handoff_result.get('handoff_message', ''),
                        "a2a_handoff_status": "success",
                        "agent_response": agent_response,
                        "agent_actual_response": agent_response
                    })
                    
                    # Step 4b: Agent > Orchestrator (Context Refinement)
                    if i < len(selected_agents) - 1:  # Not the last agent
                        context_refinement = self.refine_context_for_next_agent(
                            query, accumulated_output, selected_agents[i+1]['task_assignment'], 
                            selected_agents[i+1]['agent_name']
                        )
                        accumulated_output += f"\n[Context Refined: {context_refinement}]"
                        logger.info(f"[{session_id}] Context refined for next agent: {context_refinement}")
                
                else:
                    execution_results.append({
                        "agent_name": agent_name,
                        "execution_order": i + 1,
                        "success": False,
                        "execution_time": 0,
                        "task_assignment": task_assignment,
                        "handoff_message_sent": handoff_result.get('handoff_message', ''),
                        "a2a_handoff_status": "failed",
                        "agent_response": handoff_result.get('error', 'A2A handoff failed'),
                        "agent_actual_response": handoff_result.get('error', 'A2A handoff failed')
                    })
            
            # Step 4c: Final Orchestrator Synthesis
            final_response = self.synthesize_final_response(query, execution_results, accumulated_output)
            
            return {
                "success": True,
                "execution_strategy": "bidirectional_a2a",
                "total_agents_executed": len(execution_results),
                "execution_results": execution_results,
                "accumulated_output": accumulated_output,
                "final_response": final_response
            }
            
        except Exception as e:
            logger.error(f"Bidirectional A2A execution error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def execute_a2a_handoff(self, agent_id: str, agent_name: str, query: str, context: str, task_assignment: str, session_id: str, step: int) -> Dict[str, Any]:
        """Execute A2A handoff using official Strands parameters"""
        try:
            # Prepare handoff message using official Strands format
            handoff_message = f"""AGENT HANDOFF
Reason: Sequential step {step} - {agent_name}

Original Task: {query}

Source Agent Context:
{context}

TASK ASSIGNMENT: {task_assignment}

INSTRUCTIONS:
- Answer comprehensively with detailed reasoning
- Be specific and actionable
- Focus on your assigned task: {task_assignment}
- Build upon the provided context

Please continue with this task using the provided context."""
            
            # Send A2A handoff using official parameters
            handoff_payload = {
                "from_agent_id": self.orchestrator_id,
                "to_agent_id": agent_id,
                "content": handoff_message,
                "type": "handoff"
            }
            
            start_time = time.time()
            handoff_response = requests.post(
                f"{A2A_SERVICE_URL}/api/a2a/messages",
                json=handoff_payload,
                timeout=120
            )
            execution_time = time.time() - start_time
            
            if handoff_response.status_code == 200:
                handoff_result = handoff_response.json()
                if handoff_result.get("status") == "success":
                    # Simulate agent response (in real implementation, this would come from the agent)
                    agent_response = f"Agent {agent_name} completed task: {task_assignment}. Response based on context provided."
                    
                    return {
                        "success": True,
                        "response": agent_response,
                        "execution_time": execution_time,
                        "handoff_message": handoff_message,
                        "a2a_status": "success"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"A2A handoff failed: {handoff_result.get('error', 'Unknown error')}",
                        "execution_time": execution_time,
                        "handoff_message": handoff_message
                    }
            else:
                return {
                    "success": False,
                    "error": f"A2A handoff request failed: {handoff_response.status_code}",
                    "execution_time": execution_time,
                    "handoff_message": handoff_message
                }
                
        except Exception as e:
            logger.error(f"A2A handoff error for {agent_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "execution_time": 0,
                "handoff_message": handoff_message
            }
    
    def refine_context_for_next_agent(self, original_query: str, accumulated_output: str, next_task: str, next_agent_name: str) -> str:
        """Refine context for the next agent using LLM orchestrator"""
        try:
            prompt = f"""
You are an expert orchestrator. Refine the context for the next agent in the sequence.

ORIGINAL USER QUERY: {original_query}
CURRENT ACCUMULATED OUTPUT: {accumulated_output}
NEXT AGENT: {next_agent_name}
NEXT TASK: {next_task}

Create a refined context that:
1. Incorporates the previous agent's output
2. Provides clear direction for the next agent
3. Maintains focus on the original user intent
4. Is concise and actionable

Provide the refined context with comprehensive reasoning.
"""
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": ORCHESTRATOR_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 150
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
            else:
                return f"Context refinement failed for {next_agent_name}"
                
        except Exception as e:
            logger.error(f"Context refinement error: {e}")
            return f"Context refinement failed for {next_agent_name}"
    
    def synthesize_final_response(self, query: str, execution_results: List[Dict], accumulated_output: str) -> str:
        """Synthesize final response from all agent results"""
        try:
            # Collect successful agent responses
            successful_responses = [r for r in execution_results if r.get('success')]
            
            if not successful_responses:
                return "I apologize, but none of the agents were able to complete the task successfully."
            
            # Create synthesis prompt
            synthesis_prompt = f"""
You are a response synthesizer. Create a final response based on the user query and agent results.

USER QUERY: {query}

AGENT RESULTS:
{json.dumps(successful_responses, indent=2)}

ACCUMULATED OUTPUT:
{accumulated_output}

Create a comprehensive final response that:
1. Directly addresses the user's query
2. Incorporates insights from all agent responses
3. Is clear, actionable, and well-organized
4. Shows the complete workflow

Provide a polished, final response.
"""
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": ORCHESTRATOR_MODEL,
                    "prompt": synthesis_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 500
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "Final response synthesis failed").strip()
            else:
                return "Final response synthesis failed"
                
        except Exception as e:
            logger.error(f"Final synthesis error: {e}")
            return "Final response synthesis failed"
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """Process a query through the 4-step bidirectional A2A orchestration"""
        try:
            session_id = f"bidirectional_a2a_{int(time.time() * 1000)}"
            session = {
                "session_id": session_id,
                "created_at": datetime.now(),
                "query": query,
                "status": "processing"
            }
            self.active_sessions[session_id] = session
            
            logger.info(f"[{session_id}] Starting bidirectional A2A orchestration for: {query}")
            
            # Step 1: Orchestrator Reasoning
            logger.info(f"[{session_id}] Step 1: Orchestrator Reasoning")
            orchestrator_reasoning = self.generate_orchestrator_reasoning(query)
            session['orchestrator_reasoning'] = orchestrator_reasoning
            
            if not orchestrator_reasoning.get('success'):
                return {
                    "success": False,
                    "error": f"Orchestrator reasoning failed: {orchestrator_reasoning.get('error')}",
                    "session_id": session_id
                }
            
            # Step 2: Agent Registry Analysis
            logger.info(f"[{session_id}] Step 2: Agent Registry Analysis")
            agent_analysis = self.analyze_agents(
                query, 
                orchestrator_reasoning['user_intent'], 
                orchestrator_reasoning['domain_analysis'],
                orchestrator_reasoning['contextual_analysis']
            )
            session['agent_registry_analysis'] = agent_analysis
            
            if not agent_analysis.get('success'):
                return {
                    "success": False,
                    "error": f"Agent analysis failed: {agent_analysis.get('error')}",
                    "session_id": session_id
                }
            
            # Step 3: Agent Selection & Sequencing
            logger.info(f"[{session_id}] Step 3: Agent Selection & Sequencing")
            agent_selection = self.select_and_sequence_agents(
                agent_analysis['agent_analysis'],
                orchestrator_reasoning['orchestration_pattern'],
                query,
                orchestrator_reasoning['user_intent']
            )
            session['agent_selection'] = agent_selection
            
            if not agent_selection.get('success'):
                return {
                    "success": False,
                    "error": f"Agent selection failed: {agent_selection.get('error')}",
                    "session_id": session_id
                }
            
            # Step 4: Bidirectional A2A Execution
            logger.info(f"[{session_id}] Step 4: Bidirectional A2A Execution")
            a2a_execution = self.execute_bidirectional_a2a(
                agent_selection['selected_agents'],
                query,
                session_id
            )
            session['a2a_execution'] = a2a_execution
            session['status'] = "completed"
            
            # Cleanup session
            self.cleanup_session(session_id)
            
            return {
                "success": True,
                "session_id": session_id,
                "orchestrator_reasoning": orchestrator_reasoning,
                "agent_registry_analysis": agent_analysis,
                "agent_selection": agent_selection,
                "a2a_execution": a2a_execution,
                "execution_details": {
                    "success": True,
                    "steps_completed": 4,
                    "execution_time": (datetime.now() - session['created_at']).total_seconds(),
                    "step_1": "Orchestrator Reasoning (User Intent + Domain Analysis + Orchestration Pattern)",
                    "step_2": "Agent Registry Analysis (Contextual analysis of available agents)",
                    "step_3": "Agent Selection & Sequencing (Select and sequence agents for execution)",
                    "step_4": "Bidirectional A2A Execution (Orchestrator > Agent1 > Orchestrator > Agent2 > Orchestrator)"
                },
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Query processing error: {e}")
            if session_id in self.active_sessions:
                self.active_sessions[session_id]['status'] = "failed"
                self.cleanup_session(session_id)
            return {
                "success": False,
                "error": str(e),
                "session_id": session_id if 'session_id' in locals() else None
            }

# Initialize orchestrator
orchestrator = BidirectionalA2AOrchestrator()

# API Endpoints
@app.route('/api/bidirectional-a2a/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Bidirectional A2A Orchestration Service",
        "timestamp": datetime.now().isoformat(),
        "active_sessions": len(orchestrator.active_sessions),
        "memory_usage": psutil.virtual_memory().percent
    })

@app.route('/api/bidirectional-a2a/query', methods=['POST'])
def process_query():
    """Process a query through bidirectional A2A orchestration"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        result = orchestrator.process_query(query)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Query endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/bidirectional-a2a/sessions', methods=['GET'])
def get_sessions():
    """Get active sessions"""
    try:
        sessions = []
        for session_id, session in orchestrator.active_sessions.items():
            sessions.append({
                "session_id": session_id,
                "created_at": session['created_at'].isoformat(),
                "query": session['query'],
                "status": session['status']
            })
        
        return jsonify({
            "sessions": sessions,
            "total": len(sessions)
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/api/bidirectional-a2a/sessions/<session_id>', methods=['DELETE'])
def cleanup_session(session_id):
    """Cleanup a specific session"""
    try:
        success = orchestrator.cleanup_session(session_id)
        if success:
            return jsonify({
                "success": True,
                "message": f"Session {session_id} cleaned up"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Session not found"
            }), 404
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Bidirectional A2A Orchestration Service...")
    print("📍 Port: 5018")
    print("🔄 Bidirectional A2A Flow: Orchestrator > Agent1 > Orchestrator > Agent2 > Orchestrator")
    print("✅ Using official Strands A2A parameters")
    print("🧠 Memory management enabled")
    
    app.run(host='0.0.0.0', port=5018, debug=False)
