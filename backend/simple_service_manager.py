#!/usr/bin/env python3
"""
Simple Service Manager for AgentOS Backend Services
Simplified version without psutil dependencies
"""

import subprocess
import time
import signal
import sys
import os
import requests
from datetime import datetime

class SimpleServiceManager:
    def __init__(self):
        self.services = {
            'strands_api': {
                'port': 5004,
                'script': 'strands_api.py',
                'description': 'Strands Intelligence API',
                'health_url': '/api/strands/health'
            },
            'strands_sdk': {
                'port': 5006,
                'script': 'strands_sdk_api.py',
                'description': 'Strands SDK API',
                'health_url': '/api/strands-sdk/health'
            },
            'a2a_service': {
                'port': 5008,
                'script': 'a2a_service.py',
                'description': 'A2A Communication Service',
                'health_url': '/api/a2a/health'
            },
            'agent_registry': {
                'port': 5010,
                'script': 'agent_registry_api.py',
                'description': 'Agent Registry Service',
                'health_url': '/api/agent-registry/health'
            },
            'simple_orchestration': {
                'port': 5015,
                'script': 'simple_orchestration_api.py',
                'description': 'Simple Orchestration API',
                'health_url': '/api/simple-orchestration/health'
            },
            'streamlined_analyzer': {
                'port': 5017,
                'script': 'streamlined_analyzer_api.py',
                'description': 'Streamlined Contextual Analyzer',
                'health_url': '/api/streamlined-analyzer/health'
            },
            'resource_monitor': {
                'port': 5011,
                'script': 'resource_monitor_api.py',
                'description': 'Resource Monitor API',
                'health_url': '/api/resource-monitor/service-status'
            }
        }
        
        self.running_processes = {}
        self.running = True
        
    def is_service_healthy(self, service_name: str) -> bool:
        """Check if a service is healthy by making a health check request"""
        try:
            port = self.services[service_name]['port']
            health_url = self.services[service_name]['health_url']
            response = requests.get(f'http://localhost:{port}{health_url}', timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def start_service(self, service_name: str) -> bool:
        """Start a single service"""
        if service_name not in self.services:
            print(f"❌ Unknown service: {service_name}")
            return False
            
        service_config = self.services[service_name]
        port = service_config['port']
        
        # Check if already healthy
        if self.is_service_healthy(service_name):
            print(f"✅ {service_config['description']} already running on port {port}")
            return True
        
        try:
            print(f"🚀 Starting {service_config['description']} on port {port}...")
            process = subprocess.Popen(
                ['python', service_config['script']],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=os.path.dirname(os.path.abspath(__file__))
            )
            
            # Wait for the service to start
            print(f"⏳ Waiting for {service_name} to start...")
            for i in range(10):  # Wait up to 10 seconds
                time.sleep(1)
                if self.is_service_healthy(service_name):
                    print(f"✅ {service_config['description']} started successfully")
                    self.running_processes[service_name] = process
                    return True
                print(f"   Attempt {i+1}/10...")
            
            print(f"❌ {service_config['description']} failed to start properly")
            process.terminate()
            return False
                
        except Exception as e:
            print(f"❌ Failed to start {service_name}: {e}")
            return False
    
    def start_all_services(self):
        """Start all services"""
        print("🚀 Starting AgentOS Backend Services...")
        print("=" * 60)
        
        started_count = 0
        total_count = len(self.services)
        
        for service_name in self.services:
            if self.start_service(service_name):
                started_count += 1
            time.sleep(2)  # Wait between starts
        
        print("=" * 60)
        print(f"🎉 Started {started_count}/{total_count} services")
        
        # Show final status
        self.show_status()
    
    def show_status(self):
        """Show current status of all services"""
        print("\n📊 Service Status:")
        print("-" * 60)
        
        for service_name, config in self.services.items():
            port = config['port']
            is_healthy = self.is_service_healthy(service_name)
            status = "✅ Running" if is_healthy else "❌ Stopped"
            print(f"{service_name:20} | Port {port:4} | {status}")
    
    def stop_all_services(self):
        """Stop all services"""
        print("\n🛑 Stopping all services...")
        for service_name, process in self.running_processes.items():
            if process.poll() is None:  # Process is still running
                print(f"🛑 Stopping {service_name}...")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
        self.running_processes.clear()
        print("✅ All services stopped")
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print(f"\n🛑 Received signal {signum}, shutting down...")
        self.running = False
        self.stop_all_services()
        sys.exit(0)

def main():
    manager = SimpleServiceManager()
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, manager.signal_handler)
    signal.signal(signal.SIGTERM, manager.signal_handler)
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == 'start':
            manager.start_all_services()
        elif command == 'stop':
            manager.stop_all_services()
        elif command == 'status':
            manager.show_status()
        else:
            print("Usage: python simple_service_manager.py [start|stop|status]")
    else:
        # Default: show status
        manager.show_status()

if __name__ == "__main__":
    main()


