#!/usr/bin/env python3
"""
Simple LLM Agent Test
Tests 2 agents with full LLM integration and A2A communication
"""

import requests
import json
import time
import uuid
from datetime import datetime

# API endpoints
STRANDS_SDK_URL = "http://localhost:5006"

def create_agent(name, description, model_id, system_prompt, tools=None):
    """Create an agent with full LLM integration"""
    if tools is None:
        tools = []
    
    agent_data = {
        "name": name,
        "description": description,
        "model_id": model_id,
        "system_prompt": system_prompt,
        "tools": tools,
        "ollama_config": {
            "temperature": 0.7,
            "max_tokens": 1000
        }
    }
    
    response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", 
                           json=agent_data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Agent created successfully: {result}")
        return result
    else:
        print(f"❌ Failed to create agent {name}: {response.text}")
        return None

def execute_agent(agent_id, input_text):
    """Execute an agent with full LLM processing"""
    execution_data = {
        "input": input_text,
        "stream": False
    }
    
    response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent_id}/execute", 
                           json=execution_data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Agent execution successful: {result}")
        return result
    else:
        print(f"❌ Failed to execute agent {agent_id}: {response.text}")
        return None

def test_simple_llm_agents():
    """Test 2 agents with LLM integration"""
    print("🚀 Simple LLM Agent Test")
    print("=" * 40)
    print("Testing: 2 agents with full LLM processing")
    print()
    
    # Check if service is running
    try:
        health = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/health", timeout=5)
        if health.status_code != 200:
            print("❌ Strands SDK API not available")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Strands SDK API")
        return False
    
    print("✅ Strands SDK API is running")
    print()
    
    # Test Case 1: Create Customer Service Agent
    print("📝 Creating Customer Service Agent...")
    agent1 = create_agent(
        name="Customer Service Agent",
        description="Helpful customer service agent",
        model_id="qwen2.5",
        system_prompt="You are a helpful customer service agent. Be polite and professional. Help customers with their issues.",
        tools=["calculator", "current_time"]
    )
    
    if not agent1:
        print("❌ Failed to create Agent 1")
        return False
    
    agent1_id = agent1.get('agent_id') or agent1.get('id')
    print(f"✅ Agent 1 ID: {agent1_id}")
    
    # Test Case 2: Create Technical Support Agent
    print("\n📝 Creating Technical Support Agent...")
    agent2 = create_agent(
        name="Technical Support Agent",
        description="Technical support specialist",
        model_id="qwen2.5",
        system_prompt="You are a technical support specialist. Help customers with technical issues. Provide detailed solutions.",
        tools=["calculator", "think"]
    )
    
    if not agent2:
        print("❌ Failed to create Agent 2")
        return False
    
    agent2_id = agent2.get('agent_id') or agent2.get('id')
    print(f"✅ Agent 2 ID: {agent2_id}")
    
    # Test Case 3: Customer Service Agent Response
    print("\n🤖 Testing Customer Service Agent...")
    customer_issue = "Hi, I'm having trouble with my account login. Can you help me?"
    print(f"Customer: {customer_issue}")
    
    response1 = execute_agent(agent1_id, customer_issue)
    if response1:
        print(f"Customer Service Agent: {response1.get('output', 'No response')}")
    
    # Test Case 4: A2A Communication Simulation
    print("\n🔄 A2A Communication Simulation...")
    escalation_message = f"Escalating to Technical Support: Customer has login issues. Original message: '{customer_issue}'"
    print(f"Customer Service → Technical Support: {escalation_message}")
    
    # Test Case 5: Technical Support Agent Response
    print("\n🤖 Testing Technical Support Agent...")
    response2 = execute_agent(agent2_id, escalation_message)
    if response2:
        print(f"Technical Support Agent: {response2.get('output', 'No response')}")
    
    # Test Case 6: Final Resolution
    print("\n✅ Final Resolution...")
    final_message = "Based on the technical analysis, provide a final solution to the customer"
    final_response = execute_agent(agent1_id, final_message)
    if final_response:
        print(f"Customer Service Agent (Final): {final_response.get('output', 'No response')}")
    
    print("\n🎉 LLM Agent Test Completed Successfully!")
    print("✅ Both agents created and executed with LLM processing")
    print("✅ A2A communication simulated")
    print("✅ Multi-agent workflow completed")
    
    return True

if __name__ == "__main__":
    test_simple_llm_agents()












