#!/bin/bash

echo "🚀 Starting Document Chat with Ollama"
echo "===================================="

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama is not running. Starting Ollama..."
    echo "Please run in another terminal: ollama serve"
    echo ""
    echo "Then pull a model if you haven't already:"
    echo "ollama pull mistral"
    echo "ollama pull llama3.2"
    echo ""
    read -p "Press Enter when Ollama is running..."
fi

# Check if models are available
echo "📋 Checking available models..."
ollama list

echo ""
echo "✅ Ready! Navigate to 'Document Chat' in the app sidebar"
echo ""
echo "🎯 Features:"
echo "- Upload documents (PDF, TXT, MD)"
echo "- Select Ollama models dynamically"
echo "- Chat with your documents"
echo "- Real-time conversation"
echo ""
echo "📱 Access the app at: http://localhost:5173"