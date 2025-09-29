#!/bin/bash

echo "🚀 Starting All Backend Services..."
echo "==================================="

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

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "   Please install Node.js from: https://nodejs.org"
    exit 1
else
    echo -e "${GREEN}✅ Node.js found ($(node --version))${NC}"
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    echo "   Please install npm"
    exit 1
else
    echo -e "${GREEN}✅ npm found ($(npm --version))${NC}"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
    echo "   Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ node_modules found${NC}"
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}⚠️  Ollama not found in PATH${NC}"
    echo "   Install from: https://ollama.ai"
else
    echo -e "${GREEN}✅ Ollama found${NC}"
fi

echo ""
echo "🧹 Cleaning up any existing services..."
./kill-all-services.sh >/dev/null 2>&1

# Additional cleanup for common ports
echo "   Cleaning up common ports..."
for port in 5002 5003 5004 5005 5006 5008 5009 5010 5011 5014 5018 5019 5020 5021 5173; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "   Killing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done
sleep 3

echo ""
echo "🚀 Starting services..."

# Start Agent Registry Service
echo -e "${BLUE}1. Starting Agent Registry Service...${NC}"
if ! check_port 5010; then
    echo -e "${RED}   Port 5010 is still in use!${NC}"
    exit 1
fi

echo "   Starting Agent Registry on port 5010..."
cd backend
source venv/bin/activate
python agent_registry.py >agent_registry.log 2>&1 &
REGISTRY_PID=$!
cd ..

wait_for_service 5010 "Agent Registry"
if [ $? -eq 0 ]; then
    sleep 3
    test_service "http://localhost:5010/health" "Agent Registry"
fi

# A2A Agent Servers - REMOVED
echo -e "${YELLOW}2. A2A Agent Servers - REMOVED${NC}"

# Start Ollama core service (if not already running)
echo -e "${BLUE}3. Starting Ollama Core Service...${NC}"
if ! check_port 11434; then
    echo "   Ollama already running on port 11434"
else
    echo "   Starting Ollama serve..."
    ollama serve >/dev/null 2>&1 &
    wait_for_service 11434 "Ollama Core"
fi

# Start RAG API (Document Chat)
echo -e "${BLUE}2. Starting RAG API (Document Chat)...${NC}"
if ! check_port 5003; then
    echo -e "${RED}   Port 5003 is still in use!${NC}"
    exit 1
fi

echo "   Starting RAG API on port 5003..."
cd backend
source venv/bin/activate
python rag_api.py >/dev/null 2>&1 &
RAG_PID=$!
cd ..

wait_for_service 5003 "RAG API"
if [ $? -eq 0 ]; then
    # Test the service
    sleep 3
    test_service "http://localhost:5003/health" "RAG API"
fi

# Start Strands API (Intelligence & Reasoning)
echo -e "${BLUE}3. Starting Strands API (Intelligence & Reasoning)...${NC}"
if ! check_port 5004; then
    echo -e "${RED}   Port 5004 is still in use!${NC}"
    exit 1
fi

echo "   Starting Strands API on port 5004..."
cd backend
source venv/bin/activate
python strands_api.py >/dev/null 2>&1 &
STRANDS_API_PID=$!
cd ..

wait_for_service 5004 "Strands API"
if [ $? -eq 0 ]; then
    # Test the service
    sleep 3
    test_service "http://localhost:5004/api/strands/health" "Strands API"
fi

# Start Ollama API (Terminal & Agents)
echo -e "${BLUE}4. Starting Ollama API (Terminal & Agents)...${NC}"
if ! check_port 5002; then
    echo -e "${RED}   Port 5002 is still in use!${NC}"
    exit 1
fi

echo "   Starting Ollama API on port 5002..."
cd backend
source venv/bin/activate
python ollama_api.py >/dev/null 2>&1 &
OLLAMA_API_PID=$!
cd ..

wait_for_service 5002 "Ollama API"
if [ $? -eq 0 ]; then
    # Test the service
    sleep 3
    test_service "http://localhost:5002/health" "Ollama API"
fi

# Start Chat Orchestrator API
echo -e "${BLUE}5. Starting Chat Orchestrator API...${NC}"
if ! check_port 5005; then
    echo -e "${RED}   Port 5005 is still in use!${NC}"
    exit 1
fi

echo "   Starting Chat Orchestrator API on port 5005..."
cd backend
source venv/bin/activate
python chat_orchestrator_api.py >/dev/null 2>&1 &
CHAT_ORCHESTRATOR_PID=$!
cd ..

wait_for_service 5005 "Chat Orchestrator API"
if [ $? -eq 0 ]; then
    # Test the service
    sleep 3
    test_service "http://localhost:5005/api/chat/health" "Chat Orchestrator API"
fi

# Start Strands SDK API (Individual Agent Analytics)
echo -e "${BLUE}6. Starting Strands SDK API (Individual Agent Analytics)...${NC}"
if ! check_port 5006; then
    echo -e "${RED}   Port 5006 is still in use!${NC}"
    exit 1
