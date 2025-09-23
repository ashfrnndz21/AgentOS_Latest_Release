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

class A2AService:
    """A2A Service implementing Strands A2A framework"""
    
    def __init__(self):
        self.agents: Dict[str, A2AAgent] = {}
        self.messages: List[A2AMessage] = []
        self.connections: Dict[str, A2AConnection] = {}
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
                # Fallback for agents without Strands SDK integration
                return {
                    "success": True,
                    "response": f"A2A message received from {self.agents[message.from_agent_id].name}: {message.content}",
                    "execution_time": time.time() - start_time,
                    "fallback": True
                }
                
        except Exception as e:
            logger.error(f"Error executing A2A message: {e}")
            return {
                "success": False,
                "error": str(e),
                "execution_time": time.time() - start_time
            }
    
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
                "strands_agent_id": agent.strands_agent_id
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

if __name__ == '__main__':
    logger.info("🚀 Starting A2A Service...")
    logger.info("📍 Port: 5008")
    logger.info("🤖 Strands A2A Framework Implementation")
    logger.info("🔄 Multi-agent communication enabled")
    
    app.run(host='0.0.0.0', port=A2A_SERVICE_PORT, debug=False)