#!/bin/bash

echo "🧠 Testing Strands Multi-Agent Collaboration Tools"
echo "=================================================="

# Test 1: Create an agent with collaboration tools
echo "📝 Test 1: Creating agent with collaboration tools..."
curl -X POST "http://localhost:5006/api/strands-sdk/agents" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Collaboration Test Agent",
    "description": "Agent for testing Think Tool and A2A Protocol",
    "model_provider": "ollama",
    "model_id": "qwen2.5",
    "host": "http://localhost:11434",
    "system_prompt": "You are an advanced AI agent with thinking and collaboration capabilities.",
    "tools": ["think", "a2a_discover_agent", "coordinate_agents", "web_search"]
  }' | python3 -m json.tool

echo ""
echo "⏳ Waiting for agent creation..."
sleep 2

# Get the agent ID (assuming it's the latest one)
AGENT_ID=$(curl -s "http://localhost:5006/api/strands-sdk/agents" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data and len(data) > 0:
    print(data[-1]['id'])
else:
    print('ERROR: No agents found')
    sys.exit(1)
")

if [ "$AGENT_ID" = "ERROR: No agents found" ]; then
    echo "❌ Failed to create agent"
    exit 1
fi

echo "✅ Agent created with ID: $AGENT_ID"
echo ""

# Test 2: Test Think Tool
echo "🧠 Test 2: Testing Think Tool..."
curl -X POST "http://localhost:5006/api/strands-sdk/agents/$AGENT_ID/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Use the think tool to analyze the benefits of multi-agent systems. Think through this with 2 cycles."
  }' \
  --max-time 120 | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('Response:', data.get('response', 'No response'))
    print('Tools used:', data.get('tools_used', []))
    print('Execution time:', data.get('execution_time', 'Unknown'))
    if 'think' in data.get('tools_used', []):
        print('✅ Think tool was used successfully!')
    else:
        print('❌ Think tool was not detected')
except Exception as e:
    print(f'❌ Error parsing response: {e}')
"

echo ""
echo "⏳ Waiting before next test..."
sleep 3

# Test 3: Test A2A Discovery
echo "🤝 Test 3: Testing A2A Agent Discovery..."
curl -X POST "http://localhost:5006/api/strands-sdk/agents/$AGENT_ID/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Use a2a_discover_agent to discover an agent at http://example.com/agent"
  }' \
  --max-time 60 | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('Response:', data.get('response', 'No response'))
    print('Tools used:', data.get('tools_used', []))
    if 'a2a_discover_agent' in data.get('tools_used', []):
        print('✅ A2A discovery tool was used successfully!')
    else:
        print('❌ A2A discovery tool was not detected')
except Exception as e:
    print(f'❌ Error parsing response: {e}')
"

echo ""
echo "⏳ Waiting before next test..."
sleep 3

# Test 4: Test Multi-Agent Coordination
echo "🔄 Test 4: Testing Multi-Agent Coordination..."
curl -X POST "http://localhost:5006/api/strands-sdk/agents/$AGENT_ID/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Use coordinate_agents to coordinate a task between agents at http://agent1.com and http://agent2.com using sequential strategy"
  }' \
  --max-time 60 | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('Response:', data.get('response', 'No response'))
    print('Tools used:', data.get('tools_used', []))
    if 'coordinate_agents' in data.get('tools_used', []):
        print('✅ Agent coordination tool was used successfully!')
    else:
        print('❌ Agent coordination tool was not detected')
except Exception as e:
    print(f'❌ Error parsing response: {e}')
"

echo ""
echo "📊 Test Summary:"
echo "================"
echo "✅ Agent creation with collaboration tools"
echo "🧠 Think Tool integration"
echo "🤝 A2A Protocol implementation"
echo "🔄 Multi-Agent Coordination"
echo ""
echo "🎉 Collaboration tools testing complete!"
echo "Check the responses above to verify tool functionality."