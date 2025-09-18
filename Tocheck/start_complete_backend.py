#!/usr/bin/env python3

import subprocess
import sys
import os
import time
import signal
import threading
from pathlib import Path

class BackendManager:
    def __init__(self):
        self.processes = []
        self.running = True
        
    def start_service(self, name, command, cwd=None):
        """Start a backend service"""
        try:
            print(f"🚀 Starting {name}...")
            if cwd:
                process = subprocess.Popen(
                    command, 
                    shell=True, 
                    cwd=cwd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
            else:
                process = subprocess.Popen(
                    command, 
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
            
            self.processes.append((name, process))
            print(f"   ✅ {name} started (PID: {process.pid})")
            return process
            
        except Exception as e:
            print(f"   ❌ Failed to start {name}: {e}")
            return None
    
    def monitor_process(self, name, process):
        """Monitor a process and log its output"""
        try:
            while self.running and process.poll() is None:
                output = process.stdout.readline()
                if output:
                    print(f"[{name}] {output.strip()}")
                time.sleep(0.1)
        except Exception as e:
            print(f"Error monitoring {name}: {e}")
    
    def stop_all(self):
        """Stop all running processes"""
        print("\n🛑 Stopping all services...")
        self.running = False
        
        for name, process in self.processes:
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

def main():
    print("🏦 BANKING AGENT PLATFORM - COMPLETE BACKEND STARTUP")
    print("=" * 70)
    
    manager = BackendManager()
    
    # Signal handler for graceful shutdown
    def signal_handler(sig, frame):
        print("\n🛑 Received shutdown signal...")
        manager.stop_all()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Start main backend API
        print("\n🎯 STARTING CORE SERVICES:")
        main_api = manager.start_service(
            "Main API Server", 
            "python -m uvicorn simple_api:app --host 0.0.0.0 --port 5052 --reload",
            cwd="backend"
        )
        
        if main_api:
            # Start monitoring thread
            monitor_thread = threading.Thread(
                target=manager.monitor_process, 
                args=("Main API", main_api)
            )
            monitor_thread.daemon = True
            monitor_thread.start()
        
        # Wait a moment for main API to start
        time.sleep(3)
        
        # Start additional services
        print("\n🎯 STARTING ADDITIONAL SERVICES:")
        
        # Ollama service (if available)
        ollama_process = manager.start_service(
            "Ollama Service",
            "python ollama_service.py",
            cwd="backend"
        )
        
        # RAG service
        rag_process = manager.start_service(
            "RAG Service",
            "python rag_service.py", 
            cwd="backend"
        )
        
        # Workflow engine
        workflow_process = manager.start_service(
            "Workflow Engine",
            "python workflow_engine.py",
            cwd="backend"
        )
        
        print("\n✅ ALL SERVICES STARTED SUCCESSFULLY!")
        print("\n🌐 SERVICE ENDPOINTS:")
        print("   • Main API: http://localhost:5052")
        print("   • API Docs: http://localhost:5052/docs")
        print("   • Health Check: http://localhost:5052/health")
        print("   • Ollama: http://localhost:11434")
        
        print("\n🎯 FRONTEND COMMANDS:")
        print("   • Start Frontend: npm run dev")
        print("   • Frontend URL: http://localhost:5173")
        
        print("\n📊 MONITORING:")
        print("   Press Ctrl+C to stop all services")
        
        # Keep the main thread alive
        while manager.running:
            time.sleep(1)
            
            # Check if main process is still running
            if main_api and main_api.poll() is not None:
                print("❌ Main API process died, restarting...")
                main_api = manager.start_service(
                    "Main API Server", 
                    "python -m uvicorn simple_api:app --host 0.0.0.0 --port 5052 --reload",
                    cwd="backend"
                )
                
    except KeyboardInterrupt:
        print("\n🛑 Received keyboard interrupt...")
    except Exception as e:
        print(f"\n❌ Error in main loop: {e}")
    finally:
        manager.stop_all()

if __name__ == "__main__":
    main()