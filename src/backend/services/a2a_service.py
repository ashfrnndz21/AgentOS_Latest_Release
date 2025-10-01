#!/usr/bin/env python3
"""
A2A Service - Agent-to-Agent Communication Service
Implements proper Strands A2A framework for multi-agent communication
"""

import os
import sys
import json
import uuid
import time
import logging
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from contextlib import contextmanager

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_PORT = 5008
SESSION_TIMEOUT = 300  # 5 minutes

app = Flask(__name__)
app.config['SECRET_KEY'] = 'a2a_service_secret'
CORS(app)

@dataclass
class A2AAgent:
    """A2A Agent representation following Strands framework"""
    id: str
    name: str
    description: str
    model: str
    capabilities: List[str]
    status: str = "active"
    created_at: datetime = None
    strands_agent_id: Optional[str] = None
    strands_data: Optional[Dict] = None
    a2a_endpoints: Dict[str, str] = None
    # Enhanced A2A capabilities
    orchestration_enabled: bool = False
    dedicated_ollama_backend: Optional[Dict] = None
    original_strands_id: Optional[str] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.a2a_endpoints is None:
            self.a2a_endpoints = {}

@dataclass
class A2AMessage:
    """A2A Message following Strands framework"""
    id: str
    from_agent_id: str
    to_agent_id: str
    content: str
    message_type: str = "text"
    timestamp: datetime = None
    status: str = "pending"
    response: Optional[str] = None
    execution_time: float = 0.0
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
        if self.metadata is None:
            self.metadata = {}

@dataclass
class A2AConnection:
    """A2A Connection between agents"""
    id: str
    from_agent_id: str
    to_agent_id: str
    connection_type: str = "bidirectional"
    status: str = "active"
    created_at: datetime = None
    last_used: datetime = None
    message_count: int = 0
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.last_used is None:
            self.last_used = datetime.now()

class DedicatedOllamaManager:
    """Manages dedicated Ollama backends for A2A agents"""
    
    def __init__(self):
        self.allocated_ports = set()
        self.start_port = 5023
        self.end_port = 5035  # Extended range to avoid conflicts
        self.active_backends = {}  # agent_id -> backend_config
        self.active_processes = {}  # agent_id -> process
    
    def get_next_available_port(self):
        """Get next available port in range 5023-5035"""
        for port in range(self.start_port, self.end_port + 1):
            if port not in self.allocated_ports:
                return port
        raise Exception("No available ports for dedicated Ollama backends")
    
    def register_existing_backend(self, agent_id: str, backend_config: dict):
        """Register an existing backend that's already running"""
        port = backend_config.get('port')
        if port:
            self.allocated_ports.add(port)
            self.active_backends[agent_id] = backend_config
            logger.info(f"📝 Registered existing backend for agent {agent_id} on port {port}")
    
    def fix_existing_backends(self):
        """Fix existing backends by creating symlinks to shared model storage"""
        import os
        main_models_dir = os.path.expanduser('~/.ollama/models')
        
        for agent_id, backend_config in self.active_backends.items():
            port = backend_config.get('port')
            if port:
                data_dir = f"/tmp/ollama_{port}"
                models_dir = f'{data_dir}/models'
                
                # Remove empty models directory and create symlink
                if os.path.exists(models_dir) and os.path.exists(main_models_dir):
                    # Check if it's empty (no models)
                    try:
                        if not os.listdir(models_dir) or (os.path.exists(f'{models_dir}/blobs') and not os.listdir(f'{models_dir}/blobs')):
                            logger.info(f"🔧 Fixing models for agent {agent_id} on port {port}")
                            os.rmdir(models_dir) if os.path.isdir(models_dir) else os.remove(models_dir)
                            os.symlink(main_models_dir, models_dir)
                            logger.info(f"✅ Created symlink for agent {agent_id}")
                    except Exception as e:
                        logger.warning(f"Could not fix models for agent {agent_id}: {e}")
    
    def cleanup_orphaned_backends(self):
        """Clean up orphaned backends that are no longer running"""
        import os
        import psutil
        
        orphaned_agents = []
        
        for agent_id, backend_config in list(self.active_backends.items()):
            port = backend_config.get('port')
            process_id = backend_config.get('process_id')
            
            if port and process_id:
                # Check if process is still running
                try:
                    process = psutil.Process(process_id)
                    if not process.is_running():
                        orphaned_agents.append(agent_id)
                        logger.info(f"🧹 Found orphaned backend for agent {agent_id} on port {port}")
                except psutil.NoSuchProcess:
                    orphaned_agents.append(agent_id)
                    logger.info(f"🧹 Found orphaned backend for agent {agent_id} on port {port}")
        
        # Remove orphaned backends
        for agent_id in orphaned_agents:
            backend_config = self.active_backends.get(agent_id)
            if backend_config:
                port = backend_config.get('port')
                if port:
                    self.allocated_ports.discard(port)
                    logger.info(f"🗑️ Freed port {port} from orphaned agent {agent_id}")
            
            # Remove from active backends and processes
            self.active_backends.pop(agent_id, None)
            self.active_processes.pop(agent_id, None)
        
        logger.info(f"✅ Cleaned up {len(orphaned_agents)} orphaned backends")
    
    def create_dedicated_backend(self, agent_id: str, model: str):
        """Create dedicated Ollama backend for A2A agent"""
        port = self.get_next_available_port()
        
        logger.info(f"🚀 Creating dedicated Ollama backend for agent {agent_id} on port {port}")
        
        # Start actual Ollama process
        process = self._start_ollama_process(port, model)
        
        # Wait for Ollama to be ready
        self._wait_for_ollama_ready(port)
        
        # Create dedicated Ollama configuration
        ollama_config = {
            "port": port,
            "model": model,
            "agent_id": agent_id,
            "dedicated": True,
            "host": f"http://localhost:{port}",
            "status": "running",
            "process_id": process.pid,
            "data_dir": f"/tmp/ollama_{port}"
        }
        
        # Register with port manager
        self.allocated_ports.add(port)
        self.active_backends[agent_id] = ollama_config
        self.active_processes[agent_id] = process
        
        logger.info(f"✅ Dedicated Ollama backend created for agent {agent_id} on port {port} (PID: {process.pid})")
        return ollama_config
    
    def _start_ollama_process(self, port: int, model: str):
        """Start actual Ollama process on dedicated port"""
        import subprocess
        import os
        
        # Create data directory for this Ollama instance
        data_dir = f"/tmp/ollama_{port}"
        os.makedirs(data_dir, exist_ok=True)
        
        # Create symlinks to shared model storage
        models_dir = f'{data_dir}/models'
        main_models_dir = os.path.expanduser('~/.ollama/models')
        
        if os.path.exists(main_models_dir) and not os.path.exists(models_dir):
            logger.info(f"🔗 Creating symlink from {models_dir} to {main_models_dir}")
            os.symlink(main_models_dir, models_dir)
        elif not os.path.exists(models_dir):
            os.makedirs(models_dir, exist_ok=True)
        
        # Set environment variables for dedicated Ollama instance
        env = os.environ.copy()
        env['OLLAMA_HOST'] = f'0.0.0.0:{port}'
        env['OLLAMA_MODELS'] = models_dir
        
        logger.info(f"Starting Ollama process on port {port} with data dir {data_dir}")
        
        # Start Ollama process
        process = subprocess.Popen(
            ['ollama', 'serve'],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=data_dir
        )
        
        return process
    
    def _wait_for_ollama_ready(self, port: int, timeout: int = 30):
        """Wait for Ollama to be ready on the specified port"""
        import time
        import requests
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = requests.get(f"http://localhost:{port}/api/tags", timeout=2)
                if response.status_code == 200:
                    logger.info(f"✅ Ollama ready on port {port}")
                    return True
            except:
                pass
            time.sleep(1)
        
        raise Exception(f"Ollama failed to start on port {port} within {timeout} seconds")
    
    def release_backend(self, agent_id: str):
        """Release dedicated Ollama backend"""
        if agent_id in self.active_backends:
            backend_config = self.active_backends[agent_id]
            port = backend_config["port"]
            
            # Terminate the Ollama process
            if agent_id in self.active_processes:
                process = self.active_processes[agent_id]
                process.terminate()
                process.wait(timeout=10)
                del self.active_processes[agent_id]
            
            # Clean up
            self.allocated_ports.discard(port)
            del self.active_backends[agent_id]
            
            logger.info(f"Released dedicated Ollama backend for agent {agent_id} on port {port}")
            return True
        return False
    
    def get_backend_status(self, agent_id: str):
        """Get status of dedicated backend"""
        if agent_id in self.active_backends:
            backend_config = self.active_backends[agent_id]
            port = backend_config["port"]
            
            # Check if process is still running
            if agent_id in self.active_processes:
                process = self.active_processes[agent_id]
                if process.poll() is None:  # Process is still running
                    return {"status": "running", "port": port, "pid": process.pid}
                else:
                    return {"status": "stopped", "port": port}
            else:
                return {"status": "not_started", "port": port}
        
        return {"status": "not_found"}

