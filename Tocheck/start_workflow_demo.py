#!/usr/bin/env python3
"""
Quick Start Script for Multi-Agent Workflow Demo
Starts backend, tests system, and provides instructions
"""

import subprocess
import sys
import time
import asyncio
import aiohttp
import json
from pathlib import Path

def print_banner():
    print("""
🚀 Multi-Agent Workflow System Demo
=====================================

This script will:
1. Start the backend server
2. Test the workflow system
3. Provide next steps for frontend

""")

def check_ollama():
    """Check if Ollama is running"""
    try:
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            models = result.stdout.strip().split('\n')[1:]  # Skip header
            print(f"✅ Ollama is running with {len(models)} models")
            for model in models[:3]:  # Show first 3 models
                if model.strip():
                    print(f"   • {model.split()[0]}")
            return True
        else:
            print("❌ Ollama is not responding properly")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print("❌ Ollama is not running or not installed")
        print("   Please start Ollama with: ollama serve")
        return False

def start_backend():
    """Start the backend server"""
    print("\n🔧 Starting backend server...")
    
    backend_path = Path("backend")
    if not backend_path.exists():
        print("❌ Backend directory not found")
        return None
    
    try:
        # Start backend in background
        process = subprocess.Popen(
            [sys.executable, "simple_api.py"],
            cwd=backend_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a moment for startup
        time.sleep(3)
        
        # Check if process is still running
        if process.poll() is None:
            print("✅ Backend server started successfully")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Backend failed to start:")
            print(f"   stdout: {stdout.decode()}")
            print(f"   stderr: {stderr.decode()}")
            return None
            
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

async def test_system():
    """Test the workflow system"""
    print("\n🧪 Testing workflow system...")
    
    try:
        # Import and run the test
        from test_workflow_system import test_workflow_system
        await test_workflow_system()
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def print_next_steps():
    """Print instructions for next steps"""
    print("""
🎉 System is ready! Next steps:

1. Start your React frontend:
   npm run dev

2. Open your browser:
   http://localhost:3000

3. Navigate to Multi-Agent Workspace:
   Click "Multi-Agent Workspace" in the sidebar

4. Use the Workflow Execution Panel:
   • Enter a task description
   • Select agents from the list
   • Click "Execute Workflow"
   • Watch real-time progress!

5. Example tasks to try:
   • "Analyze customer complaint about delayed delivery"
   • "Create marketing strategy for new product launch"
   • "Assess financial risk for investment proposal"

📚 Documentation:
   See MULTI-AGENT-WORKFLOW-SYSTEM-COMPLETE.md for full details

🔧 Troubleshooting:
   • Backend logs: Check terminal output
   • Frontend issues: Check browser console
   • Agent problems: Verify Ollama models are available

Happy workflow building! 🚀
""")

def main():
    print_banner()
    
    # Check prerequisites
    if not check_ollama():
        print("\n❌ Please start Ollama first:")
        print("   ollama serve")
        return
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        return
    
    try:
        # Test system
        success = asyncio.run(test_system())
        
        if success:
            print_next_steps()
            
            # Keep backend running
            print("\n⏳ Backend is running. Press Ctrl+C to stop...")
            try:
                backend_process.wait()
            except KeyboardInterrupt:
                print("\n🛑 Stopping backend...")
                backend_process.terminate()
                backend_process.wait()
                print("✅ Backend stopped")
        else:
            print("\n❌ System test failed. Check the logs above.")
            backend_process.terminate()
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping backend...")
        backend_process.terminate()
        backend_process.wait()
        print("✅ Backend stopped")

if __name__ == "__main__":
    main()