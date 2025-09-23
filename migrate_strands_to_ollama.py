#!/usr/bin/env python3
"""
Migrate existing Strands agents to main Ollama system
"""

import requests
import json

def migrate_strands_agents():
    """Migrate all Strands agents to main Ollama system"""
    try:
        # Get all Strands agents
        strands_response = requests.get('http://localhost:5006/api/strands-sdk/agents')
        if strands_response.status_code != 200:
            print("Failed to get Strands agents")
            return
        
        strands_agents = strands_response.json().get('agents', [])
        print(f"Found {len(strands_agents)} Strands agents to migrate")
        
        # Get existing Ollama agents to avoid duplicates
        ollama_response = requests.get('http://localhost:5002/api/agents/ollama')
        existing_ollama_agents = ollama_response.json().get('agents', [])
        existing_names = {agent['name'] for agent in existing_ollama_agents}
        
        migrated_count = 0
        
        for agent in strands_agents:
            # Skip if already exists in Ollama system
            if agent['name'] in existing_names:
                print(f"Skipping {agent['name']} - already exists in Ollama system")
                continue
            
            # Prepare payload for Ollama system
            ollama_payload = {
                'name': agent['name'],
                'role': 'Strands AI Agent',
                'description': agent['description'],
                'model': agent['model_id'],
                'personality': 'Advanced reasoning and problem-solving',
                'expertise': ', '.join(agent['tools']) if isinstance(agent['tools'], list) else 'General AI assistance',
                'system_prompt': agent['system_prompt'] or f"You are {agent['name']}, an advanced AI agent with reasoning capabilities.",
                'temperature': agent['ollama_config'].get('temperature', 0.7) if isinstance(agent['ollama_config'], dict) else 0.7,
                'max_tokens': agent['ollama_config'].get('max_tokens', 4000) if isinstance(agent['ollama_config'], dict) else 4000,
                'guardrails_enabled': False,
                'safety_level': 'medium',
                'content_filters': '[]',
                'custom_rules': '[]'
            }
            
            # Register with Ollama system
            ollama_response = requests.post(
                'http://localhost:5002/api/agents/ollama',
                json=ollama_payload,
                timeout=10
            )
            
            if ollama_response.status_code == 200:
                print(f"✅ Migrated: {agent['name']}")
                migrated_count += 1
            else:
                print(f"❌ Failed to migrate {agent['name']}: {ollama_response.status_code}")
        
        print(f"\nMigration completed: {migrated_count} agents migrated")
        
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == '__main__':
    print("Starting Strands to Ollama migration...")
    migrate_strands_agents()
