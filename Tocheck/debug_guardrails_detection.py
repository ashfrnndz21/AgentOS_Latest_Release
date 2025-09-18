#!/usr/bin/env python3

"""
Debug script to test guardrails detection in agent data
"""

import json
import requests
import sys

def test_agent_data_structure():
    """Test the actual agent data structure from the backend"""
    try:
        # Try to fetch agent data from the backend
        response = requests.get('http://localhost:8000/api/ollama/agents', timeout=5)
        
        if response.status_code == 200:
            agents = response.json()
            print(f"📊 Found {len(agents)} agents")
            
            for i, agent in enumerate(agents[:3]):  # Check first 3 agents
                print(f"\n🤖 Agent {i+1}: {agent.get('name', 'Unknown')}")
                print(f"   ID: {agent.get('id', 'N/A')}")
                
                # Check guardrails structure
                guardrails = agent.get('guardrails')
                if guardrails:
                    print(f"   Guardrails: {json.dumps(guardrails, indent=4)}")
                    
                    # Test different detection methods
                    enabled_check = guardrails.get('enabled', False)
                    safety_level_check = bool(guardrails.get('safety_level') or guardrails.get('safetyLevel'))
                    has_keys_check = len(guardrails.keys()) > 0
                    
                    print(f"   Detection Results:")
                    print(f"     enabled: {enabled_check}")
                    print(f"     has safety_level: {safety_level_check}")
                    print(f"     has keys: {has_keys_check}")
                    print(f"     final result: {enabled_check or safety_level_check or has_keys_check}")
                else:
                    print(f"   Guardrails: None or empty")
                
                print("-" * 50)
        else:
            print(f"❌ Failed to fetch agents: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        print("💡 Make sure the backend is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔍 Debugging Agent Guardrails Detection")
    print("=" * 50)
    test_agent_data_structure()
