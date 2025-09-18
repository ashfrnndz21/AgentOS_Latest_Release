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

def get_agent_by_id(agent_id: str) -> Optional[Dict]:
    """Get agent by ID"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM agents WHERE id = ?', (agent_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    columns = [description[0] for description in cursor.description]
    return dict(zip(columns, row))

def update_agent_last_seen(agent_id: str):
    """Update agent last seen timestamp"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE agents SET last_seen = CURRENT_TIMESTAMP WHERE id = ?', (agent_id,))
    conn.commit()
    conn.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "service": "unified-agent-service",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/agents', methods=['GET'])
def get_agents():
    """Get all agents with optional filtering"""
    framework = request.args.get('framework')
    a2a_enabled = request.args.get('a2a_enabled')
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    query = 'SELECT * FROM agents WHERE 1=1'
    params = []
    
    if framework:
        query += ' AND framework = ?'
        params.append(framework)
    
    if a2a_enabled is not None:
        query += ' AND a2a_enabled = ?'
        params.append(a2a_enabled == 'true')
    
    query += ' ORDER BY created_at DESC'
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    columns = [description[0] for description in cursor.description]
    agents = []
    
    for row in rows:
        agent = dict(zip(columns, row))
        # Parse JSON fields
        agent['tools'] = json.loads(agent['tools']) if agent['tools'] else []
        agent['capabilities'] = json.loads(agent['capabilities']) if agent['capabilities'] else []
        agent['ollama_config'] = json.loads(agent['ollama_config']) if agent['ollama_config'] else {}
        agent['strands_config'] = json.loads(agent['strands_config']) if agent['strands_config'] else {}
        agents.append(agent)
    
    return jsonify({
        "agents": agents,
        "count": len(agents),
        "status": "success"
    })

@app.route('/api/agents', methods=['POST'])
def create_agent():
    """Create a new agent"""
    try:
        data = request.get_json()
        print(f"[Unified Agent Service] Creating agent: {data.get('name')}")
        
        # Validate required fields
        if not data.get('name') or not data.get('model_id'):
            return jsonify({'error': 'Name and model_id are required'}), 400
        
        # Generate agent ID
        agent_id = str(uuid.uuid4())
        
        # Determine framework
        framework = data.get('framework', 'ollama')
        if 'strands' in data.get('name', '').lower() or data.get('strands_config'):
            framework = 'strands'
        
        # Prepare agent data
        agent_data = {
            'id': agent_id,
            'name': data.get('name'),
            'description': data.get('description', ''),
            'model_id': data.get('model_id'),
            'host': data.get('host', 'http://localhost:11434'),
            'system_prompt': data.get('system_prompt', f"You are {data.get('name')}, an AI agent."),
            'tools': json.dumps(data.get('tools', [])),
            'capabilities': json.dumps(data.get('capabilities', data.get('tools', []))),
            'status': 'active',
            'framework': framework,
            'a2a_enabled': data.get('a2a_enabled', False),
            'ollama_config': json.dumps(data.get('ollama_config', {})),
            'strands_config': json.dumps(data.get('strands_config', {}))
        }
        
        # Store in database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO agents (
                id, name, description, model_id, host, system_prompt,
                tools, capabilities, status, framework, a2a_enabled,
                ollama_config, strands_config
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            agent_data['id'], agent_data['name'], agent_data['description'],
            agent_data['model_id'], agent_data['host'], agent_data['system_prompt'],
            agent_data['tools'], agent_data['capabilities'], agent_data['status'],
            agent_data['framework'], agent_data['a2a_enabled'],
            agent_data['ollama_config'], agent_data['strands_config']
        ))
        
        conn.commit()
        conn.close()
        
        print(f"[Unified Agent Service] Agent created: {agent_id}")
        
        # If A2A enabled, register with A2A service
        a2a_result = None
        if data.get('a2a_enabled', False):
            try:
                a2a_payload = {
                    'name': data.get('name'),
                    'description': data.get('description', ''),
                    'model': data.get('model_id'),
                    'capabilities': data.get('tools', []),
                    'strands_agent_id': agent_id
                }
                
                a2a_response = requests.post(
                    'http://localhost:5008/api/a2a/agents',
                    json=a2a_payload,
                    timeout=10
                )
                
                if a2a_response.status_code in [200, 201]:
                    a2a_result = a2a_response.json()
                    # Update agent with A2A ID
                    conn = sqlite3.connect(DATABASE_PATH)
                    cursor = conn.cursor()
                    cursor.execute(
                        'UPDATE agents SET a2a_agent_id = ? WHERE id = ?',
                        (a2a_result.get('agent', {}).get('id'), agent_id)
                    )
                    conn.commit()
                    conn.close()
                    print(f"[Unified Agent Service] A2A registration successful: {a2a_result.get('agent', {}).get('id')}")
                else:
                    print(f"[Unified Agent Service] A2A registration failed: {a2a_response.status_code}")
                    
            except Exception as e:
                print(f"[Unified Agent Service] A2A registration error: {str(e)}")
        
        return jsonify({
            'id': agent_id,
            'message': 'Agent created successfully',
            'framework': framework,
            'a2a_registration': a2a_result
        })
        
    except Exception as e:
        print(f"[Unified Agent Service] Error creating agent: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/agents/<agent_id>', methods=['DELETE'])
def delete_agent(agent_id: str):
    """Delete an agent from all systems"""
    try:
        print(f"[Unified Agent Service] Deleting agent: {agent_id}")
        
        # Get agent info before deletion
        agent = get_agent_by_id(agent_id)
        if not agent:
            return jsonify({'error': 'Agent not found'}), 404
        
        # Delete from A2A service if registered
        if agent.get('a2a_agent_id'):
            try:
                requests.delete(f"http://localhost:5008/api/a2a/agents/{agent['a2a_agent_id']}")
                print(f"[Unified Agent Service] Deleted from A2A: {agent['a2a_agent_id']}")
            except Exception as e:
                print(f"[Unified Agent Service] A2A deletion error: {str(e)}")
        
        # Delete from database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM agents WHERE id = ?', (agent_id,))
        cursor.execute('DELETE FROM a2a_messages WHERE from_agent_id = ? OR to_agent_id = ?', (agent_id, agent_id))
        conn.commit()
        conn.close()
        
        print(f"[Unified Agent Service] Agent deleted: {agent_id}")
        return jsonify({'message': 'Agent deleted successfully'})
        
    except Exception as e:
        print(f"[Unified Agent Service] Error deleting agent: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/agents/a2a', methods=['GET'])
def get_a2a_agents():
    """Get agents with A2A enabled"""
    return get_agents()  # Will filter by a2a_enabled=true

@app.route('/api/agents/strands', methods=['GET'])
def get_strands_agents():
    """Get Strands agents"""
    return get_agents()  # Will filter by framework=strands

@app.route('/api/agents/ollama', methods=['GET'])
def get_ollama_agents():
    """Get Ollama agents"""
    return get_agents()  # Will filter by framework=ollama

if __name__ == '__main__':
    print("[Unified Agent Service] Starting Unified Agent Service...")
    print("[Unified Agent Service] Port: 5001")
    
    init_database()
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )
