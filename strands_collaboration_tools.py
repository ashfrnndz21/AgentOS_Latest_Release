#!/usr/bin/env python3
"""
Strands Multi-Agent Collaboration Tools
Implements the Think Tool and A2A Protocol for advanced multi-agent systems

Key Tools:
1. Think Tool - Recursive thinking and reasoning
2. A2A Protocol - Agent-to-Agent communication
3. Multi-Agent Coordination - Workflow orchestration
"""

import asyncio
import logging
import os
import traceback
import uuid
import time
from typing import Any, Dict, List, Optional
from datetime import datetime
import json
import requests

# Configure logging
logger = logging.getLogger(__name__)

# =============================================================================
# THINK TOOL - Advanced Reasoning Engine
# =============================================================================

class ThoughtProcessor:
    """Processes thoughts through multiple recursive cycles for deep analysis"""
    
    def __init__(self, tool_context: Dict[str, Any]):
        self.system_prompt = tool_context.get("system_prompt", "")
        self.messages = tool_context.get("messages", [])
        self.tool_use_id = str(uuid.uuid4())
    
    def create_thinking_prompt(self, 
                             thought: str, 
                             cycle: int, 
                             total_cycles: int,
                             thinking_system_prompt: Optional[str] = None) -> str:
        """Create a focused prompt for the thinking process"""
        
        # Default thinking instructions (simplified for speed)
        default_instructions = """Analyze this thought concisely:
1. Identify key points
2. Provide 2-3 main insights
3. Keep response under 200 words
4. Be direct and focused"""
        
        # Use custom thinking instructions if provided
        if thinking_system_prompt:
            thinking_instructions = f"\n{thinking_system_prompt}\n"
        else:
            thinking_instructions = default_instructions
        
        prompt = f"""{thinking_instructions}

Current Cycle: {cycle}/{total_cycles}

Thought to process:
{thought}

Please provide your analysis directly:"""
        
        return prompt.strip()
    
    def process_cycle(self,
                     thought: str,
                     cycle: int,
                     total_cycles: int,
                     custom_system_prompt: str,
                     specified_tools=None,
                     thinking_system_prompt: Optional[str] = None,
                     **kwargs: Any) -> str:
        """Process a single thinking cycle"""
        
        logger.debug(f"🧠 Thinking Cycle {cycle}/{total_cycles}: Processing cycle...")
        
        # Create cycle-specific prompt
        prompt = self.create_thinking_prompt(thought, cycle, total_cycles, thinking_system_prompt)
        
        # Get parent agent
        parent_agent = kwargs.get("agent")
        if not parent_agent:
            return f"Error: No parent agent available for thinking cycle {cycle}"
        
        try:
            # Create nested agent for thinking (NO TOOLS to prevent recursion)
            # Add token limit to prevent very long responses
            thinking_system_prompt_with_limit = f"{custom_system_prompt}\n\nIMPORTANT: Keep your response concise and under 200 words. Be direct and focused."
            
            # Use Ollama directly for thinking
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen3:1.7b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.2,
                        "top_p": 0.9,
                        "max_tokens": 200
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result.get("response", "").strip()
                logger.debug(f"Cycle {cycle} completed: {len(response_text)} characters")
                return response_text
            else:
                return f"Error in thinking cycle {cycle}: HTTP {response.status_code}"
            
        except Exception as e:
            error_msg = f"Error in thinking cycle {cycle}: {str(e)}"
            logger.error(error_msg)
            return error_msg

