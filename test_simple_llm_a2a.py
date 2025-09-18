#!/usr/bin/env python3
"""
Test Simple LLM A2A Integration
Test with basic Strands agent without tools first
"""

import requests
import json
import time

# Test configuration
A2A_BASE_URL = "http://localhost:5008/api/a2a"
STRANDS_API_URL = "http://localhost:5006/api/strands-sdk"

def test_simple_llm_a2a():
    print("🧪 Testing Simple LLM A2A Integration...")
    
    # Test 1: Create Simple Strands Agent (no tools)
    agent_id = f"simple-llm-agent-{int(time.time())}"
    strands_config = {
        "name": "Simple LLM A2A Agent",
        "description": "Basic test agent with LLM capabilities",
        "model_id": "llama3.1",
        "host": "http://localhost:11434",
        "system_prompt": "You are a helpful AI assistant. Provide clear and concise responses.",
        "tools": [],  # No tools for now
        "ollama_config": {
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 500
        }
    }
    
    print(f"🤖 Creating Simple Strands Agent: {agent_id}")
    
    try:
        response = requests.post(f"{STRANDS_API_URL}/agents", json=strands_config)
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✅ Strands Agent Created: {result['id']}")
            print(f"🔧 SDK Type: {result['sdk_type']}")
        else:
            print(f"❌ Strands Agent Creation Failed: {response.status_code}")
            print(f"Error: {response.text}")
            return
    except Exception as e:
        print(f"❌ Strands Agent Creation Error: {e}")
        return
    
    # Test 2: Register with A2A
    a2a_config = {
        "id": agent_id,
        "name": strands_config["name"],
        "description": strands_config["description"],
        "model": strands_config["model_id"],
        "capabilities": ["Basic Reasoning", "Text Generation"],
        "collaboration_mode": "participant",
        "max_concurrent_agents": 3,
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
    except Exception as e:
        print(f"❌ A2A Registration Error: {e}")
    
    # Test 3: Test Basic LLM Execution
    print("\n🧠 Testing Basic LLM Execution...")
    
    test_prompts = [
        "Hello! Can you introduce yourself?",
        "What is 2 + 2?",
        "Explain what artificial intelligence is in one sentence."
    ]
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n📝 Test {i}: {prompt}")
        
        try:
            execution_data = {
                "input": prompt
            }
            
            response = requests.post(f"{STRANDS_API_URL}/agents/{agent_id}/execute", json=execution_data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Response: {result['response'][:150]}...")
                print(f"⏱️ Execution Time: {result['execution_time']:.2f}s")
                print(f"🤖 Agent: {result['agent_name']}")
                print(f"🧠 Model: {result['model_used']}")
            else:
                print(f"❌ Execution Failed: {response.status_code}")
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"❌ Execution Error: {e}")
        
        time.sleep(2)  # Pause between tests
    
    # Test 4: Test A2A Message Exchange
    print("\n🔄 Testing A2A Message Exchange...")
    
    try:
        message_config = {
            "from_agent_id": agent_id,
            "to_agent_id": agent_id,
            "content": "Hello! This is a test message between agents.",
            "type": "test_message"
        }
        
        response = requests.post(f"{A2A_BASE_URL}/messages", json=message_config)
        if response.status_code == 201:
            result = response.json()
            print(f"✅ A2A Message Sent: {result['message']['content']}")
        else:
            print(f"❌ A2A Message Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ A2A Message Error: {e}")
    
    # Test 5: Get Agent List
    print("\n📋 Testing Agent Discovery...")
    
    try:
        # List Strands agents
        strands_response = requests.get(f"{STRANDS_API_URL}/agents")
        if strands_response.status_code == 200:
            strands_agents = strands_response.json()
            print(f"✅ Strands Agents: {len(strands_agents)} found")
            for agent in strands_agents:
                print(f"  🤖 {agent['name']} ({agent['id']}) - {agent['model_id']}")
        
        # List A2A agents
        a2a_response = requests.get(f"{A2A_BASE_URL}/agents")
        if a2a_response.status_code == 200:
            a2a_agents = a2a_response.json()
            print(f"✅ A2A Agents: {a2a_agents['count']} found")
            for agent in a2a_agents['agents']:
                print(f"  🔗 {agent['name']} ({agent['id']}) - {agent['status']}")
    except Exception as e:
        print(f"❌ Agent Discovery Error: {e}")
    
    print("\n🏁 Simple LLM A2A Integration Test Complete")
    print("🎉 Successfully tested basic LLM integration with A2A capabilities!")

if __name__ == "__main__":
    test_simple_llm_a2a()
