#!/usr/bin/env python3
"""
Migration script to consolidate data from multiple services into unified system
"""

import sqlite3
import json
import requests
from datetime import datetime

def migrate_a2a_agents():
    """Migrate agents from A2A service"""
    print("[Migration] Migrating A2A agents...")
    
    try:
        # Get agents from A2A service
        response = requests.get('http://localhost:5008/api/a2a/agents')
        if response.status_code == 200:
            a2a_data = response.json()
            agents = a2a_data.get('agents', [])
            
            print(f"[Migration] Found {len(agents)} A2A agents")
            
            # Connect to unified database
            conn = sqlite3.connect('unified_agents.db')
            cursor = conn.cursor()
            
            for agent in agents:
                # Check if agent already exists
                cursor.execute('SELECT id FROM agents WHERE a2a_agent_id = ?', (agent['id'],))
                if cursor.fetchone():
                    print(f"[Migration] Agent {agent['name']} already exists, skipping")
                    continue
                
                # Insert agent
                cursor.execute('''
                    INSERT INTO agents (
                        id, name, description, model_id, host, system_prompt,
                        tools, capabilities, status, framework, a2a_enabled,
                        a2a_agent_id, created_at, updated_at, last_seen
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    str(uuid.uuid4()),  # New unified ID
                    agent['name'],
                    agent['description'],
                    agent['model'],
                    'http://localhost:11434',
                    f"You are {agent['name']}, an AI agent.",
                    json.dumps(agent.get('capabilities', [])),
                    json.dumps(agent.get('capabilities', [])),
                    agent['status'],
                    'a2a',
                    True,
                    agent['id'],  # Keep original A2A ID
                    agent['registered_at'],
                    agent['last_seen'],
                    agent['last_seen']
                ))
                
                print(f"[Migration] Migrated A2A agent: {agent['name']}")
            
            conn.commit()
            conn.close()
            print("[Migration] A2A migration completed")
            
    except Exception as e:
        print(f"[Migration] A2A migration error: {str(e)}")

def migrate_ollama_agents():
    """Migrate agents from Ollama system"""
    print("[Migration] Migrating Ollama agents...")
    
    try:
        # Get agents from Ollama system
        response = requests.get('http://localhost:5002/api/agents/ollama')
        if response.status_code == 200:
            ollama_data = response.json()
            agents = ollama_data.get('agents', [])
            
            print(f"[Migration] Found {len(agents)} Ollama agents")
            
            # Connect to unified database
            conn = sqlite3.connect('unified_agents.db')
            cursor = conn.cursor()
            
            for agent in agents:
                # Check if agent already exists
                cursor.execute('SELECT id FROM agents WHERE id = ?', (agent['id'],))
                if cursor.fetchone():
                    print(f"[Migration] Agent {agent['name']} already exists, skipping")
                    continue
                
                # Insert agent
                cursor.execute('''
                    INSERT INTO agents (
                        id, name, description, model_id, host, system_prompt,
                        tools, capabilities, status, framework, a2a_enabled,
                        ollama_config, created_at, updated_at, last_seen
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    agent['id'],
                    agent['name'],
                    agent['description'],
                    agent['model']['model_id'],
                    'http://localhost:11434',
                    agent.get('system_prompt', ''),
                    json.dumps([]),
                    json.dumps(agent.get('expertise', '').split(', ') if agent.get('expertise') else []),
                    'active',
                    'ollama',
                    False,
                    json.dumps({
                        'temperature': agent.get('temperature', 0.7),
                        'max_tokens': agent.get('max_tokens', 1000)
                    }),
                    agent['created_at'],
                    agent['updated_at'],
                    agent['updated_at']
                ))
                
                print(f"[Migration] Migrated Ollama agent: {agent['name']}")
            
            conn.commit()
            conn.close()
            print("[Migration] Ollama migration completed")
            
    except Exception as e:
        print(f"[Migration] Ollama migration error: {str(e)}")

def migrate_strands_agents():
    """Migrate agents from Strands SDK"""
    print("[Migration] Migrating Strands agents...")
    
    try:
        # Get agents from Strands SDK
        response = requests.get('http://localhost:5006/api/strands-sdk/agents')
        if response.status_code == 200:
            strands_data = response.json()
            agents = strands_data.get('agents', [])
            
            print(f"[Migration] Found {len(agents)} Strands agents")
            
            # Connect to unified database
            conn = sqlite3.connect('unified_agents.db')
            cursor = conn.cursor()
            
            for agent in agents:
                # Check if agent already exists
                cursor.execute('SELECT id FROM agents WHERE id = ?', (agent['id'],))
                if cursor.fetchone():
                    print(f"[Migration] Agent {agent['name']} already exists, skipping")
                    continue
                
                # Parse tools and config
                tools = json.loads(agent.get('tools', '[]'))
                ollama_config = json.loads(agent.get('ollama_config', '{}'))
                
                # Insert agent
                cursor.execute('''
                    INSERT INTO agents (
                        id, name, description, model_id, host, system_prompt,
                        tools, capabilities, status, framework, a2a_enabled,
                        ollama_config, strands_config, created_at, updated_at, last_seen
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    agent['id'],
                    agent['name'],
                    agent['description'],
                    agent['model_id'],
                    agent['host'],
                    agent['system_prompt'],
                    json.dumps(tools),
                    json.dumps(tools),
                    agent['status'],
                    'strands',
                    True,  # Strands agents have A2A enabled
                    json.dumps(ollama_config),
                    json.dumps({}),
                    agent['created_at'],
                    agent['updated_at'],
                    agent['updated_at']
                ))
                
                print(f"[Migration] Migrated Strands agent: {agent['name']}")
            
            conn.commit()
            conn.close()
            print("[Migration] Strands migration completed")
            
    except Exception as e:
        print(f"[Migration] Strands migration error: {str(e)}")

def main():
    """Run migration"""
    print("[Migration] Starting migration to unified system...")
    
    # Initialize unified database
    from unified_agent_service import init_database
    init_database()
    
    # Migrate from all services
    migrate_a2a_agents()
    migrate_ollama_agents()
    migrate_strands_agents()
    
    print("[Migration] Migration completed!")
    print("[Migration] You can now start the unified service with: python unified_agent_service.py")

if __name__ == '__main__':
    import uuid
    main()






