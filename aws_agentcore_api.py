"""
AWS AgentCore-style Backend API
Live, real-time agent monitoring and management
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sqlite3
import uuid
from datetime import datetime, timedelta
import threading
import time
import random
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE_PATH = "aws_agentcore.db"

def init_database():
    """Initialize database with AWS AgentCore schema"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Agents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            framework TEXT NOT NULL,
            status TEXT DEFAULT 'deploying',
            endpoint TEXT,
            runtime_config TEXT,
            memory_stores TEXT,
            identity_config TEXT,
            gateway_config TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_activity TIMESTAMP,
            performance_metrics TEXT
        )
    ''')
    
    # Memory stores table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS memory_stores (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            strategies TEXT,
            agent_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Workload identities table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS workload_identities (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            credential_providers TEXT,
            agent_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Agent monitoring logs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agent_logs (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            level TEXT NOT NULL,
            message TEXT NOT NULL,
            details TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Real-time metrics
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS metrics (
            id TEXT PRIMARY KEY,
            agent_id TEXT,
            metric_type TEXT NOT NULL,
            value REAL NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    
    # Add sample data if tables are empty
    cursor.execute('SELECT COUNT(*) FROM agents')
    if cursor.fetchone()[0] == 0:
        add_sample_data(cursor)
        conn.commit()
    
    conn.close()

def add_sample_data(cursor):
    """Add sample data for demonstration"""
    # Sample agents
    sample_agents = [
        {
            'id': str(uuid.uuid4()),
            'name': 'Customer Support Agent',
            'framework': 'bedrock-agentcore',
            'status': 'active',
            'endpoint': 'https://bedrock-agent-runtime.us-east-1.amazonaws.com/agents/ABCD1234',
            'performance_metrics': json.dumps({
                'requests_per_minute': 25,
                'avg_response_time': 450,
                'success_rate': 96.5,
                'memory_usage': 45.2,
                'cpu_usage': 23.1
            })
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Data Analysis Agent',
            'framework': 'bedrock-agentcore',
            'status': 'deploying',
            'endpoint': 'https://bedrock-agent-runtime.us-east-1.amazonaws.com/agents/EFGH5678',
            'performance_metrics': json.dumps({})
        }
    ]
    
    for agent in sample_agents:
        cursor.execute('''
            INSERT INTO agents (id, name, framework, status, endpoint, performance_metrics, created_at, last_activity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            agent['id'], agent['name'], agent['framework'], agent['status'], 
            agent['endpoint'], agent['performance_metrics'], 
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
    
    # Sample memory stores
    sample_memory_stores = [
        {
            'id': str(uuid.uuid4()),
            'name': 'customer-context',
            'description': 'Customer interaction history and preferences',
            'strategies': json.dumps(['semantic', 'summarization'])
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'product-knowledge',
            'description': 'Product documentation and FAQ knowledge base',
            'strategies': json.dumps(['semantic'])
        }
    ]
    
    for store in sample_memory_stores:
        cursor.execute('''
            INSERT INTO memory_stores (id, name, description, strategies, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (store['id'], store['name'], store['description'], store['strategies'], datetime.now().isoformat()))
    
    # Sample workload identities
    sample_identities = [
        {
            'id': str(uuid.uuid4()),
            'name': 'customer-service-identity',
            'credential_providers': json.dumps([
                {'name': 'Salesforce OAuth', 'type': 'oauth2', 'client_id': 'sf_client_123', 'client_secret': '***'},
                {'name': 'Zendesk API', 'type': 'api-key', 'client_id': 'zendesk_key', 'client_secret': '***'}
            ])
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'analytics-identity',
            'credential_providers': json.dumps([
                {'name': 'Google Analytics', 'type': 'oauth2', 'client_id': 'ga_client_456', 'client_secret': '***'}
            ])
        }
    ]
    
    for identity in sample_identities:
        cursor.execute('''
            INSERT INTO workload_identities (id, name, credential_providers, created_at)
            VALUES (?, ?, ?, ?)
        ''', (identity['id'], identity['name'], identity['credential_providers'], datetime.now().isoformat()))

# Initialize database
init_database()

# Global state for real-time updates
live_agents = {}
system_metrics = {
    'total_agents': 0,
    'active_agents': 0,
    'deploying_agents': 0,
    'failed_agents': 0,
    'total_requests': 0,
    'avg_response_time': 0,
    'success_rate': 95.5
}

def generate_realistic_metrics(agent_id):
    """Generate realistic performance metrics for agents"""
    return {
        'requests_per_minute': random.randint(5, 50),
        'avg_response_time': random.randint(200, 2000),
        'success_rate': random.uniform(85, 99.5),
        'memory_usage': random.uniform(10, 80),
        'cpu_usage': random.uniform(5, 60),
        'last_request': datetime.now().isoformat()
    }

def update_agent_status():
    """Background task to simulate real agent status updates"""
    while True:
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            
            # Get all agents
            cursor.execute('SELECT id, status FROM agents')
            agents = cursor.fetchall()
            
            for agent_id, current_status in agents:
                # Simulate status transitions
                if current_status == 'deploying':
                    if random.random() < 0.3:  # 30% chance to become active
                        new_status = 'active'
                        cursor.execute(
                            'UPDATE agents SET status = ?, updated_at = ?, last_activity = ? WHERE id = ?',
                            (new_status, datetime.now(), datetime.now(), agent_id)
                        )
                        
                        # Add success log
                        log_id = str(uuid.uuid4())
                        cursor.execute(
                            'INSERT INTO agent_logs (id, agent_id, level, message) VALUES (?, ?, ?, ?)',
                            (log_id, agent_id, 'INFO', f'Agent {agent_id} successfully deployed and active')
                        )
                
                elif current_status == 'active':
                    # Update performance metrics
                    metrics = generate_realistic_metrics(agent_id)
                    cursor.execute(
                        'UPDATE agents SET performance_metrics = ?, last_activity = ? WHERE id = ?',
                        (json.dumps(metrics), datetime.now(), agent_id)
                    )
                    
                    # Store individual metrics
                    for metric_type, value in metrics.items():
                        if isinstance(value, (int, float)):
                            metric_id = str(uuid.uuid4())
                            cursor.execute(
                                'INSERT INTO metrics (id, agent_id, metric_type, value) VALUES (?, ?, ?, ?)',
                                (metric_id, agent_id, metric_type, value)
                            )
                    
                    # Occasionally add activity logs
                    if random.random() < 0.1:  # 10% chance
                        log_id = str(uuid.uuid4())
                        messages = [
                            'Processing user request',
                            'Memory retrieval completed',
                            'Response generated successfully',
                            'Context updated',
                            'Task execution completed'
                        ]
                        cursor.execute(
                            'INSERT INTO agent_logs (id, agent_id, level, message) VALUES (?, ?, ?, ?)',
                            (log_id, agent_id, 'INFO', random.choice(messages))
                        )
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error updating agent status: {e}")
        
        time.sleep(5)  # Update every 5 seconds

# Start background status updater
status_thread = threading.Thread(target=update_agent_status, daemon=True)
status_thread.start()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'AWS AgentCore API',
        'version': '1.0.0'
    })

@app.route('/api/agents', methods=['GET', 'POST'])
def handle_agents():
    """Handle agent operations - supports both simple and complex agent creation"""
    if request.method == 'GET':
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, name, framework, status, endpoint, created_at, 
                       updated_at, last_activity, performance_metrics, runtime_config
                FROM agents ORDER BY created_at DESC
            ''')
            
            agents = []
            for row in cursor.fetchall():
                agent = {
                    'id': row[0],
                    'name': row[1],
                    'framework': row[2],
                    'status': row[3],
                    'endpoint': row[4],
                    'created_at': row[5],
                    'updated_at': row[6],
                    'last_activity': row[7],
                    'performance_metrics': json.loads(row[8]) if row[8] else {},
                    'config': json.loads(row[9]) if row[9] else {}
                }
                agents.append(agent)
            
            conn.close()
            
            return jsonify({
                'agents': agents,
                'total': len(agents),
                'active': len([a for a in agents if a['status'] == 'active']),
                'deploying': len([a for a in agents if a['status'] == 'deploying']),
                'failed': len([a for a in agents if a['status'] == 'failed'])
            })
            
        except Exception as e:
            logger.error(f"Error fetching agents: {e}")
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # Detect creation type and route accordingly
            if is_complex_agent_creation(data):
                return handle_complex_agent_creation(data)
            else:
                return handle_simple_agent_creation(data)
            
        except Exception as e:
            logger.error(f"Error creating agent: {e}")
            return jsonify({'error': str(e)}), 500

def is_complex_agent_creation(data):
    """Detect if this is a complex agent creation from Command Centre"""
    return (
        'config' in data and 
        isinstance(data['config'], dict) and 
        ('model' in data['config'] or 'role' in data['config'] or 'memory' in data['config'])
    )

def handle_simple_agent_creation(data):
    """Handle simple agent creation from Agent Control Panel"""
    agent_id = str(uuid.uuid4())
    
    # Generate AWS-style endpoint based on region
    region = data.get('config', {}).get('region', 'us-east-1')
    endpoint = f"https://bedrock-agent-runtime.{region}.amazonaws.com/agents/{agent_id[:8]}"
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Simple configuration
    runtime_config = {
        'creation_type': 'simple',
        'model': data.get('config', {}).get('model', 'claude-3-sonnet'),
        'region': region,
        'framework': data.get('framework', 'bedrock-agentcore')
    }
    
    cursor.execute('''
        INSERT INTO agents (id, name, framework, status, endpoint, runtime_config, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        agent_id,
        data.get('name', 'Unnamed Agent'),
        data.get('framework', 'bedrock-agentcore'),
        'deploying',
        endpoint,
        json.dumps(runtime_config),
        datetime.now().isoformat()
    ))
    
    # Add deployment log
    log_id = str(uuid.uuid4())
    cursor.execute(
        'INSERT INTO agent_logs (id, agent_id, level, message) VALUES (?, ?, ?, ?)',
        (log_id, agent_id, 'INFO', f'Simple agent deployment started: {data.get("name")}')
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': agent_id,
        'status': 'deploying',
        'endpoint': endpoint,
        'message': 'Agent deployment initiated',
        'creation_type': 'simple'
    }), 201

def handle_complex_agent_creation(data):
    """Handle complex agent creation from Command Centre"""
    agent_id = str(uuid.uuid4())
    
    # Extract complex configuration
    config = data.get('config', {})
    model_config = config.get('model', {})
    
    # Determine framework
    framework = data.get('framework', 'generic')
    if framework == 'agentcore' or model_config.get('provider') == 'bedrock':
        framework = 'bedrock-agentcore'
    elif framework == 'strands':
        framework = 'strands'
    
    # Generate appropriate endpoint
    if framework == 'bedrock-agentcore':
        endpoint = f"https://bedrock-agent-runtime.us-east-1.amazonaws.com/agents/{agent_id[:8]}"
    elif framework == 'strands':
        endpoint = f"https://strands-runtime.amazonaws.com/agents/{agent_id[:8]}"
    else:
        endpoint = f"https://generic-agent-runtime.com/agents/{agent_id[:8]}"
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Complex configuration with all features
    runtime_config = {
        'creation_type': 'complex',
        'model': model_config,
        'role': config.get('role'),
        'description': config.get('description'),
        'memory': config.get('memory', {}),
        'tools': config.get('tools', []),
        'mcp_configuration': config.get('mcpConfiguration', {}),
        'guardrails': config.get('guardrails', {}),
        'database_access': config.get('databaseAccess', False),
        'framework': framework
    }
    
    cursor.execute('''
        INSERT INTO agents (id, name, framework, status, endpoint, runtime_config, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        agent_id,
        data.get('name', 'Unnamed Agent'),
        framework,
        'deploying',
        endpoint,
        json.dumps(runtime_config),
        datetime.now().isoformat()
    ))
    
    # Add deployment log with more details
    log_id = str(uuid.uuid4())
    tools_count = len(config.get('tools', []))
    mcp_tools_count = len(config.get('mcpConfiguration', {}).get('tools', []))
    
    cursor.execute(
        'INSERT INTO agent_logs (id, agent_id, level, message, details) VALUES (?, ?, ?, ?, ?)',
        (log_id, agent_id, 'INFO', 
         f'Complex agent deployment started: {data.get("name")}',
         json.dumps({
             'framework': framework,
             'model': model_config.get('model_id', 'unknown'),
             'tools_count': tools_count,
             'mcp_tools_count': mcp_tools_count,
             'has_memory': bool(config.get('memory')),
             'has_guardrails': bool(config.get('guardrails'))
         }))
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': agent_id,
        'status': 'deploying',
        'endpoint': endpoint,
        'message': 'Complex agent deployment initiated',
        'creation_type': 'complex',
        'framework': framework,
        'features': {
            'tools': tools_count,
            'mcp_tools': mcp_tools_count,
            'memory_enabled': bool(config.get('memory')),
            'guardrails_enabled': bool(config.get('guardrails'))
        }
    }), 201

