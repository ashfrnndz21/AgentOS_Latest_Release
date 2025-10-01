#!/bin/bash

# AgentOS Studio Strands - Unified System Startup Script
# This script starts ALL services from one place with proper dependency management

set -e  # Exit on any error

echo "🚀 Starting AgentOS Studio Strands - Unified System..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get project root
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && pwd)"
echo "Project Root: $PROJECT_ROOT"
mkdir -p "$PROJECT_ROOT/logs"

# Function to check if port is free
check_port() {
    local port=$1
    if lsof -ti:$port >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is free${NC}"
        return 0
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔄 Freeing port $port...${NC}"
    
    for i in {1..3}; do
        if lsof -ti:$port >/dev/null 2>&1; then
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 2
        else
            break
        fi
    done
    
    if lsof -ti:$port >/dev/null 2>&1; then
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
    local log_file="$PROJECT_ROOT/logs/${service_name// /_}.log"
    
    echo -e "${BLUE}🚀 Starting $service_name on port $port...${NC}"
    
    # Free the port
    if ! kill_port $port; then
        echo -e "${RED}❌ Could not free port $port for $service_name${NC}"
        return 1
    fi
    
    # Wait for port to be fully released
    sleep 2
    
    # Start the service
    cd "$PROJECT_ROOT/backend"
    source venv/bin/activate
    nohup python "$script_path" > "$log_file" 2>&1 &
    local pid=$!
    cd "$PROJECT_ROOT"
    
    # Wait and check if it started successfully
    sleep 5
    if ps -p $pid > /dev/null; then
        echo -e "${GREEN}✅ $service_name started successfully (PID: $pid)${NC}"
        echo $pid > "$PROJECT_ROOT/logs/${service_name// /_}.pid"
        return 0
    else
        echo -e "${RED}❌ Failed to start $service_name${NC}"
        echo -e "${RED}Check logs: $log_file${NC}"
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=15
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for $service_name to be ready on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if lsof -ti:$port >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready${NC}"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts..."
        sleep 3
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start within timeout${NC}"
    return 1
}

# Function to test service health
test_service() {
    local url=$1
    local service_name=$2
    
    echo -e "${BLUE}🔍 Testing $service_name health...${NC}"
    if curl -s "$url" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name: Healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name: Unhealthy${NC}"
        return 1
    fi
}

# Clean up any existing services
echo -e "${BLUE}🧹 Cleaning up existing services...${NC}"
pkill -f "strands_sdk_api" 2>/dev/null || true
pkill -f "a2a_service" 2>/dev/null || true
pkill -f "main_system_orchestrator" 2>/dev/null || true
pkill -f "resource_monitor_api" 2>/dev/null || true
pkill -f "utility_agents" 2>/dev/null || true
pkill -f "ollama_api" 2>/dev/null || true
pkill -f "enhanced_orchestration_api" 2>/dev/null || true
sleep 3

echo -e "${BLUE}📋 Starting services in dependency order...${NC}"

# CORE SERVICES (Essential)
echo -e "${BLUE}=== CORE SERVICES ===${NC}"

# 1. Strands SDK API (port 5006)
if start_service "Strands SDK API" 5006 "strands_sdk_api.py"; then
    wait_for_service 5006 "Strands SDK API"
fi

# 2. A2A Service (port 5008)
if start_service "A2A Service" 5008 "a2a_service.py"; then
    wait_for_service 5008 "A2A Service"
fi

# 3. Main System Orchestrator (port 5031)
if start_service "Main System Orchestrator" 5031 "main_system_orchestrator.py"; then
    wait_for_service 5031 "Main System Orchestrator"
fi

# UTILITY SERVICES (Database & Data Generation)
echo -e "${BLUE}=== UTILITY SERVICES ===${NC}"

# 4. Database Agent Service (port 5041) - Fixed with qwen model
if start_service "Database Agent Service" 5041 "services/utility_agents/database_agent_service.py"; then
    wait_for_service 5041 "Database Agent Service"
fi

# 5. Synthetic Data Service (port 5042)
if start_service "Synthetic Data Service" 5042 "services/utility_agents/synthetic_data_service.py"; then
    wait_for_service 5042 "Synthetic Data Service"
fi

# 6. Utility Orchestration Engine (port 5043)
if start_service "Utility Orchestration Engine" 5043 "services/utility_agents/utility_orchestration_engine.py"; then
    wait_for_service 5043 "Utility Orchestration Engine"
fi

# 7. Utility API Gateway (port 5044)
if start_service "Utility API Gateway" 5044 "services/utility_agents/utility_api_gateway.py"; then
    wait_for_service 5044 "Utility API Gateway"
fi

# MONITORING SERVICES
echo -e "${BLUE}=== MONITORING SERVICES ===${NC}"

# 8. Resource Monitor API (port 5011)
if start_service "Resource Monitor API" 5011 "resource_monitor_api.py"; then
    wait_for_service 5011 "Resource Monitor API"
fi

# 9. Ollama API (port 5002)
if start_service "Ollama API" 5002 "ollama_api.py"; then
    wait_for_service 5002 "Ollama API"
fi

