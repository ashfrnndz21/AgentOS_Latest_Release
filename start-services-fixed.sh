#!/bin/bash

# Fixed Service Startup Script - Breaks Circular Dependencies
# This script starts services in the correct order to prevent circular dependencies

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${BLUE}   Waiting for $service_name to be ready on port $port...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if check_port $port; then
            echo -e "${GREEN}   ✅ $service_name is ready!${NC}"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
        echo -e "${YELLOW}   Attempt $attempt/$max_attempts...${NC}"
    done
    
    echo -e "${RED}   ❌ $service_name failed to start on port $port${NC}"
    return 1
}

# Function to test service endpoint
test_service() {
    local url=$1
    local service_name=$2
    
    echo -e "${BLUE}   Testing $service_name at $url...${NC}"
    if curl -s --max-time 5 "$url" > /dev/null; then
        echo -e "${GREEN}   ✅ $service_name health check passed${NC}"
    else
        echo -e "${YELLOW}   ⚠️  $service_name health check failed (may still be starting)${NC}"
    fi
}

echo -e "${BLUE}🚀 Starting Services with Fixed Dependencies${NC}"
echo "================================================"

# Kill any existing processes on our ports
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
for port in 5002 5003 5004 5005 5006 5008 5010 5011 5014 5018 5019 5020 5021 5022; do
    if check_port $port; then
        echo -e "${YELLOW}   Killing process on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done
sleep 3

# Activate virtual environment
echo -e "${BLUE}🔧 Activating Python virtual environment...${NC}"
cd backend
source venv/bin/activate

# PHASE 1: Core Infrastructure Services (No Dependencies)
echo -e "${BLUE}📋 PHASE 1: Starting Core Infrastructure...${NC}"

# 1. Ollama Core (Port 11434) - External service, should already be running
echo -e "${BLUE}1. Checking Ollama Core (Port 11434)...${NC}"
if check_port 11434; then
    echo -e "${GREEN}   ✅ Ollama Core is already running${NC}"
else
    echo -e "${YELLOW}   ⚠️  Ollama Core not running - please start Ollama manually${NC}"
fi

# 2. Ollama API (Port 5002)
echo -e "${BLUE}2. Starting Ollama API...${NC}"
python ollama_api.py > ollama_api.log 2>&1 &
OLLAMA_API_PID=$!
wait_for_service 5002 "Ollama API"
test_service "http://localhost:5002/health" "Ollama API"

# 3. RAG API (Port 5003)
echo -e "${BLUE}3. Starting RAG API...${NC}"
python rag_api.py > rag_api.log 2>&1 &
RAG_API_PID=$!
wait_for_service 5003 "RAG API"
test_service "http://localhost:5003/health" "RAG API"

# 4. Strands API (Port 5004)
echo -e "${BLUE}4. Starting Strands API...${NC}"
python strands_api.py > strands_api.log 2>&1 &
STRANDS_API_PID=$!
wait_for_service 5004 "Strands API"
test_service "http://localhost:5004/api/strands/health" "Strands API"

# PHASE 2: Agent Management Services (Depend on Core Infrastructure)
echo -e "${BLUE}📋 PHASE 2: Starting Agent Management...${NC}"

# 5. Strands SDK API (Port 5006) - CRITICAL: Must start before A2A Service
echo -e "${BLUE}5. Starting Strands SDK API...${NC}"
python strands_sdk_api.py > strands_sdk_api.log 2>&1 &
STRANDS_SDK_PID=$!
wait_for_service 5006 "Strands SDK API"
test_service "http://localhost:5006/api/strands-sdk/health" "Strands SDK API"

# 6. Agent Registry (Port 5010)
echo -e "${BLUE}6. Starting Agent Registry...${NC}"
python agent_registry.py > agent_registry.log 2>&1 &
AGENT_REGISTRY_PID=$!
wait_for_service 5010 "Agent Registry"
test_service "http://localhost:5010/health" "Agent Registry"

# PHASE 3: Communication Services (Depend on Agent Management)
echo -e "${BLUE}📋 PHASE 3: Starting Communication Services...${NC}"

# 7. A2A Service (Port 5008) - NOW SAFE to start after Strands SDK
echo -e "${BLUE}7. Starting A2A Service...${NC}"
python a2a_service.py > a2a_service.log 2>&1 &
A2A_SERVICE_PID=$!
wait_for_service 5008 "A2A Service"
test_service "http://localhost:5008/api/a2a/health" "A2A Service"

