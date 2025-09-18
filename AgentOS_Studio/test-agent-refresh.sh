#!/bin/bash

echo "🧪 Testing Real-time Agent Refresh Functionality"
echo "================================================"

# Function to create a test agent
create_agent() {
    local name="$1"
    local role="$2"
    echo "Creating agent: $name"
    curl -X POST http://localhost:5002/api/agents/ollama \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"$name\",
        \"role\": \"$role\",
        \"description\": \"Test agent for refresh functionality\",
        \"model\": \"llama3.2:3b\",
        \"systemPrompt\": \"You are a helpful assistant.\",
        \"temperature\": 0.7,
        \"maxTokens\": 1000
      }" > /dev/null 2>&1
    echo "✅ Agent '$name' created"
}

# Function to delete an agent
delete_agent() {
    local agent_id="$1"
    echo "Deleting agent: $agent_id"
    curl -X DELETE "http://localhost:5002/api/agents/ollama/$agent_id" > /dev/null 2>&1
    echo "✅ Agent deleted"
}

# Function to get agent count
get_agent_count() {
    curl -s http://localhost:5002/api/agents/ollama | grep -o '"id"' | wc -l | tr -d ' '
}

# Function to get first agent ID
get_first_agent_id() {
    curl -s http://localhost:5002/api/agents/ollama | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4
}

echo ""
echo "📊 Initial agent count: $(get_agent_count)"
echo ""

echo "🔄 Testing agent creation (should trigger auto-refresh in UI)..."
create_agent "Refresh Test Agent 1" "Test Assistant"
sleep 2
create_agent "Refresh Test Agent 2" "Research Assistant"
sleep 2
create_agent "Refresh Test Agent 3" "Code Assistant"

echo ""
echo "📊 Agent count after creation: $(get_agent_count)"
echo ""

echo "⏳ Waiting 15 seconds to observe auto-refresh in UI..."
echo "   (Check the Strands workspace - agents should appear automatically)"
sleep 15

echo ""
echo "🗑️ Testing agent deletion (should trigger auto-refresh in UI)..."
agent_id=$(get_first_agent_id)
if [ ! -z "$agent_id" ]; then
    delete_agent "$agent_id"
    echo ""
    echo "📊 Agent count after deletion: $(get_agent_count)"
else
    echo "No agents found to delete"
fi

echo ""
echo "✅ Test complete! Check the Strands workspace to verify:"
echo "   • Agents appeared automatically when created"
echo "   • Agent count updated in real-time"
echo "   • 'Updated X ago' timestamp refreshed"
echo "   • Green auto-refresh indicator is visible"
echo ""