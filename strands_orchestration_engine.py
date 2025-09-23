#!/usr/bin/env python3
"""
Strands Orchestration Engine
Implements model-driven orchestration using official Strands SDK patterns
"""

import requests
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

# Configure logging
logger = logging.getLogger(__name__)

class StrandsOrchestrationEngine:
    """Model-driven orchestration using Strands SDK patterns"""
    
    def __init__(self, ollama_base_url: str = "http://localhost:11434", orchestrator_model: str = "qwen3:1.7b"):
        self.ollama_base_url = ollama_base_url
        self.orchestrator_model = orchestrator_model
        self.a2a_integration = None
        
    def set_a2a_integration(self, a2a_integration):
        """Set A2A integration instance"""
        self.a2a_integration = a2a_integration
    
    def create_orchestrator_agent(self, available_agents: List[Dict]) -> Dict[str, Any]:
        """Create an orchestrator agent with A2A collaboration tools"""
        try:
            # Import collaboration tools
            from strands_collaboration_tools import COLLABORATION_TOOLS
            
            # Create system prompt for orchestrator
            agent_descriptions = []
            for agent in available_agents:
                agent_descriptions.append(f"- {agent['name']}: {agent['description']} (ID: {agent['id']})")
            
            system_prompt = f"""You are an intelligent orchestrator agent that coordinates multiple specialized agents to complete complex tasks.

Available Agents:
{chr(10).join(agent_descriptions)}

Your role is to:
1. Analyze user queries to understand requirements
2. Break down complex tasks into manageable steps
3. Coordinate agents using A2A communication tools
4. Ensure proper handoff of context between agents
5. Synthesize results from multiple agents

Available Tools:
- think: Deep analytical thinking and reasoning
- a2a_send_message: Send messages to other agents
- coordinate_agents: Coordinate multiple agents for complex tasks
- agent_handoff: Hand off tasks between agents
- a2a_discover_agent: Discover new agents
- a2a_list_discovered_agents: List available agents

Always use the appropriate tools to coordinate agents and ensure successful task completion."""

            # Create orchestrator agent configuration
            orchestrator_config = {
                "id": f"orchestrator_{uuid.uuid4().hex[:8]}",
                "name": "Intelligent Orchestrator",
                "description": "Coordinates multiple agents for complex task execution",
                "model_id": self.orchestrator_model,
                "system_prompt": system_prompt,
                "tools": list(COLLABORATION_TOOLS.keys()),
                "temperature": 0.2,
                "max_tokens": 2000,
                "a2a_enabled": True
            }
            
            logger.info(f"Created orchestrator agent: {orchestrator_config['name']}")
            return orchestrator_config
            
        except Exception as e:
            logger.error(f"Error creating orchestrator agent: {e}")
            return None
    
    def execute_strands_orchestration(self, query: str, available_agents: List[Dict], session_id: str) -> Dict[str, Any]:
        """Execute orchestration using Strands SDK patterns with proper A2A handover"""
        try:
            logger.info(f"[{session_id}] Starting Strands A2A orchestration for query: {query[:100]}...")
            
            # Step 1: Create orchestrator agent
            orchestrator_config = self.create_orchestrator_agent(available_agents)
            if not orchestrator_config:
                return {
                    "success": False,
                    "error": "Failed to create orchestrator agent",
                    "session_id": session_id
                }
            
            # Step 2: Execute orchestrator to analyze query and select agents
            orchestration_prompt = f"""User Query: {query}

Available Agents: {len(available_agents)} agents

Please analyze this query and coordinate the appropriate agents to provide a comprehensive response. Use the available A2A tools to:
1. Think through the problem
2. Coordinate with relevant agents
3. Ensure proper handoff of context
4. Synthesize the final response

Start by thinking about the best approach, then coordinate the agents accordingly."""

            logger.info(f"[{session_id}] Step 1: Orchestrator analysis")
            orchestrator_response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.orchestrator_model,
                    "prompt": f"{orchestrator_config['system_prompt']}\n\n{orchestration_prompt}",
                    "stream": False,
                    "options": {
                        "temperature": orchestrator_config['temperature'],
                        "top_p": 0.9,
                        "max_tokens": orchestrator_config['max_tokens']
                    }
                },
                timeout=120
            )
            
            if orchestrator_response.status_code != 200:
                return {
                    "success": False,
                    "error": f"Orchestrator execution failed: HTTP {orchestrator_response.status_code}",
                    "session_id": session_id
                }
            
            # Step 3: Memory management - release orchestrator model
            logger.info(f"[{session_id}] Step 2: Memory management - releasing orchestrator model")
            import gc
            gc.collect()
            
            # Step 4: Execute sequential A2A handover
            logger.info(f"[{session_id}] Step 3: Executing sequential A2A handover")
            handover_results = self.execute_sequential_a2a_handover(query, available_agents, session_id)
            
            # Step 5: Memory management - cleanup after handover
            logger.info(f"[{session_id}] Step 4: Memory management - cleanup after handover")
            gc.collect()
            
            # Step 6: Parse coordination results
            coordination_results = self.parse_orchestration_response(
                orchestrator_response.json().get("response", ""), 
                available_agents, 
                session_id
            )
            
            return {
                "success": True,
                "session_id": session_id,
                "orchestrator_response": orchestrator_response.json().get("response", ""),
                "coordination_results": coordination_results,
                "handover_results": handover_results,
                "orchestration_type": "strands_a2a_handover",
                "agents_used": len(available_agents),
                "execution_time": orchestrator_response.json().get("total_duration", 0) / 1000000000,
                "memory_management": "enabled"
            }
                
        except Exception as e:
            logger.error(f"Error in Strands A2A orchestration: {e}")
            return {
                "success": False,
                "error": str(e),
                "session_id": session_id
            }
    
    def execute_sequential_a2a_handover(self, query: str, available_agents: List[Dict], session_id: str) -> Dict[str, Any]:
        """Execute sequential A2A handover with proper Strands A2A framework integration"""
        try:
            logger.info(f"[{session_id}] Starting sequential A2A handover with Strands A2A framework")
            
            # Select agents for handover (take first 2 agents)
            selected_agents = available_agents[:2]
            logger.info(f"[{session_id}] Selected agents for handover: {[a['name'] for a in selected_agents]}")
            
            # Register agents with A2A service if not already registered
            a2a_agent_ids = []
            for agent in selected_agents:
                a2a_agent_id = self._register_agent_with_a2a(agent, session_id)
                if a2a_agent_id:
                    a2a_agent_ids.append(a2a_agent_id)
                else:
                    logger.warning(f"[{session_id}] Failed to register {agent['name']} with A2A service")
            
            if not a2a_agent_ids:
                logger.error(f"[{session_id}] No agents registered with A2A service, falling back to direct execution")
                return self._fallback_direct_execution(selected_agents, query, session_id)
            
            # Create A2A connections between agents
            self._create_a2a_connections(a2a_agent_ids, session_id)
            
            # Execute sequential A2A handover
            handover_results = []
            current_context = query
            
            for i, (agent, a2a_agent_id) in enumerate(zip(selected_agents, a2a_agent_ids)):
                logger.info(f"[{session_id}] Step {i+1}: A2A execution with {agent['name']} (A2A ID: {a2a_agent_id})")
                
                # Prepare A2A message
                a2a_message = f"""A2A HANDOFF - Step {i+1}

Original Query: {query}
Current Context: {current_context}

Please process this request using your specialized capabilities: {', '.join(agent.get('tools', []))}

Provide a comprehensive response that will be passed to the next agent in the sequence."""

                # Send A2A message
                a2a_result = self._send_a2a_message(
                    from_agent_id="orchestrator",
                    to_agent_id=a2a_agent_id,
                    content=a2a_message,
                    session_id=session_id
                )
                
                if a2a_result.get("success"):
                    response = a2a_result.get("response", "")
                    handover_results.append({
                        "agent_name": agent['name'],
                        "agent_id": agent['id'],
                        "a2a_agent_id": a2a_agent_id,
                        "step": i + 1,
                        "result": response,
                        "execution_time": a2a_result.get("execution_time", 0),
                        "a2a_status": "success",
                        "orchestrator_instructions": a2a_message,
                        "handover_context": current_context,
                        "agent_capabilities": agent.get('tools', [])
                    })
                    
                    # Update context for next agent
                    current_context = f"Previous agent ({agent['name']}) completed: {response}\nContinue with: {query}"
                    
                    # Memory management - release agent model
                    logger.info(f"[{session_id}] Memory management - releasing {agent['name']} model")
                    import gc
                    gc.collect()
                else:
                    logger.error(f"[{session_id}] A2A execution failed for {agent['name']}: {a2a_result.get('error')}")
                    handover_results.append({
                        "agent_name": agent['name'],
                        "agent_id": agent['id'],
                        "a2a_agent_id": a2a_agent_id,
                        "step": i + 1,
                        "error": a2a_result.get("error", "A2A execution failed"),
                        "a2a_status": "failed"
                    })
            
            return {
                "success": len([r for r in handover_results if r.get("a2a_status") == "success"]) > 0,
                "handover_steps": handover_results,
                "total_agents": len(selected_agents),
                "successful_steps": len([r for r in handover_results if r.get("a2a_status") == "success"]),
                "a2a_framework": True,
                "strands_integration": True
            }
            
        except Exception as e:
            logger.error(f"Error in sequential A2A handover: {e}")
            return {
                "success": False,
                "error": str(e),
                "a2a_framework": False
            }
    
    def _register_agent_with_a2a(self, agent: Dict, session_id: str) -> Optional[str]:
        """Register agent with A2A service"""
        try:
            import requests
            
            # Prepare agent data for A2A registration
            a2a_agent_data = {
                "id": f"strands_{agent['id']}",
                "name": agent['name'],
                "description": agent.get('description', ''),
                "model": agent.get('model_id', ''),
                "capabilities": agent.get('tools', []),
                "strands_agent_id": agent['id'],
                "strands_data": agent
            }
            
            # Register with A2A service
            response = requests.post(
                "http://localhost:5008/api/a2a/agents",
                json=a2a_agent_data,
                timeout=10
            )
            
            if response.status_code == 201:
                result = response.json()
                a2a_agent_id = result['agent']['id']
                logger.info(f"[{session_id}] Agent {agent['name']} registered with A2A: {a2a_agent_id}")
                return a2a_agent_id
            else:
                logger.error(f"[{session_id}] A2A registration failed for {agent['name']}: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"[{session_id}] Error registering agent with A2A: {e}")
            return None
    
    def _create_a2a_connections(self, a2a_agent_ids: List[str], session_id: str):
        """Create A2A connections between agents"""
        try:
            import requests
            
            # Create connections between consecutive agents
            for i in range(len(a2a_agent_ids) - 1):
                from_agent_id = a2a_agent_ids[i]
                to_agent_id = a2a_agent_ids[i + 1]
                
                response = requests.post(
                    "http://localhost:5008/api/a2a/connections",
                    json={
                        "from_agent_id": from_agent_id,
                        "to_agent_id": to_agent_id
                    },
                    timeout=10
                )
                
                if response.status_code == 201:
                    logger.info(f"[{session_id}] A2A connection created: {from_agent_id} -> {to_agent_id}")
                else:
                    logger.warning(f"[{session_id}] A2A connection failed: {response.text}")
                    
        except Exception as e:
            logger.error(f"[{session_id}] Error creating A2A connections: {e}")
    
    def _send_a2a_message(self, from_agent_id: str, to_agent_id: str, content: str, session_id: str) -> Dict[str, Any]:
        """Send A2A message"""
        try:
            import requests
            
            response = requests.post(
                "http://localhost:5008/api/a2a/messages",
                json={
                    "from_agent_id": from_agent_id,
                    "to_agent_id": to_agent_id,
                    "content": content,
                    "type": "a2a_handoff"
                },
                timeout=120
            )
            
            if response.status_code == 201:
                result = response.json()
                return {
                    "success": True,
                    "response": result.get("message", {}).get("response", ""),
                    "execution_time": result.get("message", {}).get("execution_time", 0),
                    "a2a_metadata": result
                }
            else:
                return {
                    "success": False,
                    "error": f"A2A message failed: {response.text}"
                }
                
        except Exception as e:
            logger.error(f"[{session_id}] Error sending A2A message: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _fallback_direct_execution(self, selected_agents: List[Dict], query: str, session_id: str) -> Dict[str, Any]:
        """Fallback to direct execution when A2A is not available"""
        try:
            logger.info(f"[{session_id}] Using fallback direct execution")
            
            handover_results = []
            current_context = query
            
            for i, agent in enumerate(selected_agents):
                logger.info(f"[{session_id}] Step {i+1}: Direct execution with {agent['name']}")
                
                # Execute agent directly
                agent_result = self.execute_agent_with_strands_tools(
                    agent['id'], 
                    current_context, 
                    [], 
                    session_id
                )
                
                if agent_result.get("success"):
                    response = agent_result.get("response", "")
                    handover_results.append({
                        "agent_name": agent['name'],
                        "agent_id": agent['id'],
                        "step": i + 1,
                        "result": response,
                        "execution_time": agent_result.get("execution_time", 0),
                        "execution_type": "direct"
                    })
                    
                    # Update context for next agent
                    current_context = f"Previous agent ({agent['name']}) completed: {response}\nContinue with: {query}"
                else:
                    handover_results.append({
                        "agent_name": agent['name'],
                        "agent_id": agent['id'],
                        "step": i + 1,
                        "error": agent_result.get("error", "Direct execution failed"),
                        "execution_type": "direct"
                    })
            
            return {
                "success": len([r for r in handover_results if "error" not in r]) > 0,
                "handover_steps": handover_results,
                "total_agents": len(selected_agents),
                "successful_steps": len([r for r in handover_results if "error" not in r]),
                "a2a_framework": False,
                "fallback_mode": True
            }
            
        except Exception as e:
            logger.error(f"Error in fallback direct execution: {e}")
            return {
                "success": False,
                "error": str(e),
                "a2a_framework": False,
                "fallback_mode": True
            }
    
    def parse_orchestration_response(self, response: str, available_agents: List[Dict], session_id: str) -> Dict[str, Any]:
        """Parse orchestrator response to extract coordination information"""
        try:
            # Simple parsing - in a real implementation, this would be more sophisticated
            coordination_info = {
                "response_length": len(response),
                "mentions_agents": any(agent['name'].lower() in response.lower() for agent in available_agents),
                "coordination_indicators": [],
                "agent_references": []
            }
            
            # Look for agent references
            for agent in available_agents:
                if agent['name'].lower() in response.lower():
                    coordination_info["agent_references"].append(agent['name'])
            
            # Look for coordination indicators
            coordination_keywords = [
                "coordinate", "handoff", "delegate", "assign", "collaborate",
                "work together", "sequential", "parallel", "hierarchical"
            ]
            
            for keyword in coordination_keywords:
                if keyword in response.lower():
                    coordination_info["coordination_indicators"].append(keyword)
            
            logger.info(f"[{session_id}] Parsed coordination: {len(coordination_info['agent_references'])} agents referenced")
            return coordination_info
            
        except Exception as e:
            logger.error(f"Error parsing orchestration response: {e}")
            return {"error": str(e)}
    
    def execute_agent_with_strands_tools(self, agent_id: str, query: str, tools: List[str], session_id: str) -> Dict[str, Any]:
        """Execute an agent with Strands collaboration tools"""
        try:
            logger.info(f"[{session_id}] Executing agent {agent_id} with Strands tools")
            
            # Get agent configuration
            agent_response = requests.get(f"http://localhost:5006/api/strands-sdk/agents/{agent_id}", timeout=10)
            if agent_response.status_code != 200:
                return {
                    "success": False,
                    "error": f"Agent {agent_id} not found"
                }
            
            agent_data = agent_response.json()
            
            # Create enhanced system prompt with tools
            enhanced_system_prompt = f"""{agent_data.get('system_prompt', '')}

Available Collaboration Tools:
- think: Deep analytical thinking
- a2a_send_message: Send messages to other agents
- coordinate_agents: Coordinate multiple agents
- agent_handoff: Hand off tasks to other agents

Use these tools when appropriate to collaborate with other agents."""

            # Execute agent with enhanced prompt
            execution_response = requests.post(
                f"http://localhost:5006/api/strands-sdk/agents/{agent_id}/execute",
                json={
                    "input": query,
                    "stream": False,
                    "system_prompt": enhanced_system_prompt
                },
                timeout=30
            )
            
            if execution_response.status_code == 200:
                result = execution_response.json()
                return {
                    "success": True,
                    "response": result.get("response", ""),
                    "tools_used": result.get("tools_used", []),
                    "agent_name": agent_data.get("name", "Unknown"),
                    "execution_time": result.get("execution_time", 0)
                }
            else:
                return {
                    "success": False,
                    "error": f"Agent execution failed: {execution_response.text}"
                }
                
        except Exception as e:
            logger.error(f"Error executing agent with Strands tools: {e}")
            return {
                "success": False,
                "error": str(e)
            }

# Global orchestration engine
strands_orchestration_engine = StrandsOrchestrationEngine()

def get_strands_orchestration_engine() -> StrandsOrchestrationEngine:
    """Get the global Strands orchestration engine"""
    return strands_orchestration_engine
