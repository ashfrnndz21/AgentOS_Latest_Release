#!/usr/bin/env python3
"""
Unified Agent Service
Consolidates all agent management into a single service
Replaces: A2A Service, Main Ollama System, Strands SDK
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid
import json
import requests
from datetime import datetime
from typing import Dict, List, Optional

app = Flask(__name__)
CORS(app)

# Database configuration
DATABASE_PATH = 'unified_agents.db'

def init_database():
    """Initialize the unified agents database"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            model_id TEXT NOT NULL,
            host TEXT DEFAULT 'http://localhost:11434',
            system_prompt TEXT,
            tools TEXT, -- JSON array
            capabilities TEXT, -- JSON array
            status TEXT DEFAULT 'active',
            framework TEXT, -- 'ollama', 'strands', 'a2a'
            a2a_enabled BOOLEAN DEFAULT 0,
            a2a_agent_id TEXT, -- A2A-specific ID
            ollama_config TEXT, -- JSON object
            strands_config TEXT, -- JSON object
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS a2a_messages (
            id TEXT PRIMARY KEY,
            from_agent_id TEXT NOT NULL,
            to_agent_id TEXT NOT NULL,
            content TEXT NOT NULL,
            message_type TEXT DEFAULT 'text',
            status TEXT DEFAULT 'sent',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (from_agent_id) REFERENCES agents (id),
            FOREIGN KEY (to_agent_id) REFERENCES agents (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("[Unified Agent Service] Database initialized")

@app.route('/api/unified/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Unified Agent Service",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/unified/agents', methods=['GET'])
def get_all_agents():
    """Get all agents from all systems"""
    try:
        # Get agents from all sources
        ollama_agents = []
        strands_agents = []
        a2a_agents = []
        
        # Get Ollama agents
        try:
            ollama_response = requests.get('http://localhost:5002/api/agents/ollama', timeout=5)
            if ollama_response.status_code == 200:
                ollama_data = ollama_response.json()
                ollama_agents = ollama_data.get('agents', [])
        except:
            pass
        
        # Get Strands agents
        try:
            strands_response = requests.get('http://localhost:5006/api/strands-sdk/agents', timeout=5)
            if strands_response.status_code == 200:
                strands_data = strands_response.json()
                strands_agents = strands_data.get('agents', [])
        except:
            pass
        
        # Get A2A agents
        try:
            a2a_response = requests.get('http://localhost:5008/api/a2a/agents', timeout=5)
            if a2a_response.status_code == 200:
                a2a_data = a2a_response.json()
                a2a_agents = a2a_data.get('agents', [])
        except:
            pass
        
        # Transform and categorize agents
        all_agents = []
        
        # Add Ollama agents (basic type)
        for agent in ollama_agents:
            all_agents.append({
                "id": agent.get('id', str(uuid.uuid4())),
                "name": agent.get('name', 'Unnamed Agent'),
                "description": agent.get('description', ''),
                "model_id": agent.get('model', 'unknown'),
                "framework": "ollama",
                "status": agent.get('status', 'active'),
                "a2a_enabled": False,
                "created_at": agent.get('created_at', datetime.now().isoformat()),
                "tools": agent.get('tools', []),
                "capabilities": agent.get('capabilities', [])
            })
        
        # Add Strands agents
        for agent in strands_agents:
            all_agents.append({
                "id": agent.get('id', str(uuid.uuid4())),
                "name": agent.get('name', 'Unnamed Agent'),
                "description": agent.get('description', ''),
                "model_id": agent.get('model_id', agent.get('model', 'unknown')),
                "framework": "strands",
                "status": agent.get('status', 'active'),
                "a2a_enabled": agent.get('a2a_status', {}).get('registered', False),
                "created_at": agent.get('created_at', datetime.now().isoformat()),
                "tools": agent.get('tools', []),
                "capabilities": agent.get('capabilities', [])
            })
        
        # Add A2A agents
        for agent in a2a_agents:
            all_agents.append({
                "id": agent.get('id', str(uuid.uuid4())),
                "name": agent.get('name', 'Unnamed Agent'),
                "description": agent.get('description', ''),
                "model_id": agent.get('model', 'unknown'),
                "framework": "a2a",
                "status": agent.get('status', 'active'),
                "a2a_enabled": True,
                "created_at": agent.get('registered_at', datetime.now().isoformat()),
                "tools": agent.get('tools', []),
                "capabilities": agent.get('capabilities', [])
            })
        
        return jsonify({
            "agents": all_agents,
            "count": len(all_agents),
            "status": "success",
            "sources": {
                "ollama": len(ollama_agents),
                "strands": len(strands_agents),
                "a2a": len(a2a_agents)
            }
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "agents": [],
            "count": 0,
            "status": "error"
        }), 500

@app.route('/api/unified/agents/ollama', methods=['GET'])
def get_ollama_agents():
    """Get only Ollama agents"""
    try:
        response = requests.get('http://localhost:5002/api/agents/ollama', timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            return jsonify({"agents": [], "count": 0, "status": "error"})
    except:
        return jsonify({"agents": [], "count": 0, "status": "error"})

@app.route('/api/unified/agents/strands', methods=['GET'])
def get_strands_agents():
    """Get only Strands agents"""
    try:
        response = requests.get('http://localhost:5006/api/strands-sdk/agents', timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            return jsonify({"agents": [], "count": 0, "status": "error"})
    except:
        return jsonify({"agents": [], "count": 0, "status": "error"})

@app.route('/api/unified/agents/a2a', methods=['GET'])
def get_a2a_agents():
    """Get only A2A agents"""
    try:
        response = requests.get('http://localhost:5008/api/a2a/agents', timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            return jsonify({"agents": [], "count": 0, "status": "error"})
    except:
        return jsonify({"agents": [], "count": 0, "status": "error"})

@app.route('/api/unified/agents/<agent_id>/register-a2a', methods=['POST'])
def register_agent_a2a(agent_id):
    """Register an agent for A2A communication"""
    try:
        # Get agent details first
        agent_data = None
        
        # Try to find agent in Strands SDK
        try:
            strands_response = requests.get(f'http://localhost:5006/api/strands-sdk/agents/{agent_id}', timeout=5)
            if strands_response.status_code == 200:
                agent_data = strands_response.json()
        except:
            pass
        
        if not agent_data:
            return jsonify({"error": "Agent not found"}), 404
        
        # Register with A2A service
        a2a_response = requests.post('http://localhost:5008/api/a2a/agents', json={
            "id": agent_id,
            "name": agent_data.get('name'),
            "description": agent_data.get('description'),
            "model": agent_data.get('model_id', agent_data.get('model')),
            "capabilities": agent_data.get('tools', [])
        }, timeout=10)
        
        if a2a_response.status_code == 200:
            # Also register with Frontend Bridge
            try:
                bridge_response = requests.post('http://localhost:5012/register', json={
                    "id": agent_id,
                    "name": agent_data.get('name'),
                    "description": agent_data.get('description'),
                    "capabilities": agent_data.get('tools', [])
                }, timeout=5)
            except:
                pass  # Bridge registration is optional
            
            return jsonify({
                "success": True,
                "message": "Agent registered for A2A communication",
                "agent_id": agent_id
            })
        else:
            return jsonify({
                "error": "Failed to register agent with A2A service",
                "details": a2a_response.text
            }), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/unified/agents/<agent_id>/unregister-a2a', methods=['POST'])
def unregister_agent_a2a(agent_id):
    """Unregister an agent from A2A communication"""
    try:
        # Remove from A2A service
        a2a_response = requests.delete(f'http://localhost:5008/api/a2a/agents/{agent_id}', timeout=5)
        
        # Remove from Frontend Bridge
        try:
            bridge_response = requests.delete(f'http://localhost:5012/agent/{agent_id}', timeout=5)
        except:
            pass  # Bridge removal is optional
        
        return jsonify({
            "success": True,
            "message": "Agent unregistered from A2A communication",
            "agent_id": agent_id
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/unified/agents/<agent_id>', methods=['DELETE'])
def delete_agent(agent_id):
    """Delete an agent from all systems"""
    try:
        deleted_from = []
        
        # Delete from Strands SDK
        try:
            strands_response = requests.delete(f'http://localhost:5006/api/strands-sdk/agents/{agent_id}', timeout=5)
            if strands_response.status_code == 200:
                deleted_from.append("strands")
        except:
            pass
        
        # Delete from A2A service
        try:
            a2a_response = requests.delete(f'http://localhost:5008/api/a2a/agents/{agent_id}', timeout=5)
            if a2a_response.status_code == 200:
                deleted_from.append("a2a")
        except:
            pass
        
        # Delete from Frontend Bridge
        try:
            bridge_response = requests.delete(f'http://localhost:5012/agent/{agent_id}', timeout=5)
            if bridge_response.status_code == 200:
                deleted_from.append("bridge")
        except:
            pass
        
        return jsonify({
            "success": True,
            "message": f"Agent deleted from: {', '.join(deleted_from)}",
            "agent_id": agent_id,
            "deleted_from": deleted_from
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("[Unified Agent Service] Starting Unified Agent Service...")
    print("[Unified Agent Service] Port: 5015")
    
    # Initialize database
    init_database()
    
    # Start the server
    app.run(
        host='0.0.0.0',
        port=5015,
        debug=False
    )