#!/bin/bash

echo "🚀 Starting Strands SDK Agent Service"
echo "====================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a Python package is installed
python_package_exists() {
    python3 -c "import $1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check if Python is available
if ! command_exists python3; then
    echo "❌ Python3 is not installed"
    echo "💡 Install Python3 from: https://python.org"
    exit 1
fi

echo "✅ Python3 is available: $(python3 --version)"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found"
    echo "💡 Make sure you're running this from the project root directory"
    exit 1
fi

# Check if strands_sdk_api.py exists
if [ ! -f "backend/strands_sdk_api.py" ]; then
    echo "❌ strands_sdk_api.py not found in backend directory"
    exit 1
fi

echo "✅ Strands SDK API file found"

# Check if port 5006 is already in use
if port_in_use 5006; then
    echo "⚠️  Port 5006 is already in use"
    echo "🛑 Stopping existing Strands SDK service..."
    pkill -f "strands_sdk_api.py" || true
    sleep 2
fi

# Check for required Python packages
echo "📦 Checking Python dependencies..."
required_packages=("flask" "flask_cors" "sqlite3" "requests")
missing_packages=()

for package in "${required_packages[@]}"; do
    if ! python_package_exists "$package"; then
        missing_packages+=("$package")
    fi
done

# Install missing packages
if [ ${#missing_packages[@]} -gt 0 ]; then
    echo "📥 Installing missing packages: ${missing_packages[*]}"
    pip3 install Flask Flask-CORS requests
else
    echo "✅ All required packages are installed"
fi

# Check for Strands SDK
echo "🔍 Checking for official Strands SDK..."
if python_package_exists "strands"; then
    echo "✅ Official Strands SDK is installed"
    echo "🎯 Will use real Strands SDK with Ollama integration"
else
    echo "⚠️  Official Strands SDK not found"
    echo "📝 Using fallback implementation for development"
    echo "💡 For production, install with: pip install strands-agents[ollama]"
fi

# Check if Ollama is running
echo "🔍 Checking Ollama connection..."
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "✅ Ollama is running and accessible"
else
    echo "⚠️  Ollama is not accessible at http://localhost:11434"
    echo "💡 Make sure Ollama is installed and running"
    echo "   Install from: https://ollama.ai"
fi

# Start the service
echo ""
echo "🔥 Starting Strands SDK Agent Service..."
echo "   Port: 5006"
echo "   Service URL: http://localhost:5006"
echo "   Health Check: http://localhost:5006/api/strands-sdk/health"
echo "   Streaming Endpoint: /api/strands-sdk/agents/{id}/execute-stream"
echo ""
echo "🛑 Press Ctrl+C to stop the service"
echo ""

# Navigate to backend directory and start the service
cd backend
python3 strands_sdk_api.py