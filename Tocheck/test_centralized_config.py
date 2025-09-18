#!/usr/bin/env python3
"""
Test Centralized Configuration System
Verifies the new parameterized setup works correctly
"""

import requests
import json
import time

def test_centralized_config():
    """Test the centralized configuration system"""
    
    print("🔍 Testing Centralized Configuration System")
    print("=" * 60)
    
    # Test different ports to simulate auto-detection
    ports_to_test = [5002, 5001, 8000]
    working_port = None
    
    print("🔍 Testing port auto-detection...")
    for port in ports_to_test:
        try:
            response = requests.get(f"http://localhost:{port}/health", timeout=2)
            if response.status_code == 200:
                working_port = port
                print(f"✅ Found backend on port {port}")
                break
        except:
            print(f"❌ Port {port} not available")
    
    if not working_port:
        print("❌ No backend found on any port")
        return False
    
    # Test all endpoints with the working port
    base_url = f"http://localhost:{working_port}"
    
    endpoints_to_test = [
        ("/health", "Backend Health"),
        ("/api/ollama/status", "Ollama Status"),
        ("/api/ollama/models", "Ollama Models"),
        ("/api/agents/available", "Available Agents"),
        ("/api/agents/document-ready", "Document Agents"),
        ("/api/processing-logs", "Processing Logs")
    ]
    
    print(f"\n🧪 Testing endpoints on port {working_port}...")
    
    passed_tests = 0
    total_tests = len(endpoints_to_test)
    
    for endpoint, name in endpoints_to_test:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {name}: Working")
                passed_tests += 1
            else:
                print(f"❌ {name}: Failed ({response.status_code})")
        except Exception as e:
            print(f"❌ {name}: Error - {str(e)[:50]}...")
    
    # Test Ollama terminal command
    print(f"\n🔧 Testing Ollama terminal integration...")
    try:
        response = requests.post(f"{base_url}/api/ollama/terminal", 
                               json={"command": "ollama list"}, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Ollama Terminal: Working")
                passed_tests += 1
            else:
                print(f"❌ Ollama Terminal: Command failed")
        else:
            print(f"❌ Ollama Terminal: HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Ollama Terminal: Error - {str(e)[:50]}...")
    
    total_tests += 1  # Include terminal test
    
    print(f"\n" + "=" * 60)
    print(f"🎯 Test Results: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 ALL TESTS PASSED!")
        print(f"\nCentralized configuration working correctly:")
        print(f"✅ Auto-detected backend on port {working_port}")
        print(f"✅ All API endpoints responding")
        print(f"✅ Ollama integration working")
        print(f"\n💡 Frontend should be configured to use: {base_url}")
        
        # Generate frontend config
        config_js = f"""
// Auto-generated configuration for frontend
export const DETECTED_CONFIG = {{
  BACKEND_URL: '{base_url}',
  OLLAMA_URL: 'http://localhost:11434',
  DETECTED_PORT: {working_port},
  DETECTION_TIME: '{time.strftime("%Y-%m-%d %H:%M:%S")}',
  ALL_TESTS_PASSED: true
}};

// Usage in your components:
// import {{ DETECTED_CONFIG }} from './detected-config.js';
// const backendUrl = DETECTED_CONFIG.BACKEND_URL;
"""
        
        with open('detected-config.js', 'w') as f:
            f.write(config_js)
        
        print(f"📄 Generated detected-config.js for frontend use")
        
    else:
        print(f"⚠️ {total_tests - passed_tests} tests failed")
        print("Some components may not work correctly.")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = test_centralized_config()
    exit(0 if success else 1)