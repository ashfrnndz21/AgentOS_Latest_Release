#!/usr/bin/env python3
"""
Start Ollama Backend API
Simple script to start the Ollama agent backend service
"""

import subprocess
import sys
import os
import time
import requests

def check_python_dependencies():
    """Check if required Python packages are installed"""
    required_packages = ['flask', 'flask-cors', 'requests']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Missing required packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        
        for package in missing_packages:
            try:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
                print(f"✓ Installed {package}")
            except subprocess.CalledProcessError:
                print(f"✗ Failed to install {package}")
                return False
    
    return True

def check_ollama_service():
    """Check if Ollama service is running"""
    try:
        response = requests.get('http://localhost:11434/api/tags', timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"✓ Ollama is running with {len(models)} models available")
            return True
        else:
            print("✗ Ollama is running but not responding correctly")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Ollama is not running")
        print("  Please start Ollama first:")
        print("  - Run 'ollama serve' in another terminal")
        print("  - Or start Ollama desktop application")
        return False
    except Exception as e:
        print(f"✗ Error checking Ollama: {e}")
        return False

def start_backend():
    """Start the Ollama backend API"""
    backend_path = os.path.join(os.path.dirname(__file__), 'backend', 'ollama_api.py')
    
    if not os.path.exists(backend_path):
        print(f"✗ Backend file not found: {backend_path}")
        return False
    
    print("Starting Ollama Backend API...")
    print("Backend will be available at: http://localhost:5052")
    print("Press Ctrl+C to stop the backend")
    print("-" * 50)
    
    try:
        # Start the Flask app
        subprocess.run([sys.executable, backend_path], check=True)
    except KeyboardInterrupt:
        print("\n✓ Backend stopped by user")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Backend failed to start: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

def main():
    """Main function"""
    print("🤖 Ollama Agent Backend Startup")
    print("=" * 40)
    
    # Check Python dependencies
    print("1. Checking Python dependencies...")
    if not check_python_dependencies():
        print("✗ Failed to install required packages")
        sys.exit(1)
    
    # Check Ollama service
    print("\n2. Checking Ollama service...")
    if not check_ollama_service():
        print("\n💡 To start Ollama:")
        print("   - Install Ollama from https://ollama.ai")
        print("   - Run 'ollama serve' in terminal")
        print("   - Or start Ollama desktop app")
        sys.exit(1)
    
    # Start backend
    print("\n3. Starting backend API...")
    start_backend()

if __name__ == '__main__':
    main()