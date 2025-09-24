#!/usr/bin/env python3
"""
Strands Orchestration Engine
Handles A2A multi-agent orchestration using working Strands SDK agents
"""

import requests
import json
import time
import logging
from typing import List, Dict, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Service URLs
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"

class StrandsOrchestrationEngine:
    """Orchestration engine for Strands A2A multi-agent communication"""
    
    def __init__(self):
        self.logger = logger
        self.a2a_integration = None
    
    def set_a2a_integration(self, a2a_integration):
        """Set the A2A integration instance"""
        self.a2a_integration = a2a_integration
        logger.info("A2A integration set successfully")
    
    def execute_strands_orchestration(self, query: str, available_agents: List[Dict], session_id: str) -> Dict[str, Any]:
        """Execute Strands orchestration with A2A integration"""
        try:
            logger.info(f"[{session_id}] Starting Strands orchestration with {len(available_agents)} agents")
            
            # Use the sequential A2A handover method we already have
            result = self.execute_sequential_a2a_handover(query, available_agents, session_id)
            
            if result.get("success"):
                # Synthesize the final response
                handover_steps = result.get("handover_steps", [])
                successful_steps = [step for step in handover_steps if step.get("a2a_status") == "success"]
                
                if successful_steps:
                    # Combine all successful responses
                    combined_response = "\n\n".join([
                        f"**{step['agent_name']} (Step {step['step']}):**\n{step['result']}"
                        for step in successful_steps
                    ])
                    
                    return {
                        "success": True,
                        "orchestrator_response": combined_response,
                        "handover_steps": handover_steps,
                        "total_agents": len(available_agents),
                        "successful_steps": len(successful_steps),
                        "a2a_framework": True,
                        "strands_integration": True
                    }
                else:
                    return {
                        "success": False,
                        "error": "No successful handover steps",
                        "a2a_framework": False
                    }
            else:
                return result
                
        except Exception as e:
            logger.error(f"[{session_id}] Error in Strands orchestration: {e}")
            return {
                "success": False,
                "error": str(e),
                "a2a_framework": False
            }
    
    def execute_sequential_a2a_handover(self, query: str, available_agents: List[Dict], session_id: str) -> Dict[str, Any]:
        """Execute sequential A2A handover using working Strands SDK agents"""
        try:
            logger.info(f"[{session_id}] Starting sequential A2A handover with {len(available_agents)} agents")
            
            # Use the first 2 available agents for handover
            selected_agents = available_agents[:2]
            logger.info(f"[{session_id}] Selected agents: {[a['name'] for a in selected_agents]}")
            
            # Execute sequential handover using direct Strands SDK calls
            handover_results = []
            current_context = query
            
            for i, agent in enumerate(selected_agents):
                logger.info(f"[{session_id}] Step {i+1}: Executing with {agent['name']}")
                
                # Prepare the input for this agent
                if i == 0:
                    # First agent gets the original query
                    agent_input = f"""A2A HANDOFF - Step {i+1}

Original Query: {query}

Please process this request using your specialized capabilities: {', '.join(agent.get('tools', []))}

Provide a comprehensive response that will be passed to the next agent in the sequence."""
                else:
                    # Subsequent agents get context from previous agent
                    agent_input = f"""A2A HANDOFF - Step {i+1}

Original Query: {query}

Previous Context: {current_context}

Please process this request using your specialized capabilities: {', '.join(agent.get('tools', []))}

Provide a comprehensive response that builds on the previous work."""
                
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
                            handover_results.append({
                                "agent_name": agent['name'],
                                "agent_id": agent['id'],
                                "step": i + 1,
                                "result": agent_response,
                                "execution_time": execution_time,
                                "a2a_status": "success"
                            })
                            
                            # Update context for next agent
                            current_context = f"Previous agent ({agent['name']}) completed: {agent_response[:200]}...\nContinue with: {query}"
                            
                            logger.info(f"[{session_id}] Step {i+1} completed successfully in {execution_time:.2f}s")
                        else:
                            logger.error(f"[{session_id}] Step {i+1} failed: {result_data.get('error')}")
                            handover_results.append({
                                "agent_name": agent['name'],
                                "agent_id": agent['id'],
                                "step": i + 1,
                                "error": result_data.get('error', 'Unknown error'),
                                "a2a_status": "failed"
                            })
                    else:
                        logger.error(f"[{session_id}] Step {i+1} HTTP error: {response.status_code}")
                        handover_results.append({
                            "agent_name": agent['name'],
                            "agent_id": agent['id'],
                            "step": i + 1,
                            "error": f"HTTP {response.status_code}",
                            "a2a_status": "failed"
                        })
                
                except Exception as e:
                    logger.error(f"[{session_id}] Step {i+1} exception: {e}")
                    handover_results.append({
                        "agent_name": agent['name'],
                        "agent_id": agent['id'],
                        "step": i + 1,
                        "error": str(e),
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


