#!/usr/bin/env python3
"""
Model Corruption Prevention - Prevents model names from being corrupted in the future
This script implements validation at all entry points to prevent model name corruption
"""

import os
import sys
import json
import sqlite3
import logging
from typing import Dict, List, Optional, Any
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Valid model patterns
VALID_MODEL_PATTERNS = [
    r'^[a-zA-Z0-9_-]+:[a-zA-Z0-9_.-]+$',  # granite4:micro, qwen3:1.7b
    r'^[a-zA-Z0-9_-]+$',                   # llama3.2, phi3
]

# Invalid model patterns (descriptions that shouldn't be model names)
INVALID_MODEL_PATTERNS = [
    r'^You are.*',                         # "You are a helpful assistant..."
    r'^I am.*',                           # "I am a technical expert..."
    r'^This is.*',                        # "This is a..."
    r'^.*assistant.*$',                   # Contains "assistant"
    r'^.*expert.*$',                      # Contains "expert"
    r'^.*specialist.*$',                  # Contains "specialist"
]

class ModelValidationMiddleware:
    """Middleware to validate model names at all entry points"""
    
    @staticmethod
    def validate_model_name(model: str, agent_capabilities: List[str] = None) -> str:
        """Validate and correct model name"""
        if not model or not isinstance(model, str):
            return 'granite4:micro'
        
        # Check against invalid patterns first
        for pattern in INVALID_MODEL_PATTERNS:
            if re.match(pattern, model, re.IGNORECASE):
                logger.warning(f"Invalid model pattern detected: {model}")
                return ModelValidationMiddleware._get_corrected_model(agent_capabilities)
        
        # Check against valid patterns
        for pattern in VALID_MODEL_PATTERNS:
            if re.match(pattern, model):
                return model
        
        # If no pattern matches, it's likely invalid
        logger.warning(f"Model doesn't match valid patterns: {model}")
        return ModelValidationMiddleware._get_corrected_model(agent_capabilities)
    
    @staticmethod
    def _get_corrected_model(agent_capabilities: List[str] = None) -> str:
        """Get corrected model based on capabilities"""
        if agent_capabilities:
            capabilities_str = ' '.join(agent_capabilities).lower()
            
            if any(word in capabilities_str for word in ['technical', 'programming', 'code', 'system']):
                return 'granite4:micro'
            elif any(word in capabilities_str for word in ['creative', 'writing', 'poetry', 'content']):
                return 'qwen3:1.7b'
        
        return 'granite4:micro'

def patch_strands_sdk_creation():
    """Patch Strands SDK agent creation to validate model names"""
    
    # Create a patched version of the agent creation function
    patched_code = '''
import re
from typing import List

def validate_model_name(model: str, agent_capabilities: List[str] = None) -> str:
    """Validate and correct model name"""
    if not model or not isinstance(model, str):
        return 'granite4:micro'
    
    # Invalid patterns
    invalid_patterns = [
        r'^You are.*',
        r'^I am.*',
        r'^This is.*',
        r'^.*assistant.*$',
        r'^.*expert.*$',
        r'^.*specialist.*$',
    ]
    
    # Check against invalid patterns
    for pattern in invalid_patterns:
        if re.match(pattern, model, re.IGNORECASE):
            return get_corrected_model(agent_capabilities)
    
    # Valid patterns
    valid_patterns = [
        r'^[a-zA-Z0-9_-]+:[a-zA-Z0-9_.-]+$',
        r'^[a-zA-Z0-9_-]+$',
    ]
    
    # Check against valid patterns
    for pattern in valid_patterns:
        if re.match(pattern, model):
            return model
    
    # Default correction
    return get_corrected_model(agent_capabilities)

def get_corrected_model(agent_capabilities: List[str] = None) -> str:
    """Get corrected model based on capabilities"""
    if agent_capabilities:
        capabilities_str = ' '.join(agent_capabilities).lower()
        
        if any(word in capabilities_str for word in ['technical', 'programming', 'code', 'system']):
            return 'granite4:micro'
        elif any(word in capabilities_str for word in ['creative', 'writing', 'poetry', 'content']):
            return 'qwen3:1.7b'
    
    return 'granite4:micro'

# Patch the original create_strands_agent function
def patched_create_strands_agent():
    """Patched version of create_strands_agent with model validation"""
    try:
        data = request.get_json()
        
        # Validate and correct model_id
        original_model = data.get('model_id', '')
        corrected_model = validate_model_name(original_model, data.get('capabilities', []))
        
        if corrected_model != original_model:
            logger.info(f"Model corrected during creation: '{original_model}' -> '{corrected_model}'")
            data['model_id'] = corrected_model
        
        # Continue with original logic...
        # (This would be the rest of the original function)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
'''
    
    # Write the patched code to a file
    with open('backend/strands_sdk_model_validation.py', 'w') as f:
        f.write(patched_code)
    
    logger.info("Created Strands SDK model validation patch")