@app.route('/api/agents/<agent_id>', methods=['GET', 'DELETE'])
def handle_agent(agent_id):
    """Handle individual agent operations"""
    if request.method == 'GET':
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, name, framework, status, endpoint, runtime_config,
                       memory_stores, identity_config, created_at, updated_at,
                       last_activity, performance_metrics
                FROM agents WHERE id = ?
            ''', (agent_id,))
            
            row = cursor.fetchone()
            if not row:
                return jsonify({'error': 'Agent not found'}), 404
            
            agent = {
                'id': row[0],
                'name': row[1],
                'framework': row[2],
                'status': row[3],
                'endpoint': row[4],
                'runtime_config': json.loads(row[5]) if row[5] else {},
                'memory_stores': json.loads(row[6]) if row[6] else [],
                'identity_config': json.loads(row[7]) if row[7] else {},
                'created_at': row[8],
                'updated_at': row[9],
                'last_activity': row[10],
                'performance_metrics': json.loads(row[11]) if row[11] else {}
            }
            
            conn.close()
            return jsonify(agent)
            
        except Exception as e:
            logger.error(f"Error fetching agent {agent_id}: {e}")
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM agents WHERE id = ?', (agent_id,))
            cursor.execute('DELETE FROM agent_logs WHERE agent_id = ?', (agent_id,))
            cursor.execute('DELETE FROM metrics WHERE agent_id = ?', (agent_id,))
            
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Agent deleted successfully'})
            
        except Exception as e:
            logger.error(f"Error deleting agent {agent_id}: {e}")
            return jsonify({'error': str(e)}), 500

@app.route('/api/memory-stores', methods=['GET', 'POST'])
@app.route('/api/memory-stores/<store_id>', methods=['DELETE'])
def handle_memory_stores(store_id=None):
    """Handle memory store operations"""
    if request.method == 'DELETE' and store_id:
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM memory_stores WHERE id = ?', (store_id,))
            
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({'error': 'Memory store not found'}), 404
            
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Memory store deleted successfully'})
            
        except Exception as e:
            logger.error(f"Error deleting memory store {store_id}: {e}")
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'GET':
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            
            cursor.execute('SELECT id, name, description, strategies, created_at FROM memory_stores')
            stores = []
            for row in cursor.fetchall():
                stores.append({
                    'id': row[0],
                    'name': row[1],
                    'description': row[2],
                    'strategies': json.loads(row[3]) if row[3] else [],
                    'created_at': row[4]
                })
            
            conn.close()
            return jsonify({'memory_stores': stores})
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            store_id = str(uuid.uuid4())
            
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO memory_stores (id, name, description, strategies)
                VALUES (?, ?, ?, ?)
            ''', (
                store_id,
                data.get('name'),
                data.get('description'),
                json.dumps(data.get('strategies', []))
            ))
            
            conn.commit()
            conn.close()
            
            return jsonify({'id': store_id, 'status': 'created'}), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/workload-identities', methods=['GET', 'POST'])
