#!/bin/bash

echo "Testing Real-Time Strands SDK Operations Streaming"
echo "================================================="

# Test agent creation
echo "1. Creating test agent..."
AGENT_RESPONSE=$(curl -s -X POST http://localhost:5006/api/strands-sdk/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Streaming Calculator Agent",
    "description": "Agent with calculator tool for testing real-time operations",
    "model_id": "llama3.2:latest",
    "host": "http://localhost:11434",
    "system_prompt": "You are a helpful calculator assistant. Use the calculator tool for mathematical operations.",
    "tools": ["calculator"]
  }')

AGENT_ID=$(echo $AGENT_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Agent created with ID: $AGENT_ID"

if [ -z "$AGENT_ID" ]; then
    echo "Failed to create agent"
    exit 1
fi

# Test streaming execution
echo ""
echo "2. Testing streaming execution..."
echo "Streaming real-time progress updates:"
echo "------------------------------------"

curl -s -X POST http://localhost:5006/api/strands-sdk/agents/$AGENT_ID/execute-stream \
  -H "Content-Type: application/json" \
  -d '{
    "input": "What is 15 * 8 + 25?"
  }' | while IFS= read -r line; do
    if [[ $line == data:* ]]; then
        # Extract JSON from SSE data line
        json_data="${line#data: }"
        echo "$(date '+%H:%M:%S') - $json_data"
        
        # Pretty print if it's the final result
        if echo "$json_data" | grep -q '"type":"final_result"'; then
            echo ""
            echo "Final Result:"
            echo "$json_data" | python3 -m json.tool
        fi
    fi
done

echo ""
echo "Streaming test completed!"