def think(thought: str,
          cycle_count: int = 3,
          system_prompt: str = "You are an expert analytical thinker.",
          tools: Optional[List[str]] = None,
          thinking_system_prompt: Optional[str] = None,
          agent: Optional[Any] = None) -> Dict[str, Any]:
    """
    Advanced recursive thinking tool for deep analytical processing.
    
    This tool implements multi-cycle cognitive analysis that progressively refines thoughts
    through iterative processing, enabling sophisticated reasoning and self-reflection.
    
    Args:
        thought: The detailed thought or idea to process
        cycle_count: Number of thinking cycles (1-10, default: 3)
        system_prompt: Custom system prompt for the thinking agent
        tools: List of tool names to make available (excludes 'think' automatically)
        thinking_system_prompt: Custom thinking methodology instructions
        agent: Parent agent (automatically passed by Strands)
    
    Returns:
        Dict with status and comprehensive analysis across all cycles
    """
    
    try:
        # Validate inputs
        if not thought or not thought.strip():
            return {
                "status": "error",
                "content": [{"text": "Error: Empty thought provided"}]
            }
        
        if cycle_count < 1 or cycle_count > 5:  # Reduced max cycles to prevent memory issues
            return {
                "status": "error", 
                "content": [{"text": "Error: cycle_count must be between 1 and 5 (reduced for safety)"}]
            }
        
        if not agent:
            return {
                "status": "error",
                "content": [{"text": "Error: No parent agent available"}]
            }
        
        # Create thought processor
        processor = ThoughtProcessor({"agent": agent})
        
        # Process through cycles with timeout protection
        current_thought = thought
        all_responses = []
        start_time = time.time()
        max_execution_time = 15  # 15 seconds max for all cycles (more aggressive)
        
        for cycle in range(1, cycle_count + 1):
            # Check for timeout
            if time.time() - start_time > max_execution_time:
                return {
                    "status": "error",
                    "content": [{"text": f"Error: Think tool execution timed out after {max_execution_time} seconds"}]
                }
            # Per-cycle timeout check
            cycle_start = time.time()
            cycle_response = processor.process_cycle(
                current_thought,
                cycle,
                cycle_count,
                system_prompt,
                specified_tools=tools,
                thinking_system_prompt=thinking_system_prompt,
                agent=agent
            )
            
            # Check if this cycle took too long
            cycle_time = time.time() - cycle_start
            if cycle_time > 10:  # 10 seconds per cycle max
                logger.warning(f"Cycle {cycle} took {cycle_time:.2f}s - may be too slow")
            
            # Store response
            all_responses.append({
                "cycle": cycle,
                "thought": current_thought,
                "response": cycle_response
            })
            
            # Update thought for next cycle
            if cycle < cycle_count:
                current_thought = f"Previous cycle concluded: {cycle_response}\nContinue developing these ideas further."
        
        # Combine all responses
        final_output = "\n\n".join([
            f"🧠 Thinking Cycle {r['cycle']}/{cycle_count}:\n{r['response']}" 
            for r in all_responses
        ])
        
        return {
            "status": "success",
            "content": [{"text": final_output}],
            "metadata": {
                "cycles_completed": len(all_responses),
                "total_cycles": cycle_count,
                "thinking_method": thinking_system_prompt or "default"
            }
        }
        
    except Exception as e:
        error_msg = f"Error in think tool: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        return {
            "status": "error",
            "content": [{"text": error_msg}]
        }

# =============================================================================
# A2A PROTOCOL - Agent-to-Agent Communication
# =============================================================================

