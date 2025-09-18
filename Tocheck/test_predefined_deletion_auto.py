#!/usr/bin/env python3
"""
Automated test for predefined agent deletion
"""

import requests
import json

def test_predefined_agent_deletion():
    """Test predefined agent deletion automatically"""
    
    print("🧪 Testing Predefined Agent Deletion...")
    
    # 1. List agents before deletion
    print("\n1. Listing agents before deletion...")
    response = requests.get("http://localhost:8000/api/agents/document-ready")
    if response.status_code != 200:
        print("❌ Failed to list agents")
        return False
    
    agents_before = response.json().get('agents', [])
    predefined_before = [a for a in agents_before if a.get('source') == 'predefined']
    
    print(f"   Found {len(predefined_before)} predefined agents:")
    for agent in predefined_before:
        print(f"   - {agent['name']} ({agent['id']})")
    
    if not predefined_before:
        print("❌ No predefined agents to test deletion")
        return False
    
    # 2. Try to delete the first predefined agent
    test_agent = predefined_before[0]
    print(f"\n2. Attempting to delete predefined agent: {test_agent['name']} ({test_agent['id']})")
    
    delete_response = requests.delete(f"http://localhost:8000/api/document-agents/{test_agent['id']}")
    
    print(f"   Delete response status: {delete_response.status_code}")
    
    if delete_response.status_code == 200:
        result = delete_response.json()
        print(f"   ✅ Success: {result.get('message')}")
    else:
        try:
            error = delete_response.json()
            print(f"   ❌ Error: {error.get('detail', 'Unknown error')}")
            return False
        except:
            print(f"   ❌ Error: {delete_response.text}")
            return False
    
    # 3. Verify agent was deleted
    print(f"\n3. Verifying agent was deleted...")
    response = requests.get("http://localhost:8000/api/agents/document-ready")
    if response.status_code != 200:
        print("❌ Failed to list agents after deletion")
        return False
    
    agents_after = response.json().get('agents', [])
    predefined_after = [a for a in agents_after if a.get('source') == 'predefined']
    
    print(f"   Predefined agents before: {len(predefined_before)}")
    print(f"   Predefined agents after: {len(predefined_after)}")
    
    # Check if the specific agent was removed
    deleted_agent_still_exists = any(a['id'] == test_agent['id'] for a in predefined_after)
    
    if deleted_agent_still_exists:
        print(f"   ❌ Agent {test_agent['name']} still exists after deletion")
        return False
    else:
        print(f"   ✅ Agent {test_agent['name']} successfully removed")
    
    # 4. Test restore functionality
    print(f"\n4. Testing restore functionality...")
    restore_response = requests.post(f"http://localhost:8000/api/document-agents/{test_agent['id']}/restore")
    
    print(f"   Restore response status: {restore_response.status_code}")
    
    if restore_response.status_code == 200:
        result = restore_response.json()
        print(f"   ✅ Restore success: {result.get('message')}")
        
        # Verify agent was restored
        response = requests.get("http://localhost:8000/api/agents/document-ready")
        if response.status_code == 200:
            agents_restored = response.json().get('agents', [])
            predefined_restored = [a for a in agents_restored if a.get('source') == 'predefined']
            
            restored_agent_exists = any(a['id'] == test_agent['id'] for a in predefined_restored)
            
            if restored_agent_exists:
                print(f"   ✅ Agent {test_agent['name']} successfully restored")
                return True
            else:
                print(f"   ❌ Agent {test_agent['name']} not found after restore")
                return False
    else:
        try:
            error = restore_response.json()
            print(f"   ❌ Restore error: {error.get('detail', 'Unknown error')}")
        except:
            print(f"   ❌ Restore error: {restore_response.text}")
        return False

def main():
    print("🔧 Automated Predefined Agent Deletion Test")
    print("=" * 50)
    
    try:
        # Test backend connection
        response = requests.get("http://localhost:8000/api/health", timeout=5)
        print(f"✅ Backend is running")
    except:
        print("❌ Backend is not running on localhost:8000")
        return
    
    # Run the test
    success = test_predefined_agent_deletion()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed! Predefined agent deletion is working correctly.")
        print("✅ Users can now delete both custom and predefined agents")
    else:
        print("❌ Tests failed. There may be issues with predefined agent deletion.")
    
    print("\n🔍 Test complete!")

if __name__ == "__main__":
    main()