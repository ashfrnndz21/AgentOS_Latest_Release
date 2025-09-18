#!/usr/bin/env python3
"""
Test Custom Document Agent Creation
"""

import requests
import json

BACKEND_URL = "http://localhost:8000"

def test_create_custom_agent():
    """Test creating a custom document agent"""
    print("🤖 Testing custom agent creation...")
    
    agent_data = {
        "name": "Dr. Michael Chen",
        "role": "Medical Document Analyst",
        "description": "Specialized in medical document analysis with expertise in clinical research and regulatory compliance",
        "model": "mistral",
        "personality": "Professional, precise, and thorough. I focus on medical accuracy, regulatory compliance, and patient safety considerations.",
        "expertise": "medical research, clinical trials, regulatory compliance, pharmaceutical analysis, healthcare documentation",
        "document_preferences": {
            "analysis_style": "detailed",
            "citation_style": "medical",
            "response_format": "structured"
        }
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/document-agents",
            json=agent_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Agent created successfully!")
            print(f"🤖 Agent ID: {result['agent']['id']}")
            print(f"👤 Name: {result['agent']['name']}")
            print(f"🎭 Role: {result['agent']['role']}")
            print(f"🧠 Model: {result['agent']['model']}")
            return result['agent']
        else:
            print(f"❌ Failed to create agent: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating agent: {e}")
        return None

def test_list_custom_agents():
    """Test listing custom agents"""
    print("\n📋 Testing custom agent listing...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/document-agents")
        
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            
            print(f"✅ Found {len(agents)} custom agents")
            
            for agent in agents:
                print(f"  🤖 {agent['name']} - {agent['role']} ({agent['model']})")
            
            return agents
        else:
            print(f"❌ Failed to list agents: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ Error listing agents: {e}")
        return []

def test_document_ready_agents_with_filter():
    """Test document-ready agents with model filter"""
    print("\n🔍 Testing document-ready agents with model filter...")
    
    try:
        # Test without filter
        response = requests.get(f"{BACKEND_URL}/api/agents/document-ready")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ All agents: {data.get('total', 0)} total")
            print(f"   Custom: {data.get('custom', 0)}, Predefined: {data.get('predefined', 0)}")
        
        # Test with mistral filter
        response = requests.get(f"{BACKEND_URL}/api/agents/document-ready?model_filter=mistral")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Mistral agents: {data.get('total', 0)} total")
            
            for agent in data.get('agents', []):
                print(f"  🤖 {agent['name']} - {agent['role']} ({agent['model']}) [{agent['source']}]")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing filtered agents: {e}")
        return False

def main():
    """Run custom agent tests"""
    print("🧪 Testing Custom Document Agent System")
    print("=" * 50)
    
    # Test 1: Create custom agent
    agent = test_create_custom_agent()
    
    # Test 2: List custom agents
    agents = test_list_custom_agents()
    
    # Test 3: Test document-ready agents with filtering
    test_document_ready_agents_with_filter()
    
    print("\n🎉 Custom agent testing completed!")
    print("=" * 50)

if __name__ == "__main__":
    main()