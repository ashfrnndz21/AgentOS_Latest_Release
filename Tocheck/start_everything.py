#!/usr/bin/env python3

import subprocess
import sys
import os
import time
import signal
import threading

print("🚀 STARTING COMPLETE BANKING AGENT PLATFORM")
print("=" * 60)

def check_port(port):
    """Check if a port is available"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    return result == 0

def start_backend():
    """Start the backend server"""
    print("\n🎯 STARTING BACKEND SERVER...")
    
    # Check if backend directory exists
    if not os.path.exists("backend"):
        print("   ❌ Backend directory not found!")
        return None
    
    # Start the backend
    try:
        backend_process = subprocess.Popen(
            [sys.executable, "start_complete_backend.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print(f"   ✅ Backend starting (PID: {backend_process.pid})")
        
        # Wait for backend to start
        print("   ⏳ Waiting for backend to initialize...")
        for i in range(30):  # Wait up to 30 seconds
            if check_port(5052):
                print("   ✅ Backend is ready on port 5052!")
                return backend_process
            time.sleep(1)
            print(f"   ... waiting ({i+1}/30)")
        
        print("   ⚠️ Backend may still be starting...")
        return backend_process
        
    except Exception as e:
        print(f"   ❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the frontend development server"""
    print("\n🎯 STARTING FRONTEND SERVER...")
    
    # Check if package.json exists
    if not os.path.exists("package.json"):
        print("   ❌ package.json not found!")
        return None
    
    # Check if node_modules exists
    if not os.path.exists("node_modules"):
        print("   📦 Installing dependencies...")
        install_process = subprocess.run(["npm", "install"], capture_output=True, text=True)
        if install_process.returncode != 0:
            print(f"   ❌ npm install failed: {install_process.stderr}")
            return None
        print("   ✅ Dependencies installed")
    
    # Start the frontend
    try:
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print(f"   ✅ Frontend starting (PID: {frontend_process.pid})")
        
        # Wait for frontend to start
        print("   ⏳ Waiting for frontend to initialize...")
        for i in range(30):  # Wait up to 30 seconds
            if check_port(5173):
                print("   ✅ Frontend is ready on port 5173!")
                return frontend_process
            time.sleep(1)
            print(f"   ... waiting ({i+1}/30)")
        
        print("   ⚠️ Frontend may still be starting...")
        return frontend_process
        
    except Exception as e:
        print(f"   ❌ Failed to start frontend: {e}")
        return None

def main():
    processes = []
    
    try:
        # Start backend first
        backend_process = start_backend()
        if backend_process:
            processes.append(("Backend", backend_process))
        
        # Wait a bit before starting frontend
        time.sleep(3)
        
        # Start frontend
        frontend_process = start_frontend()
        if frontend_process:
            processes.append(("Frontend", frontend_process))
        
        if not processes:
            print("\n❌ Failed to start any services!")
            return
        
        print("\n✅ STARTUP COMPLETE!")
        print("=" * 60)
        print("\n🌐 AVAILABLE SERVICES:")
        if backend_process:
            print("   • Backend API: http://localhost:5052")
            print("   • API Docs: http://localhost:5052/docs")
        if frontend_process:
            print("   • Frontend App: http://localhost:5173")
        
        print("\n🎯 NEXT STEPS:")
        print("   1. Open your browser to: http://localhost:5173")
        print("   2. The Banking Agent Platform should load")
        print("   3. Press Ctrl+C here to stop all services")
        
        # Monitor processes
        print("\n📊 MONITORING SERVICES...")
        print("   (Press Ctrl+C to stop all services)")
        
        while True:
            time.sleep(5)
            
            # Check if processes are still running
            for name, process in processes:
                if process.poll() is not None:
                    print(f"   ⚠️ {name} process stopped unexpectedly!")
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down services...")
        
        for name, process in processes:
            try:
                print(f"   Stopping {name}...")
                process.terminate()
                process.wait(timeout=5)
                print(f"   ✅ {name} stopped")
            except subprocess.TimeoutExpired:
                print(f"   ⚠️ Force killing {name}...")
                process.kill()
            except Exception as e:
                print(f"   ❌ Error stopping {name}: {e}")
        
        print("\n✅ All services stopped")

if __name__ == "__main__":
    main()