#!/usr/bin/env python3
"""
Debug script to test Strands SDK execution step by step
"""

import sys
import os
import json
import sqlite3
from datetime import datetime

# Add the backend directory to the path
sys.path.append('backend')

try:
    from strands_sdk import Agent, OllamaModel
    print("✅ Strands SDK imported successfully")
except ImportError as e:
    print(f"❌ Failed to import Strands SDK: {e}")
    sys.exit(1)

def test_ollama_connection():
    """Test direct Ollama connection"""
    print("\n🔍 Testing Ollama Connection...")
    
    try:
        # Test basic Ollama model creation
        model = OllamaModel(
            host="http://localhost:11434",
            model_id="qwen3:1.7b"
        )
        print(f"✅ Ollama model created: {model}")
        
        # Test agent creation
        agent = Agent(
            model=model,
            system_prompt="You are a helpful assistant. Write short, creative responses."
        )
        print(f"✅ Agent created: {agent}")
        
        # Test agent execution
        print("\n🧪 Testing agent execution...")
        response = agent("Write a short poem about Python programming")
        print(f"✅ Agent response type: {type(response)}")
        print(f"✅ Agent response: {response}")
        
        # Check response attributes
        if hasattr(response, '__dict__'):
            print(f"✅ Response attributes: {response.__dict__}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in Ollama test: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database_agent():
    """Test agent from database"""
    print("\n🔍 Testing Database Agent...")
    
    try:
        # Connect to database
        conn = sqlite3.connect('backend/strands_sdk_agents.db')
        cursor = conn.cursor()
        
        # Get the agent we created
        cursor.execute('SELECT * FROM strands_sdk_agents WHERE id = ?', ('801a8475-e46d-4cbd-a868-c0493c63cb97',))
        agent_data = cursor.fetchone()
        
        if not agent_data:
            print("❌ Agent not found in database")
            return False
        
        print(f"✅ Agent found: {agent_data[1]}")  # name
        
        # Extract agent configuration
        agent_config = {
            'id': agent_data[0],
            'name': agent_data[1],
            'description': agent_data[2],
            'model_id': agent_data[3],
            'host': agent_data[4],
            'system_prompt': agent_data[5],
            'tools': json.loads(agent_data[6]) if agent_data[6] else [],
            'ollama_config': json.loads(agent_data[7]) if agent_data[7] else {},
            'sdk_version': agent_data[8],
            'created_at': agent_data[9],
            'updated_at': agent_data[10],
            'status': agent_data[11],
            'model_provider': agent_data[12],
            'sdk_config': json.loads(agent_data[13]) if agent_data[13] else {}
        }
        
        print(f"✅ Agent config: {json.dumps(agent_config, indent=2)}")
        
        # Create model
        model = OllamaModel(
            host=agent_config['host'],
            model_id=agent_config['model_id']
        )
        print(f"✅ Model created: {model}")
        
        # Create agent
        agent = Agent(
            model=model,
            system_prompt=agent_config['system_prompt']
        )
        print(f"✅ Agent created: {agent}")
        
        # Test execution
        print("\n🧪 Testing database agent execution...")
        response = agent("Write a short poem about Python programming")
        print(f"✅ Response type: {type(response)}")
        print(f"✅ Response: {response}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error in database test: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main debug function"""
    print("🔍 Strands SDK Execution Debug")
    print("=" * 50)
    
    # Test 1: Direct Ollama connection
    if test_ollama_connection():
        print("\n✅ Direct Ollama test passed")
    else:
        print("\n❌ Direct Ollama test failed")
        return
    
    # Test 2: Database agent
    if test_database_agent():
        print("\n✅ Database agent test passed")
    else:
        print("\n❌ Database agent test failed")

if __name__ == "__main__":
    main()



