#!/usr/bin/env python3
"""
Reliable System Startup Script
Starts backend and frontend with proper error handling
"""

import subprocess
import sys
import time
import requests
import os

def start_backend():
    """Start backend on port 5052"""
    print("🚀 Starting backend...")
    
    try:
        process = subprocess.Popen([
            sys.executable, "backend/simple_api.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        # Wait for startup
        time.sleep(3)
        
        # Test health
        response = requests.get("http://localhost:5052/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend started successfully on port 5052")
            return process
        else:
            print("❌ Backend health check failed")
            return None
            
    except Exception as e:
        print(f"❌ Backend startup failed: {e}")
        return None

def start_frontend():
    """Start frontend"""
    print("🚀 Starting frontend...")
    
    try:
        process = subprocess.Popen([
            "npm", "run", "dev"
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        print("✅ Frontend started")
        return process
        
    except Exception as e:
        print(f"❌ Frontend startup failed: {e}")
        return None

def main():
    print("🚀 Starting Complete System...")
    print("=" * 50)
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ Cannot start system without backend")
        return
    
    # Start frontend  
    frontend_process = start_frontend()
    if not frontend_process:
        print("⚠️ Frontend failed to start")
    
    print("=" * 50)
    print("✅ System startup complete!")
    print("🌐 Backend: http://localhost:5052")
    print("🖥️ Frontend: http://localhost:5173")
    print("Press Ctrl+C to stop...")
    
    try:
        # Keep processes running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping system...")
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()

if __name__ == "__main__":
    main()
