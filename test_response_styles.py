#!/usr/bin/env python3
"""
Test script to verify response style integration between frontend and backend
"""

import requests
import json

# Test the agent creation with new response style options
def test_agent_creation():
    print("🧪 Testing Agent Creation with Response Styles...")
    
    # Test data with all new response style options
    test_agent = {
        "name": "Test Response Style Agent",
        "description": "Testing response style integration",
        "model_id": "llama3.2:1b",
        "host": "http://localhost:11434",
        "system_prompt": "You are a helpful test assistant.",
        "tools": ["calculator", "current_time"],
        "ollama_config": {
            "temperature": 0.7,
            "max_tokens": 1000
        },
        "response_style": "technical",
        "show_thinking": True,
        "show_tool_details": True,
        "include_examples": True,
        "include_citations": True,
        "include_warnings": True
    }
    
    try:
        # Test agent creation
        response = requests.post(
            "http://localhost:5006/strands-sdk/agents",
            json=test_agent,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Agent creation successful!")
            print(f"   Agent ID: {result.get('agent_id')}")
            print(f"   Response Style: {result.get('response_style', 'Not set')}")
            print(f"   Show Thinking: {result.get('show_thinking', 'Not set')}")
            print(f"   Include Examples: {result.get('include_examples', 'Not set')}")
            return result.get('agent_id')
        else:
            print(f"❌ Agent creation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return None

def test_agent_execution(agent_id):
    if not agent_id:
        print("❌ No agent ID to test")
        return
        
    print(f"\n🧪 Testing Agent Execution with ID: {agent_id}")
    
    test_query = {
        "query": "What is 15 + 27?",
        "agent_id": agent_id
    }
    
    try:
        response = requests.post(
            "http://localhost:5006/strands-sdk/execute",
            json=test_query,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Agent execution successful!")
            print(f"   Response Style: {result.get('response_style', 'Not set')}")
            print(f"   Show Thinking: {result.get('show_thinking', 'Not set')}")
            print(f"   Include Examples: {result.get('include_examples', 'Not set')}")
            print(f"   Include Citations: {result.get('include_citations', 'Not set')}")
            print(f"   Include Warnings: {result.get('include_warnings', 'Not set')}")
            print(f"\n📝 Formatted Response:")
            print(f"   {result.get('output', 'No output')}")
        else:
            print(f"❌ Agent execution failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Execution error: {e}")

if __name__ == "__main__":
    print("🚀 Testing Response Style Integration")
    print("=" * 50)
    
    # Test agent creation
    agent_id = test_agent_creation()
    
    # Test agent execution
    test_agent_execution(agent_id)
    
    print("\n✅ Test completed!")

