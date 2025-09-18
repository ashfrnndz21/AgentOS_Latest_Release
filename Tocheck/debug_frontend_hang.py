#!/usr/bin/env python3
"""
Debug Frontend Hang - Identify what's causing the document workspace to hang
"""

import requests
import time
import subprocess
import threading
from datetime import datetime

def log_with_time(message):
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{timestamp}] {message}")

def check_frontend_dev_server():
    """Check if frontend dev server is actually running"""
    try:
        # Check if npm run dev process is running
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        npm_processes = [line for line in result.stdout.split('\n') if 'npm run dev' in line and 'grep' not in line]
        
        if npm_processes:
            log_with_time(f"✅ Found {len(npm_processes)} npm dev processes running")
            for proc in npm_processes:
                log_with_time(f"   Process: {proc.strip()}")
        else:
            log_with_time("❌ No npm run dev processes found")
            return False
            
        # Try to connect to frontend
        response = requests.get("http://localhost:8080", timeout=2)
        if response.status_code == 200:
            log_with_time("✅ Frontend server responding")
            return True
        else:
            log_with_time(f"❌ Frontend server returned {response.status_code}")
            return False
            
    except Exception as e:
        log_with_time(f"❌ Frontend check failed: {e}")
        return False

def test_document_workspace_loading():
    """Test the specific document workspace page that's hanging"""
    try:
        log_with_time("🔍 Testing document workspace loading...")
        
        # Test the main page first
        start_time = time.time()
        response = requests.get("http://localhost:8080", timeout=5)
        main_load_time = time.time() - start_time
        log_with_time(f"📄 Main page loaded in {main_load_time:.2f}s")
        
        # Test the document workspace route
        start_time = time.time()
        response = requests.get("http://localhost:8080/#/document-workspace", timeout=10)
        workspace_load_time = time.time() - start_time
        log_with_time(f"📄 Document workspace loaded in {workspace_load_time:.2f}s")
        
        if workspace_load_time > 5:
            log_with_time("⚠️ Document workspace is loading slowly!")
            
        return True
        
    except requests.exceptions.Timeout:
        log_with_time("❌ Document workspace loading TIMED OUT")
        return False
    except Exception as e:
        log_with_time(f"❌ Document workspace test failed: {e}")
        return False

def test_backend_endpoints():
    """Test all backend endpoints that document workspace uses"""
    endpoints = [
        ("/health", "Health check"),
        ("/api/rag/status", "RAG status"),
        ("/api/rag/models", "Available models"),
    ]
    
    for endpoint, description in endpoints:
        try:
            start_time = time.time()
            response = requests.get(f"http://localhost:8000{endpoint}", timeout=3)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                log_with_time(f"✅ {description}: {response_time:.2f}s")
            else:
                log_with_time(f"❌ {description}: HTTP {response.status_code}")
                
        except requests.exceptions.Timeout:
            log_with_time(f"⏰ {description}: TIMEOUT (>3s)")
        except Exception as e:
            log_with_time(f"❌ {description}: {e}")

def monitor_network_activity():
    """Monitor network activity during page load"""
    log_with_time("🌐 Monitoring network activity...")
    
    # This is a simplified version - in real debugging you'd use browser dev tools
    # But we can at least check if requests are being made
    
    try:
        # Make a request and see how long it takes
        start_time = time.time()
        response = requests.get("http://localhost:8080/#/document-workspace", 
                              timeout=15, 
                              stream=True)
        
        # Read response in chunks to see if it's streaming or hanging
        content_length = 0
        chunk_count = 0
        
        for chunk in response.iter_content(chunk_size=1024):
            content_length += len(chunk)
            chunk_count += 1
            
            if chunk_count % 10 == 0:  # Log every 10 chunks
                elapsed = time.time() - start_time
                log_with_time(f"📊 Received {content_length} bytes in {elapsed:.2f}s")
                
        total_time = time.time() - start_time
        log_with_time(f"📊 Total: {content_length} bytes in {total_time:.2f}s")
        
    except Exception as e:
        log_with_time(f"❌ Network monitoring failed: {e}")

def main():
    log_with_time("🔍 Starting Frontend Hang Debug")
    log_with_time("=" * 50)
    
    # Step 1: Check if servers are running
    log_with_time("Step 1: Checking server status...")
    frontend_ok = check_frontend_dev_server()
    
    if not frontend_ok:
        log_with_time("❌ Frontend server issues detected. Try:")
        log_with_time("   npm run dev")
        return
    
    # Step 2: Test backend endpoints
    log_with_time("\nStep 2: Testing backend endpoints...")
    test_backend_endpoints()
    
    # Step 3: Test document workspace loading
    log_with_time("\nStep 3: Testing document workspace loading...")
    workspace_ok = test_document_workspace_loading()
    
    # Step 4: Monitor network activity if there are issues
    if not workspace_ok:
        log_with_time("\nStep 4: Monitoring network activity...")
        monitor_network_activity()
    
    log_with_time("\n🔍 Debug complete")
    log_with_time("=" * 50)
    
    if workspace_ok:
        log_with_time("✅ Document workspace appears to be working")
    else:
        log_with_time("❌ Document workspace has loading issues")
        log_with_time("\n💡 Recommendations:")
        log_with_time("   1. Check browser console for JavaScript errors")
        log_with_time("   2. Check network tab for slow/failed requests")
        log_with_time("   3. Try hard refresh (Cmd+Shift+R)")
        log_with_time("   4. Check if any useEffect hooks are blocking")

if __name__ == "__main__":
    main()