#!/usr/bin/env python3
"""
Model Validation Fix - Permanent Solution for Model Name Issues
This script implements comprehensive model validation and correction across all services
"""

import os
import sys
import json
import sqlite3
import logging
from typing import Dict, List, Optional, Any
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"
STRANDS_SDK_DB = "strands_sdk_agents.db"
A2A_DB = "a2a_communication.db"

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

# Default fallback models
DEFAULT_MODELS = {
    'technical': 'granite4:micro',
    'creative': 'qwen3:1.7b',
    'general': 'granite4:micro',
    'default': 'granite4:micro'
}

class ModelValidator:
    """Comprehensive model validation and correction system"""
    
    def __init__(self):
        self.valid_models_cache = set()
        self._load_valid_models()
    
    def _load_valid_models(self):
        """Load valid models from Ollama"""
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.valid_models_cache = {model['name'] for model in data.get('models', [])}
                logger.info(f"Loaded {len(self.valid_models_cache)} valid models from Ollama")
            else:
                logger.warning("Could not load models from Ollama, using fallback validation")
        except Exception as e:
            logger.warning(f"Error loading models from Ollama: {e}")
    
    def is_valid_model(self, model: str) -> bool:
        """Check if a model name is valid"""
        if not model or not isinstance(model, str):
            return False
        
        # Check against invalid patterns first
        import re
        for pattern in INVALID_MODEL_PATTERNS:
            if re.match(pattern, model, re.IGNORECASE):
                return False
        
        # Check against valid patterns
        for pattern in VALID_MODEL_PATTERNS:
            if re.match(pattern, model):
                return True
        
        # Check if it's in our valid models cache
        if model in self.valid_models_cache:
            return True
        
        return False
    
    def get_corrected_model(self, invalid_model: str, agent_capabilities: List[str] = None) -> str:
        """Get a corrected model name based on agent capabilities"""
        if not invalid_model or not isinstance(invalid_model, str):
            return DEFAULT_MODELS['default']
        
        # If it's already valid, return as-is
        if self.is_valid_model(invalid_model):
            return invalid_model
        
        # Determine model based on capabilities
        if agent_capabilities:
            capabilities_str = ' '.join(agent_capabilities).lower()
            
            if any(word in capabilities_str for word in ['technical', 'programming', 'code', 'system']):
                return DEFAULT_MODELS['technical']
            elif any(word in capabilities_str for word in ['creative', 'writing', 'poetry', 'content']):
                return DEFAULT_MODELS['creative']
        
        return DEFAULT_MODELS['default']
    
    def validate_and_correct_agent(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and correct an agent's model"""
        corrected_agent = agent_data.copy()
        original_model = agent_data.get('model', '') or agent_data.get('model_id', '')
        
        if not self.is_valid_model(original_model):
            corrected_model = self.get_corrected_model(
                original_model, 
                agent_data.get('capabilities', [])
            )
            
            logger.info(f"Correcting model: '{original_model}' -> '{corrected_model}'")
            
            # Update both model and model_id fields
            corrected_agent['model'] = corrected_model
            corrected_agent['model_id'] = corrected_model
            corrected_agent['model_corrected'] = True
            corrected_agent['original_model'] = original_model
        
        return corrected_agent

class DatabaseModelFixer:
    """Fix model names in databases"""
    
    def __init__(self):
        self.validator = ModelValidator()
    
    def fix_strands_sdk_database(self):
        """Fix model names in Strands SDK database"""
        if not os.path.exists(STRANDS_SDK_DB):
            logger.info("Strands SDK database not found, skipping")
            return
        
        try:
            conn = sqlite3.connect(STRANDS_SDK_DB)
            cursor = conn.cursor()
            
            # Get all agents with potentially invalid models
            cursor.execute("SELECT id, name, description, model_id, tools FROM strands_sdk_agents WHERE status = 'active'")
            agents = cursor.fetchall()
            
            fixed_count = 0
            for agent in agents:
                agent_id, name, description, model_id, tools_json = agent
                
                if not self.validator.is_valid_model(model_id):
                    # Parse capabilities from tools
                    try:
                        tools = json.loads(tools_json) if tools_json else []
                        capabilities = [tool.get('name', '') for tool in tools if isinstance(tool, dict)]
                    except:
                        capabilities = []
                    
                    # Get corrected model
                    corrected_model = self.validator.get_corrected_model(model_id, capabilities)
                    
                    # Update database
                    cursor.execute(
                        "UPDATE strands_sdk_agents SET model_id = ? WHERE id = ?",
                        (corrected_model, agent_id)
                    )
                    
                    logger.info(f"Fixed Strands SDK agent {name}: {model_id} -> {corrected_model}")
                    fixed_count += 1
            
            conn.commit()
            conn.close()
            
            logger.info(f"Fixed {fixed_count} agents in Strands SDK database")
            
        except Exception as e:
            logger.error(f"Error fixing Strands SDK database: {e}")
    
    def fix_a2a_database(self):
        """Fix model names in A2A database"""
        if not os.path.exists(A2A_DB):
            logger.info("A2A database not found, skipping")
            return
        
        try:
            conn = sqlite3.connect(A2A_DB)
            cursor = conn.cursor()
            
            # Get all agents with potentially invalid models
            cursor.execute("SELECT id, name, description, model, capabilities FROM a2a_agents WHERE status = 'active'")
            agents = cursor.fetchall()
            
            fixed_count = 0
            for agent in agents:
                agent_id, name, description, model, capabilities_json = agent
                
                if not self.validator.is_valid_model(model):
                    # Parse capabilities
                    try:
                        capabilities = json.loads(capabilities_json) if capabilities_json else []
                    except:
                        capabilities = []
                    
                    # Get corrected model
                    corrected_model = self.validator.get_corrected_model(model, capabilities)
                    
                    # Update database
                    cursor.execute(
                        "UPDATE a2a_agents SET model = ? WHERE id = ?",
                        (corrected_model, agent_id)
                    )
                    
                    logger.info(f"Fixed A2A agent {name}: {model} -> {corrected_model}")
                    fixed_count += 1
            
            conn.commit()
            conn.close()
            
            logger.info(f"Fixed {fixed_count} agents in A2A database")
            
        except Exception as e:
            logger.error(f"Error fixing A2A database: {e}")
    
    def fix_all_databases(self):
        """Fix model names in all databases"""
        logger.info("Starting comprehensive model validation and correction...")
        
        self.fix_strands_sdk_database()
        self.fix_a2a_database()
        
        logger.info("Model validation and correction completed")

class ServiceModelFixer:
    """Fix model names in running services"""
    
    def __init__(self):
        self.validator = ModelValidator()
    
    def fix_a2a_service_agents(self):
        """Fix model names in A2A service"""
        try:
            # Get all agents from A2A service
            response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents", timeout=10)
            if response.status_code != 200:
                logger.warning("Could not connect to A2A service")
                return
            
            agents = response.json().get('agents', [])
            fixed_count = 0
            
            for agent in agents:
                agent_id = agent.get('id')
                model = agent.get('model', '')
                
                if not self.validator.is_valid_model(model):
                    # Get corrected model
                    capabilities = agent.get('capabilities', [])
                    corrected_model = self.validator.get_corrected_model(model, capabilities)
                    
                    # Update via API
                    update_response = requests.post(
                        f"{A2A_SERVICE_URL}/api/a2a/agents/{agent_id}/update-model",
                        json={'model': corrected_model},
                        timeout=10
                    )
                    
                    if update_response.status_code == 200:
                        logger.info(f"Fixed A2A service agent {agent.get('name')}: {model} -> {corrected_model}")
                        fixed_count += 1
                    else:
                        logger.warning(f"Failed to update agent {agent_id}")
            
            logger.info(f"Fixed {fixed_count} agents in A2A service")
            
        except Exception as e:
            logger.error(f"Error fixing A2A service agents: {e}")
    
    def restart_agent_backends(self):
        """Restart agent backends to load corrected models"""
        try:
            # Get all agents with dedicated backends
            response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents", timeout=10)
            if response.status_code != 200:
                return
            
            agents = response.json().get('agents', [])
            
            for agent in agents:
                agent_id = agent.get('id')
                backend_status = agent.get('dedicated_backend_status', {})
                
                if backend_status.get('status') == 'running':
                    # Restart the backend
                    restart_response = requests.post(
                        f"{A2A_SERVICE_URL}/api/a2a/agents/{agent_id}/restart-backend",
                        timeout=30
                    )
                    
                    if restart_response.status_code == 200:
                        logger.info(f"Restarted backend for agent {agent.get('name')}")
                    else:
                        logger.warning(f"Failed to restart backend for agent {agent_id}")
            
        except Exception as e:
            logger.error(f"Error restarting agent backends: {e}")

def main():
    """Main function to run comprehensive model validation and correction"""
    logger.info("🚀 Starting comprehensive model validation and correction...")
    
    # Step 1: Fix databases
    db_fixer = DatabaseModelFixer()
    db_fixer.fix_all_databases()
    
    # Step 2: Fix running services
    service_fixer = ServiceModelFixer()
    service_fixer.fix_a2a_service_agents()
    
    # Step 3: Restart backends
    service_fixer.restart_agent_backends()
    
    logger.info("✅ Model validation and correction completed successfully!")
    
    # Step 4: Verify fixes
    logger.info("🔍 Verifying fixes...")
    
    try:
        response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents", timeout=10)
        if response.status_code == 200:
            agents = response.json().get('agents', [])
            validator = ModelValidator()
            
            invalid_count = 0
            for agent in agents:
                model = agent.get('model', '')
                if not validator.is_valid_model(model):
                    invalid_count += 1
                    logger.warning(f"Agent {agent.get('name')} still has invalid model: {model}")
            
            if invalid_count == 0:
                logger.info("✅ All agents now have valid models!")
            else:
                logger.warning(f"⚠️ {invalid_count} agents still have invalid models")
        
    except Exception as e:
        logger.error(f"Error verifying fixes: {e}")

if __name__ == "__main__":
    main()

