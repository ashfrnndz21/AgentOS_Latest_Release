#!/bin/bash

echo "🔍 Backend Services Status Check"
echo "================================="

# Define services and their ports
declare -A services=(
    ["5002"]="Ollama API (Legacy)"
    ["5003"]="Strands API (Custom)"
    ["5004"]="Chat Orchestrator"
    ["5005"]="RAG API"
    ["5006"]="Strands SDK API (Official)"
    ["11434"]="Ollama Server"
)

echo ""
echo "Port Status:"
echo "------------"

for port in "${!services[@]}"; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo "✅ Port $port: ${services[$port]} - RUNNING"
    else
        echo "❌ Port $port: ${services[$port]} - NOT RUNNING"
    fi
done

echo ""
echo "Health Checks:"
echo "--------------"

# Test Strands SDK API
if curl -s http://localhost:5006/api/strands-sdk/health >/dev/null 2>&1; then
    echo "✅ Strands SDK API (5006) - Healthy"
    SDK_STATUS=$(curl -s http://localhost:5006/api/strands-sdk/health | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'SDK: {data[\"sdk_type\"]}, Available: {data[\"sdk_available\"]}')" 2>/dev/null)
    echo "   $SDK_STATUS"
else
    echo "❌ Strands SDK API (5006) - Not responding"
fi

# Test Ollama Server
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "✅ Ollama Server (11434) - Healthy"
    MODEL_COUNT=$(curl -s http://localhost:11434/api/tags | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data['models']))" 2>/dev/null)
    echo "   Models available: $MODEL_COUNT"
else
    echo "❌ Ollama Server (11434) - Not responding"
fi

# Test Legacy Ollama API
if curl -s http://localhost:5002/health >/dev/null 2>&1; then
    echo "✅ Legacy Ollama API (5002) - Healthy"
else
    echo "❌ Legacy Ollama API (5002) - Not responding"
fi

echo ""
echo "Frontend Integration:"
echo "--------------------"
echo "🎨 Dashboard: Two buttons available"
echo "   • 'Create Agent' → Legacy system (port 5002)"
echo "   • 'Create Strands Agent' → Official SDK (port 5006)"
echo ""
echo "📱 UI Components:"
echo "   • StrandsSdkAgentDialog.tsx - New creation dialog"
echo "   • StrandsSdkService.ts - Service layer for SDK API"
echo "   • Mixed agent display with badges"
echo ""
echo "🔄 Data Flow:"
echo "   User → Frontend → StrandsSdkService → Port 5006 → Official Strands SDK"