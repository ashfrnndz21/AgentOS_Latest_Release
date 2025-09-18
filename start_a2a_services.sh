#!/bin/bash

# A2A Services Startup Script
# Starts A2A services without conflicting with existing services

echo "🚀 Starting A2A Services..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

# Function to wait for service to start
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=10
    local attempt=1
    
    echo "   Waiting for $service_name to start on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if lsof -ti:$port >/dev/null 2>&1; then
            echo -e "   ${GREEN}✅ $service_name started successfully${NC}"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "   ${RED}❌ $service_name failed to start${NC}"
    return 1
}

# Function to start service in background
start_service() {
    local service_name=$1
    local command=$2
    local port=$3
    
    echo "🔧 Starting $service_name on port $port..."
    
    if check_port $port; then
        nohup $command > logs/${service_name}.log 2>&1 &
        local pid=$!
        echo "✅ $service_name started with PID $pid"
        echo $pid > logs/${service_name}.pid
    else
        echo "❌ Failed to start $service_name - port $port is in use"
        return 1
    fi
}

# Create logs directory
mkdir -p logs

# Check existing services first
echo ""
echo "🔍 Checking existing services..."

# Check if Strands SDK is already running (Port 5006)
if check_port 5006; then
    echo -e "${BLUE}Starting Strands SDK Service (Port 5006)...${NC}"
    start_service "strands_sdk" "cd backend && python3 strands_sdk_api.py" 5006
else
    echo -e "${GREEN}✅ Strands SDK Service already running on port 5006${NC}"
fi

# Check if Strands Orchestration is already running (Port 5009)
if check_port 5009; then
    echo -e "${BLUE}Starting Strands Orchestration Service (Port 5009)...${NC}"
    start_service "strands_orchestration" "cd backend && python3 strands_orchestration_simple.py" 5009
else
    echo -e "${GREEN}✅ Strands Orchestration Service already running on port 5009${NC}"
fi

# Start A2A Service (Port 5007) - This is new
echo -e "${BLUE}Starting A2A Communication Service (Port 5007)...${NC}"
start_service "a2a_service" "cd backend && python3 a2a_service.py" 5007

# Wait a moment for services to start
echo ""
echo "⏳ Waiting for services to start..."
sleep 3

# Check service health
echo ""
echo "🔍 Checking Service Health..."

# Check A2A Service
echo -n "A2A Service (5007): "
if curl -s http://localhost:5007/api/a2a/health > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Not responding"
fi

# Check Strands SDK Service
echo -n "Strands SDK (5006): "
if curl -s http://localhost:5006/api/strands-sdk/health > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Not responding"
fi

# Check Strands Orchestration Service
echo -n "Strands Orchestration (5009): "
if curl -s http://localhost:5009/api/strands-orchestration/health > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Not responding"
fi

echo ""
echo "🎉 A2A Services Startup Complete!"
echo "================================"
echo ""
echo "📊 Service Status:"
echo "   A2A Service: http://localhost:5007"
echo "   Strands SDK: http://localhost:5006"
echo "   Orchestration: http://localhost:5009"
echo ""
echo "📝 Logs:"
echo "   A2A Service: logs/a2a_service.log"
echo "   Strands SDK: logs/strands_sdk.log"
echo "   Orchestration: logs/strands_orchestration.log"
echo ""
echo "🔧 To stop services:"
echo "   ./stop_a2a_services.sh"
echo ""
echo "🧪 To test A2A integration:"
echo "   python3 test_a2a_backend_integration.py"
