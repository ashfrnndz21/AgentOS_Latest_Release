#!/bin/bash

# 🚀 Complete Frontend Restart Script with Cache Clearing
# This script fully restarts the frontend development server and clears all caches

echo "🔄 Starting Complete Frontend Restart..."
echo "=================================="

# 1. Kill any existing frontend processes
echo "🛑 Stopping existing frontend processes..."
pkill -f "vite"
pkill -f "npm run dev"
pkill -f "yarn dev"
sleep 2

# 2. Clear all caches
echo "🧹 Clearing all caches..."

# Clear npm cache
npm cache clean --force 2>/dev/null || echo "   npm cache already clean"

# Clear Vite cache
rm -rf node_modules/.vite 2>/dev/null || echo "   .vite cache already clean"
rm -rf .vite 2>/dev/null || echo "   root .vite cache already clean"

# Clear dist folder
rm -rf dist 2>/dev/null || echo "   dist folder already clean"

# Clear browser cache files (if any)
rm -rf .cache 2>/dev/null || echo "   .cache folder already clean"

# 3. Reinstall dependencies (quick)
echo "📦 Refreshing dependencies..."
npm install --silent

# 4. Start fresh development server
echo "🚀 Starting fresh development server..."
echo "   Frontend will be available at: http://localhost:5173"
echo "   Backend should be running at: http://localhost:8000"
echo ""
echo "✅ Cache cleared - browser will load fresh code!"
echo "   Press Ctrl+C to stop the server"
echo "=================================="

# Start with clean environment
npm run dev