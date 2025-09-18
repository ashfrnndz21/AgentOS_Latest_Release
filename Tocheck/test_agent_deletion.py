#!/usr/bin/env python3
"""
Test script to verify agent deletion functionality
"""

import requests
import json
import sys

def test_backend_connection():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=5)
        print(f"✅ Backend is running: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running on localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Backend connection error: {e}")
        return False

def list_agents():
    """List all document agents"""
    try:
        response = requests.get("http://localhost:8000/api/agents/document-ready", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            print(f"📋 Found {len(agents)} document-ready agents:")
            
            user_created = [a for a in agents if a.get('source') == 'user_created']
            predefined = [a for a in agents if a.get('source') == 'predefined']
            
            print(f"  - Custom agents: {len(user_created)}")
            print(f"  - Predefined agents: {len(predefined)}")
            
            if user_created:
                print("\n🤖 Custom Agents (can be deleted):")
                for agent in user_created:
                    print(f"  - {agent['name']} ({agent['id']}) - {agent['role']}")
            
            if predefined:
                print("\n✨ Predefined Agents (cannot be deleted):")
                for agent in predefined:
                    print(f"  - {agent['name']} ({agent['id']}) - {agent['role']}")
            
            return agents
        else:
            print(f"❌ Failed to list agents: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ Failed to list agents: {e}")
        return []

def create_test_agent():
    """Create a test agent for deletion testing"""
    test_agent = {
        "name": "Test Delete Agent",
        "role": "Test Deletion Specialist", 
        "description": "A test agent created specifically for deletion testing",
        "model": "mistral",
        "personality": "Professional and helpful, designed for testing deletion functionality",
        "expertise": "testing, deletion, cleanup, verification",
        "document_preferences": {
            "analysis_style": "detailed",
            "citation_style": "professional", 
            "response_format": "structured"
        }
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/document-agents",
            json=test_agent,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            agent_id = result.get('agent', {}).get('id')
            print(f"✅ Created test agent for deletion: {agent_id}")
            return agent_id
        else:
            print(f"❌ Failed to create test agent: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Error text: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Failed to create test agent: {e}")
        return None

def delete_agent(agent_id):
    """Test agent deletion"""
    try:
        response = requests.delete(
            f"http://localhost:8000/api/document-agents/{agent_id}",
            timeout=10
        )
        
        print(f"Delete response status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Agent deletion successful!")
            try:
                result = response.json()
                print(f"Response: {result}")
            except:
                print("No JSON response body")
            return True
        else:
            print(f"❌ Agent deletion failed: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Error text: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Delete request failed: {e}")
        return False

def main():
    print("🗑️ Testing Agent Deletion Functionality...")
    print("=" * 50)
    
    # Test 1: Backend connection
    print("\n1. Testing backend connection...")
    if not test_backend_connection():
        print("\n💡 Solution: Start the backend server:")
        print("   cd backend && python simple_api.py")
        sys.exit(1)
    
    # Test 2: List existing agents
    print("\n2. Listing existing agents...")
    initial_agents = list_agents()
    
    # Test 3: Create test agent
    print("\n3. Creating test agent for deletion...")
    test_agent_id = create_test_agent()
    
    if not test_agent_id:
        print("❌ Cannot proceed without test agent")
        sys.exit(1)
    
    # Test 4: Verify agent was created
    print("\n4. Verifying agent was created...")
    agents_after_create = list_agents()
    
    # Test 5: Delete the test agent
    print(f"\n5. Deleting test agent {test_agent_id}...")
    if delete_agent(test_agent_id):
        print("✅ Deletion successful!")
    else:
        print("❌ Deletion failed!")
        sys.exit(1)
    
    # Test 6: Verify agent was deleted
    print("\n6. Verifying agent was deleted...")
    agents_after_delete = list_agents()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Summary:")
    print(f"  - Initial agents: {len(initial_agents)}")
    print(f"  - After creation: {len(agents_after_create)}")
    print(f"  - After deletion: {len(agents_after_delete)}")
    
    if len(agents_after_delete) == len(initial_agents):
        print("✅ Agent deletion functionality is working correctly!")
    else:
        print("❌ Agent deletion may have issues - count mismatch")
    
    print("\n🔍 Test complete!")

if __name__ == "__main__":
    main()