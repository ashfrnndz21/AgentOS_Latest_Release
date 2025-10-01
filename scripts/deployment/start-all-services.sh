#!/bin/bash

# AgentOS Studio Strands - Complete System Startup Script
# This script ensures all services start in the correct order and stay running

set -e  # Exit on any error

echo "🚀 Starting AgentOS Studio Strands System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is free${NC}"
        return 0
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔄 Killing processes on port $port...${NC}"
    
    # Multiple attempts to kill processes
    for i in {1..3}; do
        if lsof -i :$port >/dev/null 2>&1; then
            echo -e "${YELLOW}🔄 Attempt $i: Killing processes on port $port...${NC}"
            lsof -ti :$port | xargs kill -9 2>/dev/null || true
            sleep 3
        else
            break
        fi
    done
    
    # Final check
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${RED}❌ Could not free port $port${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is now free${NC}"
        return 0
    fi
}

# Function to start service with error handling
start_service() {
    local service_name=$1
    local port=$2
    local script_path=$3
    
    echo -e "${BLUE}🚀 Starting $service_name on port $port...${NC}"
    
    # Kill any existing processes on the port
    if ! kill_port $port; then
        echo -e "${RED}❌ Could not free port $port for $service_name${NC}"
        return 1
    fi
    
    # Wait a bit more for port to be fully released
    sleep 2
    
    # Start the service
    cd "$PROJECT_ROOT/backend"
    nohup python "$script_path" > "$PROJECT_ROOT/logs/${service_name// /_}.log" 2>&1 &
    local pid=$!
    
    # Wait and check if it started successfully
    sleep 5
    if ps -p $pid > /dev/null; then
        echo -e "${GREEN}✅ $service_name started successfully (PID: $pid)${NC}"
        echo $pid > "$PROJECT_ROOT/logs/${service_name// /_}.pid"
    else
        echo -e "${RED}❌ Failed to start $service_name${NC}"
        exit 1
    fi
}

# Create logs directory
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
echo "PROJECT_ROOT: $PROJECT_ROOT"
mkdir -p "$PROJECT_ROOT/logs"

# Start services in correct order
echo -e "${BLUE}📋 Starting services in dependency order...${NC}"

# 1. Strands SDK API (port 5006)
start_service "Strands SDK API" 5006 "strands_sdk_api.py"

# 2. A2A Service (port 5008) 
start_service "A2A Service" 5008 "a2a_service.py"

# 3. Main System Orchestrator (port 5031)
start_service "Main System Orchestrator" 5031 "main_system_orchestrator.py"

# 4. Utility Services (ports 5041-5044)
echo -e "${BLUE}🚀 Starting Utility Services...${NC}"
cd "$PROJECT_ROOT"
./scripts/start-utility-services.sh

# Wait for all services to be ready
echo -e "${BLUE}⏳ Waiting for all services to be ready...${NC}"
sleep 5

# Health check all services
echo -e "${BLUE}🔍 Performing health checks...${NC}"

# Check Strands SDK
if curl -s http://localhost:5006/api/strands-sdk/agents >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Strands SDK API: Healthy${NC}"
else
    echo -e "${RED}❌ Strands SDK API: Unhealthy${NC}"
fi

# Check A2A Service
if curl -s http://localhost:5008/api/a2a/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ A2A Service: Healthy${NC}"
else
    echo -e "${RED}❌ A2A Service: Unhealthy${NC}"
fi

# Check Main System Orchestrator
if curl -s http://localhost:5031/api/simple-orchestration/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Main System Orchestrator: Healthy${NC}"
else
    echo -e "${RED}❌ Main System Orchestrator: Unhealthy${NC}"
fi

# Check Utility Services
if curl -s http://localhost:5044/api/utility/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Utility Services: Healthy${NC}"
else
    echo -e "${RED}❌ Utility Services: Unhealthy${NC}"
fi

echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo -e "${BLUE}📊 Service Status:${NC}"
echo -e "   • Strands SDK API: http://localhost:5006"
echo -e "   • A2A Service: http://localhost:5008" 
echo -e "   • Main System Orchestrator: http://localhost:5031"
echo -e "   • Utility Services Gateway: http://localhost:5044"
echo -e "   • Frontend: http://localhost:5173"
echo -e "${BLUE}📝 Logs are available in: logs/${NC}"
echo -e "${BLUE}🛑 To stop all services: ./scripts/stop-all-services.sh${NC}"
