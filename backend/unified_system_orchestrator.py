#!/usr/bin/env python3
"""
Unified System Orchestrator
Combines all existing orchestration implementations into a single, clean workflow

Workflow:
User Query → System Orchestrator (LLM) → Agent Registry → A2A Communication → Response
     ↓              ↓                        ↓                ↓                ↓
  Complex       6-Stage LLM              Dynamic Agent    Intelligent      Clean
  Analysis      Analysis                 Discovery        Handoffs         Output
"""

import asyncio
import json
import logging
import time
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Service URLs
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"
OLLAMA_BASE_URL = "http://localhost:11434"

class UnifiedSystemOrchestrator:
    """Unified orchestrator that combines all existing implementations"""
    
    def __init__(self):
        self.orchestrator_model = "qwen3:1.7b"
        self.session_timeout = 300
        self.active_sessions = {}
        
        logger.info("🚀 Unified System Orchestrator initialized")
        logger.info("📍 Combines: 6-Stage LLM Analysis + Dynamic Agent Discovery + A2A Handoffs + Text Cleaning")
    
    async def process_query(self, query: str, session_id: Optional[str] = None, agents: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Main orchestration workflow - clean and unified with complete data visibility
        
        Args:
            query: User query to process
            session_id: Optional session ID (generated if not provided)
        
        Returns:
            OrchestrationResult with complete workflow trace and data visibility
        """
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Initialize complete data flow tracking
        complete_data_flow = {
            "session_id": session_id,
            "original_query": query,
            "stages": {},
            "handoffs": [],
            "data_exchanges": [],
            "orchestrator_processing": [],
            "final_synthesis": {}
        }
        
        logger.info(f"[{session_id}] 🎯 Starting unified orchestration workflow")
        logger.info(f"[{session_id}] Query: {query[:100]}...")
        
        try:
            # Stage 1: Complex Analysis (6-Stage LLM)
            logger.info(f"[{session_id}] 📊 Stage 1: Complex LLM Analysis")
            analysis = await self._analyze_query_with_llm(query, session_id)
            
            # Track Stage 1 data
            complete_data_flow["stages"]["stage_1_analysis"] = {
                "input": query,
                "output": analysis,
                "timestamp": datetime.now().isoformat()
            }
            
            if not analysis.get('success', False):
                return {
                    "success": False,
                    "error": "Query analysis failed",
                    "session_id": session_id,
                    "stage": "analysis",
                    "complete_data_flow": complete_data_flow
                }
            
            # Stage 2: Dynamic Agent Discovery
            logger.info(f"[{session_id}] 🔍 Stage 2: Dynamic Agent Discovery")
            if agents:
                # Use provided agents
                logger.info(f"[{session_id}] Using provided agents: {agents}")
                agents = await self._convert_agent_names_to_objects(agents, session_id)
            else:
                # Discover agents automatically
                agents = await self._discover_agents(analysis, session_id)
            
            # Track Stage 2 data
            complete_data_flow["stages"]["stage_2_discovery"] = {
                "input": analysis,
                "output": agents,
                "timestamp": datetime.now().isoformat()
            }
            
            if not agents:
                return {
                    "success": False,
                    "error": "No suitable agents found",
                    "session_id": session_id,
                    "stage": "discovery",
                    "complete_data_flow": complete_data_flow
                }
            
            # Stage 3: Intelligent Handoffs (A2A) with complete data tracking
            logger.info(f"[{session_id}] 🤝 Stage 3: Intelligent A2A Handoffs")
            handoff_result = await self._execute_handoffs_with_data_visibility(query, agents, analysis, session_id, complete_data_flow)
            
            if not handoff_result.get('success', False):
                return {
                    "success": False,
                    "error": "Agent execution failed",
                    "session_id": session_id,
                    "stage": "execution",
                    "details": handoff_result.get('error', 'Unknown error'),
                    "complete_data_flow": complete_data_flow
                }
            
            # Stage 4: Clean Output Synthesis with data tracking
            logger.info(f"[{session_id}] ✨ Stage 4: Clean Output Synthesis")
            final_response = await self._synthesize_clean_response_with_tracking(handoff_result, session_id, complete_data_flow)
            
            # Prepare comprehensive result with complete data flow
            result = {
                "success": True,
                "session_id": session_id,
                "response": final_response,
                "workflow_summary": {
                    "total_stages": 4,
                    "stages_completed": 4,
                    "execution_strategy": analysis.get('execution_strategy', 'sequential'),
                    "agents_used": [agent.get('name', 'Unknown') for agent in agents],
                    "processing_time": time.time() - self.active_sessions.get(session_id, {}).get('start_time', time.time())
                },
                "analysis": analysis,
                "agent_selection": {
                    "total_available": len(agents),
                    "selected_agents": [agent.get('name', 'Unknown') for agent in agents],
                    "selection_reasoning": "LLM-driven agent discovery based on query analysis"
                },
                "execution_details": handoff_result.get('execution_details', {}),
                "observability_trace": handoff_result.get('trace', {}),
                "complete_data_flow": complete_data_flow,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"[{session_id}] ✅ Unified orchestration completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"[{session_id}] ❌ Orchestration failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "session_id": session_id,
                "stage": "unknown",
                "complete_data_flow": complete_data_flow
            }
        finally:
            # Clean up session
            if session_id in self.active_sessions:
                del self.active_sessions[session_id]
    
    async def _analyze_query_with_llm(self, query: str, session_id: str) -> Dict[str, Any]:
        """Stage 1: Use 6-stage LLM analysis"""
        try:
            logger.info(f"[{session_id}] 🔍 Performing 6-stage LLM analysis")
            
            # Create comprehensive analysis prompt
            analysis_prompt = f"""You are an advanced AI orchestrator. Analyze this user query using a 6-stage approach:

QUERY: "{query}"

Provide analysis in this JSON format:
{{
    "stage_1_query_analysis": {{
        "user_intent": "what the user wants to achieve",
        "domain": "primary domain (math, creative, technical, etc.)",
        "complexity": "simple|moderate|complex",
        "required_expertise": ["list of expertise areas needed"],
        "context_requirements": "what context is needed"
    }},
    "stage_2_sequence_definition": {{
        "workflow_steps": [
            {{"step": 1, "task": "first task", "required_expertise": "skills needed"}},
            {{"step": 2, "task": "second task", "required_expertise": "skills needed"}}
        ],
        "execution_flow": "how tasks should be executed"
    }},
    "stage_3_execution_strategy": {{
        "strategy": "single|sequential|parallel",
        "reasoning": "why this strategy is best",
        "estimated_duration": "estimated time in seconds"
    }},
    "stage_4_agent_analysis": {{
        "agent_requirements": [
            {{"capability": "mathematics", "priority": "high", "reasoning": "needed for calculations"}},
            {{"capability": "creative_writing", "priority": "medium", "reasoning": "needed for creative content"}}
        ]
    }},
    "stage_5_agent_matching": {{
        "matching_criteria": "how to match agents to tasks",
        "preferred_agent_types": ["calculator", "creative_assistant"]
    }},
    "stage_6_orchestration_plan": {{
        "final_strategy": "sequential",
        "agent_sequence": "calculator -> creative_assistant",
        "confidence": 0.9,
        "success_criteria": "how to measure success"
    }}
}}"""

            # Call LLM for analysis
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": self.orchestrator_model,
                    "prompt": analysis_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.2,
                        "top_p": 0.9,
                        "max_tokens": 2000
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                llm_response = result.get('response', '').strip()
                
                # Parse JSON response
                try:
                    # Extract JSON from response
                    import re
                    json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
                    if json_match:
                        json_text = json_match.group()
                        analysis = json.loads(json_text)
                        
                        logger.info(f"[{session_id}] ✅ 6-stage analysis completed")
                        return {
                            "success": True,
                            "analysis": analysis,
                            "execution_strategy": analysis.get('stage_3_execution_strategy', {}).get('strategy', 'sequential'),
                            "confidence": analysis.get('stage_6_orchestration_plan', {}).get('confidence', 0.8)
                        }
                    else:
                        raise ValueError("No JSON found in LLM response")
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"[{session_id}] Failed to parse LLM analysis: {e}")
                    # Fallback to simple analysis
                    return self._fallback_analysis(query, session_id)
            else:
                logger.error(f"[{session_id}] LLM analysis failed: {response.status_code}")
                return self._fallback_analysis(query, session_id)
                
        except Exception as e:
            logger.error(f"[{session_id}] Error in LLM analysis: {e}")
            return self._fallback_analysis(query, session_id)
    
    def _fallback_analysis(self, query: str, session_id: str) -> Dict[str, Any]:
        """Fallback analysis when LLM fails"""
        query_lower = query.lower()
        
        # Simple rule-based analysis
        if any(word in query_lower for word in ['calculate', 'solve', 'math', 'x', '×', '+', '-', '/']):
            if any(word in query_lower for word in ['poem', 'write', 'story', 'creative']):
                return {
                    "success": True,
                    "analysis": {
                        "stage_1_query_analysis": {
                            "user_intent": "mathematical calculation followed by creative writing",
                            "domain": "math_and_creative",
                            "complexity": "moderate"
                        },
                        "stage_3_execution_strategy": {
                            "strategy": "sequential",
                            "reasoning": "Math must be done before creative writing"
                        }
                    },
                    "execution_strategy": "sequential",
                    "confidence": 0.7
                }
            else:
                return {
                    "success": True,
                    "analysis": {
                        "stage_1_query_analysis": {
                            "user_intent": "mathematical calculation",
                            "domain": "mathematics",
                            "complexity": "simple"
                        },
                        "stage_3_execution_strategy": {
                            "strategy": "single",
                            "reasoning": "Single mathematical task"
                        }
                    },
                    "execution_strategy": "single",
                    "confidence": 0.8
                }
        else:
            return {
                "success": True,
                "analysis": {
                    "stage_1_query_analysis": {
                        "user_intent": "general assistance",
                        "domain": "general",
                        "complexity": "simple"
                    },
                    "stage_3_execution_strategy": {
                        "strategy": "single",
                        "reasoning": "General assistance task"
                    }
                },
                "execution_strategy": "single",
                "confidence": 0.6
            }
    
    async def _convert_agent_names_to_objects(self, agent_names: List[str], session_id: str) -> List[Dict[str, Any]]:
        """Convert agent names to agent objects"""
        try:
            logger.info(f"[{session_id}] Converting agent names to objects: {agent_names}")
            
            # Get agents from Strands SDK first
            response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=10)
            if response.status_code == 200:
                strands_data = response.json()
                available_agents = strands_data.get('agents', [])
                
                # Convert agent names to objects
                agent_objects = []
                for agent_name in agent_names:
                    # Find matching agent in Strands SDK
                    matching_agent = next((a for a in available_agents if a.get('name', '').lower() == agent_name.lower()), None)
                    if matching_agent:
                        agent_objects.append(matching_agent)
                        logger.info(f"[{session_id}] Found Strands SDK agent: {agent_name}")
                    else:
                        # Fallback to A2A agents
                        a2a_response = requests.get("http://localhost:5008/api/a2a/agents", timeout=10)
                        if a2a_response.status_code == 200:
                            a2a_data = a2a_response.json()
                            a2a_agents = a2a_data.get('agents', [])
                            matching_a2a_agent = next((a for a in a2a_agents if a.get('name', '').lower() == agent_name.lower()), None)
                            if matching_a2a_agent:
                                # Convert A2A agent to Strands SDK format
                                agent_objects.append({
                                    "id": matching_a2a_agent.get('id', ''),
                                    "name": matching_a2a_agent.get('name', ''),
                                    "description": matching_a2a_agent.get('description', ''),
                                    "capabilities": matching_a2a_agent.get('capabilities', []),
                                    "status": "active"
                                })
                                logger.info(f"[{session_id}] Found A2A agent: {agent_name}")
                
                logger.info(f"[{session_id}] Converted {len(agent_objects)} agents from names")
                return agent_objects
            else:
                logger.error(f"[{session_id}] Failed to get agents from Strands SDK: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"[{session_id}] Error converting agent names: {e}")
            return []

    async def _discover_agents(self, analysis: Dict[str, Any], session_id: str) -> List[Dict[str, Any]]:
        """Stage 2: Dynamic agent discovery using Strands SDK"""
        try:
            logger.info(f"[{session_id}] 🔍 Discovering available agents")
            
            # Get agents from Strands SDK (which has the correct IDs for execution)
            response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=10)
            
            if response.status_code == 200:
                strands_data = response.json()
                available_agents = strands_data.get('agents', [])
                
                logger.info(f"[{session_id}] Found {len(available_agents)} Strands SDK agents")
                
                # If no Strands SDK agents, use A2A agents directly
                if len(available_agents) == 0:
                    logger.info(f"[{session_id}] No Strands SDK agents, using A2A agents directly")
                    a2a_response = requests.get("http://localhost:5008/api/a2a/agents", timeout=10)
                    if a2a_response.status_code == 200:
                        a2a_data = a2a_response.json()
                        a2a_agents = a2a_data.get('agents', [])
                        logger.info(f"[{session_id}] Found {len(a2a_agents)} A2A agents")
                        
                        # Convert A2A agents to the format expected by the orchestrator
                        for a2a_agent in a2a_agents:
                            available_agents.append({
                                'id': a2a_agent.get('id', ''),
                                'name': a2a_agent.get('name', ''),
                                'description': a2a_agent.get('description', ''),
                                'capabilities': a2a_agent.get('capabilities', []),
                                'tools': a2a_agent.get('capabilities', []),
                                'model': a2a_agent.get('model', 'unknown'),
                                'system_prompt': f"You are {a2a_agent.get('name', 'an AI assistant')}. {a2a_agent.get('description', '')}"
                            })
                
                logger.info(f"[{session_id}] Found {len(available_agents)} available agents")
                
                # Use intelligent agent selection based on analysis
                selected_agents = self._select_agents_intelligently(analysis, available_agents, session_id)
                
                logger.info(f"[{session_id}] Selected {len(selected_agents)} agents: {[a.get('name', 'Unknown') for a in selected_agents]}")
                return selected_agents
            else:
                logger.error(f"[{session_id}] Failed to get agents from Strands SDK: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"[{session_id}] Error discovering agents: {e}")
            return []
    
    def _select_agents_intelligently(self, analysis: Dict[str, Any], available_agents: List[Dict[str, Any]], session_id: str) -> List[Dict[str, Any]]:
        """Intelligent agent selection based on analysis"""
        try:
            # Extract requirements from analysis
            analysis_data = analysis.get('analysis', {})
            stage_1 = analysis_data.get('stage_1_query_analysis', {})
            stage_4 = analysis_data.get('stage_4_agent_analysis', {})
            
            domain = stage_1.get('domain', 'general')
            complexity = stage_1.get('complexity', 'simple')
            required_expertise = stage_1.get('required_expertise', [])
            
            logger.info(f"[{session_id}] Selecting agents for domain: {domain}, complexity: {complexity}")
            
            # Rule-based agent selection
            selected_agents = []
            
            # Check for telecommunications/network analysis tasks
            if any(keyword in domain.lower() for keyword in ['telecommunications', 'network', 'ran', 'prb', 'churn']):
                # Find RAN agent first
                ran_agent = next((a for a in available_agents if 'ran' in a.get('name', '').lower()), None)
                if ran_agent:
                    selected_agents.append(ran_agent)
                
                # Find churn agent second
                churn_agent = next((a for a in available_agents if 'churn' in a.get('name', '').lower()), None)
                if churn_agent:
                    selected_agents.append(churn_agent)
            
            # Check for math + creative tasks
            elif domain == 'math_and_creative' or ('math' in domain.lower() and 'creative' in domain.lower()):
                # Find math agent first
                math_agent = next((a for a in available_agents if 'math' in a.get('name', '').lower()), None)
                if math_agent:
                    selected_agents.append(math_agent)
                
                # Find creative agent second
                creative_agent = next((a for a in available_agents if 'creative' in a.get('name', '').lower()), None)
                if creative_agent:
                    selected_agents.append(creative_agent)
            
            # Check for pure math tasks
            elif 'math' in domain.lower():
                math_agent = next((a for a in available_agents if 'math' in a.get('name', '').lower()), None)
                if math_agent:
                    selected_agents.append(math_agent)
            
            # Check for creative tasks
            elif 'creative' in domain.lower():
                creative_agent = next((a for a in available_agents if 'creative' in a.get('name', '').lower()), None)
                if creative_agent:
                    selected_agents.append(creative_agent)
            
            # Fallback: select first available agents
            if not selected_agents:
                selected_agents = available_agents[:2]
            
            return selected_agents
            
        except Exception as e:
            logger.error(f"[{session_id}] Error in intelligent agent selection: {e}")
            return available_agents[:2]  # Fallback
    
    async def _execute_handoffs_with_data_visibility(self, query: str, agents: List[Dict[str, Any]], analysis: Dict[str, Any], session_id: str, complete_data_flow: Dict[str, Any]) -> Dict[str, Any]:
        """Execute handoffs with complete data visibility tracking"""
        try:
            logger.info(f"[{session_id}] 🤝 Executing A2A handoffs with complete data visibility")
            
            execution_strategy = analysis.get('execution_strategy', 'sequential')
            
            if execution_strategy == 'sequential' and len(agents) > 1:
                return await self._execute_sequential_handoffs_with_data_visibility(query, agents, session_id, complete_data_flow)
            else:
                return await self._execute_single_agent_with_data_visibility(query, agents[0] if agents else None, session_id, complete_data_flow)
                
        except Exception as e:
            logger.error(f"[{session_id}] Error executing handoffs: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def _execute_handoffs(self, query: str, agents: List[Dict[str, Any]], analysis: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Stage 3: Execute intelligent A2A handoffs"""
        try:
            logger.info(f"[{session_id}] 🤝 Executing A2A handoffs with {len(agents)} agents")
            
            execution_strategy = analysis.get('execution_strategy', 'sequential')
            
            if execution_strategy == 'sequential' and len(agents) > 1:
                return await self._execute_sequential_handoffs(query, agents, session_id)
            else:
                return await self._execute_single_agent(query, agents[0] if agents else None, session_id)
                
        except Exception as e:
            logger.error(f"[{session_id}] Error executing handoffs: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _execute_sequential_handoffs_with_data_visibility(self, query: str, agents: List[Dict[str, Any]], session_id: str, complete_data_flow: Dict[str, Any]) -> Dict[str, Any]:
        """Execute sequential A2A handoffs with complete data visibility tracking"""
        try:
            logger.info(f"[{session_id}] 🔄 Starting sequential handoffs with complete data visibility")
            
            handoff_results = []
            current_context = query
            total_handoffs = 0
            
            for i, agent in enumerate(agents):
                # HANDOFF 1: Orchestrator → Agent
                handoff_number = (i * 2) + 1
                total_handoffs += 1
                
                logger.info(f"[{session_id}] Handoff {handoff_number}: Orchestrator → {agent.get('name', 'Unknown')}")
                
                # Prepare agent input
                agent_input = self._prepare_agent_input(agent, i+1, query, current_context)
                
                # Track data exchange: Orchestrator → Agent
                data_exchange_1 = {
                    "handoff_number": handoff_number,
                    "direction": "Orchestrator → Agent",
                    "from": "System Orchestrator",
                    "to": agent.get('name', 'Unknown'),
                    "agent_id": agent['id'],
                    "data_sent": agent_input,
                    "data_length": len(agent_input),
                    "timestamp": datetime.now().isoformat(),
                    "step": i + 1
                }
                complete_data_flow["data_exchanges"].append(data_exchange_1)
                
                # Execute agent through Strands SDK
                start_time = time.time()
                try:
                    response = requests.post(
                        f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent['id']}/execute",
                        json={"input": agent_input, "stream": False, "show_thinking": True},
                        timeout=120
                    )
                    
                    if response.status_code == 200:
                        result_data = response.json()
                        execution_time = time.time() - start_time
                        
                        if result_data.get('success'):
                            agent_response = result_data.get('response', '')
                            
                            # Clean agent response
                            cleaned_response = self._clean_agent_response(agent_response)
                            
                            # HANDOFF 2: Agent → Orchestrator
                            handoff_number = (i * 2) + 2
                            total_handoffs += 1
                            
                            logger.info(f"[{session_id}] Handoff {handoff_number}: {agent.get('name', 'Unknown')} → Orchestrator")
                            
                            # Track data exchange: Agent → Orchestrator
                            data_exchange_2 = {
                                "handoff_number": handoff_number,
                                "direction": "Agent → Orchestrator",
                                "from": agent.get('name', 'Unknown'),
                                "to": "System Orchestrator",
                                "agent_id": agent['id'],
                                "raw_data_received": agent_response,
                                "cleaned_data_received": cleaned_response,
                                "raw_data_length": len(agent_response),
                                "cleaned_data_length": len(cleaned_response),
                                "execution_time": execution_time,
                                "timestamp": datetime.now().isoformat(),
                                "step": i + 1
                            }
                            complete_data_flow["data_exchanges"].append(data_exchange_2)
                            
                            # Orchestrator processes agent output
                            orchestrator_processing = self._orchestrator_process_agent_output_with_tracking(
                                agent_response, cleaned_response, agent.get('name', 'Unknown'), session_id, complete_data_flow
                            )
                            
                            handoff_results.append({
                                "handoff_number": handoff_number - 1,
                                "direction": "Orchestrator → Agent",
                                "agent_name": agent.get('name', 'Unknown'),
                                "agent_id": agent['id'],
                                "step": i + 1,
                                "input": agent_input,
                                "raw_output": agent_response,
                                "cleaned_output": cleaned_response,
                                "execution_time": execution_time,
                                "status": "success"
                            })
                            
                            handoff_results.append({
                                "handoff_number": handoff_number,
                                "direction": "Agent → Orchestrator",
                                "agent_name": agent.get('name', 'Unknown'),
                                "agent_id": agent['id'],
                                "step": i + 1,
                                "orchestrator_processing": orchestrator_processing,
                                "status": "success"
                            })
                            
                            # Update context for next agent (orchestrator processed)
                            current_context = orchestrator_processing.get('processed_context', cleaned_response)
                            
                            logger.info(f"[{session_id}] Handoff {handoff_number-1} completed successfully in {execution_time:.2f}s")
                            logger.info(f"[{session_id}] Handoff {handoff_number} completed successfully")
                        else:
                            error_msg = result_data.get('error', 'Unknown error')
                            logger.error(f"[{session_id}] Handoff {handoff_number-1} failed: {error_msg}")
                            
                            handoff_results.append({
                                "handoff_number": handoff_number - 1,
                                "direction": "Orchestrator → Agent",
                                "agent_name": agent.get('name', 'Unknown'),
                                "agent_id": agent['id'],
                                "step": i + 1,
                                "error": error_msg,
                                "status": "failed"
                            })
                    else:
                        error_msg = f"HTTP {response.status_code}"
                        logger.error(f"[{session_id}] Handoff {handoff_number-1} HTTP error: {response.status_code}")
                        
                        handoff_results.append({
                            "handoff_number": handoff_number - 1,
                            "direction": "Orchestrator → Agent",
                            "agent_name": agent.get('name', 'Unknown'),
                            "agent_id": agent['id'],
                            "step": i + 1,
                            "error": error_msg,
                            "status": "failed"
                        })
                
                except Exception as e:
                    error_msg = str(e)
                    logger.error(f"[{session_id}] Handoff {handoff_number-1} exception: {e}")
                    
                    handoff_results.append({
                        "handoff_number": handoff_number - 1,
                        "direction": "Orchestrator → Agent",
                        "agent_name": agent.get('name', 'Unknown'),
                        "agent_id": agent['id'],
                        "step": i + 1,
                        "error": error_msg,
                        "status": "failed"
                    })
            
            # Track all handoffs in complete data flow
            complete_data_flow["handoffs"] = handoff_results
            
            # Check if we had any successful steps
            successful_handoffs = [r for r in handoff_results if r.get("status") == "success"]
            successful_agent_handoffs = [r for r in successful_handoffs if r.get("direction") == "Orchestrator → Agent"]
            
            if successful_agent_handoffs:
                # Combine successful responses
                combined_response = "\n\n".join([
                    f"**{step['agent_name']} (Step {step['step']}):**\n{step['cleaned_output']}"
                    for step in successful_agent_handoffs
                ])
                
                return {
                    "success": True,
                    "orchestrator_response": combined_response,
                    "handoff_steps": handoff_results,
                    "total_handoffs": total_handoffs,
                    "successful_handoffs": len(successful_handoffs),
                    "successful_agent_handoffs": len(successful_agent_handoffs),
                    "execution_details": {
                        "strategy": "sequential_with_orchestrator_control",
                        "total_agents": len(agents),
                        "successful_agents": len(successful_agent_handoffs),
                        "total_execution_time": sum(step.get('execution_time', 0) for step in successful_agent_handoffs)
                    }
                }
            else:
                return {
                    "success": False,
                    "error": "All agent executions failed",
                    "handoff_steps": handoff_results,
                    "total_handoffs": total_handoffs
                }
                
        except Exception as e:
            logger.error(f"[{session_id}] Error in sequential handoffs: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def _execute_sequential_handoffs(self, query: str, agents: List[Dict[str, Any]], session_id: str) -> Dict[str, Any]:
        """Execute sequential A2A handoffs with explicit orchestrator handoffs"""
        try:
            logger.info(f"[{session_id}] 🔄 Starting sequential handoffs with orchestrator control")
            
            handoff_results = []
            current_context = query
            total_handoffs = 0
            
            for i, agent in enumerate(agents):
                # HANDOFF 1: Orchestrator → Agent
                handoff_number = (i * 2) + 1
                total_handoffs += 1
                
                logger.info(f"[{session_id}] Handoff {handoff_number}: Orchestrator → {agent.get('name', 'Unknown')}")
                
                # Prepare agent input
                agent_input = self._prepare_agent_input(agent, i+1, query, current_context)
                
                # Execute agent through Strands SDK
                start_time = time.time()
                try:
                    response = requests.post(
                        f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent['id']}/execute",
                        json={"input": agent_input, "stream": False, "show_thinking": True},
                        timeout=120
                    )
                    
                    if response.status_code == 200:
                        result_data = response.json()
                        execution_time = time.time() - start_time
                        
                        if result_data.get('success'):
                            agent_response = result_data.get('response', '')
                            
                            # Clean agent response
                            cleaned_response = self._clean_agent_response(agent_response)
                            
                            # HANDOFF 2: Agent → Orchestrator
                            handoff_number = (i * 2) + 2
                            total_handoffs += 1
                            
                            logger.info(f"[{session_id}] Handoff {handoff_number}: {agent.get('name', 'Unknown')} → Orchestrator")
                            
                            # Orchestrator processes agent output
                            orchestrator_processing = self._orchestrator_process_agent_output(
                                agent_response, cleaned_response, agent.get('name', 'Unknown'), session_id
                            )
                            
                            handoff_results.append({
                                "handoff_number": handoff_number - 1,
                                "direction": "Orchestrator → Agent",
                                "agent_name": agent.get('name', 'Unknown'),
                                "agent_id": agent['id'],
                                "step": i + 1,
                                "input": agent_input,
                                "raw_output": agent_response,
                                "cleaned_output": cleaned_response,
                                "execution_time": execution_time,
                                "status": "success"
                            })
                            
                            handoff_results.append({
                                "handoff_number": handoff_number,
                                "direction": "Agent → Orchestrator",
                                "agent_name": agent.get('name', 'Unknown'),
                                "agent_id": agent['id'],
                                "step": i + 1,
                                "orchestrator_processing": orchestrator_processing,
                                "status": "success"
                            })
                            
                            # Update context for next agent (orchestrator processed)
                            current_context = orchestrator_processing.get('processed_context', cleaned_response)
                            
                            logger.info(f"[{session_id}] Handoff {handoff_number-1} completed successfully in {execution_time:.2f}s")
                            logger.info(f"[{session_id}] Handoff {handoff_number} completed successfully")
                        else:
                            error_msg = result_data.get('error', 'Unknown error')
                            logger.error(f"[{session_id}] Handoff {handoff_number-1} failed: {error_msg}")
                            
                            handoff_results.append({
                                "handoff_number": handoff_number - 1,
                                "direction": "Orchestrator → Agent",
                                "agent_name": agent.get('name', 'Unknown'),
                                "agent_id": agent['id'],
                                "step": i + 1,
                                "error": error_msg,
                                "status": "failed"
                            })
                    else:
                        error_msg = f"HTTP {response.status_code}"
                        logger.error(f"[{session_id}] Handoff {handoff_number-1} HTTP error: {response.status_code}")
                        
                        handoff_results.append({
                            "handoff_number": handoff_number - 1,
                            "direction": "Orchestrator → Agent",
                            "agent_name": agent.get('name', 'Unknown'),
                            "agent_id": agent['id'],
                            "step": i + 1,
                            "error": error_msg,
                            "status": "failed"
                        })
                
                except Exception as e:
                    error_msg = str(e)
                    logger.error(f"[{session_id}] Handoff {handoff_number-1} exception: {e}")
                    
                    handoff_results.append({
                        "handoff_number": handoff_number - 1,
                        "direction": "Orchestrator → Agent",
                        "agent_name": agent.get('name', 'Unknown'),
                        "agent_id": agent['id'],
                        "step": i + 1,
                        "error": error_msg,
                        "status": "failed"
                    })
            
            # Check if we had any successful steps
            successful_handoffs = [r for r in handoff_results if r.get("status") == "success"]
            successful_agent_handoffs = [r for r in successful_handoffs if r.get("direction") == "Orchestrator → Agent"]
            
            if successful_agent_handoffs:
                # Combine successful responses
                combined_response = "\n\n".join([
                    f"**{step['agent_name']} (Step {step['step']}):**\n{step['cleaned_output']}"
                    for step in successful_agent_handoffs
                ])
                
                return {
                    "success": True,
                    "orchestrator_response": combined_response,
                    "handoff_steps": handoff_results,
                    "total_handoffs": total_handoffs,
                    "successful_handoffs": len(successful_handoffs),
                    "successful_agent_handoffs": len(successful_agent_handoffs),
                    "execution_details": {
                        "strategy": "sequential_with_orchestrator_control",
                        "total_agents": len(agents),
                        "successful_agents": len(successful_agent_handoffs),
                        "total_execution_time": sum(step.get('execution_time', 0) for step in successful_agent_handoffs)
                    }
                }
            else:
                return {
                    "success": False,
                    "error": "All agent executions failed",
                    "handoff_steps": handoff_results,
                    "total_handoffs": total_handoffs
                }
                
        except Exception as e:
            logger.error(f"[{session_id}] Error in sequential handoffs: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _orchestrator_process_agent_output_with_tracking(self, raw_output: str, cleaned_output: str, agent_name: str, session_id: str, complete_data_flow: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrator processes agent output with complete data tracking"""
        try:
            logger.info(f"[{session_id}] 🧠 Orchestrator processing output from {agent_name}")
            
            # Orchestrator analysis of agent output
            processing_analysis = {
                "agent_name": agent_name,
                "output_length": len(cleaned_output),
                "quality_assessment": "high" if len(cleaned_output) > 1000 else "medium",
                "content_analysis": {
                    "has_technical_details": any(keyword in cleaned_output.lower() for keyword in ['ran', 'prb', 'utilization', 'threshold', 'churn']),
                    "has_recommendations": any(keyword in cleaned_output.lower() for keyword in ['recommend', 'suggest', 'should', 'threshold']),
                    "is_structured": any(keyword in cleaned_output.lower() for keyword in ['1.', '2.', '3.', '•', '-', '**'])
                },
                "context_preparation": "ready_for_next_agent" if len(cleaned_output) > 500 else "needs_enhancement"
            }
            
            # Prepare processed context for next agent
            processed_context = f"Previous Agent Analysis ({agent_name}):\n{cleaned_output}"
            
            # Track orchestrator processing
            orchestrator_processing_record = {
                "agent_name": agent_name,
                "raw_input": raw_output,
                "cleaned_input": cleaned_output,
                "processing_analysis": processing_analysis,
                "processed_context": processed_context,
                "orchestrator_notes": f"Processed {agent_name} output for next agent handoff",
                "timestamp": datetime.now().isoformat()
            }
            complete_data_flow["orchestrator_processing"].append(orchestrator_processing_record)
            
            return {
                "processing_analysis": processing_analysis,
                "processed_context": processed_context,
                "orchestrator_notes": f"Processed {agent_name} output for next agent handoff"
            }
            
        except Exception as e:
            logger.error(f"[{session_id}] Error processing agent output: {e}")
            return {
                "processing_analysis": {"error": str(e)},
                "processed_context": cleaned_output,
                "orchestrator_notes": "Fallback processing due to error"
            }

    def _orchestrator_process_agent_output(self, raw_output: str, cleaned_output: str, agent_name: str, session_id: str) -> Dict[str, Any]:
        """Orchestrator processes agent output and prepares context for next agent"""
        try:
            logger.info(f"[{session_id}] 🧠 Orchestrator processing output from {agent_name}")
            
            # Orchestrator analysis of agent output
            processing_analysis = {
                "agent_name": agent_name,
                "output_length": len(cleaned_output),
                "quality_assessment": "high" if len(cleaned_output) > 1000 else "medium",
                "content_analysis": {
                    "has_technical_details": any(keyword in cleaned_output.lower() for keyword in ['ran', 'prb', 'utilization', 'threshold', 'churn']),
                    "has_recommendations": any(keyword in cleaned_output.lower() for keyword in ['recommend', 'suggest', 'should', 'threshold']),
                    "is_structured": any(keyword in cleaned_output.lower() for keyword in ['1.', '2.', '3.', '•', '-', '**'])
                },
                "context_preparation": "ready_for_next_agent" if len(cleaned_output) > 500 else "needs_enhancement"
            }
            
            # Prepare processed context for next agent
            processed_context = f"Previous Agent Analysis ({agent_name}):\n{cleaned_output}"
            
            return {
                "processing_analysis": processing_analysis,
                "processed_context": processed_context,
                "orchestrator_notes": f"Processed {agent_name} output for next agent handoff"
            }
            
        except Exception as e:
            logger.error(f"[{session_id}] Error processing agent output: {e}")
            return {
                "processing_analysis": {"error": str(e)},
                "processed_context": cleaned_output,
                "orchestrator_notes": "Fallback processing due to error"
            }
    
    async def _execute_single_agent_with_data_visibility(self, query: str, agent: Optional[Dict[str, Any]], session_id: str, complete_data_flow: Dict[str, Any]) -> Dict[str, Any]:
        """Execute single agent with complete data visibility tracking"""
        if not agent:
            return {
                "success": False,
                "error": "No agent available"
            }
        
        try:
            logger.info(f"[{session_id}] 🎯 Executing single agent with data tracking: {agent.get('name', 'Unknown')}")
            
            # Track data exchange: Orchestrator → Agent
            data_exchange = {
                "handoff_number": 1,
                "direction": "Orchestrator → Agent",
                "from": "System Orchestrator",
                "to": agent.get('name', 'Unknown'),
                "agent_id": agent['id'],
                "data_sent": query,
                "data_length": len(query),
                "timestamp": datetime.now().isoformat(),
                "step": 1
            }
            complete_data_flow["data_exchanges"].append(data_exchange)
            
            start_time = time.time()
            response = requests.post(
                f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent['id']}/execute",
                json={"input": query, "stream": False, "show_thinking": True},
                timeout=120
            )
            
            if response.status_code == 200:
                result_data = response.json()
                execution_time = time.time() - start_time
                
                if result_data.get('success'):
                    agent_response = result_data.get('response', '')
                    cleaned_response = self._clean_agent_response(agent_response)
                    
                    # Track data exchange: Agent → Orchestrator
                    data_exchange_return = {
                        "handoff_number": 2,
                        "direction": "Agent → Orchestrator",
                        "from": agent.get('name', 'Unknown'),
                        "to": "System Orchestrator",
                        "agent_id": agent['id'],
                        "raw_data_received": agent_response,
                        "cleaned_data_received": cleaned_response,
                        "raw_data_length": len(agent_response),
                        "cleaned_data_length": len(cleaned_response),
                        "execution_time": execution_time,
                        "timestamp": datetime.now().isoformat(),
                        "step": 1
                    }
                    complete_data_flow["data_exchanges"].append(data_exchange_return)
                    
                    return {
                        "success": True,
                        "orchestrator_response": cleaned_response,
                        "execution_details": {
                            "strategy": "single",
                            "agent_name": agent.get('name', 'Unknown'),
                            "execution_time": execution_time
                        }
                    }
                else:
                    return {
                        "success": False,
                        "error": result_data.get('error', 'Unknown error')
                    }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"[{session_id}] Error executing single agent: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def _execute_single_agent(self, query: str, agent: Optional[Dict[str, Any]], session_id: str) -> Dict[str, Any]:
        """Execute single agent"""
        if not agent:
            return {
                "success": False,
                "error": "No agent available"
            }
        
        try:
            logger.info(f"[{session_id}] 🎯 Executing single agent: {agent.get('name', 'Unknown')}")
            
            start_time = time.time()
            response = requests.post(
                f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent['id']}/execute",
                json={"input": query, "stream": False, "show_thinking": True},
                timeout=120
            )
            
            if response.status_code == 200:
                result_data = response.json()
                execution_time = time.time() - start_time
                
                if result_data.get('success'):
                    agent_response = result_data.get('response', '')
                    cleaned_response = self._clean_agent_response(agent_response)
                    
                    return {
                        "success": True,
                        "orchestrator_response": cleaned_response,
                        "execution_details": {
                            "strategy": "single",
                            "agent_name": agent.get('name', 'Unknown'),
                            "execution_time": execution_time
                        }
                    }
                else:
                    return {
                        "success": False,
                        "error": result_data.get('error', 'Unknown error')
                    }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"[{session_id}] Error executing single agent: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _prepare_agent_input(self, agent: Dict[str, Any], step_number: int, query: str, previous_output: str = None) -> str:
        """Prepare clean, direct input for agent - exactly like direct queries"""
        agent_name = agent.get('name', 'Unknown Agent')
        
        if step_number == 1:
            # First agent gets the EXACT same query as direct calls
            return query
        else:
            # Subsequent agents get simple context without complex instructions
            if previous_output:
                return f"Based on the previous analysis, {query}"
            else:
                return query
    
    def _clean_agent_response(self, response: str) -> str:
        """Clean agent response - return the FULL response including complete content"""
        if not response:
            return response
        
        # For now, return the full response without cleaning to get complete content
        # The agent is generating complete responses, we just need to extract them properly
        import re
        
        # Remove only the thinking tags but keep all the actual content
        cleaned = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL | re.IGNORECASE)
        
        # Remove other processing tags
        cleaned = re.sub(r'<reasoning>.*?</reasoning>', '', cleaned, flags=re.DOTALL | re.IGNORECASE)
        cleaned = re.sub(r'<analysis>.*?</analysis>', '', cleaned, flags=re.DOTALL | re.IGNORECASE)
        
        # Clean up extra whitespace but preserve structure
        cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)
        cleaned = cleaned.strip()
        
        return cleaned
    
    async def _synthesize_clean_response_with_tracking(self, handoff_result: Dict[str, Any], session_id: str, complete_data_flow: Dict[str, Any]) -> str:
        """Stage 4: Synthesize and clean final response with complete data tracking"""
        try:
            logger.info(f"[{session_id}] ✨ Synthesizing clean response with data tracking")
            
            raw_response = handoff_result.get('orchestrator_response', '')
            
            if not raw_response:
                return "No response generated"
            
            # Track final synthesis input
            synthesis_input = {
                "raw_response": raw_response,
                "response_length": len(raw_response),
                "handoff_result": handoff_result,
                "timestamp": datetime.now().isoformat()
            }
            
            # Use the same frontend cleaning logic for final response
            cleaned_response = self._clean_agent_response(raw_response)
            
            logger.info(f"[{session_id}] ✅ Response cleaned using frontend logic: {len(raw_response)} -> {len(cleaned_response)} chars")
            
            # Track final synthesis output
            synthesis_output = {
                "cleaned_response": cleaned_response,
                "original_length": len(raw_response),
                "cleaned_length": len(cleaned_response),
                "compression_ratio": len(cleaned_response) / len(raw_response) if len(raw_response) > 0 else 0,
                "timestamp": datetime.now().isoformat()
            }
            
            # Store complete final synthesis data
            complete_data_flow["final_synthesis"] = {
                "input": synthesis_input,
                "output": synthesis_output,
                "processing_notes": "Final response synthesis and cleaning completed"
            }
            
            return cleaned_response
                
        except Exception as e:
            logger.error(f"[{session_id}] Error synthesizing response: {e}")
            return handoff_result.get('orchestrator_response', 'Response synthesis failed')

    async def _synthesize_clean_response(self, handoff_result: Dict[str, Any], session_id: str) -> str:
        """Stage 4: Synthesize and clean final response"""
        try:
            logger.info(f"[{session_id}] ✨ Synthesizing clean response")
            
            raw_response = handoff_result.get('orchestrator_response', '')
            
            if not raw_response:
                return "No response generated"
            
            # Use the same frontend cleaning logic for final response
            cleaned_response = self._clean_agent_response(raw_response)
            
            logger.info(f"[{session_id}] ✅ Response cleaned using frontend logic: {len(raw_response)} -> {len(cleaned_response)} chars")
            return cleaned_response
                
        except Exception as e:
            logger.error(f"[{session_id}] Error synthesizing response: {e}")
            return handoff_result.get('orchestrator_response', 'Response synthesis failed')

# Global instance
unified_orchestrator = UnifiedSystemOrchestrator()
