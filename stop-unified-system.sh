#!/bin/bash

# AgentOS Studio Strands - Unified System Stop Script
# This script stops ALL services cleanly

echo "🛑 Stopping AgentOS Studio Strands - Unified System..."
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get project root
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && pwd)"

# Function to stop service by port
stop_service_by_port() {
    local port=$1
    local service_name=$2
    
    echo -e "${BLUE}🛑 Stopping $service_name on port $port...${NC}"
    
    if lsof -ti:$port >/dev/null 2>&1; then
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
        if lsof -ti:$port >/dev/null 2>&1; then
            echo -e "${RED}❌ Could not stop $service_name${NC}"
            return 1
        else
            echo -e "${GREEN}✅ $service_name stopped${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}⚠️  $service_name not running${NC}"
        return 0
    fi
}

# Function to stop service by process name
stop_service_by_name() {
    local service_name=$1
    local process_pattern=$2
    
    echo -e "${BLUE}🛑 Stopping $service_name...${NC}"
    
    if pgrep -f "$process_pattern" >/dev/null 2>&1; then
        pkill -f "$process_pattern" 2>/dev/null || true
        sleep 2
        if pgrep -f "$process_pattern" >/dev/null 2>&1; then
            echo -e "${RED}❌ Could not stop $service_name${NC}"
            return 1
        else
            echo -e "${GREEN}✅ $service_name stopped${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}⚠️  $service_name not running${NC}"
        return 0
    fi
}

# Stop all services
echo -e "${BLUE}🧹 Stopping all services...${NC}"

# Core Services
stop_service_by_port 5006 "Strands SDK API"
stop_service_by_port 5008 "A2A Service"
stop_service_by_port 5031 "Main System Orchestrator"

# Utility Services
stop_service_by_port 5041 "Database Agent Service"
stop_service_by_port 5042 "Synthetic Data Service"
stop_service_by_port 5043 "Utility Orchestration Engine"
stop_service_by_port 5044 "Utility API Gateway"

# Monitoring Services
stop_service_by_port 5011 "Resource Monitor API"
stop_service_by_port 5002 "Ollama API"

# Additional Services
stop_service_by_port 5014 "Enhanced Orchestration API"
stop_service_by_port 5021 "Working Orchestration API"
stop_service_by_port 5019 "Text Cleaning Service"
stop_service_by_port 5020 "Dynamic Context Refinement API"
stop_service_by_port 5003 "RAG API"
stop_service_by_port 5005 "Chat Orchestrator API"
stop_service_by_port 5004 "Strands API"
stop_service_by_port 5010 "Agent Registry Service"
stop_service_by_port 5018 "A2A Observability API"

# Additional cleanup
echo -e "${BLUE}🧹 Additional cleanup...${NC}"
stop_service_by_name "Any remaining Python services" "python.*backend"
stop_service_by_name "Any remaining utility services" "utility_agents"

# Kill any background jobs
echo -e "${BLUE}🧹 Cleaning up background jobs...${NC}"
jobs -p | xargs kill 2>/dev/null || true

# Wait for all processes to die
sleep 3

# Final verification
echo -e "${BLUE}🔍 Verifying all services are stopped...${NC}"
remaining_services=0

for port in 5002 5003 5004 5005 5006 5008 5010 5011 5014 5018 5019 5020 5021 5031 5041 5042 5043 5044; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $port still in use${NC}"
        remaining_services=$((remaining_services + 1))
    fi
done

if [ $remaining_services -eq 0 ]; then
    echo -e "${GREEN}🎉 All services stopped successfully!${NC}"
    echo -e "${GREEN}✅ System is now clean and ready for restart${NC}"
else
    echo -e "${YELLOW}⚠️  $remaining_services services still running${NC}"
    echo -e "${YELLOW}You may need to manually kill remaining processes${NC}"
fi

echo -e "${BLUE}📝 To restart all services: ./start-unified-system.sh${NC}"