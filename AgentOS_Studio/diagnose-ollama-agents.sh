#!/bin/bash

echo "🔍 Diagnosing Ollama Agents Issue..."
echo "=================================="

# Test 1: Check if backend is running
echo "✅ Test 1: Backend connectivity"
if curl -s http://localhost:5002/health > /dev/null; then
    echo "   ✓ Backend is running on port 5002"
    curl -s http://localhost:5002/health | jq '.' 2>/dev/null || echo "   (Health response not JSON formatted)"
else
    echo "   ✗ Backend not accessible on port 5002"
    echo "   💡 Try running: python backend/ollama_api.py"
fi

echo ""

# Test 2: Check Ollama agents API endpoint
echo "✅ Test 2: Ollama agents API"
if curl -s http://localhost:5002/api/agents/ollama > /dev/null; then
    echo "   ✓ Ollama agents API is accessible"
    AGENT_COUNT=$(curl -s http://localhost:5002/api/agents/ollama | jq '.agents | length' 2>/dev/null || echo "0")
    echo "   📊 Agent count: $AGENT_COUNT"
else
    echo "   ✗ Ollama agents API not accessible"
fi

echo ""

# Test 3: Check if Ollama is running
echo "✅ Test 3: Ollama service"
if command -v ollama &> /dev/null; then
    echo "   ✓ Ollama CLI is installed"
    if ollama list > /dev/null 2>&1; then
        echo "   ✓ Ollama service is running"
        echo "   📋 Available models:"
        ollama list | head -5
    else
        echo "   ✗ Ollama service not running"
        echo "   💡 Try running: ollama serve"
    fi
else
    echo "   ✗ Ollama CLI not found"
    echo "   💡 Install Ollama from: https://ollama.ai"
fi

echo ""

# Test 4: Check frontend build
echo "✅ Test 4: Frontend status"
if [ -d "dist" ]; then
    echo "   ✓ Frontend build exists"
else
    echo "   ✗ Frontend not built"
    echo "   💡 Try running: npm run build"
fi

echo ""

# Test 5: Check for sample agents script
echo "✅ Test 5: Sample agents"
if [ -f "create-sample-agents.sh" ]; then
    echo "   ✓ Sample agents script exists"
    echo "   💡 Run: ./create-sample-agents.sh (requires backend running)"
else
    echo "   ✗ Sample agents script not found"
fi

echo ""
echo "🎯 Most likely causes of 'No Agents Created':"
echo "   1. Fresh installation - no agents created yet (NORMAL)"
echo "   2. Backend not running - start with: python backend/ollama_api.py"
echo "   3. Ollama not running - start with: ollama serve"
echo ""
echo "💡 Solutions:"
echo "   • Click 'Create Agent' button in the UI to create your first agent"
echo "   • Run ./create-sample-agents.sh to create test agents"
echo "   • Check browser console for any JavaScript errors"