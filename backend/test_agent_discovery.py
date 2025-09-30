#!/usr/bin/env python3
"""
Test script to debug agent discovery and matching
"""

import requests
import json

def test_agent_discovery():
    """Test agent discovery from Strands SDK"""
    print("🔍 Testing Agent Discovery")
    print("=" * 50)
    
    # Test Strands SDK agent discovery
    try:
        response = requests.get("http://localhost:5006/api/strands-sdk/agents", timeout=10)
        if response.status_code == 200:
            data = response.json()
            agents = data.get("agents", [])
            print(f"✅ Found {len(agents)} agents in Strands SDK:")
            for i, agent in enumerate(agents):
                print(f"  Agent {i+1}:")
                print(f"    Name: '{agent.get('name', 'Unknown')}'")
                print(f"    ID: {agent.get('id', 'Unknown')}")
                print(f"    Capabilities: {agent.get('capabilities', [])}")
                print(f"    Status: {agent.get('status', 'Unknown')}")
                print()
        else:
            print(f"❌ Failed to get agents: HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Error discovering agents: {e}")

def test_agent_matching():
    """Test agent matching logic"""
    print("🎯 Testing Agent Matching Logic")
    print("=" * 50)
    
    # Simulate the matching logic
    from enhanced_orchestrator_5stage import Enhanced5StageOrchestrator
    
    orchestrator = Enhanced5StageOrchestrator()
    
    # Test with weather query
    weather_capability = "weather information"
    weather_agent = {
        "id": "09bcc268-9f32-456a-9173-ddb03c2e2827",
        "name": "Weather Agent ",
        "capabilities": []
    }
    
    confidence = orchestrator._calculate_agent_task_match(
        weather_capability, 
        weather_agent["capabilities"], 
        weather_agent["name"]
    )
    
    print(f"Weather Agent matching confidence: {confidence}")
    print(f"Agent name: '{weather_agent['name']}'")
    print(f"Required capability: '{weather_capability}'")
    print(f"Agent capabilities: {weather_agent['capabilities']}")

if __name__ == "__main__":
    test_agent_discovery()
    print()
    test_agent_matching()
