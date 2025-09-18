#!/usr/bin/env python3
"""
Agent Registry Service
Central registry for A2A agent discovery and health monitoring
"""

import requests
import json
import sqlite3
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Registry Database
REGISTRY_DB = "agent_registry.db"

def init_registry_database():
    """Initialize the agent registry database"""
    conn = sqlite3.connect(REGISTRY_DB)
    cursor = conn.cursor()
    
    # Agents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            url TEXT NOT NULL,
            capabilities TEXT,
            status TEXT DEFAULT 'unknown',
            last_health_check TIMESTAMP,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("📊 Agent Registry database initialized")

# Initialize database
init_registry_database()

class AgentRegistry:
    """Manages agent registration and discovery"""
    
    def __init__(self):
        self.agents: Dict[str, Dict[str, Any]] = {}
        self.health_check_interval = 30  # seconds
        self.start_health_monitoring()
    
    def register_agent(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register an agent in the registry"""
        try:
            agent_id = agent_data.get('id', f"agent_{len(self.agents) + 1}")
            
            # Store in database
            conn = sqlite3.connect(REGISTRY_DB)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO agents 
                (id, name, description, url, capabilities, status, registered_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                agent_id,
                agent_data.get('name', ''),
                agent_data.get('description', ''),
                agent_data.get('url', ''),
                json.dumps(agent_data.get('capabilities', [])),
                'active',
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
            
            conn.commit()
            conn.close()
            
            # Store in memory
            self.agents[agent_id] = {
                **agent_data,
                'status': 'active',
                'registered_at': datetime.now().isoformat(),
                'last_health_check': None
            }
            
            print(f"✅ Agent registered: {agent_data.get('name')} at {agent_data.get('url')}")
            
            return {
                "status": "success",
                "agent_id": agent_id,
                "message": "Agent registered successfully"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_agents(self) -> List[Dict[str, Any]]:
        """Get all registered agents"""
        return list(self.agents.values())
    
    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific agent by ID"""
        return self.agents.get(agent_id)
    
    def discover_agent(self, url: str) -> Dict[str, Any]:
        """Discover an agent at a given URL"""
        try:
            # Check health
            health_response = requests.get(f"{url}/health", timeout=5)
            if health_response.status_code != 200:
                return {
                    "status": "error",
                    "error": "Agent not responding to health check"
                }
            
            # Get capabilities
            capabilities_response = requests.get(f"{url}/capabilities", timeout=5)
            capabilities_data = capabilities_response.json() if capabilities_response.status_code == 200 else {}
            
            # Register the discovered agent
            agent_data = {
                "id": f"discovered_{len(self.agents) + 1}",
                "name": capabilities_data.get('agent_name', 'Discovered Agent'),
                "description": capabilities_data.get('description', ''),
                "url": url,
                "capabilities": capabilities_data.get('capabilities', [])
            }
            
            result = self.register_agent(agent_data)
            return result
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def health_check_agent(self, agent_id: str) -> Dict[str, Any]:
        """Perform health check on an agent"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                return {"status": "error", "error": "Agent not found"}
            
            url = agent['url']
            response = requests.get(f"{url}/health", timeout=5)
            
            if response.status_code == 200:
                agent['status'] = 'active'
                agent['last_health_check'] = datetime.now().isoformat()
                return {"status": "healthy", "agent_id": agent_id}
            else:
                agent['status'] = 'unhealthy'
                return {"status": "unhealthy", "agent_id": agent_id}
                
        except Exception as e:
            agent['status'] = 'unreachable'
            return {"status": "error", "error": str(e), "agent_id": agent_id}
    
    def start_health_monitoring(self):
        """Start background health monitoring"""
        def monitor_agents():
            while True:
                try:
                    for agent_id in list(self.agents.keys()):
                        self.health_check_agent(agent_id)
                    time.sleep(self.health_check_interval)
                except Exception as e:
                    print(f"Health monitoring error: {e}")
                    time.sleep(5)
        
        monitor_thread = threading.Thread(target=monitor_agents, daemon=True)
        monitor_thread.start()
        print("🔍 Health monitoring started")

# Global registry instance
registry = AgentRegistry()

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    """Registry health check"""
    return jsonify({
        "status": "healthy",
        "service": "Agent Registry",
        "agents_count": len(registry.agents),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/agents', methods=['GET'])
def list_agents():
    """List all registered agents"""
    return jsonify({
        "status": "success",
        "agents": registry.get_agents(),
        "count": len(registry.agents)
    })

@app.route('/agents', methods=['POST'])
def register_agent():
    """Register a new agent"""
    try:
        data = request.get_json()
        result = registry.register_agent(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/agents/<agent_id>', methods=['GET'])
def get_agent(agent_id):
    """Get a specific agent"""
    agent = registry.get_agent(agent_id)
    if agent:
        return jsonify({"status": "success", "agent": agent})
    else:
        return jsonify({"status": "error", "error": "Agent not found"}), 404

@app.route('/discover', methods=['POST'])
def discover_agent():
    """Discover an agent at a URL"""
    try:
        data = request.get_json()
        url = data.get('url')
        if not url:
            return jsonify({"status": "error", "error": "URL required"}), 400
        
        result = registry.discover_agent(url)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/agents/<agent_id>/health', methods=['POST'])
def check_agent_health(agent_id):
    """Check health of a specific agent"""
    result = registry.health_check_agent(agent_id)
    return jsonify(result)

if __name__ == '__main__':
    print("🚀 Starting Agent Registry Service...")
    print("📍 Port: 5010")
    print("🔍 Health monitoring enabled")
    
    # Auto-register default agents
    default_agents = [
        {
            "id": "calculator",
            "name": "Calculator Agent",
            "description": "Mathematical calculation specialist",
            "url": "http://localhost:8001",
            "capabilities": ["calculator", "think"]
        },
        {
            "id": "research",
            "name": "Research Agent", 
            "description": "Research and analysis specialist",
            "url": "http://localhost:8002",
            "capabilities": ["current_time", "think"]
        },
        {
            "id": "coordinator",
            "name": "Coordinator Agent",
            "description": "Multi-agent coordination specialist",
            "url": "http://localhost:8000",
            "capabilities": ["coordinate_agents", "think"]
        }
    ]
    
    for agent_data in default_agents:
        registry.register_agent(agent_data)
    
    app.run(host='0.0.0.0', port=5010, debug=False)
