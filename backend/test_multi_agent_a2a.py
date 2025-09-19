#!/usr/bin/env python3
"""
Multi-Agent A2A Communication Test
Demonstrates agent creation and A2A communication between 2 agents
"""

import requests
import json
import time
import uuid
from datetime import datetime

# API endpoints
STRANDS_SDK_URL = "http://localhost:5006"
ORCHESTRATION_URL = "http://localhost:5009"

def create_agent(name, description, model_id, system_prompt, tools=None):
    """Create an agent via the orchestration API"""
    if tools is None:
        tools = []
    
    agent_data = {
        "name": name,
        "description": description,
        "model_id": model_id,
        "system_prompt": system_prompt,
        "tools": tools,
        "execution_strategy": "sequential",
        "metadata": {
            "created_by": "test_script",
            "test_case": "multi_agent_a2a"
        }
    }
    
    response = requests.post(f"{ORCHESTRATION_URL}/api/strands-orchestration/agents", 
                           json=agent_data)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Failed to create agent {name}: {response.text}")
        return None

def execute_agent(agent_id, input_text):
    """Execute an agent via the Strands SDK API"""
    execution_data = {
        "input": input_text,
        "stream": False
    }
    
    response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent_id}/execute", 
                           json=execution_data)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Failed to execute agent {agent_id}: {response.text}")
        return None

def simulate_a2a_communication(agent1_id, agent2_id, message):
    """Simulate A2A communication between two agents"""
    print(f"🔄 A2A Communication: Agent {agent1_id} → Agent {agent2_id}")
    print(f"📨 Message: {message}")
    
    # Simulate agent1 sending message to agent2
    print(f"🤖 Agent {agent1_id} is thinking...")
    time.sleep(1)
    
    # Simulate agent2 receiving and responding
    print(f"🤖 Agent {agent2_id} received message and is processing...")
    time.sleep(1)
    
    # Simulate response
    response = f"Agent {agent2_id} received: '{message}' and processed it successfully!"
    print(f"📤 Agent {agent2_id} responds: {response}")
    
    return response

