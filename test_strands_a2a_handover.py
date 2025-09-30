#!/usr/bin/env python3
"""
Strands A2A Handover Test
Tests the complete A2A handover orchestration pattern:
Orchestrator → Agent 1 → A2A Handover → Agent 2 → Orchestrator Synthesis
"""

import requests
import json
import time
import uuid
from datetime import datetime

# API endpoints
ENHANCED_ORCHESTRATION_URL = "http://localhost:5014"
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"

def test_strands_a2a_handover():
    """Test complete Strands A2A handover orchestration"""
    print("🚀 Starting Strands A2A Handover Test")
    print("=" * 60)
    print("Testing: Orchestrator → Agent 1 → A2A Handover → Agent 2 → Synthesis")
    print("=" * 60)
    
    # Test 1: Create agents with A2A capabilities
    print("\n📝 Step 1: Creating Agents with A2A Capabilities")
    print("-" * 50)
    
    agents = []
    
    # Agent 1: Financial Calculator
    agent1_data = {
        "name": "Financial Calculator Agent",
        "description": "Specializes in financial calculations and analysis",
        "model_id": "qwen3:1.7b",
        "system_prompt": "You are a financial calculator agent. Perform complex financial calculations and provide detailed analysis. Use the think tool for deep analysis.",
        "tools": ["think", "a2a_send_message", "agent_handoff"]
    }
    
    response1 = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", json=agent1_data)
    if response1.status_code == 200:
        agent1 = response1.json()
        agents.append(agent1)
        print(f"✅ Created Agent 1: {agent1['id']} - {agent1_data['name']}")
    else:
        print(f"❌ Failed to create Agent 1: {response1.text}")
        return
    
    # Agent 2: Report Writer
    agent2_data = {
        "name": "Report Writer Agent", 
        "description": "Specializes in writing comprehensive reports and documentation",
        "model_id": "qwen3:1.7b",
        "system_prompt": "You are a report writer agent. Create detailed, professional reports based on data provided. Use the think tool for analysis and a2a_send_message for coordination.",
        "tools": ["think", "a2a_send_message", "agent_handoff"]
    }
    
    response2 = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", json=agent2_data)
    if response2.status_code == 200:
        agent2 = response2.json()
        agents.append(agent2)
        print(f"✅ Created Agent 2: {agent2['id']} - {agent2_data['name']}")
    else:
        print(f"❌ Failed to create Agent 2: {response2.text}")
        return
    
    # Test 2: Verify A2A registration
    print("\n🔗 Step 2: Verifying A2A Registration")
    print("-" * 50)
    
    a2a_response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents")
    if a2a_response.status_code == 200:
        a2a_agents = a2a_response.json().get("agents", [])
        print(f"✅ A2A Service has {len(a2a_agents)} registered agents")
        for agent in a2a_agents:
            print(f"   - {agent.get('name', 'Unknown')} (ID: {agent.get('id', 'Unknown')})")
    else:
        print(f"❌ Failed to get A2A agents: {a2a_response.text}")
        return
    
    # Test 3: Test individual agent execution (with memory management)
    print("\n🤖 Step 3: Testing Individual Agent Execution")
    print("-" * 50)
    
    for i, agent in enumerate(agents, 1):
        print(f"\nTesting Agent {i}: {agent.get('name', 'Unknown')}")
        
        # Execute agent with simple query
        execution_data = {
            "input": f"Hello, I'm testing agent {i}. Please introduce yourself and explain your capabilities.",
            "stream": False
        }
        
        exec_response = requests.post(
            f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent.get('id', 'unknown')}/execute",
            json=execution_data,
            timeout=60
        )
        
        if exec_response.status_code == 200:
            result = exec_response.json()
            print(f"✅ Agent {i} executed successfully")
            print(f"   Response: {result.get('response', 'No response')[:100]}...")
            print(f"   Execution time: {result.get('execution_time', 0):.2f}s")
            
            # Memory management - release model
            print(f"🧹 Memory management: Releasing Agent {i} model")
            import gc
            gc.collect()
        else:
            print(f"❌ Agent {i} execution failed: {exec_response.text}")
            return
    
    # Test 4: Test A2A handover orchestration
    print("\n🔄 Step 4: Testing A2A Handover Orchestration")
    print("-" * 50)
    
    # Complex query that requires both agents
    complex_query = """
    I need help with a complex financial analysis project:
    
    1. Calculate the compound interest for a $10,000 investment at 5% annual rate for 10 years
    2. Write a comprehensive report explaining the calculation, including:
       - The formula used
       - Step-by-step calculation
       - Final result
       - Investment recommendations
    
    Please coordinate between the financial calculator and report writer agents to complete this task.
    """
    
    print(f"📝 Complex Query: {complex_query[:100]}...")
    print("\n🚀 Starting Strands A2A Orchestration...")
    
    orchestration_data = {
        "query": complex_query,
        "session_id": f"test_a2a_handover_{int(time.time())}"
    }
    
    start_time = time.time()
    orchestration_response = requests.post(
        f"{ENHANCED_ORCHESTRATION_URL}/api/enhanced-orchestration/query",
        json=orchestration_data,
        timeout=180  # 3 minutes for complex orchestration
    )
    end_time = time.time()
    
    if orchestration_response.status_code == 200:
        result = orchestration_response.json()
        print(f"✅ Orchestration completed in {end_time - start_time:.2f} seconds")
        
        # Analyze the result
        print("\n📊 Orchestration Analysis:")
        print(f"   Success: {result.get('success', False)}")
        print(f"   Strategy: {result.get('orchestration_summary', {}).get('execution_strategy', 'unknown')}")
        print(f"   Agents Coordinated: {result.get('orchestration_summary', {}).get('agents_coordinated', 0)}")
        print(f"   Orchestration Type: {result.get('orchestration_type', 'unknown')}")
        
        # Check if A2A handover was used
        if result.get('orchestration_type') == 'strands_a2a_handover':
            print("✅ A2A Handover was used!")
        else:
            print("❌ A2A Handover was NOT used - falling back to single agent")
        
        # Show final response
        print(f"\n📝 Final Response:")
        print(f"   {result.get('final_response', 'No response')[:200]}...")
        
        # Check for handover results
        if 'handover_results' in result:
            handover = result['handover_results']
            print(f"\n🔄 Handover Results:")
            print(f"   Success: {handover.get('success', False)}")
            print(f"   Total Agents: {handover.get('total_agents', 0)}")
            print(f"   Successful Steps: {handover.get('successful_steps', 0)}")
            
            if 'handover_steps' in handover:
                for step in handover['handover_steps']:
                    print(f"   Step {step.get('step', '?')}: {step.get('agent_name', 'Unknown')} - {'✅' if 'error' not in step else '❌'}")
        
    else:
        print(f"❌ Orchestration failed: {orchestration_response.text}")
        return
    
    # Test 5: Memory management verification
    print("\n🧹 Step 5: Memory Management Verification")
    print("-" * 50)
    
    # Check memory usage
    try:
        import psutil
        memory_usage = psutil.virtual_memory().percent
        print(f"✅ Current memory usage: {memory_usage:.1f}%")
        
        if memory_usage > 80:
            print("⚠️  High memory usage detected - memory management may need improvement")
        else:
            print("✅ Memory usage is within acceptable limits")
    except ImportError:
        print("⚠️  psutil not available - cannot check memory usage")
    
    # Test 6: Cleanup
    print("\n🧹 Step 6: Cleanup")
    print("-" * 50)
    
    for agent in agents:
        delete_response = requests.delete(f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent.get('id', 'unknown')}")
        if delete_response.status_code == 200:
            print(f"✅ Deleted agent: {agent.get('name', 'Unknown')}")
        else:
            print(f"❌ Failed to delete agent: {agent.get('name', 'Unknown')}")
    
    print("\n🎉 Strands A2A Handover Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    test_strands_a2a_handover()
