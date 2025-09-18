#!/usr/bin/env python3
"""
Debug Document Chat Issue
Diagnoses why document chat isn't working despite backend and Ollama being available
"""

import requests
import json
import time

def test_backend_endpoints():
    """Test all backend endpoints related to document chat"""
    base_url = "http://localhost:5052"
    
    print("🔍 DEBUGGING DOCUMENT CHAT ISSUE")
    print("=" * 50)
    
    # Test basic health
    try:
        health = requests.get(f"{base_url}/health", timeout=5)
        print(f"✅ Backend Health: {health.status_code}")
        if health.status_code == 200:
            health_data = health.json()
            print(f"   Port: {health_data.get('port')}")
            print(f"   Missing Keys: {health_data.get('missing_keys', [])}")
    except Exception as e:
        print(f"❌ Backend Health: {e}")
        return False
    
    # Test Ollama endpoints
    print("\n🤖 TESTING OLLAMA ENDPOINTS:")
    ollama_endpoints = [
        "/api/ollama/status",
        "/api/ollama/models"
    ]
    
    for endpoint in ollama_endpoints:
        try:
            resp = requests.get(f"{base_url}{endpoint}", timeout=10)
            print(f"✅ {endpoint}: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                if endpoint == "/api/ollama/models" and "models" in data:
                    print(f"   Models available: {len(data['models'])}")
                    for model in data['models'][:3]:  # Show first 3
                        print(f"     - {model.get('name', 'Unknown')}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
    
    # Test RAG endpoints
    print("\n📄 TESTING RAG/DOCUMENT ENDPOINTS:")
    rag_endpoints = [
        "/api/rag/status",
        "/api/rag/documents"
    ]
    
    for endpoint in rag_endpoints:
        try:
            resp = requests.get(f"{base_url}{endpoint}", timeout=10)
            print(f"✅ {endpoint}: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                if endpoint == "/api/rag/documents":
                    doc_count = len(data.get('documents', []))
                    print(f"   Documents in system: {doc_count}")
                elif endpoint == "/api/rag/status":
                    print(f"   RAG Status: {data.get('status', 'Unknown')}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
    
    # Test document upload endpoint
    print("\n📤 TESTING DOCUMENT UPLOAD:")
    try:
        # Test with a simple text file
        test_content = "This is a test document for RAG processing."
        files = {'file': ('test.txt', test_content, 'text/plain')}
        
        upload_resp = requests.post(f"{base_url}/api/rag/upload", files=files, timeout=30)
        print(f"✅ Document Upload: {upload_resp.status_code}")
        
        if upload_resp.status_code == 200:
            upload_data = upload_resp.json()
            print(f"   Upload successful: {upload_data.get('message', 'No message')}")
        else:
            print(f"   Upload failed: {upload_resp.text}")
            
    except Exception as e:
        print(f"❌ Document Upload: {e}")
    
    # Test document query
    print("\n💬 TESTING DOCUMENT QUERY:")
    try:
        query_data = {
            "query": "What is this document about?",
            "model": "llama3.2:latest"  # Use a common model
        }
        
        query_resp = requests.post(f"{base_url}/api/rag/query", 
                                 json=query_data, timeout=30)
        print(f"✅ Document Query: {query_resp.status_code}")
        
        if query_resp.status_code == 200:
            query_result = query_resp.json()
            print(f"   Query successful: {len(query_result.get('response', ''))} chars response")
        else:
            print(f"   Query failed: {query_resp.text}")
            
    except Exception as e:
        print(f"❌ Document Query: {e}")
    
    return True

def check_frontend_config():
    """Check if frontend is configured correctly for document chat"""
    print("\n🖥️ CHECKING FRONTEND CONFIGURATION:")
    
    # Check if apiClient has the right methods
    try:
        with open("src/lib/apiClient.ts", 'r') as f:
            api_content = f.read()
        
        required_methods = [
            "uploadDocument",
            "queryDocuments", 
            "getDocuments",
            "getRagStatus"
        ]
        
        missing_methods = []
        for method in required_methods:
            if method not in api_content:
                missing_methods.append(method)
        
        if missing_methods:
            print(f"❌ Missing API methods: {missing_methods}")
        else:
            print("✅ All required API methods present")
            
    except Exception as e:
        print(f"❌ Error checking API client: {e}")
    
    # Check app config
    try:
        with open("src/config/appConfig.ts", 'r') as f:
            config_content = f.read()
        
        if "5052" in config_content:
            print("✅ App config points to correct backend port")
        else:
            print("❌ App config may have wrong backend port")
            
    except Exception as e:
        print(f"❌ Error checking app config: {e}")

def main():
    """Run complete document chat diagnosis"""
    
    # Test backend
    backend_ok = test_backend_endpoints()
    
    # Check frontend
    check_frontend_config()
    
    print("\n📋 DIAGNOSIS SUMMARY:")
    print("=" * 50)
    
    print("\n🔧 COMMON DOCUMENT CHAT ISSUES & FIXES:")
    print("1. Backend not running → Run: python backend/simple_api.py")
    print("2. Ollama not running → Run: ollama serve")
    print("3. No documents uploaded → Upload a document first")
    print("4. Wrong model selected → Use an available Ollama model")
    print("5. Frontend not connected → Check browser console for errors")
    print("6. CORS issues → Backend should allow frontend origin")
    
    print("\n🚀 TO FIX DOCUMENT CHAT:")
    print("1. Ensure backend is running on port 5052")
    print("2. Ensure Ollama is running on port 11434") 
    print("3. Upload a document via the UI")
    print("4. Select a valid Ollama model")
    print("5. Try querying the document")
    
    print("\n🌐 ACCESS POINTS:")
    print("Backend: http://localhost:5052")
    print("RAG Status: http://localhost:5052/api/rag/status")
    print("Ollama Status: http://localhost:5052/api/ollama/status")

if __name__ == "__main__":
    main()