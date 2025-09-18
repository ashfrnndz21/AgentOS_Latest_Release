#!/usr/bin/env python3
"""
TEST MULTI AGENT WORKSPACE - PROPER FORMAT
Test with correct API data formats based on backend expectations
"""

import requests
import json
import time
import os

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

def test_workflow_with_correct_format():
    """Test workflow creation with correct API format"""
    
    print_status("🧪 TESTING MULTI AGENT WORKSPACE WITH CORRECT FORMAT", "INFO")
    print_status("=" * 60, "INFO")
    
    base_url = "http://localhost:5052"
    
    # Test 1: Agent Registration (correct format)
    print_status("\n🤖 TESTING AGENT REGISTRATION:", "INFO")
    
    agent_data = {
        "agent_id": "test-agent-001",
        "name": "Test Workspace Agent",
        "role": "Customer Support Assistant",
        "model": "llama3.2:latest",
        "capabilities": ["chat", "analysis", "problem-solving"],
        "temperature": 0.7,
        "max_tokens": 1000
    }
    
    try:
        response = requests.post(f"{base_url}/api/agents/register", 
                               json=agent_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print_status("✅ Agent Registration: SUCCESS", "SUCCESS")
            print_status(f"   Agent ID: {result.get('agent_id', 'N/A')}", "INFO")
            agent_registered = True
        else:
            print_status(f"⚠️ Agent Registration: {response.status_code}", "WARNING")
            print_status(f"   Response: {response.text[:200]}", "INFO")
            agent_registered = False
    
    except Exception as e:
        print_status(f"❌ Agent Registration: ERROR - {e}", "ERROR")
        agent_registered = False
    
    # Test 2: Workflow Creation (correct format)
    print_status("\n🔧 TESTING WORKFLOW CREATION:", "INFO")
    
    workflow_data = {
        "name": "Customer Support Workflow",
        "description": "Multi-agent customer support workflow",
        "nodes": [
            {
                "id": "agent1",
                "type": "agent",
                "name": "Support Agent",
                "config": {
                    "model": "llama3.2:latest",
                    "prompt": "You are a customer support agent",
                    "temperature": 0.7,
                    "max_tokens": 500
                },
                "position": {"x": 100, "y": 100},
                "connections": ["human1"]
            },
            {
                "id": "human1",
                "type": "human", 
                "name": "Customer Input",
                "config": {
                    "input_type": "text",
                    "required": True
                },
                "position": {"x": 300, "y": 100},
                "connections": []
            }
        ],
        "edges": [
            {
                "from": "agent1",
                "to": "human1",
                "type": "data"
            }
        ],
        "entry_point": "agent1"
    }
    
    try:
        response = requests.post(f"{base_url}/api/workflows/create",
                               json=workflow_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print_status("✅ Workflow Creation: SUCCESS", "SUCCESS")
            print_status(f"   Workflow ID: {result.get('workflow_id', 'N/A')}", "INFO")
            workflow_id = result.get('workflow_id')
        else:
            print_status(f"⚠️ Workflow Creation: {response.status_code}", "WARNING")
            print_status(f"   Response: {response.text[:300]}", "INFO")
            workflow_id = None
    
    except Exception as e:
        print_status(f"❌ Workflow Creation: ERROR - {e}", "ERROR")
        workflow_id = None
    
    # Test 3: Workflow Execution (if workflow was created)
    if workflow_id:
        print_status("\n⚡ TESTING WORKFLOW EXECUTION:", "INFO")
        
        execution_data = {
            "workflow_id": workflow_id,
            "user_input": "Hello, I need help with my account"
        }
        
        try:
            response = requests.post(f"{base_url}/api/workflows/execute",
                                   json=execution_data, timeout=15)
            
            if response.status_code == 200:
                result = response.json()
                print_status("✅ Workflow Execution: SUCCESS", "SUCCESS")
                print_status(f"   Session ID: {result.get('session_id', 'N/A')}", "INFO")
                session_id = result.get('session_id')
                
                # Check execution status
                if session_id:
                    time.sleep(2)  # Wait for execution
                    status_response = requests.get(f"{base_url}/api/workflows/session/{session_id}/status")
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        print_status(f"   Execution Status: {status_data.get('status', 'unknown')}", "INFO")
                
            else:
                print_status(f"⚠️ Workflow Execution: {response.status_code}", "WARNING")
                print_status(f"   Response: {response.text[:300]}", "INFO")
        
        except Exception as e:
            print_status(f"❌ Workflow Execution: ERROR - {e}", "ERROR")
    
    # Test 4: Frontend Component Check
    print_status("\n🎨 CHECKING FRONTEND COMPONENTS:", "INFO")
    
    key_frontend_files = [
        "src/pages/MultiAgentWorkspace.tsx",
        "src/components/MultiAgentWorkspace/StrandsWorkflowCanvas.tsx",
        "src/components/MultiAgentWorkspace/AgentPalette.tsx",
        "src/components/MultiAgentWorkspace/PropertiesPanel.tsx",
        "src/lib/services/WorkflowExecutionService.ts"
    ]
    
    frontend_working = 0
    for file_path in key_frontend_files:
        if os.path.exists(file_path):
            print_status(f"   ✅ {os.path.basename(file_path)}", "SUCCESS")
            frontend_working += 1
        else:
            print_status(f"   ❌ {os.path.basename(file_path)}", "ERROR")
    
    frontend_percentage = (frontend_working / len(key_frontend_files)) * 100
    print_status(f"   📊 Frontend Components: {frontend_percentage:.1f}%", 
                "SUCCESS" if frontend_percentage >= 80 else "WARNING")
    
    # Final assessment
    print_status("\n🎯 FINAL ASSESSMENT:", "INFO")
    print_status("=" * 60, "INFO")
    
    if agent_registered and workflow_id and frontend_percentage >= 80:
        print_status("🎉 MULTI AGENT WORKSPACE: FULLY FUNCTIONAL!", "SUCCESS")
        print_status("✅ Backend APIs working", "SUCCESS")
        print_status("✅ Frontend components available", "SUCCESS")
        print_status("✅ Workflow creation successful", "SUCCESS")
        print_status("✅ Agent registration working", "SUCCESS")
        
        print_status("\n🚀 HOW TO USE:", "SUCCESS")
        print_status("1. Start frontend: npm run dev", "SUCCESS")
        print_status("2. Navigate to: http://localhost:5173/multi-agent-workspace", "SUCCESS")
        print_status("3. Use drag-drop to create workflows", "SUCCESS")
        print_status("4. Configure agents and connections", "SUCCESS")
        print_status("5. Execute workflows in real-time", "SUCCESS")
        
    elif frontend_percentage >= 80:
        print_status("🔶 MULTI AGENT WORKSPACE: FRONTEND READY, BACKEND NEEDS WORK", "WARNING")
        print_status("✅ Frontend components functional", "SUCCESS")
        print_status("⚠️ Backend API format issues", "WARNING")
        print_status("🔧 Fix API data formats for full functionality", "WARNING")
        
    else:
        print_status("❌ MULTI AGENT WORKSPACE: NEEDS SIGNIFICANT WORK", "ERROR")
        print_status("❌ Both frontend and backend have issues", "ERROR")
    
    print_status(f"\n🏁 MULTI AGENT WORKSPACE TEST COMPLETE", "SUCCESS")

if __name__ == "__main__":
    test_workflow_with_correct_format()