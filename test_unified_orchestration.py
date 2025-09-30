#!/usr/bin/env python3
"""
Test Script for Unified Orchestration System
Tests the complete unified workflow
"""

import requests
import json
import time
from datetime import datetime

# Configuration
UNIFIED_API_URL = "http://localhost:5021"

def test_health_check():
    """Test health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{UNIFIED_API_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_system_status():
    """Test system status endpoint"""
    print("🔍 Testing system status...")
    try:
        response = requests.get(f"{UNIFIED_API_URL}/api/status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ System status: {data['status']}")
            print(f"   Components: {data['components']}")
            return True
        else:
            print(f"❌ System status failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ System status error: {e}")
        return False

def test_quick_orchestration():
    """Test quick orchestration"""
    print("🔍 Testing quick orchestration...")
    try:
        response = requests.post(
            f"{UNIFIED_API_URL}/api/quick-orchestrate",
            json={"query": "What is 2+2?"},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Quick orchestration successful")
            print(f"   Response: {data['response'][:100]}...")
            return True
        else:
            print(f"❌ Quick orchestration failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Quick orchestration error: {e}")
        return False

def test_full_orchestration():
    """Test full orchestration"""
    print("🔍 Testing full orchestration...")
    try:
        response = requests.post(
            f"{UNIFIED_API_URL}/api/orchestrate",
            json={
                "query": "Calculate 2x532 and write a poem about the result",
                "options": {
                    "enable_observability": True
                }
            },
            timeout=60
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Full orchestration successful")
            print(f"   Session ID: {data['session_id']}")
            print(f"   Success: {data['success']}")
            print(f"   Agents Used: {data['workflow_summary']['agents_used']}")
            print(f"   Processing Time: {data['workflow_summary']['processing_time']:.2f}s")
            print(f"   Response: {data['response'][:200]}...")
            return True
        else:
            print(f"❌ Full orchestration failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Full orchestration error: {e}")
        return False

def test_query_analysis():
    """Test query analysis"""
    print("🔍 Testing query analysis...")
    try:
        response = requests.post(
            f"{UNIFIED_API_URL}/api/analyze-query",
            json={"query": "Calculate 2x532 and write a poem"},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Query analysis successful")
            print(f"   Strategy: {data['execution_strategy']}")
            print(f"   Confidence: {data['confidence']}")
            return True
        else:
            print(f"❌ Query analysis failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Query analysis error: {e}")
        return False

def test_agent_discovery():
    """Test agent discovery"""
    print("🔍 Testing agent discovery...")
    try:
        response = requests.post(
            f"{UNIFIED_API_URL}/api/discover-agents",
            json={"query": "Calculate 2x532 and write a poem", "max_agents": 5},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Agent discovery successful")
            print(f"   Agents found: {data['total_found']}")
            for agent in data['agents']:
                print(f"   - {agent['name']}: {agent['description']}")
            return True
        else:
            print(f"❌ Agent discovery failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Agent discovery error: {e}")
        return False

def test_text_cleaning():
    """Test text cleaning"""
    print("🔍 Testing text cleaning...")
    try:
        response = requests.post(
            f"{UNIFIED_API_URL}/api/clean-text",
            json={
                "text": "<think>I need to calculate 2x532. Let me do this step by step...</think>Result: 1064",
                "output_type": "agent_response"
            },
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Text cleaning successful")
            print(f"   Original: {data['original_text']}")
            print(f"   Cleaned: {data['cleaned_text']}")
            print(f"   Length reduction: {data['length_reduction']} chars")
            return True
        else:
            print(f"❌ Text cleaning failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Text cleaning error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Unified Orchestration System Tests")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("System Status", test_system_status),
        ("Quick Orchestration", test_quick_orchestration),
        ("Query Analysis", test_query_analysis),
        ("Agent Discovery", test_agent_discovery),
        ("Text Cleaning", test_text_cleaning),
        ("Full Orchestration", test_full_orchestration),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name}...")
        start_time = time.time()
        
        try:
            success = test_func()
            duration = time.time() - start_time
            results.append((test_name, success, duration))
            
            if success:
                print(f"✅ {test_name} passed ({duration:.2f}s)")
            else:
                print(f"❌ {test_name} failed ({duration:.2f}s)")
                
        except Exception as e:
            duration = time.time() - start_time
            results.append((test_name, False, duration))
            print(f"❌ {test_name} error: {e} ({duration:.2f}s)")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    for test_name, success, duration in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name:<20} ({duration:.2f}s)")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Unified orchestration system is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the logs above for details.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
