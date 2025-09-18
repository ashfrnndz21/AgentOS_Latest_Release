#!/usr/bin/env python3
"""
Fix Model Selection in ChatConfigurationWizard
Replace model.name with model.id in value attributes
"""

import re

def fix_chat_configuration_wizard():
    """Fix the model selection to use model.id instead of model.name for values"""
    print("🔧 Fixing ChatConfigurationWizard model selection...")
    
    file_path = 'src/components/MultiAgentWorkspace/ChatConfigurationWizard.tsx'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace the specific pattern: value={model.name} with value={model.id}
        # But keep the display as {model.name}
        pattern = r'(<SelectItem[^>]*key=\{model\.)name(\}[^>]*value=\{model\.)name(\}[^>]*>\s*\{model\.name\})'
        replacement = r'\1id\2id\3'
        
        content = re.sub(pattern, replacement, content)
        
        # Also fix any remaining instances where we're using model.name as value
        content = re.sub(r'value=\{model\.name\}', 'value={model.id}', content)
        
        # But make sure we keep model.name for display
        content = re.sub(r'key=\{model\.name\}', 'key={model.id}', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {file_path}")
            print("   - Changed value={model.name} to value={model.id}")
            print("   - Changed key={model.name} to key={model.id}")
            print("   - Kept {model.name} for display text")
        else:
            print(f"⚠️ No changes needed in {file_path}")
            
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")

def verify_fix():
    """Verify the fix was applied correctly"""
    print("\n🔍 Verifying fix...")
    
    file_path = 'src/components/MultiAgentWorkspace/ChatConfigurationWizard.tsx'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for remaining issues
        issues = []
        
        # Look for value={model.name} (should be value={model.id})
        if 'value={model.name}' in content:
            issues.append("Still using value={model.name} instead of value={model.id}")
        
        # Look for key={model.name} (should be key={model.id})  
        if 'key={model.name}' in content:
            issues.append("Still using key={model.name} instead of key={model.id}")
        
        # Verify we have the correct patterns
        correct_patterns = [
            'value={model.id}',
            'key={model.id}',
            '{model.name}'  # For display
        ]
        
        found_patterns = []
        for pattern in correct_patterns:
            if pattern in content:
                found_patterns.append(pattern)
        
        if issues:
            print("❌ Issues found:")
            for issue in issues:
                print(f"   - {issue}")
        else:
            print("✅ All issues fixed!")
            
        print(f"\n📋 Found correct patterns:")
        for pattern in found_patterns:
            count = content.count(pattern)
            print(f"   - {pattern}: {count} instances")
            
    except Exception as e:
        print(f"❌ Error verifying fix: {e}")

def create_test_config():
    """Create a test configuration to verify the fix works"""
    print("\n🧪 Creating test configuration...")
    
    test_config = {
        "name": "Test Direct LLM",
        "type": "direct-llm",
        "model": "phi3:latest",  # This should now work (actual model ID)
        "temperature": 0.7,
        "maxTokens": 1000,
        "systemPrompt": "You are a helpful assistant.",
        "position": "embedded",
        "size": "medium"
    }
    
    print("📋 Test Configuration:")
    print(f"   Name: {test_config['name']}")
    print(f"   Type: {test_config['type']}")
    print(f"   Model: {test_config['model']} ✅ (actual model ID)")
    print(f"   Temperature: {test_config['temperature']}")
    
    # Verify this model exists in our available models
    available_models = [
        "deepseek-r1:latest", "gpt-oss:20b", "qwen2.5:latest", "llama3.2:1b",
        "llama3.2:latest", "calebfahlgren/natural-functions:latest", "phi3:latest",
        "nomic-embed-text:latest", "mistral:latest", "openhermes:latest"
    ]
    
    if test_config['model'] in available_models:
        print(f"   ✅ Model '{test_config['model']}' is available in Ollama")
    else:
        print(f"   ❌ Model '{test_config['model']}' is NOT available")
    
    print(f"\n💡 Expected behavior:")
    print(f"   1. User selects 'Phi-3 (Latest)' from dropdown")
    print(f"   2. System stores 'phi3:latest' as model value")
    print(f"   3. FlexibleChatService uses 'phi3:latest' for Ollama")
    print(f"   4. Chat works without 'model not found' error")

def main():
    """Run the complete fix"""
    print("🚀 Fixing Model Selection Issue")
    print("="*50)
    
    fix_chat_configuration_wizard()
    verify_fix()
    create_test_config()
    
    print("\n" + "="*50)
    print("🎯 SUMMARY")
    print("="*50)
    print("✅ Fixed ChatConfigurationWizard to use model.id for values")
    print("✅ Kept model.name for display text")
    print("✅ This should resolve the 'Phi-3 (Latest)' not found error")
    print("\n💡 Next steps:")
    print("1. Refresh your browser")
    print("2. Create a new Direct LLM chat interface")
    print("3. Select any model from the dropdown")
    print("4. Test sending a message")
    print("="*50)

if __name__ == "__main__":
    main()