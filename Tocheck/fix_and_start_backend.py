#!/usr/bin/env python3
"""
Complete Backend Fix and Startup Script
Fixes dependencies, configuration, and starts backend on port 5052
"""

import subprocess
import sys
import os
import time
import json

def check_python_packages():
    """Check if required packages are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlite3'  # Built-in, but let's check
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'sqlite3':
                import sqlite3
            elif package == 'fastapi':
                import fastapi
            elif package == 'uvicorn':
                import uvicorn
        except ImportError:
            missing_packages.append(package)
    
    return missing_packages

def install_missing_packages(packages):
    """Install missing packages"""
    if not packages:
        return True
        
    print(f"📦 Installing missing packages: {', '.join(packages)}")
    
    try:
        for package in packages:
            if package != 'sqlite3':  # sqlite3 is built-in
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install packages: {e}")
        return False

def fix_backend_config():
    """Ensure backend is configured for port 5052"""
    backend_file = os.path.join("backend", "simple_api.py")
    
    if not os.path.exists(backend_file):
        print(f"❌ Backend file not found: {backend_file}")
        return False
    
    # Read the file
    with open(backend_file, 'r') as f:
        content = f.read()
    
    # Check if port is already 5052
    if 'port=5052' in content:
        print("✅ Backend already configured for port 5052")
        return True
    
    # Fix the port
    content = content.replace('port=5002', 'port=5052')
    content = content.replace('port=5001', 'port=5052')
    
    # Write back
    with open(backend_file, 'w') as f:
        f.write(content)
    
    print("✅ Backend configured for port 5052")
    return True

def start_backend():
    """Start the backend server"""
    print("🚀 Starting Multi-Agent Workflow Backend...")
    print("Port: 5052")
    print("Press Ctrl+C to stop")
    print("-" * 50)
    
    try:
        backend_path = os.path.join(os.getcwd(), "backend")
        
        if not os.path.exists(backend_path):
            print(f"❌ Backend directory not found: {backend_path}")
            return False
            
        if not os.path.exists(os.path.join(backend_path, "simple_api.py")):
            print(f"❌ simple_api.py not found in {backend_path}")
            return False
        
        print(f"📁 Backend directory: {backend_path}")
        print("🔄 Starting server...")
        
        # Start the backend server with direct uvicorn call
        cmd = [sys.executable, "-c", """
import sys
sys.path.append('.')
from simple_api import app
import uvicorn
uvicorn.run(app, host="0.0.0.0", port=5052, log_level="info")
"""]
        
        process = subprocess.run(cmd, cwd=backend_path)
        return True
        
    except KeyboardInterrupt:
        print("\n🛑 Backend stopped by user")
        return True
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False

def main():
    """Main function to fix and start backend"""
    print("🔧 Backend Fix and Startup Tool")
    print("=" * 50)
    
    # Step 1: Check Python packages
    print("1️⃣ Checking Python packages...")
    missing = check_python_packages()
    
    if missing:
        print(f"⚠️ Missing packages: {', '.join(missing)}")
        if not install_missing_packages(missing):
            print("❌ Failed to install required packages")
            return False
    else:
        print("✅ All required packages are installed")
    
    # Step 2: Fix backend configuration
    print("\n2️⃣ Fixing backend configuration...")
    if not fix_backend_config():
        print("❌ Failed to fix backend configuration")
        return False
    
    # Step 3: Start backend
    print("\n3️⃣ Starting backend server...")
    return start_backend()

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n❌ Backend startup failed")
        sys.exit(1)
    else:
        print("\n✅ Backend startup completed")