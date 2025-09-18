#!/usr/bin/env python3
"""
Complete System Endpoint Testing
Tests all critical endpoints to ensure end-to-end functionality
"""

import requests
import json
import time

def test_endpoint(url, method="GET", data=None, description=""):
    """Test a single endpoint"""
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ {description}: OK")
            return True, response.json()
        else:
            print(f"❌ {description}: HTTP {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"❌ {description}: {str(e)}")
        return False, None

def main():
    print("🧪 TESTING COMPLETE SYSTEM ENDPOINTS")
    print("=" * 50)
    
    base_url = "http://localhost:5052"
    
    # Test core endpoints
    endpoints = [
        (f"{base_url}/health", "GET", None, "Backend Health"),
        (f"{base_url}/api/ollama/status", "GET", None, "Ollama Status"),
        (f"{base_url}/api/ollama/models", "GET", None, "Ollama Models"),
        (f"{base_url}/api/rag/status", "GET", None, "RAG Status"),
        (f"{base_url}/api/rag/documents", "GET", None, "RAG Documents"),
        (f"{base_url}/api/agents", "GET", None, "Agents List"),
    ]
    
    results = []
    
    for url, method, data, description in endpoints:
        success, response_data = test_endpoint(url, method, data, description)
        results.append((description, success, response_data))
        time.sleep(0.5)  # Small delay between requests
    
    print("\n📊 ENDPOINT TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 ALL ENDPOINTS WORKING!")
        
        # Test some specific functionality
        print("\n🔍 TESTING SPECIFIC FUNCTIONALITY...")
        
        # Test Ollama terminal command
        try:
            terminal_response = requests.post(
                f"{base_url}/api/ollama/terminal",
                json={"command": "ollama list"},
                timeout=10
            )
            if terminal_response.status_code == 200:
                print("✅ Ollama Terminal: Command execution OK")
            else:
                print(f"⚠️ Ollama Terminal: HTTP {terminal_response.status_code}")
        except Exception as e:
            print(f"❌ Ollama Terminal: {e}")
        
        print("\n🌐 SYSTEM READY!")
        print("Backend: http://localhost:5052")
        print("Frontend: http://localhost:5173 (if running)")
        print("\n✅ Key Features Available:")
        print("  - Document Chat & RAG")
        print("  - Ollama Terminal & Models")
        print("  - Agent Creation & Management")
        
    else:
        print("⚠️ SOME ENDPOINTS FAILED - CHECK BACKEND")
        
        failed_endpoints = [desc for desc, success, _ in results if not success]
        print("Failed endpoints:")
        for endpoint in failed_endpoints:
            print(f"  - {endpoint}")

if __name__ == "__main__":
    main()