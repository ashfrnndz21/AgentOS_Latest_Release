#!/bin/bash

echo "🔍 Testing Web Search Fix"
echo "========================="

# Create agent with web search tool
echo "1. Creating agent with web search tool..."
AGENT_RESPONSE=$(curl -s -X POST http://localhost:5006/api/strands-sdk/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Search Agent",
    "description": "Agent with web search capability for testing",
    "model_id": "llama3.2:latest",
    "host": "http://localhost:11434",
    "system_prompt": "You are a helpful assistant that can search the web for information. Use the web search tool when users ask for current information or facts.",
    "tools": ["web_search"]
  }')

AGENT_ID=$(echo $AGENT_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Agent created with ID: $AGENT_ID"

if [ -z "$AGENT_ID" ]; then
    echo "Failed to create agent"
    exit 1
fi

# Test web search with streaming
echo ""
echo "2. Testing web search with streaming..."
echo "Query: 'What is the latest news about artificial intelligence?'"
echo ""

curl -s -X POST http://localhost:5006/api/strands-sdk/agents/$AGENT_ID/execute-stream \
  -H "Content-Type: application/json" \
  -d '{
    "input": "What is the latest news about artificial intelligence?"
  }' | while IFS= read -r line; do
    if [[ $line == data:* ]]; then
        json_data="${line#data: }"
        
        # Parse and display step information
        step=$(echo "$json_data" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'step' in data:
        print(f\"[{data.get('status', 'unknown').upper()}] {data['step']}\")
        if 'details' in data and data['details']:
            print(f\"    Details: {data['details']}\")
    elif data.get('type') == 'final_result':
        print(f\"\\n=== FINAL RESULT ===\")
        print(f\"Response: {data.get('response', 'No response')[:200]}...\")
        print(f\"Tools Used: {data.get('tools_used', [])}\")
        print(f\"Execution Time: {data.get('execution_time', 0):.2f}s\")
except:
    pass
" 2>/dev/null)
        
        if [ ! -z "$step" ]; then
            echo "$step"
        fi
    fi
done

echo ""
echo "Test completed!"