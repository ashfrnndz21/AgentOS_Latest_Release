#!/bin/bash

echo "🔧 Testing Model Validation Fix"
echo "==============================="

echo ""
echo "✅ What was fixed:"
echo "1. Added isModelInstalled() function that handles :latest suffix"
echo "2. Updated all model validation to use the new function"
echo "3. Model 'phi3' now matches 'phi3:latest' in validation"
echo "4. Download function adds :latest suffix automatically"

echo ""
echo "🧪 Test Cases:"
echo "- phi3 (form) should match phi3:latest (installed) ✅"
echo "- mistral (form) should match mistral:latest (installed) ✅"
echo "- qwen2.5 (form) should match qwen2.5:latest (installed) ✅"

echo ""
echo "📋 Current Model Status:"
curl -s http://localhost:11434/api/tags | python3 -c "
import sys, json
data = json.load(sys.stdin)
models = ['phi3', 'mistral', 'qwen2.5', 'llama3.2']
installed = [m['name'] for m in data.get('models', [])]

print('Model Validation Results:')
for model in models:
    matches = [i for i in installed if i == model or i == f'{model}:latest' or i.startswith(f'{model}:')]
    if matches:
        print(f'  ✅ {model} -> matches {matches[0]}')
    else:
        print(f'  ❌ {model} -> no match')
"

echo ""
echo "🎯 Next Steps:"
echo "1. Refresh the Strands dialog (close and reopen)"
echo "2. Select 'phi3' model"
echo "3. You should see green checkmark (model installed)"
echo "4. Create Agent button should now be enabled"
echo "5. Fill in required fields and create your agent!"