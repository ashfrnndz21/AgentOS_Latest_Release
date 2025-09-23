#!/usr/bin/env python3
"""
Simple 2-Step Orchestration API
Step 1: Process user query (using streamlined contextual analyzer)
Step 2: Analyze agents (using agent registry analysis)
"""

import json
import requests
import logging
import time
import psutil
from datetime import datetime
from typing import Dict, List, Any
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"

app = Flask(__name__)
CORS(app)

class SimpleOrchestrator:
    """Simple 2-step orchestrator"""
    
    def __init__(self):
        self.active_sessions = {}
        self.orchestrator_id = "fdaa1298-d5cf-495d-8b25-7e0b2e400796"
        self.auto_register_orchestrator()
        logger.info("Simple Orchestrator initialized - 2 steps only")
    
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
                        "name": "System Orchestrator",
                        "description": "LLM Orchestrator for agent coordination",
                        "model": "qwen3:1.7b",
                        "capabilities": ["orchestration", "agent_coordination", "context_analysis"]
                    }
                    
                    register_response = requests.post(
                        f"{A2A_SERVICE_URL}/api/a2a/agents",
                        json=orchestrator_data,
                        timeout=10
                    )
                    
                    if register_response.status_code in [200, 201]:
                        logger.info("✅ System Orchestrator auto-registered with A2A service")
                    else:
                        logger.warning(f"⚠️ Failed to auto-register System Orchestrator: {register_response.status_code}")
                else:
                    logger.info("✅ System Orchestrator already registered with A2A service")
            else:
                logger.warning(f"⚠️ Could not check A2A service status: {response.status_code}")
        except Exception as e:
            logger.warning(f"⚠️ Auto-registration failed: {e}")
    
    def create_session(self, query: str) -> Dict:
        """Create a new session"""
        session_id = f"simple_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        session = {
            'session_id': session_id,
            'query': query,
            'created_at': datetime.now(),
            'status': 'active'
        }
        self.active_sessions[session_id] = session
        logger.info(f"Created simple session {session_id} for query: {query[:50]}...")
        return session
    
    def analyze_agents_contextually(self, query: str, available_agents: List[Dict], user_intent: str, domain_analysis: Dict) -> Dict:
        """Analyze all agents in registry with contextual scoring"""
        try:
            # Prepare simplified agent data for LLM analysis
            agent_data = []
            for agent in available_agents:
                agent_data.append({
                    "name": agent['name'],
                    "description": agent.get('description', ''),
                    "role": agent.get('description', '')  # Use description as role
                })
            
            # Create prompt for agent analysis
            prompt = f"""
You are an expert agent orchestrator. Analyze each agent and provide a brief contextual analysis. Keep ALL responses to maximum 2 sentences.

USER QUERY: {query}
USER INTENT: {user_intent}
DOMAIN ANALYSIS: {domain_analysis}

AVAILABLE AGENTS:
{json.dumps(agent_data, indent=2)}

For each agent, provide a brief analysis (max 2 sentences each):
1. Role Analysis: What is this agent's primary role?
2. Contextual Relevance: How well does this agent match the user's intent?
3. Association Score: A score from 0.0 to 1.0

Return your analysis in this JSON format:
{{
    "agent_analysis": [
        {{
            "agent_name": "agent_name",
            "role_analysis": "Brief 2-sentence analysis of the agent's role and purpose",
            "contextual_relevance": "Brief 2-sentence analysis of how well this agent matches the user intent",
            "association_score": 0.85
        }}
    ],
    "analysis_summary": "Brief 2-sentence overall summary of agent capabilities and recommendations"
}}
"""
            
            # Call LLM for analysis
            logger.info(f"[AGENT ANALYSIS] Sending prompt to LLM (length: {len(prompt)} chars)")
            logger.info(f"[AGENT ANALYSIS] Prompt preview: {prompt[:200]}...")
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "qwen3:1.7b",
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
                response_text = result.get('response', '')
                
                # Log the full LLM response
                logger.info(f"[AGENT ANALYSIS] LLM Response Status: {response.status_code}")
                logger.info(f"[AGENT ANALYSIS] Full LLM Response:")
                logger.info(f"[AGENT ANALYSIS] {response_text}")
                
                # Try to parse JSON response
                try:
                    json_start = response_text.find('{')
                    json_end = response_text.rfind('}') + 1
                    if json_start != -1 and json_end > json_start:
                        json_text = response_text[json_start:json_end]
                        logger.info(f"[AGENT ANALYSIS] Extracted JSON: {json_text}")
                        analysis = json.loads(json_text)
                        
                        if 'agent_analysis' in analysis:
                            logger.info(f"[AGENT ANALYSIS] Successfully parsed {len(analysis['agent_analysis'])} agents")
                            return {
                                "success": True,
                                "agent_analysis": analysis['agent_analysis'],
                                "analysis_summary": analysis.get('analysis_summary', ''),
                                "total_agents_analyzed": len(analysis['agent_analysis'])
                            }
                        else:
                            raise ValueError("Invalid response format")
                    else:
                        raise ValueError("No JSON found in response")
                        
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"Failed to parse agent analysis JSON: {e}")
                    logger.error(f"Raw response that failed to parse: {response_text}")
                    return self._fallback_agent_analysis(available_agents, user_intent, domain_analysis)
            else:
                logger.error(f"Ollama agent analysis call failed with status {response.status_code}")
                return self._fallback_agent_analysis(available_agents, user_intent, domain_analysis)
                
        except Exception as e:
            logger.error(f"Unexpected error during agent analysis: {e}")
            return self._fallback_agent_analysis(available_agents, user_intent, domain_analysis)
    
    def _fallback_agent_analysis(self, available_agents: List[Dict], user_intent: str, domain_analysis: Dict) -> Dict:
        """Fallback agent analysis using keyword matching"""
        agent_analysis = []
        
        for agent in available_agents:
            # Simple keyword matching
            score = 0.0
            agent_name = agent.get('name', '').lower()
            agent_desc = agent.get('description', '').lower()
            user_intent_lower = user_intent.lower()
            
            # Check for keyword matches
            if any(word in agent_desc for word in user_intent_lower.split()):
                score += 0.3
            if any(word in agent_name for word in user_intent_lower.split()):
                score += 0.2
            
            # Cap the score at 1.0
            score = min(score, 1.0)
            
            agent_analysis.append({
                "agent_name": agent['name'],
                "role_analysis": f"Agent specialized in {agent.get('description', 'general assistance')}. Provides basic support for user queries.",
                "contextual_relevance": f"Basic keyword matching suggests {'high' if score > 0.5 else 'moderate' if score > 0.2 else 'low'} relevance to user intent. Suitable for general assistance tasks.",
                "association_score": score
            })
        
        # Sort by association score
        agent_analysis.sort(key=lambda x: x['association_score'], reverse=True)
        
        return {
            "success": True,
            "agent_analysis": agent_analysis,
            "analysis_summary": f"Analyzed {len(agent_analysis)} agents using fallback keyword matching. Found suitable agents for user query based on basic relevance scoring.",
            "total_agents_analyzed": len(agent_analysis)
        }
    
    def generate_orchestrator_reasoning(self, query: str, contextual_analysis: Dict) -> str:
        """Generate 2-line orchestrator reasoning about the user query context"""
        try:
            # Extract context from analysis
            user_intent = contextual_analysis.get('user_intent', 'General assistance') if contextual_analysis else 'General assistance'
            domain = contextual_analysis.get('domain_analysis', {}).get('primary_domain', 'General') if contextual_analysis else 'General'
            technical_level = contextual_analysis.get('domain_analysis', {}).get('technical_level', 'beginner') if contextual_analysis else 'beginner'
            pattern = contextual_analysis.get('orchestration_pattern', 'direct') if contextual_analysis else 'direct'
            
            # Create reasoning prompt
            prompt = f"""
You are an expert orchestrator. Provide a brief 2-line reasoning about this user query context.

USER QUERY: {query}
USER INTENT: {user_intent}
DOMAIN: {domain}
TECHNICAL LEVEL: {technical_level}
ORCHESTRATION PATTERN: {pattern}

Provide exactly 2 lines explaining:
1. What the user is trying to accomplish
2. Why the chosen orchestration approach makes sense

Keep it concise and insightful.
"""
            
            logger.info(f"[ORCHESTRATOR REASONING] Sending prompt to LLM")
            logger.info(f"[ORCHESTRATOR REASONING] Prompt preview: {prompt[:200]}...")
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "qwen3:1.7b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 200
                    }
                },
                timeout=20
            )
            
            if response.status_code == 200:
                result = response.json()
                reasoning = result.get('response', '').strip()
                logger.info(f"[ORCHESTRATOR REASONING] LLM Response: {reasoning}")
                
                # Clean up the response (remove any JSON formatting if present)
                if reasoning.startswith('{') and reasoning.endswith('}'):
                    try:
                        parsed = json.loads(reasoning)
                        reasoning = parsed.get('reasoning', reasoning)
                    except:
                        pass
                
                # Remove <think> tags and clean up
                reasoning = reasoning.replace('<think>', '').replace('</think>', '').strip()
                
                # Extract just the numbered lines if present
                lines = reasoning.split('\n')
                clean_lines = []
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('Okay,') and not line.startswith('First,') and not line.startswith('The second'):
                        if line.startswith(('1.', '2.')) or (len(clean_lines) < 2 and line):
                            clean_lines.append(line)
                
                if clean_lines:
                    reasoning = '\n'.join(clean_lines[:2])  # Take only first 2 lines
                
                return reasoning
            else:
                logger.error(f"Orchestrator reasoning LLM call failed: {response.status_code}")
                return f"User seeks {user_intent.lower()} in {domain.lower()} domain. {pattern.title()} orchestration pattern selected for optimal task execution."
                
        except Exception as e:
            logger.error(f"Error generating orchestrator reasoning: {e}")
            return f"User seeks {user_intent.lower()} in {domain.lower()} domain. {pattern.title()} orchestration pattern selected for optimal task execution."
    
    def select_and_sequence_agents(self, query: str, contextual_analysis: Dict, agent_analysis_result: Dict) -> Dict:
        """Step 3: Select best agents and determine execution sequence"""
        try:
            # Extract context
            user_intent = contextual_analysis.get('user_intent', 'General assistance') if contextual_analysis else 'General assistance'
            domain = contextual_analysis.get('domain_analysis', {}).get('primary_domain', 'General') if contextual_analysis else 'General'
            pattern = contextual_analysis.get('orchestration_pattern', 'direct') if contextual_analysis else 'direct'
            
            # Get agent analysis data
            agent_analysis = agent_analysis_result.get('agent_analysis', [])
            
            # Create prompt for agent selection and sequencing
            prompt = f"""
You are an expert agent orchestrator. Based on the user query, contextual analysis, and agent analysis, select the best agents and determine their execution sequence.

USER QUERY: {query}
USER INTENT: {user_intent}
DOMAIN: {domain}
ORCHESTRATION PATTERN: {pattern}

AGENT ANALYSIS RESULTS:
{json.dumps(agent_analysis, indent=2)}

Your task:
1. Select the best agent(s) for this task (max 2 agents)
2. Determine execution sequence (which agent runs first, second)
3. Provide reasoning for your selection
4. Assign specific tasks to each selected agent

Return your analysis in this JSON format:
{{
    "selected_agents": [
        {{
            "agent_name": "agent_name",
            "execution_order": 1,
            "task_assignment": "Specific task description for this agent",
            "selection_reasoning": "Why this agent was selected",
            "confidence_score": 0.85
        }}
    ],
    "execution_strategy": "sequential|parallel|direct",
    "overall_reasoning": "Brief explanation of the overall selection strategy",
    "total_agents_selected": 1
}}
"""
            
            logger.info(f"[AGENT SELECTION] Sending prompt to LLM")
            logger.info(f"[AGENT SELECTION] Prompt preview: {prompt[:200]}...")
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "qwen3:1.7b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 800
                    }
                },
                timeout=25
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result.get('response', '').strip()
                logger.info(f"[AGENT SELECTION] LLM Response: {response_text}")
                
                # Parse JSON response
                try:
                    json_start = response_text.find('{')
                    json_end = response_text.rfind('}') + 1
                    if json_start != -1 and json_end > json_start:
                        json_text = response_text[json_start:json_end]
                        selection_data = json.loads(json_text)
                        
                        if 'selected_agents' in selection_data:
                            logger.info(f"[AGENT SELECTION] Successfully parsed {len(selection_data['selected_agents'])} selected agents")
                            return {
                                "success": True,
                                "selected_agents": selection_data['selected_agents'],
                                "execution_strategy": selection_data.get('execution_strategy', pattern),
                                "overall_reasoning": selection_data.get('overall_reasoning', ''),
                                "total_agents_selected": len(selection_data['selected_agents'])
                            }
                        else:
                            raise ValueError("Invalid response format")
                    else:
                        raise ValueError("No JSON found in response")
                        
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"Failed to parse agent selection JSON: {e}")
                    return self._fallback_agent_selection(agent_analysis, pattern)
            else:
                logger.error(f"Agent selection LLM call failed: {response.status_code}")
                return self._fallback_agent_selection(agent_analysis, pattern)
                
        except Exception as e:
            logger.error(f"Error in agent selection: {e}")
            return self._fallback_agent_selection(agent_analysis_result.get('agent_analysis', []), contextual_analysis.get('orchestration_pattern', 'direct') if contextual_analysis else 'direct')
    
    def select_and_sequence_agents(self, query: str, contextual_analysis: Dict, agent_analysis_result: Dict) -> Dict:
        """Step 3: Select best agents and determine execution sequence"""
        try:
            agent_analysis = agent_analysis_result.get('agent_analysis', [])
            pattern = contextual_analysis.get('orchestration_pattern', 'direct') if contextual_analysis else 'direct'
            
            if not agent_analysis:
                return {
                    "success": False,
                    "selected_agents": [],
                    "execution_strategy": pattern,
                    "overall_reasoning": "No agents available for selection",
                    "total_agents_selected": 0
                }
            
            # Prepare agent data for LLM
            agent_data = []
            for agent in agent_analysis:
                agent_data.append({
                    "name": agent.get('agent_name', 'Unknown'),
                    "description": agent.get('role_analysis', 'No description'),
                    "association_score": agent.get('association_score', 0)
                })
            
            # Create LLM prompt for agent selection
            prompt = f"""Based on the user query and agent analysis, select the best agents and determine their execution sequence.

USER QUERY: {query}
ORCHESTRATION PATTERN: {pattern}
AVAILABLE AGENTS: {json.dumps(agent_data, indent=2)}

For complex queries that involve multiple tasks (like creating content + writing code), select 2 agents for sequential execution:
- Agent 1: Handles the first part of the task
- Agent 2: Handles the second part, building on Agent 1's output

Select 1-2 agents that best match the query requirements and provide:
1. Agent selection reasoning
2. Execution order
3. Task assignment for each agent
4. Overall strategy (prefer "sequential" for multi-step tasks)

Respond in JSON format:
{{
    "selected_agents": [
        {{
            "agent_name": "Agent Name",
            "execution_order": 1,
            "task_assignment": "Specific task for this agent",
            "selection_reasoning": "Why this agent was selected",
            "confidence_score": 0.85
        }},
        {{
            "agent_name": "Agent Name 2",
            "execution_order": 2,
            "task_assignment": "Specific task for this agent",
            "selection_reasoning": "Why this agent was selected",
            "confidence_score": 0.80
        }}
    ],
    "execution_strategy": "sequential",
    "overall_reasoning": "Overall selection strategy and reasoning"
}}"""

            # Call LLM for agent selection
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "qwen3:1.7b",
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
                llm_response = result.get('response', '')
                
                # Parse LLM response
                try:
                    # Extract JSON from response
                    json_start = llm_response.find('{')
                    json_end = llm_response.rfind('}') + 1
                    if json_start != -1 and json_end > json_start:
                        json_str = llm_response[json_start:json_end]
                        selection_result = json.loads(json_str)
                        
                        # Validate and return result
                        if 'selected_agents' in selection_result:
                            return {
                                "success": True,
                                "selected_agents": selection_result['selected_agents'],
                                "execution_strategy": selection_result.get('execution_strategy', pattern),
                                "overall_reasoning": selection_result.get('overall_reasoning', 'Agent selection completed'),
                                "total_agents_selected": len(selection_result['selected_agents'])
                            }
                except json.JSONDecodeError as e:
                    logger.error(f"JSON parsing error in agent selection: {e}")
                    logger.error(f"LLM response: {llm_response}")
            
            # Fallback to simplified selection
            logger.warning("LLM agent selection failed, using fallback")
            return self._fallback_agent_selection(agent_analysis, pattern)
            
        except Exception as e:
            logger.error(f"Error in agent selection: {e}")
            return self._fallback_agent_selection(agent_analysis_result.get('agent_analysis', []), contextual_analysis.get('orchestration_pattern', 'direct') if contextual_analysis else 'direct')

    def _fallback_agent_selection(self, agent_analysis: List[Dict], pattern: str) -> Dict:
        """Fallback agent selection when LLM call fails"""
        if not agent_analysis:
            return {
                "success": False,
                "selected_agents": [],
                "execution_strategy": pattern,
                "overall_reasoning": "No agents available for selection",
                "total_agents_selected": 0
            }
        
        # Select top 2 agents by association score for sequential execution
        sorted_agents = sorted(agent_analysis, key=lambda x: x.get('association_score', 0), reverse=True)
        selected_agents = []
        
        # Always try to select 2 agents for sequential execution
        for i, agent in enumerate(sorted_agents[:2]):
            selected_agents.append({
                "agent_name": agent.get('agent_name', 'Unknown'),
                "execution_order": i + 1,
                "task_assignment": agent.get('role_analysis', 'General assistance')[:100],
                "selection_reasoning": f"Selected based on association score ({agent.get('association_score', 0):.2f})",
                "confidence_score": agent.get('association_score', 0.5)
            })
        
        return {
            "success": True,
            "selected_agents": selected_agents,
            "execution_strategy": "sequential" if len(selected_agents) > 1 else pattern,
            "overall_reasoning": f"Fallback selection using association score ranking - {len(selected_agents)} agents selected",
            "total_agents_selected": len(selected_agents)
        }
    
    def execute_a2a_sequential_handover(self, query: str, agent_selection: Dict, available_agents: List[Dict]) -> Dict:
        """Step 4: Execute A2A sequential handover using real A2A handover parameters"""
        try:
            selected_agents = agent_selection.get('selected_agents', [])
            execution_strategy = agent_selection.get('execution_strategy', 'direct')
            
            if not selected_agents:
                return {
                    "success": False,
                    "error": "No agents selected for execution",
                    "execution_results": [],
                    "final_response": ""
                }
            
            # Sort agents by execution order
            sorted_agents = sorted(selected_agents, key=lambda x: x.get('execution_order', 1))
            
            execution_results = []
            current_context = query
            accumulated_output = ""
            
            logger.info(f"[A2A EXECUTION] Starting {execution_strategy} execution with {len(sorted_agents)} agents")
            
            for i, agent_info in enumerate(sorted_agents):
                agent_name = agent_info.get('agent_name', 'Unknown')
                task_assignment = agent_info.get('task_assignment', 'General assistance')
                execution_order = agent_info.get('execution_order', i + 1)
                
                logger.info(f"[A2A EXECUTION] Executing agent {execution_order}: {agent_name}")
                
                # Add timeout protection for each agent execution
                agent_start_time = time.time()
                max_agent_time = 120  # 2 minutes per agent max
                
                # Find agent details from available agents (trim names for comparison)
                agent_details = next((agent for agent in available_agents if agent['name'].strip() == agent_name.strip()), None)
                if not agent_details:
                    logger.error(f"[A2A EXECUTION] Agent {agent_name} not found in available agents")
                    continue
                
                # Use real A2A handover parameters
                handoff_result = self.execute_a2a_handoff(
                    current_task=query,
                    source_agent_context=accumulated_output if accumulated_output else "Initial task",
                    target_agent_id=agent_details['id'],
                    target_agent_name=agent_name,
                    handoff_reason=f"Sequential step {execution_order} - {task_assignment}",
                    task_assignment=task_assignment
                )
                
                execution_results.append({
                    "agent_name": agent_name,
                    "execution_order": execution_order,
                    "task_assignment": task_assignment,
                    "agent_response": handoff_result.get('response', 'No response'),
                    "success": handoff_result.get('success', False),
                    "execution_time": handoff_result.get('execution_time', 0),
                    "a2a_handoff_status": handoff_result.get('handoff_status', 'unknown'),
                    "handoff_message_sent": handoff_result.get('handoff_message_sent', ''),
                    "agent_actual_response": handoff_result.get('agent_actual_response', 'No actual response from agent')
                })
                
                # Check timeout after agent execution
                agent_execution_time = time.time() - agent_start_time
                if agent_execution_time > max_agent_time:
                    logger.warning(f"[A2A EXECUTION] Agent {agent_name} execution timeout ({agent_execution_time:.1f}s)")
                    execution_results.append({
                        "agent_name": agent_name,
                        "execution_order": execution_order,
                        "task_assignment": task_assignment,
                        "agent_response": "Agent execution timeout",
                        "success": False,
                        "execution_time": agent_execution_time,
                        "a2a_handoff_status": "timeout",
                        "handoff_message_sent": "Timeout occurred",
                        "agent_actual_response": "Agent execution timeout"
                    })
                    continue
                
                # Update context for next agent using A2A handover
                if handoff_result.get('success') and handoff_result.get('response'):
                    accumulated_output += f"\n{agent_name}: {handoff_result['response']}"
                    
                    # LLM Orchestrator refinement for next agent
                    if i < len(sorted_agents) - 1:  # Not the last agent
                        next_agent = sorted_agents[i + 1]
                        current_context = self.refine_context_for_next_agent(
                            query, 
                            accumulated_output, 
                            next_agent.get('task_assignment', ''),
                            next_agent.get('agent_name', '')
                        )
                        logger.info(f"[A2A EXECUTION] Context refined for next agent: {next_agent.get('agent_name', 'Unknown')}")
            
            # Generate final response
            final_response = self.synthesize_final_response(query, execution_results, accumulated_output)
            
            return {
                "success": True,
                "execution_strategy": execution_strategy,
                "execution_results": execution_results,
                "final_response": final_response,
                "total_agents_executed": len(execution_results),
                "accumulated_output": accumulated_output
            }
            
        except Exception as e:
            logger.error(f"Error in A2A execution: {e}")
            return {
                "success": False,
                "error": str(e),
                "execution_results": [],
                "final_response": ""
            }
    
    def execute_a2a_handoff(self, current_task: str, source_agent_context: str, target_agent_id: str, target_agent_name: str, handoff_reason: str, task_assignment: str) -> Dict:
        """Execute A2A handoff using real A2A handover parameters"""
        try:
            start_time = time.time()
            
            # Prepare handoff message using real A2A handover format
            handoff_message = f"""AGENT HANDOFF
Reason: {handoff_reason}

Original Task: {current_task}

Source Agent Context:
{source_agent_context}

TASK ASSIGNMENT: {task_assignment}

INSTRUCTIONS:
- Answer precisely in maximum 2 sentences
- Be specific and actionable
- Focus on your assigned task: {task_assignment}
- Build upon the provided context

Please continue with this task using the provided context."""
            
            # Send A2A handoff message using real A2A service
            handoff_payload = {
                "from_agent_id": "fdaa1298-d5cf-495d-8b25-7e0b2e400796",  # System Orchestrator ID
                "to_agent_id": target_agent_id,
                "content": handoff_message,
                "type": "handoff",
                "priority": "normal",
                "include_context": True
            }
            
            logger.info(f"[A2A HANDOFF] Sending handoff to {target_agent_name} (ID: {target_agent_id})")
            
            handoff_response = requests.post(
                f"{A2A_SERVICE_URL}/api/a2a/messages",
                json=handoff_payload,
                timeout=60
            )
            
            execution_time = time.time() - start_time
            
            if handoff_response.status_code in [200, 201]:
                result = handoff_response.json()
                
                # Try to get actual agent response by executing the agent
                agent_actual_response = self.get_agent_actual_response(target_agent_id, handoff_message)
                
                return {
                    "success": True,
                    "response": result.get('message', {}).get('content', 'A2A handoff successful'),
                    "execution_time": execution_time,
                    "handoff_status": "success",
                    "agent_id": target_agent_id,
                    "agent_name": target_agent_name,
                    "handoff_message_sent": handoff_message,
                    "agent_actual_response": agent_actual_response
                }
            else:
                logger.error(f"A2A handoff failed: {handoff_response.status_code}")
                return {
                    "success": False,
                    "response": f"A2A handoff failed: {handoff_response.status_code}",
                    "execution_time": execution_time,
                    "handoff_status": "failed",
                    "agent_id": target_agent_id,
                    "agent_name": target_agent_name
                }
                
        except Exception as e:
            logger.error(f"Error in A2A handoff: {e}")
            return {
                "success": False,
                "response": f"A2A handoff error: {str(e)}",
                "execution_time": 0,
                "handoff_status": "error",
                "agent_id": target_agent_id,
                "agent_name": target_agent_name
            }
    
    def get_agent_actual_response(self, agent_id: str, handoff_message: str) -> str:
        """Get actual response from agent after A2A handoff"""
        try:
            # Execute the agent with the handoff message
            response = requests.post(
                f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent_id}/execute",
                json={
                    "input": handoff_message,
                    "max_tokens": 200,
                    "temperature": 0.3
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', 'No response from agent')
            else:
                return f"Agent execution failed: {response.status_code}"
                
        except Exception as e:
            return f"Agent execution error: {str(e)}"
    
    def execute_single_agent(self, agent_details: Dict, agent_query: str) -> Dict:
        """Execute a single agent with the given query"""
        try:
            start_time = time.time()
            
            # Call the agent via Strands SDK
            response = requests.post(
                f"{STRANDS_SDK_URL}/api/strands-sdk/execute",
                json={
                    "agent_id": agent_details['id'],
                    "query": agent_query,
                    "max_tokens": 100,  # Limit to 2 sentences
                    "temperature": 0.3
                },
                timeout=60
            )
            
            execution_time = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": result.get('success', False),
                    "response": result.get('response', 'No response'),
                    "execution_time": execution_time
                }
            else:
                logger.error(f"Agent execution failed: {response.status_code}")
                return {
                    "success": False,
                    "response": f"Agent execution failed: {response.status_code}",
                    "execution_time": execution_time
                }
                
        except Exception as e:
            logger.error(f"Error executing agent: {e}")
            return {
                "success": False,
                "response": f"Agent execution error: {str(e)}",
                "execution_time": 0
            }
    
    def refine_context_for_next_agent(self, original_query: str, accumulated_output: str, next_task: str, next_agent_name: str) -> str:
        """Use LLM orchestrator to refine context for the next agent"""
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

