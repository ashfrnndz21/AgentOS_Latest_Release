#!/usr/bin/env python3
"""
Test script to debug agent creation issues
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

def test_agent_creation():
    """Test agent creation endpoint"""
    test_agent = {
        "name": "Test Agent",
        "role": "Test Specialist", 
        "description": "A test agent for debugging",
        "model": "mistral",
        "personality": "Professional and helpful",
        "expertise": "testing, debugging, analysis",
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
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Agent creation successful!")
            print(f"Agent ID: {result.get('agent', {}).get('id')}")
            return True
        else:
            print(f"❌ Agent creation failed: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Error text: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out - backend might be slow")
        return False
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def test_list_agents():
    """Test listing agents"""
    try:
        response = requests.get("http://localhost:8000/api/agents/document-ready", timeout=5)
        print(f"List agents status: {response.status_code}")
        
        if response.status_code == 200:
            agents = response.json()
            print(f"✅ Found {len(agents.get('agents', []))} document-ready agents")
            return True
        else:
            print(f"❌ Failed to list agents: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to list agents: {e}")
        return False

def main():
    print("🔧 Testing Agent Creation Process...")
    print("=" * 50)
    
    # Test 1: Backend connection
    print("\n1. Testing backend connection...")
    if not test_backend_connection():
        print("\n💡 Solution: Start the backend server:")
        print("   cd backend && python simple_api.py")
        sys.exit(1)
    
    # Test 2: List existing agents
    print("\n2. Testing agent listing...")
    test_list_agents()
    
    # Test 3: Create test agent
    print("\n3. Testing agent creation...")
    if test_agent_creation():
        print("\n✅ Agent creation is working!")
        print("The issue might be in the frontend form validation or data.")
    else:
        print("\n❌ Agent creation is failing at the backend level.")
        print("Check the backend logs for more details.")
    
    print("\n" + "=" * 50)
    print("🔍 Debug complete!")

if __name__ == "__main__":
    main()