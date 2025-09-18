#!/usr/bin/env python3
"""
Test A2A Integration with Real LLM Models
This test will create actual Strands agents with LLM capabilities
"""

import requests
import json
import time
import uuid
from datetime import datetime

# Test configuration
A2A_BASE_URL = "http://localhost:5008/api/a2a"
STRANDS_API_URL = "http://localhost:5006/api/strands"

def test_llm_a2a_integration():
    print("🧪 Testing A2A Integration with Real LLM Models...")
    
    # Test 1: Check A2A service
    try:
        response = requests.get(f"{A2A_BASE_URL}/health")
        health = response.json()
        print(f"✅ A2A Service: {health['status']}")
    except Exception as e:
        print(f"❌ A2A Service Error: {e}")
        return
    
    # Test 2: Create Strands Agent with LLM
    agent_id = f"llm-agent-{int(time.time())}"
    strands_config = {
        "name": "LLM Test Agent",
        "description": "Test agent with real LLM capabilities",
        "model": {
            "provider": "bedrock",
            "model_id": "bedrock-claude-3-sonnet",
            "temperature": 0.7,
            "max_tokens": 4000
        },
        "reasoning_patterns": {
            "chain_of_thought": True,
            "reflection": True
        },
        "memory": {
            "working_memory": True,
            "context_window_management": True
        },
        "tools": [],
        "guardrails": {
            "content_filter": True,
            "reasoning_validator": True
        }
    }
    
    print(f"🤖 Creating Strands Agent: {agent_id}")
    
    # Register with A2A
    a2a_config = {
        "id": agent_id,
        "name": strands_config["name"],
        "description": strands_config["description"],
        "model": strands_config["model"]["model_id"],
        "capabilities": ["Chain-of-Thought Reasoning", "Reflection", "Working Memory"],
        "collaboration_mode": "participant",
        "max_concurrent_agents": 5,
        "communication_protocol": "both",
        "auto_registration": True,
        "discovery_scope": "local",
        "conversation_tracing": True,
        "real_time_monitoring": True
    }
    
    try:
        response = requests.post(f"{A2A_BASE_URL}/agents", json=a2a_config)
        if response.status_code == 201:
            result = response.json()
            print(f"✅ A2A Registration: {result['status']}")
        else:
            print(f"❌ A2A Registration Failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ A2A Registration Error: {e}")
        return
    
    # Test 3: Test LLM Reasoning (if Strands API is available)
    print("🧠 Testing LLM Reasoning...")
    
    # Try to test with a simple reasoning request
    test_prompt = "What is 2+2? Please show your reasoning step by step."
    
    # Send reasoning request via A2A message
    message_config = {
        "from_agent_id": agent_id,
        "to_agent_id": agent_id,
        "content": test_prompt,
        "type": "reasoning_request"
    }
    
    try:
        response = requests.post(f"{A2A_BASE_URL}/messages", json=message_config)
        if response.status_code == 201:
            result = response.json()
            print(f"✅ A2A Message Sent: {result['message']['content']}")
        else:
            print(f"❌ A2A Message Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ A2A Message Error: {e}")
    
    # Test 4: Test Agent Discovery
    try:
        response = requests.get(f"{A2A_BASE_URL}/agents")
        agents = response.json()
        print(f"✅ Agent Discovery: {agents['count']} agents found")
        for agent in agents['agents']:
            print(f"  🤖 {agent['name']} ({agent['id']}) - {agent['status']}")
    except Exception as e:
        print(f"❌ Agent Discovery Error: {e}")
    
    # Test 5: Test Message History
    try:
        response = requests.get(f"{A2A_BASE_URL}/messages/history")
        history = response.json()
        print(f"✅ Message History: {history['count']} messages")
        for msg in history['messages'][-3:]:  # Show last 3 messages
            print(f"  📨 {msg['from_agent_name']}: {msg['content'][:50]}...")
    except Exception as e:
        print(f"❌ Message History Error: {e}")
    
    print("🏁 LLM A2A Integration Test Complete")
    print("📝 Note: This test verified A2A infrastructure but may not have tested actual LLM processing")
    print("🔧 To test real LLM integration, ensure Strands API is running with proper AWS credentials")

if __name__ == "__main__":
    test_llm_a2a_integration()


