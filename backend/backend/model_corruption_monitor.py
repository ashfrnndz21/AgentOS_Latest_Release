#!/usr/bin/env python3
"""
Model Corruption Monitor - Continuously monitors for model name corruption
"""

import time
import sqlite3
import requests
import logging
from typing import List, Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_database_models():
    """Check models in databases for corruption"""
    corrupted_models = []
    
    # Check Strands SDK database
    try:
        conn = sqlite3.connect('strands_sdk_agents.db')
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, model_id FROM strands_sdk_agents WHERE status = 'active'")
        agents = cursor.fetchall()
        
        for agent_id, name, model_id in agents:
            if is_corrupted_model(model_id):
                corrupted_models.append({
                    'database': 'strands_sdk',
                    'agent_id': agent_id,
                    'name': name,
                    'model': model_id
                })
        
        conn.close()
    except Exception as e:
        logger.error(f"Error checking Strands SDK database: {e}")
    
    # Check A2A database
    try:
        conn = sqlite3.connect('a2a_communication.db')
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, model FROM a2a_agents WHERE status = 'active'")
        agents = cursor.fetchall()
        
        for agent_id, name, model in agents:
            if is_corrupted_model(model):
                corrupted_models.append({
                    'database': 'a2a',
                    'agent_id': agent_id,
                    'name': name,
                    'model': model
                })
        
        conn.close()
    except Exception as e:
        logger.error(f"Error checking A2A database: {e}")
    
    return corrupted_models

def check_service_models():
    """Check models in running services for corruption"""
    corrupted_models = []
    
    try:
        # Check A2A service
        response = requests.get('http://localhost:5008/api/a2a/agents', timeout=5)
        if response.status_code == 200:
            agents = response.json().get('agents', [])
            for agent in agents:
                model = agent.get('model', '')
                if is_corrupted_model(model):
                    corrupted_models.append({
                        'service': 'a2a',
                        'agent_id': agent.get('id'),
                        'name': agent.get('name'),
                        'model': model
                    })
    except Exception as e:
        logger.error(f"Error checking A2A service: {e}")
    
    return corrupted_models

def is_corrupted_model(model: str) -> bool:
    """Check if a model name is corrupted"""
    if not model or not isinstance(model, str):
        return True
    
    corrupted_patterns = [
        model.startswith('You are'),
        model.startswith('I am'),
        model.startswith('This is'),
        'assistant' in model.lower(),
        'expert' in model.lower(),
        'specialist' in model.lower(),
    ]
    
    return any(corrupted_patterns)

def main():
    """Main monitoring loop"""
    logger.info("Starting model corruption monitoring...")
    
    while True:
        try:
            # Check databases
            db_corrupted = check_database_models()
            if db_corrupted:
                logger.warning(f"Found {len(db_corrupted)} corrupted models in databases:")
                for model in db_corrupted:
                    logger.warning(f"  {model}")
            
            # Check services
            service_corrupted = check_service_models()
            if service_corrupted:
                logger.warning(f"Found {len(service_corrupted)} corrupted models in services:")
                for model in service_corrupted:
                    logger.warning(f"  {model}")
            
            # If no corruption found, log success
            if not db_corrupted and not service_corrupted:
                logger.info("✅ No model corruption detected")
            
            # Wait before next check
            time.sleep(60)  # Check every minute
            
        except KeyboardInterrupt:
            logger.info("Monitoring stopped by user")
            break
        except Exception as e:
            logger.error(f"Error in monitoring loop: {e}")
            time.sleep(60)

if __name__ == "__main__":
    main()