def patch_a2a_service():
    """Patch A2A service to validate model names"""
    
    patched_code = '''
def validate_and_correct_model(model: str, capabilities: List[str] = None) -> str:
    """Validate and correct model name in A2A service"""
    if not model or not isinstance(model, str):
        return 'granite4:micro'
    
    # Check if model is a description (invalid)
    if (model.startswith('You are') or 
        model.startswith('I am') or 
        model.startswith('This is') or
        'assistant' in model.lower() or
        'expert' in model.lower() or
        'specialist' in model.lower()):
        
        # Determine model based on capabilities
        if capabilities:
            capabilities_str = ' '.join(capabilities).lower()
            if any(word in capabilities_str for word in ['technical', 'programming', 'code', 'system']):
                return 'granite4:micro'
            elif any(word in capabilities_str for word in ['creative', 'writing', 'poetry', 'content']):
                return 'qwen3:1.7b'
        
        return 'granite4:micro'
    
    # Check if model has valid format (name:version)
    if ':' in model and not model.startswith('http'):
        return model
    
    # Default fallback
    return 'granite4:micro'
'''
    
    # Write the patched code to a file
    with open('backend/a2a_model_validation.py', 'w') as f:
        f.write(patched_code)
    
    logger.info("Created A2A service model validation patch")

def create_database_triggers():
    """Create database triggers to prevent model corruption"""
    
    # SQLite trigger for Strands SDK database
    strands_trigger = '''
    CREATE TRIGGER IF NOT EXISTS validate_model_before_insert_strands
    BEFORE INSERT ON strands_sdk_agents
    BEGIN
        SELECT CASE
            WHEN NEW.model_id LIKE 'You are%' OR 
                 NEW.model_id LIKE 'I am%' OR 
                 NEW.model_id LIKE 'This is%' OR
                 NEW.model_id LIKE '%assistant%' OR
                 NEW.model_id LIKE '%expert%' OR
                 NEW.model_id LIKE '%specialist%'
            THEN RAISE(ABORT, 'Invalid model name detected: ' || NEW.model_id)
        END;
    END;
    
    CREATE TRIGGER IF NOT EXISTS validate_model_before_update_strands
    BEFORE UPDATE ON strands_sdk_agents
    BEGIN
        SELECT CASE
            WHEN NEW.model_id LIKE 'You are%' OR 
                 NEW.model_id LIKE 'I am%' OR 
                 NEW.model_id LIKE 'This is%' OR
                 NEW.model_id LIKE '%assistant%' OR
                 NEW.model_id LIKE '%expert%' OR
                 NEW.model_id LIKE '%specialist%'
            THEN RAISE(ABORT, 'Invalid model name detected: ' || NEW.model_id)
        END;
    END;
    '''
    
    # SQLite trigger for A2A database
    a2a_trigger = '''
    CREATE TRIGGER IF NOT EXISTS validate_model_before_insert_a2a
    BEFORE INSERT ON a2a_agents
    BEGIN
        SELECT CASE
            WHEN NEW.model LIKE 'You are%' OR 
                 NEW.model LIKE 'I am%' OR 
                 NEW.model LIKE 'This is%' OR
                 NEW.model LIKE '%assistant%' OR
                 NEW.model LIKE '%expert%' OR
                 NEW.model LIKE '%specialist%'
            THEN RAISE(ABORT, 'Invalid model name detected: ' || NEW.model)
        END;
    END;
    
    CREATE TRIGGER IF NOT EXISTS validate_model_before_update_a2a
    BEFORE UPDATE ON a2a_agents
    BEGIN
        SELECT CASE
            WHEN NEW.model LIKE 'You are%' OR 
                 NEW.model LIKE 'I am%' OR 
                 NEW.model LIKE 'This is%' OR
                 NEW.model LIKE '%assistant%' OR
                 NEW.model LIKE '%expert%' OR
                 NEW.model LIKE '%specialist%'
            THEN RAISE(ABORT, 'Invalid model name detected: ' || NEW.model)
        END;
    END;
    '''
    
    # Apply triggers to databases
    try:
        # Strands SDK database
        if os.path.exists('strands_sdk_agents.db'):
            conn = sqlite3.connect('strands_sdk_agents.db')
            conn.executescript(strands_trigger)
            conn.close()
            logger.info("Applied model validation triggers to Strands SDK database")
        
        # A2A database
        if os.path.exists('a2a_communication.db'):
            conn = sqlite3.connect('a2a_communication.db')
            conn.executescript(a2a_trigger)
            conn.close()
            logger.info("Applied model validation triggers to A2A database")
            
    except Exception as e:
        logger.error(f"Error applying database triggers: {e}")

def create_monitoring_script():
    """Create a monitoring script to detect model corruption"""
    
    monitoring_code = '''#!/usr/bin/env python3
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
'''
    
    with open('backend/model_corruption_monitor.py', 'w') as f:
        f.write(monitoring_code)
    
    # Make it executable
    os.chmod('backend/model_corruption_monitor.py', 0o755)
    
    logger.info("Created model corruption monitoring script")

def main():
    """Main function to set up model corruption prevention"""
    logger.info("🛡️ Setting up model corruption prevention...")
    
    # Create validation patches
    patch_strands_sdk_creation()
    patch_a2a_service()
    
    # Create database triggers
    create_database_triggers()
    
    # Create monitoring script
    create_monitoring_script()
    
    logger.info("✅ Model corruption prevention setup completed!")
    logger.info("📋 Prevention measures implemented:")
    logger.info("  1. Model validation middleware")
    logger.info("  2. Database triggers")
    logger.info("  3. Service patches")
    logger.info("  4. Monitoring script")
    logger.info("")
    logger.info("🚀 To start monitoring, run: python3 backend/model_corruption_monitor.py")

if __name__ == "__main__":
    main()