# 8. Chat Orchestrator API (Port 5005)
echo -e "${BLUE}8. Starting Chat Orchestrator API...${NC}"
python chat_orchestrator_api.py > chat_orchestrator_api.log 2>&1 &
CHAT_ORCHESTRATOR_PID=$!
wait_for_service 5005 "Chat Orchestrator API"
test_service "http://localhost:5005/api/chat/health" "Chat Orchestrator API"

# PHASE 4: Orchestration Services (Depend on Communication)
echo -e "${BLUE}📋 PHASE 4: Starting Orchestration Services...${NC}"

# 9. Enhanced Orchestration API (Port 5014)
echo -e "${BLUE}9. Starting Enhanced Orchestration API...${NC}"
python enhanced_orchestration_api.py > enhanced_orchestration_api.log 2>&1 &
ENHANCED_ORCHESTRATION_PID=$!
wait_for_service 5014 "Enhanced Orchestration API"
test_service "http://localhost:5014/api/enhanced-orchestration/health" "Enhanced Orchestration API"

# 10. Working Orchestration API (Port 5022) - Updated port
echo -e "${BLUE}10. Starting Working Orchestration API...${NC}"
python working_orchestration_api.py > working_orchestration_api.log 2>&1 &
WORKING_ORCHESTRATION_PID=$!
wait_for_service 5022 "Working Orchestration API"
test_service "http://localhost:5022/health" "Working Orchestration API"

# PHASE 5: Supporting Services (Optional)
echo -e "${BLUE}📋 PHASE 5: Starting Supporting Services...${NC}"

# 11. Resource Monitor API (Port 5011)
echo -e "${BLUE}11. Starting Resource Monitor API...${NC}"
python resource_monitor_api.py > resource_monitor_api.log 2>&1 &
RESOURCE_MONITOR_PID=$!
wait_for_service 5011 "Resource Monitor API"

# 12. A2A Observability API (Port 5018)
echo -e "${BLUE}12. Starting A2A Observability API...${NC}"
python a2a_observability_api.py > a2a_observability_api.log 2>&1 &
A2A_OBSERVABILITY_PID=$!
wait_for_service 5018 "A2A Observability API"

# 13. Dynamic Context Refinement API (Port 5020)
echo -e "${BLUE}13. Starting Dynamic Context Refinement API...${NC}"
python dynamic_context_refinement_api.py > dynamic_context_refinement_api.log 2>&1 &
DYNAMIC_CONTEXT_PID=$!
wait_for_service 5020 "Dynamic Context Refinement API"

# 14. Frontend Agent Bridge (Port 5012) - REMOVED
echo -e "${YELLOW}14. Frontend Agent Bridge - REMOVED${NC}"

# PHASE 6: Frontend (Depends on all backend services)
echo -e "${BLUE}📋 PHASE 6: Starting Frontend...${NC}"
cd ..

# 15. Frontend (Port 5173)
echo -e "${BLUE}15. Starting Frontend...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
wait_for_service 5173 "Frontend"

# Service Status Summary
echo -e "${BLUE}📊 Service Status Summary${NC}"
echo "=========================="

services=(
    "11434:Ollama Core"
    "5002:Ollama API"
    "5003:RAG API"
    "5004:Strands API"
    "5005:Chat Orchestrator API"
    "5006:Strands SDK API"
    "5008:A2A Service"
    "5010:Agent Registry"
    "5011:Resource Monitor API"
    "5014:Enhanced Orchestration API"
    "5018:A2A Observability API"
    "5020:Dynamic Context Refinement API"
    "5022:Working Orchestration API"
    "5173:Frontend"
)

echo -e "${GREEN}✅ Running Services:${NC}"
for service in "${services[@]}"; do
    port=$(echo $service | cut -d: -f1)
    name=$(echo $service | cut -d: -f2)
    if check_port $port; then
        echo -e "   ${GREEN}✅ Port $port - $name${NC}"
    else
        echo -e "   ${RED}❌ Port $port - $name${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 Service startup completed!${NC}"
echo -e "${BLUE}📝 Logs are available in backend/*.log${NC}"
echo -e "${BLUE}🌐 Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}🔧 API Status: http://localhost:5022/health${NC}"

# Save PIDs for later cleanup
echo "$OLLAMA_API_PID $RAG_API_PID $STRANDS_API_PID $STRANDS_SDK_PID $AGENT_REGISTRY_PID $A2A_SERVICE_PID $CHAT_ORCHESTRATOR_PID $ENHANCED_ORCHESTRATION_PID $WORKING_ORCHESTRATION_PID $RESOURCE_MONITOR_PID $A2A_OBSERVABILITY_PID $DYNAMIC_CONTEXT_PID $FRONTEND_BRIDGE_PID $FRONTEND_PID" > service_pids.txt

echo -e "${YELLOW}💡 To stop all services: ./stop-all-services.sh${NC}"
