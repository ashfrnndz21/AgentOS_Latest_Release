#!/bin/bash

# A2A Observability Service Startup Script
echo "🚀 Starting A2A Observability Service..."
echo "📍 Port: 5018"
echo "🔍 Comprehensive A2A orchestration monitoring"
echo "📊 Real-time trace analysis and metrics"
echo "🔄 Context evolution tracking"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed or not in PATH"
    exit 1
fi

# Check if the observability API file exists
if [ ! -f "backend/a2a_observability_api.py" ]; then
    echo "❌ A2A Observability API file not found"
    exit 1
fi

# Change to backend directory
cd backend

# Start the observability API
echo "🔄 Starting A2A Observability API..."
python3 a2a_observability_api.py
