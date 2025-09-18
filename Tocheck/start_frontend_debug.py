#!/usr/bin/env python3
"""
START FRONTEND IN DEBUG MODE
Start the frontend and capture any error messages
"""

import subprocess
import time
import os
import signal
import sys

def start_frontend_debug():
    """Start frontend in debug mode"""
    
    print("🚀 STARTING FRONTEND IN DEBUG MODE")
    print("=" * 50)
    
    # Check if node_modules exists
    if not os.path.exists("node_modules"):
        print("📦 Installing dependencies...")
        try:
            subprocess.run(["npm", "install"], check=True)
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install dependencies: {e}")
            return
    
    print("🌐 Starting development server...")
    print("📊 Watch for error messages below:")
    print("-" * 50)
    
    try:
        # Start the development server
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Print output in real-time
        for line in iter(process.stdout.readline, ''):
            print(line.rstrip())
            
            # Check if server is ready
            if "Local:" in line and "localhost:5173" in line:
                print("\n✅ Frontend server is ready!")
                print("🌐 Open: http://localhost:5173/multi-agent-workspace")
                print("🔍 Check browser console for errors")
                break
        
        # Keep the process running
        try:
            process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping frontend server...")
            process.terminate()
            process.wait()
            
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")

if __name__ == "__main__":
    start_frontend_debug()