Provide the refined context in 1-2 sentences maximum.
"""
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "qwen3:1.7b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 150
                    }
                },
                timeout=20
            )
            
            if response.status_code == 200:
                result = response.json()
                refined_context = result.get('response', '').strip()
                logger.info(f"[CONTEXT REFINEMENT] Refined context: {refined_context}")
                return refined_context
            else:
                logger.error(f"Context refinement failed: {response.status_code}")
                return f"Building on previous work: {accumulated_output}. Next: {next_task}"
                
        except Exception as e:
            logger.error(f"Error refining context: {e}")
            return f"Building on previous work: {accumulated_output}. Next: {next_task}"
    
    def synthesize_final_response(self, original_query: str, execution_results: List[Dict], accumulated_output: str) -> str:
        """Synthesize final response from all agent outputs"""
        try:
            # Extract actual agent responses for synthesis
            agent_responses = []
            for result in execution_results:
                if result.get('success') and result.get('agent_actual_response'):
                    agent_responses.append({
                        "agent_name": result['agent_name'],
                        "task": result['task_assignment'],
                        "response": result['agent_actual_response']
                    })
            
            # Create a clean summary of agent outputs
            agent_outputs_summary = "\n\n".join([
                f"**{resp['agent_name']}** ({resp['task']}):\n{resp['response']}"
                for resp in agent_responses
            ])
            
            prompt = f"""
