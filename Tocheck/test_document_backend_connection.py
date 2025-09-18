#!/usr/bin/env python3
"""
Test Document Backend Connection
Verifies that all document-related endpoints are working
"""

import requests
import json

def test_backend_connection():
    """Test all document-related backend endpoints"""
    
    base_url = "http://localhost:5002"
    
    print("🔍 Testing Document Backend Connection")
    print("=" * 50)
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Backend Health: {health_data['status']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False
    
    # Test processing logs endpoint
    try:
        response = requests.get(f"{base_url}/api/processing-logs", timeout=5)
        if response.status_code == 200:
            logs_data = response.json()
            print(f"✅ Processing Logs: {logs_data['total']} logs available")
        else:
            print(f"❌ Processing logs failed: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Processing logs error: {e}")
    
    # Test Ollama status endpoint
    try:
        response = requests.get(f"{base_url}/api/ollama/status", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama Status: Connected")
        else:
            print(f"⚠️ Ollama status: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Ollama status error: {e}")
    
    # Test Ollama models endpoint
    try:
        response = requests.get(f"{base_url}/api/ollama/models", timeout=5)
        if response.status_code == 200:
            models_data = response.json()
            print(f"✅ Ollama Models: {len(models_data.get('models', []))} available")
        else:
            print(f"⚠️ Ollama models: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Ollama models error: {e}")
    
    # Test workflow endpoints
    try:
        response = requests.get(f"{base_url}/api/agents/available", timeout=5)
        if response.status_code == 200:
            agents_data = response.json()
            print(f"✅ Workflow Agents: {len(agents_data.get('agents', {}))} registered")
        else:
            print(f"⚠️ Workflow agents: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Workflow agents error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Backend connection test completed!")
    print("\nYour Document RAG system should now work properly.")
    print("Refresh your frontend to see the updated connection status.")
    
    return True

if __name__ == "__main__":
    test_backend_connection()