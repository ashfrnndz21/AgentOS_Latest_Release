#!/bin/bash

echo "🧪 Testing Agent Integration Between Systems"
echo "============================================="

# Test 1: Check if main system is running
echo "1. Testing Main System (Port 5002)..."
MAIN_HEALTH=$(curl -s http://localhost:5002/api/health 2>/dev/null || echo "not_running")
if [[ "$MAIN_HEALTH" == "not_running" ]]; then
    echo "❌ Main system not running on port 5002"
    echo "   Please start: cd backend && python ollama_api.py"
    exit 1
else
    echo "✅ Main system is running"
fi
echo ""

# Test 2: Check if Strands SDK is running
echo "2. Testing Strands SDK (Port 5006)..."
STRANDS_HEALTH=$(curl -s http://localhost:5006/api/strands-sdk/health 2>/dev/null || echo "not_running")
if [[ "$STRANDS_HEALTH" == "not_running" ]]; then
    echo "❌ Strands SDK not running on port 5006"
    echo "   Please start: cd backend && python strands_sdk_simple.py"
    exit 1
else
    echo "✅ Strands SDK is running"
fi
echo ""

# Test 3: Check if A2A service is running
echo "3. Testing A2A Service (Port 5008)..."
A2A_HEALTH=$(curl -s http://localhost:5008/api/a2a/health 2>/dev/null || echo "not_running")
if [[ "$A2A_HEALTH" == "not_running" ]]; then
    echo "❌ A2A service not running on port 5008"
    echo "   Please start: cd backend && python a2a_service.py"
    exit 1
else
    echo "✅ A2A service is running"
fi
echo ""

# Test 4: Create a Strands agent and check if it appears in main system
echo "4. Testing Agent Creation Integration..."
echo "   Creating Strands agent..."

AGENT_RESPONSE=$(curl -s -X POST http://localhost:5006/api/strands-sdk/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integration Test Agent",
    "description": "Test agent to verify integration between systems",
    "model_id": "llama3.2:latest",
    "host": "http://localhost:11434",
    "system_prompt": "You are a test agent for integration verification.",
    "tools": ["calculator"]
  }')

echo "   Strands SDK Response: $AGENT_RESPONSE"

# Extract agent ID
AGENT_ID=$(echo $AGENT_RESPONSE | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('id', 'N/A'))
except:
    print('N/A')
" 2>/dev/null)

echo "   Agent ID: $AGENT_ID"
echo ""

# Test 5: Check if agent appears in main system
echo "5. Checking if agent appears in main system..."
if [[ "$AGENT_ID" != "N/A" && "$AGENT_ID" != "" ]]; then
    MAIN_AGENTS=$(curl -s http://localhost:5002/api/agents/ollama)
    echo "   Main system agents: $MAIN_AGENTS"
    
    if echo "$MAIN_AGENTS" | grep -q "Integration Test Agent"; then
        echo "   ✅ Agent successfully appears in main system!"
    else
        echo "   ⚠️ Agent not found in main system"
        echo "   This means the integration needs to be fixed"
    fi
else
    echo "   ❌ Cannot check main system - agent creation failed"
fi
echo ""

# Test 6: Check A2A registration
echo "6. Checking A2A registration..."
A2A_AGENTS=$(curl -s http://localhost:5008/api/a2a/agents)
echo "   A2A agents: $A2A_AGENTS"

if echo "$A2A_AGENTS" | grep -q "Integration Test Agent"; then
    echo "   ✅ Agent successfully registered with A2A!"
else
    echo "   ⚠️ Agent not found in A2A registry"
fi
echo ""

# Test 7: Check Strands A2A agents
echo "7. Checking Strands A2A agents..."
STRANDS_A2A_AGENTS=$(curl -s http://localhost:5006/api/strands-sdk/a2a/agents)
echo "   Strands A2A agents: $STRANDS_A2A_AGENTS"

if echo "$STRANDS_A2A_AGENTS" | grep -q "Integration Test Agent"; then
    echo "   ✅ Agent found in Strands A2A registry!"
else
    echo "   ⚠️ Agent not found in Strands A2A registry"
fi
echo ""

echo "🎉 Integration Test Complete!"
echo "============================="
echo ""
echo "📊 Summary:"
echo "• Main System (5002): $(echo $MAIN_HEALTH | grep -q 'healthy' && echo '✅ Running' || echo '❌ Not Running')"
echo "• Strands SDK (5006): $(echo $STRANDS_HEALTH | grep -q 'healthy' && echo '✅ Running' || echo '❌ Not Running')"
echo "• A2A Service (5008): $(echo $A2A_HEALTH | grep -q 'healthy' && echo '✅ Running' || echo '❌ Not Running')"
echo "• Agent Creation: $(echo $AGENT_RESPONSE | grep -q 'successfully' && echo '✅ Success' || echo '❌ Failed')"
echo "• Main System Integration: $(echo $MAIN_AGENTS | grep -q 'Integration Test Agent' && echo '✅ Integrated' || echo '❌ Not Integrated')"
echo "• A2A Registration: $(echo $A2A_AGENTS | grep -q 'Integration Test Agent' && echo '✅ Registered' || echo '❌ Not Registered')"
echo ""
echo "🚀 Next Steps:"
echo "1. If integration failed, check the console logs"
echo "2. Open http://localhost:5173"
echo "3. Go to Multi-Agent Workspace → A2A Agent Registry"
echo "4. Check all tabs: All Agents, Strands Agents, Main System, Messages"
echo "5. Create a new agent and verify it appears in all systems"
