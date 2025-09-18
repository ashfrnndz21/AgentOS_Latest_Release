#!/usr/bin/env python3
"""
A2A Client
Client for communicating with A2A agents
"""

import requests
import json
from typing import Dict, List, Optional, Any
from datetime import datetime

class A2AClient:
    """Client for A2A agent communication"""
    
    def __init__(self, registry_url: str = "http://localhost:5010"):
        self.registry_url = registry_url
        self.agents = {}
        self.load_agents()
    
    def load_agents(self):
        """Load available agents from registry"""
        try:
            response = requests.get(f"{self.registry_url}/agents", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.agents = {agent['id']: agent for agent in data.get('agents', [])}
                print(f"✅ Loaded {len(self.agents)} agents from registry")
            else:
                print("⚠️ Failed to load agents from registry")
        except Exception as e:
            print(f"⚠️ Error loading agents: {e}")
    
    def get_agents(self) -> List[Dict[str, Any]]:
        """Get list of available agents"""
        return list(self.agents.values())
    
    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get specific agent by ID"""
        return self.agents.get(agent_id)
    
    def send_message(self, agent_id: str, message: str, from_agent: str = "A2A Client") -> Dict[str, Any]:
        """Send a message to an agent"""
        try:
            agent = self.get_agent(agent_id)
            if not agent:
                return {"status": "error", "error": "Agent not found"}
            
            url = agent['url']
            response = requests.post(
                f"{url}/a2a/message",
                json={
                    "from_agent": from_agent,
                    "message": message
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"status": "error", "error": f"Agent returned status {response.status_code}"}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def execute_agent(self, agent_id: str, input_text: str) -> Dict[str, Any]:
        """Execute an agent with input"""
        try:
            agent = self.get_agent(agent_id)
            if not agent:
                return {"status": "error", "error": "Agent not found"}
            
            url = agent['url']
            response = requests.post(
                f"{url}/execute",
                json={"input": input_text},
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"status": "error", "error": f"Agent returned status {response.status_code}"}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def coordinate_agents(self, task: str, agent_ids: List[str]) -> Dict[str, Any]:
        """Coordinate multiple agents for a task"""
        try:
            # Find coordinator agent
            coordinator = None
            for agent in self.agents.values():
                if 'coordinator' in agent.get('name', '').lower():
                    coordinator = agent
                    break
            
            if not coordinator:
                return {"status": "error", "error": "No coordinator agent found"}
            
            # Send coordination request
            url = coordinator['url']
            response = requests.post(
                f"{url}/coordinate",
                json={
                    "task": task,
                    "agents": agent_ids
                },
                timeout=60
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"status": "error", "error": f"Coordinator returned status {response.status_code}"}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def discover_agent(self, url: str) -> Dict[str, Any]:
        """Discover an agent at a URL"""
        try:
            response = requests.post(
                f"{self.registry_url}/discover",
                json={"url": url},
                timeout=10
            )
            
            if response.status_code == 200:
                # Reload agents after discovery
                self.load_agents()
                return response.json()
            else:
                return {"status": "error", "error": f"Discovery failed with status {response.status_code}"}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Global A2A client instance
a2a_client = A2AClient()

def get_a2a_client():
    return a2a_client
