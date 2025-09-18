#!/usr/bin/env python3

import subprocess
import sys
import os
import time

print("🌐 STARTING FRONTEND ONLY")
print("=" * 40)

def check_port(port):
    """Check if a port is available"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    return result == 0

def main():
    # Check if backend is running
    if check_port(5052):
        print("✅ Backend detected on port 5052")
    else:
        print("⚠️ Backend not detected on port 5052")
        print("   You may need to start the backend first:")
        print("   python start_complete_backend.py")
    
    # Check if package.json exists
    if not os.path.exists("package.json"):
        print("❌ package.json not found!")
        return
    
    # Check if node_modules exists
    if not os.path.exists("node_modules"):
        print("📦 Installing dependencies...")
        install_process = subprocess.run(["npm", "install"])
        if install_process.returncode != 0:
            print("❌ npm install failed!")
            return
        print("✅ Dependencies installed")
    
    print("\n🚀 Starting frontend development server...")
    
    try:
        # Start the frontend
        subprocess.run(["npm", "run", "dev"])
        
    except KeyboardInterrupt:
        print("\n🛑 Frontend stopped")
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")

if __name__ == "__main__":
    main()