#!/bin/bash

echo "🚀 Starting Enterprise Agent Platform Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 to continue."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 to continue."
    exit 1
fi

# Install required packages
echo "📦 Installing required Python packages..."
pip3 install fastapi uvicorn sqlite3 || {
    echo "❌ Failed to install required packages. Please check your Python installation."
    exit 1
}

# Navigate to backend directory
cd backend || {
    echo "❌ Backend directory not found. Please ensure you're running this from the project root."
    exit 1
}

# Check API key status
echo "🔑 Checking API key configuration..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set - Generic agents will fail"
fi

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "⚠️  AWS credentials not set - Strands and Agent Core agents will fail"
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY not set - Alternative generic agents will fail"
fi

echo ""
echo "🌟 Starting backend server on http://localhost:8000"
echo "📊 Backend validation dashboard: http://localhost:5173/backend-validation"
echo "🔧 API documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the FastAPI server
python3 simple_api.py