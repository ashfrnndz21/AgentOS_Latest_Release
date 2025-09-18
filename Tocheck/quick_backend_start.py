#!/usr/bin/env python3
"""
Quick Backend Startup - Direct approach
Kills any existing processes and starts fresh on port 5052
"""

import subprocess
import sys
import os
import time
import signal

def kill_existing_processes():
    """Kill any existing backend processes"""
    try:
        # Kill processes on port 5052
        result = subprocess.run(['lsof', '-ti:5052'], capture_output=True, text=True)
        if result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                if pid:
                    print(f"🔪 Killing process {pid} on port 5052")
                    subprocess.run(['kill', '-9', pid])
        
        # Kill processes on port 5001 
        result = subprocess.run(['lsof', '-ti:5001'], capture_output=True, text=True)
        if result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                if pid:
                    print(f"🔪 Killing process {pid} on port 5001")
                    subprocess.run(['kill', '-9', pid])
                    
        # Kill any python processes running simple_api.py
        result = subprocess.run(['pgrep', '-f', 'simple_api.py'], capture_output=True, text=True)
        if result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                if pid:
                    print(f"🔪 Killing simple_api.py process {pid}")
                    subprocess.run(['kill', '-9', pid])
                    
        time.sleep(2)  # Give processes time to die
        print("✅ Cleaned up existing processes")
        
    except Exception as e:
        print(f"⚠️ Error cleaning processes: {e}")

def start_backend_direct():
    """Start backend directly with uvicorn"""
    try:
        backend_path = os.path.join(os.getcwd(), "backend")
        
        if not os.path.exists(backend_path):
            print(f"❌ Backend directory not found: {backend_path}")
            return False
            
        print(f"📁 Starting from: {backend_path}")
        print("🚀 Starting backend on port 5052...")
        
        # Start with uvicorn directly
        cmd = [
            sys.executable, '-m', 'uvicorn', 
            'simple_api:app', 
            '--host', '0.0.0.0', 
            '--port', '5052',
            '--reload'
        ]
        
        print(f"🔧 Command: {' '.join(cmd)}")
        
        # Start the process
        process = subprocess.Popen(
            cmd, 
            cwd=backend_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        print("✅ Backend process started!")
        print("📡 Server should be available at: http://localhost:5052")
        print("🔍 Monitoring output (Ctrl+C to stop)...")
        print("-" * 50)
        
        # Monitor output in real-time
        try:
            for line in iter(process.stdout.readline, ''):
                if line:
                    print(line.strip())
        except KeyboardInterrupt:
            print("\n🛑 Stopping backend...")
            process.terminate()
            process.wait()
            print("✅ Backend stopped")
            
        return True
        
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Quick Backend Startup Tool")
    print("=" * 50)
    
    # Step 1: Clean up existing processes
    print("1️⃣ Cleaning up existing processes...")
    kill_existing_processes()
    
    # Step 2: Start backend
    print("\n2️⃣ Starting backend server...")
    success = start_backend_direct()
    
    if not success:
        print("\n❌ Failed to start backend")
        return False
    
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")