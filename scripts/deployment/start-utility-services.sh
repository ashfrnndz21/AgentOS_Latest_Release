#!/bin/bash

echo "🚀 Starting Utility Agentic Services..."
echo "======================================"

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

# Function to test service health
test_service() {
    local url=$1
    local service_name=$2
    
    echo "   Testing $service_name health..."
    
    if curl -s "$url" >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ $service_name is responding${NC}"
        return 0
    else
        echo -e "   ${YELLOW}⚠️  $service_name not responding yet${NC}"
        return 1
    fi
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Python virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo -e "${RED}❌ Virtual environment not found at backend/venv${NC}"
    echo "   Please run: python3 -m venv backend/venv"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/services/utility_agents/database_agent_service.py" ]; then
    echo -e "${RED}❌ Utility services not found${NC}"
    echo "   Please run this script from the project root directory"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

echo ""
echo "🧹 Cleaning up any existing utility services..."
# Clean up utility service ports
for port in 5041 5042 5043 5044; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "   Killing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done
sleep 3

echo ""
echo "🚀 Starting utility services..."

# Start Database Agent Service (Port 5041)
echo -e "${BLUE}1. Starting Database Agent Service...${NC}"
if ! check_port 5041; then
    echo -e "${RED}   Port 5041 is still in use!${NC}"
    exit 1
fi

echo "   Starting Database Agent Service on port 5041..."
cd backend
source venv/bin/activate
python3 services/utility_agents/database_agent_service.py >utility_database.log 2>&1 &
DATABASE_AGENT_PID=$!
cd ..

wait_for_service 5041 "Database Agent Service"
if [ $? -eq 0 ]; then
    sleep 3
    test_service "http://localhost:5041/health" "Database Agent Service"
fi

# Start Synthetic Data Service (Port 5042)
echo -e "${BLUE}2. Starting Synthetic Data Service...${NC}"
if ! check_port 5042; then
    echo -e "${RED}   Port 5042 is still in use!${NC}"
    exit 1
fi

echo "   Starting Synthetic Data Service on port 5042..."
cd backend
source venv/bin/activate
python3 services/utility_agents/synthetic_data_service.py >utility_synthetic.log 2>&1 &
SYNTHETIC_DATA_PID=$!
cd ..

wait_for_service 5042 "Synthetic Data Service"
if [ $? -eq 0 ]; then
    sleep 3
    test_service "http://localhost:5042/health" "Synthetic Data Service"
fi

# Start Utility Orchestration Engine (Port 5043)
echo -e "${BLUE}3. Starting Utility Orchestration Engine...${NC}"
if ! check_port 5043; then
    echo -e "${RED}   Port 5043 is still in use!${NC}"
    exit 1
fi

echo "   Starting Utility Orchestration Engine on port 5043..."
cd backend
source venv/bin/activate
python3 services/utility_agents/utility_orchestration_engine.py >utility_orchestration.log 2>&1 &
ORCHESTRATION_ENGINE_PID=$!
cd ..

wait_for_service 5043 "Utility Orchestration Engine"
if [ $? -eq 0 ]; then
    sleep 3
    test_service "http://localhost:5043/health" "Utility Orchestration Engine"
fi

# Start Utility API Gateway (Port 5044)
echo -e "${BLUE}4. Starting Utility API Gateway...${NC}"
if ! check_port 5044; then
    echo -e "${RED}   Port 5044 is still in use!${NC}"
    exit 1
fi

echo "   Starting Utility API Gateway on port 5044..."
cd backend
source venv/bin/activate
python3 services/utility_agents/utility_api_gateway.py >utility_gateway.log 2>&1 &
API_GATEWAY_PID=$!
cd ..

wait_for_service 5044 "Utility API Gateway"
if [ $? -eq 0 ]; then
    sleep 3
    test_service "http://localhost:5044/health" "Utility API Gateway"
fi

echo ""
echo "📊 Utility Services Status Summary:"
echo "=================================="

# Check all utility services
services=(
    "5041:Database Agent Service"
    "5042:Synthetic Data Service"
    "5043:Utility Orchestration Engine"
    "5044:Utility API Gateway"
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
    echo -e "${GREEN}🎉 All Utility Services Started Successfully!${NC}"
    echo ""
    echo "📡 Service URLs:"
    echo "   • Utility API Gateway:           http://localhost:5044  (Central Gateway)"
    echo "   • Database Agent Service:        http://localhost:5041  (Database Creation)"
    echo "   • Synthetic Data Service:        http://localhost:5042  (Data Generation)"
    echo "   • Utility Orchestration Engine:  http://localhost:5043  (Workflow Coordination)"
    echo ""
    echo "🌐 Frontend Integration:"
    echo "   • Access via: http://localhost:5173/utility-agentic-services"
    echo ""
    echo "🛑 To stop utility services, run: ./scripts/stop-utility-services.sh"
else
    echo -e "${RED}❌ Some utility services failed to start${NC}"
    echo "   Check the logs and try again"
    echo "   Log files: backend/utility_*.log"
    exit 1
fi

echo "======================================"
