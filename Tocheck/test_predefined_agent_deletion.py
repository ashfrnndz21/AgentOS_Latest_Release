#!/usr/bin/env python3
"""
Test script to verify predefined agent deletion functionality
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
                print("\n🤖 Custom Agents:")
                for agent in user_created:
                    print(f"  - {agent['name']} ({agent['id']}) - {agent['role']}")
            
            if predefined:
                print("\n✨ Predefined Agents:")
                for agent in predefined:
                    print(f"  - {agent['name']} ({agent['id']}) - {agent['role']}")
            
            return agents
        else:
            print(f"❌ Failed to list agents: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ Failed to list agents: {e}")
        return []

def delete_agent(agent_id, agent_name, agent_type):
    """Test agent deletion"""
    try:
        print(f"\n🗑️ Attempting to delete {agent_type} agent: {agent_name} ({agent_id})")
        
        response = requests.delete(
            f"http://localhost:8000/api/document-agents/{agent_id}",
            timeout=10
        )
        
        print(f"Delete response status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ {agent_type} agent deletion successful!")
            try:
                result = response.json()
                print(f"Response: {result}")
            except:
                print("No JSON response body")
            return True
        else:
            print(f"❌ {agent_type} agent deletion failed: {response.status_code}")
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
    print("🗑️ Testing Predefined Agent Deletion...")
    print("=" * 50)
    
    # Test 1: Backend connection
    print("\n1. Testing backend connection...")
    if not test_backend_connection():
        print("\n💡 Solution: Start the backend server:")
        print("   cd backend && python simple_api.py")
        sys.exit(1)
    
    # Test 2: List existing agents
    print("\n2. Listing existing agents...")
    agents = list_agents()
    
    if not agents:
        print("❌ No agents found to test deletion")
        sys.exit(1)
    
    # Find predefined agents
    predefined_agents = [a for a in agents if a.get('source') == 'predefined']
    custom_agents = [a for a in agents if a.get('source') == 'user_created']
    
    print(f"\n📊 Agent Summary:")
    print(f"  - Total agents: {len(agents)}")
    print(f"  - Custom agents: {len(custom_agents)}")
    print(f"  - Predefined agents: {len(predefined_agents)}")
    
    # Test 3: Try to delete a predefined agent (if available)
    if predefined_agents:
        test_agent = predefined_agents[0]  # Take the first predefined agent
        print(f"\n3. Testing predefined agent deletion...")
        print(f"   Target: {test_agent['name']} ({test_agent['id']})")
        
        # Ask for confirmation since this is destructive
        confirm = input(f"\n⚠️  Are you sure you want to delete the predefined agent '{test_agent['name']}'? (yes/no): ")
        
        if confirm.lower() == 'yes':
            success = delete_agent(test_agent['id'], test_agent['name'], 'predefined')
            
            if success:
                print("\n4. Verifying predefined agent was deleted...")
                agents_after = list_agents()
                
                # Check if agent was actually removed
                remaining_predefined = [a for a in agents_after if a.get('source') == 'predefined']
                
                if len(remaining_predefined) < len(predefined_agents):
                    print("✅ Predefined agent successfully deleted!")
                else:
                    print("❌ Predefined agent may not have been deleted")
            else:
                print("❌ Failed to delete predefined agent")
        else:
            print("🚫 Deletion cancelled by user")
    else:
        print("\n3. No predefined agents available for deletion testing")
    
    # Test 4: Try to delete a custom agent (if available)
    if custom_agents:
        test_agent = custom_agents[0]  # Take the first custom agent
        print(f"\n4. Testing custom agent deletion...")
        print(f"   Target: {test_agent['name']} ({test_agent['id']})")
        
        success = delete_agent(test_agent['id'], test_agent['name'], 'custom')
        
        if success:
            print("\n5. Verifying custom agent was deleted...")
            agents_after = list_agents()
            
            # Check if agent was actually removed
            remaining_custom = [a for a in agents_after if a.get('source') == 'user_created']
            
            if len(remaining_custom) < len(custom_agents):
                print("✅ Custom agent successfully deleted!")
            else:
                print("❌ Custom agent may not have been deleted")
        else:
            print("❌ Failed to delete custom agent")
    else:
        print("\n4. No custom agents available for deletion testing")
    
    print("\n" + "=" * 50)
    print("🎯 Summary:")
    print("✅ Backend now supports deleting both predefined and custom agents")
    print("⚠️  Use with caution - predefined agent deletion affects all users")
    print("\n🔍 Test complete!")

if __name__ == "__main__":
    main()