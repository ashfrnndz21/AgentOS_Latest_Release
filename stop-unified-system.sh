#!/bin/bash

# Unified Agent System Stop Script
# Stops all services started by start-unified-system.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping Unified Agent System...${NC}"
echo "=================================="

# Function to stop service by PID
stop_service() {
    local pid=$1
    local service_name=$2
    
    if [ ! -z "$pid" ] && [ "$pid" != "null" ]; then
        if kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}Stopping $service_name (PID: $pid)...${NC}"
            kill $pid
            sleep 2
            
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                echo -e "${YELLOW}Force stopping $service_name...${NC}"
                kill -9 $pid
            fi
            
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}$service_name (PID: $pid) was not running${NC}"
        fi
    else
        echo -e "${YELLOW}$service_name PID not found${NC}"
    fi
}

# Load PIDs from file
if [ -f ".unified_system_pids" ]; then
    source .unified_system_pids
    
    # Stop services in reverse order
    stop_service "$FRONTEND_PID" "Frontend"
    stop_service "$UNIFIED_SERVICE_PID" "Unified Agent Service"
    stop_service "$AGENT_REGISTRY_PID" "Agent Registry"
    stop_service "$FRONTEND_BRIDGE_PID" "Frontend Agent Bridge"
    stop_service "$A2A_SERVICE_PID" "A2A Service"
    stop_service "$STRANDS_SDK_PID" "Strands SDK API"
    stop_service "$OLLAMA_PID" "Ollama"
    
    # Remove PID file
    rm .unified_system_pids
    echo -e "${GREEN}✅ PID file cleaned up${NC}"
else
    echo -e "${YELLOW}No PID file found. Attempting to stop services by port...${NC}"
    
    # Stop services by port
    for port in 5015 5012 5010 5008 5006; do
        pid=$(lsof -ti:$port)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Stopping service on port $port (PID: $pid)...${NC}"
            kill $pid 2>/dev/null || true
        fi
    done
fi

# Stop any remaining Ollama processes
echo -e "${YELLOW}Checking for remaining Ollama processes...${NC}"
pkill -f "ollama serve" 2>/dev/null || true

# Stop any remaining Vite processes
echo -e "${YELLOW}Checking for remaining Vite processes...${NC}"
pkill -f "vite" 2>/dev/null || true

echo ""
echo -e "${GREEN}🎉 Unified Agent System Stopped Successfully!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}All services have been stopped:${NC}"
echo "• Ollama"
echo "• Strands SDK API"
echo "• A2A Service"
echo "• Agent Registry"
echo "• Frontend Agent Bridge"
echo "• Unified Agent Service"
echo "• Frontend Development Server"
echo ""
echo -e "${YELLOW}Note: Some services may take a few seconds to fully stop${NC}"

