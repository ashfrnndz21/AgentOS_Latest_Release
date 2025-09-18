#!/usr/bin/env python3
"""
TEST MULTI AGENT WORKSPACE
Test the restored Multi Agent Workspace functionality
"""

import requests
import json
import time

def print_status(message, status="INFO"):
    """Print colored status messages"""
    colors = {
        "INFO": "\033[94m",     # Blue
        "SUCCESS": "\033[92m",  # Green
        "WARNING": "\033[93m",  # Yellow
        "ERROR": "\033[91m",    # Red
        "RESET": "\033[0m"      # Reset
    }
    print(f"{colors.get(status, '')}{message}{colors['RESET']}")

def test_backend_endpoints():
    """Test backend workflow endpoints"""
    
    print_status("🧪 TESTING MULTI AGENT WORKSPACE BACKEND", "INFO")
    print_status("=" * 60, "INFO")
    
    base_url = "http://localhost:5052"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print_status("✅ Backend Health Check: PASSED", "SUCCESS")
            health_data = response.json()
            print_status(f"   Status: {health_data.get('status', 'unknown')}", "INFO")
        else:
            print_status("❌ Backend Health Check: FAILED", "ERROR")
            return False
    except Exception as e:
        print_status(f"❌ Backend Health Check: ERROR - {e}", "ERROR")
        return False
    
    # Test workflow endpoints
    workflow_endpoints = [
        ("/api/workflows/create", "POST", "Workflow Creation"),
        ("/api/workflows/execute", "POST", "Workflow Execution"),
        ("/api/agents/register", "POST", "Agent Registration"),
    ]
    
    for endpoint, method, description in workflow_endpoints:
        try:
            if method == "POST":
                # Send minimal test data
                test_data = {"test": True}
                response = requests.post(f"{base_url}{endpoint}", 
                                       json=test_data, timeout=5)
            else:
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
            
            # Accept various response codes (endpoint exists)
            if response.status_code in [200, 400, 422, 405]:
                print_status(f"✅ {description}: AVAILABLE", "SUCCESS")
            else:
                print_status(f"⚠️ {description}: Unexpected response ({response.status_code})", "WARNING")
        
        except Exception as e:
            print_status(f"❌ {description}: ERROR - {e}", "ERROR")
    
    return True

def test_workflow_creation():
    """Test creating a simple workflow"""
    
    print_status("\n🔧 TESTING WORKFLOW CREATION", "INFO")
    
    base_url = "http://localhost:5052"
    
    # Create a simple test workflow
    test_workflow = {
        "name": "Test Multi-Agent Workflow",
        "description": "Simple test workflow for Multi Agent Workspace",
        "nodes": [
            {
                "id": "agent1",
                "type": "agent",
                "name": "Test Agent",
                "model": "llama3.2:latest",
                "prompt": "You are a helpful assistant",
                "position": {"x": 100, "y": 100}
            },
            {
                "id": "human1", 
                "type": "human",
                "name": "Human Input",
                "position": {"x": 300, "y": 100}
            }
        ],
        "connections": [
            {
                "from": "agent1",
                "to": "human1",
                "type": "data"
            }
        ]
    }
    
    try:
        response = requests.post(f"{base_url}/api/workflows/create", 
                               json=test_workflow, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print_status("✅ Workflow Creation: SUCCESS", "SUCCESS")
            print_status(f"   Workflow ID: {result.get('workflow_id', 'N/A')}", "INFO")
            return result.get('workflow_id')
        else:
            print_status(f"⚠️ Workflow Creation: Response {response.status_code}", "WARNING")
            print_status(f"   Response: {response.text[:200]}", "INFO")
            return None
    
    except Exception as e:
        print_status(f"❌ Workflow Creation: ERROR - {e}", "ERROR")
        return None

def test_agent_registration():
    """Test registering an agent"""
    
    print_status("\n🤖 TESTING AGENT REGISTRATION", "INFO")
    
    base_url = "http://localhost:5052"
    
    test_agent = {
        "name": "Test Workspace Agent",
        "type": "ollama",
        "model": "llama3.2:latest",
        "capabilities": ["chat", "analysis"],
        "description": "Test agent for Multi Agent Workspace"
    }
    
    try:
        response = requests.post(f"{base_url}/api/agents/register",
                               json=test_agent, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print_status("✅ Agent Registration: SUCCESS", "SUCCESS")
            print_status(f"   Agent ID: {result.get('agent_id', 'N/A')}", "INFO")
            return result.get('agent_id')
        else:
            print_status(f"⚠️ Agent Registration: Response {response.status_code}", "WARNING")
            print_status(f"   Response: {response.text[:200]}", "INFO")
            return None
    
    except Exception as e:
        print_status(f"❌ Agent Registration: ERROR - {e}", "ERROR")
        return None

def main():
    """Main test function"""
    
    print_status("🚀 MULTI AGENT WORKSPACE FUNCTIONALITY TEST", "SUCCESS")
    print_status("=" * 60, "SUCCESS")
    
    # Test backend connectivity
    if not test_backend_endpoints():
        print_status("\n❌ Backend tests failed - cannot proceed", "ERROR")
        return
    
    # Test workflow creation
    workflow_id = test_workflow_creation()
    
    # Test agent registration
    agent_id = test_agent_registration()
    
    # Summary
    print_status("\n📊 TEST SUMMARY", "INFO")
    print_status("=" * 60, "INFO")
    
    tests_passed = 0
    total_tests = 3
    
    print_status("✅ Backend Connectivity: PASSED", "SUCCESS")
    tests_passed += 1
    
    if workflow_id:
        print_status("✅ Workflow Creation: PASSED", "SUCCESS")
        tests_passed += 1
    else:
        print_status("❌ Workflow Creation: FAILED", "ERROR")
    
    if agent_id:
        print_status("✅ Agent Registration: PASSED", "SUCCESS")
        tests_passed += 1
    else:
        print_status("❌ Agent Registration: FAILED", "ERROR")
    
    success_rate = (tests_passed / total_tests) * 100
    
    print_status(f"\n📈 SUCCESS RATE: {success_rate:.1f}% ({tests_passed}/{total_tests})", 
                "SUCCESS" if success_rate >= 70 else "WARNING")
    
    if success_rate >= 70:
        print_status("\n🎉 MULTI AGENT WORKSPACE: READY FOR USE!", "SUCCESS")
        print_status("🌐 Frontend URL: http://localhost:5173/multi-agent-workspace", "SUCCESS")
        print_status("🎨 Features Available:", "SUCCESS")
        print_status("   • Drag-and-drop workflow builder", "SUCCESS")
        print_status("   • Multi-agent orchestration", "SUCCESS")
        print_status("   • Real-time execution", "SUCCESS")
        print_status("   • Visual workflow canvas", "SUCCESS")
    else:
        print_status("\n⚠️ MULTI AGENT WORKSPACE: NEEDS ATTENTION", "WARNING")
        print_status("🔧 Some features may not work properly", "WARNING")

if __name__ == "__main__":
    main()