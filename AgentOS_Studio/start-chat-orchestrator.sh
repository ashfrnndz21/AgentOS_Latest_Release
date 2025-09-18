#!/bin/bash

echo "🚀 Starting Chat Orchestrator API"
echo "================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if required packages are installed
echo "📦 Checking dependencies..."
python3 -c "import flask, flask_cors, requests, sqlite3" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Missing required Python packages"
    echo "💡 Install with: pip3 install flask flask-cors requests"
    exit 1
fi

# Check if Ollama is running
echo "🔍 Checking Ollama connection..."
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "⚠️  Ollama is not running on localhost:11434"
    echo "💡 Start Ollama first: ollama serve"
    echo "🔄 Continuing anyway (will show connection error in API)"
fi

# Check if Strands API is running (optional)
echo "🔍 Checking Strands API connection..."
if ! curl -s http://localhost:5004/health > /dev/null; then
    echo "⚠️  Strands API is not running on localhost:5004"
    echo "💡 Agent palette features will be limited"
fi

echo ""
echo "🎯 Starting Chat Orchestrator on port 5005..."
echo "📍 API will be available at: http://localhost:5005"
echo ""
echo "🔗 Key endpoints:"
echo "   • Health: http://localhost:5005/health"
echo "   • Models: http://localhost:5005/api/chat/models"
echo "   • Agents: http://localhost:5005/api/chat/agents"
echo "   • Sessions: http://localhost:5005/api/chat/sessions"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the Chat Orchestrator API
cd backend
python3 chat_orchestrator_api.py