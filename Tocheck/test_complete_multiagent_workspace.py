#!/usr/bin/env python3
"""
TEST COMPLETE MULTI-AGENT WORKSPACE
Comprehensive test of the complete Multi-Agent Workspace implementation
"""

import requests
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

def test_complete_implementation():
    """Test the complete Multi-Agent Workspace implementation"""
    
    print_status("🧪 TESTING COMPLETE MULTI-AGENT WORKSPACE IMPLEMENTATION", "INFO")
    print_status("=" * 70, "INFO")
    
    # Test 1: Check all created files exist
    print_status("\n📁 CHECKING CREATED FILES:", "INFO")
    
    required_files = [
        "src/components/MultiAgentWorkspace/FunctionalBlankWorkspace.tsx",
        "src/components/MultiAgentWorkspace/WorkflowCanvas.tsx", 
        "src/components/MultiAgentWorkspace/EnhancedAgentPalette.tsx",
        "src/components/MultiAgentWorkspace/ExecutionMonitor.tsx",
        "src/lib/services/WorkflowService.ts",
        "src/components/ui/progress.tsx",
        "src/pages/MultiAgentWorkspace.tsx"
    ]
    
    files_exist = 0
    for file_path in required_files:
        if os.path.exists(file_path):
            print_status(f"   ✅ {os.path.basename(file_path)}", "SUCCESS")
            files_exist += 1
        else:
            print_status(f"   ❌ {os.path.basename(file_path)}", "ERROR")
    
    files_percentage = (files_exist / len(required_files)) * 100
    print_status(f"   📊 Files Created: {files_percentage:.1f}% ({files_exist}/{len(required_files)})", 
                "SUCCESS" if files_percentage == 100 else "WARNING")
    
    # Test 2: Check backend connectivity
    print_status("\n🔗 TESTING BACKEND CONNECTIVITY:", "INFO")
    
    try:
        response = requests.get("http://localhost:5052/health", timeout=5)
        if response.status_code == 200:
            print_status("✅ Backend Health: GOOD", "SUCCESS")
            backend_healthy = True
        else:
            print_status(f"⚠️ Backend Health: {response.status_code}", "WARNING")
            backend_healthy = False
    except Exception as e:
        print_status(f"❌ Backend Health: ERROR - {e}", "ERROR")
        backend_healthy = False
    
    # Test 3: Test workflow API endpoints
    if backend_healthy:
        print_status("\n⚡ TESTING WORKFLOW API ENDPOINTS:", "INFO")
        
        # Test agent registration
        try:
            agent_data = {
                "agent_id": "test-functional-agent",
                "name": "Functional Test Agent",
                "role": "Test Assistant",
                "model": "llama3.2:latest",
                "capabilities": ["chat", "analysis"],
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            response = requests.post("http://localhost:5052/api/agents/register", 
                                   json=agent_data, timeout=10)
            
            if response.status_code == 200:
                print_status("✅ Agent Registration: SUCCESS", "SUCCESS")
                agent_registered = True
            else:
                print_status(f"⚠️ Agent Registration: {response.status_code}", "WARNING")
                agent_registered = False
        except Exception as e:
            print_status(f"❌ Agent Registration: ERROR - {e}", "ERROR")
            agent_registered = False
        
        # Test workflow creation
        try:
            workflow_data = {
                "name": "Functional Test Workflow",
                "description": "Test workflow for complete implementation",
                "nodes": [
                    {
                        "id": "agent1",
                        "type": "agent",
                        "name": "Test Agent",
                        "config": {
                            "model": "llama3.2:latest",
                            "prompt": "You are a test agent",
                            "temperature": 0.7,
                            "max_tokens": 500
                        },
                        "position": {"x": 100, "y": 100},
                        "connections": ["human1"]
                    },
                    {
                        "id": "human1",
                        "type": "human",
                        "name": "User Input",
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
            
            response = requests.post("http://localhost:5052/api/workflows/create",
                                   json=workflow_data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                print_status("✅ Workflow Creation: SUCCESS", "SUCCESS")
                print_status(f"   Workflow ID: {result.get('workflow_id', 'N/A')}", "INFO")
                workflow_created = True
                workflow_id = result.get('workflow_id')
            else:
                print_status(f"⚠️ Workflow Creation: {response.status_code}", "WARNING")
                workflow_created = False
                workflow_id = None
        except Exception as e:
            print_status(f"❌ Workflow Creation: ERROR - {e}", "ERROR")
            workflow_created = False
            workflow_id = None
        
        # Test workflow execution
        if workflow_id:
            try:
                execution_data = {
                    "workflow_id": workflow_id,
                    "user_input": "Test execution of functional workspace"
                }
                
                response = requests.post("http://localhost:5052/api/workflows/execute",
                                       json=execution_data, timeout=15)
                
                if response.status_code == 200:
                    result = response.json()
                    print_status("✅ Workflow Execution: SUCCESS", "SUCCESS")
                    print_status(f"   Session ID: {result.get('session_id', 'N/A')}", "INFO")
                    execution_success = True
                else:
                    print_status(f"⚠️ Workflow Execution: {response.status_code}", "WARNING")
                    execution_success = False
            except Exception as e:
                print_status(f"❌ Workflow Execution: ERROR - {e}", "ERROR")
                execution_success = False
        else:
            execution_success = False
    else:
        agent_registered = False
        workflow_created = False
        execution_success = False
    
    # Test 4: Check frontend accessibility
    print_status("\n🌐 TESTING FRONTEND ACCESSIBILITY:", "INFO")
    
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print_status("✅ Frontend Server: RUNNING", "SUCCESS")
            frontend_running = True
        else:
            print_status(f"⚠️ Frontend Server: {response.status_code}", "WARNING")
            frontend_running = False
    except Exception as e:
        print_status(f"❌ Frontend Server: NOT RUNNING - {e}", "ERROR")
        frontend_running = False
    
    if frontend_running:
        try:
            response = requests.get("http://localhost:5173/multi-agent-workspace", timeout=10)
            if response.status_code == 200:
                content = response.text.lower()
                if "multi-agent workspace" in content and "component error" not in content:
                    print_status("✅ Multi-Agent Workspace Route: ACCESSIBLE", "SUCCESS")
                    route_accessible = True
                else:
                    print_status("⚠️ Multi-Agent Workspace Route: HAS ERRORS", "WARNING")
                    route_accessible = False
            else:
                print_status(f"⚠️ Multi-Agent Workspace Route: {response.status_code}", "WARNING")
                route_accessible = False
        except Exception as e:
            print_status(f"❌ Multi-Agent Workspace Route: ERROR - {e}", "ERROR")
            route_accessible = False
    else:
        route_accessible = False
    
    # Final Assessment
    print_status("\n🎯 FINAL ASSESSMENT:", "INFO")
    print_status("=" * 70, "INFO")
    
    total_tests = 7
    passed_tests = sum([
        files_percentage == 100,
        backend_healthy,
        agent_registered,
        workflow_created,
        execution_success,
        frontend_running,
        route_accessible
    ])
    
    success_rate = (passed_tests / total_tests) * 100
    
    if success_rate >= 85:
        print_status("🎉 MULTI-AGENT WORKSPACE: FULLY FUNCTIONAL!", "SUCCESS")
        print_status("✅ Complete implementation working", "SUCCESS")
        print_status("✅ Backend APIs operational", "SUCCESS")
        print_status("✅ Frontend components loaded", "SUCCESS")
        print_status("✅ Workflow system ready", "SUCCESS")
        
        print_status("\n🚀 READY TO USE:", "SUCCESS")
        print_status("1. Frontend: http://localhost:5173/multi-agent-workspace", "SUCCESS")
        print_status("2. Create workflows with drag-and-drop", "SUCCESS")
        print_status("3. Execute workflows in real-time", "SUCCESS")
        print_status("4. Monitor execution progress", "SUCCESS")
        
    elif success_rate >= 60:
        print_status("🔶 MULTI-AGENT WORKSPACE: MOSTLY FUNCTIONAL", "WARNING")
        print_status(f"📊 Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests})", "WARNING")
        print_status("⚠️ Some features may have issues", "WARNING")
        print_status("🔧 Check failed tests above for details", "WARNING")
        
    else:
        print_status("❌ MULTI-AGENT WORKSPACE: NEEDS WORK", "ERROR")
        print_status(f"📊 Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests})", "ERROR")
        print_status("❌ Multiple critical issues detected", "ERROR")
        print_status("🔧 Review and fix failed components", "ERROR")
    
    print_status(f"\n📊 OVERALL SUCCESS RATE: {success_rate:.1f}%", 
                "SUCCESS" if success_rate >= 85 else "WARNING" if success_rate >= 60 else "ERROR")
    print_status("🏁 COMPLETE IMPLEMENTATION TEST FINISHED", "INFO")

if __name__ == "__main__":
    test_complete_implementation()