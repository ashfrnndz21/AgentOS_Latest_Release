#!/bin/bash

# AgentOS Studio Strands - Stop All Services Script
# This script cleanly stops all services and cleans up processes

echo "🛑 Stopping AgentOS Studio Strands System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop service by PID file
stop_service_by_pid() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}🔄 Stopping $service_name (PID: $pid)...${NC}"
            kill -TERM $pid
            sleep 2
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${YELLOW}⚠️  Force killing $service_name...${NC}"
                kill -9 $pid
            fi
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name was not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}⚠️  No PID file found for $service_name${NC}"
    fi
}

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    local service_name=$2
    
    echo -e "${YELLOW}🔄 Checking port $port for $service_name...${NC}"
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${YELLOW}🔄 Killing processes on port $port...${NC}"
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✅ Port $port cleared${NC}"
    else
        echo -e "${GREEN}✅ Port $port is already free${NC}"
    fi
}

# Stop services in reverse order
echo -e "${BLUE}📋 Stopping services...${NC}"

# Stop Main System Orchestrator (port 5030)
stop_service_by_pid "Main System Orchestrator"
kill_port_processes 5030 "Main System Orchestrator"

# Stop A2A Service (port 5008)
stop_service_by_pid "A2A Service" 
kill_port_processes 5008 "A2A Service"

# Stop Strands SDK API (port 5006)
stop_service_by_pid "Strands SDK API"
kill_port_processes 5006 "Strands SDK API"

# Clean up any remaining processes
echo -e "${BLUE}🧹 Cleaning up any remaining processes...${NC}"

# Kill any remaining Python processes that might be our services
pkill -f "main_system_orchestrator.py" 2>/dev/null || true
pkill -f "a2a_service.py" 2>/dev/null || true  
pkill -f "strands_sdk_api.py" 2>/dev/null || true

# Final port check
echo -e "${BLUE}🔍 Final port check...${NC}"
for port in 5006 5008 5030; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $port still in use${NC}"
    else
        echo -e "${GREEN}✅ Port $port is free${NC}"
    fi
done

echo -e "${GREEN}🎉 All services stopped successfully!${NC}"
echo -e "${BLUE}📝 Logs are preserved in: logs/${NC}"
echo -e "${BLUE}🚀 To restart: ./scripts/start-all-services.sh${NC}"

