#!/usr/bin/env python3
"""
Test All Connection Fixes
Comprehensive test to verify all backend connections are working
"""

import requests
import json

def test_all_connections():
    """Test all backend connections"""
    
    base_url = "http://localhost:5002"
    
    print("🔍 Testing All Connection Fixes")
    print("=" * 60)
    
    tests_passed = 0
    tests_total = 0
    
    # Test 1: Backend Health
    tests_total += 1
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Backend Health: {health_data['status']}")
            tests_passed += 1
        else:
            print(f"❌ Backend Health: Failed ({response.status_code})")
    except Exception as e:
        print(f"❌ Backend Health: Error - {e}")
    
    # Test 2: Ollama Status
    tests_total += 1
    try:
        response = requests.get(f"{base_url}/api/ollama/status", timeout=5)
        if response.status_code == 200:
            ollama_data = response.json()
            print(f"✅ Ollama Status: {ollama_data['status']} ({ollama_data['model_count']} models)")
            tests_passed += 1
        else:
            print(f"❌ Ollama Status: Failed ({response.status_code})")
    except Exception as e:
        print(f"❌ Ollama Status: Error - {e}")
    
    # Test 3: Ollama Terminal
    tests_total += 1
    try:
        response = requests.post(f"{base_url}/api/ollama/terminal", 
                               json={"command": "ollama list"}, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Ollama Terminal: Working")
                tests_passed += 1
            else:
                print(f"❌ Ollama Terminal: Command failed - {result.get('error')}")
        else:
            print(f"❌ Ollama Terminal: Failed ({response.status_code})")
    except Exception as e:
        print(f"❌ Ollama Terminal: Error - {e}")
    
    # Test 4: Document RAG
    tests_total += 1
    try:
        response = requests.get(f"{base_url}/api/agents/document-ready", timeout=5)
        if response.status_code == 200:
            agents_data = response.json()
            print(f"✅ Document RAG: {agents_data['total']} agents available")
            tests_passed += 1
        else:
            print(f"❌ Document RAG: Failed ({response.status_code})")
    except Exception as e:
        print(f"❌ Document RAG: Error - {e}")
    
    # Test 5: Processing Logs
    tests_total += 1
    try:
        response = requests.get(f"{base_url}/api/processing-logs", timeout=5)
        if response.status_code == 200:
            logs_data = response.json()
            print(f"✅ Processing Logs: {logs_data['total']} logs")
            tests_passed += 1
        else:
            print(f"❌ Processing Logs: Failed ({response.status_code})")
    except Exception as e:
        print(f"❌ Processing Logs: Error - {e}")
    
    # Test 6: Workflow Agents
    tests_total += 1
    try:
        response = requests.get(f"{base_url}/api/agents/available", timeout=5)
        if response.status_code == 200:
            agents_data = response.json()
            print(f"✅ Workflow Agents: {len(agents_data.get('agents', {}))} registered")
            tests_passed += 1
        else:
            print(f"❌ Workflow Agents: Failed ({response.status_code})")
    except Exception as e:
        print(f"❌ Workflow Agents: Error - {e}")
    
    # Test 7: Ollama Models
    tests_total += 1
    try:
        response = requests.get(f"{base_url}/api/ollama/models", timeout=5)
        if response.status_code == 200:
            models_data = response.json()
            print(f"✅ Ollama Models: {len(models_data.get('models', []))} available")
            tests_passed += 1
        else:
            print(f"❌ Ollama Models: Failed ({response.status_code})")
    except Exception as e:
        print(f"❌ Ollama Models: Error - {e}")
    
    print("\n" + "=" * 60)
    print(f"🎯 Test Results: {tests_passed}/{tests_total} tests passed")
    
    if tests_passed == tests_total:
        print("🎉 ALL TESTS PASSED!")
        print("\nYour system is fully operational:")
        print("✅ Backend connected on port 5002")
        print("✅ Ollama Terminal should work")
        print("✅ Document RAG should work")
        print("✅ Multi-Agent Workflows should work")
        print("\n💡 Refresh your frontend to see the fixes!")
    else:
        print(f"⚠️ {tests_total - tests_passed} tests failed")
        print("Some components may still have connection issues.")
    
    return tests_passed == tests_total

if __name__ == "__main__":
    test_all_connections()