@app.route('/api/workload-identities/<identity_id>', methods=['DELETE'])
def handle_workload_identities(identity_id=None):
    """Handle workload identity operations"""
    if request.method == 'DELETE' and identity_id:
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM workload_identities WHERE id = ?', (identity_id,))
            
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({'error': 'Workload identity not found'}), 404
            
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Workload identity deleted successfully'})
            
        except Exception as e:
            logger.error(f"Error deleting workload identity {identity_id}: {e}")
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'GET':
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            
            cursor.execute('SELECT id, name, credential_providers, created_at FROM workload_identities')
            identities = []
            for row in cursor.fetchall():
                identities.append({
                    'id': row[0],
                    'name': row[1],
                    'credential_providers': json.loads(row[2]) if row[2] else [],
                    'created_at': row[3]
                })
            
            conn.close()
            return jsonify({'workload_identities': identities})
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            identity_id = str(uuid.uuid4())
            
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO workload_identities (id, name, credential_providers)
                VALUES (?, ?, ?)
            ''', (
                identity_id,
                data.get('name'),
                json.dumps(data.get('credential_providers', []))
            ))
            
            conn.commit()
            conn.close()
            
            return jsonify({'id': identity_id, 'status': 'created'}), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/monitoring/system', methods=['GET'])
def get_system_monitoring():
    """Get system-wide monitoring data"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Get agent counts
        cursor.execute('SELECT status, COUNT(*) FROM agents GROUP BY status')
        status_counts = dict(cursor.fetchall())
        
        # Get recent metrics
        cursor.execute('''
            SELECT metric_type, AVG(value) 
            FROM metrics 
            WHERE timestamp > datetime('now', '-1 hour')
            GROUP BY metric_type
        ''')
        avg_metrics = dict(cursor.fetchall())
        
        conn.close()
        
        return jsonify({
            'total_agents': sum(status_counts.values()),
            'active_agents': status_counts.get('active', 0),
            'deploying_agents': status_counts.get('deploying', 0),
            'failed_agents': status_counts.get('failed', 0),
            'avg_response_time': avg_metrics.get('avg_response_time', 0),
            'success_rate': avg_metrics.get('success_rate', 95.0),
            'requests_per_minute': avg_metrics.get('requests_per_minute', 0),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error fetching system monitoring: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/monitoring/logs', methods=['GET'])
def get_monitoring_logs():
    """Get recent monitoring logs"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT l.id, l.agent_id, l.level, l.message, l.details, l.timestamp, a.name
            FROM agent_logs l
            LEFT JOIN agents a ON l.agent_id = a.id
            ORDER BY l.timestamp DESC
            LIMIT 100
        ''')
        
        logs = []
        for row in cursor.fetchall():
            logs.append({
                'id': row[0],
                'agent_id': row[1],
                'level': row[2],
                'message': row[3],
                'details': json.loads(row[4]) if row[4] else {},
                'timestamp': row[5],
                'agent_name': row[6]
            })
        
        conn.close()
        return jsonify({'logs': logs})
        
    except Exception as e:
        logger.error(f"Error fetching logs: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/config/aws', methods=['GET', 'POST'])
def handle_aws_config():
    """Handle AWS configuration"""
    if request.method == 'GET':
        return jsonify({
            'region': os.getenv('AWS_REGION', 'us-east-1'),
            'bedrock_enabled': True,
            'agentcore_enabled': True,
            'services': {
                'bedrock': {'status': 'available', 'models': ['claude-3', 'titan']},
                'lambda': {'status': 'available'},
                's3': {'status': 'available'},
                'dynamodb': {'status': 'available'}
            }
        })
    
    elif request.method == 'POST':
        # In a real implementation, this would update AWS configuration
        return jsonify({'status': 'configuration updated'})

if __name__ == '__main__':
    print("🚀 Starting AWS AgentCore API Server...")
    print("📊 Backend API: http://localhost:5001")
    print("🔍 Health check: http://localhost:5001/health")
    print("🤖 Agents endpoint: http://localhost:5001/api/agents")
    app.run(host='0.0.0.0', port=5001, debug=False)

# ==== MCP Server Management Endpoints =====

@app.route('/api/mcp/deploy', methods=['POST'])
def deploy_mcp_server():
    """Deploy MCP server to AWS AgentCore Runtime"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'server_code', 'requirements']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Generate agent ARN
        agent_id = str(uuid.uuid4())
        agent_arn = f"arn:aws:bedrock-agentcore:us-west-2:123456789012:runtime/{data['name']}-{agent_id[:8]}"
        
        # Simulate deployment process
        deployment_config = {
            'name': data['name'],
            'protocol': 'MCP',
            'server_code': data['server_code'],
            'requirements': data['requirements'],
            'cognito_config': data.get('cognito_config'),
            'deployment_status': 'deploying',
            'created_at': datetime.now().isoformat()
        }
        
        # Store deployment info
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO agents (id, name, framework, status, runtime_config, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            agent_id,
            data['name'],
            'mcp',
            'deploying',
            json.dumps(deployment_config),
            datetime.now().isoformat()
        ))
        conn.commit()
        conn.close()
        
        # Simulate async deployment
        def simulate_deployment():
            time.sleep(5)  # Simulate deployment time
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE agents SET status = ?, updated_at = ?
                WHERE id = ?
            ''', ('deployed', datetime.now().isoformat(), agent_id))
            conn.commit()
            conn.close()
        
        threading.Thread(target=simulate_deployment, daemon=True).start()
        
        return jsonify({
            'agent_arn': agent_arn,
            'deployment_status': 'deploying',
            'mcp_url': f'https://bedrock-agentcore.us-west-2.amazonaws.com/runtimes/{agent_arn.replace(":", "%3A").replace("/", "%2F")}/invocations?qualifier=DEFAULT'
        })
        
    except Exception as e:
        logger.error(f"Error deploying MCP server: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/mcp/test', methods=['POST'])
def test_mcp_server():
    """Test MCP server connection and discover tools"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'url' not in data:
            return jsonify({'error': 'Missing required field: url'}), 400
        
        # Simulate connection test
        time.sleep(1)  # Simulate network delay
        
        # Mock successful connection with sample tools
        mock_tools = [
            {
                'name': 'add_numbers',
                'description': 'Add two numbers together',
                'parameters': {'a': 'number', 'b': 'number'},
                'category': 'math'
            },
            {
                'name': 'multiply_numbers',
                'description': 'Multiply two numbers together',
                'parameters': {'a': 'number', 'b': 'number'},
                'category': 'math'
            },
            {
                'name': 'greet_user',
                'description': 'Greet a user by name',
                'parameters': {'name': 'string'},
                'category': 'text'
            }
        ]
        
        # Simulate occasional connection failures
        if random.random() < 0.1:  # 10% chance of failure
            return jsonify({'error': 'Connection timeout'}), 500
        
        return jsonify({
            'status': 'connected',
            'tools': mock_tools,
            'server_info': {
                'version': '1.0.0',
                'protocol': 'MCP',
                'capabilities': ['tools', 'resources', 'prompts']
            }
        })
        
    except Exception as e:
        logger.error(f"Error testing MCP server: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/mcp/invoke', methods=['POST'])
def invoke_mcp_tool():
    """Invoke an MCP tool"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['server_url', 'tool_name', 'parameters']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        start_time = time.time()
        
        # Simulate tool execution
        time.sleep(random.uniform(0.1, 0.5))  # Simulate execution time
        
        # Mock tool results based on tool name
        tool_name = data['tool_name']
        parameters = data['parameters']
        
        if tool_name == 'add_numbers':
            result = parameters.get('a', 0) + parameters.get('b', 0)
        elif tool_name == 'multiply_numbers':
            result = parameters.get('a', 0) * parameters.get('b', 0)
        elif tool_name == 'greet_user':
            result = f"Hello, {parameters.get('name', 'World')}! Nice to meet you."
        else:
            result = f"Tool {tool_name} executed successfully with parameters: {parameters}"
        
        execution_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        return jsonify({
            'result': result,
            'execution_time': round(execution_time, 2),
            'success': True,
            'tool_name': tool_name,
            'parameters_used': parameters
        })
        
    except Exception as e:
        logger.error(f"Error invoking MCP tool: {str(e)}")
        return jsonify({
            'result': None,
            'execution_time': 0,
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/mcp/setup-cognito', methods=['POST'])
def setup_cognito_auth():
    """Setup Cognito authentication for MCP server"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_pool_name', 'client_name', 'username', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Simulate Cognito setup
        time.sleep(2)  # Simulate setup time
        
        # Generate mock Cognito configuration
        user_pool_id = f"us-east-1_{str(uuid.uuid4()).replace('-', '')[:10]}"
        client_id = str(uuid.uuid4()).replace('-', '')[:26]
        bearer_token = f"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.{str(uuid.uuid4()).replace('-', '')}"
        
        return jsonify({
            'userPoolId': user_pool_id,
            'clientId': client_id,
            'bearerToken': bearer_token,
            'discoveryUrl': f'https://cognito-idp.us-east-1.amazonaws.com/{user_pool_id}/.well-known/openid-configuration',
            'region': data.get('region', 'us-east-1')
        })
        
    except Exception as e:
        logger.error(f"Error setting up Cognito auth: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/mcp/status/<path:agent_arn>', methods=['GET'])
def get_mcp_deployment_status(agent_arn):
    """Get MCP server deployment status"""
    try:
        # Decode the agent ARN
        decoded_arn = agent_arn.replace('%3A', ':').replace('%2F', '/')
        
        # Extract agent ID from ARN
        agent_id = decoded_arn.split('/')[-1].split('-')[-1]
        
        # Query database for deployment status
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT status, runtime_config FROM agents WHERE id LIKE ?', (f'%{agent_id}%',))
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return jsonify({'status': 'not_found'})
        
        status, config_json = result
        config = json.loads(config_json) if config_json else {}
        
        response = {
            'status': status,
            'deployment_logs': [
                'Starting MCP server deployment...',
                'Building container image...',
                'Deploying to AWS AgentCore Runtime...',
                'Configuring authentication...',
                'MCP server ready for connections'
            ]
        }
        
        if status == 'deployed':
            response['mcp_url'] = f'https://bedrock-agentcore.us-west-2.amazonaws.com/runtimes/{agent_arn}/invocations?qualifier=DEFAULT'
        elif status == 'failed':
            response['error_message'] = 'Deployment failed due to configuration error'
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error getting MCP deployment status: {str(e)}")
        return jsonify({'status': 'error', 'error_message': str(e)}), 500

@app.route('/api/mcp/templates', methods=['GET'])
def list_mcp_templates():
    """List available MCP server templates"""
    try:
        templates = [
            {
                'id': 'basic-math',
                'name': 'Basic Math Server',
                'description': 'Simple MCP server with basic mathematical operations',
                'tools': ['add_numbers', 'multiply_numbers', 'divide_numbers'],
                'requirements': ['mcp'],
                'template_code': '''# my_mcp_server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(host="0.0.0.0", stateless_http=True)

@mcp.tool()
def add_numbers(a: int, b: int) -> int:
    """Add two numbers together"""
    return a + b

@mcp.tool()
def multiply_numbers(a: int, b: int) -> int:
    """Multiply two numbers together"""
    return a * b

if __name__ == "__main__":
    mcp.run(transport="streamable-http")'''
            },
            {
                'id': 'text-processing',
                'name': 'Text Processing Server',
                'description': 'MCP server for text manipulation and analysis',
                'tools': ['count_words', 'reverse_text', 'uppercase_text'],
                'requirements': ['mcp'],
                'template_code': '''# text_mcp_server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(host="0.0.0.0", stateless_http=True)

@mcp.tool()
def count_words(text: str) -> int:
    """Count words in text"""
    return len(text.split())

@mcp.tool()
def reverse_text(text: str) -> str:
    """Reverse the given text"""
    return text[::-1]

@mcp.tool()
def uppercase_text(text: str) -> str:
    """Convert text to uppercase"""
    return text.upper()

if __name__ == "__main__":
    mcp.run(transport="streamable-http")'''
            },
            {
                'id': 'data-analysis',
                'name': 'Data Analysis Server',
                'description': 'MCP server for basic data analysis operations',
                'tools': ['calculate_average', 'find_max', 'find_min'],
                'requirements': ['mcp', 'numpy'],
                'template_code': '''# data_mcp_server.py
from mcp.server.fastmcp import FastMCP
from typing import List

mcp = FastMCP(host="0.0.0.0", stateless_http=True)

@mcp.tool()
def calculate_average(numbers: List[float]) -> float:
    """Calculate average of a list of numbers"""
    return sum(numbers) / len(numbers) if numbers else 0

@mcp.tool()
def find_max(numbers: List[float]) -> float:
    """Find maximum value in a list"""
    return max(numbers) if numbers else 0

@mcp.tool()
def find_min(numbers: List[float]) -> float:
    """Find minimum value in a list"""
    return min(numbers) if numbers else 0

if __name__ == "__main__":
    mcp.run(transport="streamable-http")'''
            }
        ]
        
        return jsonify(templates)
        
    except Exception as e:
        logger.error(f"Error listing MCP templates: {str(e)}")
        return jsonify({'error': str(e)}), 500