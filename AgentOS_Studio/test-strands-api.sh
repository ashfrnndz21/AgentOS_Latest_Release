#!/bin/bash

# Test script for Strands API endpoints
# Run this after starting the backend services

echo "🧠 Testing Strands API Endpoints..."
echo "=================================="

BASE_URL="http://localhost:5002"

echo "1. Testing Strands Agents endpoint..."
curl -s "$BASE_URL/api/strands/agents" | jq '.' || echo "❌ Failed to get Strands agents"

echo -e "\n2. Testing Strands Tools endpoint..."
curl -s "$BASE_URL/api/strands/tools" | jq '.' || echo "❌ Failed to get Strands tools"

echo -e "\n3. Testing Calculator tool..."
curl -s -X POST "$BASE_URL/api/strands/tools/calculator/execute" \
  -H "Content-Type: application/json" \
  -d '{"params": {"expression": "2 + 2"}}' | jq '.' || echo "❌ Failed to execute calculator"

echo -e "\n4. Testing Current Time tool..."
curl -s -X POST "$BASE_URL/api/strands/tools/current_time/execute" \
  -H "Content-Type: application/json" \
  -d '{"params": {"format": "iso"}}' | jq '.' || echo "❌ Failed to execute current_time"

echo -e "\n5. Testing Letter Counter tool..."
curl -s -X POST "$BASE_URL/api/strands/tools/letter_counter/execute" \
  -H "Content-Type: application/json" \
  -d '{"params": {"word": "hello", "letter": "l"}}' | jq '.' || echo "❌ Failed to execute letter_counter"

echo -e "\n6. Creating test workflow..."
curl -s -X POST "$BASE_URL/api/strands/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Strands Workflow",
    "description": "Simple test workflow",
    "tasks": [
      {
        "taskId": "task1",
        "description": "Test task",
        "agentId": "test-agent"
      }
    ],
    "agents": []
  }' | jq '.' || echo "❌ Failed to create workflow"

echo -e "\n✅ Strands API testing complete!"
echo "If you see JSON responses above, the Strands backend is working correctly."
echo "If you see errors, make sure the backend is running with: ./manage-app.sh start"