#!/bin/bash

echo "🔍 Debugging Strands Model Validation Issue"
echo "==========================================="

echo ""
echo "📋 Installed Models (from Ollama API):"
curl -s http://localhost:11434/api/tags | python3 -c "
import sys, json
data = json.load(sys.stdin)
for model in data.get('models', []):
    print(f'  - {model[\"name\"]}')
"

echo ""
echo "📝 Expected Models in Strands Dialog:"
echo "  - llama3.1"
echo "  - llama3.1:8b" 
echo "  - llama3.1:70b"
echo "  - llama3"
echo "  - llama3:8b"
echo "  - llama3:70b"
echo "  - mistral"
echo "  - codellama"
echo "  - phi3"
echo "  - gemma"
echo "  - qwen2"
echo "  - qwen2.5"

echo ""
echo "🔍 Analysis:"
echo "The issue is likely that:"
echo "1. Downloaded model: 'phi3:latest'"
echo "2. Form expects: 'phi3'"
echo "3. Model validation fails because 'phi3' != 'phi3:latest'"

echo ""
echo "💡 Solution needed:"
echo "- Update model validation to handle :latest suffix"
echo "- Or update OLLAMA_MODELS array to include :latest versions"
echo "- Or normalize model names during comparison"