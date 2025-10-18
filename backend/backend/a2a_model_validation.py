
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
