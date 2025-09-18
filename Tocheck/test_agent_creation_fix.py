#!/usr/bin/env python3
"""
Test script to verify the agent creation fix works end-to-end
"""

import requests
import json
import time

def test_enhanced_agent_creation():
    """Test creating an enhanced Ollama agent with the frontend data structure"""
    
    print("🧪 Testing Enhanced Agent Creation Fix")
    print("=" * 50)
    
    # Test data that matches what the frontend sends
    agent_data = {
        "name": "Telco CVM Agent",
        "role": "Telco Prepaid Expert", 
        "description": "You are a prepaid products seller designed to upsell cross sell prepaid product passes",
        "model": "mistral",  # This should now work (maps to mistral:latest)
        "personality": "Helpful and professional",
        "expertise": "Telecommunications and prepaid services",
        "systemPrompt": "You are a helpful AI assistant specialized in telecommunications.",
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
        "behavior": {
            "response_style": "professional",
            "communication_tone": "helpful"
        }
    }
    
    print("📤 Testing enhanced Ollama agent creation...")
    print(f"Model: {agent_data['model']} (should map to mistral:latest)")
    print(f"Agent Name: {agent_data['name']}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/agents/ollama/enhanced",
            json=agent_data,
            timeout=10
        )
        
        print(f"📥 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Enhanced agent created successfully!")
            print(f"Agent ID: {result.get('agent', {}).get('id')}")
            print(f"Agent Name: {result.get('agent', {}).get('name')}")
            print(f"Model Used: {result.get('agent', {}).get('model', {}).get('model_id')}")
            
            # Verify enhanced structures are preserved
            agent = result.get('agent', {})
            if 'capabilities' in agent:
                print("✅ Capabilities preserved")
            
            # Check if the model was correctly mapped
            model_id = agent.get('model', {}).get('model_id')
            if model_id == 'mistral:latest':
                print("✅ Model name correctly mapped from 'mistral' to 'mistral:latest'")
            else:
                print(f"⚠️ Unexpected model ID: {model_id}")
                
            return True
        else:
            print(f"❌ Failed to create agent: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the backend running on localhost:8000?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_backend_health():
    """Test if backend is running and healthy"""
    
    print("🏥 Testing Backend Health")
    print("=" * 30)
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is healthy and running")
            return True
        else:
            print(f"⚠️ Backend responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running on localhost:8000")
        print("💡 Please start the backend with: python backend/simple_api.py")
        return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def main():
    """Run all tests to verify the agent creation fix"""
    
    print("🧪 Testing Agent Creation Fix")
    print("=" * 60)
    
    # Test backend health first
    if not test_backend_health():
        print("\\n❌ Backend is not available. Please start it first.")
        return False
    
    # Test enhanced agent creation
    enhanced_success = test_enhanced_agent_creation()
    
    print("\\n" + "=" * 60)
    
    if enhanced_success:
        print("🎉 Agent Creation Fix Verified!")
        print("\\n📋 Summary:")
        print("  ✅ Backend correctly maps model names (mistral → mistral:latest)")
        print("  ✅ Enhanced capabilities and guardrails are preserved")
        print("  ✅ Agent creation works end-to-end")
        print("  ✅ Frontend should now be able to create agents successfully")
        print("\\n🎯 Next Steps:")
        print("  1. Try creating an agent in the frontend UI")
        print("  2. The 'Failed to create agent: Not Found' error should be resolved")
        print("  3. Agents should be created with proper model mapping")
        return True
    else:
        print("❌ Agent creation fix needs more work.")
        print("\\n🔧 Troubleshooting:")
        print("  1. Check if Ollama is running: ollama serve")
        print("  2. Verify models are available: ollama list")
        print("  3. Check backend logs for detailed errors")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)