#!/bin/bash

# AgentOS Studio Strands - Health Monitor Script
# This script monitors all services and restarts them if they fail

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CHECK_INTERVAL=30  # Check every 30 seconds
MAX_RESTART_ATTEMPTS=3

# Service configurations
declare -A SERVICES=(
    ["Strands SDK API"]="5006:strands_sdk_api.py"
    ["A2A Service"]="5008:a2a_service.py" 
    ["Main System Orchestrator"]="5030:main_system_orchestrator.py"
)

# Function to check if service is healthy
check_service_health() {
    local service_name=$1
    local port=$2
    
    case $service_name in
        "Strands SDK API")
            curl -s http://localhost:$port/api/strands-sdk/agents >/dev/null 2>&1
            ;;
        "A2A Service")
            curl -s http://localhost:$port/api/a2a/health >/dev/null 2>&1
            ;;
        "Main System Orchestrator")
            curl -s http://localhost:$port/api/main-orchestrator/discover-agents >/dev/null 2>&1
            ;;
    esac
}

# Function to restart a service
restart_service() {
    local service_name=$1
    local port=$2
    local script_name=$3
    
    echo -e "${YELLOW}🔄 Restarting $service_name...${NC}"
    
    # Kill existing process
    lsof -ti :$port | xargs kill -9 2>/dev/null || true
    sleep 2
    
    # Start new process
    cd "$(dirname "$0")/../backend"
    nohup python "$script_name" > "../logs/${service_name}.log" 2>&1 &
    local pid=$!
    
    # Wait and verify
    sleep 5
    if ps -p $pid > /dev/null && check_service_health "$service_name" "$port"; then
        echo -e "${GREEN}✅ $service_name restarted successfully (PID: $pid)${NC}"
        echo $pid > "../logs/${service_name}.pid"
        return 0
    else
        echo -e "${RED}❌ Failed to restart $service_name${NC}"
        return 1
    fi
}

# Function to monitor all services
monitor_services() {
    echo -e "${BLUE}🔍 Checking service health...${NC}"
    
    for service_name in "${!SERVICES[@]}"; do
        IFS=':' read -r port script_name <<< "${SERVICES[$service_name]}"
        
        if check_service_health "$service_name" "$port"; then
            echo -e "${GREEN}✅ $service_name: Healthy${NC}"
        else
            echo -e "${RED}❌ $service_name: Unhealthy${NC}"
            
            # Restart the service
            if restart_service "$service_name" "$port" "$script_name"; then
                echo -e "${GREEN}✅ $service_name: Restarted successfully${NC}"
            else
                echo -e "${RED}❌ $service_name: Failed to restart${NC}"
            fi
        fi
    done
}

# Main monitoring loop
echo -e "${BLUE}🚀 Starting AgentOS Studio Strands Health Monitor${NC}"
echo -e "${BLUE}📊 Monitoring services every $CHECK_INTERVAL seconds${NC}"
echo -e "${BLUE}🛑 Press Ctrl+C to stop monitoring${NC}"

# Create logs directory
mkdir -p logs

# Initial health check
monitor_services

# Continuous monitoring
while true; do
    sleep $CHECK_INTERVAL
    echo -e "${BLUE}$(date): Health check...${NC}"
    monitor_services
done

