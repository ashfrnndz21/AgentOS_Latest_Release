#!/usr/bin/env python3
"""
Service Manager for AgentOS Backend Services
Manages all backend services with health monitoring and auto-restart
"""

import subprocess
import time
import signal
import sys
import os
import psutil
import requests
from datetime import datetime
from typing import Dict, List, Optional

class ServiceManager:
    def __init__(self):
        self.services = {
            'strands_api': {
                'port': 5004,
                'script': 'strands_api.py',
                'description': 'Strands Intelligence API',
                'dependencies': []
            },
            'strands_sdk': {
                'port': 5006,
                'script': 'strands_sdk_api.py',
                'description': 'Strands SDK API',
                'dependencies': ['strands_api']
            },
            'a2a_service': {
                'port': 5008,
                'script': 'a2a_service.py',
                'description': 'A2A Communication Service',
                'dependencies': []
            },
            'agent_registry': {
                'port': 5010,
                'script': 'agent_registry_api.py',
                'description': 'Agent Registry Service',
                'dependencies': []
            },
            'simple_orchestration': {
                'port': 5015,
                'script': 'simple_orchestration_api.py',
                'description': 'Simple Orchestration API',
                'dependencies': ['strands_sdk', 'a2a_service']
            },
            'streamlined_analyzer': {
                'port': 5017,
                'script': 'streamlined_analyzer_api.py',
                'description': 'Streamlined Contextual Analyzer',
                'dependencies': []
            },
            'resource_monitor': {
                'port': 5011,
                'script': 'resource_monitor_api.py',
                'description': 'Resource Monitor API',
                'dependencies': []
            }
        }
        
        self.running_processes = {}
        self.running = True
        
    def is_port_in_use(self, port: int) -> bool:
        """Check if a port is in use"""
        for conn in psutil.net_connections():
            if conn.laddr.port == port and conn.status == 'LISTEN':
                return True
        return False
    
    def is_service_healthy(self, service_name: str) -> bool:
        """Check if a service is healthy by making a health check request"""
        try:
            port = self.services[service_name]['port']
            response = requests.get(f'http://localhost:{port}/api/{service_name.replace("_", "-")}/health', timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def start_service(self, service_name: str) -> Optional[subprocess.Popen]:
        """Start a single service"""
        if service_name not in self.services:
            print(f"❌ Unknown service: {service_name}")
            return None
            
        service_config = self.services[service_name]
        port = service_config['port']
        
        # Check if port is already in use
        if self.is_port_in_use(port):
            print(f"⚠️  Port {port} already in use for {service_name}")
            return None
        
        # Check dependencies
        for dep in service_config['dependencies']:
            if not self.is_service_healthy(dep):
                print(f"⏳ Waiting for dependency {dep} to be healthy...")
                return None
        
        try:
            print(f"🚀 Starting {service_config['description']} on port {port}...")
            process = subprocess.Popen(
                ['python', service_config['script']],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=os.path.dirname(os.path.abspath(__file__))
            )
            
            # Wait a moment for the service to start
            time.sleep(3)
            
            # Check if it's healthy
            if self.is_service_healthy(service_name):
                print(f"✅ {service_config['description']} started successfully")
                return process
            else:
                print(f"❌ {service_config['description']} failed to start properly")
                process.terminate()
                return None
                
        except Exception as e:
            print(f"❌ Failed to start {service_name}: {e}")
            return None
    
    def stop_service(self, service_name: str):
        """Stop a service"""
        if service_name in self.running_processes:
            process = self.running_processes[service_name]
            if process.poll() is None:  # Process is still running
                print(f"🛑 Stopping {service_name}...")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
            del self.running_processes[service_name]
    
    def start_all_services(self):
        """Start all services in dependency order"""
        print("🚀 Starting AgentOS Backend Services...")
        print("=" * 50)
        
        # Start services in dependency order
        started_services = set()
        max_attempts = 3
        
        for attempt in range(max_attempts):
            for service_name in self.services:
                if service_name in started_services:
                    continue
                    
                if self.is_service_healthy(service_name):
                    print(f"✅ {service_name} already running")
                    started_services.add(service_name)
                    continue
                
                process = self.start_service(service_name)
                if process:
                    self.running_processes[service_name] = process
                    started_services.add(service_name)
            
            if len(started_services) == len(self.services):
                break
                
            print(f"⏳ Attempt {attempt + 1}/{max_attempts} - {len(started_services)}/{len(self.services)} services started")
            time.sleep(5)
        
        print("=" * 50)
        print(f"🎉 Started {len(started_services)}/{len(self.services)} services")
        
        # Show status
        self.show_status()
    
    def show_status(self):
        """Show current status of all services"""
        print("\n📊 Service Status:")
        print("-" * 50)
        
        for service_name, config in self.services.items():
            port = config['port']
            is_healthy = self.is_service_healthy(service_name)
            status = "✅ Running" if is_healthy else "❌ Stopped"
            print(f"{service_name:20} | Port {port:4} | {status}")
    
    def monitor_services(self):
        """Monitor services and restart if needed"""
        print("\n🔍 Starting service monitoring...")
        
        while self.running:
            for service_name in self.services:
                if not self.is_service_healthy(service_name):
                    print(f"⚠️  {service_name} is not healthy, restarting...")
                    self.stop_service(service_name)
                    time.sleep(2)
                    process = self.start_service(service_name)
                    if process:
                        self.running_processes[service_name] = process
            
            time.sleep(10)  # Check every 10 seconds
    
    def stop_all_services(self):
        """Stop all services"""
        print("\n🛑 Stopping all services...")
        for service_name in list(self.running_processes.keys()):
            self.stop_service(service_name)
        print("✅ All services stopped")
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print(f"\n🛑 Received signal {signum}, shutting down...")
        self.running = False
        self.stop_all_services()
        sys.exit(0)

def main():
    manager = ServiceManager()
    
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
        elif command == 'monitor':
            manager.start_all_services()
            manager.monitor_services()
        else:
            print("Usage: python service_manager.py [start|stop|status|monitor]")
    else:
        # Default: start all services
        manager.start_all_services()

if __name__ == "__main__":
    main()