fi

echo "   Starting Strands SDK API on port 5006..."
cd backend
source venv/bin/activate
python strands_sdk_api.py >strands_sdk_api.log 2>&1 &
STRANDS_SDK_PID=$!
cd ..

wait_for_service 5006 "Strands SDK API"
if [ $? -eq 0 ]; then
    # Test the service with retry logic for Strands SDK
    sleep 8
    retry_count=0
    max_retries=5
    while [ $retry_count -lt $max_retries ]; do
        if test_service "http://localhost:5006/api/strands-sdk/health" "Strands SDK API"; then
            break
        fi
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            echo "   Retrying health check in 5 seconds..."
            sleep 5
        fi
    done
fi

# Start A2A Communication Service (Agent-to-Agent Communication)
echo -e "${BLUE}7. Starting A2A Communication Service...${NC}"
if ! check_port 5008; then
    echo -e "${RED}   Port 5008 is still in use!${NC}"
    exit 1
fi

echo "   Starting A2A Communication Service on port 5008..."
cd backend
source venv/bin/activate
python a2a_service.py >a2a_service.log 2>&1 &
A2A_SERVICE_PID=$!
cd ..

wait_for_service 5008 "A2A Communication Service"
if [ $? -eq 0 ]; then
    # Test the service with retry logic
    sleep 5
    retry_count=0
    max_retries=3
    while [ $retry_count -lt $max_retries ]; do
        if test_service "http://localhost:5008/api/a2a/health" "A2A Communication Service"; then
            break
        fi
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            echo "   Retrying health check in 3 seconds..."
            sleep 3
        fi
    done
fi

# Enhanced Orchestration API replaces Strands Orchestration API

# Start Resource Monitor API
echo -e "${BLUE}8. Starting Resource Monitor API...${NC}"
if ! check_port 5011; then
    echo -e "${RED}   Port 5011 is still in use!${NC}"
    exit 1
fi

echo "   Starting Resource Monitor API on port 5011..."
cd backend
source venv/bin/activate
python resource_monitor_api.py >resource_monitor_api.log 2>&1 &
RESOURCE_MONITOR_PID=$!
cd ..

wait_for_service 5011 "Resource Monitor API"
if [ $? -eq 0 ]; then
    # Test the service
    sleep 3
    test_service "http://localhost:5011/api/resource-monitor/health" "Resource Monitor API"
fi

# Start Enhanced Orchestration API (Dynamic LLM Orchestration)
echo -e "${BLUE}9. Starting Enhanced Orchestration API...${NC}"
if ! check_port 5014; then
    echo -e "${RED}   Port 5014 is still in use!${NC}"
    exit 1
fi

echo "   Starting Enhanced Orchestration API on port 5014..."
cd backend
source venv/bin/activate
python enhanced_orchestration_api.py >enhanced_orchestration_api.log 2>&1 &
ENHANCED_ORCHESTRATION_PID=$!
cd ..

wait_for_service 5014 "Enhanced Orchestration API"
if [ $? -eq 0 ]; then
    # Test the service
    sleep 3
    test_service "http://localhost:5014/api/enhanced-orchestration/health" "Enhanced Orchestration API"
fi

# Start A2A Observability API (Observability & Tracing)
echo -e "${BLUE}10. Starting A2A Observability API...${NC}"
if ! check_port 5018; then
    echo -e "${YELLOW}   Port 5018 is in use, killing existing process...${NC}"
    lsof -ti:5018 | xargs kill -9 2>/dev/null || true
    sleep 2
fi
echo "   Starting A2A Observability API on port 5018..."
cd backend
source venv/bin/activate
python a2a_observability_api.py >a2a_observability_api.log 2>&1 &
A2A_OBSERVABILITY_PID=$!
cd ..
wait_for_service 5018 "A2A Observability API"
if [ $? -eq 0 ]; then
    sleep 3
    test_service "http://localhost:5018/api/a2a-observability/health" "A2A Observability API"
fi

# Start Text Cleaning Service (LLM Output Processing)
echo -e "${BLUE}11. Starting Text Cleaning Service...${NC}"
if ! check_port 5019; then
    echo -e "${YELLOW}   Port 5019 is in use, killing existing process...${NC}"
    lsof -ti:5019 | xargs kill -9 2>/dev/null || true
    sleep 2
fi
echo "   Starting Text Cleaning Service on port 5019..."
cd backend
source venv/bin/activate
python text_cleaning_service.py >text_cleaning_service.log 2>&1 &
TEXT_CLEANING_PID=$!
cd ..
wait_for_service 5019 "Text Cleaning Service"
if [ $? -eq 0 ]; then
    sleep 3
    test_service "http://localhost:5019/api/clean-text" "Text Cleaning Service"
fi