You are an expert orchestrator. Synthesize a final response by combining the user query with the actual agent outputs.

ORIGINAL USER QUERY: {original_query}

AGENT OUTPUTS:
{agent_outputs_summary}

Create a comprehensive final response that:
1. Directly addresses the original user query
2. Combines and synthesizes the actual agent outputs above
3. Provides a single, cohesive answer
4. Is concise and well-structured (max 3-4 sentences)

IMPORTANT: 
- Do NOT include <think> tags or internal reasoning
- Do NOT show your thought process
- Provide ONLY the final synthesized response
- Start directly with the answer

Provide the final synthesized response that combines the user query with both agent outputs.
"""
            
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "qwen3:1.7b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 200
                    }
                },
                timeout=20
            )
            
            if response.status_code == 200:
                result = response.json()
                final_response = result.get('response', '').strip()
                
                # Clean up <think> tags and internal reasoning
                import re
                final_response = re.sub(r'<think>.*?</think>', '', final_response, flags=re.DOTALL)
                final_response = re.sub(r'<think>.*$', '', final_response, flags=re.DOTALL)
                final_response = final_response.strip()
                
                logger.info(f"[FINAL SYNTHESIS] Final response: {final_response}")
                return final_response
            else:
                logger.error(f"Final synthesis failed: {response.status_code}")
                return f"Based on the agent analysis: {accumulated_output}"
                
        except Exception as e:
            logger.error(f"Error synthesizing final response: {e}")
            return f"Based on the agent analysis: {accumulated_output}"
    
    def process_query(self, query: str, contextual_analysis: Dict = None) -> Dict:
        """Process query through simple 2-step orchestration"""
        session = self.create_session(query)
        start_time = time.time()
        max_execution_time = 300  # 5 minutes max
        
        try:
            # Step 1: Get available agents
            logger.info(f"[{session['session_id']}] Step 1: Getting available agents")
            
            # Get Strands SDK agents
            sdk_response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=30)
            if sdk_response.status_code != 200:
                return {
                    "success": False,
                    "error": "Failed to get SDK agents",
                    "session_id": session['session_id']
                }
            
            sdk_agents = sdk_response.json().get('agents', [])
            
            # Use SDK agents directly
            available_agents = []
            for sdk_agent in sdk_agents:
                available_agents.append({
                    'id': sdk_agent['id'],
                    'name': sdk_agent['name'],
                    'description': sdk_agent.get('description', ''),
                    'capabilities': sdk_agent.get('tools', []),
                    'tools': sdk_agent.get('tools', []),
                    'model': sdk_agent.get('model_id', 'unknown'),
                    'system_prompt': sdk_agent.get('system_prompt', '')
                })
            
            if not available_agents:
                return {
                    "success": False,
                    "error": "No agents available",
                    "session_id": session['session_id']
                }
            
            # Step 1: Enhanced Contextual Analysis with Orchestrator Reasoning
            logger.info(f"[{session['session_id']}] Step 1: Enhanced contextual analysis with orchestrator reasoning")
            
            # Extract user intent and domain analysis from contextual analysis
            user_intent = "General query assistance"
            domain_analysis = {"primary_domain": "General", "technical_level": "beginner"}
            
            # Log Step 1 inputs
            logger.info(f"[STEP 1] Query: {query}")
            logger.info(f"[STEP 1] Contextual Analysis Input: {contextual_analysis}")
            
            if contextual_analysis and contextual_analysis.get('success'):
                user_intent = contextual_analysis.get('user_intent', user_intent)
                domain_analysis = contextual_analysis.get('domain_analysis', domain_analysis)
                logger.info(f"[STEP 1] Extracted User Intent: {user_intent}")
                logger.info(f"[STEP 1] Extracted Domain Analysis: {domain_analysis}")
                
                # Generate orchestrator reasoning for this contextual analysis
                orchestrator_reasoning = self.generate_orchestrator_reasoning(query, contextual_analysis)
                session['orchestrator_reasoning'] = orchestrator_reasoning
                logger.info(f"[STEP 1] Generated Orchestrator Reasoning: {orchestrator_reasoning}")
            else:
                logger.info(f"[STEP 1] Using fallback values - no contextual analysis provided")
                session['orchestrator_reasoning'] = "User seeks general assistance. Direct orchestration pattern selected for immediate response."
            
            # Step 2: Agent Registry Analysis
            logger.info(f"[{session['session_id']}] Step 2: Agent registry contextual analysis")
            
            # Perform contextual agent analysis
            agent_analysis_result = self.analyze_agents_contextually(query, available_agents, user_intent, domain_analysis)
            
            # Step 3: Agent Selection and Sequencing
            logger.info(f"[{session['session_id']}] Step 3: Agent selection and sequencing")
            agent_selection_result = self.select_and_sequence_agents(query, contextual_analysis, agent_analysis_result)
            session['agent_selection'] = agent_selection_result
            
            # Step 4: A2A Execution with Sequential Handover
            logger.info(f"[{session['session_id']}] Step 4: A2A execution with sequential handover")
            
            # Check timeout before A2A execution
            if time.time() - start_time > max_execution_time:
                return {
                    "success": False,
                    "error": "Execution timeout exceeded",
                    "session_id": session['session_id']
                }
            
            a2a_execution_result = self.execute_a2a_sequential_handover(query, agent_selection_result, available_agents)
            session['a2a_execution'] = a2a_execution_result
                
            session['status'] = "completed"
            session['duration'] = (datetime.now() - session['created_at']).total_seconds()
            
            return {
                "success": True,
                "session_id": session['session_id'],
                "streamlined_analysis": contextual_analysis,
                "orchestrator_reasoning": session.get('orchestrator_reasoning', ''),
                "agent_registry_analysis": agent_analysis_result,
                "agent_selection": session.get('agent_selection', {}),
                "a2a_execution": session.get('a2a_execution', {}),
                "execution_details": {
                    "success": True,
                    "execution_time": session['duration'],
                    "steps_completed": 4,
                    "step_1": "Enhanced contextual analysis with orchestrator reasoning",
                    "step_2": "Agent registry analysis",
                    "step_3": "Agent selection and sequencing",
                    "step_4": "A2A execution with sequential handover"
                },
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Query processing error: {e}")
            session['status'] = "failed"
            session['duration'] = (datetime.now() - session['created_at']).total_seconds()
            return {
                "success": False,
                "error": str(e),
                "session_id": session['session_id']
            }

# Initialize orchestrator
orchestrator = SimpleOrchestrator()

@app.route('/api/simple-orchestration/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        # Get memory usage
        memory = psutil.virtual_memory()
        memory_usage = f"{memory.percent:.1f}% ({memory.used / (1024**3):.1f}GB / {memory.total / (1024**3):.1f}GB)"
    except Exception as e:
        logger.error(f"Failed to get memory usage: {e}")
        memory_usage = "N/A"
    
    return jsonify({
        "status": "healthy",
        "orchestrator_type": "simple_4step",
        "active_sessions": len(orchestrator.active_sessions),
        "memory_usage": memory_usage,
        "orchestrator_model": "qwen3:1.7b",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/simple-orchestration/sessions', methods=['GET'])
def get_sessions():
    """Get active sessions"""
    try:
        sessions = []
        for session_id, session in orchestrator.active_sessions.items():
            sessions.append({
                "session_id": session_id,
                "query": session.get('query', ''),
                "status": session.get('status', 'unknown'),
                "created_at": session.get('created_at', datetime.now()).isoformat(),
                "duration": (datetime.now() - session.get('created_at', datetime.now())).total_seconds(),
                "stages_completed": 4  # Always 4 steps in our system
            })
        
        return jsonify({
            "sessions": sessions,
            "total": len(sessions)
        })
    except Exception as e:
        logger.error(f"Sessions endpoint error: {e}")
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/api/simple-orchestration/analytics', methods=['GET'])
def get_orchestrator_analytics():
    """Get orchestrator analytics and performance metrics"""
    try:
        # Calculate analytics from active sessions
        total_queries = len(orchestrator.active_sessions)
        successful_queries = sum(1 for session in orchestrator.active_sessions.values() 
                               if session.get('status') == 'completed')
        success_rate = (successful_queries / total_queries * 100) if total_queries > 0 else 100
        
        # Calculate average response time (empty when no agents)
        avg_response_time = 0.0
        
        # Calculate total tokens (empty when no agents)
        total_tokens = 0
        
        # Get recent queries
        recent_queries = []
        for session_id, session in list(orchestrator.active_sessions.items())[-5:]:  # Last 5 queries
            recent_queries.append({
                "query": session.get('query', ''),
                "timestamp": session.get('created_at', datetime.now()).isoformat(),
                "success": session.get('status') == 'completed'
            })
        
        # Empty agent usage data when no agents exist
        agent_usage = {}
        
        return jsonify({
            "total_queries": total_queries,
            "success_rate": round(success_rate, 1),
            "avg_response_time": avg_response_time,
            "total_tokens": total_tokens,
            "recent_queries": recent_queries,
            "agent_usage": agent_usage,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Analytics endpoint error: {e}")
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/api/simple-orchestration/conversation-traces', methods=['GET'])
def get_conversation_traces():
    """Get detailed conversation traces for all sessions"""
    try:
        traces = []
        for session_id, session in orchestrator.active_sessions.items():
            trace = {
                "session_id": session_id,
                "query": session.get('query', ''),
                "timestamp": session.get('created_at', datetime.now()).isoformat(),
                "status": session.get('status', 'unknown'),
                "execution_details": session.get('execution_details', {}),
                "orchestrator_reasoning": session.get('orchestrator_reasoning', ''),
                "streamlined_analysis": session.get('streamlined_analysis', {}),
                "agent_registry_analysis": session.get('agent_registry_analysis', {}),
                "agent_selection": session.get('agent_selection', {}),
                "a2a_execution": session.get('a2a_execution', {}),
                "duration": (datetime.now() - session.get('created_at', datetime.now())).total_seconds()
            }
            traces.append(trace)
        
        # Sort by timestamp (newest first)
        traces.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            "traces": traces,
            "total": len(traces),
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Conversation traces endpoint error: {e}")
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/api/simple-orchestration/query', methods=['POST'])
def process_query():
    """Process query through simple 2-step orchestration"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        contextual_analysis = data.get('contextual_analysis', None)
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"Processing simple orchestration query: {query[:50]}...")
        
        result = orchestrator.process_query(query, contextual_analysis)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Simple query endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Simple 2-Step Orchestration API...")
    logger.info("📍 Port: 5015")
    logger.info("🧠 Step 1: Process user query")
    logger.info("🔍 Step 2: Analyze agents")
    app.run(host='0.0.0.0', port=5015, debug=False)
