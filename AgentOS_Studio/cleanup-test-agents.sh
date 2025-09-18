#!/bin/bash

echo "🧹 Cleaning up test agents from Ollama database..."

# Get all agents
echo "📋 Fetching all agents..."
curl -s http://localhost:5002/api/agents/ollama | python3 -c "
import json
import sys
import requests

data = json.load(sys.stdin)
agents = data.get('agents', [])

print(f'Found {len(agents)} agents total')

# Filter test agents
test_agents = []
real_agents = []

for agent in agents:
    name = agent.get('name', '').lower()
    description = agent.get('description', '').lower()
    
    # Identify test agents
    if any(keyword in name or keyword in description for keyword in [
        'test', 'white screen', 'debug', 'refresh', 'final test', 'fixed hook'
    ]):
        test_agents.append(agent)
    else:
        real_agents.append(agent)

print(f'Found {len(test_agents)} test agents to delete')
print(f'Found {len(real_agents)} real agents to keep')

# Delete test agents
deleted_count = 0
for agent in test_agents:
    agent_id = agent.get('id')
    name = agent.get('name')
    
    try:
        response = requests.delete(f'http://localhost:5002/api/agents/ollama/{agent_id}')
        if response.status_code == 200:
            print(f'✅ Deleted: {name}')
            deleted_count += 1
        else:
            print(f'❌ Failed to delete: {name} (Status: {response.status_code})')
    except Exception as e:
        print(f'❌ Error deleting {name}: {str(e)}')

print(f'\\n🎉 Cleanup complete! Deleted {deleted_count} test agents')
print(f'📊 Remaining agents: {len(real_agents)}')

if real_agents:
    print('\\n📋 Remaining agents:')
    for agent in real_agents:
        print(f'  - {agent.get(\"name\", \"Unknown\")} ({agent.get(\"role\", \"Unknown role\")})')
"

echo "✨ Test agent cleanup completed!"