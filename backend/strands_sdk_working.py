#!/usr/bin/env python3
"""
Working Strands SDK Agent Service
Fixed version that actually starts
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid
import json
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE_PATH = "strands_sdk_agents.db"

def init_database():
    """Initialize the database"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS strands_sdk_agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                model_id TEXT NOT NULL,
                host TEXT DEFAULT 'http://localhost:11434',
                system_prompt TEXT,
                tools TEXT,
                ollama_config TEXT,
                sdk_version TEXT DEFAULT '1.0.0',
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print("[Strands SDK] Database initialized successfully")
    except Exception as e:
        print(f"[Strands SDK] Database init error: {e}")

@app.route('/api/strands-sdk/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "sdk_available": True,
        "sdk_type": "working-strands",
        "service": "strands-sdk-api",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/strands-sdk/agents', methods=['GET'])
def get_agents():
    """Get all Strands SDK agents"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM strands_sdk_agents ORDER BY created_at DESC')
        rows = cursor.fetchall()
        conn.close()
        
        columns = [description[0] for description in cursor.description]
        agents = []
        
        for row in rows:
            agent = dict(zip(columns, row))
            agent['tools'] = json.loads(agent['tools']) if agent['tools'] else []
            agent['ollama_config'] = json.loads(agent['ollama_config']) if agent['ollama_config'] else {}
            agents.append(agent)
        
        print(f"[Strands SDK] Listed {len(agents)} agents")
        return jsonify({
            "agents": agents,
            "count": len(agents),
            "status": "success"
        })
        
    except Exception as e:
        print(f"[Strands SDK] Error getting agents: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/strands-sdk/agents', methods=['POST'])
def create_strands_agent():
    """Create a new Strands SDK agent"""
    try:
        data = request.get_json()
        print(f"[Strands SDK] Creating agent: {data.get('name')}")
        
        # Validate required fields
        if not data.get('name') or not data.get('model_id'):
            return jsonify({'error': 'Name and model_id are required'}), 400
        
        # Generate agent ID
        agent_id = str(uuid.uuid4())
        
        # Store in database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO strands_sdk_agents (
                id, name, description, model_id, host, system_prompt, 
                tools, ollama_config, sdk_version, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            agent_id,
            data.get('name'),
            data.get('description', ''),
            data.get('model_id'),
            data.get('host', 'http://localhost:11434'),
            data.get('system_prompt', ''),
            json.dumps(data.get('tools', [])),
            json.dumps(data.get('ollama_config', {})),
            '1.0.0',
            'active'
        ))
        
        conn.commit()
        conn.close()
        
        print(f"[Strands SDK] Agent created successfully: {agent_id}")
        
        # A2A Integration
        a2a_result = None
        try:
            print(f"[Strands SDK] Registering agent with A2A service...")
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
                print(f"[Strands SDK] ✅ Agent registered with A2A service: {a2a_result.get('agent', {}).get('id', 'unknown')}")
            else:
                print(f"[Strands SDK] ⚠️ A2A registration failed: {a2a_response.status_code} - {a2a_response.text}")
                a2a_result = {'status': 'error', 'error': f'HTTP {a2a_response.status_code}'}
                
        except Exception as a2a_error:
            print(f"[Strands SDK] ⚠️ A2A registration error: {str(a2a_error)}")
            a2a_result = {'status': 'error', 'error': str(a2a_error)}

        # Main System Integration
        main_system_result = None
        try:
            print(f"[Strands SDK] Registering agent with main Ollama system...")
            main_system_payload = {
                'name': data.get('name'),
                'role': 'Strands AI Agent',
                'description': data.get('description', ''),
                'model': data.get('model_id'),
                'personality': 'Advanced reasoning and problem-solving',
                'expertise': ', '.join(data.get('tools', [])) or 'General AI assistance',
                'system_prompt': data.get('system_prompt', f"You are {data.get('name')}, an advanced AI agent with reasoning capabilities."),
                'temperature': data.get('ollama_config', {}).get('temperature', 0.7),
                'max_tokens': data.get('ollama_config', {}).get('max_tokens', 4000),
                'guardrails_enabled': False,
                'safety_level': 'medium',
                'content_filters': '[]',
                'custom_rules': '[]'
            }

            main_system_response = requests.post(
                'http://localhost:5002/api/agents/ollama',
                json=main_system_payload,
                timeout=10
            )

            if main_system_response.status_code == 200:
                main_system_result = main_system_response.json()
                print(f"[Strands SDK] ✅ Agent registered with main Ollama system: {main_system_result.get('agent', {}).get('id', 'unknown')}")
            else:
                print(f"[Strands SDK] ⚠️ Main system registration failed: {main_system_response.status_code} - {main_system_response.text}")
                main_system_result = {'status': 'error', 'error': f'HTTP {main_system_response.status_code}'}

        except Exception as main_error:
            print(f"[Strands SDK] ⚠️ Main system registration error: {str(main_error)}")
            main_system_result = {'status': 'error', 'error': str(main_error)}
        
        response_data = {
            'id': agent_id,
            'message': 'Strands SDK agent created successfully',
            'sdk_validated': True,
            'sdk_type': 'working-strands'
        }

        # Add A2A registration info to response
        if a2a_result:
            response_data['a2a_registration'] = a2a_result

        # Add main system registration info to response
        if main_system_result:
            response_data['main_system_registration'] = main_system_result

        return jsonify(response_data)
        
    except Exception as e:
        print(f"[Strands SDK] Error creating agent: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/agents/<agent_id>', methods=['DELETE'])
def delete_strands_agent(agent_id):
    """Delete a Strands SDK agent"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM strands_sdk_agents WHERE id = ?', (agent_id,))
        deleted = cursor.rowcount
        conn.commit()
        conn.close()
        
        if deleted > 0:
            print(f"[Strands SDK] Agent deleted: {agent_id}")
            return jsonify({'message': 'Agent deleted successfully'})
        else:
            return jsonify({'error': 'Agent not found'}), 404
            
    except Exception as e:
        print(f"[Strands SDK] Error deleting agent: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/a2a/agents', methods=['GET'])
def get_a2a_agents():
    """Get agents registered with A2A service"""
    try:
        # Get agents from A2A service
        a2a_response = requests.get('http://localhost:5008/api/a2a/agents', timeout=5)
        
        if a2a_response.status_code == 200:
            a2a_data = a2a_response.json()
            agents = a2a_data.get('agents', [])
            
            # Filter for Strands agents
            strands_agents = [agent for agent in agents if agent.get('id', '').startswith('strands_')]
            
            print(f"[Strands SDK] Found {len(strands_agents)} Strands A2A agents")
            return jsonify({
                "agents": strands_agents,
                "count": len(strands_agents),
                "status": "success"
            })
        else:
            print(f"[Strands SDK] A2A service error: {a2a_response.status_code}")
            return jsonify({
                "agents": [],
                "count": 0,
                "status": "error",
                "error": f"A2A service error: {a2a_response.status_code}"
            })
            
    except Exception as e:
        print(f"[Strands SDK] Error getting A2A agents: {e}")
        return jsonify({
            "agents": [],
            "count": 0,
            "status": "error",
            "error": str(e)
        })

if __name__ == '__main__':
    print("[Strands SDK] Starting Working Strands SDK Agent Service...")
    print("[Strands SDK] Port: 5006")
    
    # Initialize database
    init_database()
    
    # Start the server
    app.run(
        host='0.0.0.0',
        port=5006,
        debug=False  # Disable debug mode to avoid issues
    )
