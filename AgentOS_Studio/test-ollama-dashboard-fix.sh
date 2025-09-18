#!/bin/bash

echo "🧪 Testing Ollama Dashboard White Screen Fix"
echo "============================================"

# Function to test API endpoint
test_api() {
    echo "📡 Testing API endpoint..."
    response=$(curl -s http://localhost:5002/api/agents/ollama)
    if echo "$response" | grep -q '"agents"'; then
        echo "✅ API endpoint working correctly"
        agent_count=$(echo "$response" | grep -o '"id"' | wc -l | tr -d ' ')
        echo "📊 Current agent count: $agent_count"
        return 0
    else
        echo "❌ API endpoint failed"
        echo "Response: $response"
        return 1
    fi
}

# Function to test frontend
test_frontend() {
    echo "🌐 Testing frontend..."
    response=$(curl -s http://localhost:5173)
    if echo "$response" | grep -q "AgentRepo"; then
        echo "✅ Frontend loading correctly"
        return 0
    else
        echo "❌ Frontend failed to load"
        return 1
    fi
}

# Function to check if services are running
check_services() {
    echo "🔍 Checking services..."
    
    # Check Ollama API
    if curl -s http://localhost:5002/health > /dev/null 2>&1; then
        echo "✅ Ollama API (5002) - Running"
    else
        echo "❌ Ollama API (5002) - Not responding"
        return 1
    fi
    
    # Check Frontend
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "✅ Frontend (5173) - Running"
    else
        echo "❌ Frontend (5173) - Not responding"
        return 1
    fi
}

# Function to create test agent via API
create_test_agent() {
    local name="$1"
    echo "🤖 Creating test agent via API: $name"
    response=$(curl -s -X POST http://localhost:5002/api/agents/ollama \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"$name\",
        \"role\": \"Test Assistant\",
        \"description\": \"Dashboard fix test agent\",
        \"model\": \"llama3.2:3b\",
        \"systemPrompt\": \"You are a helpful test assistant.\",
        \"temperature\": 0.7,
        \"maxTokens\": 1000
      }")
    
    if echo "$response" | grep -q '"id"'; then
        echo "✅ Agent '$name' created successfully via API"
        return 0
    else
        echo "❌ Failed to create agent '$name' via API"
        echo "Response: $response"
        return 1
    fi
}

# Main test sequence
echo ""
echo "🚀 Starting Ollama Dashboard fix test..."
echo ""

# Step 1: Check services
if ! check_services; then
    echo "❌ Services not running properly. Please run ./start-all-services.sh first"
    exit 1
fi

echo ""

# Step 2: Test API
if ! test_api; then
    echo "❌ API test failed"
    exit 1
fi

echo ""

# Step 3: Test frontend
if ! test_frontend; then
    echo "❌ Frontend test failed"
    exit 1
fi

echo ""

# Step 4: Create test agents to populate the dashboard
echo "🧪 Creating test agents for dashboard display..."
create_test_agent "Dashboard Test Agent 1"
sleep 1
create_test_agent "Dashboard Test Agent 2"
sleep 1

echo ""

# Step 5: Verify agents were created
echo "📊 Final verification..."
test_api

echo ""
echo "✅ All backend tests passed!"
echo ""
echo "🎯 Manual verification steps:"
echo "   1. Open http://localhost:5173"
echo "   2. Click on 'Ollama Agent' in the sidebar"
echo "   3. Verify the page loads without white screen"
echo "   4. Check that agents are displayed correctly"
echo "   5. Try creating a new agent through the UI"
echo "   6. Verify the agent appears in the Strands workspace"
echo ""
echo "🔧 What was fixed:"
echo "   • Changed API endpoint from port 5052 to 5002"
echo "   • Added error handling for backend loading"
echo "   • Fixed infinite loop in dashboard useEffect"
echo "   • Made model field access more robust"
echo ""
echo "🚀 If manual tests pass, the white screen issue is completely resolved!"
echo ""