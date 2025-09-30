#!/usr/bin/env python3
"""
Debug script to test sequential execution logic
"""

import requests
import json

def test_sequential_execution():
    """Test the sequential execution logic"""
    
    # Get available agents
    a2a_response = requests.get("http://localhost:5008/api/a2a/agents", timeout=10)
    if a2a_response.status_code != 200:
        print("❌ Failed to get A2A agents")
        return
    
    a2a_agents = a2a_response.json().get('agents', [])
    print(f"📋 Available A2A agents: {len(a2a_agents)}")
    for agent in a2a_agents:
        print(f"  - {agent['name']} (ID: {agent['id']})")
    
    # Test the sequential execution logic
    malaysia_agent = next((a for a in a2a_agents if 'malaysia' in a['name'].lower()), None)
    singapore_agent = next((a for a in a2a_agents if 'singapore' in a['name'].lower()), None)
    
    print(f"\n🔍 Agent detection:")
    print(f"  Malaysia Agent: {malaysia_agent['name'] if malaysia_agent else 'Not found'}")
    print(f"  Singapore Agent: {singapore_agent['name'] if singapore_agent else 'Not found'}")
    
    if malaysia_agent and singapore_agent:
        sequential_agents = [malaysia_agent, singapore_agent]
        print(f"\n✅ Sequential agents created: {[a['name'] for a in sequential_agents]}")
    else:
        print(f"\n❌ Could not create sequential agents")
    
    # Test the orchestration API
    print(f"\n🧪 Testing orchestration API...")
    response = requests.post(
        "http://localhost:5014/api/enhanced-orchestration/query",
        json={
            "query": "First teach me about Malaysian food, then help me write a creative poem about Singapore outdoor places",
            "session_id": "debug_sequential_test"
        },
        timeout=60
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Orchestration API response received")
        print(f"  Execution Strategy: {result.get('execution_strategy', 'N/A')}")
        print(f"  Agents Executed: {result.get('agents_executed', 'N/A')}")
        print(f"  Total Agents: {result.get('total_agents', 'N/A')}")
        
        if 'results' in result:
            print(f"  Results: {len(result['results'])} steps")
            for i, step in enumerate(result['results']):
                print(f"    Step {i+1}: {step.get('agent_name', 'N/A')} - {step.get('status', 'N/A')}")
    else:
        print(f"❌ Orchestration API failed: {response.status_code}")
        print(f"  Response: {response.text}")

if __name__ == "__main__":
    test_sequential_execution()

