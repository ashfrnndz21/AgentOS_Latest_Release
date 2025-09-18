#!/usr/bin/env python3
"""
Audit Model Naming Across System
Ensure all model references use actual Ollama model names, not made-up ones
"""

import requests
import json
import os
import re

def get_actual_ollama_models():
    """Get the actual models available in Ollama"""
    print("🔍 Fetching Actual Ollama Models...")
    
    try:
        response = requests.get('http://localhost:5002/api/ollama/models', timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = data.get('models', [])
            
            actual_models = []
            for model in models:
                name = model.get('name', '')
                if name:
                    actual_models.append(name)
            
            print(f"✅ Found {len(actual_models)} actual models:")
            for i, model in enumerate(actual_models, 1):
                print(f"  {i}. {model}")
            
            return actual_models
        else:
            print(f"❌ Failed to get models - Status: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error connecting to Ollama: {e}")
        return []

def find_model_references_in_files():
    """Find all model references in key files"""
    print("\n🔍 Scanning Files for Model References...")
    
    files_to_check = [
        'src/lib/services/FlexibleChatService.ts',
        'src/components/MultiAgentWorkspace/ChatConfigurationWizard.tsx',
        'src/hooks/useOllamaModels.ts',
        'src/lib/services/OllamaService.ts',
        'src/components/CommandCentre/CreateAgent/models/ollama.ts',
        'src/hooks/useOllamaAgentsForPalette.ts',
        'src/lib/services/OllamaAgentService.ts'
    ]
    
    model_references = {}
    
    for file_path in files_to_check:
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Look for common model patterns
                patterns = [
                    r'"([^"]*llama[^"]*)"',
                    r'"([^"]*phi[^"]*)"',
                    r'"([^"]*mistral[^"]*)"',
                    r'"([^"]*qwen[^"]*)"',
                    r'"([^"]*deepseek[^"]*)"',
                    r'"([^"]*gpt[^"]*)"',
                    r'model:\s*["\']([^"\']+)["\']',
                    r'defaultModel:\s*["\']([^"\']+)["\']',
                    r'model\s*=\s*["\']([^"\']+)["\']'
                ]
                
                found_models = set()
                for pattern in patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    for match in matches:
                        if any(keyword in match.lower() for keyword in ['llama', 'phi', 'mistral', 'qwen', 'deepseek', 'gpt']):
                            found_models.add(match)
                
                if found_models:
                    model_references[file_path] = list(found_models)
                    
            except Exception as e:
                print(f"❌ Error reading {file_path}: {e}")
    
    return model_references

def analyze_model_mismatches(actual_models, found_references):
    """Analyze mismatches between actual and referenced models"""
    print("\n🔍 Analyzing Model Mismatches...")
    
    issues = []
    
    for file_path, models in found_references.items():
        print(f"\n📁 {file_path}:")
        for model in models:
            if model in actual_models:
                print(f"  ✅ {model} - VALID")
            else:
                print(f"  ❌ {model} - INVALID/MADE-UP")
                
                # Find closest match
                closest = find_closest_model(model, actual_models)
                if closest:
                    print(f"     💡 Suggested fix: {closest}")
                    issues.append({
                        'file': file_path,
                        'invalid_model': model,
                        'suggested_fix': closest
                    })
                else:
                    issues.append({
                        'file': file_path,
                        'invalid_model': model,
                        'suggested_fix': actual_models[0] if actual_models else 'llama3.2:latest'
                    })
    
    return issues

def find_closest_model(invalid_model, actual_models):
    """Find the closest matching actual model"""
    invalid_lower = invalid_model.lower()
    
    # Direct matches
    for model in actual_models:
        if invalid_lower == model.lower():
            return model
    
    # Partial matches
    for model in actual_models:
        model_lower = model.lower()
        if any(keyword in model_lower for keyword in ['phi', 'llama', 'mistral', 'qwen', 'deepseek']):
            if any(keyword in invalid_lower for keyword in ['phi', 'llama', 'mistral', 'qwen', 'deepseek']):
                # Check if they share a common base
                for keyword in ['phi', 'llama', 'mistral', 'qwen', 'deepseek']:
                    if keyword in invalid_lower and keyword in model_lower:
                        return model
    
    return None

def generate_model_fixes(issues, actual_models):
    """Generate specific fixes for model naming issues"""
    print("\n🔧 Generating Model Fixes...")
    
    if not issues:
        print("✅ No model naming issues found!")
        return
    
    print(f"\n❌ Found {len(issues)} model naming issues:")
    
    # Group by file
    files_to_fix = {}
    for issue in issues:
        file_path = issue['file']
        if file_path not in files_to_fix:
            files_to_fix[file_path] = []
        files_to_fix[file_path].append(issue)
    
    print("\n📋 Files that need fixing:")
    for file_path, file_issues in files_to_fix.items():
        print(f"\n📁 {file_path}:")
        for issue in file_issues:
            print(f"  ❌ Replace: '{issue['invalid_model']}'")
            print(f"  ✅ With: '{issue['suggested_fix']}'")
    
    # Generate standard model configuration
    print(f"\n🎯 Recommended Standard Models:")
    if actual_models:
        # Categorize models
        llama_models = [m for m in actual_models if 'llama' in m.lower()]
        phi_models = [m for m in actual_models if 'phi' in m.lower()]
        mistral_models = [m for m in actual_models if 'mistral' in m.lower()]
        other_models = [m for m in actual_models if not any(x in m.lower() for x in ['llama', 'phi', 'mistral'])]
        
        print(f"  🦙 Llama Models: {llama_models}")
        print(f"  🧠 Phi Models: {phi_models}")
        print(f"  🌟 Mistral Models: {mistral_models}")
        print(f"  🔧 Other Models: {other_models}")
        
        # Recommend defaults
        default_model = actual_models[0]  # First available
        fast_model = next((m for m in actual_models if any(x in m.lower() for x in ['1b', '3b', 'small'])), default_model)
        quality_model = next((m for m in actual_models if any(x in m.lower() for x in ['7b', '8b', '13b', 'latest'])), default_model)
        
        print(f"\n💡 Recommended Defaults:")
        print(f"  🚀 Fast/Light: {fast_model}")
        print(f"  ⚖️ Balanced: {default_model}")
        print(f"  🎯 Quality: {quality_model}")

def create_model_config_template(actual_models):
    """Create a standardized model configuration template"""
    if not actual_models:
        return
    
    print(f"\n📝 Creating Model Configuration Template...")
    
    # Select best models for different use cases
    default_model = actual_models[0]
    fast_model = next((m for m in actual_models if any(x in m.lower() for x in ['1b', '3b'])), default_model)
    quality_model = next((m for m in actual_models if any(x in m.lower() for x in ['7b', '8b', '13b'])), default_model)
    
    config_template = f'''// Standardized Model Configuration
// Generated from actual Ollama models: {len(actual_models)} available

export const OLLAMA_MODELS = {{
  // Available Models (verified)
  AVAILABLE: {json.dumps(actual_models, indent=2)},
  
  // Recommended Defaults
  DEFAULT: "{default_model}",
  FAST: "{fast_model}",
  QUALITY: "{quality_model}",
  
  // Use Cases
  CHAT_INTERFACE: "{default_model}",
  AGENT_PROCESSING: "{quality_model}",
  QUICK_RESPONSES: "{fast_model}",
  
  // Validation
  isValid: (model: string) => {{
    return OLLAMA_MODELS.AVAILABLE.includes(model);
  }},
  
  getDefault: () => OLLAMA_MODELS.DEFAULT,
  getFast: () => OLLAMA_MODELS.FAST,
  getQuality: () => OLLAMA_MODELS.QUALITY
}};

// Type definitions
export type OllamaModelName = typeof OLLAMA_MODELS.AVAILABLE[number];
'''
    
    with open('src/config/ollamaModels.ts', 'w') as f:
        f.write(config_template)
    
    print(f"✅ Created: src/config/ollamaModels.ts")
    print(f"   - {len(actual_models)} verified models")
    print(f"   - Default: {default_model}")
    print(f"   - Fast: {fast_model}")
    print(f"   - Quality: {quality_model}")

def main():
    """Run complete model naming audit"""
    print("🚀 Model Naming Audit")
    print("="*50)
    
    # Get actual models
    actual_models = get_actual_ollama_models()
    
    if not actual_models:
        print("❌ Cannot proceed without Ollama models. Please start Ollama first.")
        return
    
    # Find references in code
    found_references = find_model_references_in_files()
    
    if not found_references:
        print("✅ No model references found in scanned files.")
        return
    
    # Analyze mismatches
    issues = analyze_model_mismatches(actual_models, found_references)
    
    # Generate fixes
    generate_model_fixes(issues, actual_models)
    
    # Create standardized config
    create_model_config_template(actual_models)
    
    print(f"\n" + "="*50)
    print(f"🎯 AUDIT COMPLETE")
    print(f"   Models Available: {len(actual_models)}")
    print(f"   Files Scanned: {len(found_references)}")
    print(f"   Issues Found: {len(issues) if issues else 0}")
    print(f"="*50)

if __name__ == "__main__":
    main()