class A2AClientManager:
    """Manages A2A agent discovery and communication"""
    
    def __init__(self):
        self.discovered_agents: Dict[str, Dict[str, Any]] = {}
        self.timeout = 300  # 5 minutes
        self.a2a_service_url = "http://localhost:5008"
    
    async def discover_agent(self, url: str) -> Dict[str, Any]:
        """Discover an A2A agent and return its capabilities"""
        try:
            # Try to get agent info from A2A service
            async with asyncio.timeout(30):  # 30 second timeout for discovery
                response = requests.get(f"{self.a2a_service_url}/api/a2a/agents", timeout=10)
                if response.status_code == 200:
                    agents = response.json().get("agents", [])
                    # Find agent by URL or ID
                    agent_card = next((a for a in agents if a.get("id") == url or a.get("url") == url), None)
                    if agent_card:
                        self.discovered_agents[url] = agent_card
                        return {
                            "status": "success",
                            "agent_card": agent_card,
                            "url": url
                        }
                
                # Fallback: create mock agent card
                agent_card = {
                    "id": f"agent-{uuid.uuid4().hex[:8]}",
                    "name": f"Agent at {url}",
                    "url": url,
                    "capabilities": ["chat", "analysis", "task_execution"],
                    "version": "1.0.0",
                    "status": "active",
                    "discovered_at": datetime.now().isoformat()
                }
                
                # Cache the agent
                self.discovered_agents[url] = agent_card
                
                return {
                    "status": "success",
                    "agent_card": agent_card,
                    "url": url
                }
                
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "url": url
            }
    
    async def send_message(self, message_text: str, target_agent_url: str, message_id: Optional[str] = None) -> Dict[str, Any]:
        """Send a message to a specific A2A agent"""
        try:
            if message_id is None:
                message_id = uuid.uuid4().hex
            
            # Check if agent is discovered
            if target_agent_url not in self.discovered_agents:
                # Try to discover first
                discovery_result = await self.discover_agent(target_agent_url)
                if discovery_result["status"] != "success":
                    return discovery_result
            
            # Send message via A2A service
            async with asyncio.timeout(self.timeout):
                response = requests.post(
                    f"{self.a2a_service_url}/api/a2a/messages",
                    json={
                        "from_agent_id": "orchestrator",
                        "to_agent_id": target_agent_url,
                        "content": message_text,
                        "type": "a2a_message"
                    },
                    timeout=60
                )
                
                if response.status_code == 201:
                    result = response.json()
                    return {
                        "status": "success",
                        "response": {
                            "message_id": message_id,
                            "response_text": result.get("message", {}).get("content", "Message sent successfully"),
                            "agent_id": target_agent_url,
                            "timestamp": datetime.now().isoformat(),
                            "status": "completed"
                        },
                        "message_id": message_id,
                        "target_agent_url": target_agent_url
                    }
                else:
                    return {
                        "status": "error",
                        "error": f"A2A message failed: {response.text}",
                        "message_id": message_id,
                        "target_agent_url": target_agent_url
                    }
                
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "message_id": message_id,
                "target_agent_url": target_agent_url
            }

# Global A2A manager
a2a_manager = A2AClientManager()

def a2a_discover_agent(url: str) -> Dict[str, Any]:
    """
    Discover an A2A agent and return its capabilities.
    
    Args:
        url: The base URL of the A2A agent to discover
    
    Returns:
        Dict with discovery results including agent card and capabilities
    """
    try:
        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(a2a_manager.discover_agent(url))
            return result
        finally:
            loop.close()
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "url": url
        }

def a2a_list_discovered_agents() -> Dict[str, Any]:
    """
    List all discovered A2A agents and their capabilities.
    
    Returns:
        Dict with information about all discovered agents
    """
    try:
        agents = list(a2a_manager.discovered_agents.values())
        return {
            "status": "success",
            "agents": agents,
            "total_count": len(agents)
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "total_count": 0
        }

