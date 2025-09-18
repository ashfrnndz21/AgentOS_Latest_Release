#!/usr/bin/env python3

"""
Backend Enhanced Guardrails Debug
Tests the backend API to see if enhanced guardrails are being saved and retrieved properly.
"""

import requests
import json
import sys

def test_backend_api():
    """Test the backend API for enhanced guardrails"""
    base_url = "http://localhost:5002"
    
    print("🔍 Testing Backend API for Enhanced Guardrails...")
    
    # Test creating an agent with enhanced guardrails
    test_agent = {
        "name": "Test Enhanced Agent",
        "role": "Test Agent",
        "description": "Testing enhanced guardrails",
        "model": "llama3.2:latest",
        "systemPrompt": "You are a test agent",
        "temperature": 0.7,
        "maxTokens": 1000,
        "tools": [],
        "memory": {
            "shortTerm": True,
            "longTerm": False,
            "contextual": True
        },
        "ragEnabled": False,
        "knowledgeBases": [],
        "guardrails": {
            "enabled": True,
            "rules": [],
            "safetyLevel": "medium"
        },
        "enhancedGuardrails": {
            "global": True,
            "local": True,
            "contentFilter": {
                "enabled": True,
                "level": "moderate",
                "customKeywords": ["spam", "scam", "fraud"],
                "blockedPhrases": ["click here now", "limited time offer"],
                "allowedDomains": []
            },
            "customRules": [
                {
                    "id": "test-rule-1",
                    "name": "Test Rule",
                    "description": "A test rule for debugging",
                    "pattern": "\\b(test|debug)\\b",
                    "action": "block",
                    "enabled": True
                }
            ],
            "piiRedaction": {
                "enabled": True,
                "strategy": "mask",
                "customTypes": ["ssn"],
                "customPatterns": ["\\d{3}-\\d{2}-\\d{4}"],
                "maskCharacter": "*",
                "placeholderText": "[REDACTED]"
            }
        }
    }
    
    try:
        # Create agent
        print("📤 Creating agent with enhanced guardrails...")
        response = requests.post(f"{base_url}/api/agents/ollama/enhanced", 
                               json=test_agent, 
                               headers={"Content-Type": "application/json"})
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Agent created successfully")
            print(f"📋 Agent ID: {result.get('agent', {}).get('id', 'Unknown')}")
            
            # Check if enhanced guardrails are in the response
            agent_data = result.get('agent', {})
            if 'enhancedGuardrails' in agent_data:
                print("✅ Enhanced guardrails found in response")
                print(f"🛡️ Enhanced guardrails: {json.dumps(agent_data['enhancedGuardrails'], indent=2)}")
            else:
                print("❌ Enhanced guardrails NOT found in response")
                print(f"📋 Available keys: {list(agent_data.keys())}")
            
            # Now try to retrieve the agent
            print("\n📥 Retrieving agents...")
            get_response = requests.get(f"{base_url}/api/agents/ollama/enhanced")
            
            if get_response.status_code == 200:
                agents_result = get_response.json()
                agents = agents_result.get('agents', [])
                print(f"✅ Retrieved {len(agents)} agents")
                
                # Find our test agent
                test_agent_retrieved = None
                for agent in agents:
                    if agent.get('name') == 'Test Enhanced Agent':
                        test_agent_retrieved = agent
                        break
                
                if test_agent_retrieved:
                    print("✅ Test agent found in retrieved agents")
                    if 'enhancedGuardrails' in test_agent_retrieved:
                        print("✅ Enhanced guardrails preserved in retrieval")
                        print(f"🛡️ Retrieved enhanced guardrails: {json.dumps(test_agent_retrieved['enhancedGuardrails'], indent=2)}")
                    else:
                        print("❌ Enhanced guardrails LOST during retrieval")
                        print(f"📋 Available keys: {list(test_agent_retrieved.keys())}")
                else:
                    print("❌ Test agent not found in retrieved agents")
            else:
                print(f"❌ Failed to retrieve agents: {get_response.status_code}")
                print(f"📋 Error: {get_response.text}")
                
        else:
            print(f"❌ Failed to create agent: {response.status_code}")
            print(f"📋 Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        print("💡 Make sure the backend is running on localhost:5002")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_backend_api()
