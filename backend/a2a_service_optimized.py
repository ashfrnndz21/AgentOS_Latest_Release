#!/usr/bin/env python3
"""
Optimized A2A Service - Agent-to-Agent Communication Service
Eliminates circular dependencies and implements graceful degradation
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
SYNC_INTERVAL = 60  # Sync with Strands SDK every 60 seconds
MAX_SYNC_RETRIES = 3

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
            self.a2a_endpoints = {
                'receive_message': f"/api/a2a/agents/{self.id}/receive",
                'send_message': f"/api/a2a/agents/{self.id}/send",
                'status': f"/api/a2a/agents/{self.id}/status"
            }

@dataclass
class A2AMessage:
    """A2A Message representation"""
    id: str
    from_agent_id: str
    to_agent_id: str
    from_agent_name: str
    to_agent_name: str
    content: str
    type: str = "text"
    timestamp: datetime = None
    status: str = "sent"
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

@dataclass
class A2AConnection:
    """A2A Connection representation"""
    id: str
    from_agent_id: str
    to_agent_id: str
    connection_type: str = "message"
    is_active: bool = True
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

class OptimizedA2AService:
    """Optimized A2A Service with graceful degradation"""
    
    def __init__(self):
        self.agents: Dict[str, A2AAgent] = {}
        self.messages: List[A2AMessage] = []
        self.connections: Dict[str, A2AConnection] = {}
        self.message_history: Dict[str, List[A2AMessage]] = {}
        
        # Sync management
        self.last_sync = datetime.now()
        self.sync_in_progress = False
        self.strands_sdk_available = True
        
        # Start background sync thread
        self.sync_thread = threading.Thread(target=self._background_sync, daemon=True)
        self.sync_thread.start()
        
        logger.info("🚀 Optimized A2A Service initialized with graceful degradation")
    
    def _background_sync(self):
        """Background thread for syncing with Strands SDK"""
        while True:
            try:
                if not self.sync_in_progress:
                    self._sync_agents_from_strands()
                time.sleep(SYNC_INTERVAL)
            except Exception as e:
                logger.error(f"Error in background sync: {e}")
                time.sleep(30)  # Wait before retry
    
    def _sync_agents_from_strands(self):
        """Sync agents from Strands SDK with graceful degradation"""
        if self.sync_in_progress:
            return
            
        self.sync_in_progress = True
        
        try:
            # Check if Strands SDK is available
            response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/health", timeout=5)
            if response.status_code != 200:
                logger.warning("Strands SDK not available, operating in standalone mode")
                self.strands_sdk_available = False
                return
                
            # Get agents from Strands SDK
            response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=10)
            if response.status_code == 200:
                strands_agents = response.json().get('agents', [])
                logger.info(f"Syncing {len(strands_agents)} agents from Strands SDK")
                
                for strands_agent in strands_agents:
                    agent_id = strands_agent.get('id')
                    if agent_id and agent_id not in self.agents:
                        # Create A2A agent from Strands agent
                        a2a_agent = A2AAgent(
                            id=agent_id,
                            name=strands_agent.get('name', f'Agent {agent_id}'),
                            description=strands_agent.get('description', ''),
                            model=strands_agent.get('model_id', ''),
                            capabilities=strands_agent.get('capabilities', []),
                            strands_agent_id=agent_id,
                            strands_data=strands_agent
                        )
                        self.agents[agent_id] = a2a_agent
                        logger.info(f"Synced agent: {agent_id}")
                
                self.strands_sdk_available = True
                self.last_sync = datetime.now()
                
            else:
                logger.warning(f"Failed to fetch agents from Strands SDK: {response.status_code}")
                self.strands_sdk_available = False
                
        except Exception as e:
            logger.warning(f"Error syncing agents from Strands SDK: {e}")
            self.strands_sdk_available = False
        finally:
            self.sync_in_progress = False
    
    def register_agent(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register an agent for A2A communication"""
        try:
            agent_id = agent_data.get('id', f"a2a_{uuid.uuid4().hex[:8]}")
            
            # Create A2A agent
            a2a_agent = A2AAgent(
                id=agent_id,
                name=agent_data.get('name', f'Agent {agent_id}'),
                description=agent_data.get('description', ''),
                model=agent_data.get('model', ''),
                capabilities=agent_data.get('capabilities', []),
                strands_agent_id=agent_data.get('strands_agent_id'),
                strands_data=agent_data.get('strands_data', {})
            )
            
            self.agents[agent_id] = a2a_agent
            
            logger.info(f"Registered agent: {agent_id}")
            
            return {
                "status": "success",
                "agent_id": agent_id,
                "agent": asdict(a2a_agent)
            }
            
        except Exception as e:
            logger.error(f"Error registering agent: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_agents(self) -> List[Dict[str, Any]]:
        """Get all registered A2A agents"""
        # Trigger sync if needed (non-blocking)
        if not self.sync_in_progress and self.strands_sdk_available:
            threading.Thread(target=self._sync_agents_from_strands, daemon=True).start()
        
        return [
            {
                "id": agent.id,
                "name": agent.name,
                "description": agent.description,
                "model": agent.model,
                "capabilities": agent.capabilities,
                "status": agent.status,
                "a2a_endpoints": agent.a2a_endpoints,
                "created_at": agent.created_at.isoformat() if agent.created_at else None,
                "strands_agent_id": agent.strands_agent_id
            }
            for agent in self.agents.values()
        ]
    
    def send_message(self, from_agent_id: str, to_agent_id: str, content: str) -> Dict[str, Any]:
        """Send a message between agents"""
        try:
            # Validate agents exist
            if from_agent_id not in self.agents:
                return {"status": "error", "error": f"From agent {from_agent_id} not found"}
            
            if to_agent_id not in self.agents:
                return {"status": "error", "error": f"To agent {to_agent_id} not found"}
            
            # Create message
            message = A2AMessage(
                id=str(uuid.uuid4()),
                from_agent_id=from_agent_id,
                to_agent_id=to_agent_id,
                from_agent_name=self.agents[from_agent_id].name,
                to_agent_name=self.agents[to_agent_id].name,
                content=content
            )
            
            # Store message
            self.messages.append(message)
            
            # Add to message history
            if from_agent_id not in self.message_history:
                self.message_history[from_agent_id] = []
            self.message_history[from_agent_id].append(message)
            
            logger.info(f"Message sent from {from_agent_id} to {to_agent_id}")
            
            return {
                "status": "success",
                "message_id": message.id,
                "message": asdict(message)
            }
            
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
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
                "from_agent_name": msg.from_agent_name,
                "to_agent_name": msg.to_agent_name,
                "content": msg.content,
                "type": msg.type,
                "timestamp": msg.timestamp.isoformat(),
                "status": msg.status
            }
            for msg in messages
        ]

