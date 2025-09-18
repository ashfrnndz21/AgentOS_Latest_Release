#!/usr/bin/env python3
"""
A2A (Agent-to-Agent) Service
Handles real-time communication between agents
"""

import asyncio
import json
import uuid
import sqlite3
import requests
from datetime import datetime
from typing import Dict, List, Optional, Any
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import threading
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# A2A Database
A2A_DB = "a2a_communication.db"

def init_a2a_database():
    """Initialize the A2A communication database"""
    conn = sqlite3.connect(A2A_DB)
    cursor = conn.cursor()
    
    # Create agents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS a2a_agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            model TEXT,
            capabilities TEXT,
            status TEXT DEFAULT 'active',
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS a2a_messages (
            id TEXT PRIMARY KEY,
            from_agent_id TEXT NOT NULL,
            to_agent_id TEXT NOT NULL,
            content TEXT NOT NULL,
            message_type TEXT DEFAULT 'message',
            status TEXT DEFAULT 'sent',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (from_agent_id) REFERENCES a2a_agents (id),
            FOREIGN KEY (to_agent_id) REFERENCES a2a_agents (id)
        )
    ''')
    
    # Create connections table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS a2a_connections (
            id TEXT PRIMARY KEY,
            from_agent_id TEXT NOT NULL,
            to_agent_id TEXT NOT NULL,
            connection_type TEXT DEFAULT 'message',
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (from_agent_id) REFERENCES a2a_agents (id),
            FOREIGN KEY (to_agent_id) REFERENCES a2a_agents (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("📊 A2A database initialized")

class A2AAgentRegistry:
    """Manages agent registration and discovery"""
    
    def __init__(self):
        self.agents: Dict[str, Dict[str, Any]] = {}
        self.connections: Dict[str, List[str]] = {}  # agent_id -> list of connected agent_ids
        self.load_agents_from_db()
    
    def load_agents_from_db(self):
        """Load agents from database on startup"""
        try:
            conn = sqlite3.connect(A2A_DB)
            cursor = conn.cursor()
            
            # Load agents
            cursor.execute("SELECT id, name, description, model, capabilities, status, registered_at, last_seen FROM a2a_agents")
            rows = cursor.fetchall()
            
            for row in rows:
                agent_id, name, description, model, capabilities, status, registered_at, last_seen = row
                self.agents[agent_id] = {
                    "id": agent_id,
                    "name": name,
                    "description": description or "",
                    "model": model or "",
                    "capabilities": json.loads(capabilities) if capabilities else [],
                    "status": status or "active",
                    "registered_at": registered_at or datetime.now().isoformat(),
                    "last_seen": last_seen or datetime.now().isoformat()
                }
                self.connections[agent_id] = []
            
            # Load connections
            cursor.execute("SELECT from_agent_id, to_agent_id FROM a2a_connections WHERE is_active = 1")
            connection_rows = cursor.fetchall()
            
            for from_agent_id, to_agent_id in connection_rows:
                if from_agent_id in self.connections and to_agent_id not in self.connections[from_agent_id]:
                    self.connections[from_agent_id].append(to_agent_id)
                if to_agent_id in self.connections and from_agent_id not in self.connections[to_agent_id]:
                    self.connections[to_agent_id].append(from_agent_id)
            
            conn.close()
            print(f"📊 Loaded {len(self.agents)} agents from A2A database")
        except Exception as e:
            print(f"⚠️ Failed to load agents from database: {e}")
    
    def register_agent(self, agent_id: str, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register an agent for A2A communication"""
        try:
            agent_info = {
                "id": agent_id,
                "name": agent_data.get("name", f"Agent {agent_id}"),
                "description": agent_data.get("description", ""),
                "model": agent_data.get("model", ""),
                "capabilities": agent_data.get("capabilities", []),
                "status": "active",
                "registered_at": datetime.now().isoformat(),
                "last_seen": datetime.now().isoformat()
            }
            
            # Save to database
            conn = sqlite3.connect(A2A_DB)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO a2a_agents 
                (id, name, description, model, capabilities, status, registered_at, last_seen)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                agent_id,
                agent_info["name"],
                agent_info["description"],
                agent_info["model"],
                json.dumps(agent_info["capabilities"]),
                agent_info["status"],
                agent_info["registered_at"],
                agent_info["last_seen"]
            ))
            
            conn.commit()
            conn.close()
            
            # Update in-memory registry
            self.agents[agent_id] = agent_info
            self.connections[agent_id] = []
            
            print(f"🤖 A2A Agent registered: {agent_info['name']} ({agent_id})")
            
            return {
                "status": "success",
                "agent": agent_info,
                "message": f"Agent {agent_info['name']} registered successfully"
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_agents(self) -> List[Dict[str, Any]]:
        """Get list of all registered agents"""
        return list(self.agents.values())
    
    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get specific agent by ID"""
        return self.agents.get(agent_id)
    
    def connect_agents(self, from_agent_id: str, to_agent_id: str) -> Dict[str, Any]:
        """Create a connection between two agents"""
        try:
            if from_agent_id not in self.agents or to_agent_id not in self.agents:
                return {
                    "status": "error",
                    "error": "One or both agents not found"
                }
            
            if to_agent_id not in self.connections[from_agent_id]:
                self.connections[from_agent_id].append(to_agent_id)
            
            if from_agent_id not in self.connections[to_agent_id]:
                self.connections[to_agent_id].append(from_agent_id)
            
            print(f"🔗 A2A Connection created: {from_agent_id} <-> {to_agent_id}")
            
            return {
                "status": "success",
                "connection": {
                    "from": from_agent_id,
                    "to": to_agent_id,
                    "created_at": datetime.now().isoformat()
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

class A2AMessageRouter:
    """Handles message routing between agents"""
    
    def __init__(self, agent_registry: A2AAgentRegistry):
        self.agent_registry = agent_registry
        self.message_queue: List[Dict[str, Any]] = []
        self.message_history: List[Dict[str, Any]] = []
    
    def send_message(self, from_agent_id: str, to_agent_id: str, content: str, message_type: str = "message") -> Dict[str, Any]:
        """Send a message from one agent to another"""
        try:
            message_id = str(uuid.uuid4())
            timestamp = datetime.now().isoformat()
            
            # Check if agents exist
            from_agent = self.agent_registry.get_agent(from_agent_id)
            to_agent = self.agent_registry.get_agent(to_agent_id)
            
            if not from_agent or not to_agent:
                return {
                    "status": "error",
                    "error": "One or both agents not found"
                }
            
            # Create message
            message = {
                "id": message_id,
                "from_agent_id": from_agent_id,
                "to_agent_id": to_agent_id,
                "from_agent_name": from_agent["name"],
                "to_agent_name": to_agent["name"],
                "content": content,
                "type": message_type,
                "timestamp": timestamp,
                "status": "sent"
            }
            
            # Add to message history
            self.message_history.append(message)
            
            # Emit real-time update via WebSocket
            socketio.emit('a2a_message', message, room=f"agent_{to_agent_id}")
            socketio.emit('a2a_message', message, room=f"agent_{from_agent_id}")
            
            print(f"📨 A2A Message sent: {from_agent['name']} -> {to_agent['name']}: {content[:50]}...")
            
            return {
                "status": "success",
                "message": message
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_message_history(self, agent_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get message history, optionally filtered by agent"""
        if agent_id:
            return [msg for msg in self.message_history 
                   if msg["from_agent_id"] == agent_id or msg["to_agent_id"] == agent_id]
        return self.message_history

# Initialize services
agent_registry = A2AAgentRegistry()
message_router = A2AMessageRouter(agent_registry)

# WebSocket events
@socketio.on('connect')
def handle_connect():
    print(f"🔌 A2A WebSocket connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"🔌 A2A WebSocket disconnected: {request.sid}")

@socketio.on('join_agent_room')
def handle_join_agent_room(data):
    agent_id = data.get('agent_id')
    if agent_id:
        join_room(f"agent_{agent_id}")
        print(f"🤖 Agent {agent_id} joined room")

@socketio.on('leave_agent_room')
def handle_leave_agent_room(data):
    agent_id = data.get('agent_id')
    if agent_id:
        leave_room(f"agent_{agent_id}")
        print(f"🤖 Agent {agent_id} left room")

# REST API endpoints
@app.route('/api/a2a/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "A2A Communication Service",
        "timestamp": datetime.now().isoformat(),
        "agents_registered": len(agent_registry.agents)
    })

@app.route('/api/a2a/agents', methods=['GET'])
def get_agents():
    """Get list of all registered agents"""
    try:
        agents = agent_registry.get_agents()
        return jsonify({
            "status": "success",
            "agents": agents,
            "count": len(agents)
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/a2a/agents', methods=['POST'])
def register_agent():
    """Register a new agent for A2A communication"""
    try:
        data = request.get_json()
        agent_id = data.get('id') or str(uuid.uuid4())
        
        result = agent_registry.register_agent(agent_id, data)
        
        if result["status"] == "success":
            return jsonify(result), 201
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/a2a/agents/<agent_id>', methods=['GET'])
def get_agent(agent_id):
    """Get specific agent by ID"""
    try:
        agent = agent_registry.get_agent(agent_id)
        if agent:
            return jsonify({
                "status": "success",
                "agent": agent
            })
        else:
            return jsonify({
                "status": "error",
                "error": "Agent not found"
            }), 404
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/a2a/agents/<agent_id>', methods=['DELETE'])
def delete_agent(agent_id):
    """Delete an agent from A2A registry"""
    try:
        agent = agent_registry.get_agent(agent_id)
        if not agent:
            return jsonify({
                "status": "error",
                "error": "Agent not found"
            }), 404
        
        # Remove from registry
        agent_name = agent["name"]
        del agent_registry.agents[agent_id]
        
        # Remove from connections
        if agent_id in agent_registry.connections:
            del agent_registry.connections[agent_id]
        
        # Remove connections to this agent
        for other_agent_id, connections in agent_registry.connections.items():
            if agent_id in connections:
                connections.remove(agent_id)
        
        # Clean up database
        conn = sqlite3.connect(A2A_DB)
        cursor = conn.cursor()
        
        # Delete agent
        cursor.execute("DELETE FROM a2a_agents WHERE id = ?", (agent_id,))
        
        # Delete related messages
        cursor.execute("DELETE FROM a2a_messages WHERE from_agent_id = ? OR to_agent_id = ?", (agent_id, agent_id))
        
        # Delete related connections
        cursor.execute("DELETE FROM a2a_connections WHERE from_agent_id = ? OR to_agent_id = ?", (agent_id, agent_id))
        
        conn.commit()
        conn.close()
        
        print(f"🗑️ A2A Agent deleted: {agent_name} ({agent_id})")
        
        return jsonify({
            "status": "success",
            "message": f"Agent {agent_name} deleted successfully"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/a2a/connections', methods=['POST'])
def create_connection():
    """Create a connection between two agents"""
    try:
        data = request.get_json()
        from_agent_id = data.get('from_agent_id')
        to_agent_id = data.get('to_agent_id')
        
        if not from_agent_id or not to_agent_id:
            return jsonify({
                "status": "error",
                "error": "from_agent_id and to_agent_id are required"
            }), 400
        
        result = agent_registry.connect_agents(from_agent_id, to_agent_id)
        
        if result["status"] == "success":
            return jsonify(result), 201
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/a2a/messages', methods=['POST'])
def send_message():
    """Send a message between agents"""
    try:
        data = request.get_json()
        from_agent_id = data.get('from_agent_id')
        to_agent_id = data.get('to_agent_id')
        content = data.get('content')
        message_type = data.get('type', 'message')
        
        if not all([from_agent_id, to_agent_id, content]):
            return jsonify({
                "status": "error",
                "error": "from_agent_id, to_agent_id, and content are required"
            }), 400
        
        result = message_router.send_message(from_agent_id, to_agent_id, content, message_type)
        
        if result["status"] == "success":
            return jsonify(result), 201
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/a2a/messages/history', methods=['GET'])
def get_message_history():
    """Get message history"""
    try:
        agent_id = request.args.get('agent_id')
        history = message_router.get_message_history(agent_id)
        
        return jsonify({
            "status": "success",
            "messages": history,
            "count": len(history)
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/a2a/health-check', methods=['GET'])
def health_check_agents():
    """Check if A2A registered agents still exist in their source services"""
    try:
        orphaned_agents = []
        healthy_agents = []
        
        for agent_id, agent in agent_registry.agents.items():
            # Check if agent exists in source services
            source_found = False
            
            # Check Strands SDK service (port 5006)
            try:
                response = requests.get("http://localhost:5006/api/strands-sdk/agents", timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    agents = data.get('agents', [])
                    # Check if agent exists in the list
                    for agent in agents:
                        if agent.get('id') == agent_id:
                            source_found = True
                            break
            except:
                pass
            
            # Check Strands Native service (port 5004)
            if not source_found:
                try:
                    response = requests.get(f"http://localhost:5004/api/strands/agents/{agent_id}", timeout=5)
                    if response.status_code == 200:
                        source_found = True
                except:
                    pass
            
            # Check Ollama service (port 5005)
            if not source_found:
                try:
                    response = requests.get(f"http://localhost:5005/api/agents/ollama/{agent_id}", timeout=5)
                    if response.status_code == 200:
                        source_found = True
                except:
                    pass
            
            if source_found:
                healthy_agents.append(agent)
            else:
                orphaned_agents.append(agent)
        
        return jsonify({
            "status": "success",
            "total_agents": len(agent_registry.agents),
            "healthy_agents": len(healthy_agents),
            "orphaned_agents": len(orphaned_agents),
            "healthy_agent_list": healthy_agents,
            "orphaned_agent_list": orphaned_agents
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/api/a2a/cleanup', methods=['POST'])
def cleanup_orphaned_agents():
    """Remove orphaned A2A agents that no longer exist in source services"""
    try:
        orphaned_count = 0
        cleaned_agents = []
        
        for agent_id, agent in list(agent_registry.agents.items()):
            # Check if agent exists in source services
            source_found = False
            
            # Check Strands SDK service (port 5006)
            try:
                response = requests.get("http://localhost:5006/api/strands-sdk/agents", timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    agents = data.get('agents', [])
                    # Check if agent exists in the list
                    for agent in agents:
                        if agent.get('id') == agent_id:
                            source_found = True
                            break
            except:
                pass
            
            # Check Strands Native service (port 5004)
            if not source_found:
                try:
                    response = requests.get(f"http://localhost:5004/api/strands/agents/{agent_id}", timeout=5)
                    if response.status_code == 200:
                        source_found = True
                except:
                    pass
            
            # Check Ollama service (port 5005)
            if not source_found:
                try:
                    response = requests.get(f"http://localhost:5005/api/agents/ollama/{agent_id}", timeout=5)
                    if response.status_code == 200:
                        source_found = True
                except:
                    pass
            
            # If not found in any source service, remove from A2A
            if not source_found:
                agent_name = agent["name"]
                cleaned_agents.append(agent_name)
                
                # Remove from registry
                del agent_registry.agents[agent_id]
                
                # Remove from connections
                if agent_id in agent_registry.connections:
                    del agent_registry.connections[agent_id]
                
                # Remove connections to this agent
                for other_agent_id, connections in agent_registry.connections.items():
                    if agent_id in connections:
                        connections.remove(agent_id)
                
                # Clean up database
                conn = sqlite3.connect(A2A_DB)
                cursor = conn.cursor()
                
                # Delete agent
                cursor.execute("DELETE FROM a2a_agents WHERE id = ?", (agent_id,))
                
                # Delete related messages
                cursor.execute("DELETE FROM a2a_messages WHERE from_agent_id = ? OR to_agent_id = ?", (agent_id, agent_id))
                
                # Delete related connections
                cursor.execute("DELETE FROM a2a_connections WHERE from_agent_id = ? OR to_agent_id = ?", (agent_id, agent_id))
                
                conn.commit()
                conn.close()
                
                orphaned_count += 1
                print(f"🧹 Cleaned up orphaned A2A agent: {agent_name} ({agent_id})")
        
        return jsonify({
            "status": "success",
            "orphaned_agents_removed": orphaned_count,
            "cleaned_agents": cleaned_agents,
            "remaining_agents": len(agent_registry.agents)
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

def periodic_cleanup():
    """Periodic cleanup job to remove orphaned A2A agents"""
    while True:
        try:
            time.sleep(300)  # Run every 5 minutes
            print("🧹 Running periodic A2A cleanup...")
            
            # Check for orphaned agents
            orphaned_count = 0
            for agent_id, agent in list(agent_registry.agents.items()):
                source_found = False
                
                # Check Strands SDK service (port 5006)
                try:
                    response = requests.get("http://localhost:5006/api/strands-sdk/agents", timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        agents = data.get('agents', [])
                        # Check if agent exists in the list
                        for agent in agents:
                            if agent.get('id') == agent_id:
                                source_found = True
                                break
                except:
                    pass
                
                # Check Strands Native service (port 5004)
                if not source_found:
                    try:
                        response = requests.get(f"http://localhost:5004/api/strands/agents/{agent_id}", timeout=5)
                        if response.status_code == 200:
                            source_found = True
                    except:
                        pass
                
                # Check Ollama service (port 5005)
                if not source_found:
                    try:
                        response = requests.get(f"http://localhost:5005/api/agents/ollama/{agent_id}", timeout=5)
                        if response.status_code == 200:
                            source_found = True
                    except:
                        pass
                
                # If not found in any source service, remove from A2A
                if not source_found:
                    agent_name = agent["name"]
                    orphaned_count += 1
                    
                    # Remove from registry
                    del agent_registry.agents[agent_id]
                    
                    # Remove from connections
                    if agent_id in agent_registry.connections:
                        del agent_registry.connections[agent_id]
                    
                    # Remove connections to this agent
                    for other_agent_id, connections in agent_registry.connections.items():
                        if agent_id in connections:
                            connections.remove(agent_id)
                    
                    # Clean up database
                    conn = sqlite3.connect(A2A_DB)
                    cursor = conn.cursor()
                    
                    # Delete agent
                    cursor.execute("DELETE FROM a2a_agents WHERE id = ?", (agent_id,))
                    
                    # Delete related messages
                    cursor.execute("DELETE FROM a2a_messages WHERE from_agent_id = ? OR to_agent_id = ?", (agent_id, agent_id))
                    
                    # Delete related connections
                    cursor.execute("DELETE FROM a2a_connections WHERE from_agent_id = ? OR to_agent_id = ?", (agent_id, agent_id))
                    
                    conn.commit()
                    conn.close()
                    
                    print(f"🧹 Cleaned up orphaned A2A agent: {agent_name} ({agent_id})")
            
            if orphaned_count > 0:
                print(f"🧹 Periodic cleanup completed: {orphaned_count} orphaned agents removed")
            else:
                print("🧹 Periodic cleanup completed: No orphaned agents found")
                
        except Exception as e:
            print(f"🧹 Periodic cleanup error: {e}")

if __name__ == '__main__':
    print("🚀 Starting A2A Communication Service...")
    print("📍 Port: 5008")
    print("🔗 WebSocket support enabled")
    print("🤖 Agent registry initialized")
    print("📨 Message router ready")
    print("🧹 Periodic cleanup enabled (every 5 minutes)")
    
    # Initialize database
    init_a2a_database()
    
    # Start periodic cleanup in background thread
    cleanup_thread = threading.Thread(target=periodic_cleanup, daemon=True)
    cleanup_thread.start()
    
    socketio.run(app, host='0.0.0.0', port=5008, debug=False, allow_unsafe_werkzeug=True)
