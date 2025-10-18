
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
