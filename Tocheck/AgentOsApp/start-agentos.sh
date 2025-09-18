#!/bin/bash

echo "========================================"
echo "   AGENTOS PLATFORM"
echo "========================================"
echo ""
echo "🚀 Starting AgentOS with latest features:"
echo "✅ Grouped Navigation Sidebar"
echo "✅ AgentCore Observability"
echo "✅ Architecture Blueprint"
echo "✅ Agent Creation Wizards"
echo "✅ Multi-Agent Workspace"
echo "✅ Real-time Monitoring"
echo ""

# Check Python installation
echo "[1/4] Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
    echo "✅ Python3 found"
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
    echo "✅ Python found"
else
    echo ""
    echo "❌ Python is required but not installed."
    echo ""
    echo "📥 Please install Python:"
    echo "macOS: brew install python3"
    echo "Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "CentOS/RHEL: sudo yum install python3 python3-pip"
    echo ""
    exit 1
fi

# Install Python dependencies
echo "[2/4] Installing Python dependencies..."
cd app/backend
$PYTHON_CMD -m pip install flask flask-cors requests --quiet --user
cd ../..

# Clean up any existing processes
echo "[3/4] Preparing servers..."
pkill -f "agentos_api.py" 2>/dev/null
pkill -f "http.server" 2>/dev/null

# Start backend server
echo "Starting AgentOS backend API..."
$PYTHON_CMD app/backend/agentos_api.py &
BACKEND_PID=$!

# Wait for backend to initialize
echo "Waiting for backend to start..."
sleep 4

# Start frontend server and open browser
echo "[4/4] Starting AgentOS frontend..."
echo ""
echo "🎉 AgentOS is now running!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo ""
echo "✨ New Features:"
echo "- Grouped Navigation (4 main sections)"
echo "- AgentCore Observability"
echo "- Architecture Blueprint in Core Platform"
echo "- Enhanced agent creation workflows"
echo ""
echo "Opening browser..."

# Start frontend server
cd app/frontend
$PYTHON_CMD -m http.server 3000 &
FRONTEND_PID=$!
cd ../..

# Open browser
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
fi

echo ""
echo "Keep this terminal open while using AgentOS."
echo "Press Ctrl+C to stop all servers."
echo ""

# Wait for user to stop
trap 'echo ""; echo "Shutting down AgentOS..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "AgentOS stopped."; exit' INT
wait
