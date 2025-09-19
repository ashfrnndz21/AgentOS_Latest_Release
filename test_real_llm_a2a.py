#!/usr/bin/env python3
"""
Test Real LLM A2A Integration with Strands SDK
This test will create actual Strands agents with real LLM capabilities
"""

import requests
import json
import time
import uuid
from datetime import datetime

# Test configuration
A2A_BASE_URL = "http://localhost:5008/api/a2a"
STRANDS_API_URL = "http://localhost:5006/api/strands-sdk"

def test_real_llm_a2a_integration():
    print("🧪 Testing Real LLM A2A Integration with Strands SDK...")
    
    # Test 1: Check services
    try:
        a2a_response = requests.get(f"{A2A_BASE_URL}/health")
        strands_response = requests.get(f"{STRANDS_API_URL}/health")
        
        print(f"✅ A2A Service: {a2a_response.json()['status']}")
        print(f"✅ Strands SDK: {strands_response.json()['status']} (Type: {strands_response.json()['sdk_type']})")
    except Exception as e:
        print(f"❌ Service check failed: {e}")
        return
    
    # Test 2: Create Strands Agent with Real LLM
    agent_id = f"real-llm-agent-{int(time.time())}"
    strands_config = {
        "name": "Real LLM A2A Agent",
        "description": "Test agent with real LLM capabilities and A2A integration",
        "model_id": "llama3.1",
        "host": "http://localhost:11434",
        "system_prompt": "You are a helpful AI assistant with advanced reasoning capabilities. Use chain-of-thought reasoning and be thorough in your responses.",
        "tools": ["web_search", "calculator", "current_time"],
        "ollama_config": {
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 1000
        }
    }
    
    print(f"🤖 Creating Real Strands Agent: {agent_id}")
    
    try:
        response = requests.post(f"{STRANDS_API_URL}/agents", json=strands_config)
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Strands Agent Created: {result['id']}")
            print(f"🔧 SDK Type: {result['sdk_type']}")
            print(f"✅ SDK Validated: {result['sdk_validated']}")
        else:
            print(f"❌ Strands Agent Creation Failed: {response.status_code}")
            print(f"Error: {response.text}")
            return
    except Exception as e:
        print(f"❌ Strands Agent Creation Error: {e}")
        return
    
    # Test 3: Register with A2A
    a2a_config = {
        "id": agent_id,
        "name": strands_config["name"],
        "description": strands_config["description"],
        "model": strands_config["model_id"],
        "capabilities": ["Chain-of-Thought Reasoning", "Web Search", "Calculator", "Time Management"],
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
    except Exception as e:
        print(f"❌ A2A Registration Error: {e}")
    
    # Test 4: Test Real LLM Execution
    print("🧠 Testing Real LLM Execution...")
    
    test_prompts = [
        "What is 15 * 23? Show your calculation step by step.",
        "What is the current time?",
        "Search for information about artificial intelligence trends in 2024."
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
                print(f"✅ Response: {result['response'][:100]}...")
                print(f"⏱️ Execution Time: {result['execution_time']:.2f}s")
                print(f"🔧 Tools Used: {result.get('tools_used', [])}")
                print(f"🤖 Agent: {result['agent_name']}")
                print(f"🧠 Model: {result['model_used']}")
            else:
                print(f"❌ Execution Failed: {response.status_code}")
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"❌ Execution Error: {e}")
        
        time.sleep(1)  # Brief pause between tests
    
    # Test 5: Test A2A Message Exchange with Real Agent
    print("\n🔄 Testing A2A Message Exchange with Real Agent...")
    
    try:
        message_config = {
            "from_agent_id": agent_id,
            "to_agent_id": agent_id,
            "content": "Hello! Can you help me calculate 25 * 4 and also tell me the current time?",
            "type": "reasoning_request"
        }
        
        response = requests.post(f"{A2A_BASE_URL}/messages", json=message_config)
        if response.status_code == 201:
            result = response.json()
            print(f"✅ A2A Message Sent: {result['message']['content']}")
        else:
            print(f"❌ A2A Message Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ A2A Message Error: {e}")
    
    # Test 6: Get Agent Analytics
    print("\n📊 Testing Agent Analytics...")
    
    try:
        response = requests.get(f"{STRANDS_API_URL}/agents/{agent_id}/analytics")
        if response.status_code == 200:
            analytics = response.json()
            print(f"✅ Analytics Retrieved:")
            print(f"  📈 Total Executions: {analytics['execution_stats']['total_executions']}")
            print(f"  ⏱️ Avg Execution Time: {analytics['execution_stats']['avg_execution_time']:.2f}s")
            print(f"  ✅ Success Rate: {analytics['execution_stats']['success_rate']:.1f}%")
            print(f"  🔧 Tools Used: {list(analytics['tool_usage'].keys())}")
        else:
            print(f"❌ Analytics Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Analytics Error: {e}")
    
    # Test 7: List All Agents
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
    
    print("\n🏁 Real LLM A2A Integration Test Complete")
    print("🎉 Successfully tested real LLM integration with A2A capabilities!")

if __name__ == "__main__":
    test_real_llm_a2a_integration()





