#!/usr/bin/env python3
"""
A2A LLM Integration
Real A2A communication that processes messages through LLMs
"""

import requests
import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime

class A2ALLMIntegration:
    """Real A2A communication with LLM processing"""
    
    def __init__(self, strands_sdk_url: str = "http://localhost:5006"):
        self.strands_sdk_url = strands_sdk_url
        self.message_history: List[Dict[str, Any]] = []
    
    def send_a2a_message_with_llm(self, from_agent_id: str, to_agent_id: str, content: str) -> Dict[str, Any]:
        """Send A2A message and process through LLM"""
        try:
            print(f"🤖 A2A LLM Processing: {from_agent_id} → {to_agent_id}")
            print(f"📝 Message: {content}")
            
            # Step 1: Execute the receiving agent with the message
            execution_response = requests.post(
                f"{self.strands_sdk_url}/api/strands-sdk/agents/{to_agent_id}/execute",
                json={
                    "input": f"A2A Message from {from_agent_id}: {content}",
                    "stream": False
                },
                timeout=60
            )
            
            if execution_response.status_code != 200:
                return {
                    "status": "error",
                    "error": f"Failed to execute agent {to_agent_id}: {execution_response.text}"
                }
            
            execution_data = execution_response.json()
            agent_response = execution_data.get("response", "No response generated")
            tools_used = execution_data.get("tools_used", [])
            
            # Step 2: Store the conversation
            message_id = f"a2a_{int(datetime.now().timestamp() * 1000)}"
            
            conversation = {
                "id": message_id,
                "from_agent_id": from_agent_id,
                "to_agent_id": to_agent_id,
                "original_message": content,
                "agent_response": agent_response,
                "tools_used": tools_used,
                "timestamp": datetime.now().isoformat(),
                "status": "processed"
            }
            
            self.message_history.append(conversation)
            
            print(f"✅ A2A LLM Response: {agent_response}")
            print(f"🔧 Tools Used: {tools_used}")
            
            return {
                "status": "success",
                "message_id": message_id,
                "original_message": content,
                "agent_response": agent_response,
                "tools_used": tools_used,
                "timestamp": conversation["timestamp"]
            }
            
        except Exception as e:
            print(f"❌ A2A LLM Error: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_a2a_conversation_history(self) -> List[Dict[str, Any]]:
        """Get A2A conversation history with LLM responses"""
        return self.message_history
    
    def get_agent_capabilities(self, agent_id: str) -> Dict[str, Any]:
        """Get agent capabilities"""
        try:
            response = requests.get(f"{self.strands_sdk_url}/api/strands-sdk/agents/{agent_id}")
            if response.status_code == 200:
                agent_data = response.json()
                return {
                    "id": agent_data["id"],
                    "name": agent_data["name"],
                    "tools": agent_data.get("tools", []),
                    "model": agent_data.get("model_id", ""),
                    "status": "active"
                }
            return {"error": "Agent not found"}
        except Exception as e:
            return {"error": str(e)}

# Global instance
a2a_llm_integration = A2ALLMIntegration()

def get_a2a_llm_integration():
    return a2a_llm_integration




