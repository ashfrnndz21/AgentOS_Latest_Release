#!/bin/bash

echo "🔄 Killing all Agent OS services..."

# Kill all Python processes related to our services
pkill -f "python.*a2a_service" 2>/dev/null
pkill -f "python.*main_system_orchestrator" 2>/dev/null
pkill -f "python.*ollama_api" 2>/dev/null
pkill -f "python.*strands_sdk_api" 2>/dev/null

# Kill any processes using our specific ports
lsof -ti:5002 | xargs kill -9 2>/dev/null
lsof -ti:5006 | xargs kill -9 2>/dev/null
lsof -ti:5008 | xargs kill -9 2>/dev/null
lsof -ti:5031 | xargs kill -9 2>/dev/null

# Wait for processes to fully terminate
sleep 3

echo "✅ All services killed"
echo "🔍 Checking for remaining processes..."

# Check if any processes are still running
REMAINING=$(ps aux | grep -E "(a2a_service|main_system_orchestrator|ollama_api|strands_sdk_api)" | grep -v grep | wc -l)

if [ $REMAINING -gt 0 ]; then
    echo "⚠️  Some processes still running, force killing..."
    ps aux | grep -E "(a2a_service|main_system_orchestrator|ollama_api|strands_sdk_api)" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "✅ All services terminated"

