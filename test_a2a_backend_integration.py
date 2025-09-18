#!/usr/bin/env python3
"""
A2A Backend Integration Test
Tests the complete A2A backend integration
"""

import requests
import json
import time
from datetime import datetime

# API endpoints
A2A_SERVICE_URL = "http://localhost:5008"
STRANDS_SDK_URL = "http://localhost:5006"

def test_a2a_service_health():
    """Test A2A service health"""
    print("🔍 Testing A2A Service Health")
    print("=" * 50)
    
    try:
        response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ A2A Service is healthy")
            print(f"   Service: {data.get('service', 'Unknown')}")
            print(f"   Timestamp: {data.get('timestamp', 'Unknown')}")
            print(f"   Agents registered: {data.get('agents_registered', 0)}")
            return True
        else:
            print(f"❌ A2A Service health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error connecting to A2A service: {e}")
        return False

def test_strands_sdk_agents():
    """Test getting Strands SDK agents"""
    print("\n🤖 Testing Strands SDK Agents")
    print("=" * 50)
    
    try:
        response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=5)
        if response.status_code == 200:
            agents = response.json()
            print(f"✅ Found {len(agents)} Strands SDK agents")
            
            for agent in agents:
                print(f"   🤖 {agent.get('name', 'Unknown')} ({agent.get('id', 'Unknown')})")
                print(f"      Model: {agent.get('model_id', 'Unknown')}")
                print(f"      Tools: {len(agent.get('tools', []))}")
                print()
            
            return agents
        else:
            print(f"❌ Failed to get Strands SDK agents: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting Strands SDK agents: {e}")
        return []

def test_auto_register_agents():
    """Test auto-registering all agents for A2A"""
    print("\n🔗 Testing Auto-Register Agents for A2A")
    print("=" * 50)
    
    try:
        response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/a2a/auto-register", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Auto-registration successful")
            print(f"   Registered: {data.get('registered_count', 0)}")
            print(f"   Total agents: {data.get('total_agents', 0)}")
            
            if data.get('errors'):
                print(f"   Errors: {len(data['errors'])}")
                for error in data['errors']:
                    print(f"     - {error}")
            
            return True
        else:
            print(f"❌ Auto-registration failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error auto-registering agents: {e}")
        return False

def test_a2a_agents_list():
    """Test getting A2A registered agents"""
    print("\n📋 Testing A2A Agents List")
    print("=" * 50)
    
    try:
        response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/a2a/agents", timeout=5)
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            print(f"✅ Found {len(agents)} A2A registered agents")
            
            for agent in agents:
                print(f"   🤖 {agent.get('name', 'Unknown')} ({agent.get('id', 'Unknown')})")
                print(f"      Model: {agent.get('model', 'Unknown')}")
                print(f"      Capabilities: {len(agent.get('capabilities', []))}")
                print(f"      Status: {agent.get('status', 'Unknown')}")
                print()
            
            return agents
        else:
            print(f"❌ Failed to get A2A agents: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting A2A agents: {e}")
        return []

def test_send_a2a_message(agents):
    """Test sending A2A message between agents"""
    print("\n📨 Testing A2A Message Sending")
    print("=" * 50)
    
    if len(agents) < 2:
        print("❌ Need at least 2 agents to test A2A messaging")
        return False
    
    try:
        from_agent = agents[0]
        to_agent = agents[1]
        
        message_data = {
            "from_agent_id": from_agent["id"],
            "to_agent_id": to_agent["id"],
            "content": f"Hello from {from_agent['name']} to {to_agent['name']}! This is a test A2A message."
        }
        
        response = requests.post(
            f"{STRANDS_SDK_URL}/api/strands-sdk/a2a/messages",
            json=message_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ A2A message sent successfully")
            print(f"   From: {from_agent['name']}")
            print(f"   To: {to_agent['name']}")
            print(f"   Message ID: {data.get('message', {}).get('id', 'Unknown')}")
            print(f"   Status: {data.get('message', {}).get('status', 'Unknown')}")
            return True
        else:
            print(f"❌ A2A message failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error sending A2A message: {e}")
        return False

def test_a2a_message_history():
    """Test getting A2A message history"""
    print("\n📜 Testing A2A Message History")
    print("=" * 50)
    
    try:
        response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/a2a/messages/history", timeout=5)
        if response.status_code == 200:
            data = response.json()
            messages = data.get('messages', [])
            print(f"✅ Found {len(messages)} A2A messages in history")
            
            for message in messages[-3:]:  # Show last 3 messages
                print(f"   📨 {message.get('from_agent_name', 'Unknown')} -> {message.get('to_agent_name', 'Unknown')}")
                print(f"      Content: {message.get('content', 'Unknown')[:50]}...")
                print(f"      Time: {message.get('timestamp', 'Unknown')}")
                print()
            
            return True
        else:
            print(f"❌ Failed to get A2A message history: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error getting A2A message history: {e}")
        return False

def run_a2a_backend_integration_test():
    """Run the complete A2A backend integration test"""
    print("🚀 A2A Backend Integration Test")
    print("=" * 60)
    print("Testing: Complete A2A backend integration")
    print()
    
    # Test 1: A2A Service Health
    if not test_a2a_service_health():
        print("\n❌ A2A service health test failed")
        return False
    
    # Test 2: Strands SDK Agents
    agents = test_strands_sdk_agents()
    if not agents:
        print("\n❌ Strands SDK agents test failed")
        return False
    
    # Test 3: Auto-Register Agents
    if not test_auto_register_agents():
        print("\n❌ Auto-register agents test failed")
        return False
    
    # Test 4: A2A Agents List
    a2a_agents = test_a2a_agents_list()
    if not a2a_agents:
        print("\n❌ A2A agents list test failed")
        return False
    
    # Test 5: Send A2A Message
    if not test_send_a2a_message(agents):
        print("\n❌ A2A message sending test failed")
        return False
    
    # Test 6: A2A Message History
    if not test_a2a_message_history():
        print("\n❌ A2A message history test failed")
        return False
    
    # Summary
    print("\n📊 A2A BACKEND INTEGRATION TEST RESULTS")
    print("=" * 50)
    print("✅ A2A Service Health: Working")
    print("✅ Strands SDK Agents: Loaded")
    print("✅ Auto-Register Agents: Working")
    print("✅ A2A Agents List: Working")
    print("✅ A2A Message Sending: Working")
    print("✅ A2A Message History: Working")
    print()
    print("🎉 A2A BACKEND INTEGRATION COMPLETE!")
    print("✅ A2A service is running and functional")
    print("✅ Strands SDK agents are registered for A2A")
    print("✅ A2A messaging is working")
    print("✅ Message history is being tracked")
    print()
    print("🎯 READY FOR FRONTEND INTEGRATION!")
    print("1. A2A backend service is running on port 5007")
    print("2. Strands SDK agents are registered for A2A")
    print("3. A2A messaging is functional")
    print("4. Ready to connect frontend A2A panel")
    
    return True

if __name__ == "__main__":
    run_a2a_backend_integration_test()
