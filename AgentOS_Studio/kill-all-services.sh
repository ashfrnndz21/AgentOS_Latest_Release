#!/bin/bash

echo "🛑 Killing All Backend Services..."
echo "=================================="

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    local service_name=$2
    
    echo "🔍 Checking port $port ($service_name)..."
    
    # Find processes using the port
    pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "   Found processes: $pids"
        for pid in $pids; do
            echo "   Killing PID $pid..."
            kill -9 $pid 2>/dev/null
        done
        echo "   ✅ Port $port cleared"
    else
        echo "   ✅ Port $port already free"
    fi
}

# Function to kill processes by name pattern
kill_by_pattern() {
    local pattern=$1
    local service_name=$2
    
    echo "🔍 Checking for $service_name processes..."
    
    # Find processes matching the pattern
    pids=$(pgrep -f "$pattern" 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "   Found processes: $pids"
        for pid in $pids; do
            echo "   Killing PID $pid..."
            kill -9 $pid 2>/dev/null
        done
        echo "   ✅ $service_name processes killed"
    else
        echo "   ✅ No $service_name processes found"
    fi
}

# Kill by port (most reliable method)
kill_port 5173 "Frontend (Vite)"
kill_port 5006 "Strands SDK API"
kill_port 5005 "Chat Orchestrator API"
kill_port 5004 "Strands API"
kill_port 5003 "RAG API"
kill_port 5002 "Ollama API"
kill_port 11434 "Ollama Core"

echo ""
echo "🔍 Killing processes by name pattern..."

# Kill by process name patterns (backup method)
kill_by_pattern "npm.*dev" "Frontend (npm)"
kill_by_pattern "node.*vite" "Frontend (Vite)"
kill_by_pattern "python.*strands_sdk_api" "Strands SDK API"
kill_by_pattern "python.*chat_orchestrator_api" "Chat Orchestrator API"
kill_by_pattern "python.*strands_api" "Strands API"
kill_by_pattern "python.*ollama_api" "Ollama API"
kill_by_pattern "python.*rag_api" "RAG API"
kill_by_pattern "python.*real_rag_api" "Real RAG API"
kill_by_pattern "python.*simple_api" "Simple API"
kill_by_pattern "python.*aws_agentcore" "AWS AgentCore"

echo ""
echo "🧹 Final cleanup..."

# Wait a moment for processes to fully terminate
sleep 2

# Verify ports are free
echo "🔍 Verifying ports are free..."
for port in 5173 5006 5005 5004 5003 5002; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "   ⚠️  Port $port still in use"
    else
        echo "   ✅ Port $port is free"
    fi
done

echo ""
echo "✅ All frontend and backend services killed!"
echo "=================================="