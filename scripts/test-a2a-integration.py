#!/usr/bin/env python3
"""
Test A2A Integration Script
Tests the complete A2A multi-agent orchestration flow
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
A2A_SERVICE_URL = "http://localhost:5008"
STRANDS_SDK_URL = "http://localhost:5006"
ORCHESTRATION_URL = "http://localhost:5014"

def test_service_health():
    """Test if all services are running"""
    print("🏥 Testing service health...")
    
    services = [
        ("A2A Service", f"{A2A_SERVICE_URL}/api/a2a/health"),
        ("Strands SDK", f"{STRANDS_SDK_URL}/api/strands-sdk/health"),
        ("Enhanced Orchestration", f"{ORCHESTRATION_URL}/api/enhanced-orchestration/health")
    ]
    
    all_healthy = True
    
    for service_name, url in services:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {service_name}: Healthy")
            else:
                print(f"❌ {service_name}: Unhealthy (Status: {response.status_code})")
                all_healthy = False
        except Exception as e:
            print(f"❌ {service_name}: Connection failed - {e}")
            all_healthy = False
    
    return all_healthy

def test_a2a_agent_registration():
    """Test A2A agent registration"""
    print("\n🤖 Testing A2A agent registration...")
    
    # Test agent data
    test_agent = {
        "id": "test_creative_agent",
        "name": "Test Creative Assistant",
        "description": "Test agent for creative writing tasks",
        "model": "qwen3:1.7b",
        "capabilities": ["creative_writing", "poetry", "storytelling"],
        "strands_agent_id": "test_creative_agent",
        "strands_data": {
            "tools": ["creative_writing", "poetry"],
            "system_prompt": "You are a creative writing assistant."
        }
    }
    
    try:
        response = requests.post(
            f"{A2A_SERVICE_URL}/api/a2a/agents",
            json=test_agent,
            timeout=10
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Agent registered: {result['agent']['name']} (ID: {result['agent']['id']})")
            return result['agent']['id']
        else:
            print(f"❌ Agent registration failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Agent registration error: {e}")
        return None

def test_a2a_message_sending(from_agent_id, to_agent_id):
    """Test A2A message sending"""
    print(f"\n📨 Testing A2A message sending: {from_agent_id} -> {to_agent_id}")
    
    test_message = {
        "from_agent_id": from_agent_id,
        "to_agent_id": to_agent_id,
        "content": "Hello! This is a test A2A message. Please respond with a creative poem about Python programming.",
        "type": "test_message"
    }
    
    try:
        response = requests.post(
            f"{A2A_SERVICE_URL}/api/a2a/messages",
            json=test_message,
            timeout=30
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Message sent successfully")
            print(f"   Response: {result.get('message', {}).get('response', 'No response')[:100]}...")
            print(f"   Execution Time: {result.get('message', {}).get('execution_time', 0):.2f}s")
            return True
        else:
            print(f"❌ Message sending failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Message sending error: {e}")
        return False

def test_strands_agents():
    """Test Strands SDK agents"""
    print("\n🔧 Testing Strands SDK agents...")
    
    try:
        response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            agents = result.get('agents', [])
            print(f"✅ Found {len(agents)} Strands agents")
            
            for agent in agents[:3]:  # Show first 3 agents
                print(f"   - {agent['name']}: {agent.get('description', 'No description')}")
            
            return agents
        else:
            print(f"❌ Failed to get Strands agents: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Strands agents error: {e}")
        return []

def test_enhanced_orchestration():
    """Test enhanced orchestration with A2A"""
    print("\n🎯 Testing enhanced orchestration with A2A...")
    
    test_query = "I want to learn how to write a poem about Python programming and then create Python code to generate that poem"
    
    orchestration_data = {
        "query": test_query,
        "contextual_analysis": {
            "success": True,
            "user_intent": "Learn creative writing and programming integration",
            "domain_analysis": {
                "primary_domain": "Creative Programming",
                "technical_level": "intermediate"
            },
            "orchestration_pattern": "sequential"
        }
    }
    
    try:
        print(f"   Query: {test_query}")
        response = requests.post(
            f"{ORCHESTRATION_URL}/api/enhanced-orchestration/query",
            json=orchestration_data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Orchestration completed successfully")
            print(f"   Success: {result.get('success', False)}")
            print(f"   Strategy: {result.get('orchestration_summary', {}).get('execution_strategy', 'Unknown')}")
            print(f"   Stages Completed: {result.get('orchestration_summary', {}).get('stages_completed', 0)}/5")
            
            # Check A2A execution
            if 'execution_details' in result:
                exec_details = result['execution_details']
                print(f"   Execution Time: {exec_details.get('execution_time', 0):.2f}s")
                print(f"   Execution Success: {exec_details.get('success', False)}")
            
            # Show final response preview
            final_response = result.get('final_response', '')
            if final_response:
                print(f"   Final Response Preview: {final_response[:200]}...")
            
            return True
        else:
            print(f"❌ Orchestration failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Orchestration error: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 A2A Multi-Agent Integration Test")
    print("=" * 50)
    
    # Test 1: Service Health
    if not test_service_health():
        print("\n❌ Service health check failed. Please start all services first.")
        print("   Run: ./scripts/start-a2a-services.sh")
        sys.exit(1)
    
    # Test 2: Strands Agents
    strands_agents = test_strands_agents()
    if not strands_agents:
        print("\n❌ No Strands agents found. Please create some agents first.")
        sys.exit(1)
    
    # Test 3: A2A Agent Registration
    a2a_agent_id = test_a2a_agent_registration()
    if not a2a_agent_id:
        print("\n❌ A2A agent registration failed.")
        sys.exit(1)
    
    # Test 4: A2A Message Sending (if we have multiple agents)
    if len(strands_agents) > 1:
        # Register second agent for A2A
        second_agent = strands_agents[1]
        second_a2a_agent = {
            "id": f"test_{second_agent['id']}",
            "name": f"Test {second_agent['name']}",
            "description": second_agent.get('description', ''),
            "model": second_agent.get('model_id', ''),
            "capabilities": second_agent.get('tools', []),
            "strands_agent_id": second_agent['id'],
            "strands_data": second_agent
        }
        
        try:
            response = requests.post(
                f"{A2A_SERVICE_URL}/api/a2a/agents",
                json=second_a2a_agent,
                timeout=10
            )
            if response.status_code == 201:
                second_a2a_id = response.json()['agent']['id']
                test_a2a_message_sending(a2a_agent_id, second_a2a_id)
        except Exception as e:
            print(f"⚠️  Second agent A2A registration failed: {e}")
    
    # Test 5: Enhanced Orchestration
    orchestration_success = test_enhanced_orchestration()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"   Service Health: ✅")
    print(f"   Strands Agents: ✅ ({len(strands_agents)} found)")
    print(f"   A2A Registration: {'✅' if a2a_agent_id else '❌'}")
    print(f"   Enhanced Orchestration: {'✅' if orchestration_success else '❌'}")
    
    if orchestration_success:
        print("\n🎉 All tests passed! A2A multi-agent orchestration is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the logs for details.")
    
    print("\n🔗 Service URLs:")
    print(f"   A2A Service: {A2A_SERVICE_URL}")
    print(f"   Strands SDK: {STRANDS_SDK_URL}")
    print(f"   Enhanced Orchestration: {ORCHESTRATION_URL}")

if __name__ == "__main__":
    main()