def a2a_send_message(message_text: str, target_agent_url: str, message_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Send a message to a specific A2A agent and return the response.
    
    Args:
        message_text: The message content to send
        target_agent_url: The URL of the target A2A agent
        message_id: Optional message ID for tracking
    
    Returns:
        Dict with response data from the target agent
    """
    try:
        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                a2a_manager.send_message(message_text, target_agent_url, message_id)
            )
            return result
        finally:
            loop.close()
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message_id": message_id,
            "target_agent_url": target_agent_url
        }

# =============================================================================
# MULTI-AGENT COORDINATION TOOLS
# =============================================================================

def coordinate_agents(task_description: str, 
                     agent_urls: List[str],
                     coordination_strategy: str = "sequential") -> Dict[str, Any]:
    """
    Coordinate multiple A2A agents to complete a complex task.
    
    Args:
        task_description: Description of the task to be completed
        agent_urls: List of A2A agent URLs to coordinate
        coordination_strategy: Strategy for coordination ("sequential", "parallel", "hierarchical")
    
    Returns:
        Dict with coordination results and agent responses
    """
    try:
        if not agent_urls:
            return {
                "status": "error",
                "error": "No agent URLs provided"
            }
        
        results = []
        
        if coordination_strategy == "sequential":
            # Execute tasks sequentially
            current_context = task_description
            for i, url in enumerate(agent_urls):
                message = f"Task {i+1}/{len(agent_urls)}: {current_context}"
                result = a2a_send_message(message, url)
                results.append({
                    "agent_url": url,
                    "task_index": i + 1,
                    "result": result
                })
                
                # Update context for next agent
                if result.get("status") == "success":
                    response_text = result.get("response", {}).get("response_text", "")
                    current_context = f"Previous agent completed: {response_text}\nContinue with: {task_description}"
        
        elif coordination_strategy == "parallel":
            # Execute tasks in parallel (simulated)
            for i, url in enumerate(agent_urls):
                message = f"Parallel task {i+1}: {task_description}"
                result = a2a_send_message(message, url)
                results.append({
                    "agent_url": url,
                    "task_index": i + 1,
                    "result": result
                })
        
        elif coordination_strategy == "hierarchical":
            # Hierarchical coordination with a coordinator agent
            if len(agent_urls) < 2:
                return {
                    "status": "error",
                    "error": "Hierarchical coordination requires at least 2 agents"
                }
            
            coordinator_url = agent_urls[0]
            worker_urls = agent_urls[1:]
            
            # Send task to coordinator
            coordinator_message = f"Coordinate this task with {len(worker_urls)} worker agents: {task_description}"
            coordinator_result = a2a_send_message(coordinator_message, coordinator_url)
            results.append({
                "agent_url": coordinator_url,
                "role": "coordinator",
                "result": coordinator_result
            })
            
            # Send subtasks to workers
            for i, url in enumerate(worker_urls):
                worker_message = f"Worker task {i+1}: {task_description}"
                worker_result = a2a_send_message(worker_message, url)
                results.append({
                    "agent_url": url,
                    "role": "worker",
                    "task_index": i + 1,
                    "result": worker_result
                })
        
        # Analyze results
        successful_tasks = sum(1 for r in results if r.get("result", {}).get("status") == "success")
        
        return {
            "status": "success",
            "coordination_strategy": coordination_strategy,
            "total_agents": len(agent_urls),
            "successful_tasks": successful_tasks,
            "results": results,
            "summary": f"Coordinated {len(agent_urls)} agents using {coordination_strategy} strategy. {successful_tasks}/{len(results)} tasks completed successfully."
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "coordination_strategy": coordination_strategy
        }

def agent_handoff(current_task: str,
                 source_agent_context: str,
                 target_agent_url: str,
                 handoff_reason: str = "Task delegation") -> Dict[str, Any]:
    """
    Hand off a task from the current agent to another A2A agent.
    
    Args:
        current_task: Description of the current task
        source_agent_context: Context from the source agent
        target_agent_url: URL of the target agent to hand off to
        handoff_reason: Reason for the handoff
    
    Returns:
        Dict with handoff results
    """
    try:
        # Prepare handoff message
        handoff_message = f"""AGENT HANDOFF
Reason: {handoff_reason}

Original Task: {current_task}

Source Agent Context:
{source_agent_context}

Please continue with this task using the provided context."""
        
        # Send handoff message
        result = a2a_send_message(handoff_message, target_agent_url)
        
        return {
            "status": "success",
            "handoff_reason": handoff_reason,
            "target_agent_url": target_agent_url,
            "handoff_result": result,
            "message": f"Task successfully handed off to agent at {target_agent_url}"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "target_agent_url": target_agent_url,
            "handoff_reason": handoff_reason
        }

# Export all collaboration tools
COLLABORATION_TOOLS = {
    'think': think,
    'a2a_discover_agent': a2a_discover_agent,
    'a2a_list_discovered_agents': a2a_list_discovered_agents,
    'a2a_send_message': a2a_send_message,
    'coordinate_agents': coordinate_agents,
    'agent_handoff': agent_handoff
}

print("[Strands Collaboration] ✅ Multi-agent collaboration tools loaded successfully!")
print(f"[Strands Collaboration] Available tools: {list(COLLABORATION_TOOLS.keys())}")