class A2AService:
    """A2A Service implementing Strands A2A framework"""
    
    def __init__(self):
        self.agents: Dict[str, A2AAgent] = {}
        self.messages: List[A2AMessage] = []
        self.connections: Dict[str, A2AConnection] = {}
        self.ollama_manager = DedicatedOllamaManager()
        self.message_history: Dict[str, List[A2AMessage]] = {}
        
        logger.info("A2A Service initialized with Strands A2A framework")
    
    def register_agent(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register an agent for A2A communication following Strands framework"""
        try:
            agent_id = agent_data.get('id', f"a2a_{uuid.uuid4().hex[:8]}")
            
            # Create A2A agent following Strands framework
            a2a_agent = A2AAgent(
                id=agent_id,
                name=agent_data.get('name', f'Agent {agent_id}'),
                description=agent_data.get('description', ''),
                model=agent_data.get('model', ''),
                capabilities=agent_data.get('capabilities', []),
                strands_agent_id=agent_data.get('strands_agent_id'),
                strands_data=agent_data.get('strands_data', {}),
                orchestration_enabled=agent_data.get('orchestration_enabled', False),
                dedicated_ollama_backend=agent_data.get('dedicated_ollama_backend'),
                original_strands_id=agent_data.get('original_strands_id'),
                a2a_endpoints={
                    'receive_message': f"/api/a2a/agents/{agent_id}/receive",
                    'send_message': f"/api/a2a/agents/{agent_id}/send",
                    'status': f"/api/a2a/agents/{agent_id}/status"
                }
            )
            
            self.agents[agent_id] = a2a_agent
            
            logger.info(f"Agent registered for A2A: {a2a_agent.name} (ID: {agent_id})")
            
            return {
                "status": "success",
                "agent": {
                    "id": a2a_agent.id,
                    "name": a2a_agent.name,
                    "description": a2a_agent.description,
                    "model": a2a_agent.model,
                    "capabilities": a2a_agent.capabilities,
                    "a2a_endpoints": a2a_agent.a2a_endpoints,
                    "status": a2a_agent.status,
                    "created_at": a2a_agent.created_at.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error registering agent: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def register_from_strands(self, strands_agent_id: str) -> Dict[str, Any]:
        """Register Strands SDK agent for A2A orchestration with dedicated backend"""
        try:
            # 1. Get original Strands agent configuration
            strands_agent = self._get_strands_agent(strands_agent_id)
            if not strands_agent:
                return {"status": "error", "error": f"Strands agent {strands_agent_id} not found"}
            
            # 2. Extract capabilities from system prompt, name, and description
            system_prompt = strands_agent.get('host', '')  # system_prompt is in 'host' field due to mapping issue
            agent_name = strands_agent.get('name', '')
            agent_description = strands_agent.get('description', '')
            
            # Extract capabilities from multiple sources
            capabilities = self._extract_capabilities_from_prompt(system_prompt)
            name_capabilities = self._extract_capabilities_from_prompt(agent_name)
            desc_capabilities = self._extract_capabilities_from_prompt(agent_description)
            
            # Combine all capabilities and remove duplicates
            all_capabilities = capabilities + name_capabilities + desc_capabilities
            capabilities = list(set(all_capabilities))  # Remove duplicates
            
            # 3. Check if agent already has a dedicated backend, or create new one
            existing_agent = None
            logger.info(f"🔍 Looking for existing agent with strands_agent_id: {strands_agent_id}")
            for agent_id, agent in self.agents.items():
                logger.info(f"🔍 Checking agent {agent_id}: strands_agent_id={agent.strands_agent_id}, original_strands_id={agent.original_strands_id}")
                # Check by strands_agent_id OR by direct agent ID match
                if (agent.strands_agent_id == strands_agent_id or 
                    agent_id == strands_agent_id or
                    agent.original_strands_id == strands_agent_id):
                    existing_agent = agent
                    logger.info(f"🔍 Found existing agent: {agent_id}")
                    break
            
            if existing_agent and existing_agent.dedicated_ollama_backend:
                # Reuse existing dedicated backend
                dedicated_backend = existing_agent.dedicated_ollama_backend
                # Register the existing backend with the Ollama manager
                self.ollama_manager.register_existing_backend(strands_agent_id, dedicated_backend)
                logger.info(f"Reusing existing dedicated backend for agent {strands_agent_id}")
            else:
                # Create new dedicated Ollama backend
                dedicated_backend = self.ollama_manager.create_dedicated_backend(
                    agent_id=strands_agent_id,
                    model=strands_agent.get('model_id', 'qwen3:1.7b')
                )
            
            # 4. Upgrade existing agent or create new one
            logger.info(f"🔍 Processing agent with strands_agent_id: {strands_agent_id}")
            
            if existing_agent:
                # Upgrade existing agent to orchestration-enabled
                existing_agent.orchestration_enabled = True
                existing_agent.dedicated_ollama_backend = dedicated_backend
                # Update model to match the current Strands agent configuration
                existing_agent.model = strands_agent.get('model_id', 'qwen3:1.7b')
                # Update capabilities from the current Strands agent configuration
                existing_agent.capabilities = capabilities
                a2a_agent_id = existing_agent.id
                a2a_agent = existing_agent
                logger.info(f"Upgraded existing agent {a2a_agent_id} to orchestration-enabled with model {existing_agent.model} and capabilities {capabilities}")
            else:
                # Create new A2A agent with orchestration capabilities
                a2a_agent_id = f"a2a_{strands_agent_id}"
                a2a_agent = A2AAgent(
                    id=a2a_agent_id,
                    name=strands_agent.get('name', 'Unknown Agent'),
                    description=strands_agent.get('description', ''),
                    model=strands_agent.get('model_id', 'qwen3:1.7b'),
                    capabilities=capabilities,
                    strands_agent_id=strands_agent_id,
                    strands_data=strands_agent,
                    orchestration_enabled=True,
                    dedicated_ollama_backend=dedicated_backend,
                    original_strands_id=strands_agent_id,
                    a2a_endpoints={
                        'receive_message': f"/api/a2a/agents/{a2a_agent_id}/receive",
                        'send_message': f"/api/a2a/agents/{a2a_agent_id}/send",
                        'status': f"/api/a2a/agents/{a2a_agent_id}/status"
                    }
                )
                # 5. Register the A2A agent
                self.agents[a2a_agent_id] = a2a_agent
            
            # 6. Register with System Orchestrator
            self._register_with_orchestrator(a2a_agent)
            
            logger.info(f"Strands agent {strands_agent_id} registered for A2A orchestration with dedicated backend on port {dedicated_backend['port']}")
            
            return {
                "status": "success",
                "a2a_agent_id": a2a_agent_id,
                "agent_name": a2a_agent.name,
                "dedicated_backend": dedicated_backend,
                "orchestration_enabled": True,
                "capabilities": capabilities,
                "message": f"Agent {a2a_agent.name} registered for A2A orchestration with dedicated Ollama backend"
            }
            
        except Exception as e:
            logger.error(f"Failed to register Strands agent for A2A: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    def _get_strands_agent(self, strands_agent_id: str) -> Optional[Dict]:
        """Get Strands SDK agent configuration"""
        try:
            # Get all agents and find the specific one
            response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=10)
            if response.status_code == 200:
                data = response.json()
                agents = data.get('agents', [])
                
                # Find the specific agent
                for agent in agents:
                    if agent.get('id') == strands_agent_id:
                        return agent
                
                logger.error(f"Agent {strands_agent_id} not found in Strands SDK")
                return None
            return None
        except Exception as e:
            logger.error(f"Failed to get Strands agent {strands_agent_id}: {str(e)}")
            return None
    
    def _extract_capabilities_from_prompt(self, system_prompt: str) -> List[str]:
        """Extract capabilities from system prompt"""
        capabilities = []
        prompt_lower = system_prompt.lower()
        
        # Define capability keywords
        capability_keywords = {
            'weather': ['weather', 'forecast', 'temperature', 'climate'],
            'technical': ['technical', 'programming', 'code', 'software', 'development'],
            'creative': ['creative', 'writing', 'story', 'poem', 'art'],
            'research': ['research', 'analysis', 'investigation', 'study'],
            'finance': ['finance', 'financial', 'investment', 'money', 'budget'],
            'education': ['education', 'teaching', 'learning', 'academic', 'student']
        }
        
        for capability, keywords in capability_keywords.items():
            if any(keyword in prompt_lower for keyword in keywords):
                capabilities.append(capability)
        
        # If no specific capabilities found, add general
        if not capabilities:
            capabilities.append('general')
            
        return capabilities
    
    def _register_with_orchestrator(self, a2a_agent: A2AAgent):
        """Register A2A agent with System Orchestrator"""
        try:
            orchestrator_data = {
                'agent_id': a2a_agent.id,
                'name': a2a_agent.name,
                'capabilities': a2a_agent.capabilities,
                'dedicated_ollama_backend': a2a_agent.dedicated_ollama_backend,
                'orchestration_enabled': True,
                'a2a_status': 'registered'
            }
            
            # Register with Enhanced Orchestration API
            response = requests.post(
                f"http://localhost:5014/api/enhanced-orchestration/register-agent",
                json=orchestrator_data,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"Agent {a2a_agent.name} registered with System Orchestrator")
            else:
                logger.warning(f"Failed to register agent {a2a_agent.name} with System Orchestrator")
                
        except Exception as e:
            logger.error(f"Failed to register with orchestrator: {str(e)}")
    
    def get_orchestration_agents(self) -> List[Dict]:
        """Get agents enabled for orchestration"""
        orchestration_agents = []
        for agent in self.agents.values():
            if agent.orchestration_enabled:
                orchestration_agents.append({
                    'id': agent.id,
                    'name': agent.name,
                    'capabilities': agent.capabilities,
                    'dedicated_ollama_backend': agent.dedicated_ollama_backend,
                    'a2a_status': 'registered',
                    'orchestration_enabled': True
                })
        return orchestration_agents
    
    def send_message(self, from_agent_id: str, to_agent_id: str, content: str, message_type: str = "text") -> Dict[str, Any]:
        """Send A2A message following Strands framework"""
        try:
            # Validate agents exist
            if from_agent_id not in self.agents:
                return {
                    "status": "error",
                    "error": f"Source agent {from_agent_id} not found"
                }
            
            if to_agent_id not in self.agents:
                return {
                    "status": "error",
                    "error": f"Target agent {to_agent_id} not found"
                }
            
            # Create message
            message_id = str(uuid.uuid4())
            message = A2AMessage(
                id=message_id,
                from_agent_id=from_agent_id,
                to_agent_id=to_agent_id,
                content=content,
                message_type=message_type,
                metadata={
                    "strands_framework": True,
                    "a2a_version": "1.0.0"
                }
            )
            
            # Execute message through Strands SDK
            execution_result = self._execute_a2a_message(message)
            
            # Update message with result
            message.status = "completed" if execution_result.get("success") else "failed"
            message.response = execution_result.get("response", "")
            message.execution_time = execution_result.get("execution_time", 0.0)
            
            # Store message
            self.messages.append(message)
            
            # Update message history
            if to_agent_id not in self.message_history:
                self.message_history[to_agent_id] = []
            self.message_history[to_agent_id].append(message)
            
            # Update connection stats
            connection_key = f"{from_agent_id}_{to_agent_id}"
            if connection_key in self.connections:
                self.connections[connection_key].message_count += 1
                self.connections[connection_key].last_used = datetime.now()
            
            logger.info(f"A2A message sent: {from_agent_id} -> {to_agent_id} (Status: {message.status})")
            
            return {
                "status": "success",
                "message_id": message_id,
                "execution_result": execution_result,
                "message": {
                    "id": message.id,
                    "from_agent": self.agents[from_agent_id].name,
                    "to_agent": self.agents[to_agent_id].name,
                    "content": content,
                    "response": message.response,
                    "status": message.status,
                    "execution_time": message.execution_time,
                    "timestamp": message.timestamp.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error sending A2A message: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _execute_a2a_message(self, message: A2AMessage) -> Dict[str, Any]:
        """Execute A2A message through Strands SDK"""
        try:
            start_time = time.time()
            
            # Get target agent
            target_agent = self.agents[message.to_agent_id]
            
            # Prepare A2A message for Strands SDK
            a2a_prompt = f"""A2A MESSAGE RECEIVED

From: {self.agents[message.from_agent_id].name}
To: {target_agent.name}
Message Type: {message.message_type}
Timestamp: {message.timestamp.isoformat()}

Message Content:
{message.content}

Please respond to this A2A message as the {target_agent.name} agent. Use your capabilities: {', '.join(target_agent.capabilities)} to provide a helpful response."""

            # Execute through Strands SDK
            if target_agent.strands_agent_id:
                response = requests.post(
                    f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{target_agent.strands_agent_id}/execute",
                    json={
                        "input": a2a_prompt,
                        "stream": False,
                        "a2a_context": {
                            "from_agent": self.agents[message.from_agent_id].name,
                            "message_type": message.message_type,
                            "original_content": message.content
                        }
                    },
                    timeout=120
                )
                
                if response.status_code == 200:
                    result = response.json()
                    execution_time = time.time() - start_time
                    
                    return {
                        "success": True,
                        "response": result.get("response", result.get("output", "")),
                        "execution_time": execution_time,
                        "strands_metadata": result
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Strands SDK execution failed: {response.status_code} - {response.text}",
                        "execution_time": time.time() - start_time
                    }
            else:
                # Execute directly with Ollama for agents without Strands SDK integration
                return self._execute_direct_ollama_call(target_agent, a2a_prompt, start_time)
                
        except Exception as e:
            logger.error(f"Error executing A2A message: {e}")
            return {
                "success": False,
                "error": str(e),
                "execution_time": time.time() - start_time
            }
    
    def _execute_a2a_message_enhanced(self, message: A2AMessage, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute A2A message with enhanced context and specialization"""
        try:
            start_time = time.time()
            
            # Get target agent
            target_agent = self.agents[message.to_agent_id]
            
            # Build enhanced prompt with context
            enhanced_prompt = self._build_enhanced_agent_prompt(target_agent, message, context)
            
            # Execute through Strands SDK with enhanced context
            if target_agent.strands_agent_id:
                response = requests.post(
                    f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{target_agent.strands_agent_id}/execute",
                    json={
                        "input": enhanced_prompt,
                        "stream": False,
                        "a2a_context": {
                            "from_agent": self.agents[message.from_agent_id].name if message.from_agent_id in self.agents else "System Orchestrator",
                            "message_type": message.message_type,
                            "original_content": message.content,
                            "enhanced_context": context or {},
                            "agent_specialization": self._get_agent_specialization(target_agent),
                            "execution_metadata": message.metadata or {}
                        }
                    },
                    timeout=120
                )
                
                if response.status_code == 200:
                    result = response.json()
                    execution_time = time.time() - start_time
                    
                    return {
                        "success": True,
                        "response": result.get("response", result.get("output", "")),
                        "execution_time": execution_time,
                        "strands_metadata": result,
                        "enhanced_execution": True
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Enhanced Strands SDK execution failed: {response.status_code} - {response.text}",
                        "execution_time": time.time() - start_time
                    }
            else:
                # Execute directly with Ollama for agents without Strands SDK integration
                return self._execute_direct_ollama_call(target_agent, enhanced_prompt, start_time)
                
        except Exception as e:
            logger.error(f"Error executing enhanced A2A message: {e}")
            return {
                "success": False,
                "error": str(e),
                "execution_time": time.time() - start_time
            }
    
    def _build_enhanced_agent_prompt(self, agent: A2AAgent, message: A2AMessage, context: Dict[str, Any] = None) -> str:
        """Build enhanced prompt with agent specialization and context"""
        
        # Get agent specialization
        specialization = self._get_agent_specialization(agent)
        
        # Handle from_agent safely
        from_agent_name = "System Orchestrator"
        if message.from_agent_id in self.agents:
            from_agent_name = self.agents[message.from_agent_id].name
        
        # Build base prompt
        base_prompt = f"""You are a specialized {agent.name} with expertise in {specialization['domain']}.

## Your Role & Expertise
{specialization['role_description']}

## Your Capabilities
{', '.join(specialization['capabilities'])}

## Task Instructions
{specialization['task_instructions']}

## Domain Knowledge
{specialization['domain_knowledge']}

## A2A Message Details
From: {from_agent_name}
To: {agent.name}
Message Type: {message.message_type}
Timestamp: {message.timestamp.isoformat()}

## Message Content
{message.content}

## Context Information
{self._format_context(context or {})}

## Expected Output Format
{specialization['output_format']}

Please provide a comprehensive, specialized response based on your expertise and the context provided."""

        return base_prompt
    
    def _execute_direct_ollama_call(self, agent: A2AAgent, prompt: str, start_time: float) -> Dict[str, Any]:
        """Execute direct Ollama call for agents without Strands SDK integration"""
        try:
            # Get agent model configuration
            model = agent.model if agent.model else "qwen3:1.7b"
            
            # Prepare Ollama request
            ollama_request = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "max_tokens": 2000
                }
            }
            
            # Call Ollama directly
            response = requests.post(
                "http://localhost:11434/api/generate",
                json=ollama_request,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                execution_time = time.time() - start_time
                
                # Extract response text
                response_text = result.get("response", "")
                
                return {
                    "success": True,
                    "response": response_text,
                    "execution_time": execution_time,
                    "ollama_metadata": result,
                    "direct_ollama_execution": True
                }
            else:
                return {
                    "success": False,
                    "error": f"Ollama execution failed: {response.status_code} - {response.text}",
                    "execution_time": time.time() - start_time
                }
                
        except Exception as e:
            logger.error(f"Error executing direct Ollama call: {e}")
            return {
                "success": False,
                "error": str(e),
                "execution_time": time.time() - start_time
            }
    
    def _get_agent_specialization(self, agent: A2AAgent) -> Dict[str, Any]:
        """Get agent specialization based on agent name and capabilities"""
        agent_name = agent.name.lower()
        
        if "ran" in agent_name or "radio" in agent_name:
            return {
                "domain": "Radio Access Network (RAN) Performance Analysis",
                "role_description": "You are a specialized Telco RAN Agent with deep expertise in Radio Access Network performance analysis. You excel at analyzing PRB (Physical Resource Block) utilization patterns, identifying performance bottlenecks, and correlating network metrics with customer behavior patterns.",
                "capabilities": [
                    "PRB utilization analysis",
                    "RAN performance monitoring",
                    "Network KPI analysis",
                    "Churn correlation analysis",
                    "Network optimization recommendations"
                ],
                "task_instructions": "Focus on: 1) PRB utilization thresholds that impact user experience, 2) Correlation between high PRB utilization and churn rates, 3) Recommended monitoring thresholds for proactive churn prevention, 4) Technical metrics and business impact analysis.",
                "domain_knowledge": "PRB utilization thresholds: Normal <70%, Warning 70-85%, Critical >85%. Key RAN KPIs: SINR, RSRP, RSRQ, Throughput. Churn indicators: Network performance degradation, high latency, dropped calls.",
                "output_format": "Provide structured technical analysis with: Executive Summary, Technical Analysis, Churn Correlation Findings, Specific Recommendations, and Next Steps for handoff to other agents."
            }
        elif "churn" in agent_name:
            return {
                "domain": "Customer Churn Analysis and Retention",
                "role_description": "You are a specialized Telco Churn Agent with expertise in customer churn prediction, retention strategies, and behavioral analysis. You analyze customer data patterns to identify churn risk factors and recommend retention strategies.",
                "capabilities": [
                    "Churn prediction modeling",
                    "Customer behavior analysis",
                    "Retention strategy development",
                    "Risk factor identification",
                    "Customer segmentation"
                ],
                "task_instructions": "Focus on: 1) Analyzing churn risk factors from provided data, 2) Identifying high-risk customer segments, 3) Developing targeted retention strategies, 4) Providing actionable recommendations for churn prevention.",
                "domain_knowledge": "Churn indicators: Usage pattern changes, complaint frequency, payment delays, service interactions. Retention strategies: Personalized offers, proactive support, service improvements, loyalty programs.",
                "output_format": "Provide structured analysis with: Churn Risk Assessment, Customer Segmentation Analysis, Retention Strategy Recommendations, Implementation Plan, and Success Metrics."
            }
        elif "customer service" in agent_name or "service" in agent_name:
            return {
                "domain": "Customer Service and Support",
                "role_description": "You are a specialized Telco Customer Service Agent with expertise in customer complaint handling, issue resolution, and service optimization. You provide comprehensive support and identify service improvement opportunities.",
                "capabilities": [
                    "Customer complaint analysis",
                    "Issue resolution",
                    "Service optimization",
                    "Customer satisfaction improvement",
                    "Process enhancement"
                ],
                "task_instructions": "Focus on: 1) Analyzing customer complaints and issues, 2) Identifying root causes of service problems, 3) Developing resolution strategies, 4) Recommending service improvements.",
                "domain_knowledge": "Common issues: Network problems, billing disputes, service outages, device issues. Resolution strategies: Proactive communication, quick response times, escalation procedures, follow-up protocols.",
                "output_format": "Provide structured response with: Issue Analysis, Root Cause Identification, Resolution Strategy, Service Improvement Recommendations, and Implementation Plan."
            }
        else:
            return {
                "domain": "General Telecommunications",
                "role_description": f"You are a specialized {agent.name} with expertise in telecommunications and customer service. You provide comprehensive analysis and recommendations based on your capabilities.",
                "capabilities": agent.capabilities,
                "task_instructions": "Analyze the provided information and provide comprehensive, actionable recommendations based on your expertise.",
                "domain_knowledge": "Telecommunications industry knowledge, customer service best practices, network operations, service optimization.",
                "output_format": "Provide structured analysis with clear sections, actionable recommendations, and implementation guidance."
            }
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context information for prompt"""
        if not context:
            return "No additional context provided."
        
        formatted_context = []
        for key, value in context.items():
            if isinstance(value, dict):
                formatted_context.append(f"{key}: {json.dumps(value, indent=2)}")
            else:
                formatted_context.append(f"{key}: {value}")
        
        return "\n".join(formatted_context)
    
    def create_connection(self, from_agent_id: str, to_agent_id: str) -> Dict[str, Any]:
        """Create A2A connection between agents"""
        try:
            connection_id = f"conn_{uuid.uuid4().hex[:8]}"
            connection_key = f"{from_agent_id}_{to_agent_id}"
            
            connection = A2AConnection(
                id=connection_id,
                from_agent_id=from_agent_id,
                to_agent_id=to_agent_id
            )
            
            self.connections[connection_key] = connection
            
            logger.info(f"A2A connection created: {from_agent_id} <-> {to_agent_id}")
            
            return {
                "status": "success",
                "connection": {
                    "id": connection.id,
                    "from_agent": self.agents[from_agent_id].name,
                    "to_agent": self.agents[to_agent_id].name,
                    "status": connection.status,
                    "created_at": connection.created_at.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating A2A connection: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_agents(self) -> List[Dict[str, Any]]:
        """Get all registered A2A agents"""
        return [
            {
                "id": agent.id,
                "name": agent.name,
                "description": agent.description,
                "model": agent.model,
                "capabilities": agent.capabilities,
                "status": agent.status,
                "a2a_endpoints": agent.a2a_endpoints,
                "created_at": agent.created_at.isoformat(),
                "strands_agent_id": agent.strands_agent_id,
                "orchestration_enabled": agent.orchestration_enabled,
                "dedicated_ollama_backend": agent.dedicated_ollama_backend,
                "original_strands_id": agent.original_strands_id
            }
            for agent in self.agents.values()
        ]
    
    def get_message_history(self, agent_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get A2A message history"""
        if agent_id:
            messages = self.message_history.get(agent_id, [])
        else:
            messages = self.messages
        
        return [
            {
                "id": msg.id,
                "from_agent_id": msg.from_agent_id,
                "to_agent_id": msg.to_agent_id,
                "content": msg.content,
                "message_type": msg.message_type,
                "response": msg.response,
                "status": msg.status,
                "execution_time": msg.execution_time,
                "timestamp": msg.timestamp.isoformat(),
                "metadata": msg.metadata
            }
            for msg in messages[-50:]  # Last 50 messages
        ]

# Initialize A2A service
a2a_service = A2AService()

@app.route('/api/a2a/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "a2a-service",
        "version": "1.0.0",
        "strands_framework": True,
        "agents_registered": len(a2a_service.agents),
        "connections_active": len(a2a_service.connections),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/a2a/agents', methods=['POST'])
def register_agent():
    """Register an agent for A2A communication"""
    try:
        data = request.get_json()
        result = a2a_service.register_agent(data)
        return jsonify(result), 201 if result.get("status") == "success" else 400
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/register-from-strands', methods=['POST'])
def register_from_strands():
    """Register Strands SDK agent for A2A orchestration with dedicated backend"""
    try:
        data = request.get_json()
        strands_agent_id = data.get('strands_agent_id')
        
        if not strands_agent_id:
            return jsonify({"status": "error", "error": "strands_agent_id is required"}), 400
        
        result = a2a_service.register_from_strands(strands_agent_id)
        return jsonify(result), 201 if result.get("status") == "success" else 400
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/orchestration-agents', methods=['GET'])
def get_orchestration_agents():
    """Get agents enabled for orchestration"""
    try:
        agents = a2a_service.get_orchestration_agents()
        return jsonify({
            "status": "success",
            "agents": agents,
            "count": len(agents)
        })
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/agents/<agent_id>/update-capabilities', methods=['POST'])
def update_agent_capabilities(agent_id: str):
    """Update agent capabilities"""
    try:
        data = request.get_json()
        capabilities = data.get('capabilities', [])
        
        if agent_id in a2a_service.agents:
            a2a_service.agents[agent_id].capabilities = capabilities
            logger.info(f"Updated capabilities for agent {agent_id}: {capabilities}")
            return jsonify({
                "status": "success",
                "agent_id": agent_id,
                "capabilities": capabilities,
                "message": f"Capabilities updated for agent {agent_id}"
            })
        else:
            return jsonify({"status": "error", "error": f"Agent {agent_id} not found"}), 404
            
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/dedicated-backends/fix-models', methods=['POST'])
def fix_dedicated_backend_models():
    """Fix existing dedicated backends by creating symlinks to shared model storage"""
    try:
        a2a_service.ollama_manager.fix_existing_backends()
        return jsonify({
            "status": "success",
            "message": "Fixed existing dedicated backends with shared model storage"
        })
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/dedicated-backends/cleanup', methods=['POST'])
def cleanup_dedicated_backends():
    """Clean up orphaned dedicated backends"""
    try:
        a2a_service.ollama_manager.cleanup_orphaned_backends()
        return jsonify({
            "status": "success",
            "message": "Cleaned up orphaned dedicated backends"
        })
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/dedicated-backends/status', methods=['GET'])
def get_dedicated_backends_status():
    """Get status of all dedicated backends"""
    try:
        backend_status = {}
        for agent_id, backend_config in a2a_service.ollama_manager.active_backends.items():
            status = a2a_service.ollama_manager.get_backend_status(agent_id)
            backend_status[agent_id] = {
                "backend_config": backend_config,
                "status": status
            }
        
        return jsonify({
            "status": "success",
            "dedicated_backends": backend_status,
            "total_backends": len(backend_status)
        }), 200
    except Exception as e:
        logger.error(f"Error getting dedicated backends status: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/agents', methods=['GET'])
def get_agents():
    """Get all registered A2A agents"""
    try:
        agents = a2a_service.get_agents()
        return jsonify({
            "status": "success",
            "agents": agents,
            "count": len(agents)
        })
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/agents/<agent_id>/status', methods=['GET'])
def get_agent_status(agent_id):
    """Get status of a specific A2A agent"""
    try:
        if agent_id not in a2a_service.agents:
            return jsonify({"status": "error", "error": "Agent not found"}), 404
        
        agent = a2a_service.agents[agent_id]
        
        # Get backend status if available
        backend_status = None
        if hasattr(a2a_service, 'ollama_manager') and agent_id in a2a_service.ollama_manager.active_backends:
            backend_status = a2a_service.ollama_manager.get_backend_status(agent_id)
        
        return jsonify({
            "status": "success",
            "agent_id": agent_id,
            "agent_name": agent.name,
            "agent_status": agent.status,
            "orchestration_enabled": agent.orchestration_enabled,
            "dedicated_backend_status": backend_status,
            "capabilities": agent.capabilities,
            "model": agent.model,
            "created_at": agent.created_at.isoformat() if agent.created_at else None
        })
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/agents/<agent_id>', methods=['DELETE'])
def delete_agent(agent_id):
    """Delete an A2A agent"""
    try:
        if agent_id in a2a_service.agents:
            agent = a2a_service.agents.pop(agent_id)
            # Clean up connections
            connections_to_remove = [key for key in a2a_service.connections.keys() 
                                   if agent_id in key]
            for key in connections_to_remove:
                a2a_service.connections.pop(key)
            
            logger.info(f"A2A agent deleted: {agent.name}")
            return jsonify({
                "status": "success",
                "message": f"Agent {agent.name} deleted successfully"
            })
        else:
            return jsonify({"status": "error", "error": "Agent not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/messages', methods=['POST'])
def send_message():
    """Send an A2A message"""
    try:
        data = request.get_json()
        from_agent_id = data.get('from_agent_id')
        to_agent_id = data.get('to_agent_id')
        content = data.get('content')
        message_type = data.get('type', 'text')
        
        if not all([from_agent_id, to_agent_id, content]):
            return jsonify({
                "status": "error",
                "error": "from_agent_id, to_agent_id, and content are required"
            }), 400
        
        result = a2a_service.send_message(from_agent_id, to_agent_id, content, message_type)
        return jsonify(result), 201 if result.get("status") == "success" else 400
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/messages/history', methods=['GET'])
def get_message_history():
    """Get A2A message history"""
    try:
        agent_id = request.args.get('agent_id')
        messages = a2a_service.get_message_history(agent_id)
        return jsonify({
            "status": "success",
            "messages": messages,
            "count": len(messages)
        })
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/connections', methods=['POST'])
def create_connection():
    """Create A2A connection between agents"""
    try:
        data = request.get_json()
        from_agent_id = data.get('from_agent_id')
        to_agent_id = data.get('to_agent_id')
        
        if not all([from_agent_id, to_agent_id]):
            return jsonify({
                "status": "error",
                "error": "from_agent_id and to_agent_id are required"
            }), 400
        
        result = a2a_service.create_connection(from_agent_id, to_agent_id)
        return jsonify(result), 201 if result.get("status") == "success" else 400
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/connections', methods=['GET'])
def get_connections():
    """Get all A2A connections"""
    try:
        connections = [
            {
                "id": conn.id,
                "from_agent_id": conn.from_agent_id,
                "to_agent_id": conn.to_agent_id,
                "status": conn.status,
                "message_count": conn.message_count,
                "created_at": conn.created_at.isoformat(),
                "last_used": conn.last_used.isoformat()
            }
            for conn in a2a_service.connections.values()
        ]
        
        return jsonify({
            "status": "success",
            "connections": connections,
            "count": len(connections)
        })
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/connections/<agent_id>', methods=['GET'])
def get_agent_connections(agent_id):
    """Get connections for a specific agent"""
    try:
        agent_connections = []
        
        # Find all connections where this agent is either the source or target
        for conn in a2a_service.connections.values():
            if conn.from_agent_id == agent_id or conn.to_agent_id == agent_id:
                # Get the other agent's ID and name
                other_agent_id = conn.to_agent_id if conn.from_agent_id == agent_id else conn.from_agent_id
                other_agent_name = a2a_service.agents.get(other_agent_id, {}).name if other_agent_id in a2a_service.agents else "Unknown Agent"
                
                agent_connections.append({
                    "id": conn.id,
                    "other_agent_id": other_agent_id,
                    "other_agent_name": other_agent_name,
                    "status": conn.status,
                    "message_count": conn.message_count,
                    "created_at": conn.created_at.isoformat(),
                    "last_used": conn.last_used.isoformat()
                })
        
        return jsonify({
            "connections": agent_connections,
            "count": len(agent_connections)
        })
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/connections/selective', methods=['POST'])
def create_selective_connection():
    """Create selective A2A connections - connect to specific agents or all"""
    try:
        data = request.get_json()
        from_agent_id = data.get('from_agent_id')
        target_agents = data.get('target_agents', [])  # List of agent IDs or 'all'
        
        if not from_agent_id:
            return jsonify({"status": "error", "message": "from_agent_id is required"}), 400
        
        if from_agent_id not in a2a_service.agents:
            return jsonify({"status": "error", "message": "Source agent not found"}), 404
        
        results = []
        
        # If target_agents is 'all' or empty, connect to all other agents
        if not target_agents or target_agents == 'all':
            other_agents = [agent_id for agent_id in a2a_service.agents.keys() if agent_id != from_agent_id]
        else:
            other_agents = target_agents
        
        # Create connections to each target agent
        for target_agent_id in other_agents:
            if target_agent_id not in a2a_service.agents:
                results.append({
                    "target_agent_id": target_agent_id,
                    "status": "error",
                    "message": "Target agent not found"
                })
                continue
            
            # Check if connection already exists
            connection_key = f"{from_agent_id}_{target_agent_id}"
            reverse_key = f"{target_agent_id}_{from_agent_id}"
            
            if connection_key in a2a_service.connections or reverse_key in a2a_service.connections:
                results.append({
                    "target_agent_id": target_agent_id,
                    "status": "already_connected",
                    "message": "Connection already exists"
                })
                continue
            
            # Create the connection
            result = a2a_service.create_connection(from_agent_id, target_agent_id)
            results.append({
                "target_agent_id": target_agent_id,
                "status": result.get("status", "error"),
                "message": result.get("message", "Connection created"),
                "connection_id": result.get("connection_id")
            })
        
        successful_connections = len([r for r in results if r["status"] == "success"])
        already_connected = len([r for r in results if r["status"] == "already_connected"])
        
        return jsonify({
            "status": "success",
            "message": f"Created {successful_connections} new connections, {already_connected} already connected",
            "results": results,
            "summary": {
                "total_targets": len(other_agents),
                "successful": successful_connections,
                "already_connected": already_connected,
                "failed": len(results) - successful_connections - already_connected
            }
        })
        
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/agents/<agent_id>/execute-enhanced', methods=['POST'])
def execute_agent_enhanced(agent_id):
    """Execute agent with enhanced context and specialization"""
    try:
        data = request.get_json()
        message_content = data.get('message', '')
        context = data.get('context', {})
        execution_metadata = data.get('execution_metadata', {})
        
        if agent_id not in a2a_service.agents:
            return jsonify({"status": "error", "error": "Agent not found"}), 404
        
        # Create enhanced A2A message
        message = A2AMessage(
            id=str(uuid.uuid4()),
            from_agent_id="system_orchestrator",  # Use system orchestrator
            to_agent_id=agent_id,
            content=message_content,
            message_type="enhanced_execution",
            metadata=execution_metadata
        )
        
        # Execute with enhanced context
        result = a2a_service._execute_a2a_message_enhanced(message, context)
        
        return jsonify({
            "status": "success" if result["success"] else "error",
            "result": result,
            "agent_id": agent_id,
            "message_id": message.id,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Enhanced execution error: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/agents/<agent_id>/specialization', methods=['GET'])
def get_agent_specialization(agent_id):
    """Get agent specialization information"""
    try:
        if agent_id not in a2a_service.agents:
            return jsonify({"status": "error", "error": "Agent not found"}), 404
        
        agent = a2a_service.agents[agent_id]
        specialization = a2a_service._get_agent_specialization(agent)
        
        return jsonify({
            "status": "success",
            "agent_id": agent_id,
            "agent_name": agent.name,
            "specialization": specialization,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Specialization error: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/agents/<agent_id>/context-template', methods=['POST'])
def get_context_template(agent_id):
    """Get context template for agent execution"""
    try:
        if agent_id not in a2a_service.agents:
            return jsonify({"status": "error", "error": "Agent not found"}), 404
        
        data = request.get_json()
        query = data.get('query', '')
        context_type = data.get('context_type', 'general')
        
        agent = a2a_service.agents[agent_id]
        specialization = a2a_service._get_agent_specialization(agent)
        
        # Generate context template
        context_template = {
            "agent_role": agent.name,
            "specialization": specialization['domain'],
            "domain_expertise": specialization['capabilities'],
            "task_specific_prompt": specialization['task_instructions'],
            "domain_knowledge": specialization['domain_knowledge'],
            "expected_output_format": specialization['output_format'],
            "context_type": context_type,
            "query_context": query
        }
        
        return jsonify({
            "status": "success",
            "agent_id": agent_id,
            "context_template": context_template,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Context template error: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting A2A Service...")
    logger.info("📍 Port: 5008")
    logger.info("🤖 Strands A2A Framework Implementation")
    logger.info("🔄 Multi-agent communication enabled")
    
    app.run(host='0.0.0.0', port=A2A_SERVICE_PORT, debug=False)