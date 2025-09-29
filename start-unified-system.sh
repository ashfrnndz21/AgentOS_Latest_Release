#!/bin/bash

echo "🚀 Starting Unified Orchestration System..."
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is free
check_port() {
    local port=$1
    if lsof -ti:$port >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is free
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

# Clean up existing services
echo "🧹 Cleaning up existing services..."
for port in 5006 5021 5173; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "   Killing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done
sleep 3

echo ""
echo "🚀 Starting core services..."

# Start Strands SDK API (required for agent execution)
echo -e "${BLUE}1. Starting Strands SDK API...${NC}"
if ! check_port 5006; then
    echo -e "${RED}   Port 5006 is still in use!${NC}"
    exit 1
fi

echo "   Starting Strands SDK API on port 5006..."
cd backend
source venv/bin/activate
python strands_sdk_api.py >strands_sdk_api.log 2>&1 &
STRANDS_SDK_PID=$!
cd ..

wait_for_service 5006 "Strands SDK API"
if [ $? -eq 0 ]; then
    sleep 5
    echo -e "   ${GREEN}✅ Strands SDK API ready${NC}"
fi

# Start Working Orchestration API (Unified System)
echo -e "${BLUE}2. Starting Working Orchestration API...${NC}"
if ! check_port 5021; then
    echo -e "${RED}   Port 5021 is still in use!${NC}"
    exit 1
fi

echo "   Starting Working Orchestration API on port 5021..."
cd backend
source venv/bin/activate
python working_orchestration_api.py >working_orchestration_api.log 2>&1 &
WORKING_ORCHESTRATION_PID=$!
cd ..

wait_for_service 5021 "Working Orchestration API"
if [ $? -eq 0 ]; then
    sleep 3
    echo -e "   ${GREEN}✅ Working Orchestration API ready${NC}"
fi

# Start Frontend
echo -e "${BLUE}3. Starting Frontend...${NC}"
if ! check_port 5173; then
    echo -e "${RED}   Port 5173 is still in use!${NC}"
    exit 1
fi

echo "   Starting Vite dev server on port 5173..."
npm run dev >frontend.log 2>&1 &
FRONTEND_PID=$!

wait_for_service 5173 "Frontend"
if [ $? -eq 0 ]; then
    sleep 3
    echo -e "   ${GREEN}✅ Frontend ready${NC}"
fi

echo ""
echo "📊 Service Status:"
echo "=================="

# Check services
services=(
    "5006:Strands SDK API"
    "5021:Working Orchestration API"
    "5173:Frontend"
)

all_running=true

for service in "${services[@]}"; do
    port=$(echo $service | cut -d: -f1)
    name=$(echo $service | cut -d: -f2)
    
    if lsof -ti:$port >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $name (port $port) - Running${NC}"
    else
        echo -e "${RED}❌ $name (port $port) - Not Running${NC}"
        all_running=false
    fi
done

echo ""
if [ "$all_running" = true ]; then
    echo -e "${GREEN}🎉 Unified Orchestration System ready!${NC}"
    echo ""
    echo "📡 Service URLs:"
    echo "   • Frontend:                    http://localhost:5173"
    echo "   • Working Orchestration API:    http://localhost:5021"
    echo "   • Strands SDK API:             http://localhost:5006"
    echo ""
    echo "🎯 Test the system:"
    echo "   1. Go to http://localhost:5173"
    echo "   2. Navigate to 'A2A Orchestration'"
    echo "   3. Enter a query and test orchestration"
    echo ""
    echo "🛑 To stop services, run: ./kill-unified-system.sh"
else
    echo -e "${RED}❌ Some services failed to start${NC}"
    echo "   Check the logs and try again"
    exit 1
fi

echo "==========================================="