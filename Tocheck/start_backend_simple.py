#!/usr/bin/env python3
"""
Simple Backend Startup Script
Starts the backend server on port 5052
"""

import subprocess
import sys
import os
import time

def start_backend():
    """Start the backend server"""
    print("🚀 Starting Multi-Agent Workflow Backend...")
    print("Port: 5052")
    print("Press Ctrl+C to stop")
    print("-" * 40)
    
    try:
        # Change to backend directory and start server
        backend_path = os.path.join(os.getcwd(), "backend")
        
        # Start the backend server
        process = subprocess.run([
            sys.executable, "simple_api.py"
        ], cwd=backend_path)
        
    except KeyboardInterrupt:
        print("\n🛑 Backend stopped by user")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

if __name__ == "__main__":
    start_backend()