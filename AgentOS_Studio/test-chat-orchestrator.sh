#!/bin/bash

echo "🧪 Testing Chat Orchestrator API"
echo "================================"

BASE_URL="http://localhost:5005"

# Test 1: Health Check
echo "1. 🔍 Testing Health Check..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q "healthy"; then
    echo "   ✅ Chat Orchestrator is healthy"
    echo "   📊 Status: $(echo "$HEALTH" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
else
    echo "   ❌ Chat Orchestrator is not responding"
    echo "   💡 Make sure to run: ./start-chat-orchestrator.sh"
    exit 1
fi

# Test 2: Models
echo ""
echo "2. 🤖 Testing Models Endpoint..."
MODELS=$(curl -s "$BASE_URL/api/chat/models")
if echo "$MODELS" | grep -q "models"; then
    MODEL_COUNT=$(echo "$MODELS" | grep -o '"name"' | wc -l)
    echo "   ✅ Found $MODEL_COUNT Ollama models"
    echo "   📋 Sample models:"
    echo "$MODELS" | grep -o '"name":"[^"]*"' | head -3 | sed 's/"name":"//g' | sed 's/"//g' | sed 's/^/      - /'
else
    echo "   ❌ Failed to get models"
    echo "   💡 Check if Ollama is running: ollama serve"
fi

# Test 3: Agents
echo ""
echo "3. 👥 Testing Agents Endpoint..."
AGENTS=$(curl -s "$BASE_URL/api/chat/agents")
if echo "$AGENTS" | grep -q "agents"; then
    AGENT_COUNT=$(echo "$AGENTS" | grep -o '"id"' | wc -l)
    echo "   ✅ Found $AGENT_COUNT palette agents"
    if [ "$AGENT_COUNT" -gt 0 ]; then
        echo "   📋 Sample agents:"
        echo "$AGENTS" | grep -o '"name":"[^"]*"' | head -3 | sed 's/"name":"//g' | sed 's/"//g' | sed 's/^/      - /'
    fi
else
    echo "   ⚠️  No agents found (Strands API may not be running)"
    echo "   💡 Agent palette features will be limited"
fi

# Test 4: Create Session
echo ""
echo "4. 🎯 Testing Session Creation..."
SESSION_DATA='{
    "type": "direct-llm",
    "name": "Test Chat",
    "model": "qwen2.5:latest",
    "temperature": 0.7,
    "maxTokens": 100,
    "systemPrompt": "You are a helpful test assistant."
}'

SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/chat/sessions" \
    -H "Content-Type: application/json" \
    -d "$SESSION_DATA")

if echo "$SESSION_RESPONSE" | grep -q "session_id"; then
    SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"session_id":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ Created chat session: $SESSION_ID"
    
    # Test 5: Send Message
    echo ""
    echo "5. 💬 Testing Message Sending..."
    MESSAGE_DATA='{"message": "Hello! This is a test message."}'
    
    MESSAGE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/chat/sessions/$SESSION_ID/messages" \
        -H "Content-Type: application/json" \
        -d "$MESSAGE_DATA")
    
    if echo "$MESSAGE_RESPONSE" | grep -q "content"; then
        echo "   ✅ Message sent and response received"
        RESPONSE_TYPE=$(echo "$MESSAGE_RESPONSE" | grep -o '"type":"[^"]*"' | cut -d'"' -f4)
        echo "   🎯 Response type: $RESPONSE_TYPE"
        
        # Show first 100 characters of response
        CONTENT=$(echo "$MESSAGE_RESPONSE" | grep -o '"content":"[^"]*"' | cut -d'"' -f4 | head -c 100)
        echo "   💭 Response preview: $CONTENT..."
        
    else
        echo "   ❌ Failed to send message"
        echo "   📝 Response: $MESSAGE_RESPONSE"
    fi
    
    # Test 6: Get History
    echo ""
    echo "6. 📚 Testing Chat History..."
    HISTORY=$(curl -s "$BASE_URL/api/chat/sessions/$SESSION_ID/history")
    if echo "$HISTORY" | grep -q "messages"; then
        MESSAGE_COUNT=$(echo "$HISTORY" | grep -o '"role"' | wc -l)
        echo "   ✅ Retrieved chat history with $MESSAGE_COUNT messages"
    else
        echo "   ❌ Failed to get chat history"
    fi
    
else
    echo "   ❌ Failed to create session"
    echo "   📝 Response: $SESSION_RESPONSE"
fi

echo ""
echo "🎉 Chat Orchestrator Test Complete!"
echo ""
echo "🔗 Available endpoints:"
echo "   • Health: $BASE_URL/health"
echo "   • Models: $BASE_URL/api/chat/models"
echo "   • Agents: $BASE_URL/api/chat/agents"
echo "   • Sessions: $BASE_URL/api/chat/sessions"
echo ""
echo "🚀 Ready for frontend integration!"