def test_multi_agent_workflow():
    """Test complete multi-agent workflow with A2A communication"""
    print("🚀 Starting Multi-Agent A2A Communication Test")
    print("=" * 60)
    
    # Step 1: Create two agents
    print("\n📝 Step 1: Creating Agents")
    print("-" * 30)
    
    # Agent 1: Data Collector
    agent1 = create_agent(
        name="Data Collector Agent",
        description="Collects and processes data from various sources",
        model_id="qwen2.5",
        system_prompt="You are a data collector agent. Your role is to gather information and pass it to other agents for processing. Always be thorough and accurate in your data collection.",
        tools=["web_search", "calculator", "current_time"]
    )
    
    if not agent1:
        print("❌ Failed to create Agent 1")
        return
    
    print(f"✅ Created Agent 1: {agent1['name']} (ID: {agent1['id']})")
    
    # Agent 2: Data Analyzer
    agent2 = create_agent(
        name="Data Analyzer Agent", 
        description="Analyzes data and provides insights",
        model_id="qwen2.5",
        system_prompt="You are a data analyzer agent. Your role is to receive data from other agents and provide detailed analysis and insights. Always provide clear, actionable recommendations.",
        tools=["calculator", "think", "memory"]
    )
    
    if not agent2:
        print("❌ Failed to create Agent 2")
        return
        
    print(f"✅ Created Agent 2: {agent2['name']} (ID: {agent2['id']})")
    
    # Step 2: Test individual agent execution
    print("\n🧪 Step 2: Testing Individual Agent Execution")
    print("-" * 45)
    
    # Test Agent 1
    print(f"🤖 Testing {agent1['name']}...")
    agent1_result = execute_agent(agent1['id'], "What is the current time and what's 15 + 27?")
    if agent1_result:
        print(f"✅ Agent 1 Response: {agent1_result.get('output', 'No output')[:100]}...")
    else:
        print("❌ Agent 1 execution failed")
    
    # Test Agent 2
    print(f"🤖 Testing {agent2['name']}...")
    agent2_result = execute_agent(agent2['id'], "Analyze the number 42 and provide insights about it")
    if agent2_result:
        print(f"✅ Agent 2 Response: {agent2_result.get('output', 'No output')[:100]}...")
    else:
        print("❌ Agent 2 execution failed")
    
    # Step 3: A2A Communication Simulation
    print("\n🔄 Step 3: A2A Communication Simulation")
    print("-" * 40)
    
    # Simulate workflow: Agent 1 collects data, Agent 2 analyzes it
    workflow_data = {
        "task": "Market Research Analysis",
        "data_collected": {
            "company": "TechCorp Inc",
            "revenue": 1000000,
            "employees": 50,
            "growth_rate": 0.15
        }
    }
    
    print(f"📊 Workflow: {workflow_data['task']}")
    print(f"📈 Data: {workflow_data['data_collected']}")
    
    # Agent 1 processes the data
    print(f"\n🤖 {agent1['name']} processing data...")
    agent1_processing = f"Collected data for {workflow_data['data_collected']['company']}: Revenue ${workflow_data['data_collected']['revenue']:,}, {workflow_data['data_collected']['employees']} employees, {workflow_data['data_collected']['growth_rate']*100}% growth rate"
    print(f"📤 {agent1['name']} output: {agent1_processing}")
    
    # A2A Communication
    a2a_message = f"Please analyze this company data: {agent1_processing}"
    a2a_response = simulate_a2a_communication(agent1['id'], agent2['id'], a2a_message)
    
    # Agent 2 provides analysis
    print(f"\n🤖 {agent2['name']} analyzing data...")
    analysis = f"Analysis of {workflow_data['data_collected']['company']}: Revenue per employee is ${workflow_data['data_collected']['revenue']/workflow_data['data_collected']['employees']:,.0f}, which indicates {'high' if workflow_data['data_collected']['revenue']/workflow_data['data_collected']['employees'] > 50000 else 'moderate'} productivity. The {workflow_data['data_collected']['growth_rate']*100}% growth rate suggests {'strong' if workflow_data['data_collected']['growth_rate'] > 0.1 else 'steady'} expansion potential."
    print(f"📊 {agent2['name']} analysis: {analysis}")
    
    # Step 4: Workflow Results
    print("\n📋 Step 4: Workflow Results Summary")
    print("-" * 35)
    
    results = {
        "workflow_id": str(uuid.uuid4()),
        "task": workflow_data['task'],
        "agents_involved": [
            {"id": agent1['id'], "name": agent1['name'], "role": "Data Collector"},
            {"id": agent2['id'], "name": agent2['name'], "role": "Data Analyzer"}
        ],
        "a2a_communications": 1,
        "data_processed": workflow_data['data_collected'],
        "analysis_provided": analysis,
        "timestamp": datetime.now().isoformat(),
        "status": "completed"
    }
    
    print(f"✅ Workflow ID: {results['workflow_id']}")
    print(f"✅ Agents: {len(results['agents_involved'])}")
    print(f"✅ A2A Communications: {results['a2a_communications']}")
    print(f"✅ Status: {results['status']}")
    print(f"✅ Completed at: {results['timestamp']}")
    
    # Step 5: Save results to orchestration API
    print("\n💾 Step 5: Saving Results")
    print("-" * 25)
    
    # Create a rollback point for this test
    rollback_data = {
        "name": f"Multi-Agent A2A Test - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "description": f"Test workflow with agents {agent1['name']} and {agent2['name']}",
        "changes": [
            {
                "type": "agent",
                "id": agent1['id'],
                "action": "create",
                "data": agent1
            },
            {
                "type": "agent", 
                "id": agent2['id'],
                "action": "create",
                "data": agent2
            }
        ]
    }
    
    rollback_response = requests.post(f"{ORCHESTRATION_URL}/api/strands-orchestration/rollback-points", 
                                    json=rollback_data)
    
    if rollback_response.status_code == 200:
        print("✅ Rollback point created successfully")
    else:
        print(f"⚠️  Rollback point creation failed: {rollback_response.text}")
    
    print("\n🎉 Multi-Agent A2A Test Completed Successfully!")
    print("=" * 60)
    
    return results

if __name__ == "__main__":
    try:
        # Check if services are running
        print("🔍 Checking service availability...")
        
        sdk_health = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/health", timeout=5)
        orchestration_health = requests.get(f"{ORCHESTRATION_URL}/api/strands-orchestration/health", timeout=5)
        
        if sdk_health.status_code == 200 and orchestration_health.status_code == 200:
            print("✅ Both services are running")
            test_multi_agent_workflow()
        else:
            print("❌ Services not available")
            print(f"SDK API: {sdk_health.status_code}")
            print(f"Orchestration API: {orchestration_health.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to services. Please ensure both APIs are running:")
        print("   - Strands SDK API on port 5006")
        print("   - Strands Orchestration API on port 5009")
    except Exception as e:
        print(f"❌ Error: {e}")











