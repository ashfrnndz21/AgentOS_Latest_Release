#!/usr/bin/env python3
"""
Unified Agent Manager
Handles both basic Ollama agents and Strands agents with proper categorization
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

# Database setup
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
            agent_type TEXT NOT NULL, -- 'basic' or 'strands'
            a2a_enabled BOOLEAN DEFAULT 0,
            a2a_agent_id TEXT, -- A2A-specific ID
            ollama_config TEXT, -- JSON object
            strands_config TEXT, -- JSON object
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("[Unified Agent Manager] Database initialized")

@app.route('/api/unified/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "service": "unified-agent-manager",
        "status": "healthy",
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
            if not agent.get('name', '').startswith('Strands'):  # Skip migrated Strands agents
                all_agents.append({
                    'id': agent['id'],
                    'name': agent['name'],
                    'description': agent.get('description', ''),
                    'model': agent.get('model', {}).get('model_id', 'unknown'),
                    'capabilities': agent.get('expertise', '').split(', ') if agent.get('expertise') else [],
                    'status': 'active',
                    'agent_type': 'basic',
                    'a2a_enabled': False,
                    'framework': 'Ollama',
                    'created_at': agent.get('created_at'),
                    'registered_at': agent.get('created_at')
                })
        
        # Add Strands agents
        for agent in strands_agents:
            # Check if this agent is A2A enabled
            a2a_enabled = any(a.get('id', '').endswith(agent['id']) for a in a2a_agents)
            
            all_agents.append({
                'id': agent['id'],
                'name': agent['name'],
                'description': agent.get('description', ''),
                'model': agent.get('model_id', 'unknown'),
                'capabilities': agent.get('tools', []),
                'status': agent.get('status', 'active'),
                'agent_type': 'strands',
                'a2a_enabled': a2a_enabled,
                'framework': 'Strands SDK',
                'created_at': agent.get('created_at'),
                'registered_at': agent.get('created_at')
            })
        
        return jsonify({
            "agents": all_agents,
            "count": len(all_agents),
            "breakdown": {
                "basic": len([a for a in all_agents if a['agent_type'] == 'basic']),
                "strands": len([a for a in all_agents if a['agent_type'] == 'strands']),
                "a2a_enabled": len([a for a in all_agents if a['a2a_enabled']])
            },
            "status": "success"
        })
        
    except Exception as e:
        print(f"[Unified Agent Manager] Error getting agents: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/unified/agents/basic', methods=['GET'])
def get_basic_agents():
    """Get only basic Ollama agents"""
    all_agents = get_all_agents().get_json()
    basic_agents = [a for a in all_agents.get('agents', []) if a['agent_type'] == 'basic']
    return jsonify({
        "agents": basic_agents,
        "count": len(basic_agents),
        "status": "success"
    })

@app.route('/api/unified/agents/strands', methods=['GET'])
def get_strands_agents():
    """Get only Strands agents"""
    all_agents = get_all_agents().get_json()
    strands_agents = [a for a in all_agents.get('agents', []) if a['agent_type'] == 'strands']
    return jsonify({
        "agents": strands_agents,
        "count": len(strands_agents),
        "status": "success"
    })

@app.route('/api/unified/agents/a2a', methods=['GET'])
def get_a2a_agents():
    """Get only A2A enabled agents"""
    all_agents = get_all_agents().get_json()
    a2a_agents = [a for a in all_agents.get('agents', []) if a['a2a_enabled']]
    return jsonify({
        "agents": a2a_agents,
        "count": len(a2a_agents),
        "status": "success"
    })

if __name__ == '__main__':
    print("[Unified Agent Manager] Starting Unified Agent Manager...")
    print("[Unified Agent Manager] Port: 5003")
    
    init_database()
    
    app.run(
        host='0.0.0.0',
        port=5003,
        debug=False
    )

