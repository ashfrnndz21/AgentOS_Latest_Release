#!/usr/bin/env python3
"""
Test Fixed Functionality
Tests both Ollama Terminal and Document Chat after the fix
"""

import requests
import json

def test_ollama_terminal():
    """Test Ollama Terminal functionality"""
    print("🧪 TESTING OLLAMA TERMINAL FUNCTIONALITY")
    print("-" * 50)
    
    base_url = "http://localhost:5052"
    
    # Test Ollama command execution
    try:
        command_data = {"command": "ollama list"}
        response = requests.post(f"{base_url}/api/ollama/terminal", 
                               json=command_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Ollama Terminal: Command execution works")
            print(f"   Response: {result.get('output', 'No output')[:100]}...")
            return True
        else:
            print(f"❌ Ollama Terminal: HTTP {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ollama Terminal: {e}")
        return False

def test_document_chat():
    """Test Document Chat functionality"""
    print("\n🧪 TESTING DOCUMENT CHAT FUNCTIONALITY")
    print("-" * 50)
    
    base_url = "http://localhost:5052"
    
    # Test document upload
    try:
        test_content = "This is a test document about artificial intelligence and machine learning."
        files = {'file': ('test_doc.txt', test_content, 'text/plain')}
        
        upload_response = requests.post(f"{base_url}/api/rag/ingest", 
                                      files=files, timeout=30)
        
        if upload_response.status_code == 200:
            print("✅ Document Upload: Works")
            upload_result = upload_response.json()
            print(f"   Message: {upload_result.get('message', 'No message')}")
        else:
            print(f"❌ Document Upload: HTTP {upload_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Document Upload: {e}")
        return False
    
    # Test document query
    try:
        query_data = {
            "query": "What is this document about?",
            "model": "llama3.2:latest"
        }
        
        query_response = requests.post(f"{base_url}/api/rag/query", 
                                     json=query_data, timeout=30)
        
        if query_response.status_code == 200:
            print("✅ Document Query: Works")
            query_result = query_response.json()
            response_text = query_result.get('response', '')
            print(f"   Response: {response_text[:100]}...")
            return True
        else:
            print(f"❌ Document Query: HTTP {query_response.status_code}")
            print(f"   Error: {query_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Document Query: {e}")
        return False

def main():
    """Test all functionality"""
    print("🔍 TESTING FIXED FUNCTIONALITY")
    print("=" * 60)
    
    # Test backend health first
    try:
        health = requests.get("http://localhost:5052/health", timeout=5)
        if health.status_code == 200:
            print("✅ Backend Health: OK")
        else:
            print("❌ Backend not responding")
            return
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return
    
    # Test both functionalities
    ollama_ok = test_ollama_terminal()
    document_ok = test_document_chat()
    
    print("\n📊 TEST RESULTS")
    print("=" * 60)
    
    if ollama_ok and document_ok:
        print("🎉 ALL FUNCTIONALITY WORKING!")
        print("✅ Ollama Terminal: Ready to use")
        print("✅ Document Chat: Ready to use")
        print("\n🌐 You can now access the frontend at:")
        print("   http://localhost:8080")
        print("   Both Ollama Terminal and Document Chat should work!")
    else:
        print("⚠️ Some functionality still has issues:")
        if not ollama_ok:
            print("❌ Ollama Terminal needs attention")
        if not document_ok:
            print("❌ Document Chat needs attention")

if __name__ == "__main__":
    main()