#!/usr/bin/env python3
"""
Strands Orchestration Engine
Handles A2A multi-agent orchestration using working Strands SDK agents
Enhanced with comprehensive observability and context tracking
"""

import requests
import json
import time
import logging
import re
from typing import List, Dict, Any, Optional
from a2a_observability import observability_engine, EventType
from text_cleaning_service_simple import text_cleaning_service
from dynamic_context_refinement_engine import dynamic_context_engine, ContextType

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_agent_response(response: str) -> str:
    """
    Clean agent response using the text cleaning service
    """
    if not response:
        return response
    
    # Use the text cleaning service for comprehensive cleaning
    cleaned = text_cleaning_service.clean_llm_output(response, "agent_response")
    
    logger.info(f"Agent response cleaned: {len(response)} -> {len(cleaned)} chars")
    return cleaned
    

# Service URLs
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"

class StrandsOrchestrationEngine:
    """Orchestration engine for Strands A2A multi-agent communication"""
    
    def __init__(self):
        self.logger = logger
        self.a2a_integration = None
        self.orchestrator_id = "system_orchestrator"
        self.auto_register_orchestrator()
    
    def set_a2a_integration(self, a2a_integration):
        """Set the A2A integration instance"""
        self.a2a_integration = a2a_integration
        logger.info("A2A integration set successfully")
    
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
                        "description": "Central orchestrator for agent coordination and query processing",
                        "model": "qwen3:1.7b",
                        "capabilities": ["orchestration", "coordination", "agent_management", "query_processing"]
                    }
                    
                    register_response = requests.post(
                        f"{A2A_SERVICE_URL}/api/a2a/agents",
                        json=orchestrator_data,
                        timeout=10
                    )
                    
                    if register_response.status_code == 201:
                        logger.info("✅ System Orchestrator auto-registered with A2A service")
                    else:
                        logger.warning(f"⚠️ Failed to register orchestrator: {register_response.text}")
                else:
                    logger.info("✅ System Orchestrator already registered with A2A service")
            else:
                logger.warning(f"⚠️ Could not check A2A agents: {response.status_code}")
        except Exception as e:
            logger.error(f"❌ Error auto-registering orchestrator: {e}")
    
    def select_agents_by_task_requirements(self, query: str, available_agents: List[Dict]) -> List[Dict]:
        """Intelligently select agents based on task requirements"""
        query_lower = query.lower()
        
        # Check for math + creative tasks (like "solve 2x2x5x100 and write poem")
        if any(math_word in query_lower for math_word in ["solve", "calculate", "math", "x", "×", "+", "-", "/"]) and \
           any(creative_word in query_lower for creative_word in ["poem", "write", "story", "creative"]):
            
            # Find Maths Agent first, Creative Assistant second
            maths_agent = None
            creative_agent = None
            
            for agent in available_agents:
                agent_name_lower = agent.get('name', '').strip().lower()
                if 'math' in agent_name_lower:
                    maths_agent = agent
                elif 'creative' in agent_name_lower:
                    creative_agent = agent
            
            # Return in correct order: Maths Agent first, Creative Assistant second
            if maths_agent and creative_agent:
                logger.info(f"Math+Creative task detected: {maths_agent['name']} -> {creative_agent['name']}")
                return [maths_agent, creative_agent]
            elif maths_agent:
                logger.info(f"Math task detected: {maths_agent['name']} first")
                return [maths_agent] + [a for a in available_agents if a != maths_agent][:1]
            elif creative_agent:
                logger.info(f"Creative task detected: {creative_agent['name']} first")
                return [creative_agent] + [a for a in available_agents if a != creative_agent][:1]
        
        # Check for pure math tasks
        elif any(math_word in query_lower for math_word in ["solve", "calculate", "math", "x", "×", "+", "-", "/"]):
            # Find Maths Agent first
            maths_agent = next((a for a in available_agents if 'math' in a.get('name', '').strip().lower()), None)
            if maths_agent:
                return [maths_agent] + [a for a in available_agents if a != maths_agent][:1]
        
        # Check for pure creative tasks
        elif any(creative_word in query_lower for creative_word in ["poem", "write", "story", "creative"]):
            # Find Creative Assistant first
            creative_agent = next((a for a in available_agents if 'creative' in a.get('name', '').strip().lower()), None)
            if creative_agent:
                return [creative_agent] + [a for a in available_agents if a != creative_agent][:1]
        
        # Fallback to original behavior (preserve existing functionality)
        return available_agents[:2]
    
    def prepare_agent_input(self, agent: Dict, step_number: int, query: str, previous_output: str = None) -> str:
        """Prepare input for agent based on step and context"""
        agent_name = agent.get('name', 'Unknown Agent')
        agent_tools = agent.get('tools', [])
        
        if step_number == 1:
            # First agent gets the original query with task-specific instructions
            if 'math' in agent_name.strip().lower():
                return f"""A2A HANDOFF - Step {step_number}

Original Query: {query}

Task: Perform the mathematical calculation requested in the query.
Available Tools: {', '.join(agent_tools)}

Please solve the mathematical problem and provide the result."""
            else:
                return f"""A2A HANDOFF - Step {step_number}

Original Query: {query}

Please process this request using your specialized capabilities: {', '.join(agent_tools)}

Provide a comprehensive response that will be passed to the next agent in the sequence."""
        else:
            # Subsequent agents get context from previous agent
            if 'creative' in agent_name.strip().lower() and previous_output:
                # Extract the actual mathematical result from previous output
                import re
                # Look for calculation results like "600", "Result: 600", "= 600", etc.
                number_patterns = [
                    r'Result:\s*(\d+(?:\.\d+)?)',
                    r'=\s*(\d+(?:\.\d+)?)',
                    r'(\d+(?:\.\d+)?)\s*$',
                    r'(\d+(?:\.\d+)?)'
                ]
                
                number = None
                for pattern in number_patterns:
                    match = re.search(pattern, previous_output)
                    if match:
                        number = match.group(1)
                        break
                
                if number:
                    logger.info(f"Extracted number {number} from previous output for Creative Assistant")
                    return f"""A2A HANDOFF - Step {step_number}

Original Query: {query}

Previous Agent Output: {previous_output}

Task: Create creative content (poem/story) based on the number {number} from the previous calculation.
Available Tools: {', '.join(agent_tools)}

Please create a poem or story that incorporates the number {number}."""
                else:
                    logger.warning(f"Could not extract number from previous output: {previous_output[:100]}...")
                    return f"""A2A HANDOFF - Step {step_number}

Original Query: {query}

Previous Agent Output: {previous_output}

Task: Create creative content based on the previous output.
Available Tools: {', '.join(agent_tools)}

Please create creative content that builds on the previous work."""
            else:
                return f"""A2A HANDOFF - Step {step_number}

Original Query: {query}

Previous Context: {previous_output}

Please process this request using your specialized capabilities: {', '.join(agent_tools)}

Provide a comprehensive response that builds on the previous work."""
    
    def execute_strands_orchestration(self, query: str, available_agents: List[Dict], session_id: str) -> Dict[str, Any]:
        """Execute Strands orchestration with comprehensive A2A observability"""
        try:
            logger.info(f"[{session_id}] Starting Strands orchestration with {len(available_agents)} agents")
            
            # Use observability engine to trace the entire orchestration
            with observability_engine.trace_orchestration(session_id, query, "sequential") as trace:
                # Log query analysis
                observability_engine.log_event(
                    session_id=session_id,
                    event_type=EventType.QUERY_ANALYSIS,
                    content=f"Analyzing query: {query[:100]}...",
                    metadata={"query_length": len(query), "available_agents": len(available_agents)}
                )
                
                # Use the sequential A2A handover method with observability
                result = self.execute_sequential_a2a_handover(query, available_agents, session_id)
                
                if result.get("success"):
                    # Synthesize the final response
                    handover_steps = result.get("handover_steps", [])
                    successful_steps = [step for step in handover_steps if step.get("a2a_status") == "success"]
                    
                    if successful_steps:
                        # Combine all successful responses
                        raw_combined_response = "\n\n".join([
                            f"**{step['agent_name']} (Step {step['step']}):**\n{step['result']}"
                            for step in successful_steps
                        ])
                        
                        # Clean the orchestrator response using text cleaning service
                        combined_response = text_cleaning_service.clean_llm_output(raw_combined_response, "orchestrator_response")
                        
                        # Log response synthesis
                        observability_engine.log_event(
                            session_id=session_id,
                            event_type=EventType.RESPONSE_SYNTHESIS,
                            content="Final response synthesized and cleaned",
                            metadata={
                                "response_length": len(combined_response), 
                                "successful_steps": len(successful_steps),
                                "cleaning_applied": True
                            }
                        )
                        
                        # Store final response in trace
                        trace.final_response = combined_response
                        
                        final_result = {
                            "success": True,
                            "orchestrator_response": combined_response,
                            "handover_steps": handover_steps,
                            "total_agents": len(available_agents),
                            "successful_steps": len(successful_steps),
                            "a2a_framework": True,
                            "strands_integration": True,
                            "observability_trace": observability_engine.export_trace_data(session_id)
                        }
                    else:
                        trace.error = "No successful handover steps"
                        final_result = {
                            "success": False,
                            "error": "No successful handover steps",
                            "a2a_framework": False,
                            "observability_trace": observability_engine.export_trace_data(session_id)
                        }
                else:
                    trace.error = result.get("error", "Unknown error")
                    final_result = result
            
            # Send observability data to the API AFTER the context manager completes
            logger.info(f"[{session_id}] Attempting to send observability data to API...")
            try:
                observability_data = observability_engine.export_trace_data(session_id)
                logger.info(f"[{session_id}] Observability data available: {observability_data is not None}")
                if observability_data:
                    import requests
                    import json
                    # Convert to JSON-serializable format
                    serializable_data = json.loads(json.dumps(observability_data, default=str))
                    logger.info(f"[{session_id}] Sending observability data to API...")
                    response = requests.post('http://localhost:5018/api/a2a-observability/store-trace', 
                                json=serializable_data, timeout=5)
                    logger.info(f"[{session_id}] Observability data sent successfully: {response.status_code}")
                else:
                    logger.warning(f"[{session_id}] No observability data to send")
            except Exception as e:
                logger.error(f"[{session_id}] Failed to send observability data: {e}")
            
            # Return the final result
            return final_result
                
        except Exception as e:
            logger.error(f"[{session_id}] Error in Strands orchestration: {e}")
            return {
                "success": False,
                "error": str(e),
                "a2a_framework": False,
                "observability_trace": observability_engine.export_trace_data(session_id) if session_id else None
            }
    
    def execute_sequential_a2a_handover(self, query: str, available_agents: List[Dict], session_id: str) -> Dict[str, Any]:
        """Execute sequential A2A handover with comprehensive observability"""
        try:
            logger.info(f"[{session_id}] Starting sequential A2A handover with {len(available_agents)} agents")
            
            # Intelligently select agents based on task requirements
            selected_agents = self.select_agents_by_task_requirements(query, available_agents)
            logger.info(f"[{session_id}] Selected agents: {[a['name'] for a in selected_agents]}")
            
            # Log agent selection
            observability_engine.log_event(
                session_id=session_id,
                event_type=EventType.AGENT_SELECTION,
                content=f"Selected {len(selected_agents)} agents for sequential handover",
                metadata={"selected_agents": [a['name'] for a in selected_agents]}
            )
            
            # Execute sequential handover using direct Strands SDK calls
            handover_results = []
            current_context = query
            
            for i, agent in enumerate(selected_agents):
                logger.info(f"[{session_id}] Step {i+1}: Executing with {agent['name']}")
                
                # Prepare the input for this agent based on step and context
                agent_input = self.prepare_agent_input(agent, i+1, query, current_context)
                
                # Start handoff tracking
                from_agent_name = selected_agents[i-1]['name'] if i > 0 else "Orchestrator"
                from_agent_id = selected_agents[i-1]['id'] if i > 0 else "system_orchestrator"
                
                handoff_id = observability_engine.start_agent_handoff(
                    session_id=session_id,
                    from_agent_id=from_agent_id,
                    to_agent_id=agent['id'],
                    from_agent_name=from_agent_name,
                    to_agent_name=agent['name'],
                    handoff_number=i+1,
                    context_transferred={"query": query, "previous_context": current_context}
                )
                
                # Log context transfer
                observability_engine.log_context_transfer(
                    session_id=session_id,
                    from_agent_id=from_agent_id,
                    to_agent_id=agent['id'],
                    context_data={"input": agent_input, "context": current_context},
                    transfer_type="sequential_handoff"
                )
                
                # Log agent execution start
                observability_engine.log_agent_execution(
                    session_id=session_id,
                    agent_id=agent['id'],
                    agent_name=agent['name'],
                    execution_start=True,
                    input_data=agent_input
                )
                
                # Execute agent using Strands SDK API
                start_time = time.time()
                try:
                    response = requests.post(
                        f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent['id']}/execute",
                        json={"input": agent_input, "stream": False},
                        timeout=120
                    )
                    
                    if response.status_code == 200:
                        result_data = response.json()
                        execution_time = time.time() - start_time
                        
                        if result_data.get('success'):
                            agent_response = result_data.get('response', '')
                            
                            # Clean the agent response to extract final output
                            cleaned_response = clean_agent_response(agent_response)
                            
                            # Extract tools used from response
                            tools_used = []
                            if 'tools_used' in result_data:
                                tools_used = result_data['tools_used']
                            elif 'tool_executions' in result_data:
                                tools_used = [exec.get('tool_name', 'unknown') for exec in result_data['tool_executions']]
                            
                            handover_results.append({
                                "agent_name": agent['name'],
                                "agent_id": agent['id'],
                                "step": i + 1,
                                "result": agent_response,
                                "execution_time": execution_time,
                                "a2a_status": "success",
                                "tools_used": tools_used
                            })
                            
                            # Log agent execution completion
                            observability_engine.log_agent_execution(
                                session_id=session_id,
                                agent_id=agent['id'],
                                agent_name=agent['name'],
                                execution_start=False,
                                output_data=agent_response,
                                execution_time=execution_time,
                                tools_used=tools_used
                            )
                            
                            # Complete handoff tracking
                            observability_engine.complete_agent_handoff(
                                handoff_id=handoff_id,
                                output_received=cleaned_response,
                                tools_used=tools_used
                            )
                            
                            # Update context for next agent with the CLEANED response
                            current_context = cleaned_response
                            
                            # Add dynamic context refinement for next agent
                            if i < len(selected_agents) - 1:  # Not the last agent
                                next_agent = selected_agents[i+1]
                                
                                # Register agent capabilities if not already registered
                                if next_agent['id'] not in dynamic_context_engine.agent_capabilities:
                                    dynamic_context_engine.register_agent_capability(next_agent)
                                
                                # Process context handoff with dynamic refinement
                                refined_context, metadata = dynamic_context_engine.process_context_handoff(
                                    context=cleaned_response,
                                    context_type=ContextType.AGENT_OUTPUT,
                                    source_agent=agent['name'],
                                    target_agent_id=next_agent['id'],
                                    session_id=session_id
                                )
                                
                                current_context = refined_context
                                
                                # Log dynamic refinement
                                observability_engine.log_event(
                                    session_id=session_id,
                                    event_type=EventType.CONTEXT_TRANSFER,
                                    content=f"Dynamic context refinement applied",
                                    metadata={
                                        "strategy": metadata.refinement_strategy.value,
                                        "quality_score": metadata.quality_score,
                                        "length_change": metadata.refined_length - metadata.original_length,
                                        "source_agent": metadata.source_agent,
                                        "target_agent": metadata.target_agent
                                    }
                                )
                            
                            logger.info(f"[{session_id}] Step {i+1} completed successfully in {execution_time:.2f}s")
                        else:
                            error_msg = result_data.get('error', 'Unknown error')
                            logger.error(f"[{session_id}] Step {i+1} failed: {error_msg}")
                            
                            # Log failed execution
                            observability_engine.log_agent_execution(
                                session_id=session_id,
                                agent_id=agent['id'],
                                agent_name=agent['name'],
                                execution_start=False,
                                execution_time=execution_time,
                                error=error_msg
                            )
                            
                            # Complete handoff with error
                            observability_engine.complete_agent_handoff(
                                handoff_id=handoff_id,
                                output_received="",
                                error=error_msg
                            )
                            
                            handover_results.append({
                                "agent_name": agent['name'],
                                "agent_id": agent['id'],
                                "step": i + 1,
                                "error": error_msg,
                                "a2a_status": "failed"
                            })
                    else:
                        error_msg = f"HTTP {response.status_code}"
                        logger.error(f"[{session_id}] Step {i+1} HTTP error: {response.status_code}")
                        
                        # Log HTTP error
                        observability_engine.log_agent_execution(
                            session_id=session_id,
                            agent_id=agent['id'],
                            agent_name=agent['name'],
                            execution_start=False,
                            execution_time=time.time() - start_time,
                            error=error_msg
                        )
                        
                        # Complete handoff with error
                        observability_engine.complete_agent_handoff(
                            handoff_id=handoff_id,
                            output_received="",
                            error=error_msg
                        )
                        
                        handover_results.append({
                            "agent_name": agent['name'],
                            "agent_id": agent['id'],
                            "step": i + 1,
                            "error": error_msg,
                            "a2a_status": "failed"
                        })
                
                except Exception as e:
                    error_msg = str(e)
                    logger.error(f"[{session_id}] Step {i+1} exception: {e}")
                    
                    # Log exception
                    observability_engine.log_agent_execution(
                        session_id=session_id,
                        agent_id=agent['id'],
                        agent_name=agent['name'],
                        execution_start=False,
                        execution_time=time.time() - start_time,
                        error=error_msg
                    )
                    
                    # Complete handoff with error
                    observability_engine.complete_agent_handoff(
                        handoff_id=handoff_id,
                        output_received="",
                        error=error_msg
                    )
                    
                    handover_results.append({
                        "agent_name": agent['name'],
                        "agent_id": agent['id'],
                        "step": i + 1,
                        "error": error_msg,
                        "a2a_status": "failed"
                    })
            
            # Check if we had any successful steps
            successful_steps = [r for r in handover_results if r.get("a2a_status") == "success"]
            
            return {
                "success": len(successful_steps) > 0,
                "handover_steps": handover_results,
                "total_agents": len(selected_agents),
                "successful_steps": len(successful_steps),
                "a2a_framework": True,
                "strands_integration": True,
                "fallback_mode": False
            }
            
        except Exception as e:
            logger.error(f"[{session_id}] Error in sequential A2A handover: {e}")
            return {
                "success": False,
                "error": str(e),
                "a2a_framework": False
            }

def get_strands_orchestration_engine() -> StrandsOrchestrationEngine:
    """Get the Strands orchestration engine instance"""
    return StrandsOrchestrationEngine()


