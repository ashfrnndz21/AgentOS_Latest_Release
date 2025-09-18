#!/usr/bin/env python3
"""
Complete Backend Startup Solution
Fixes all issues and starts backend properly on port 5052
"""

import subprocess
import sys
import os
import time
import signal
import json
import requests

def kill_all_backend_processes():
    """Kill all existing backend processes"""
    print("🔪 Cleaning up all existing backend processes...")
    
    # Kill processes on various ports
    ports = ['5052', '5001', '5002', '8000', '3001']
    
    for port in ports:
        try:
            result = subprocess.run(['lsof', '-ti', f':{port}'], 
                                  capture_output=True, text=True)
            if result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    if pid:
                        print(f"🔪 Killing process {pid} on port {port}")
                        subprocess.run(['kill', '-9', pid], capture_output=True)
        except Exception as e:
            pass  # Continue if lsof fails
    
    # Kill any Python processes running backend files
    backend_files = ['simple_api.py', 'backend', 'uvicorn']
    for file_pattern in backend_files:
        try:
            result = subprocess.run(['pgrep', '-f', file_pattern], 
                                  capture_output=True, text=True)
            if result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    if pid:
                        print(f"🔪 Killing {file_pattern} process {pid}")
                        subprocess.run(['kill', '-9', pid], capture_output=True)
        except Exception as e:
            pass
    
    time.sleep(3)  # Give processes time to die
    print("✅ All processes cleaned up")

def check_dependencies():
    """Check and install required dependencies"""
    print("📦 Checking dependencies...")
    
    required_packages = ['fastapi', 'uvicorn', 'python-multipart']
    missing = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"📦 Installing missing packages: {', '.join(missing)}")
        for package in missing:
            try:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
                print(f"✅ Installed {package}")
            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to install {package}: {e}")
                return False
    else:
        print("✅ All dependencies are installed")
    
    return True

def fix_backend_file():
    """Ensure backend file is properly configured"""
    print("🔧 Fixing backend configuration...")
    
    backend_file = 'backend/simple_api.py'
    
    if not os.path.exists(backend_file):
        print(f"❌ Backend file not found: {backend_file}")
        return False
    
    # Read the file
    with open(backend_file, 'r') as f:
        content = f.read()
    
    # Ensure port 5052 is used
    if 'port=5052' not in content:
        content = content.replace('port=5001', 'port=5052')
        content = content.replace('port=5002', 'port=5052')
        content = content.replace('port=8000', 'port=5052')
        
        # Write back
        with open(backend_file, 'w') as f:
            f.write(content)
        
        print("✅ Backend file updated to use port 5052")
    else:
        print("✅ Backend file already configured for port 5052")
    
    return True

def start_backend():
    """Start the backend server"""
    print("🚀 Starting backend server on port 5052...")
    
    backend_path = os.path.join(os.getcwd(), "backend")
    
    if not os.path.exists(backend_path):
        print(f"❌ Backend directory not found: {backend_path}")
        return False
    
    if not os.path.exists(os.path.join(backend_path, "simple_api.py")):
        print(f"❌ simple_api.py not found in {backend_path}")
        return False
    
    try:
        # Start with uvicorn directly
        cmd = [
            sys.executable, '-m', 'uvicorn', 
            'simple_api:app', 
            '--host', '0.0.0.0', 
            '--port', '5052',
            '--reload',
            '--log-level', 'info'
        ]
        
        print(f"🔧 Starting: {' '.join(cmd)}")
        print(f"📁 Working directory: {backend_path}")
        
        # Start the process in background
        process = subprocess.Popen(
            cmd, 
            cwd=backend_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        
        print("✅ Backend process started!")
        print("📡 Server should be available at: http://localhost:5052")
        
        # Wait a bit for startup
        time.sleep(5)
        
        # Check if process is still running
        if process.poll() is None:
            print("✅ Backend is running successfully")
            return True, process
        else:
            print("❌ Backend process died")
            output, _ = process.communicate()
            print(f"Error output: {output}")
            return False, None
            
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False, None

def test_backend_connection():
    """Test if backend is responding"""
    print("🔍 Testing backend connection...")
    
    try:
        response = requests.get('http://localhost:5052/health', timeout=10)
        if response.status_code == 200:
            print("✅ Backend is responding correctly")
            print(f"📊 Response: {response.json()}")
            return True
        else:
            print(f"⚠️ Backend responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend")
        return False
    except requests.exceptions.Timeout:
        print("❌ Backend connection timed out")
        return False
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

def monitor_backend(process):
    """Monitor backend output"""
    print("🔍 Monitoring backend output (Ctrl+C to stop)...")
    print("-" * 60)
    
    try:
        for line in iter(process.stdout.readline, ''):
            if line:
                print(line.strip())
    except KeyboardInterrupt:
        print("\n🛑 Stopping backend...")
        process.terminate()
        process.wait()
        print("✅ Backend stopped")

def main():
    """Main function"""
    print("🚀 Complete Backend Startup Solution")
    print("=" * 60)
    
    # Step 1: Clean up existing processes
    kill_all_backend_processes()
    
    # Step 2: Check dependencies
    if not check_dependencies():
        print("❌ Dependency check failed")
        return False
    
    # Step 3: Fix backend configuration
    if not fix_backend_file():
        print("❌ Backend configuration failed")
        return False
    
    # Step 4: Start backend
    success, process = start_backend()
    if not success:
        print("❌ Backend startup failed")
        return False
    
    # Step 5: Test connection
    if test_backend_connection():
        print("\n✅ Backend is fully operational!")
        print("🌐 Frontend should now be able to connect")
        print("📱 Access Agentic RAG at: http://localhost:5173")
        print("🔗 Backend API at: http://localhost:5052")
        
        # Monitor output
        monitor_backend(process)
    else:
        print("\n❌ Backend connection test failed")
        if process:
            process.terminate()
        return False
    
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()