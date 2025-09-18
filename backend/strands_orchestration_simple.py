#!/usr/bin/env python3
"""
Simplified Strands Orchestration API
Basic version without SocketIO for immediate testing
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid
import json
import time
from datetime import datetime
import os
import sys
from typing import Dict, List, Any, Optional

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="*")

# Database setup
DB_PATH = 'strands_orchestration.db'

def init_database():
    """Initialize the orchestration database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create agents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS strands_agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            model_id TEXT NOT NULL,
            system_prompt TEXT,
            tools TEXT,
            execution_strategy TEXT DEFAULT 'sequential',
            parent_agent TEXT,
            child_agents TEXT,
            a2a_endpoint TEXT,
            metadata TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create tools table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS strands_tools (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            schema TEXT,
            implementation TEXT,
            execution_strategy TEXT DEFAULT 'sequential',
            dependencies TEXT,
            is_agent_tool BOOLEAN DEFAULT FALSE,
            agent_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create feature_flags table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feature_flags (
            id TEXT PRIMARY KEY,
            flag_name TEXT UNIQUE NOT NULL,
            enabled BOOLEAN DEFAULT FALSE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create rollback_points table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rollback_points (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            timestamp TEXT,
            version TEXT,
            changes TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_database()

# =============================================================================
# FEATURE FLAGS MANAGEMENT
# =============================================================================

def get_feature_flags() -> Dict[str, bool]:
    """Get current feature flags"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT flag_name, enabled FROM feature_flags')
    flags = dict(cursor.fetchall())
    
    conn.close()
    return flags

def set_feature_flag(flag_name: str, enabled: bool, description: str = ""):
    """Set a feature flag"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT OR REPLACE INTO feature_flags (id, flag_name, enabled, description, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ''', (str(uuid.uuid4()), flag_name, enabled, description))
    
    conn.commit()
    conn.close()

# =============================================================================
# ROLLBACK MECHANISM
# =============================================================================

def create_rollback_point(name: str, description: str, changes: List[Dict[str, Any]]) -> str:
    """Create a rollback point"""
    rollback_id = str(uuid.uuid4())
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO rollback_points (id, name, description, timestamp, version, changes)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (rollback_id, name, description, datetime.now().isoformat(), "1.0.0", json.dumps(changes)))
    
    conn.commit()
    conn.close()
    
    return rollback_id

def get_rollback_points() -> List[Dict[str, Any]]:
    """Get all rollback points"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM rollback_points ORDER BY created_at DESC')
    columns = [description[0] for description in cursor.description]
    points = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    conn.close()
    return points

def execute_rollback(rollback_id: str) -> bool:
    """Execute rollback to a specific point"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get rollback point
        cursor.execute('SELECT changes FROM rollback_points WHERE id = ?', (rollback_id,))
        result = cursor.fetchone()
        
        if not result:
            return False
        
        changes = json.loads(result[0])
        
        # Execute rollback changes in reverse order
        for change in reversed(changes):
            if change['action'] == 'create':
                # Delete the created item
                if change['type'] == 'agent':
                    cursor.execute('DELETE FROM strands_agents WHERE id = ?', (change['id'],))
                elif change['type'] == 'tool':
                    cursor.execute('DELETE FROM strands_tools WHERE id = ?', (change['id'],))
            elif change['action'] == 'update':
                # Restore previous data
                if change['type'] == 'agent':
                    cursor.execute('''
                        UPDATE strands_agents SET 
                        name = ?, description = ?, model_id = ?, system_prompt = ?,
                        tools = ?, execution_strategy = ?, parent_agent = ?, child_agents = ?,
                        a2a_endpoint = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    ''', (
                        change['previous_data']['name'],
                        change['previous_data']['description'],
                        change['previous_data']['model_id'],
                        change['previous_data']['system_prompt'],
                        change['previous_data']['tools'],
                        change['previous_data']['execution_strategy'],
                        change['previous_data']['parent_agent'],
                        change['previous_data']['child_agents'],
                        change['previous_data']['a2a_endpoint'],
                        change['previous_data']['metadata'],
                        change['id']
                    ))
        
        # Update rollback point status
        cursor.execute('UPDATE rollback_points SET status = ? WHERE id = ?', ('rolled_back', rollback_id))
        
        conn.commit()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"Rollback failed: {e}")
        return False

# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.route('/api/strands-orchestration/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'feature_flags': get_feature_flags(),
        'version': '1.0.0',
        'service': 'strands-orchestration-api'
    })

