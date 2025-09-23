#!/bin/bash

# Start A2A Services Script
# This script starts all required services for the A2A multi-agent orchestration

echo "🚀 Starting A2A Multi-Agent Orchestration Services..."

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

# Function to start a service in background
start_service() {
    local service_name=$1
    local port=$2
    local script_path=$3
    
    echo "🔄 Starting $service_name on port $port..."
    
    if check_port $port; then
        echo "⚠️  $service_name is already running on port $port"
    else
        if [ -f "$script_path" ]; then
            nohup python3 "$script_path" > "logs/${service_name}.log" 2>&1 &
            echo "✅ $service_name started (PID: $!)"
            sleep 2
        else
            echo "❌ Script not found: $script_path"
        fi
    fi
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Change to the project root directory
cd "$(dirname "$0")/.."

echo "📁 Working directory: $(pwd)"

# Start services in order
echo ""
echo "🔧 Starting Core Services..."

# 1. Start A2A Service (Port 5008)
start_service "A2A Service" 5008 "backend/a2a_service.py"

# 2. Start Strands SDK Service (Port 5006)
start_service "Strands SDK Service" 5006 "backend/strands_sdk_api.py"

# 3. Start Enhanced Orchestration API (Port 5014)
start_service "Enhanced Orchestration API" 5014 "backend/enhanced_orchestration_api.py"

# Wait a moment for services to start
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 5

# Check service health
echo ""
echo "🏥 Checking service health..."

check_service_health() {
    local service_name=$1
    local port=$2
    local health_endpoint=$3
    
    echo "🔍 Checking $service_name..."
    
    if curl -s "http://localhost:$port$health_endpoint" > /dev/null 2>&1; then
        echo "✅ $service_name is healthy"
        return 0
    else
        echo "❌ $service_name health check failed"
        return 1
    fi
}

# Health checks
check_service_health "A2A Service" 5008 "/api/a2a/health"
check_service_health "Strands SDK Service" 5006 "/api/strands-sdk/health"
check_service_health "Enhanced Orchestration API" 5014 "/api/enhanced-orchestration/health"

echo ""
echo "📊 Service Status Summary:"
echo "=========================="
echo "A2A Service: http://localhost:5008"
echo "Strands SDK: http://localhost:5006"
echo "Enhanced Orchestration: http://localhost:5014"
echo ""
echo "🔗 A2A Framework Endpoints:"
echo "  - Register Agent: POST http://localhost:5008/api/a2a/agents"
echo "  - Send Message: POST http://localhost:5008/api/a2a/messages"
echo "  - Create Connection: POST http://localhost:5008/api/a2a/connections"
echo ""
echo "🤖 Strands SDK Endpoints:"
echo "  - List Agents: GET http://localhost:5006/api/strands-sdk/agents"
echo "  - Execute Agent: POST http://localhost:5006/api/strands-sdk/agents/{id}/execute"
echo ""
echo "🎯 Orchestration Endpoints:"
echo "  - Process Query: POST http://localhost:5014/api/enhanced-orchestration/query"
echo "  - Health Check: GET http://localhost:5014/api/enhanced-orchestration/health"
echo ""

# Show running processes
echo "🔄 Running A2A Services:"
ps aux | grep -E "(a2a_service|strands_sdk_api|enhanced_orchestration_api)" | grep -v grep

echo ""
echo "✅ A2A Multi-Agent Orchestration Services are ready!"
echo "📝 Logs are available in the 'logs/' directory"
echo "🛑 To stop services, run: pkill -f 'a2a_service|strands_sdk_api|enhanced_orchestration_api'"
