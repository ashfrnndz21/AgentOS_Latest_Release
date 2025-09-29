#!/usr/bin/env python3
"""
Enhanced A2A Orchestrator
Implements comprehensive handoff flow with context management and agent self-cleaning
"""

import requests
import json
import time
import logging
from typing import List, Dict, Any, Optional
from a2a_observability import observability_engine, EventType
from text_cleaning_service import text_cleaning_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedA2AOrchestrator:
    """Enhanced orchestrator with comprehensive handoff flow"""
    
    def __init__(self):
        self.strands_sdk_url = "http://localhost:5006"
        self.a2a_service_url = "http://localhost:5008"
        
    def orchestrate(self, user_query: str, session_id: str) -> Dict[str, Any]:
        """
        Enhanced orchestration with comprehensive handoff flow
        
        Flow:
        1. Orchestrator analyzes query and breaks it down
        2. Selects appropriate agents based on relevance
        3. Each agent processes input and generates raw output
        4. Agent self-cleans its raw output based on handover context
        5. Orchestrator refines context for next agent
        6. Final orchestrator synthesis for user
        """
        
        with observability_engine.trace_orchestration(session_id, user_query) as trace:
            try:
                logger.info(f"[{session_id}] Starting enhanced A2A orchestration")
                
                # Step 1: Orchestrator Query Analysis & Breakdown
                logger.info(f"[{session_id}] Step 1: Orchestrator query analysis and breakdown")
                analysis_result = self._orchestrator_query_analysis(user_query, session_id)
                
                if not analysis_result.get('success'):
                    trace.error = "Orchestrator query analysis failed"
                    return analysis_result
                
                # Step 2: Agent Selection Based on Relevance
                logger.info(f"[{session_id}] Step 2: Agent selection based on relevance")
                selected_agents = self._select_agents_by_relevance(analysis_result, session_id)
                
                if not selected_agents:
                    trace.error = "No relevant agents found"
                    return {"success": False, "error": "No relevant agents found"}
                
                # Step 3: Sequential Agent Processing with Self-Cleaning
                logger.info(f"[{session_id}] Step 3: Sequential agent processing with self-cleaning")
                agent_results = self._process_agents_sequentially(
                    selected_agents, analysis_result, session_id
                )
                
                # Step 4: Final Orchestrator Synthesis
                logger.info(f"[{session_id}] Step 4: Final orchestrator synthesis")
                final_result = self._orchestrator_final_synthesis(
                    agent_results, analysis_result, session_id
                )
                
                # Store final response in trace
                trace.final_response = final_result.get('orchestrator_response', '')
                
                return final_result
                
            except Exception as e:
                logger.error(f"[{session_id}] Error in enhanced orchestration: {e}")
                trace.error = str(e)
                return {
                    "success": False,
                    "error": str(e),
                    "a2a_framework": False
                }
    
    def _orchestrator_query_analysis(self, user_query: str, session_id: str) -> Dict[str, Any]:
        """Orchestrator analyzes query and breaks it down"""
        
        # Log orchestrator analysis start
        observability_engine.log_event(
            session_id=session_id,
            event_type=EventType.ORCHESTRATOR_ANALYSIS,
            content="Starting orchestrator query analysis",
            metadata={"query": user_query}
        )
        
        try:
            # Call orchestrator LLM for query analysis
            analysis_prompt = f"""You are an A2A Orchestrator. Analyze this user query and break it down into actionable tasks.

User Query: {user_query}

Provide a JSON response with:
{{
    "query_breakdown": {{
        "primary_task": "Main task description",
        "subtasks": ["Task 1", "Task 2", "Task 3"],
        "required_capabilities": ["capability1", "capability2"],
        "execution_order": "sequential" or "parallel",
        "context_requirements": "What context each agent needs"
    }},
    "agent_requirements": [
        {{
            "agent_type": "math_agent",
            "task": "Calculate 3x456",
            "context_needed": "Mathematical calculation",
            "expected_output": "Numeric result"
        }}
    ],
    "handoff_strategy": {{
        "context_transfer_method": "How to pass context between agents",
        "output_refinement": "How to clean outputs for next agent"
    }}
}}"""

            response = requests.post(
                f"{self.strands_sdk_url}/api/query",
                json={
                    "query": analysis_prompt,
                    "model": "qwen3:1.7b",
                    "stream": False
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                raw_analysis = result.get('response', '')
                
                # Clean orchestrator analysis output
                cleaned_analysis = text_cleaning_service.clean_llm_output(
                    raw_analysis, "orchestrator_response"
                )
                
                # Parse JSON from cleaned analysis
                try:
                    import re
                    json_match = re.search(r'\{.*\}', cleaned_analysis, re.DOTALL)
                    if json_match:
                        analysis_data = json.loads(json_match.group())
                        
                        # Log successful analysis
                        observability_engine.log_event(
                            session_id=session_id,
                            event_type=EventType.ORCHESTRATOR_ANALYSIS,
                            content="Query analysis completed successfully",
                            metadata={
                                "analysis_data": analysis_data,
                                "cleaning_applied": True
                            }
                        )
                        
                        return {
                            "success": True,
                            "analysis": analysis_data,
                            "raw_analysis": raw_analysis,
                            "cleaned_analysis": cleaned_analysis
                        }
                    else:
                        raise Exception("No JSON found in orchestrator analysis")
                        
                except json.JSONDecodeError as e:
                    logger.error(f"[{session_id}] Failed to parse orchestrator analysis: {e}")
                    return {"success": False, "error": f"Analysis parsing failed: {e}"}
            else:
                return {"success": False, "error": f"Orchestrator analysis failed: {response.status_code}"}
                
        except Exception as e:
            logger.error(f"[{session_id}] Orchestrator analysis error: {e}")
            return {"success": False, "error": str(e)}
    
    def _select_agents_by_relevance(self, analysis_result: Dict[str, Any], session_id: str) -> List[Dict[str, Any]]:
        """Select agents based on relevance to the analyzed query"""
        
        # Log agent selection start
        observability_engine.log_event(
            session_id=session_id,
            event_type=EventType.AGENT_SELECTION,
            content="Starting agent selection based on relevance",
            metadata={"analysis": analysis_result.get('analysis', {})}
        )
        
        try:
            # Get available agents
            agents_response = requests.get(f"{self.a2a_service_url}/api/agents")
            if agents_response.status_code != 200:
                return []
            
            available_agents = agents_response.json().get('agents', [])
            analysis = analysis_result.get('analysis', {})
            agent_requirements = analysis.get('agent_requirements', [])
            
            selected_agents = []
            
            # Match agents to requirements
            for req in agent_requirements:
                agent_type = req.get('agent_type', '')
                task = req.get('task', '')
                
                # Find matching agent
                for agent in available_agents:
                    agent_name = agent.get('name', '').lower()
                    
                    # Simple matching logic (can be enhanced)
                    if ('math' in agent_type and 'math' in agent_name) or \
                       ('creative' in agent_type and 'creative' in agent_name) or \
                       ('technical' in agent_type and 'technical' in agent_name):
                        
                        selected_agents.append({
                            'name': agent.get('name'),
                            'id': agent.get('id'),
                            'task': task,
                            'context_needed': req.get('context_needed', ''),
                            'expected_output': req.get('expected_output', ''),
                            'agent_type': agent_type
                        })
                        break
            
            # Log agent selection results
            observability_engine.log_event(
                session_id=session_id,
                event_type=EventType.AGENT_SELECTION,
                content=f"Selected {len(selected_agents)} agents",
                metadata={"selected_agents": selected_agents}
            )
            
            return selected_agents
            
        except Exception as e:
            logger.error(f"[{session_id}] Agent selection error: {e}")
            return []
    
    def _process_agents_sequentially(self, agents: List[Dict[str, Any]], 
                                   analysis_result: Dict[str, Any], 
                                   session_id: str) -> List[Dict[str, Any]]:
        """Process agents sequentially with self-cleaning"""
        
        agent_results = []
        current_context = analysis_result.get('analysis', {}).get('query_breakdown', {})
        
        for i, agent in enumerate(agents):
            logger.info(f"[{session_id}] Processing agent {i+1}/{len(agents)}: {agent['name']}")
            
            # Start agent handoff
            handoff_id = observability_engine.start_agent_handoff(
                session_id=session_id,
                handoff_number=i+1,
                from_agent_id="orchestrator",
                from_agent_name="Orchestrator",
                to_agent_id=agent['id'],
                to_agent_name=agent['name'],
                context_transferred=current_context
            )
            
            try:
                # Step 3a: Agent processes input and generates raw output
                raw_output = self._agent_process_input(agent, current_context, session_id)
                
                # Step 3b: Agent self-cleans its raw output based on handover context
                cleaned_output = self._agent_self_clean(agent, raw_output, current_context, session_id)
                
                # Step 3c: Orchestrator refines context for next agent
                if i < len(agents) - 1:  # Not the last agent
                    current_context = self._orchestrator_refine_context(
                        cleaned_output, current_context, agents[i+1], session_id
                    )
                
                # Complete handoff
                observability_engine.complete_agent_handoff(
                    handoff_id=handoff_id,
                    output_received=cleaned_output,
                    tools_used=[]  # Will be updated based on actual tool usage
                )
                
                agent_results.append({
                    'agent_name': agent['name'],
                    'agent_id': agent['id'],
                    'task': agent['task'],
                    'raw_output': raw_output,
                    'cleaned_output': cleaned_output,
                    'context_refined': current_context,
                    'success': True
                })
                
                logger.info(f"[{session_id}] Agent {agent['name']} completed successfully")
                
            except Exception as e:
                logger.error(f"[{session_id}] Agent {agent['name']} failed: {e}")
                
                # Complete handoff with error
                observability_engine.complete_agent_handoff(
                    handoff_id=handoff_id,
                    output_received="",
                    error=str(e)
                )
                
                agent_results.append({
                    'agent_name': agent['name'],
                    'agent_id': agent['id'],
                    'task': agent['task'],
                    'error': str(e),
                    'success': False
                })
        
        return agent_results
    
    def _agent_process_input(self, agent: Dict[str, Any], context: Dict[str, Any], 
                           session_id: str) -> str:
        """Agent processes input and generates raw output"""
        
        # Log agent processing start
        observability_engine.log_event(
            session_id=session_id,
            event_type=EventType.AGENT_EXECUTION,
            agent_id=agent['id'],
            agent_name=agent['name'],
            content=f"Processing task: {agent['task']}",
            context=context
        )
        
        try:
            # Prepare agent input
            agent_input = f"""Task: {agent['task']}
Context: {json.dumps(context, indent=2)}
Expected Output: {agent['expected_output']}

Process this task and provide your raw output."""
            
            # Call agent
            response = requests.post(
                f"{self.strands_sdk_url}/api/query",
                json={
                    "query": agent_input,
                    "model": "qwen3:1.7b",
                    "stream": False
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                raw_output = result.get('response', '')
                
                # Log agent processing completion
                observability_engine.log_event(
                    session_id=session_id,
                    event_type=EventType.AGENT_EXECUTION,
                    agent_id=agent['id'],
                    agent_name=agent['name'],
                    content="Agent processing completed",
                    metadata={"output_length": len(raw_output)}
                )
                
                return raw_output
            else:
                raise Exception(f"Agent processing failed: {response.status_code}")
                
        except Exception as e:
            logger.error(f"[{session_id}] Agent processing error: {e}")
            raise e
    
    def _agent_self_clean(self, agent: Dict[str, Any], raw_output: str, 
                         context: Dict[str, Any], session_id: str) -> str:
        """Agent self-cleans its raw output based on handover context"""
        
        # Log agent self-cleaning start
        observability_engine.log_event(
            session_id=session_id,
            event_type=EventType.AGENT_EXECUTION,
            agent_id=agent['id'],
            agent_name=agent['name'],
            content="Starting agent self-cleaning",
            metadata={"raw_output_length": len(raw_output)}
        )
        
        try:
            # Create self-cleaning prompt for the agent
            cleaning_prompt = f"""You are {agent['name']}. Clean your raw output to make it suitable for handoff to the next agent.

Your Task: {agent['task']}
Expected Output: {agent['expected_output']}
Handover Context: {json.dumps(context, indent=2)}

Raw Output to Clean:
{raw_output}

Clean this output by:
1. Removing internal thinking and reasoning
2. Keeping only the final result/answer
3. Making it concise and actionable
4. Ensuring it's suitable for the next agent

Cleaned Output:"""

            # Call agent for self-cleaning
            response = requests.post(
                f"{self.strands_sdk_url}/api/query",
                json={
                    "query": cleaning_prompt,
                    "model": "qwen3:1.7b",
                    "stream": False
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                cleaned_output = result.get('response', '').strip()
                
                # Additional cleaning using text cleaning service
                final_cleaned = text_cleaning_service.clean_llm_output(
                    cleaned_output, "agent_response"
                )
                
                # Log agent self-cleaning completion
                observability_engine.log_event(
                    session_id=session_id,
                    event_type=EventType.AGENT_EXECUTION,
                    agent_id=agent['id'],
                    agent_name=agent['name'],
                    content="Agent self-cleaning completed",
                    metadata={
                        "raw_length": len(raw_output),
                        "cleaned_length": len(final_cleaned),
                        "cleaning_applied": True
                    }
                )
                
                return final_cleaned
            else:
                # Fallback to text cleaning service
                return text_cleaning_service.clean_llm_output(raw_output, "agent_response")
                
        except Exception as e:
            logger.error(f"[{session_id}] Agent self-cleaning error: {e}")
            # Fallback to text cleaning service
            return text_cleaning_service.clean_llm_output(raw_output, "agent_response")
    
    def _orchestrator_refine_context(self, agent_output: str, current_context: Dict[str, Any],
                                   next_agent: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Orchestrator refines context for next agent"""
        
        # Log context refinement start
        observability_engine.log_event(
            session_id=session_id,
            event_type=EventType.CONTEXT_TRANSFER,
            content=f"Refining context for next agent: {next_agent['name']}",
            metadata={
                "current_context": current_context,
                "agent_output": agent_output,
                "next_agent": next_agent['name']
            }
        )
        
        try:
            # Create context refinement prompt
            refinement_prompt = f"""You are an A2A Orchestrator. Refine the context for the next agent based on the current agent's output.

Current Context: {json.dumps(current_context, indent=2)}
Current Agent Output: {agent_output}
Next Agent: {next_agent['name']}
Next Agent Task: {next_agent['task']}
Next Agent Context Needed: {next_agent['context_needed']}

Refine the context to include:
1. Relevant information from the current agent's output
2. Updated context for the next agent's task
3. Clear handoff instructions

Provide a JSON response with the refined context:
{{
    "refined_context": {{
        "previous_results": "Results from previous agents",
        "current_task": "Next agent's specific task",
        "handoff_instructions": "Clear instructions for next agent",
        "context_summary": "Summary of relevant context"
    }}
}}"""

            # Call orchestrator for context refinement
            response = requests.post(
                f"{self.strands_sdk_url}/api/query",
                json={
                    "query": refinement_prompt,
                    "model": "qwen3:1.7b",
                    "stream": False
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                raw_refinement = result.get('response', '')
                
                # Clean refinement output
                cleaned_refinement = text_cleaning_service.clean_llm_output(
                    raw_refinement, "orchestrator_response"
                )
                
                # Parse JSON from cleaned refinement
                try:
                    import re
                    json_match = re.search(r'\{.*\}', cleaned_refinement, re.DOTALL)
                    if json_match:
                        refined_context = json.loads(json_match.group())
                        
                        # Log context refinement completion
                        observability_engine.log_event(
                            session_id=session_id,
                            event_type=EventType.CONTEXT_TRANSFER,
                            content="Context refinement completed",
                            metadata={
                                "refined_context": refined_context,
                                "cleaning_applied": True
                            }
                        )
                        
                        return refined_context
                    else:
                        # Fallback to basic context update
                        return {
                            "refined_context": {
                                "previous_results": agent_output,
                                "current_task": next_agent['task'],
                                "handoff_instructions": f"Process: {next_agent['task']}",
                                "context_summary": f"Previous agent output: {agent_output[:100]}..."
                            }
                        }
                        
                except json.JSONDecodeError:
                    # Fallback to basic context update
                    return {
                        "refined_context": {
                            "previous_results": agent_output,
                            "current_task": next_agent['task'],
                            "handoff_instructions": f"Process: {next_agent['task']}",
                            "context_summary": f"Previous agent output: {agent_output[:100]}..."
                        }
                    }
            else:
                # Fallback to basic context update
                return {
                    "refined_context": {
                        "previous_results": agent_output,
                        "current_task": next_agent['task'],
                        "handoff_instructions": f"Process: {next_agent['task']}",
                        "context_summary": f"Previous agent output: {agent_output[:100]}..."
                    }
                }
                
        except Exception as e:
            logger.error(f"[{session_id}] Context refinement error: {e}")
            # Fallback to basic context update
            return {
                "refined_context": {
                    "previous_results": agent_output,
                    "current_task": next_agent['task'],
                    "handoff_instructions": f"Process: {next_agent['task']}",
                    "context_summary": f"Previous agent output: {agent_output[:100]}..."
                }
            }
    
    def _orchestrator_final_synthesis(self, agent_results: List[Dict[str, Any]], 
                                    analysis_result: Dict[str, Any], 
                                    session_id: str) -> Dict[str, Any]:
        """Orchestrator final synthesis for user"""
        
        # Log final synthesis start
        observability_engine.log_event(
            session_id=session_id,
            event_type=EventType.RESPONSE_SYNTHESIS,
            content="Starting final orchestrator synthesis",
            metadata={"agent_results_count": len(agent_results)}
        )
        
        try:
            # Prepare synthesis data
            successful_results = [r for r in agent_results if r.get('success', False)]
            
            if not successful_results:
                return {
                    "success": False,
                    "error": "No successful agent results",
                    "a2a_framework": False
                }
            
            # Create final synthesis prompt
            synthesis_prompt = f"""You are an A2A Orchestrator. Synthesize the final response for the user based on all agent results.

Original Query: {analysis_result.get('analysis', {}).get('query_breakdown', {}).get('primary_task', '')}

Agent Results:
{json.dumps(successful_results, indent=2)}

Create a comprehensive, user-friendly response that:
1. Addresses the original query completely
2. Incorporates all successful agent outputs
3. Provides a clear, coherent final answer
4. Is well-structured and easy to understand

Final User Response:"""

            # Call orchestrator for final synthesis
            response = requests.post(
                f"{self.strands_sdk_url}/api/query",
                json={
                    "query": synthesis_prompt,
                    "model": "qwen3:1.7b",
                    "stream": False
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                raw_synthesis = result.get('response', '')
                
                # Clean final synthesis
                final_response = text_cleaning_service.clean_llm_output(
                    raw_synthesis, "orchestrator_response"
                )
                
                # Log final synthesis completion
                observability_engine.log_event(
                    session_id=session_id,
                    event_type=EventType.RESPONSE_SYNTHESIS,
                    content="Final synthesis completed",
                    metadata={
                        "final_response_length": len(final_response),
                        "successful_agents": len(successful_results),
                        "cleaning_applied": True
                    }
                )
                
                return {
                    "success": True,
                    "orchestrator_response": final_response,
                    "agent_results": agent_results,
                    "successful_agents": len(successful_results),
                    "total_agents": len(agent_results),
                    "a2a_framework": True,
                    "enhanced_orchestration": True
                }
            else:
                return {
                    "success": False,
                    "error": f"Final synthesis failed: {response.status_code}",
                    "a2a_framework": False
                }
                
        except Exception as e:
            logger.error(f"[{session_id}] Final synthesis error: {e}")
            return {
                "success": False,
                "error": str(e),
                "a2a_framework": False
            }

# Global instance
enhanced_a2a_orchestrator = EnhancedA2AOrchestrator()
