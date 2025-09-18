#!/bin/bash

echo "🧪 Testing A2A Integration End-to-End"
echo "====================================="

# Test 1: Check A2A Service Health
echo "1. Testing A2A Service Health (Port 5008)..."
A2A_HEALTH=$(curl -s http://localhost:5008/api/a2a/health)
echo "✅ A2A Health Response: $A2A_HEALTH"
echo ""

# Test 2: Check Strands SDK API Health
echo "2. Testing Strands SDK API Health (Port 5006)..."
STRANDS_HEALTH=$(curl -s http://localhost:5006/api/strands-sdk/health)
echo "✅ Strands SDK Health Response: $STRANDS_HEALTH"
echo ""

# Test 3: Create a Strands Agent with A2A Integration
echo "3. Creating Strands Agent with A2A Integration..."
AGENT_RESPONSE=$(curl -s -X POST http://localhost:5006/api/strands-sdk/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A2A Test Agent",
    "description": "Test agent for A2A integration verification",
    "model_id": "llama3.2:latest",
    "host": "http://localhost:11434",
    "system_prompt": "You are a test agent for A2A communication. You help verify that agent-to-agent communication works correctly.",
    "tools": ["calculator", "current_time"]
  }')

echo "✅ Agent Creation Response: $AGENT_RESPONSE"

# Extract agent ID
AGENT_ID=$(echo $AGENT_RESPONSE | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('id', 'N/A'))
except:
    print('N/A')
" 2>/dev/null)

echo "📝 Agent ID: $AGENT_ID"
echo ""

# Test 4: Check A2A Registration
echo "4. Checking A2A Registration..."
if [[ "$AGENT_ID" != "N/A" && "$AGENT_ID" != "" ]]; then
    A2A_AGENTS=$(curl -s http://localhost:5008/api/a2a/agents)
    echo "✅ A2A Agents: $A2A_AGENTS"
    
    # Check if our agent is registered
    if echo "$A2A_AGENTS" | grep -q "A2A Test Agent"; then
        echo "✅ Agent successfully registered with A2A service!"
    else
        echo "⚠️ Agent not found in A2A registry"
    fi
else
    echo "❌ Cannot check A2A registration - agent creation failed"
fi
echo ""

# Test 5: Test Agent Execution
echo "5. Testing Agent Execution..."
if [[ "$AGENT_ID" != "N/A" && "$AGENT_ID" != "" ]]; then
    EXECUTION_RESPONSE=$(curl -s -X POST http://localhost:5006/api/strands-sdk/agents/$AGENT_ID/execute \
      -H "Content-Type: application/json" \
      -d '{
        "input": "Hello! Can you calculate 15 * 23 and tell me the current time?"
      }')
    
    echo "✅ Execution Response:"
    echo "$EXECUTION_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('Response:', data.get('response', 'No response')[:200] + '...' if len(data.get('response', '')) > 200 else data.get('response', 'No response'))
    print('Tools used:', data.get('tools_used', []))
    print('Execution time:', data.get('execution_time', 'Unknown'))
except Exception as e:
    print(f'Error parsing response: {e}')
    print('Raw response:', sys.stdin.read())
" 2>/dev/null
else
    echo "❌ Cannot test execution - agent creation failed"
fi
echo ""

# Test 6: Check Strands A2A Agents
echo "6. Checking Strands A2A Agents..."
STRANDS_A2A_AGENTS=$(curl -s http://localhost:5006/api/strands-sdk/a2a/agents)
echo "✅ Strands A2A Agents: $STRANDS_A2A_AGENTS"
echo ""

# Test 7: Test A2A Message (if we have agents)
echo "7. Testing A2A Message Sending..."
if echo "$A2A_AGENTS" | grep -q "A2A Test Agent"; then
    # Get the A2A agent ID
    A2A_AGENT_ID=$(echo "$A2A_AGENTS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for agent in data.get('agents', []):
        if 'A2A Test Agent' in agent.get('name', ''):
            print(agent.get('id', ''))
            break
except:
    pass
" 2>/dev/null)
    
    if [[ "$A2A_AGENT_ID" != "" ]]; then
        echo "📝 A2A Agent ID: $A2A_AGENT_ID"
        
        # Send a test message
        MESSAGE_RESPONSE=$(curl -s -X POST http://localhost:5008/api/a2a/messages \
          -H "Content-Type: application/json" \
          -d "{
            \"from_agent_id\": \"$A2A_AGENT_ID\",
            \"to_agent_id\": \"$A2A_AGENT_ID\",
            \"content\": \"Test A2A message from integration test\",
            \"type\": \"test\"
          }")
        
        echo "✅ A2A Message Response: $MESSAGE_RESPONSE"
    else
        echo "⚠️ Could not find A2A agent ID for message testing"
    fi
else
    echo "⚠️ No A2A agents available for message testing"
fi
echo ""

echo "🎉 A2A Integration Test Complete!"
echo "================================"
echo ""
echo "📊 Summary:"
echo "• A2A Service: $(echo $A2A_HEALTH | grep -q 'healthy' && echo '✅ Healthy' || echo '❌ Unhealthy')"
echo "• Strands SDK: $(echo $STRANDS_HEALTH | grep -q 'healthy' && echo '✅ Healthy' || echo '❌ Unhealthy')"
echo "• Agent Creation: $(echo $AGENT_RESPONSE | grep -q 'successfully' && echo '✅ Success' || echo '❌ Failed')"
echo "• A2A Registration: $(echo $A2A_AGENTS | grep -q 'A2A Test Agent' && echo '✅ Registered' || echo '❌ Not Registered')"
echo ""
echo "🚀 Next Steps:"
echo "1. Open http://localhost:5173"
echo "2. Navigate to Multi-Agent Workspace"
echo "3. Select 'A2A Agent Registry'"
echo "4. View registered agents and test communication"

