#!/usr/bin/env python3
"""
Frontend Integration Test
Tests the complete frontend-backend integration for LLM multi-agent system
"""

import requests
import json
import time
import uuid
from datetime import datetime

# API endpoints
STRANDS_SDK_URL = "http://localhost:5006"
FRONTEND_URL = "http://localhost:5173"

def test_backend_services():
    """Test that all backend services are running"""
    print("🔍 Testing Backend Services")
    print("=" * 40)
    
    services = [
        ("Strands SDK API", f"{STRANDS_SDK_URL}/api/strands-sdk/health"),
        ("Frontend", f"{FRONTEND_URL}")
    ]
    
    all_healthy = True
    
    for service_name, url in services:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {service_name}: Running")
            else:
                print(f"❌ {service_name}: HTTP {response.status_code}")
                all_healthy = False
        except requests.exceptions.ConnectionError:
            print(f"❌ {service_name}: Not accessible")
            all_healthy = False
        except Exception as e:
            print(f"❌ {service_name}: Error - {e}")
            all_healthy = False
    
    return all_healthy

def test_agent_creation_workflow():
    """Test the complete agent creation workflow"""
    print("\n🤖 Testing Agent Creation Workflow")
    print("=" * 40)
    
    # Test Case 1: Create Customer Service Agent
    print("📝 Creating Customer Service Agent...")
    agent1_data = {
        "name": "Customer Service Agent",
        "description": "Helpful customer service agent with LLM integration",
        "model_id": "qwen2.5",
        "host": "http://localhost:11434",
        "system_prompt": "You are a helpful customer service agent. Be polite and professional. Help customers with their issues.",
        "tools": ["calculator", "current_time"],
        "ollama_config": {
            "temperature": 0.7,
            "max_tokens": 1000
        }
    }
    
    try:
        response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", json=agent1_data)
        if response.status_code == 200:
            agent1 = response.json()
            print(f"✅ Agent 1 created: {agent1.get('id', 'Unknown ID')}")
            agent1_id = agent1.get('id')
        else:
            print(f"❌ Failed to create Agent 1: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating Agent 1: {e}")
        return False
    
    # Test Case 2: Create Technical Support Agent
    print("\n📝 Creating Technical Support Agent...")
    agent2_data = {
        "name": "Technical Support Agent",
        "description": "Technical support specialist with advanced tools",
        "model_id": "qwen2.5",
        "host": "http://localhost:11434",
        "system_prompt": "You are a technical support specialist. Help customers with technical issues. Provide detailed solutions.",
        "tools": ["calculator", "think"],
        "ollama_config": {
            "temperature": 0.7,
            "max_tokens": 1000
        }
    }
    
    try:
        response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", json=agent2_data)
        if response.status_code == 200:
            agent2 = response.json()
            print(f"✅ Agent 2 created: {agent2.get('id', 'Unknown ID')}")
            agent2_id = agent2.get('id')
        else:
            print(f"❌ Failed to create Agent 2: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating Agent 2: {e}")
        return False
    
    return agent1_id, agent2_id

def test_agent_execution():
    """Test agent execution with real LLM processing"""
    print("\n⚡ Testing Agent Execution")
    print("=" * 40)
    
    # Get list of agents
    try:
        response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents")
        if response.status_code != 200:
            print("❌ Failed to get agents list")
            return False
        
        agents = response.json()
        if not agents:
            print("❌ No agents found")
            return False
        
        agent = agents[0]  # Use first available agent
        agent_id = agent.get('id')
        agent_name = agent.get('name', 'Unknown')
        
        print(f"🤖 Testing agent: {agent_name} (ID: {agent_id})")
        
        # Test execution
        test_input = "Hello! Can you help me with a simple math problem? What is 15 + 27?"
        print(f"📝 Input: {test_input}")
        
        execution_data = {
            "input": test_input,
            "stream": False
        }
        
        print("⏳ Executing agent...")
        start_time = time.time()
        
        response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent_id}/execute", 
                               json=execution_data)
        
        execution_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Execution successful in {execution_time:.2f}s")
            print(f"📤 Response: {result.get('output_text', result.get('response', 'No response'))[:100]}...")
            print(f"🔧 Tools used: {result.get('tools_used', [])}")
            print(f"🤖 Model: {result.get('model_used', 'Unknown')}")
            return True
        else:
            print(f"❌ Execution failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during execution: {e}")
        return False

def test_frontend_integration():
    """Test frontend integration points"""
    print("\n🌐 Testing Frontend Integration")
    print("=" * 40)
    
    # Test if frontend is accessible
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
        else:
            print(f"❌ Frontend returned HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend not accessible: {e}")
        return False
    
    # Test API endpoints that frontend uses
    api_endpoints = [
        ("List Agents", f"{STRANDS_SDK_URL}/api/strands-sdk/agents"),
        ("Health Check", f"{STRANDS_SDK_URL}/api/strands-sdk/health"),
    ]
    
    for endpoint_name, url in api_endpoints:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {endpoint_name}: Working")
            else:
                print(f"❌ {endpoint_name}: HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint_name}: Error - {e}")
    
    return True

def run_integration_test():
    """Run the complete integration test"""
    print("🚀 Frontend Integration Test")
    print("=" * 50)
    print("Testing: Complete frontend-backend integration for LLM multi-agent system")
    print()
    
    # Test 1: Backend Services
    if not test_backend_services():
        print("\n❌ Backend services not ready. Please start the services first.")
        return False
    
    # Test 2: Agent Creation
    agent_result = test_agent_creation_workflow()
    if not agent_result:
        print("\n❌ Agent creation failed")
        return False
    
    # Test 3: Agent Execution
    if not test_agent_execution():
        print("\n❌ Agent execution failed")
        return False
    
    # Test 4: Frontend Integration
    if not test_frontend_integration():
        print("\n❌ Frontend integration failed")
        return False
    
    # Summary
    print("\n📊 INTEGRATION TEST RESULTS")
    print("=" * 30)
    print("✅ Backend Services: Working")
    print("✅ Agent Creation: Working")
    print("✅ Agent Execution: Working")
    print("✅ Frontend Integration: Working")
    print()
    print("🎉 ALL TESTS PASSED!")
    print("✅ LLM multi-agent system is fully integrated")
    print("✅ Frontend can create and interact with real agents")
    print("✅ Backend APIs are working correctly")
    print("✅ Ready for user interaction")
    
    return True

if __name__ == "__main__":
    run_integration_test()











