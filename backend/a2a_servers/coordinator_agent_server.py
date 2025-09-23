#!/usr/bin/env python3
"""
Coordinator Agent A2A Server
Independent A2A server that coordinates between other agents
"""

import requests
import json
from typing import List
from flask import request, jsonify
from base_a2a_server import BaseA2AServer

class CoordinatorA2AServer(BaseA2AServer):
    """Coordinator agent that manages other A2A agents"""
    
    def __init__(self, agent_name: str, port: int, host: str = "0.0.0.0"):
        super().__init__(agent_name, port, host)
        self.known_agents = {
            "calculator": "http://localhost:8001",
            "research": "http://localhost:8002"
        }
    
    def setup_routes(self):
        """Setup coordinator-specific routes"""
        super().setup_routes()
        
        @self.app.route('/agents', methods=['GET'])
        def list_agents():
            """List available agents"""
            return jsonify({
                "coordinator": self.agent_name,
                "available_agents": list(self.known_agents.keys()),
                "agent_urls": self.known_agents
            })
        
        @self.app.route('/coordinate', methods=['POST'])
        def coordinate_task():
            """Coordinate a task between multiple agents"""
            try:
                data = request.get_json()
                task = data.get('task', '')
                agents_needed = data.get('agents', [])
                
                results = {}
                
                for agent_name in agents_needed:
                    if agent_name in self.known_agents:
                        agent_url = self.known_agents[agent_name]
                        
                        # Send task to agent
                        response = requests.post(
                            f"{agent_url}/a2a/message",
                            json={
                                "from_agent": self.agent_name,
                                "message": task
                            },
                            timeout=30
                        )
                        
                        if response.status_code == 200:
                            results[agent_name] = response.json()
                        else:
                            results[agent_name] = {"error": "Agent unavailable"}
                    else:
                        results[agent_name] = {"error": "Agent not found"}
                
                return jsonify({
                    "coordinator": self.agent_name,
                    "task": task,
                    "results": results,
                    "status": "completed"
                })
                
            except Exception as e:
                return jsonify({
                    "error": str(e),
                    "status": "error"
                }), 500
    
    def create_agent(self, system_prompt: str, tools: List[str] = None, model_id: str = "llama3.2:latest"):
        """Create the coordinator agent"""
        super().create_agent(system_prompt, tools, model_id)
        
        # Note: Strands agents handle tools differently
        # The coordination functionality is available through the /coordinate endpoint
    
    def _create_coordinate_tool(self):
        """Create coordination tool"""
        @tool
        def coordinate_agents(task: str, agents: str) -> str:
            """Coordinate a task between multiple agents"""
            try:
                agent_list = [a.strip() for a in agents.split(',')]
                
                results = {}
                for agent_name in agent_list:
                    if agent_name in self.known_agents:
                        agent_url = self.known_agents[agent_name]
                        
                        response = requests.post(
                            f"{agent_url}/a2a/message",
                            json={
                                "from_agent": self.agent_name,
                                "message": task
                            },
                            timeout=30
                        )
                        
                        if response.status_code == 200:
                            results[agent_name] = response.json().get('response', 'No response')
                        else:
                            results[agent_name] = "Agent unavailable"
                    else:
                        results[agent_name] = "Agent not found"
                
                return f"Coordination results: {json.dumps(results, indent=2)}"
                
            except Exception as e:
                return f"Coordination error: {str(e)}"
        
        return coordinate_agents

def main():
    """Create and run Coordinator Agent A2A Server"""
    
    # Create A2A server
    server = CoordinatorA2AServer(
        agent_name="Coordinator Agent",
        port=8000,
        host="0.0.0.0"
    )
    
    # Create the coordinator agent
    server.create_agent(
        system_prompt="""You are a coordinator agent that manages and coordinates between specialized agents.

Your capabilities include:
- Analyzing tasks and determining which agents are needed
- Coordinating multi-agent workflows
- Managing communication between agents
- Synthesizing results from multiple agents

Available agents:
- Calculator Agent: Mathematical calculations and problem-solving
- Research Agent: Analysis, research, and information gathering

Always:
- Analyze the task to determine which agents are needed
- Coordinate effectively between agents
- Synthesize results into coherent responses
- Provide clear explanations of the coordination process

When receiving A2A messages, coordinate the appropriate agents to provide comprehensive assistance.""",
        tools=["think"],
        model_id="llama3.2:latest"
    )
    
    # Run the server
    server.run()

if __name__ == "__main__":
    main()
