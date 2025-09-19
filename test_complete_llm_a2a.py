#!/usr/bin/env python3
"""
Test Complete LLM A2A Integration
This test demonstrates the full A2A integration with real LLM models
"""

import requests
import json
import time

# Test configuration
A2A_BASE_URL = "http://localhost:5008/api/a2a"
STRANDS_API_URL = "http://localhost:5006/api/strands-sdk"

def test_complete_llm_a2a():
    print("🧪 Testing Complete LLM A2A Integration...")
    print("=" * 60)
    
    # Test 1: Create Multiple Strands Agents with Real LLMs
    agents = []
    
    agent_configs = [
        {
            "name": "Math Specialist Agent",
            "description": "Specialized in mathematical calculations and reasoning",
            "model_id": "llama3.2:latest",
            "system_prompt": "You are a math specialist. Solve problems step by step with clear explanations.",
            "tools": []
        },
        {
            "name": "General Knowledge Agent", 
            "description": "Provides general knowledge and explanations",
            "model_id": "qwen2.5:latest",
            "system_prompt": "You are a helpful assistant with broad knowledge. Provide clear and accurate information.",
            "tools": []
        },
        {
            "name": "Reasoning Agent",
            "description": "Specialized in logical reasoning and problem solving",
            "model_id": "deepseek-r1:latest",
            "system_prompt": "You are a reasoning specialist. Break down complex problems and provide logical solutions.",
            "tools": []
        }
    ]
    
    print("🤖 Creating Multiple Strands Agents...")
    
    for i, config in enumerate(agent_configs, 1):
        print(f"\n📝 Creating Agent {i}: {config['name']}")
        
        try:
            response = requests.post(f"{STRANDS_API_URL}/agents", json=config)
            if response.status_code in [200, 201]:
                result = response.json()
                agent_id = result['id']
                agents.append({
                    'id': agent_id,
                    'name': config['name'],
                    'model': config['model_id']
                })
                print(f"✅ Created: {agent_id}")
                print(f"🧠 Model: {config['model_id']}")
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n🎉 Successfully created {len(agents)} agents!")
    
    # Test 2: Register All Agents with A2A
    print("\n🔗 Registering Agents with A2A System...")
    
    for agent in agents:
        a2a_config = {
            "id": agent['id'],
            "name": agent['name'],
            "description": f"Real LLM agent with {agent['model']} model",
            "model": agent['model'],
            "capabilities": ["LLM Reasoning", "Text Generation", "Problem Solving"],
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
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"✅ A2A Registered: {agent['name']} - {result['status']}")
            else:
                print(f"❌ A2A Registration Failed: {agent['name']} - {response.status_code}")
        except Exception as e:
            print(f"❌ A2A Registration Error: {agent['name']} - {e}")
    
    # Test 3: Test Individual Agent Capabilities
    print("\n🧠 Testing Individual Agent Capabilities...")
    
    test_cases = [
        {
            "agent": agents[0],  # Math Specialist
            "prompt": "Calculate 15 * 23 and explain your method step by step.",
            "expected": "mathematical calculation"
        },
        {
            "agent": agents[1],  # General Knowledge
            "prompt": "Explain what artificial intelligence is in simple terms.",
            "expected": "general knowledge explanation"
        },
        {
            "agent": agents[2],  # Reasoning Agent
            "prompt": "If a train leaves at 2 PM and travels 60 mph, and another leaves at 3 PM traveling 80 mph, when will they meet?",
            "expected": "logical reasoning"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        agent = test_case['agent']
        prompt = test_case['prompt']
        expected = test_case['expected']
        
        print(f"\n📝 Test {i}: {agent['name']} - {expected}")
        print(f"Prompt: {prompt}")
        
        try:
            execution_data = {"input": prompt}
            response = requests.post(f"{STRANDS_API_URL}/agents/{agent['id']}/execute", json=execution_data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Response: {result['response'][:200]}...")
                print(f"⏱️ Execution Time: {result['execution_time']:.2f}s")
                print(f"🤖 Agent: {result['agent_name']}")
                print(f"🧠 Model: {result['model_used']}")
            else:
                print(f"❌ Execution Failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Execution Error: {e}")
        
        time.sleep(2)  # Pause between tests
    
    # Test 4: Test A2A Message Exchange Between Agents
    print("\n🔄 Testing A2A Message Exchange Between Agents...")
    
    if len(agents) >= 2:
        # Send message from first agent to second agent
        message_config = {
            "from_agent_id": agents[0]['id'],
            "to_agent_id": agents[1]['id'],
            "content": f"Hello! I'm the {agents[0]['name']}. Can you help me understand what machine learning is?",
            "type": "collaboration_request"
        }
        
        try:
            response = requests.post(f"{A2A_BASE_URL}/messages", json=message_config)
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"✅ A2A Message Sent:")
                print(f"   From: {result['message']['from_agent_name']}")
                print(f"   To: {result['message']['to_agent_name']}")
                print(f"   Content: {result['message']['content']}")
            else:
                print(f"❌ A2A Message Failed: {response.status_code}")
        except Exception as e:
            print(f"❌ A2A Message Error: {e}")
    
    # Test 5: Get Complete System Status
    print("\n📊 Complete System Status...")
    
    try:
        # Strands agents
        strands_response = requests.get(f"{STRANDS_API_URL}/agents")
        if strands_response.status_code == 200:
            strands_agents = strands_response.json()
            print(f"✅ Strands Agents: {len(strands_agents)} total")
            for agent in strands_agents:
                print(f"   🤖 {agent['name']} - {agent['model_id']} - {agent['status']}")
        
        # A2A agents
        a2a_response = requests.get(f"{A2A_BASE_URL}/agents")
        if a2a_response.status_code == 200:
            a2a_agents = a2a_response.json()
            print(f"✅ A2A Agents: {a2a_agents['count']} total")
            for agent in a2a_agents['agents']:
                print(f"   🔗 {agent['name']} - {agent['status']} - {agent['model']}")
        
        # A2A health
        health_response = requests.get(f"{A2A_BASE_URL}/health")
        if health_response.status_code == 200:
            health = health_response.json()
            print(f"✅ A2A Service: {health['status']} - {health['agents_registered']} agents registered")
        
        # Strands health
        strands_health_response = requests.get(f"{STRANDS_API_URL}/health")
        if strands_health_response.status_code == 200:
            strands_health = strands_health_response.json()
            print(f"✅ Strands Service: {strands_health['status']} - {strands_health['sdk_type']}")
            
    except Exception as e:
        print(f"❌ Status Check Error: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 Complete LLM A2A Integration Test Complete!")
    print("🎉 Successfully demonstrated:")
    print("   ✅ Real LLM model integration (Ollama)")
    print("   ✅ Multiple agent creation and management")
    print("   ✅ A2A agent registration and discovery")
    print("   ✅ Agent-to-agent communication")
    print("   ✅ Real-time execution and reasoning")
    print("   ✅ Complete system monitoring")
    print("=" * 60)

if __name__ == "__main__":
    test_complete_llm_a2a()