# ADDITIONAL SERVICES (from dashboard)
echo -e "${BLUE}=== ADDITIONAL SERVICES ===${NC}"

# 10. Enhanced Orchestration API (port 5014)
if start_service "Enhanced Orchestration API" 5014 "enhanced_orchestration_api.py"; then
    wait_for_service 5014 "Enhanced Orchestration API"
fi

# 11. Working Orchestration API (port 5021)
if start_service "Working Orchestration API" 5021 "working_orchestration_api.py"; then
    wait_for_service 5021 "Working Orchestration API"
fi

# 12. Text Cleaning Service (port 5019)
if start_service "Text Cleaning Service" 5019 "text_cleaning_service.py"; then
    wait_for_service 5019 "Text Cleaning Service"
fi

# 13. Dynamic Context Refinement API (port 5020)
if start_service "Dynamic Context Refinement API" 5020 "dynamic_context_api.py"; then
    wait_for_service 5020 "Dynamic Context Refinement API"
fi

# 14. RAG API (port 5003)
if start_service "RAG API" 5003 "rag_api.py"; then
    wait_for_service 5003 "RAG API"
fi

# 15. Chat Orchestrator API (port 5005)
if start_service "Chat Orchestrator API" 5005 "chat_orchestrator_api.py"; then
    wait_for_service 5005 "Chat Orchestrator API"
fi

# 16. Strands API (port 5004)
if start_service "Strands API" 5004 "strands_api.py"; then
    wait_for_service 5004 "Strands API"
fi

# 17. Agent Registry Service (port 5010)
if start_service "Agent Registry Service" 5010 "agent_registry.py"; then
    wait_for_service 5010 "Agent Registry Service"
fi

# 18. A2A Observability API (port 5018)
if start_service "A2A Observability API" 5018 "a2a_observability_api.py"; then
    wait_for_service 5018 "A2A Observability API"
fi

# Wait for all services to be ready
echo -e "${BLUE}⏳ Waiting for all services to stabilize...${NC}"
sleep 10

# Health check all services
echo -e "${BLUE}🔍 Performing comprehensive health checks...${NC}"

# Core Services Health Checks
test_service "http://localhost:5006/api/strands-sdk/agents" "Strands SDK API"
test_service "http://localhost:5008/api/a2a/health" "A2A Service"
test_service "http://localhost:5031/api/simple-orchestration/health" "Main System Orchestrator"

# Utility Services Health Checks
test_service "http://localhost:5041/health" "Database Agent Service"
test_service "http://localhost:5042/health" "Synthetic Data Service"
test_service "http://localhost:5043/health" "Utility Orchestration Engine"
test_service "http://localhost:5044/api/utility/health" "Utility API Gateway"

# Monitoring Services Health Checks
test_service "http://localhost:5011/api/resource-monitor/health" "Resource Monitor API"
test_service "http://localhost:5002/health" "Ollama API"

# Additional Services Health Checks
test_service "http://localhost:5014/health" "Enhanced Orchestration API"
test_service "http://localhost:5021/health" "Working Orchestration API"
test_service "http://localhost:5019/health" "Text Cleaning Service"
test_service "http://localhost:5020/health" "Dynamic Context Refinement API"
test_service "http://localhost:5003/health" "RAG API"
test_service "http://localhost:5005/health" "Chat Orchestrator API"
test_service "http://localhost:5004/health" "Strands API"
test_service "http://localhost:5010/health" "Agent Registry Service"
test_service "http://localhost:5018/health" "A2A Observability API"

echo -e "${GREEN}🎉 Unified System Startup Complete!${NC}"
echo -e "${BLUE}📊 Service Status Summary:${NC}"
echo -e "   • Strands SDK API: http://localhost:5006"
echo -e "   • A2A Service: http://localhost:5008"
echo -e "   • Main System Orchestrator: http://localhost:5031"
echo -e "   • Database Agent Service: http://localhost:5041"
echo -e "   • Synthetic Data Service: http://localhost:5042"
echo -e "   • Utility Orchestration Engine: http://localhost:5043"
echo -e "   • Utility API Gateway: http://localhost:5044"
echo -e "   • Resource Monitor API: http://localhost:5011"
echo -e "   • Ollama API: http://localhost:5002"
echo -e "   • Enhanced Orchestration API: http://localhost:5014"
echo -e "   • Working Orchestration API: http://localhost:5021"
echo -e "   • Text Cleaning Service: http://localhost:5019"
echo -e "   • Dynamic Context Refinement API: http://localhost:5020"
echo -e "   • RAG API: http://localhost:5003"
echo -e "   • Chat Orchestrator API: http://localhost:5005"
echo -e "   • Strands API: http://localhost:5004"
echo -e "   • Agent Registry Service: http://localhost:5010"
echo -e "   • A2A Observability API: http://localhost:5018"
echo -e "   • Frontend: http://localhost:5173"
echo -e "${BLUE}📝 Logs are available in: logs/${NC}"
echo -e "${BLUE}🛑 To stop all services: ./stop-unified-system.sh${NC}"
echo -e "${GREEN}✅ All services are now running from one unified script!${NC}"