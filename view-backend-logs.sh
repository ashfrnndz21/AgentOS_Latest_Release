#!/bin/bash

echo "📋 Backend Service Logs Viewer"
echo "=============================="

# Check if logs directory exists
if [ ! -d "logs" ]; then
    echo "❌ Logs directory not found. Start services with: ./start-all-services-with-logs.sh"
    exit 1
fi

# Function to show log file with color
show_log() {
    local service=$1
    local logfile=$2
    
    echo ""
    echo "📄 $service Logs:"
    echo "$(printf '=%.0s' {1..50})"
    
    if [ -f "$logfile" ]; then
        tail -n 20 "$logfile"
    else
        echo "❌ Log file not found: $logfile"
    fi
}

# Show all service logs
show_log "RAG API (Port 5003)" "logs/rag-api.log"
show_log "Strands API (Port 5004)" "logs/strands-api.log" 
show_log "Ollama API (Port 5002)" "logs/ollama-api.log"
show_log "Chat Orchestrator (Port 5005)" "logs/chat-orchestrator.log"

echo ""
echo "🔄 To follow logs in real-time, use:"
echo "   tail -f logs/strands-sdk.log     # Strands SDK API"
echo "   tail -f logs/ollama-api.log      # Ollama API"
echo "   tail -f logs/rag-api.log         # RAG API"
echo ""
echo "🚀 To start services with visible Strands SDK logs:"
echo "   ./start-all-services-with-logs.sh"