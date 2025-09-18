#!/usr/bin/env python3

import subprocess
import sys
import os
import time

print("🔍 DEBUGGING FRONTEND STARTUP ISSUE")
print("=" * 50)

def check_requirements():
    """Check if all requirements are met"""
    print("\n📋 CHECKING REQUIREMENTS:")
    
    # Check Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"   ✅ Node.js: {result.stdout.strip()}")
        else:
            print("   ❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("   ❌ Node.js not installed")
        return False
    
    # Check npm
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"   ✅ npm: {result.stdout.strip()}")
        else:
            print("   ❌ npm not found")
            return False
    except FileNotFoundError:
        print("   ❌ npm not installed")
        return False
    
    # Check package.json
    if os.path.exists("package.json"):
        print("   ✅ package.json exists")
    else:
        print("   ❌ package.json missing")
        return False
    
    # Check if node_modules exists
    if os.path.exists("node_modules"):
        print("   ✅ node_modules exists")
    else:
        print("   ⚠️ node_modules missing - need to run npm install")
    
    return True

def install_dependencies():
    """Install npm dependencies"""
    print("\n📦 INSTALLING DEPENDENCIES:")
    
    try:
        print("   Running npm install...")
        result = subprocess.run(["npm", "install"], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("   ✅ Dependencies installed successfully")
            return True
        else:
            print(f"   ❌ npm install failed:")
            print(f"   Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error running npm install: {e}")
        return False

def check_vite_config():
    """Check if Vite config exists"""
    print("\n⚙️ CHECKING VITE CONFIGURATION:")
    
    vite_configs = ["vite.config.js", "vite.config.ts", "vite.config.mjs"]
    config_found = False
    
    for config in vite_configs:
        if os.path.exists(config):
            print(f"   ✅ Found {config}")
            config_found = True
            break
    
    if not config_found:
        print("   ⚠️ No Vite config found - using defaults")
    
    return True

def start_frontend_with_debug():
    """Start frontend with detailed output"""
    print("\n🚀 STARTING FRONTEND WITH DEBUG OUTPUT:")
    
    try:
        print("   Executing: npm run dev")
        
        # Start the process and capture output in real-time
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        print(f"   Process started with PID: {process.pid}")
        print("   Output:")
        
        # Read output line by line
        for line in process.stdout:
            print(f"   {line.strip()}")
            
            # Check for success indicators
            if "Local:" in line and "localhost:5173" in line:
                print("\n   ✅ Frontend started successfully!")
                print("   🌐 Open: http://localhost:5173")
                break
            
            # Check for error indicators
            if "error" in line.lower() or "failed" in line.lower():
                print(f"\n   ❌ Error detected: {line.strip()}")
        
        return process
        
    except Exception as e:
        print(f"   ❌ Error starting frontend: {e}")
        return None

def main():
    # Check requirements
    if not check_requirements():
        print("\n❌ Requirements not met. Please install Node.js and npm.")
        return
    
    # Install dependencies if needed
    if not os.path.exists("node_modules"):
        if not install_dependencies():
            print("\n❌ Failed to install dependencies.")
            return
    
    # Check Vite config
    check_vite_config()
    
    # Start frontend with debug output
    process = start_frontend_with_debug()
    
    if process:
        try:
            print("\n📊 Frontend is running. Press Ctrl+C to stop.")
            process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping frontend...")
            process.terminate()
            process.wait()
            print("   ✅ Frontend stopped")

if __name__ == "__main__":
    main()