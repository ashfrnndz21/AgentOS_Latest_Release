import os
import sys
import json
import sqlite3
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Database setup
def init_db():
    conn = sqlite3.connect('agent_platform.db')
    cursor = conn.cursor()
    
    # Agents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            framework TEXT NOT NULL,
            model TEXT,
            capabilities TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            config TEXT
        )
    ''')
    
    # Workflows table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            agents TEXT,
            config TEXT,
            status TEXT DEFAULT 'draft',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Monitoring data table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS monitoring (
            id TEXT PRIMARY KEY,
            agent_id TEXT,
            metric_type TEXT,
            value TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# Agent endpoints
@app.route('/api/agents', methods=['GET', 'POST'])
def handle_agents():
    if request.method == 'GET':
        conn = sqlite3.connect('agent_platform.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM agents ORDER BY created_at DESC')
        agents = []
        for row in cursor.fetchall():
            agents.append({
                'id': row[0],
                'name': row[1],
                'framework': row[2],
                'model': row[3],
                'capabilities': json.loads(row[4] or '[]'),
                'status': row[5],
                'created_at': row[6],
                'config': json.loads(row[7] or '{}')
            })
        conn.close()
        return jsonify(agents)
    
    elif request.method == 'POST':
        data = request.get_json()
        agent_id = str(uuid.uuid4())
        
        conn = sqlite3.connect('agent_platform.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO agents (id, name, framework, model, capabilities, config)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            agent_id,
            data.get('name'),
            data.get('framework'),
            data.get('model'),
            json.dumps(data.get('capabilities', [])),
            json.dumps(data.get('config', {}))
        ))
        conn.commit()
        conn.close()
        
        return jsonify({'id': agent_id, 'status': 'created'}), 201

# Workflow endpoints
@app.route('/api/workflows', methods=['GET', 'POST'])
def handle_workflows():
    if request.method == 'GET':
        conn = sqlite3.connect('agent_platform.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM workflows ORDER BY created_at DESC')
        workflows = []
        for row in cursor.fetchall():
            workflows.append({
                'id': row[0],
                'name': row[1],
                'type': row[2],
                'agents': json.loads(row[3] or '[]'),
                'config': json.loads(row[4] or '{}'),
                'status': row[5],
                'created_at': row[6]
            })
        conn.close()
        return jsonify(workflows)
    
    elif request.method == 'POST':
        data = request.get_json()
        workflow_id = str(uuid.uuid4())
        
        conn = sqlite3.connect('agent_platform.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO workflows (id, name, type, agents, config)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            workflow_id,
            data.get('name'),
            data.get('type'),
            json.dumps(data.get('agents', [])),
            json.dumps(data.get('config', {}))
        ))
        conn.commit()
        conn.close()
        
        return jsonify({'id': workflow_id, 'status': 'created'}), 201

# Monitoring endpoints
@app.route('/api/monitoring/system', methods=['GET'])
def get_system_monitoring():
    return jsonify({
        'cpu_usage': 45.2,
        'memory_usage': 62.8,
        'disk_usage': 34.1,
        'network_io': {'in': 1024, 'out': 2048},
        'active_agents': 3,
        'running_workflows': 1,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/monitoring/agents', methods=['GET'])
def get_agent_monitoring():
    return jsonify([
        {
            'agent_id': 'agent-1',
            'name': 'Customer Service Agent',
            'status': 'running',
            'cpu_usage': 12.5,
            'memory_usage': 256,
            'requests_per_minute': 45,
            'last_activity': datetime.now().isoformat()
        },
        {
            'agent_id': 'agent-2', 
            'name': 'Data Analysis Agent',
            'status': 'idle',
            'cpu_usage': 2.1,
            'memory_usage': 128,
            'requests_per_minute': 0,
            'last_activity': datetime.now().isoformat()
        }
    ])

# Framework validation endpoints
@app.route('/api/frameworks/validate', methods=['POST'])
def validate_framework():
    data = request.get_json()
    framework = data.get('framework')
    
    # Simulate framework validation
    if framework in ['agentcore', 'strands', 'custom']:
        return jsonify({
            'valid': True,
            'framework': framework,
            'version': '1.0.0',
            'capabilities': ['chat', 'reasoning', 'tools'],
            'status': 'connected'
        })
    else:
        return jsonify({
            'valid': False,
            'error': 'Unsupported framework',
            'supported_frameworks': ['agentcore', 'strands', 'custom']
        }), 400

if __name__ == '__main__':
    print("Starting Agent Platform Backend...")
    print("Backend API: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    app.run(host='0.0.0.0', port=5000, debug=False)
