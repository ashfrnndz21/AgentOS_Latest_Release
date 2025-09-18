#!/bin/bash

echo "🚀 Installing Real RAG Dependencies for Document Workspace"
echo "========================================================"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed"
    exit 1
fi

echo "📦 Installing RAG dependencies..."
pip3 install -r backend/requirements-rag.txt

if [ $? -eq 0 ]; then
    echo "✅ RAG dependencies installed successfully!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Make sure Ollama is running: ollama serve"
    echo "2. Pull a model: ollama pull mistral"
    echo "3. Start the backend: python3 backend/simple_api.py"
    echo "4. Use the Real Document Workspace in the app"
    echo ""
    echo "📚 Available models for RAG:"
    echo "- mistral (recommended)"
    echo "- llama3.2"
    echo "- codellama"
else
    echo "❌ Failed to install RAG dependencies"
    echo "Try installing manually:"
    echo "pip3 install langchain langchain-community chromadb fastembed pypdf"
    exit 1
fi