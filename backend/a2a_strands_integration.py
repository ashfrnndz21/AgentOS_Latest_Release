#!/usr/bin/env python3
"""
A2A Strands Integration
Integrates A2A communication with Strands SDK agents
"""

import requests
import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime

class A2AStrandsIntegration:
    """Integrates A2A communication with Strands SDK agents"""
    
    def __init__(self, a2a_service_url: str = "http://localhost:5008", strands_sdk_url: str = "http://localhost:5006"):
        self.a2a_service_url = a2a_service_url
        self.strands_sdk_url = strands_sdk_url
        self.registered_agents: Dict[str, str] = {}  # agent_id -> a2a_agent_id mapping
    
    def register_strands_agent_for_a2a(self, strands_agent_id: str, strands_agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a Strands SDK agent for A2A communication"""
        try:
            # Prepare A2A agent data
            a2a_agent_data = {
                "id": f"strands_{strands_agent_id}",
                "name": strands_agent_data.get("name", f"Strands Agent {strands_agent_id}"),
                "description": strands_agent_data.get("description", ""),
                "model": strands_agent_data.get("model_id", ""),
                "capabilities": strands_agent_data.get("tools", []),
                "strands_agent_id": strands_agent_id,
                "strands_data": strands_agent_data
            }
            
            # Register with A2A service
            response = requests.post(
                f"{self.a2a_service_url}/api/a2a/agents",
                json=a2a_agent_data,
                timeout=10
            )
            
            if response.status_code == 201:
                result = response.json()
                self.registered_agents[strands_agent_id] = result["agent"]["id"]
                
                print(f"🤖 Strands agent registered for A2A: {strands_agent_data['name']} -> {result['agent']['id']}")
                
                return {
                    "status": "success",
                    "strands_agent_id": strands_agent_id,
                    "a2a_agent_id": result["agent"]["id"],
                    "agent": result["agent"]
                }
            else:
                return {
                    "status": "error",
                    "error": f"A2A registration failed: {response.text}"
                }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def send_a2a_message(self, from_strands_agent_id: str, to_strands_agent_id: str, content: str) -> Dict[str, Any]:
        """Send an A2A message between Strands agents"""
        try:
            # Get A2A agent IDs
            from_a2a_id = self.registered_agents.get(from_strands_agent_id)
            to_a2a_id = self.registered_agents.get(to_strands_agent_id)
            
            if not from_a2a_id or not to_a2a_id:
                return {
                    "status": "error",
                    "error": "One or both agents not registered for A2A communication"
                }
            
            # Send message via A2A service
            response = requests.post(
                f"{self.a2a_service_url}/api/a2a/messages",
                json={
                    "from_agent_id": from_a2a_id,
                    "to_agent_id": to_a2a_id,
                    "content": content,
                    "type": "strands_message"
                },
                timeout=10
            )
            
            if response.status_code == 201:
                result = response.json()
                print(f"📨 A2A message sent: {from_strands_agent_id} -> {to_strands_agent_id}")
                return result
            else:
                return {
                    "status": "error",
                    "error": f"A2A message failed: {response.text}"
                }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_a2a_agents(self) -> List[Dict[str, Any]]:
        """Get list of A2A registered agents"""
        try:
            response = requests.get(f"{self.a2a_service_url}/api/a2a/agents", timeout=10)
            if response.status_code == 200:
                return response.json().get("agents", [])
            else:
                return []
        except Exception as e:
            print(f"Error getting A2A agents: {e}")
            return []
    
    def get_a2a_message_history(self, strands_agent_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get A2A message history"""
        try:
            params = {}
            if strands_agent_id and strands_agent_id in self.registered_agents:
                params["agent_id"] = self.registered_agents[strands_agent_id]
            
            response = requests.get(
                f"{self.a2a_service_url}/api/a2a/messages/history",
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json().get("messages", [])
            else:
                return []
        except Exception as e:
            print(f"Error getting A2A message history: {e}")
            return []
    
    def create_a2a_connection(self, from_strands_agent_id: str, to_strands_agent_id: str) -> Dict[str, Any]:
        """Create an A2A connection between Strands agents"""
        try:
            from_a2a_id = self.registered_agents.get(from_strands_agent_id)
            to_a2a_id = self.registered_agents.get(to_strands_agent_id)
            
            if not from_a2a_id or not to_a2a_id:
                return {
                    "status": "error",
                    "error": "One or both agents not registered for A2A communication"
                }
            
            response = requests.post(
                f"{self.a2a_service_url}/api/a2a/connections",
                json={
                    "from_agent_id": from_a2a_id,
                    "to_agent_id": to_a2a_id
                },
                timeout=10
            )
            
            if response.status_code == 201:
                result = response.json()
                print(f"🔗 A2A connection created: {from_strands_agent_id} <-> {to_strands_agent_id}")
                return result
            else:
                return {
                    "status": "error",
                    "error": f"A2A connection failed: {response.text}"
                }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def auto_register_all_strands_agents(self) -> Dict[str, Any]:
        """Automatically register all Strands SDK agents for A2A communication"""
        try:
            # Get all Strands SDK agents
            response = requests.get(f"{self.strands_sdk_url}/api/strands-sdk/agents", timeout=10)
            if response.status_code != 200:
                return {
                    "status": "error",
                    "error": "Failed to get Strands SDK agents"
                }
            
            strands_data = response.json()
            strands_agents = strands_data.get("agents", [])
            registered_count = 0
            errors = []
            
            for agent in strands_agents:
                result = self.register_strands_agent_for_a2a(agent["id"], agent)
                if result["status"] == "success":
                    registered_count += 1
                else:
                    errors.append(f"Agent {agent['name']}: {result['error']}")
            
            return {
                "status": "success",
                "registered_count": registered_count,
                "total_agents": len(strands_agents),
                "errors": errors
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

# Global integration instance
a2a_integration = A2AStrandsIntegration()

def get_a2a_integration() -> A2AStrandsIntegration:
    """Get the global A2A integration instance"""
    return a2a_integration
