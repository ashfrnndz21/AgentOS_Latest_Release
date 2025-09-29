#!/bin/bash

echo "🚀 Starting Optimized Backend Services..."
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service configuration
SERVICES=(
    "agent_registry:5010:agent_registry.py:Agent Registry"
    "strands_sdk:5006:strands_sdk_api.py:Strands SDK API"
    "resource_monitor:5011:resource_monitor_api.py:Resource Monitor"
    "ollama_api:5002:ollama_api.py:Ollama API"
    "rag_api:5003:rag_api.py:RAG API"
    "strands_api:5004:strands_api.py:Strands API"
    "chat_orchestrator:5005:chat_orchestrator_api.py:Chat Orchestrator"
    "a2a_service:5008:a2a_service.py:A2A Communication"
    "enhanced_orchestration:5014:enhanced_orchestration_api.py:Enhanced Orchestration"
    "working_orchestration:5022:working_orchestration_api.py:Working Orchestration"
    # "frontend_bridge:5012:frontend_agent_bridge.py:Frontend Bridge" - REMOVED
    "a2a_observability:5018:a2a_observability_api.py:A2A Observability"
    "dynamic_context:5020:dynamic_context_api.py:Dynamic Context"
)

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
    local max_attempts=15
    local attempt=1
    
    echo "   Waiting for $service_name to start on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if lsof -ti:$port >/dev/null 2>&1; then
            echo -e "   ${GREEN}✅ $service_name started successfully${NC}"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts..."
        sleep 3
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

# Function to start a service
start_service() {
    local service_id=$1
    local port=$2
    local script=$3
    local name=$4
    
    echo -e "${BLUE}Starting $name...${NC}"
    
    if ! check_port $port; then
        echo -e "${YELLOW}   Port $port is in use, killing existing process...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    echo "   Starting $name on port $port..."
    cd backend
    source venv/bin/activate
    python $script >${service_id}.log 2>&1 &
    local pid=$!
    cd ..
    
    # Wait for service to start
    if wait_for_service $port "$name"; then
        sleep 2
        # Test service health
        case $service_id in
            "agent_registry")
                test_service "http://localhost:$port/health" "$name"
                ;;
            "strands_sdk")
                test_service "http://localhost:$port/api/strands-sdk/health" "$name"
                ;;
            "a2a_service")
                test_service "http://localhost:$port/api/a2a/health" "$name"
                ;;
            "enhanced_orchestration")
                test_service "http://localhost:$port/api/enhanced-orchestration/health" "$name"
                ;;
            "working_orchestration")
                test_service "http://localhost:$port/health" "$name"
                ;;
            *)
                test_service "http://localhost:$port/health" "$name"
                ;;
        esac
        return 0
    else
        echo -e "${RED}   Failed to start $name${NC}"
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
sleep 3

echo ""
echo "🚀 Starting services in optimized order..."

# Start Ollama Core first (external dependency)
echo -e "${BLUE}Starting Ollama Core Service...${NC}"
if ! check_port 11434; then
    echo "   Ollama already running on port 11434"
else
    echo "   Starting Ollama serve..."
    ollama serve >/dev/null 2>&1 &
    wait_for_service 11434 "Ollama Core"
fi

# Start services in dependency order
for service in "${SERVICES[@]}"; do
    IFS=':' read -r service_id port script name <<< "$service"
    start_service "$service_id" "$port" "$script" "$name"
    sleep 2  # Brief pause between services
done

# Start Frontend last
echo -e "${BLUE}Starting Frontend (Vite)...${NC}"
if ! check_port 5173; then
    echo -e "${YELLOW}   Port 5173 is in use, killing existing process...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "   Starting Vite dev server on port 5173..."
npm run dev >frontend.log 2>&1 &
wait_for_service 5173 "Frontend"

echo ""
echo "📊 Service Status Summary:"
echo "=========================="

# Check all services
all_running=true
for service in "${SERVICES[@]}"; do
    IFS=':' read -r service_id port script name <<< "$service"
    if lsof -ti:$port >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $name (port $port) - Running${NC}"
    else
        echo -e "${RED}❌ $name (port $port) - Not Running${NC}"
        all_running=false
    fi
done

# Check frontend
if lsof -ti:5173 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend (port 5173) - Running${NC}"
else
    echo -e "${RED}❌ Frontend (port 5173) - Not Running${NC}"
    all_running=false
fi

echo ""
if [ "$all_running" = true ]; then
    echo -e "${GREEN}🎉 All services started successfully!${NC}"
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

echo "========================================="