@app.route('/api/strands-orchestration/feature-flags', methods=['GET'])
def get_feature_flags_endpoint():
    """Get current feature flags"""
    return jsonify(get_feature_flags())

@app.route('/api/strands-orchestration/feature-flags', methods=['POST'])
def set_feature_flag_endpoint():
    """Set a feature flag"""
    data = request.get_json()
    flag_name = data.get('flag_name')
    enabled = data.get('enabled', False)
    description = data.get('description', '')
    
    if not flag_name:
        return jsonify({'error': 'flag_name is required'}), 400
    
    set_feature_flag(flag_name, enabled, description)
    
    return jsonify({'success': True, 'message': f'Feature flag {flag_name} set to {enabled}'})

@app.route('/api/strands-orchestration/rollback-points', methods=['GET'])
def get_rollback_points_endpoint():
    """Get all rollback points"""
    return jsonify(get_rollback_points())

@app.route('/api/strands-orchestration/rollback-points', methods=['POST'])
def create_rollback_point_endpoint():
    """Create a rollback point"""
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')
    changes = data.get('changes', [])
    
    if not name:
        return jsonify({'error': 'name is required'}), 400
    
    rollback_id = create_rollback_point(name, description, changes)
    
    return jsonify({'success': True, 'rollback_id': rollback_id})

@app.route('/api/strands-orchestration/rollback-points/<rollback_id>/rollback', methods=['POST'])
def execute_rollback_endpoint(rollback_id: str):
    """Execute rollback to a specific point"""
    success = execute_rollback(rollback_id)
    
    if success:
        return jsonify({'success': True, 'message': 'Rollback executed successfully'})
    else:
        return jsonify({'success': False, 'message': 'Rollback failed'}), 500

@app.route('/api/strands-orchestration/agents', methods=['POST'])
def create_agent_endpoint():
    """Create a new agent"""
    try:
        agent_data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'model_id', 'system_prompt']
        for field in required_fields:
            if field not in agent_data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        agent_id = str(uuid.uuid4())
        
        # Create agent record
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO strands_agents (id, name, description, model_id, system_prompt, tools, execution_strategy, parent_agent, child_agents, a2a_endpoint, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            agent_id,
            agent_data['name'],
            agent_data.get('description', ''),
            agent_data['model_id'],
            agent_data['system_prompt'],
            json.dumps(agent_data.get('tools', [])),
            agent_data.get('execution_strategy', 'sequential'),
            agent_data.get('parent_agent'),
            json.dumps(agent_data.get('child_agents', [])),
            agent_data.get('a2a_endpoint'),
            json.dumps(agent_data.get('metadata', {}))
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'id': agent_id,
            'name': agent_data['name'],
            'description': agent_data.get('description', ''),
            'model_id': agent_data['model_id'],
            'system_prompt': agent_data['system_prompt'],
            'tools': agent_data.get('tools', []),
            'execution_strategy': agent_data.get('execution_strategy', 'sequential'),
            'created_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to create agent: {str(e)}'}), 500

@app.route('/api/strands-orchestration/agents', methods=['GET'])
def get_agents_endpoint():
    """Get all agents"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM strands_agents ORDER BY created_at DESC')
    columns = [description[0] for description in cursor.description]
    agents = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(agents)

@app.route('/api/strands-orchestration/tools', methods=['GET'])
def get_tools_endpoint():
    """Get all tools"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM strands_tools ORDER BY created_at DESC')
    columns = [description[0] for description in cursor.description]
    tools = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(tools)

if __name__ == '__main__':
    print("🚀 Starting Simplified Strands Orchestration API...")
    print("📍 Port: 5009")
    print("🔧 Feature flags enabled")
    print("🔄 Rollback mechanism enabled")
    print("🤖 Strands orchestration patterns implemented")
    print("⚡ No SocketIO - Fast startup!")
    
    app.run(host='0.0.0.0', port=5009, debug=True)




