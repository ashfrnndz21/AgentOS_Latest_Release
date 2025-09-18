#!/bin/bash

# 🚀 Complete App Restart Script
# Restarts both frontend and backend with proper cleanup

echo "🔄 COMPLETE APP RESTART"
echo "======================"

# 1. Stop all processes
echo "🛑 Stopping all processes..."
pkill -f "vite" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null  
pkill -f "python.*simple_api" 2>/dev/null
sleep 3

# 2. Clear all caches
echo "🧹 Clearing caches..."
npm cache clean --force 2>/dev/null
rm -rf node_modules/.vite 2>/dev/null
rm -rf .vite 2>/dev/null
rm -rf dist 2>/dev/null

# 3. Check Ollama is running
echo "🤖 Checking Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running"
else
    echo "🚀 Starting Ollama..."
    ollama serve &
    sleep 3
fi

# 4. Start backend
echo "🐍 Starting backend..."
python backend/simple_api.py &
BACKEND_PID=$!
sleep 5

# Check if backend started
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend started successfully"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# 5. Start frontend
echo "⚛️  Starting frontend..."
npm run dev &
FRONTEND_PID=$!
sleep 5

# 6. Check if frontend started
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend started successfully"
else
    echo "⏳ Frontend still starting..."
fi

echo ""
echo "🎯 APP RESTART COMPLETE!"
echo "======================"
echo "✅ Backend: http://localhost:8000"
echo "✅ Frontend: http://localhost:5173"
echo "✅ Ollama: http://localhost:11434"
echo ""
echo "📋 Process IDs:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🔧 To stop everything:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🌐 Open in browser: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop monitoring..."

# Monitor both processes
while true; do
    sleep 10
    
    # Check backend
    if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "⚠️  Backend stopped responding"
    fi
    
    # Check frontend  
    if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "⚠️  Frontend stopped responding"
    fi
done