# Initialize service
a2a_service = OptimizedA2AService()

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "a2a-service-optimized",
        "version": "2.0.0",
        "agents_registered": len(a2a_service.agents),
        "strands_sdk_available": a2a_service.strands_sdk_available,
        "last_sync": a2a_service.last_sync.isoformat(),
        "timestamp": datetime.now().isoformat()
    })

# Agent management endpoints
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

@app.route('/api/a2a/agents', methods=['POST'])
def register_agent():
    """Register a new A2A agent"""
    try:
        agent_data = request.get_json()
        result = a2a_service.register_agent(agent_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

# Message endpoints
@app.route('/api/a2a/messages', methods=['POST'])
def send_message():
    """Send a message between agents"""
    try:
        data = request.get_json()
        from_agent_id = data.get('from_agent_id')
        to_agent_id = data.get('to_agent_id')
        content = data.get('content')
        
        if not all([from_agent_id, to_agent_id, content]):
            return jsonify({"status": "error", "error": "Missing required fields"}), 400
        
        result = a2a_service.send_message(from_agent_id, to_agent_id, content)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/api/a2a/messages', methods=['GET'])
def get_messages():
    """Get message history"""
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

if __name__ == '__main__':
    logger.info("🚀 Starting Optimized A2A Service...")
    logger.info(f"📍 Port: {A2A_SERVICE_PORT}")
    logger.info("🎯 Graceful degradation enabled")
    
    app.run(host='0.0.0.0', port=A2A_SERVICE_PORT, debug=True)

