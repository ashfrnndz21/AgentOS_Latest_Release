#!/bin/bash

# Ollama Backend Startup Script
echo "🤖 Starting Ollama-enabled Backend Server..."

# Kill any existing backend processes
echo "🔄 Stopping existing backend processes..."
pkill -f "aws_agentcore_api.py" 2>/dev/null || true
pkill -f "simple_api.py" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Start the Ollama-enabled backend
echo "🚀 Starting Ollama backend on port 5001..."
cd backend && python simple_api.py &

# Wait for server to start
sleep 3

# Test if server is running
echo "🔍 Testing backend connection..."
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "✅ Ollama backend is running successfully!"
    echo "📡 Available endpoints:"
    echo "   - http://localhost:5001/api/ollama/status"
    echo "   - http://localhost:5001/api/ollama/models"
    echo "   - http://localhost:5001/api/ollama/terminal"
    echo ""
    echo "🎯 Access Ollama Terminal at: http://localhost:8081/ollama-terminal"
else
    echo "❌ Backend failed to start. Check for errors above."
    exit 1
fi