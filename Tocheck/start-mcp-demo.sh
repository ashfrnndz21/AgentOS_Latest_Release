#!/bin/bash

echo "🚀 AgentRepo MCP Integration Demo Setup"
echo "======================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3 and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed."
    echo "Please install pip3 and try again."
    exit 1
fi

echo "✅ Python 3 found"

# Install MCP package
echo "📦 Installing MCP package..."
pip3 install mcp uvicorn

if [ $? -eq 0 ]; then
    echo "✅ MCP package installed successfully"
else
    echo "❌ Failed to install MCP package"
    echo "Try: pip3 install --user mcp uvicorn"
    exit 1
fi

# Start the demo MCP server
echo ""
echo "🎯 Starting Demo MCP Server..."
echo "This server provides 8 demo tools for testing"
echo ""

python3 demo-mcp-server.py