#!/usr/bin/env python3
"""
Simple Backend Starter - Use a different port to avoid conflicts
"""

import subprocess
import sys
import os
import time

def find_free_port():
    """Find a free port to use"""
    import socket
    
    ports_to_try = [5053, 5054, 5055, 8001, 8002, 8003]
    
    for port in ports_to_try:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('localhost', port))
            sock.close()
            return port
        except OSError:
            continue
    
    return None

def update_backend_port(port):
    """Update the backend to use the specified port"""
    backend_file = "backend/simple_api.py"
    
    if not os.path.exists(backend_file):
        print(f"❌ Backend file not found: {backend_file}")
        return False
    
    # Read the file
    with open(backend_file, 'r') as f:
        content = f.read()
    
    # Update the port
    content = content.replace('port=5052', f'port={port}')
    
    # Write back
    with open(backend_file, 'w') as f:
        f.write(content)
    
    print(f"✅ Updated backend to use port {port}")
    return True

def update_frontend_config(port):
    """Update frontend to use the new port"""
    config_file = "src/config/appConfig.ts"
    
    if not os.path.exists(config_file):
        print(f"❌ Config file not found: {config_file}")
        return False
    
    # Read the file
    with open(config_file, 'r') as f:
        content = f.read()
    
    # Update the port
    content = content.replace('port: 5052', f'port: {port}')
    content = content.replace('http://localhost:5052', f'http://localhost:{port}')
    
    # Write back
    with open(config_file, 'w') as f:
        f.write(content)
    
    print(f"✅ Updated frontend config to use port {port}")
    return True

def start_backend(port):
    """Start the backend on the specified port"""
    print(f"🚀 Starting backend on port {port}...")
    
    try:
        # Start with python directly
        process = subprocess.Popen([
            sys.executable, "backend/simple_api.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        # Wait a bit for startup
        time.sleep(3)
        
        # Check if it's running
        if process.poll() is None:
            print(f"✅ Backend started successfully on port {port}")
            print(f"🌐 Backend URL: http://localhost:{port}")
            
            # Monitor output
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
        else:
            print("❌ Backend failed to start")
            output, _ = process.communicate()
            print(f"Error: {output}")
            return False
            
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Simple Backend Starter")
    print("=" * 40)
    
    # Find a free port
    port = find_free_port()
    if not port:
        print("❌ No free ports available")
        return False
    
    print(f"📡 Using port: {port}")
    
    # Update backend configuration
    if not update_backend_port(port):
        return False
    
    # Update frontend configuration
    if not update_frontend_config(port):
        return False
    
    # Start backend
    return start_backend(port)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")