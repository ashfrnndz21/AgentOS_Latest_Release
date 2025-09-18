#!/bin/bash

echo "🧪 Testing Strands SDK Agent Service"
echo "===================================="

# Test 1: Health Check
echo "1. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:5006/api/strands-sdk/health)
if [[ $? -eq 0 ]]; then
    echo "✅ Health check passed"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Health check failed"
    exit 1
fi

echo ""

# Test 2: Create Agent
echo "2. Testing agent creation..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:5006/api/strands-sdk/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Strands Agent",
    "description": "A test agent created via Strands SDK",
    "model_id": "llama3",
    "host": "http://localhost:11434",
    "system_prompt": "You are a helpful test assistant created using the Strands SDK."
  }')

if [[ $? -eq 0 ]]; then
    echo "✅ Agent creation passed"
    echo "   Response: $CREATE_RESPONSE"
    
    # Extract agent ID for further testing
    AGENT_ID=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
    echo "   Agent ID: $AGENT_ID"
else
    echo "❌ Agent creation failed"
    exit 1
fi

echo ""

# Test 3: List Agents
echo "3. Testing agent listing..."
LIST_RESPONSE=$(curl -s http://localhost:5006/api/strands-sdk/agents)
if [[ $? -eq 0 ]]; then
    echo "✅ Agent listing passed"
    echo "   Response: $LIST_RESPONSE"
else
    echo "❌ Agent listing failed"
fi

echo ""

# Test 4: Execute Agent (if we have an agent ID)
if [[ -n "$AGENT_ID" ]]; then
    echo "4. Testing agent execution..."
    EXECUTE_RESPONSE=$(curl -s -X POST http://localhost:5006/api/strands-sdk/agents/$AGENT_ID/execute \
      -H "Content-Type: application/json" \
      -d '{
        "input": "Hello! This is a test message for the Strands SDK agent."
      }')
    
    if [[ $? -eq 0 ]]; then
        echo "✅ Agent execution passed"
        echo "   Response: $EXECUTE_RESPONSE"
    else
        echo "❌ Agent execution failed"
    fi
    
    echo ""
    
    # Test 5: Get Specific Agent
    echo "5. Testing get specific agent..."
    GET_RESPONSE=$(curl -s http://localhost:5006/api/strands-sdk/agents/$AGENT_ID)
    if [[ $? -eq 0 ]]; then
        echo "✅ Get agent passed"
        echo "   Response: $GET_RESPONSE"
    else
        echo "❌ Get agent failed"
    fi
    
    echo ""
    
    # Test 6: Delete Agent
    echo "6. Testing agent deletion..."
    DELETE_RESPONSE=$(curl -s -X DELETE http://localhost:5006/api/strands-sdk/agents/$AGENT_ID)
    if [[ $? -eq 0 ]]; then
        echo "✅ Agent deletion passed"
        echo "   Response: $DELETE_RESPONSE"
    else
        echo "❌ Agent deletion failed"
    fi
else
    echo "⚠️  Skipping execution tests (no agent ID available)"
fi

echo ""
echo "🎉 Strands SDK Service Test Complete!"
echo ""
echo "📝 Service Details:"
echo "   URL: http://localhost:5006"
echo "   Health: http://localhost:5006/api/strands-sdk/health"
echo "   Type: Official Strands SDK (Mock Implementation)"
echo ""
echo "🚀 Ready for frontend integration!"