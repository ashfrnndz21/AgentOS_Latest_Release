#!/bin/bash
echo "🚀 Starting Complete System..."

# Kill existing processes
pkill -f "python.*backend" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Start backend
echo "Starting backend..."
python backend/simple_api.py &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Test backend
if curl -s http://localhost:5052/health > /dev/null; then
    echo "✅ Backend started successfully"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend
echo "Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ System started!"
echo "Backend: http://localhost:5052"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop..."

# Wait for interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
