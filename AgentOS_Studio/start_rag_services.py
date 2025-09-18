#!/usr/bin/env python3
"""
Startup script for Real RAG Document Workspace
Starts both Ollama API and RAG API services
"""

import subprocess
import sys
import time
import os
import signal
from pathlib import Path

def check_python_packages():
    """Check if required Python packages are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'aiohttp',
        'pydantic'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing required packages: {', '.join(missing_packages)}")
        print(f"📦 Install them with: pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_ollama():
    """Check if Ollama is installed and running"""
    try:
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ Ollama is installed and accessible")
            return True
        else:
            print("❌ Ollama is installed but not responding")
            return False
    except FileNotFoundError:
        print("❌ Ollama is not installed")
        print("📥 Install Ollama from: https://ollama.ai/")
        return False
    except subprocess.TimeoutExpired:
        print("❌ Ollama command timed out")
        return False

def start_service(script_path, port, service_name):
    """Start a service and return the process"""
    print(f"🚀 Starting {service_name} on port {port}...")
    
    try:
        process = subprocess.Popen([
            sys.executable, script_path
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Give the service a moment to start
        time.sleep(2)
        
        # Check if process is still running
        if process.poll() is None:
            print(f"✅ {service_name} started successfully (PID: {process.pid})")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ {service_name} failed to start")
            print(f"Error: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Failed to start {service_name}: {e}")
        return None

def main():
    print("🔥 Real RAG Document Workspace - Service Starter")
    print("=" * 50)
    
    # Check prerequisites
    print("🔍 Checking prerequisites...")
    
    if not check_python_packages():
        sys.exit(1)
    
    if not check_ollama():
        print("💡 You can still run the services, but RAG functionality will be limited")
    
    # Check if backend directory exists
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        print("💡 Make sure you're running this from the project root directory")
        sys.exit(1)
    
    # Service paths
    ollama_api_path = backend_dir / "ollama_api.py"
    rag_api_path = backend_dir / "rag_api.py"
    
    # Check if service files exist
    if not ollama_api_path.exists():
        print(f"❌ Ollama API not found at {ollama_api_path}")
        sys.exit(1)
    
    if not rag_api_path.exists():
        print(f"❌ RAG API not found at {rag_api_path}")
        sys.exit(1)
    
    print("\n🚀 Starting services...")
    
    processes = []
    
    # Start Ollama API
    ollama_process = start_service(str(ollama_api_path), 5002, "Ollama API")
    if ollama_process:
        processes.append(("Ollama API", ollama_process))
    
    # Start RAG API
    rag_process = start_service(str(rag_api_path), 5003, "RAG API")
    if rag_process:
        processes.append(("RAG API", rag_process))
    
    if not processes:
        print("❌ No services started successfully")
        sys.exit(1)
    
    print("\n✅ Services started successfully!")
    print("\n📋 Service Status:")
    for name, process in processes:
        print(f"  • {name}: Running (PID: {process.pid})")
    
    print("\n🌐 Access URLs:")
    print("  • Frontend: http://localhost:5173 (run 'npm run dev' in another terminal)")
    print("  • Ollama API: http://localhost:5002")
    print("  • RAG API: http://localhost:5003")
    
    print("\n🛑 Press Ctrl+C to stop all services")
    
    def signal_handler(sig, frame):
        print("\n🛑 Stopping services...")
        for name, process in processes:
            print(f"  Stopping {name}...")
            process.terminate()
            try:
                process.wait(timeout=5)
                print(f"  ✅ {name} stopped")
            except subprocess.TimeoutExpired:
                print(f"  🔥 Force killing {name}...")
                process.kill()
        print("👋 All services stopped")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Keep the script running and monitor processes
    try:
        while True:
            time.sleep(1)
            # Check if any process has died
            for name, process in processes[:]:  # Copy list to avoid modification during iteration
                if process.poll() is not None:
                    print(f"❌ {name} has stopped unexpectedly")
                    processes.remove((name, process))
            
            if not processes:
                print("❌ All services have stopped")
                break
                
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

if __name__ == "__main__":
    main()