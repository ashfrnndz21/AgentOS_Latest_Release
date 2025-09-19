#!/bin/bash

echo "🌉 Starting Frontend-Backend A2A Integration"
echo "=============================================="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ Port $1 is already in use"
        return 0
    else
        echo "❌ Port $1 is not in use"
        return 1
    fi
}

# Function to start service if not running
start_service() {
    local service_name=$1
    local port=$2
    local command=$3
    
    if check_port $port; then
        echo "⚠️  $service_name is already running on port $port"
    else
        echo "🚀 Starting $service_name on port $port..."
        $command &
        sleep 2
        if check_port $port; then
            echo "✅ $service_name started successfully"
        else
            echo "❌ Failed to start $service_name"
        fi
    fi
}

echo ""
echo "🔍 Checking required services..."

# Check and start services
start_service "Agent Registry" 5010 "python3 agent_registry.py"
start_service "A2A Service" 5008 "python3 a2a_service.py"
start_service "Frontend Agent Bridge" 5009 "python3 frontend_agent_bridge.py"
start_service "Orchestration Service" 8005 "cd a2a_servers && python3 orchestration_service.py"

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 5

echo ""
echo "🔄 Registering frontend agents with backend orchestration..."
python3 register_frontend_agents.py

echo ""
echo "🎯 Integration complete!"
echo ""
echo "📊 Service Status:"
echo "   • Agent Registry: http://localhost:5010"
echo "   • A2A Service: http://localhost:5008"
echo "   • Frontend Bridge: http://localhost:5009"
echo "   • Orchestration: http://localhost:8005"
echo ""
echo "🌐 Frontend: http://localhost:5174"
echo ""
echo "✅ Frontend agents are now integrated with backend orchestration!"
echo "🔗 Use the real-time orchestration monitor to test multi-agent communication"







