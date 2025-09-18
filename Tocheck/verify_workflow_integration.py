#!/usr/bin/env python3
"""
Verify Multi-Agent Workflow Integration
Checks all components are properly connected and working
"""

import os
import sys
import importlib.util
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists"""
    if Path(file_path).exists():
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path} - NOT FOUND")
        return False

def check_python_import(module_path, module_name):
    """Check if a Python module can be imported"""
    try:
        spec = importlib.util.spec_from_file_location(module_name, module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        print(f"✅ Python module: {module_name}")
        return True
    except Exception as e:
        print(f"❌ Python module: {module_name} - ERROR: {e}")
        return False

def main():
    print("🔍 Multi-Agent Workflow Integration Verification")
    print("=" * 50)
    
    all_good = True
    
    # Backend Components
    print("\n📁 Backend Components:")
    backend_files = [
        ("backend/workflow_engine.py", "Workflow Engine"),
        ("backend/agent_communicator.py", "Agent Communicator"),
        ("backend/workflow_api.py", "Workflow API"),
        ("backend/simple_api.py", "Main Backend API"),
        ("backend/ollama_service.py", "Ollama Service")
    ]
    
    for file_path, description in backend_files:
        if not check_file_exists(file_path, description):
            all_good = False
    
    # Frontend Components
    print("\n🎨 Frontend Components:")
    frontend_files = [
        ("src/lib/services/WorkflowExecutionService.ts", "Workflow Execution Service"),
        ("src/hooks/useWorkflowExecution.ts", "Workflow Execution Hook"),
        ("src/components/MultiAgentWorkspace/WorkflowExecutionPanel.tsx", "Workflow Execution Panel"),
        ("src/hooks/useOllamaAgentsForPalette.ts", "Ollama Agents Hook")
    ]
    
    for file_path, description in frontend_files:
        if not check_file_exists(file_path, description):
            all_good = False
    
    # Test Scripts
    print("\n🧪 Test Scripts:")
    test_files = [
        ("test_workflow_system.py", "Workflow System Test"),
        ("start_workflow_demo.py", "Demo Startup Script"),
        ("verify_workflow_integration.py", "Integration Verification")
    ]
    
    for file_path, description in test_files:
        if not check_file_exists(file_path, description):
            all_good = False
    
    # Python Import Tests
    print("\n🐍 Python Import Tests:")
    if Path("backend/workflow_engine.py").exists():
        if not check_python_import("backend/workflow_engine.py", "workflow_engine"):
            all_good = False
    
    if Path("backend/agent_communicator.py").exists():
        if not check_python_import("backend/agent_communicator.py", "agent_communicator"):
            all_good = False
    
    # Check Dependencies
    print("\n📦 Dependencies Check:")
    try:
        import fastapi
        print("✅ FastAPI available")
    except ImportError:
        print("❌ FastAPI not installed - run: pip install fastapi")
        all_good = False
    
    try:
        import aiohttp
        print("✅ aiohttp available")
    except ImportError:
        print("❌ aiohttp not installed - run: pip install aiohttp")
        all_good = False
    
    try:
        import uvicorn
        print("✅ uvicorn available")
    except ImportError:
        print("❌ uvicorn not installed - run: pip install uvicorn")
        all_good = False
    
    # Integration Points
    print("\n🔗 Integration Points:")
    
    # Check if workflow API is integrated in main backend
    if Path("backend/simple_api.py").exists():
        with open("backend/simple_api.py", "r") as f:
            content = f.read()
            if "workflow_api" in content and "setup_workflow_routes" in content:
                print("✅ Workflow API integrated in main backend")
            else:
                print("❌ Workflow API not properly integrated in main backend")
                all_good = False
    
    # Check if frontend components are properly connected
    if Path("src/components/MultiAgentWorkspace/WorkflowExecutionPanel.tsx").exists():
        with open("src/components/MultiAgentWorkspace/WorkflowExecutionPanel.tsx", "r") as f:
            content = f.read()
            if "useWorkflowExecution" in content and "useOllamaAgentsForPalette" in content:
                print("✅ Frontend components properly connected")
            else:
                print("❌ Frontend components not properly connected")
                all_good = False
    
    # Summary
    print("\n" + "=" * 50)
    if all_good:
        print("🎉 ALL CHECKS PASSED!")
        print("\nYour multi-agent workflow system is ready to use!")
        print("\nNext steps:")
        print("1. Start Ollama: ollama serve")
        print("2. Run demo: python start_workflow_demo.py")
        print("3. Start frontend: npm run dev")
        print("4. Open http://localhost:3000")
    else:
        print("❌ SOME CHECKS FAILED!")
        print("\nPlease fix the issues above before proceeding.")
        print("Refer to MULTI-AGENT-WORKFLOW-SYSTEM-COMPLETE.md for help.")
    
    return all_good

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)