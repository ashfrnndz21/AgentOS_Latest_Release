#!/bin/bash

# Service Manager - Proper Process Management for AgentOS
# Prevents multiple processes and manages service lifecycle correctly

set -e

# Ensure we're using bash with associative array support
if [ -z "$BASH_VERSION" ]; then
    echo "This script requires bash. Please run with: bash service-manager.sh"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service configurations
declare -A SERVICES=(
    ["strands_sdk"]="strands_sdk_api.py:5006"
    ["a2a_service"]="a2a_service.py:5008"
    ["working_orchestration"]="working_orchestration_api.py:5021"
    ["enhanced_orchestration"]="enhanced_orchestration_api.py:5014"
    ["agent_registry"]="agent_registry.py:5010"
    ["chat_orchestrator"]="chat_orchestrator_api.py:5005"
    ["resource_monitor"]="resource_monitor_api.py:5011"
    # ["frontend_bridge"]="frontend_agent_bridge.py:5012" - REMOVED
)

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
    
    for service_name in "${!SERVICES[@]}"; do
        IFS=':' read -r script_name port <<< "${SERVICES[$service_name]}"
        
        if check_port $port; then
            local pid=$(lsof -ti:$port 2>/dev/null || echo "unknown")
            echo -e "   ${GREEN}✅ $service_name${NC} - Port $port - PID: $pid"
        else
            echo -e "   ${RED}❌ $service_name${NC} - Port $port - Not running"
        fi
    done
    
    echo ""
    echo -e "${BLUE}📈 SYSTEM RESOURCES${NC}"
    echo "==================="
    
    # Show memory usage of our services
    local total_memory=0
    local process_count=0
    
    for service_name in "${!SERVICES[@]}"; do
        IFS=':' read -r script_name port <<< "${SERVICES[$service_name]}"
        local pids=$(pgrep -f "$script_name" 2>/dev/null || true)
        
        if [ -n "$pids" ]; then
            for pid in $pids; do
                local memory=$(ps -o rss= -p $pid 2>/dev/null || echo "0")
                total_memory=$((total_memory + memory))
                process_count=$((process_count + 1))
            done
        fi
    done
    
    if [ $process_count -gt 0 ]; then
        local memory_mb=$((total_memory / 1024))
        echo -e "   ${BLUE}Processes:${NC} $process_count"
        echo -e "   ${BLUE}Memory Usage:${NC} ${memory_mb}MB"
    else
        echo -e "   ${YELLOW}No services running${NC}"
    fi
}

# Function to clean up all services
cleanup_all() {
    echo -e "${YELLOW}🧹 CLEANING UP ALL SERVICES${NC}"
    echo "============================="
    
    for service_name in "${!SERVICES[@]}"; do
        IFS=':' read -r script_name port <<< "${SERVICES[$service_name]}"
        kill_service "$service_name" "$script_name"
    done
    
    echo -e "${GREEN}✅ All services cleaned up${NC}"
}

# Function to start essential services only
start_essential() {
    echo -e "${BLUE}🚀 STARTING ESSENTIAL SERVICES${NC}"
    echo "==============================="
    
    # Start in dependency order
    local essential_services=("strands_sdk" "a2a_service" "working_orchestration")
    
    for service_name in "${essential_services[@]}"; do
        IFS=':' read -r script_name port <<< "${SERVICES[$service_name]}"
        
        # Kill existing first
        kill_service "$service_name" "$script_name"
        
        # Start fresh
        if start_service "$service_name" "$script_name" "$port"; then
            echo -e "${GREEN}   ✅ $service_name started successfully${NC}"
        else
            echo -e "${RED}   ❌ Failed to start $service_name${NC}"
            return 1
        fi
        
        # Small delay between services
        sleep 2
    done
    
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
        echo -e "${BLUE}🔧 Service Manager for AgentOS${NC}"
        echo "============================"
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
