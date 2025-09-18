#!/usr/bin/env python3
"""
TEST FRONTEND MULTI-AGENT WORKSPACE ACCESS
Check if the frontend can load the MultiAgentWorkspace without errors
"""

import requests
import time
import subprocess
import os
import signal

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

def test_frontend_access():
    """Test frontend access to MultiAgentWorkspace"""
    
    print_status("🧪 TESTING FRONTEND MULTI-AGENT WORKSPACE ACCESS", "INFO")
    print_status("=" * 60, "INFO")
    
    # Test 1: Check if frontend is running
    print_status("\n🌐 TESTING FRONTEND SERVER:", "INFO")
    
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
    
    # Test 2: Check specific MultiAgentWorkspace route
    if frontend_running:
        print_status("\n🔧 TESTING MULTI-AGENT WORKSPACE ROUTE:", "INFO")
        
        try:
            response = requests.get("http://localhost:5173/multi-agent-workspace", timeout=10)
            if response.status_code == 200:
                print_status("✅ MultiAgent Route: ACCESSIBLE", "SUCCESS")
                
                # Check if the response contains error indicators
                content = response.text.lower()
                if "unavailable" in content or "error" in content:
                    print_status("⚠️ Route loads but shows error content", "WARNING")
                    route_working = False
                else:
                    print_status("✅ Route content looks good", "SUCCESS")
                    route_working = True
            else:
                print_status(f"⚠️ MultiAgent Route: {response.status_code}", "WARNING")
                route_working = False
        except Exception as e:
            print_status(f"❌ MultiAgent Route: ERROR - {e}", "ERROR")
            route_working = False
    else:
        route_working = False
    
    # Test 3: Check backend connection
    print_status("\n🔗 TESTING BACKEND CONNECTION:", "INFO")
    
    try:
        response = requests.get("http://localhost:5052/health", timeout=5)
        if response.status_code == 200:
            print_status("✅ Backend Health: GOOD", "SUCCESS")
            backend_running = True
        else:
            print_status(f"⚠️ Backend Health: {response.status_code}", "WARNING")
            backend_running = False
    except Exception as e:
        print_status(f"❌ Backend Health: ERROR - {e}", "ERROR")
        backend_running = False
    
    # Test 4: Check key frontend files
    print_status("\n📁 CHECKING KEY FRONTEND FILES:", "INFO")
    
    key_files = [
        "src/pages/MultiAgentWorkspace.tsx",
        "src/components/MultiAgentWorkspace/BlankWorkspace.tsx",
        "src/components/MultiAgentWorkspace/AgentPalette.tsx",
        "src/App.tsx"
    ]
    
    files_exist = 0
    for file_path in key_files:
        if os.path.exists(file_path):
            print_status(f"   ✅ {os.path.basename(file_path)}", "SUCCESS")
            files_exist += 1
        else:
            print_status(f"   ❌ {os.path.basename(file_path)}", "ERROR")
    
    files_percentage = (files_exist / len(key_files)) * 100
    
    # Final assessment
    print_status("\n🎯 DIAGNOSIS:", "INFO")
    print_status("=" * 60, "INFO")
    
    if frontend_running and route_working and backend_running and files_percentage == 100:
        print_status("🎉 MULTI-AGENT WORKSPACE: FULLY FUNCTIONAL!", "SUCCESS")
        print_status("✅ All systems operational", "SUCCESS")
        
    elif frontend_running and files_percentage == 100:
        print_status("🔶 FRONTEND ISSUE DETECTED", "WARNING")
        print_status("✅ Frontend server running", "SUCCESS")
        print_status("✅ Files present", "SUCCESS")
        if not route_working:
            print_status("❌ Route has errors - check browser console", "ERROR")
        if not backend_running:
            print_status("⚠️ Backend not running - some features may not work", "WARNING")
            
        print_status("\n🔧 RECOMMENDED ACTIONS:", "WARNING")
        print_status("1. Open browser dev tools and check console errors", "WARNING")
        print_status("2. Check network tab for failed requests", "WARNING")
        print_status("3. Restart frontend: npm run dev", "WARNING")
        
    elif not frontend_running:
        print_status("❌ FRONTEND NOT RUNNING", "ERROR")
        print_status("\n🔧 START FRONTEND:", "ERROR")
        print_status("Run: npm run dev", "ERROR")
        
    else:
        print_status("❌ MULTIPLE ISSUES DETECTED", "ERROR")
        print_status(f"📁 Files: {files_percentage:.0f}%", "INFO")
        print_status(f"🌐 Frontend: {'✅' if frontend_running else '❌'}", "INFO")
        print_status(f"🔗 Backend: {'✅' if backend_running else '❌'}", "INFO")
    
    print_status(f"\n🏁 FRONTEND TEST COMPLETE", "SUCCESS")

if __name__ == "__main__":
    test_frontend_access()