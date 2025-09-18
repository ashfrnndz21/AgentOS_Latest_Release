#!/usr/bin/env python3
"""
Complete Integration Test
Tests all backend connections and API endpoints
"""

import requests
import time
import subprocess
import sys
import os

def test_backend_connection():
    """Test basic backend connection"""
    print("🔍 Testing backend connection...")
    
    try:
        response = requests.get('http://localhost:5052/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend health check: {data}")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_ollama_endpoints():
    """Test Ollama-related endpoints"""
    print("🔍 Testing Ollama endpoints...")
    
    endpoints = [
        '/api/ollama/status',
        '/api/ollama/models',
        '/api/ollama/terminal'
    ]
    
    base_url = 'http://localhost:5052'
    
    for endpoint in endpoints:
        try:
            if endpoint == '/api/ollama/terminal':
                # POST request for terminal
                response = requests.post(f"{base_url}{endpoint}", 
                                       json={'command': 'ollama list'}, 
                                       timeout=5)
            else:
                # GET request for others
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
            
            if response.status_code == 200:
                print(f"✅ {endpoint}: OK")
            else:
                print(f"⚠️ {endpoint}: Status {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")

def test_rag_endpoints():
    """Test RAG-related endpoints"""
    print("🔍 Testing RAG endpoints...")
    
    endpoints = [
        '/api/rag/status',
        '/api/rag/documents'
    ]
    
    base_url = 'http://localhost:5052'
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {endpoint}: OK")
            else:
                print(f"⚠️ {endpoint}: Status {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")

def test_agent_endpoints():
    """Test agent-related endpoints"""
    print("🔍 Testing agent endpoints...")
    
    base_url = 'http://localhost:5052'
    
    try:
        # Test getting agents
        response = requests.get(f"{base_url}/agents", timeout=5)
        if response.status_code == 200:
            print("✅ /agents: OK")
        else:
            print(f"⚠️ /agents: Status {response.status_code}")
    except Exception as e:
        print(f"❌ /agents: {e}")

def check_frontend_config():
    """Check frontend configuration"""
    print("🔍 Checking frontend configuration...")
    
    config_file = 'src/config/appConfig.ts'
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            content = f.read()
            if 'port: 5052' in content and 'localhost:5052' in content:
                print("✅ Frontend config: Correctly set to port 5052")
            else:
                print("⚠️ Frontend config: May not be set to port 5052")
    else:
        print("❌ Frontend config file not found")

def check_api_client():
    """Check if apiClient has all required methods"""
    print("🔍 Checking apiClient methods...")
    
    api_client_file = 'src/lib/apiClient.ts'
    if os.path.exists(api_client_file):
        with open(api_client_file, 'r') as f:
            content = f.read()
            
        required_methods = [
            'executeOllamaCommand',
            'getOllamaStatus',
            'getRagStatus',
            'ingestDocument',
            'queryRag'
        ]
        
        missing_methods = []
        for method in required_methods:
            if method not in content:
                missing_methods.append(method)
        
        if not missing_methods:
            print("✅ ApiClient: All required methods present")
        else:
            print(f"⚠️ ApiClient: Missing methods: {missing_methods}")
    else:
        print("❌ ApiClient file not found")

def start_backend_if_needed():
    """Start backend if it's not running"""
    print("🔍 Checking if backend needs to be started...")
    
    try:
        response = requests.get('http://localhost:5052/health', timeout=2)
        if response.status_code == 200:
            print("✅ Backend is already running")
            return True
    except:
        pass
    
    print("🚀 Starting backend...")
    try:
        # Start backend in background
        process = subprocess.Popen([
            sys.executable, 'backend/simple_api.py'
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        
        # Wait for startup
        time.sleep(5)
        
        # Check if it started
        try:
            response = requests.get('http://localhost:5052/health', timeout=2)
            if response.status_code == 200:
                print("✅ Backend started successfully")
                return True
        except:
            pass
        
        print("❌ Backend failed to start")
        return False
        
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Complete Integration Test")
    print("=" * 50)
    
    # Step 1: Check if backend is running, start if needed
    if not start_backend_if_needed():
        print("❌ Cannot proceed without backend")
        return False
    
    # Step 2: Test backend connection
    if not test_backend_connection():
        print("❌ Backend connection failed")
        return False
    
    # Step 3: Test all endpoints
    test_ollama_endpoints()
    test_rag_endpoints()
    test_agent_endpoints()
    
    # Step 4: Check frontend configuration
    check_frontend_config()
    check_api_client()
    
    print("\n" + "=" * 50)
    print("✅ Integration test completed!")
    print("🌐 Backend should be accessible at: http://localhost:5052")
    print("📱 Frontend should connect properly now")
    print("🔗 Try the Ollama Terminal, Document Chat, and Agent Creation")
    
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()