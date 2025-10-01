#!/usr/bin/env python3
"""
Test script to validate agent creation with different frameworks
"""

import requests
import json
import time

def test_agent_creation():
    """Test agent creation for all frameworks"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Agent Creation Flow")
    print("=" * 50)
    
    # Test configurations for different frameworks
    test_cases = [
        {
            "name": "Test Generic Agent",
            "framework": "generic",
            "config": {
                "model": {
                    "provider": "openai",
                    "model_id": "gpt-4"
                },
                "role": "assistant",
                "description": "Test generic agent"
            }
        },
        {
            "name": "Test Strands Agent", 
            "framework": "strands",
            "config": {
                "model": {
                    "provider": "bedrock",
                    "model_id": "claude-3-sonnet"
                },
                "role": "reasoning",
                "description": "Test strands agent"
            }
        },
        {
            "name": "Test Agent Core Agent",
            "framework": "agentcore", 
            "config": {
                "model": {
                    "provider": "bedrock",
                    "model_id": "claude-3-haiku"
                },
                "role": "workflow",
                "description": "Test agent core agent"
            }
        }
    ]
    
    # Check backend health first
    try:
        health_response = requests.get(f"{base_url}/health")
        if health_response.status_code == 200:
            health_data = health_response.json()
            print("✅ Backend is healthy")
            print(f"📊 API Keys Status:")
            for provider, available in health_data.get('api_keys', {}).items():
                status = "✅" if available else "❌"
                print(f"   {status} {provider.upper()}: {'Available' if available else 'Missing'}")
            print()
        else:
            print("❌ Backend health check failed")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Please start the backend server first.")
        print("   Run: ./scripts/start-backend.sh")
        return
    
    # Test each framework
    results = []
    for test_case in test_cases:
        print(f"🚀 Testing {test_case['framework']} agent: {test_case['name']}")
        
        try:
            response = requests.post(
                f"{base_url}/api/agents",
                json=test_case,
                headers={"Content-Type": "application/json"}
            )
            
            result = response.json()
            
            if result.get('status') == 'failed':
                print(f"   ❌ Failed: {result.get('error', 'Unknown error')}")
                results.append({
                    'framework': test_case['framework'],
                    'status': 'failed',
                    'error': result.get('error')
                })
            else:
                print(f"   ✅ Success: Agent created with ID {result.get('agent_id')}")
                results.append({
                    'framework': test_case['framework'], 
                    'status': 'success',
                    'agent_id': result.get('agent_id')
                })
                
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            results.append({
                'framework': test_case['framework'],
                'status': 'error',
                'error': str(e)
            })
        
        time.sleep(1)  # Brief pause between tests
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 Test Summary:")
    for result in results:
        status_icon = "✅" if result['status'] == 'success' else "❌"
        framework = result['framework'].capitalize()
        print(f"   {status_icon} {framework}: {result['status']}")
        if result.get('error'):
            print(f"      Error: {result['error']}")
    
    # Check final agent count
    try:
        agents_response = requests.get(f"{base_url}/api/agents")
        if agents_response.status_code == 200:
            agents_data = agents_response.json()
            print(f"\n📊 Total agents in database: {agents_data.get('total', 0)}")
            frameworks = agents_data.get('frameworks', {})
            for framework, count in frameworks.items():
                print(f"   • {framework.capitalize()}: {count}")
    except Exception as e:
        print(f"❌ Failed to get final agent count: {e}")

if __name__ == "__main__":
    test_agent_creation()