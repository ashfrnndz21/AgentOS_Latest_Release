#!/bin/bash

echo "Testing Strands SDK Operations Log Display"
echo "=========================================="

# Test agent creation
echo "1. Creating test agent..."
AGENT_RESPONSE=$(curl -s -X POST http://localhost:5006/api/strands-sdk/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Calculator Agent",
    "description": "Agent with calculator tool for testing operations log",
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

# Test agent execution with calculator
echo ""
echo "2. Testing calculator execution..."
EXECUTION_RESPONSE=$(curl -s -X POST http://localhost:5006/api/strands-sdk/agents/$AGENT_ID/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": "What is 25 * 4 + 10?"
  }')

echo "Execution Response:"
echo $EXECUTION_RESPONSE | python3 -m json.tool

echo ""
echo "3. Checking operations log..."
OPERATIONS_LOG=$(echo $EXECUTION_RESPONSE | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'operations_log' in data:
    print('Operations log found with', len(data['operations_log']), 'steps:')
    for i, op in enumerate(data['operations_log'], 1):
        print(f'  Step {i}: {op.get(\"step\", \"Unknown\")}')
        if 'details' in op:
            print(f'    Details: {op[\"details\"]}')
else:
    print('No operations_log found in response')
")

echo "$OPERATIONS_LOG"

echo ""
echo "Test completed!"