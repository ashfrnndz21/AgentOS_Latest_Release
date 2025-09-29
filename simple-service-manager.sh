#!/bin/bash

# Simple Service Manager - Proper Process Management for AgentOS
# Prevents multiple processes and manages service lifecycle correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Essential services
STRANDS_SDK_SCRIPT="strands_sdk_api.py"
STRANDS_SDK_PORT="5006"
A2A_SERVICE_SCRIPT="a2a_service.py"
A2A_SERVICE_PORT="5008"
WORKING_ORCH_SCRIPT="working_orchestration_api.py"
WORKING_ORCH_PORT="5021"

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes by name pattern
kill_service() {
    local service_name=$1
    local script_name=$2
    
    echo -e "${YELLOW}🛑 Stopping $service_name...${NC}"
    
    # Kill processes by script name
    local pids=$(pgrep -f "$script_name" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}   Found processes: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 2
        echo -e "${GREEN}   ✅ $service_name stopped${NC}"
    else
        echo -e "${BLUE}   ℹ️  No $service_name processes running${NC}"
    fi
}

# Function to start a single service
start_service() {
    local service_name=$1
    local script_name=$2
    local port=$3
    
    echo -e "${BLUE}🚀 Starting $service_name on port $port...${NC}"
    
    # Check if port is already in use
    if check_port $port; then
        echo -e "${YELLOW}   ⚠️  Port $port is in use, killing existing process...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Start the service
    cd backend
    source venv/bin/activate
    python "$script_name" > "${service_name}.log" 2>&1 &
    local pid=$!
    cd ..
    
    # Wait for service to be ready
    local max_attempts=15
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if check_port $port; then
            echo -e "${GREEN}   ✅ $service_name is running on port $port (PID: $pid)${NC}"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
        echo -e "${YELLOW}   Waiting... ($attempt/$max_attempts)${NC}"
    done
    
    echo -e "${RED}   ❌ $service_name failed to start on port $port${NC}"
    return 1
}

# Function to show service status
show_status() {
    echo -e "${BLUE}📊 SERVICE STATUS${NC}"
    echo "=================="
    
    # Check Strands SDK
    if check_port $STRANDS_SDK_PORT; then
        local pid=$(lsof -ti:$STRANDS_SDK_PORT 2>/dev/null || echo "unknown")
        echo -e "   ${GREEN}✅ Strands SDK${NC} - Port $STRANDS_SDK_PORT - PID: $pid"
    else
        echo -e "   ${RED}❌ Strands SDK${NC} - Port $STRANDS_SDK_PORT - Not running"
    fi
    
    # Check A2A Service
    if check_port $A2A_SERVICE_PORT; then
        local pid=$(lsof -ti:$A2A_SERVICE_PORT 2>/dev/null || echo "unknown")
        echo -e "   ${GREEN}✅ A2A Service${NC} - Port $A2A_SERVICE_PORT - PID: $pid"
    else
        echo -e "   ${RED}❌ A2A Service${NC} - Port $A2A_SERVICE_PORT - Not running"
    fi
    
    # Check Working Orchestration
    if check_port $WORKING_ORCH_PORT; then
        local pid=$(lsof -ti:$WORKING_ORCH_PORT 2>/dev/null || echo "unknown")
        echo -e "   ${GREEN}✅ Working Orchestration${NC} - Port $WORKING_ORCH_PORT - PID: $pid"
    else
        echo -e "   ${RED}❌ Working Orchestration${NC} - Port $WORKING_ORCH_PORT - Not running"
    fi
    
    echo ""
    echo -e "${BLUE}📈 SYSTEM RESOURCES${NC}"
    echo "==================="
    
    # Show memory usage
    local total_processes=0
    local total_memory=0
    
    for script in "$STRANDS_SDK_SCRIPT" "$A2A_SERVICE_SCRIPT" "$WORKING_ORCH_SCRIPT"; do
        local pids=$(pgrep -f "$script" 2>/dev/null || true)
        if [ -n "$pids" ]; then
            for pid in $pids; do
                local memory=$(ps -o rss= -p $pid 2>/dev/null || echo "0")
                total_memory=$((total_memory + memory))
                total_processes=$((total_processes + 1))
            done
        fi
    done
    
    if [ $total_processes -gt 0 ]; then
        local memory_mb=$((total_memory / 1024))
        echo -e "   ${BLUE}Processes:${NC} $total_processes"
        echo -e "   ${BLUE}Memory Usage:${NC} ${memory_mb}MB"
    else
        echo -e "   ${YELLOW}No services running${NC}"
    fi
}

# Function to clean up all services
cleanup_all() {
    echo -e "${YELLOW}🧹 CLEANING UP ALL SERVICES${NC}"
    echo "============================="
    
    kill_service "Strands SDK" "$STRANDS_SDK_SCRIPT"
    kill_service "A2A Service" "$A2A_SERVICE_SCRIPT"
    kill_service "Working Orchestration" "$WORKING_ORCH_SCRIPT"
    
    echo -e "${GREEN}✅ All services cleaned up${NC}"
}

# Function to start essential services only
start_essential() {
    echo -e "${BLUE}🚀 STARTING ESSENTIAL SERVICES${NC}"
    echo "==============================="
    
    # Kill existing first
    cleanup_all
    sleep 3
    
    # Start in dependency order
    if start_service "Strands SDK" "$STRANDS_SDK_SCRIPT" "$STRANDS_SDK_PORT"; then
        echo -e "${GREEN}   ✅ Strands SDK started successfully${NC}"
    else
        echo -e "${RED}   ❌ Failed to start Strands SDK${NC}"
        return 1
    fi
    
    sleep 2
    
    if start_service "A2A Service" "$A2A_SERVICE_SCRIPT" "$A2A_SERVICE_PORT"; then
        echo -e "${GREEN}   ✅ A2A Service started successfully${NC}"
    else
        echo -e "${RED}   ❌ Failed to start A2A Service${NC}"
        return 1
    fi
    
    sleep 2
    
    if start_service "Working Orchestration" "$WORKING_ORCH_SCRIPT" "$WORKING_ORCH_PORT"; then
        echo -e "${GREEN}   ✅ Working Orchestration started successfully${NC}"
    else
        echo -e "${RED}   ❌ Failed to start Working Orchestration${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Essential services started!${NC}"
    echo -e "${BLUE}Working Orchestration API: http://localhost:5021${NC}"
    echo -e "${BLUE}Strands SDK API: http://localhost:5006${NC}"
    echo -e "${BLUE}A2A Service: http://localhost:5008${NC}"
}

# Main command handling
case "${1:-status}" in
    "start")
        start_essential
        ;;
    "stop")
        cleanup_all
        ;;
    "restart")
        cleanup_all
        sleep 3
        start_essential
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup_all
        ;;
    *)
        echo -e "${BLUE}🔧 Simple Service Manager for AgentOS${NC}"
        echo "=================================="
        echo ""
        echo "Usage: $0 {start|stop|restart|status|cleanup}"
        echo ""
        echo "Commands:"
        echo "  start   - Start essential services (Strands SDK, A2A, Working Orchestration)"
        echo "  stop    - Stop all services"
        echo "  restart - Stop and start essential services"
        echo "  status  - Show current service status"
        echo "  cleanup - Clean up all processes"
        echo ""
        echo "Current status:"
        show_status
        ;;
esac

