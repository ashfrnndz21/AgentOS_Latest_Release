#!/bin/bash

echo "🚀 Starting all Agent OS services..."

# Change to backend directory
cd /Users/ashleyfernandez/Latest_AgentOs_Oct_V1/AgentOS_Latest_Release/backend

# Start A2A Service (Port 5008) - MUST START FIRST
echo "📡 Starting A2A Service (Port 5008)..."
python3 a2a_service.py &
A2A_PID=$!
sleep 3

# Check if A2A service started successfully
if curl -s http://localhost:5008/api/a2a/agents > /dev/null 2>&1; then
    echo "✅ A2A Service started successfully"
else
    echo "❌ A2A Service failed to start"
    exit 1
fi

# Start Strands SDK API (Port 5006)
echo "🔧 Starting Strands SDK API (Port 5006)..."
python3 strands_sdk_api.py &
STRANDS_PID=$!
sleep 3

# Check if Strands SDK started successfully
if curl -s http://localhost:5006/api/strands-sdk/health > /dev/null 2>&1; then
    echo "✅ Strands SDK API started successfully"
else
    echo "❌ Strands SDK API failed to start"
    exit 1
fi

# Start Ollama API (Port 5002)
echo "🤖 Starting Ollama API (Port 5002)..."
python3 ollama_api.py &
OLLAMA_PID=$!
sleep 3

# Check if Ollama API started successfully
if curl -s http://localhost:5002/api/health > /dev/null 2>&1; then
    echo "✅ Ollama API started successfully"
else
    echo "❌ Ollama API failed to start"
    exit 1
fi

# Start Chat Orchestrator API (Port 5005)
echo "💬 Starting Chat Orchestrator API (Port 5005)..."
python3 chat_orchestrator_api.py &
CHAT_ORCHESTRATOR_PID=$!
sleep 3

# Check if Chat Orchestrator started successfully
if curl -s http://localhost:5005/health > /dev/null 2>&1; then
    echo "✅ Chat Orchestrator API started successfully"
else
    echo "❌ Chat Orchestrator API failed to start"
    exit 1
fi

# Start Utility Services
echo "🔧 Starting Utility Services..."

# Start Database Agent Service (Port 5041)
echo "🗄️  Starting Database Agent Service (Port 5041)..."
cd services/utility_agents
python3 database_agent_service.py &
DATABASE_AGENT_PID=$!
sleep 2

# Start Synthetic Data Service (Port 5042)
echo "🎭 Starting Synthetic Data Service (Port 5042)..."
python3 synthetic_data_service.py &
SYNTHETIC_DATA_PID=$!
sleep 2

# Start Utility Orchestration Engine (Port 5043)
echo "⚙️  Starting Utility Orchestration Engine (Port 5043)..."
python3 utility_orchestration_engine.py &
UTILITY_ORCHESTRATION_PID=$!
sleep 2

# Start Utility API Gateway (Port 5044)
echo "🌐 Starting Utility API Gateway (Port 5044)..."
python3 utility_api_gateway.py &
UTILITY_GATEWAY_PID=$!
sleep 2

# Go back to backend directory
cd ../..

# Check utility services
echo "🔍 Checking Utility Services..."
if curl -s http://localhost:5041/health > /dev/null 2>&1; then
    echo "✅ Database Agent Service started successfully"
else
    echo "⚠️  Database Agent Service may need manual start"
fi

if curl -s http://localhost:5042/health > /dev/null 2>&1; then
    echo "✅ Synthetic Data Service started successfully"
else
    echo "⚠️  Synthetic Data Service may need manual start"
fi

if curl -s http://localhost:5043/health > /dev/null 2>&1; then
    echo "✅ Utility Orchestration Engine started successfully"
else
    echo "⚠️  Utility Orchestration Engine may need manual start"
fi

if curl -s http://localhost:5044/health > /dev/null 2>&1; then
    echo "✅ Utility API Gateway started successfully"
else
    echo "⚠️  Utility API Gateway may need manual start"
fi

# Start Resource Monitor API
echo "📊 Starting Resource Monitor API..."
python3 resource_monitor_api.py &
RESOURCE_MONITOR_PID=$!
sleep 3

# Check if Resource Monitor started successfully
if curl -s http://localhost:5007/health > /dev/null 2>&1; then
    echo "✅ Resource Monitor API started successfully"
else
    echo "⚠️  Resource Monitor API may need manual start"
fi

# Start Main System Orchestrator (Port 5031) - MUST START LAST
echo "🎯 Starting Main System Orchestrator (Port 5031)..."
python3 main_system_orchestrator.py &
ORCHESTRATOR_PID=$!
sleep 5

# Check if Main System Orchestrator started successfully
if curl -s http://localhost:5031/health > /dev/null 2>&1; then
    echo "✅ Main System Orchestrator started successfully"
else
    echo "❌ Main System Orchestrator failed to start"
    exit 1
fi

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📊 Service Status:"
echo "  A2A Service: http://localhost:5008/api/a2a/agents"
echo "  Strands SDK: http://localhost:5006/api/strands-sdk/health"
echo "  Ollama API: http://localhost:5002/api/health"
echo "  Chat Orchestrator: http://localhost:5005/health"
echo "  Database Agent: http://localhost:5041/health"
echo "  Synthetic Data: http://localhost:5042/health"
echo "  Utility Orchestration: http://localhost:5043/health"
echo "  Utility Gateway: http://localhost:5044/health"
echo "  Resource Monitor: http://localhost:5007/health"
echo "  Main Orchestrator: http://localhost:5031/health"
echo ""
echo "🔍 To check service status, run:"
echo "  curl -s http://localhost:5008/api/a2a/agents | jq '.agents | length'"
echo "  curl -s http://localhost:5006/api/strands-sdk/agents | jq '.agents | length'"
echo "  curl -s http://localhost:5002/api/health | jq '.status'"
echo "  curl -s http://localhost:5005/health | jq '.status'"
echo "  curl -s http://localhost:5041/health | jq '.status'"
echo "  curl -s http://localhost:5042/health | jq '.status'"
echo "  curl -s http://localhost:5043/health | jq '.status'"
echo "  curl -s http://localhost:5044/health | jq '.status'"
echo "  curl -s http://localhost:5007/health | jq '.status'"
echo "  curl -s http://localhost:5031/health | jq '.status'"
echo ""
echo "🌐 Dashboard: http://localhost:3000"

