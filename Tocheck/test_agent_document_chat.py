#!/usr/bin/env python3
"""
Test Agent-Enhanced Document Chat Implementation
"""

import requests
import json
import time

BACKEND_URL = "http://localhost:8000"

def test_document_ready_agents():
    """Test the document-ready agents endpoint"""
    print("🤖 Testing document-ready agents endpoint...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/agents/document-ready")
        
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            
            print(f"✅ Found {len(agents)} document-ready agents")
            
            for agent in agents:
                print(f"  🤖 {agent['name']} - {agent['role']}")
                print(f"     Expertise: {agent['expertise']}")
                print(f"     Model: {agent['model']}")
                print(f"     Source: {agent['source']}")
                print()
            
            return agents
        else:
            print(f"❌ Failed to get agents: {response.status_code}")
            print(f"Response: {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Error testing agents: {e}")
        return []

def test_agent_document_query(agents):
    """Test agent-enhanced document query"""
    if not agents:
        print("⚠️ No agents available for testing")
        return
    
    # Use the first agent for testing
    test_agent = agents[0]
    print(f"🤖 Testing agent query with {test_agent['name']}...")
    
    agent_config = {
        "name": test_agent['name'],
        "role": test_agent['role'],
        "expertise": test_agent['expertise'],
        "personality": test_agent['personality'],
        "memory": "No previous conversation context"
    }
    
    test_query = "What is this document about?"
    
    try:
        payload = {
            "query": test_query,
            "document_ids": [],  # Use all available documents
            "agent_config": agent_config,
            "model_name": test_agent['model']
        }
        
        print(f"📤 Sending query: {test_query}")
        print(f"🤖 Using agent: {test_agent['name']} ({test_agent['role']})")
        
        response = requests.post(
            f"{BACKEND_URL}/api/rag/agent-query",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ Agent query successful!")
            print(f"🤖 Agent: {result.get('agent_info', {}).get('name', 'Unknown')}")
            print(f"📝 Response: {result.get('response', 'No response')[:200]}...")
            print(f"📊 Chunks retrieved: {result.get('chunks_retrieved', 0)}")
            print(f"📚 Sources: {result.get('sources', [])}")
            print(f"🔍 Agent enhanced: {result.get('agent_enhanced', False)}")
            
            return True
        else:
            print(f"❌ Agent query failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Agent query error: {e}")
        return False

def test_regular_vs_agent_query():
    """Compare regular RAG vs agent-enhanced RAG"""
    print("\n🔍 Comparing Regular RAG vs Agent-Enhanced RAG...")
    
    test_query = "What are the key points in this document?"
    
    # Test regular RAG
    print("\n1. Testing Regular RAG:")
    try:
        regular_payload = {
            "query": test_query,
            "document_ids": [],
            "model_name": "mistral"
        }
        
        regular_response = requests.post(
            f"{BACKEND_URL}/api/rag/query",
            json=regular_payload,
            timeout=30
        )
        
        if regular_response.status_code == 200:
            regular_result = regular_response.json()
            print(f"✅ Regular RAG response: {regular_result.get('response', '')[:150]}...")
        else:
            print(f"❌ Regular RAG failed: {regular_response.status_code}")
    except Exception as e:
        print(f"❌ Regular RAG error: {e}")
    
    # Test agent RAG
    print("\n2. Testing Agent-Enhanced RAG:")
    agent_config = {
        "name": "Sarah",
        "role": "Legal Document Analyst",
        "expertise": "contract analysis, legal compliance, risk assessment",
        "personality": "Professional, detail-oriented, and thorough. I focus on legal implications and compliance requirements.",
        "memory": "No previous conversation context"
    }
    
    try:
        agent_payload = {
            "query": test_query,
            "document_ids": [],
            "agent_config": agent_config,
            "model_name": "mistral"
        }
        
        agent_response = requests.post(
            f"{BACKEND_URL}/api/rag/agent-query",
            json=agent_payload,
            timeout=30
        )
        
        if agent_response.status_code == 200:
            agent_result = agent_response.json()
            print(f"✅ Agent RAG response: {agent_result.get('response', '')[:150]}...")
            print(f"🤖 Agent info: {agent_result.get('agent_info', {})}")
        else:
            print(f"❌ Agent RAG failed: {agent_response.status_code}")
    except Exception as e:
        print(f"❌ Agent RAG error: {e}")

def main():
    """Run agent document chat tests"""
    print("🧪 Testing Agent-Enhanced Document Chat")
    print("=" * 50)
    
    # Test 1: Get document-ready agents
    agents = test_document_ready_agents()
    
    # Test 2: Test agent query (if documents are available)
    if agents:
        print("\n" + "=" * 30)
        success = test_agent_document_query(agents)
        
        if success:
            # Test 3: Compare regular vs agent responses
            test_regular_vs_agent_query()
    
    print("\n🎉 Agent document chat testing completed!")
    print("=" * 50)

if __name__ == "__main__":
    main()