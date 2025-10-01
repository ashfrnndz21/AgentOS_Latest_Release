#!/bin/bash

echo "🚀 Starting Main System Orchestrator..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIN_ORCHESTRATOR_PORT=5030
ORCHESTRATOR_MODEL="qwen3:1.7b"

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

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Python 3 found${NC}"
fi

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo -e "${RED}❌ Ollama is not running on port 11434${NC}"
    echo "   Please start Ollama first: ollama serve"
    exit 1
else
    echo -e "${GREEN}✅ Ollama is running${NC}"
fi

# Check if Qwen3:1.7b model is available
if ! curl -s http://localhost:11434/api/tags | grep -q "qwen3:1.7b"; then
    echo -e "${YELLOW}⚠️  Qwen3:1.7b model not found${NC}"
    echo "   Installing Qwen3:1.7b model..."
    ollama pull qwen3:1.7b
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Qwen3:1.7b model installed${NC}"
    else
        echo -e "${RED}❌ Failed to install Qwen3:1.7b model${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Qwen3:1.7b model is available${NC}"
fi

# Check if required services are running
echo ""
echo "🔍 Checking required services..."

# Check Strands SDK API
if curl -s http://localhost:5006/api/strands-sdk/agents >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Strands SDK API (port 5006) is running${NC}"
else
    echo -e "${RED}❌ Strands SDK API (port 5006) is not running${NC}"
    echo "   Please start the Strands SDK API first"
    exit 1
fi

# Check A2A Service
if curl -s http://localhost:5008/api/a2a/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ A2A Service (port 5008) is running${NC}"
else
    echo -e "${RED}❌ A2A Service (port 5008) is not running${NC}"
    echo "   Please start the A2A Service first"
    exit 1
fi

# Check if Main Orchestrator port is free
echo ""
echo "🧹 Checking port availability..."
if ! check_port $MAIN_ORCHESTRATOR_PORT; then
    echo -e "${YELLOW}⚠️  Port $MAIN_ORCHESTRATOR_PORT is in use${NC}"
    echo "   Killing existing process on port $MAIN_ORCHESTRATOR_PORT..."
    lsof -ti:$MAIN_ORCHESTRATOR_PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start Main System Orchestrator
echo ""
echo -e "${BLUE}🚀 Starting Main System Orchestrator...${NC}"

echo "   Starting Main Orchestrator on port $MAIN_ORCHESTRATOR_PORT..."
cd backend
source venv/bin/activate
python main_system_orchestrator.py >main_orchestrator.log 2>&1 &
MAIN_ORCHESTRATOR_PID=$!
cd ..

wait_for_service $MAIN_ORCHESTRATOR_PORT "Main System Orchestrator"
if [ $? -eq 0 ]; then
    sleep 3
    test_service "http://localhost:$MAIN_ORCHESTRATOR_PORT/health" "Main System Orchestrator"
fi

echo ""
echo "📊 Main System Orchestrator Status:"
echo "=================================="

# Check service status
if lsof -ti:$MAIN_ORCHESTRATOR_PORT >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Main System Orchestrator (port $MAIN_ORCHESTRATOR_PORT) - Running${NC}"
    echo ""
    echo "📡 Service URLs:"
    echo "   • Main Orchestrator:           http://localhost:$MAIN_ORCHESTRATOR_PORT"
    echo "   • Health Check:                http://localhost:$MAIN_ORCHESTRATOR_PORT/health"
    echo "   • Discover Agents:             http://localhost:$MAIN_ORCHESTRATOR_PORT/api/main-orchestrator/discover-agents"
    echo "   • Analyze Query:               http://localhost:$MAIN_ORCHESTRATOR_PORT/api/main-orchestrator/analyze"
    echo "   • Orchestrate:                 http://localhost:$MAIN_ORCHESTRATOR_PORT/api/main-orchestrator/orchestrate"
    echo "   • Sessions:                    http://localhost:$MAIN_ORCHESTRATOR_PORT/api/main-orchestrator/sessions"
    echo ""
    echo "🧠 Model: $ORCHESTRATOR_MODEL"
    echo "🔗 A2A Strands SDK Integration: Enabled"
    echo "🎯 Orchestration-Enabled Agents: Ready"
    echo ""
    echo -e "${GREEN}🎉 Main System Orchestrator started successfully!${NC}"
    echo ""
    echo "🛑 To stop the service, run: kill $MAIN_ORCHESTRATOR_PID"
else
    echo -e "${RED}❌ Main System Orchestrator failed to start${NC}"
    echo "   Check the logs: backend/main_orchestrator.log"
    exit 1
fi

echo "======================================"

