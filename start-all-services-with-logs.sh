#!/bin/bash

echo "🚀 Starting All Backend Services with Logs..."
echo "============================================="

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

echo "🧹 Cleaning up any existing services..."
./kill-all-services.sh >/dev/null 2>&1

echo ""
echo "🚀 Starting services with visible logs..."

# Create logs directory
mkdir -p logs

# Start Ollama core service (if not already running)
echo -e "${BLUE}1. Starting Ollama Core Service...${NC}"
if ! check_port 11434; then
    echo "   Ollama already running on port 11434"
else
    echo "   Starting Ollama serve..."
    ollama serve > logs/ollama-core.log 2>&1 &
    sleep 3
fi

# Start RAG API (Document Chat)
echo -e "${BLUE}2. Starting RAG API (Document Chat) - Port 5003...${NC}"
cd backend
source venv/bin/activate
python rag_api.py > ../logs/rag-api.log 2>&1 &
RAG_PID=$!
cd ..
echo "   RAG API started (PID: $RAG_PID) - Logs: logs/rag-api.log"

# Start Strands API (Intelligence & Reasoning)
echo -e "${BLUE}3. Starting Strands API (Intelligence & Reasoning) - Port 5004...${NC}"
cd backend
source venv/bin/activate
python strands_api.py > ../logs/strands-api.log 2>&1 &
STRANDS_API_PID=$!
cd ..
echo "   Strands API started (PID: $STRANDS_API_PID) - Logs: logs/strands-api.log"

# Start Ollama API (Terminal & Agents)
echo -e "${BLUE}4. Starting Ollama API (Terminal & Agents) - Port 5002...${NC}"
cd backend
source venv/bin/activate
python ollama_api.py > ../logs/ollama-api.log 2>&1 &
OLLAMA_API_PID=$!
cd ..
echo "   Ollama API started (PID: $OLLAMA_API_PID) - Logs: logs/ollama-api.log"

# Start Chat Orchestrator API
echo -e "${BLUE}5. Starting Chat Orchestrator API - Port 5005...${NC}"
cd backend
source venv/bin/activate
python chat_orchestrator_api.py > ../logs/chat-orchestrator.log 2>&1 &
CHAT_ORCHESTRATOR_PID=$!
cd ..
echo "   Chat Orchestrator started (PID: $CHAT_ORCHESTRATOR_PID) - Logs: logs/chat-orchestrator.log"

# Start Strands SDK API (Individual Agent Analytics) - WITH VISIBLE LOGS
echo -e "${BLUE}6. Starting Strands SDK API (Individual Agent Analytics) - Port 5006...${NC}"
echo -e "${YELLOW}   This service will show logs in the terminal for debugging${NC}"
cd backend
source venv/bin/activate

echo ""
echo "🔍 Strands SDK API Logs (Press Ctrl+C to stop):"
echo "================================================"
python strands_sdk_api.py

# This won't be reached until Ctrl+C is pressed
echo ""
echo "🛑 Strands SDK API stopped. Cleaning up other services..."
./kill-all-services.sh