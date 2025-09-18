#!/usr/bin/env python3
"""
TEST SIMPLE MULTI-AGENT WORKSPACE
Test if the simplified version loads without errors
"""

import subprocess
import time
import requests
import os
import signal

def test_simple_multiagent():
    """Test the simple MultiAgent workspace"""
    
    print("🧪 TESTING SIMPLE MULTI-AGENT WORKSPACE")
    print("=" * 50)
    
    # Check if frontend is already running
    try:
        response = requests.get("http://localhost:5173", timeout=3)
        if response.status_code == 200:
            print("✅ Frontend already running")
            frontend_running = True
        else:
            frontend_running = False
    except:
        frontend_running = False
    
    if not frontend_running:
        print("🚀 Starting frontend...")
        try:
            # Start frontend in background
            process = subprocess.Popen(
                ["npm", "run", "dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid if hasattr(os, 'setsid') else None
            )
            
            # Wait for frontend to start
            for i in range(30):  # Wait up to 30 seconds
                try:
                    response = requests.get("http://localhost:5173", timeout=2)
                    if response.status_code == 200:
                        print("✅ Frontend started successfully")
                        frontend_running = True
                        break
                except:
                    pass
                time.sleep(1)
                print(f"⏳ Waiting for frontend... ({i+1}/30)")
            
            if not frontend_running:
                print("❌ Frontend failed to start")
                return
                
        except Exception as e:
            print(f"❌ Error starting frontend: {e}")
            return
    
    # Test MultiAgent workspace route
    print("\n🔧 Testing MultiAgent Workspace route...")
    
    try:
        response = requests.get("http://localhost:5173/multi-agent-workspace", timeout=10)
        if response.status_code == 200:
            content = response.text.lower()
            
            if "component error" in content or "unavailable" in content:
                print("❌ MultiAgent Workspace still showing errors")
                print("🔍 Check browser console for details")
            elif "multi-agent workspace" in content:
                print("✅ MultiAgent Workspace loaded successfully!")
                print("🎉 Simple version is working")
                
                # Check for key elements
                if "create new workflow" in content:
                    print("✅ Create New Workflow button found")
                if "strands intelligent workflow" in content:
                    print("✅ Strands Workflow option found")
                if "project templates" in content:
                    print("✅ Project Templates section found")
                    
            else:
                print("⚠️ MultiAgent Workspace loaded but content unclear")
        else:
            print(f"❌ MultiAgent Workspace returned {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing MultiAgent route: {e}")
    
    print(f"\n🌐 Frontend URL: http://localhost:5173/multi-agent-workspace")
    print("🔍 Open in browser to verify visually")
    
    # Don't kill the frontend process - let it keep running
    print("\n✅ Test complete - frontend still running")

if __name__ == "__main__":
    test_simple_multiagent()