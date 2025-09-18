#!/usr/bin/env python3
"""
One-Click App Setup Script
Automatically configures and starts the entire application
"""

import subprocess
import sys
import time
import requests
import json
import os
from pathlib import Path

def print_banner():
    print("""
🚀 Multi-Agent Platform Setup
==============================

This script will:
1. Check prerequisites (Ollama, Python, Node.js)
2. Auto-detect or start backend on available port
3. Configure frontend to use correct ports
4. Start all services
5. Verify connections

""")

def check_command(command):
    """Check if a command is available"""
    try:
        subprocess.run([command, '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def check_prerequisites():
    """Check all prerequisites"""
    print("🔍 Checking prerequisites...")
    
    checks = {
        'Python': check_command('python3') or check_command('python'),
        'Node.js': check_command('node'),
        'npm': check_command('npm'),
        'Ollama': check_command('ollama')
    }
    
    for name, available in checks.items():
        status = "✅" if available else "❌"
        print(f"  {status} {name}")
    
    missing = [name for name, available in checks.items() if not available]
    
    if missing:
        print(f"\n❌ Missing prerequisites: {', '.join(missing)}")
        print("\nPlease install the missing components:")
        if 'Ollama' in missing:
            print("  • Ollama: https://ollama.ai/download")
        if 'Node.js' in missing or 'npm' in missing:
            print("  • Node.js: https://nodejs.org/")
        return False
    
    print("✅ All prerequisites available!")
    return True

def find_available_port(start_port=5052, max_attempts=10):
    """Find an available port starting from start_port"""
    import socket
    
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    return None

def check_ollama():
    """Check if Ollama is running"""
    try:
        response = requests.get('http://localhost:11434/api/tags', timeout=3)
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"✅ Ollama running with {len(models)} models")
            return True
    except:
        pass
    
    print("❌ Ollama not running")
    print("💡 Starting Ollama...")
    
    try:
        # Try to start Ollama
        subprocess.Popen(['ollama', 'serve'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(3)
        
        # Check again
        response = requests.get('http://localhost:11434/api/tags', timeout=3)
        if response.status_code == 200:
            print("✅ Ollama started successfully")
            return True
    except:
        pass
    
    print("❌ Could not start Ollama automatically")
    print("💡 Please run 'ollama serve' in another terminal")
    return False

def start_backend(port=None):
    """Start the backend on specified or available port"""
    if port is None:
        port = find_available_port()
    
    if port is None:
        print("❌ No available ports found")
        return None
    
    print(f"🔧 Starting backend on port {port}...")
    
    # Update backend port in simple_api.py
    backend_file = Path("backend/simple_api.py")
    if backend_file.exists():
        content = backend_file.read_text()
        # Replace the port in uvicorn.run
        updated_content = content.replace(
            'uvicorn.run(app, host="0.0.0.0", port=5052)',
            f'uvicorn.run(app, host="0.0.0.0", port={port})'
        )
        backend_file.write_text(updated_content)
    
    try:
        # Start backend
        process = subprocess.Popen([
            sys.executable, "simple_api.py"
        ], cwd="backend", stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for startup
        time.sleep(5)
        
        # Test connection
        response = requests.get(f'http://localhost:{port}/health', timeout=5)
        if response.status_code == 200:
            print(f"✅ Backend started on port {port}")
            return port, process
        else:
            print(f"❌ Backend health check failed")
            return None
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def update_frontend_config(backend_port):
    """Update frontend configuration with correct backend port"""
    print(f"🔧 Configuring frontend for backend port {backend_port}...")
    
    # Create/update the app config
    config_content = f"""// Auto-generated configuration
export const APP_CONFIG = {{
  BACKEND_URL: 'http://localhost:{backend_port}',
  OLLAMA_URL: 'http://localhost:11434',
  AUTO_GENERATED: true,
  GENERATED_AT: '{time.strftime("%Y-%m-%d %H:%M:%S")}'
}};
"""
    
    config_dir = Path("src/config")
    config_dir.mkdir(exist_ok=True)
    
    config_file = config_dir / "auto-config.ts"
    config_file.write_text(config_content)
    
    print("✅ Frontend configuration updated")

def test_full_system(backend_port):
    """Test the complete system"""
    print("🧪 Testing complete system...")
    
    tests = []
    
    # Test backend health
    try:
        response = requests.get(f'http://localhost:{backend_port}/health', timeout=5)
        tests.append(("Backend Health", response.status_code == 200))
    except:
        tests.append(("Backend Health", False))
    
    # Test Ollama integration
    try:
        response = requests.get(f'http://localhost:{backend_port}/api/ollama/status', timeout=5)
        tests.append(("Ollama Integration", response.status_code == 200))
    except:
        tests.append(("Ollama Integration", False))
    
    # Test workflow system
    try:
        response = requests.get(f'http://localhost:{backend_port}/api/agents/available', timeout=5)
        tests.append(("Workflow System", response.status_code == 200))
    except:
        tests.append(("Workflow System", False))
    
    print("\n📊 System Test Results:")
    all_passed = True
    for test_name, passed in tests:
        status = "✅" if passed else "❌"
        print(f"  {status} {test_name}")
        if not passed:
            all_passed = False
    
    return all_passed

def main():
    print_banner()
    
    # Check prerequisites
    if not check_prerequisites():
        return False
    
    # Check Ollama
    if not check_ollama():
        return False
    
    # Start backend
    backend_result = start_backend()
    if not backend_result:
        return False
    
    backend_port, backend_process = backend_result
    
    try:
        # Update frontend config
        update_frontend_config(backend_port)
        
        # Test system
        if test_full_system(backend_port):
            print(f"""
🎉 Setup Complete!

Your multi-agent platform is ready:
✅ Backend running on: http://localhost:{backend_port}
✅ Ollama running on: http://localhost:11434
✅ All systems connected

Next steps:
1. Start your frontend: npm run dev
2. Open: http://localhost:3000
3. Navigate to Multi-Agent Workspace
4. Start building workflows!

Press Ctrl+C to stop the backend when done.
""")
            
            # Keep backend running
            try:
                backend_process.wait()
            except KeyboardInterrupt:
                print("\n🛑 Stopping backend...")
                backend_process.terminate()
                backend_process.wait()
                print("✅ Backend stopped")
        else:
            print("❌ System tests failed. Check the errors above.")
            backend_process.terminate()
            return False
            
    except KeyboardInterrupt:
        print("\n🛑 Setup interrupted")
        if 'backend_process' in locals():
            backend_process.terminate()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)