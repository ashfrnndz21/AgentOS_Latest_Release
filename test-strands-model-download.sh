#!/bin/bash

echo "🔄 Testing Strands SDK Model Download Feature"
echo "============================================="

# Check if Ollama is running
echo "📡 Checking Ollama service..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running"
else
    echo "❌ Ollama is not running. Please start Ollama first."
    exit 1
fi

# Check current models
echo ""
echo "📋 Current installed models:"
curl -s http://localhost:11434/api/tags | jq -r '.models[]?.name // "No models installed"'

echo ""
echo "🎯 Testing Model Download Feature:"
echo "1. Open the Strands SDK Agent Dialog"
echo "2. Select a model that's not installed (e.g., qwen2)"
echo "3. You should see a yellow warning box with download button"
echo "4. Click 'Download' to install the model"
echo "5. Progress bar should show download progress"
echo "6. Once complete, green checkmark should appear"

echo ""
echo "✨ Features Added:"
echo "- ✅ Real-time model availability checking"
echo "- ✅ Download button for missing models"
echo "- ✅ Progress bar with percentage"
echo "- ✅ Visual indicators (green checkmark for installed)"
echo "- ✅ Refresh button to check model status"
echo "- ✅ Prevents agent creation without required model"

echo ""
echo "🔧 Technical Implementation:"
echo "- Uses Ollama API /api/tags to check installed models"
echo "- Uses Ollama API /api/pull to download models"
echo "- Streams download progress in real-time"
echo "- Updates UI state based on model availability"

echo ""
echo "🚀 Ready to test! Open the Strands SDK dialog and try selecting 'qwen2' model."