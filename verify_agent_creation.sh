#!/bin/bash

echo "🔍 Agent Creation & Registry Integration Verification"
echo "=================================================="

# Function to check if a service is running
check_service() {
    local service_name=$1
    local port=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ $service_name (port $port) - Running"
        return 0
    else
        echo "❌ $service_name (port $port) - Not Running"
        return 1
    fi
}

# Function to check agent in registry
check_agent_in_registry() {
    local agent_id=$1
    local agent_name=$2
    
    echo "🔍 Checking agent $agent_name ($agent_id) in registry..."
    
    # Check if agent exists in registry
    local registry_check=$(curl -s http://localhost:5010/agents | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    agents = data.get('agents', [])
    agent = next((a for a in agents if a['id'] == '$agent_id'), None)
    if agent:
        print(f'✅ Found in registry: {agent[\"name\"]} (Status: {agent[\"status\"]})')
        print(f'   Capabilities: {agent.get(\"capabilities\", [])}')
        print(f'   URL: {agent.get(\"url\", \"N/A\")}')
    else:
        print('❌ Not found in registry')
except Exception as e:
    print(f'❌ Registry check failed: {e}')
")
    echo "$registry_check"
}

# Function to check agent in Strands SDK
check_agent_in_strands() {
    local agent_id=$1
    local agent_name=$2
    
    echo "🔍 Checking agent $agent_name ($agent_id) in Strands SDK..."
    
    local strands_check=$(curl -s http://localhost:5006/api/strands-sdk/agents | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    agents = data.get('agents', [])
    agent = next((a for a in agents if a['id'] == '$agent_id'), None)
    if agent:
        print(f'✅ Found in Strands SDK: {agent[\"name\"]} (Status: {agent[\"status\"]})')
        print(f'   Model: {agent.get(\"model_id\", \"N/A\")}')
        print(f'   A2A Status: {agent.get(\"a2a_status\", {})}')
    else:
        print('❌ Not found in Strands SDK')
except Exception as e:
    print(f'❌ Strands SDK check failed: {e}')
")
    echo "$strands_check"
}

# Function to test agent execution
test_agent_execution() {
    local agent_id=$1
    local agent_name=$2
    
    echo "🔍 Testing agent execution for $agent_name..."
    
    local execution_test=$(curl -s -X POST http://localhost:5006/api/strands-sdk/agents/$agent_id/execute \
        -H "Content-Type: application/json" \
        -d '{"input": "Hello, can you respond with a simple greeting?"}' \
        | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'error' in data:
        print(f'❌ Execution failed: {data[\"error\"]}')
    else:
        print(f'✅ Execution successful: {data.get(\"response\", \"No response field\")[:100]}...')
except Exception as e:
    print(f'❌ Execution test failed: {e}')
")
    echo "$execution_test"
}

# Function to test orchestration routing
test_orchestration_routing() {
    local test_question=$1
    
    echo "🔍 Testing orchestration routing with: '$test_question'"
    
    local orchestration_test=$(curl -s -X POST http://localhost:8005/orchestrate \
        -H "Content-Type: application/json" \
        -d "{\"question\": \"$test_question\", \"user\": \"verification_test\"}" \
        | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    selected_agents = data.get('selected_agents', [])
    agents_found = data.get('orchestration_log', {}).get('steps', [])
    discovery_step = next((step for step in agents_found if step.get('step_type') == 'AGENT_DISCOVERY'), None)
    
    if discovery_step:
        available_agents = discovery_step.get('details', {}).get('available_agents', [])
        print(f'✅ Orchestration found {len(available_agents)} agents: {available_agents}')
        print(f'✅ Selected agents for routing: {selected_agents}')
    else:
        print('❌ Could not find agent discovery step')
except Exception as e:
    print(f'❌ Orchestration test failed: {e}')
")
    echo "$orchestration_test"
}

# Main verification process
echo ""
echo "1️⃣ Checking Required Services..."
echo "--------------------------------"

check_service "Ollama" 11434
check_service "Strands SDK" 5006
check_service "Agent Registry" 5010
check_service "Frontend Bridge" 5012
check_service "Orchestration Service" 8005

echo ""
echo "2️⃣ Checking Available Models..."
echo "-------------------------------"

curl -s http://localhost:11434/api/tags | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    models = data.get('models', [])
    print(f'✅ Found {len(models)} available models:')
    for model in models:
        print(f'   - {model[\"name\"]}')
except Exception as e:
    print(f'❌ Model check failed: {e}')
"

echo ""
echo "3️⃣ Agent Verification (Replace with your agent ID and name)..."
echo "------------------------------------------------------------"

# Replace these with your actual agent details
AGENT_ID="YOUR_AGENT_ID_HERE"
AGENT_NAME="YOUR_AGENT_NAME_HERE"

if [ "$AGENT_ID" != "YOUR_AGENT_ID_HERE" ]; then
    check_agent_in_strands "$AGENT_ID" "$AGENT_NAME"
    echo ""
    check_agent_in_registry "$AGENT_ID" "$AGENT_NAME"
    echo ""
    test_agent_execution "$AGENT_ID" "$AGENT_NAME"
else
    echo "⚠️  Please update the script with your agent ID and name"
    echo "   Edit the AGENT_ID and AGENT_NAME variables in this script"
fi

echo ""
echo "4️⃣ Testing Orchestration Routing..."
echo "----------------------------------"

test_orchestration_routing "What are the best attractions in Singapore?"
echo ""
test_orchestration_routing "Calculate 2+2 and tell me about Malaysia tourism"

echo ""
echo "5️⃣ Registry Status Summary..."
echo "----------------------------"

curl -s http://localhost:5010/agents | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    agents = data.get('agents', [])
    active_agents = [a for a in agents if a.get('status') == 'active']
    print(f'✅ Total agents in registry: {len(agents)}')
    print(f'✅ Active agents: {len(active_agents)}')
    print('')
    print('Active agents:')
    for agent in active_agents:
        print(f'   - {agent[\"name\"]} ({agent[\"id\"]}) - {agent.get(\"status\", \"unknown\")}')
except Exception as e:
    print(f'❌ Registry summary failed: {e}')
"

echo ""
echo "🎯 Verification Complete!"
echo "========================"
echo ""
echo "✅ If all checks pass, your agent is properly integrated"
echo "✅ The agent will be discovered by orchestration service"
echo "✅ Routing will work based on agent capabilities"
echo "✅ Agent execution will work with the selected model"




