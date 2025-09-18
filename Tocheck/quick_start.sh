#!/bin/bash

echo "🚀 QUICK START - Banking Agent Platform"
echo "======================================"

echo ""
echo "🎯 Starting Backend Services..."
python start_complete_backend.py &
BACKEND_PID=$!

echo ""
echo "⏳ Waiting for backend to initialize..."
sleep 5

echo ""
echo "🎯 Backend Status:"
curl -s http://localhost:5052/health || echo "Backend not ready yet..."

echo ""
echo "✅ READY TO START FRONTEND!"
echo ""
echo "🌐 Run these commands:"
echo "   npm install  # If needed"
echo "   npm run dev  # Start frontend"
echo ""
echo "🔗 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5052"
echo "   API Docs: http://localhost:5052/docs"
echo ""
echo "🛑 To stop backend: kill $BACKEND_PID"
