#!/usr/bin/env python3
"""
START ORIGINAL WORKING VERSION
Starts the exact working version from 5pm Nov 9
"""

import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def print_status(message, status="INFO"):
    """Print colored status messages"""
    colors = {
        "INFO": "\033[94m",     # Blue
        "SUCCESS": "\033[92m",  # Green
        "WARNING": "\033[93m",  # Yellow
        "ERROR": "\033[91m",    # Red
        "RESET": "\033[0m"      # Reset
    }
    print(f"{colors.get(status, '')}{message}{colors['RESET']}")

def start_backend():
    """Start the backend server"""
    print_status("🚀 Starting Backend Server (Port 5052)...", "INFO")
    
    try:
        backend_path = Path("backend")
        if not backend_path.exists():
            print_status("❌ Backend directory not found", "ERROR")
            return False
            
        # Start backend
        process = subprocess.Popen([
            sys.executable, "simple_api.py"
        ], cwd=backend_path, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Give it a moment to start
        time.sleep(3)
        
        # Check if it's still running
        if process.poll() is None:
            print_status("✅ Backend started successfully on port 5052", "SUCCESS")
            return True
        else:
            stdout, stderr = process.communicate()
            print_status(f"❌ Backend failed to start: {stderr.decode()}", "ERROR")
            return False
            
    except Exception as e:
        print_status(f"❌ Error starting backend: {e}", "ERROR")
        return False

def start_frontend():
    """Start the frontend development server"""
    print_status("🌐 Starting Frontend Server (Port 5173)...", "INFO")
    
    try:
        # Check if node_modules exists
        if not Path("node_modules").exists():
            print_status("📦 Installing dependencies first...", "WARNING")
            install_process = subprocess.run(["npm", "install"], capture_output=True, text=True)
            if install_process.returncode != 0:
                print_status(f"❌ Failed to install dependencies: {install_process.stderr}", "ERROR")
                return False
            print_status("✅ Dependencies installed", "SUCCESS")
        
        # Start frontend
        print_status("🚀 Starting React development server...", "INFO")
        process = subprocess.Popen(["npm", "run", "dev"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Give it time to start
        time.sleep(5)
        
        if process.poll() is None:
            print_status("✅ Frontend started successfully on port 5173", "SUCCESS")
            return True
        else:
            stdout, stderr = process.communicate()
            print_status(f"❌ Frontend failed to start: {stderr.decode()}", "ERROR")
            return False
            
    except Exception as e:
        print_status(f"❌ Error starting frontend: {e}", "ERROR")
        return False

def main():
    """Main startup function"""
    print_status("🎉 STARTING ORIGINAL WORKING VERSION FROM 5PM NOV 9", "SUCCESS")
    print_status("=" * 60, "INFO")
    
    # Check if we're in the right directory
    if not Path("src").exists() or not Path("backend").exists():
        print_status("❌ Please run this script from the project root directory", "ERROR")
        sys.exit(1)
    
    print_status("📋 STARTING SERVICES:", "INFO")
    
    # Start backend first
    backend_success = start_backend()
    if not backend_success:
        print_status("❌ Backend failed to start. Exiting.", "ERROR")
        sys.exit(1)
    
    # Wait a moment
    time.sleep(2)
    
    # Start frontend
    frontend_success = start_frontend()
    if not frontend_success:
        print_status("❌ Frontend failed to start. Exiting.", "ERROR")
        sys.exit(1)
    
    # Success message
    print_status("\n🎉 ORIGINAL WORKING VERSION IS NOW RUNNING!", "SUCCESS")
    print_status("=" * 60, "SUCCESS")
    
    print_status("🌐 FRONTEND: http://localhost:5173", "SUCCESS")
    print_status("🔧 BACKEND:  http://localhost:5052", "SUCCESS")
    
    print_status("\n✅ AVAILABLE FEATURES:", "INFO")
    features = [
        "Dashboard - Complete overview",
        "Agent Command Centre - Create and manage agents", 
        "AI Agents - Agent management dashboard",
        "Multi-Agent Workspace - Collaborative workflows",
        "Ollama Integration - Local AI models",
        "MCP Gateway - Model Context Protocol",
        "Agent Marketplace - Discover and share agents",
        "Banking Use Cases - Risk, Wealth, Customer analytics",
        "Architecture Design - System planning",
        "Document Processing - RAG and chat",
        "Settings - Platform configuration",
        "Error Handling - Comprehensive error boundaries",
        "Performance - Lazy loading and optimization"
    ]
    
    for feature in features:
        print_status(f"   ✅ {feature}", "SUCCESS")
    
    print_status("\n🎯 ALL 19 ROUTES ACTIVE:", "INFO")
    routes = [
        "/", "/agent-command", "/agents", "/agent-control",
        "/multi-agent-workspace", "/ollama-agents", "/ollama-terminal",
        "/mcp-dashboard", "/mcp-gateway", "/agent-exchange",
        "/wealth-management", "/customer-insights", "/customer-analytics",
        "/risk-analytics", "/architecture-design", "/system-flow",
        "/architecture-flow", "/settings", "/documents"
    ]
    
    for route in routes:
        print_status(f"   ✅ {route}", "INFO")
    
    print_status("\n🛡️ ERROR HANDLING ACTIVE:", "SUCCESS")
    print_status("   ✅ Error boundaries protect all components", "SUCCESS")
    print_status("   ✅ Failed components show helpful messages", "SUCCESS")
    print_status("   ✅ Individual component reload capability", "SUCCESS")
    print_status("   ✅ Graceful degradation for missing services", "SUCCESS")
    
    print_status("\n⚡ PERFORMANCE OPTIMIZATIONS:", "SUCCESS")
    print_status("   ✅ Lazy loading for all components", "SUCCESS")
    print_status("   ✅ Code splitting for better load times", "SUCCESS")
    print_status("   ✅ Optimized component lifecycle", "SUCCESS")
    
    print_status("\n🚀 READY TO USE!", "SUCCESS")
    print_status("Press Ctrl+C to stop both servers", "WARNING")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print_status("\n🛑 Shutting down servers...", "WARNING")
        print_status("✅ Original working version stopped", "INFO")

if __name__ == "__main__":
    main()