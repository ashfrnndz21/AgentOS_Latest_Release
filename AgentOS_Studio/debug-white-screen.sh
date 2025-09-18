#!/bin/bash

echo "🐛 Debugging White Screen Issue in Adaptation Dialog"
echo "=================================================="

# Check if services are running
echo "🔍 Checking service status..."

# Check Strands API
STRANDS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5004/api/strands/health)
if [ "$STRANDS_STATUS" = "200" ]; then
  echo "✅ Strands API is running"
else
  echo "❌ Strands API is not responding (HTTP $STRANDS_STATUS)"
fi

# Check Ollama API
OLLAMA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5002/api/ollama/status)
if [ "$OLLAMA_STATUS" = "200" ]; then
  echo "✅ Ollama API is running"
else
  echo "❌ Ollama API is not responding (HTTP $OLLAMA_STATUS)"
fi

# Check Frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "✅ Frontend is running"
else
  echo "❌ Frontend is not responding (HTTP $FRONTEND_STATUS)"
fi

echo ""
echo "🔍 Checking Ollama agents data structure..."

# Get the agent data and check its structure
AGENT_DATA=$(curl -s http://localhost:5004/api/strands/ollama-agents)

if echo "$AGENT_DATA" | grep -q "Security Expert"; then
  echo "✅ Test agent found in API response"
  
  # Check if the agent has all required fields
  echo ""
  echo "📋 Agent data structure check:"
  
  # Extract the Security Expert agent data
  SECURITY_AGENT=$(echo "$AGENT_DATA" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for agent in data.get('agents', []):
        if 'Security Expert' in agent.get('name', ''):
            print(json.dumps(agent, indent=2))
            break
except Exception as e:
    print(f'Error parsing JSON: {e}')
    sys.exit(1)
" 2>/dev/null)

  if [ -n "$SECURITY_AGENT" ]; then
    echo "✅ Agent data extracted successfully"
    echo "$SECURITY_AGENT" | head -20
    
    # Check for required fields
    echo ""
    echo "🔍 Required field validation:"
    
    for field in "id" "name" "role" "model" "guardrails" "capabilities"; do
      if echo "$SECURITY_AGENT" | grep -q "\"$field\""; then
        echo "✅ $field: present"
      else
        echo "❌ $field: missing"
      fi
    done
    
  else
    echo "❌ Failed to extract agent data"
  fi
  
else
  echo "❌ Test agent not found in API response"
  echo "Available agents:"
  echo "$AGENT_DATA" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for agent in data.get('agents', []):
        print(f'  - {agent.get(\"name\", \"Unknown\")}')
except:
    print('  Error parsing agent list')
"
fi

echo ""
echo "🎯 Debugging Steps:"
echo "1. Open browser developer tools (F12)"
echo "2. Go to Console tab"
echo "3. Navigate to http://localhost:5173"
echo "4. Go to Strands Multi-Agent Workspace"
echo "5. Click on Agent Palette > Adapt tab"
echo "6. Click on 'Security Expert Agent'"
echo "7. Check console for any JavaScript errors"
echo ""
echo "Common issues to look for:"
echo "- TypeError: Cannot read property 'X' of undefined"
echo "- ReferenceError: X is not defined"
echo "- SyntaxError in JSX"
echo "- Network errors (failed API calls)"
echo ""
echo "If you see errors, please share them for further debugging."