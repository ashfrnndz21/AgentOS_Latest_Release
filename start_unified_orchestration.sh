#!/bin/bash

echo "🚀 Starting Unified Orchestration System"
echo "========================================"

# Check if required services are running
echo "🔍 Checking required services..."

# Check Ollama
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running"
else
    echo "❌ Ollama is not running. Please start Ollama first."
    exit 1
fi

# Check Strands SDK
if curl -s http://localhost:5006/health > /dev/null; then
    echo "✅ Strands SDK is running"
else
    echo "⚠️  Strands SDK not running. Starting it..."
    cd backend && python strands_sdk_api.py &
    sleep 5
fi

# Check A2A Service
if curl -s http://localhost:5008/api/a2a/health > /dev/null; then
    echo "✅ A2A Service is running"
else
    echo "⚠️  A2A Service not running. Starting it..."
    cd backend && python a2a_service.py &
    sleep 5
fi

# Check Text Cleaning Service
if curl -s http://localhost:5019/health > /dev/null; then
    echo "✅ Text Cleaning Service is running"
else
    echo "⚠️  Text Cleaning Service not running. Starting it..."
    cd backend && python text_cleaning_service_enhanced.py &
    sleep 3
fi

echo ""
echo "🎯 Starting Unified Orchestration API..."
echo "📍 Port: 5020"
echo "🔧 Features: 6-Stage LLM Analysis + Dynamic Agent Discovery + A2A Communication + Text Cleaning"
echo ""

# Start the unified orchestration API
cd backend && python unified_orchestration_api.py
