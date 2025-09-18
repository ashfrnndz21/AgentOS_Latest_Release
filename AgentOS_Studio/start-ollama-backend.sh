#!/bin/bash

echo "🚀 Starting Ollama Terminal Backend..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama is not installed or not in PATH."
    echo "📥 Please install Ollama from https://ollama.ai"
    echo "🔄 Continuing anyway - you can install Ollama later..."
fi

# Create virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv backend/venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source backend/venv/bin/activate

# Install dependencies
echo "📚 Installing Python dependencies..."
pip install -r backend/requirements.txt

# Start the backend server
echo "🌐 Starting backend server on port 5002..."
echo "📡 Backend will be available at: http://localhost:5002"
echo "🔗 Health check: http://localhost:5002/health"
echo "📋 API docs: http://localhost:5002/docs"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

cd backend && python ollama_api.py