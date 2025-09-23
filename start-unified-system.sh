#!/bin/bash

# Unified Agent System Startup Script
# Starts all required services for the unified agent management system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use!${NC}"
        return 1
    else
        echo -e "${GREEN}Port $1 is available${NC}"
        return 0
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo -e "${BLUE}Waiting for $service_name to be ready on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:$port/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}Attempt $attempt/$max_attempts - $service_name not ready yet...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start after $max_attempts attempts${NC}"
    return 1
}

# Function to test service
test_service() {
    local url=$1
    local service_name=$2
    
    echo -e "${BLUE}Testing $service_name...${NC}"
    if curl -s "$url" >/dev/null; then
        echo -e "${GREEN}✅ $service_name is responding${NC}"
    else
        echo -e "${RED}❌ $service_name is not responding${NC}"
    fi
}

echo -e "${BLUE}🚀 Starting Unified Agent System...${NC}"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Start Ollama (if not running)
echo -e "${BLUE}1. Checking Ollama...${NC}"
if ! pgrep -f "ollama serve" > /dev/null; then
    echo -e "${YELLOW}Starting Ollama...${NC}"
    ollama serve > logs/ollama.log 2>&1 &
    OLLAMA_PID=$!
    echo "Ollama PID: $OLLAMA_PID"
    sleep 3
else
    echo -e "${GREEN}Ollama is already running${NC}"
fi

# Start Strands SDK API
echo -e "${BLUE}2. Starting Strands SDK API (Port 5006)...${NC}"
if ! check_port 5006; then
    echo -e "${RED}Port 5006 is in use. Please stop the service using port 5006 and try again.${NC}"
    exit 1
fi

cd backend
source venv/bin/activate
python strands_sdk_api.py > ../logs/strands_sdk.log 2>&1 &
STRANDS_SDK_PID=$!
cd ..
echo "Strands SDK PID: $STRANDS_SDK_PID"

wait_for_service 5006 "Strands SDK API"
if [ $? -eq 0 ]; then
    test_service "http://localhost:5006/api/strands-sdk/health" "Strands SDK API"
fi

# Start A2A Service
echo -e "${BLUE}3. Starting A2A Service (Port 5008)...${NC}"
if ! check_port 5008; then
    echo -e "${RED}Port 5008 is in use. Please stop the service using port 5008 and try again.${NC}"
    exit 1
fi

cd backend
python a2a_service.py > ../logs/a2a_service.log 2>&1 &
A2A_SERVICE_PID=$!
cd ..
echo "A2A Service PID: $A2A_SERVICE_PID"

wait_for_service 5008 "A2A Service"
if [ $? -eq 0 ]; then
    test_service "http://localhost:5008/api/a2a/health" "A2A Service"
fi

# Start Frontend Agent Bridge
echo -e "${BLUE}4. Starting Frontend Agent Bridge (Port 5012)...${NC}"
if ! check_port 5012; then
    echo -e "${RED}Port 5012 is in use. Please stop the service using port 5012 and try again.${NC}"
    exit 1
fi

cd backend
python frontend_agent_bridge.py > ../logs/frontend_bridge.log 2>&1 &
FRONTEND_BRIDGE_PID=$!
cd ..
echo "Frontend Bridge PID: $FRONTEND_BRIDGE_PID"

wait_for_service 5012 "Frontend Agent Bridge"
if [ $? -eq 0 ]; then
    test_service "http://localhost:5012/health" "Frontend Agent Bridge"
fi

# Start Agent Registry
echo -e "${BLUE}5. Starting Agent Registry (Port 5010)...${NC}"
if ! check_port 5010; then
    echo -e "${RED}Port 5010 is in use. Please stop the service using port 5010 and try again.${NC}"
    exit 1
fi

cd backend
python agent_registry.py > ../logs/agent_registry.log 2>&1 &
AGENT_REGISTRY_PID=$!
cd ..
echo "Agent Registry PID: $AGENT_REGISTRY_PID"

wait_for_service 5010 "Agent Registry"
if [ $? -eq 0 ]; then
    test_service "http://localhost:5010/health" "Agent Registry"
fi

# Start Unified Agent Service
echo -e "${BLUE}6. Starting Unified Agent Service (Port 5015)...${NC}"
if ! check_port 5015; then
    echo -e "${RED}Port 5015 is in use. Please stop the service using port 5015 and try again.${NC}"
    exit 1
fi

cd backend
python unified_agent_service.py > ../logs/unified_agent_service.log 2>&1 &
UNIFIED_SERVICE_PID=$!
cd ..
echo "Unified Service PID: $UNIFIED_SERVICE_PID"

wait_for_service 5015 "Unified Agent Service"
if [ $? -eq 0 ]; then
    test_service "http://localhost:5015/api/unified/health" "Unified Agent Service"
fi

# Start Frontend (if not already running)
echo -e "${BLUE}7. Starting Frontend Development Server...${NC}"
if ! pgrep -f "vite" > /dev/null; then
    echo -e "${YELLOW}Starting Vite development server...${NC}"
    npm run dev > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    sleep 5
else
    echo -e "${GREEN}Frontend is already running${NC}"
fi

# Save PIDs for cleanup
cat > .unified_system_pids << EOF
OLLAMA_PID=$OLLAMA_PID
STRANDS_SDK_PID=$STRANDS_SDK_PID
A2A_SERVICE_PID=$A2A_SERVICE_PID
FRONTEND_BRIDGE_PID=$FRONTEND_BRIDGE_PID
AGENT_REGISTRY_PID=$AGENT_REGISTRY_PID
UNIFIED_SERVICE_PID=$UNIFIED_SERVICE_PID
FRONTEND_PID=$FRONTEND_PID
EOF

echo ""
echo -e "${GREEN}🎉 Unified Agent System Started Successfully!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}Services Running:${NC}"
echo "• Ollama: http://localhost:11434"
echo "• Strands SDK API: http://localhost:5006"
echo "• A2A Service: http://localhost:5008"
echo "• Agent Registry: http://localhost:5010"
echo "• Frontend Bridge: http://localhost:5012"
echo "• Unified Service: http://localhost:5015"
echo "• Frontend: http://localhost:5173"
echo ""
echo -e "${BLUE}Unified Agent Dashboard:${NC}"
echo "• http://localhost:5173/unified-agents"
echo ""
echo -e "${YELLOW}To stop all services, run: ./stop-unified-system.sh${NC}"
echo -e "${YELLOW}To view logs, check the logs/ directory${NC}"
echo ""
echo -e "${GREEN}✅ All systems are ready!${NC}"

