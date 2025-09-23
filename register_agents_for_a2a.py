#!/usr/bin/env python3
"""
Register Strands SDK agents with A2A service for orchestration testing
"""

import requests
import json

def register_strands_agents_with_a2a():
    """Register all Strands SDK agents with A2A service"""
    
    # Get all Strands SDK agents
    strands_url = "http://localhost:5006"
    a2a_url = "http://localhost:5008"
    
    try:
        # Get Strands agents
        response = requests.get(f"{strands_url}/api/strands-sdk/agents", timeout=10)
        if response.status_code != 200:
            print(f"❌ Failed to get Strands agents: {response.status_code}")
            return False
        
        strands_agents = response.json().get('agents', [])
        print(f"📋 Found {len(strands_agents)} Strands SDK agents")
        
        registered_count = 0
        
        for agent in strands_agents:
            agent_id = agent.get('id')
            agent_name = agent.get('name', 'Unknown Agent')
            
            # Register with A2A service
            a2a_agent_data = {
                "id": f"strands_{agent_id}",
                "name": agent_name,
                "description": agent.get('description', ''),
                "model": agent.get('model_id', 'llama3.2:latest'),
                "capabilities": agent.get('tools', []),
                "strands_agent_id": agent_id,
                "strands_data": agent
            }
            
            try:
                a2a_response = requests.post(f"{a2a_url}/api/a2a/agents", 
                                           json=a2a_agent_data, timeout=10)
                
                if a2a_response.status_code in [200, 201]:
                    print(f"✅ Registered {agent_name} with A2A service")
                    registered_count += 1
                else:
                    print(f"❌ Failed to register {agent_name}: {a2a_response.status_code} - {a2a_response.text}")
                    
            except Exception as e:
                print(f"❌ Error registering {agent_name}: {str(e)}")
        
        print(f"\n🎯 Successfully registered {registered_count}/{len(strands_agents)} agents with A2A service")
        return registered_count > 0
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = register_strands_agents_with_a2a()
    exit(0 if success else 1)