# Start Dynamic Context Refinement API (Intelligent Context Management)
echo -e "${BLUE}12. Starting Dynamic Context Refinement API...${NC}"
if ! check_port 5020; then
    echo -e "${YELLOW}   Port 5020 is in use, killing existing process...${NC}"
    lsof -ti:5020 | xargs kill -9 2>/dev/null || true
    sleep 2
fi
echo "   Starting Dynamic Context Refinement API on port 5020..."
cd backend
source venv/bin/activate
python dynamic_context_api.py >dynamic_context_api.log 2>&1 &
DYNAMIC_CONTEXT_PID=$!
cd ..
wait_for_service 5020 "Dynamic Context Refinement API"
if [ $? -eq 0 ]; then
    sleep 3
    test_service "http://localhost:5020/api/dynamic-context/health" "Dynamic Context Refinement API"
fi

# Start Working Orchestration API (Unified System Orchestrator)
echo -e "${BLUE}13. Starting Working Orchestration API (Unified System)...${NC}"
if ! check_port 5022; then
    echo -e "${YELLOW}   Port 5022 is in use, killing existing process...${NC}"
    lsof -ti:5022 | xargs kill -9 2>/dev/null || true
    sleep 2
fi
echo "   Starting Working Orchestration API on port 5022..."
cd backend
source venv/bin/activate
python working_orchestration_api.py >working_orchestration_api.log 2>&1 &
WORKING_ORCHESTRATION_PID=$!
cd ..
wait_for_service 5022 "Working Orchestration API"
if [ $? -eq 0 ]; then
    sleep 3
    test_service "http://localhost:5022/health" "Working Orchestration API"
fi

# Start Frontend Agent Bridge (Frontend-Backend Integration) - REMOVED
echo -e "${YELLOW}14. Frontend Agent Bridge - REMOVED${NC}"

# Start Frontend (Vite)
echo -e "${BLUE}15. Starting Frontend (Vite)...${NC}"
if ! check_port 5173; then
    echo -e "${YELLOW}   Port 5173 is in use, killing existing process...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "   Starting Vite dev server on port 5173..."
npm run dev >frontend.log 2>&1 &
FRONTEND_PID=$!

wait_for_service 5173 "Frontend"
if [ $? -eq 0 ]; then
    # Test the service
    sleep 3
    test_service "http://localhost:5173" "Frontend"
fi

echo ""
echo "📊 Service Status Summary:"
echo "=========================="

# Check all services
services=(
    "11434:Ollama Core"
    "5002:Ollama API"
    "5003:RAG API"
    "5004:Strands API"
    "5005:Chat Orchestrator API"
    "5006:Strands SDK API"
    "5008:A2A Communication Service"
    "5010:Agent Registry"
    "5011:Resource Monitor API"
    "5014:Enhanced Orchestration API"
    "5018:A2A Observability API"
    "5019:Text Cleaning Service"
    "5020:Dynamic Context Refinement API"
    "5022:Working Orchestration API"
    "5173:Frontend"
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
    echo -e "${GREEN}🎉 All services started successfully!${NC}"
    echo ""
    echo "📡 Service URLs:"
    echo "   • Frontend:                    http://localhost:5173"
    echo "   • Resource Monitor API:        http://localhost:5011  (System Monitoring)"
    echo "   • Agent Registry:              http://localhost:5010  (Agent Management)"
    echo "   • Enhanced Orchestration API:  http://localhost:5014  (Dynamic LLM Orchestration)"
    echo "   • A2A Communication Service:   http://localhost:5008  (Agent-to-Agent Communication)"
    echo "   • Strands SDK API:             http://localhost:5006  (Individual Agent Analytics)"
    echo "   • Chat Orchestrator:           http://localhost:5005  (Multi-Agent Chat)"
    echo "   • Strands API:                 http://localhost:5004  (Intelligence & Reasoning)"
    echo "   • RAG API:                     http://localhost:5003  (Document Chat)"
    echo "   • Ollama API:                  http://localhost:5002  (Terminal & Agents)"
    echo "   • Ollama Core:                 http://localhost:11434 (LLM Engine)"
    echo ""
    echo "🔧 Enhanced Services:"
    echo "   • A2A Observability API:       http://localhost:5018  (Observability & Tracing)"
    echo "   • Text Cleaning Service:        http://localhost:5019  (LLM Output Processing)"
    echo "   • Dynamic Context Refinement:   http://localhost:5020  (Intelligent Context Management)"
    echo "   • Working Orchestration API:    http://localhost:5021  (Unified System Orchestrator)"
    echo ""
    echo "🌐 Application is ready!"
    echo "   • Open your browser: http://localhost:5173"
    echo ""
    echo "🛑 To stop all services, run: ./kill-all-services.sh"
else
    echo -e "${RED}❌ Some services failed to start${NC}"
    echo "   Check the logs and try again"
    exit 1
fi

echo "==================================="