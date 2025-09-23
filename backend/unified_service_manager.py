#!/usr/bin/env python3
"""
Unified Service Manager for AgentOS Platform
Combines all service management capabilities into one comprehensive script
"""

import subprocess
import time
import signal
import sys
import os
import requests
import json
from datetime import datetime
from typing import Dict, List, Optional

class UnifiedServiceManager:
    def __init__(self):
        # Complete service registry with all services and ports
        self.services = {
            # Core LLM Services
            'ollama_core': {
                'port': 11434,
                'script': None,  # External service
                'description': 'Ollama Core LLM Engine',
                'health_url': '/api/tags',
                'base_url': 'http://localhost:11434',
                'required': True,
                'external': True
            },
            'ollama_api': {
                'port': 5002,
                'script': 'ollama_api.py',
                'description': 'Ollama API (Terminal & Agents)',
                'health_url': '/health',
                'base_url': 'http://localhost:5002',
                'required': True
            },
            
            # RAG and Document Services
            'rag_api': {
                'port': 5003,
                'script': 'rag_api.py',
                'description': 'RAG API (Document Chat)',
                'health_url': '/health',
                'base_url': 'http://localhost:5003',
                'required': True
            },
            
            # Strands Intelligence Services
            'strands_api': {
                'port': 5004,
                'script': 'strands_api.py',
                'description': 'Strands API (Intelligence & Reasoning)',
                'health_url': '/api/strands/health',
                'base_url': 'http://localhost:5004',
                'required': True
            },
            'chat_orchestrator': {
                'port': 5005,
                'script': 'chat_orchestrator_api.py',
                'description': 'Chat Orchestrator API (Multi-Agent Chat)',
                'health_url': '/health',
                'base_url': 'http://localhost:5005',
                'required': True
            },
            'strands_sdk': {
                'port': 5006,
                'script': 'strands_sdk_api.py',
                'description': 'Strands SDK API (Individual Agent Analytics)',
                'health_url': '/api/strands-sdk/health',
                'base_url': 'http://localhost:5006',
                'required': True
            },
            
            # A2A Communication Services
            'a2a_service': {
                'port': 5008,
                'script': 'a2a_service.py',
                'description': 'A2A Communication Service',
                'health_url': '/api/a2a/health',
                'base_url': 'http://localhost:5008',
                'required': True
            },
            'agent_registry': {
                'port': 5010,
                'script': 'agent_registry_api.py',
                'description': 'Agent Registry Service',
                'health_url': '/health',
                'base_url': 'http://localhost:5010',
                'required': True
            },
            'resource_monitor': {
                'port': 5011,
                'script': 'resource_monitor_api.py',
                'description': 'Resource Monitor API (System Monitoring)',
                'health_url': '/api/resource-monitor/health',
                'base_url': 'http://localhost:5011',
                'required': True
            },
            'frontend_agent_bridge': {
                'port': 5012,
                'script': 'frontend_agent_bridge.py',
                'description': 'Frontend Agent Bridge (Frontend-Backend Integration)',
                'health_url': '/health',
                'base_url': 'http://localhost:5012',
                'required': True
            },
            
            # Orchestration Services
            'enhanced_orchestration': {
                'port': 5014,
                'script': 'enhanced_orchestration_api.py',
                'description': 'Enhanced Orchestration API (Dynamic LLM Orchestration)',
                'health_url': '/api/enhanced-orchestration/health',
                'base_url': 'http://localhost:5014',
                'required': True
            },
            'simple_orchestration': {
                'port': 5015,
                'script': 'simple_orchestration_api.py',
                'description': 'Simple Orchestration API (4-Step Orchestration)',
                'health_url': '/api/simple-orchestration/health',
                'base_url': 'http://localhost:5015',
                'required': True
            },
            'streamlined_analyzer': {
                'port': 5017,
                'script': 'streamlined_analyzer_api.py',
                'description': 'Streamlined Contextual Analyzer',
                'health_url': '/api/streamlined-analyzer/health',
                'base_url': 'http://localhost:5017',
                'required': True
            },
            
            # Frontend Services
            'frontend': {
                'port': 5173,
                'script': 'npm run dev',
                'description': 'Frontend (Vite Dev Server)',
                'health_url': '/',
                'base_url': 'http://localhost:5173',
                'required': True,
                'frontend': True
            },
            
            # A2A Agent Services
            'coordinator_agent': {
                'port': 8000,
                'script': 'a2a_servers/orchestration_service.py',
                'description': 'Coordinator Agent (A2A)',
                'health_url': '/health',
                'base_url': 'http://localhost:8000',
                'required': False,
                'a2a_agent': True
            },
            'calculator_agent': {
                'port': 8001,
                'script': 'a2a_servers/calculator_agent.py',
                'description': 'Calculator Agent (A2A)',
                'health_url': '/health',
                'base_url': 'http://localhost:8001',
                'required': False,
                'a2a_agent': True
            },
            'research_agent': {
                'port': 8002,
                'script': 'a2a_servers/research_agent.py',
                'description': 'Research Agent (A2A)',
                'health_url': '/health',
                'base_url': 'http://localhost:8002',
                'required': False,
                'a2a_agent': True
            }
        }
        
        self.processes = {}
        self.running_services = set()
        
    def check_port(self, port: int) -> bool:
        """Check if a port is in use"""
        try:
            result = subprocess.run(['lsof', '-ti', f':{port}'], 
                                  capture_output=True, text=True)
            return result.returncode == 0
        except:
            return False
    
    def kill_port(self, port: int) -> bool:
        """Kill process on specific port"""
        try:
            result = subprocess.run(['lsof', '-ti', f':{port}'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    if pid:
                        subprocess.run(['kill', '-9', pid], check=False)
                return True
            return False
        except:
            return False
    
    def check_service_health(self, service_name: str) -> bool:
        """Check if a service is healthy"""
        service = self.services[service_name]
        try:
            response = requests.get(
                f"{service['base_url']}{service['health_url']}", 
                timeout=5
            )
            return response.status_code == 200
        except:
            return False
    
    def start_service(self, service_name: str) -> bool:
        """Start a specific service"""
        service = self.services[service_name]
        
        if service.get('external'):
            print(f"⚠️  {service['description']} is external - skipping")
            return True
            
        if service.get('frontend'):
            return self.start_frontend()
            
        if service.get('a2a_agent'):
            return self.start_a2a_agent(service_name)
        
        # Check if already running
        if self.check_port(service['port']):
            if self.check_service_health(service_name):
                print(f"✅ {service['description']} already running on port {service['port']}")
                self.running_services.add(service_name)
                return True
            else:
                print(f"⚠️  Port {service['port']} in use but service not responding - killing")
                self.kill_port(service['port'])
        
        # Start the service
        print(f"🚀 Starting {service['description']} on port {service['port']}...")
        
        try:
            if service['script'].endswith('.py'):
                # Python service
                process = subprocess.Popen(
                    ['python3', service['script']],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd='backend' if not service.get('a2a_agent') else 'backend'
                )
            else:
                # Other service (like npm)
                process = subprocess.Popen(
                    service['script'].split(),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
            
            self.processes[service_name] = process
            
            # Wait for service to start
            for attempt in range(10):
                time.sleep(2)
                if self.check_port(service['port']):
                    if self.check_service_health(service_name):
                        print(f"✅ {service['description']} started successfully")
                        self.running_services.add(service_name)
                        return True
                    else:
                        print(f"   Attempt {attempt + 1}/10 - waiting for health check...")
                else:
                    print(f"   Attempt {attempt + 1}/10 - waiting for port...")
            
            print(f"❌ {service['description']} failed to start")
            return False
            
        except Exception as e:
            print(f"❌ Failed to start {service['description']}: {e}")
            return False
    
    def start_frontend(self) -> bool:
        """Start the frontend service"""
        print("🚀 Starting Frontend (Vite Dev Server) on port 5173...")
        
        try:
            process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            self.processes['frontend'] = process
            
            # Wait for frontend to start
            for attempt in range(10):
                time.sleep(3)
                if self.check_port(5173):
                    print("✅ Frontend started successfully")
                    self.running_services.add('frontend')
                    return True
                print(f"   Attempt {attempt + 1}/10 - waiting for frontend...")
            
            print("❌ Frontend failed to start")
            return False
            
        except Exception as e:
            print(f"❌ Failed to start Frontend: {e}")
            return False
    
    def start_a2a_agent(self, agent_name: str) -> bool:
        """Start an A2A agent"""
        service = self.services[agent_name]
        print(f"🚀 Starting {service['description']} on port {service['port']}...")
        
        try:
            process = subprocess.Popen(
                ['python3', service['script']],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd='backend'
            )
            
            self.processes[agent_name] = process
            
            # Wait for agent to start
            for attempt in range(10):
                time.sleep(2)
                if self.check_port(service['port']):
                    print(f"✅ {service['description']} started successfully")
                    self.running_services.add(agent_name)
                    return True
                print(f"   Attempt {attempt + 1}/10 - waiting for {agent_name}...")
            
            print(f"❌ {service['description']} failed to start")
            return False
            
        except Exception as e:
            print(f"❌ Failed to start {service['description']}: {e}")
            return False
    
    def stop_service(self, service_name: str) -> bool:
        """Stop a specific service"""
        if service_name in self.processes:
            try:
                self.processes[service_name].terminate()
                self.processes[service_name].wait(timeout=5)
                del self.processes[service_name]
            except:
                try:
                    self.processes[service_name].kill()
                    del self.processes[service_name]
                except:
                    pass
        
        # Also kill by port
        service = self.services[service_name]
        self.kill_port(service['port'])
        
        if service_name in self.running_services:
            self.running_services.remove(service_name)
        
        print(f"🛑 Stopped {service['description']}")
        return True
    
    def start_all(self, include_a2a_agents: bool = True) -> bool:
        """Start all services"""
        print("🚀 Starting All AgentOS Services...")
        print("=" * 50)
        
        # Start required services first
        required_services = [name for name, service in self.services.items() 
                           if service.get('required', False)]
        
        success_count = 0
        total_services = len(required_services)
        
        if include_a2a_agents:
            a2a_services = [name for name, service in self.services.items() 
                          if service.get('a2a_agent', False)]
            total_services += len(a2a_services)
            required_services.extend(a2a_services)
        
        for service_name in required_services:
            if self.start_service(service_name):
                success_count += 1
        
        print("\n" + "=" * 50)
        print(f"🎉 Started {success_count}/{total_services} services successfully!")
        
        self.print_status()
        return success_count == total_services
    
    def stop_all(self) -> bool:
        """Stop all services"""
        print("🛑 Stopping All AgentOS Services...")
        print("=" * 50)
        
        # Stop all managed processes
        for service_name in list(self.processes.keys()):
            self.stop_service(service_name)
        
        # Kill all ports
        for service_name, service in self.services.items():
            if not service.get('external'):
                self.kill_port(service['port'])
        
        self.running_services.clear()
        print("✅ All services stopped")
        return True
    
    def restart_all(self, include_a2a_agents: bool = True) -> bool:
        """Restart all services"""
        print("🔄 Restarting All AgentOS Services...")
        self.stop_all()
        time.sleep(2)
        return self.start_all(include_a2a_agents)
    
    def status(self) -> Dict:
        """Get status of all services"""
        status = {}
        
        for service_name, service in self.services.items():
            port_in_use = self.check_port(service['port'])
            healthy = self.check_service_health(service_name) if port_in_use else False
            
            status[service_name] = {
                'port': service['port'],
                'description': service['description'],
                'running': port_in_use,
                'healthy': healthy,
                'base_url': service['base_url']
            }
        
        return status
    
    def print_status(self):
        """Print current service status"""
        print("\n📊 Service Status:")
        print("=" * 50)
        
        status = self.status()
        
        for service_name, info in status.items():
            status_icon = "✅" if info['healthy'] else "❌" if info['running'] else "⭕"
            print(f"{status_icon} {info['description']:<40} Port {info['port']:<5} {info['base_url']}")
        
        print("\n🌐 Service URLs:")
        print("   • Frontend:                    http://localhost:5173")
        print("   • Frontend Agent Bridge:       http://localhost:5012")
        print("   • Resource Monitor API:        http://localhost:5011")
        print("   • Agent Registry:              http://localhost:5010")
        print("   • Enhanced Orchestration API:  http://localhost:5014")
        print("   • Simple Orchestration API:    http://localhost:5015")
        print("   • A2A Communication Service:   http://localhost:5008")
        print("   • Strands SDK API:             http://localhost:5006")
        print("   • Chat Orchestrator:           http://localhost:5005")
        print("   • Strands API:                 http://localhost:5004")
        print("   • RAG API:                     http://localhost:5003")
        print("   • Ollama API:                  http://localhost:5002")
        print("   • Ollama Core:                 http://localhost:11434")

def main():
    manager = UnifiedServiceManager()
    
    if len(sys.argv) < 2:
        print("Usage: python unified_service_manager.py <command>")
        print("Commands:")
        print("  start     - Start all services")
        print("  stop      - Stop all services")
        print("  restart   - Restart all services")
        print("  status    - Show service status")
        print("  start-a2a - Start all services including A2A agents")
        print("  stop-a2a  - Stop all services including A2A agents")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'start':
        manager.start_all(include_a2a_agents=False)
    elif command == 'start-a2a':
        manager.start_all(include_a2a_agents=True)
    elif command == 'stop':
        manager.stop_all()
    elif command == 'restart':
        manager.restart_all(include_a2a_agents=False)
    elif command == 'status':
        manager.print_status()
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()
