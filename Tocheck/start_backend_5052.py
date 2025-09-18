#!/usr/bin/env python3
"""
Backend Startup Script for Port 5052
Starts the backend server on the correct port with proper error handling
"""

import subprocess
import sys
import os
import time

def start_backend():
    """Start the backend server on port 5052"""
    print("🚀 Starting Multi-Agent Workflow Backend...")
    print("Port: 5052")
    print("Press Ctrl+C to stop")
    print("-" * 40)
    
    try:
        # Change to backend directory and start server
        backend_path = os.path.join(os.getcwd(), "backend")
        
        if not os.path.exists(backend_path):
            print(f"❌ Backend directory not found: {backend_path}")
            return
            
        if not os.path.exists(os.path.join(backend_path, "simple_api.py")):
            print(f"❌ simple_api.py not found in {backend_path}")
            return
        
        print(f"📁 Backend directory: {backend_path}")
        print("🔄 Starting server...")
        
        # Start the backend server
        process = subprocess.Popen([
            sys.executable, "simple_api.py"
        ], cwd=backend_path, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        print("✅ Backend process started")
        print("📡 Server should be available at: http://localhost:5052")
        print("🔍 Monitoring output...")
        print("-" * 40)
        
        # Monitor output
        for line in process.stdout:
            print(line.strip())
            
    except KeyboardInterrupt:
        print("\n🛑 Backend stopped by user")
        if 'process' in locals():
            process.terminate()
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

if __name__ == "__main__":
    start_backend()