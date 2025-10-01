#!/usr/bin/env python3
"""
Detailed A2A Test Script
Shows all LLM outputs, agent responses, and A2A handoffs in detail
"""

import requests
import json
import time
from datetime import datetime

# Configuration
A2A_SERVICE_URL = "http://localhost:5008"
STRANDS_SDK_URL = "http://localhost:5006"
ORCHESTRATION_URL = "http://localhost:5014"

def print_section(title, content="", char="="):
    """Print a formatted section"""
    print(f"\n{char * 60}")
    print(f" {title}")
    print(f"{char * 60}")
    if content:
        print(content)

def test_detailed_orchestration():
    """Test orchestration with detailed output"""
    print_section("🧪 DETAILED A2A ORCHESTRATION TEST")
    
    # Test query
    test_query = "I want to learn how to write a poem about Python programming and then create Python code to generate that poem"
    
    print(f"📝 Test Query: {test_query}")
    
    # Prepare orchestration data
    orchestration_data = {
        "query": test_query,
        "contextual_analysis": {
            "success": True,
            "user_intent": "Learn creative writing and programming integration",
            "domain_analysis": {
                "primary_domain": "Creative Programming",
                "technical_level": "intermediate"
            },
            "orchestration_pattern": "sequential"
        }
    }
    
    print_section("🚀 Sending Orchestration Request")
    print(f"Request URL: {ORCHESTRATION_URL}/api/enhanced-orchestration/query")
    print(f"Request Data: {json.dumps(orchestration_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{ORCHESTRATION_URL}/api/enhanced-orchestration/query",
            json=orchestration_data,
            timeout=60
        )
        
        print_section("📊 Orchestration Response")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Show orchestration summary
            print_section("📋 Orchestration Summary")
            print(f"Success: {result.get('success', False)}")
            print(f"Session ID: {result.get('session_id', 'N/A')}")
            
            # Show orchestration details
            if 'orchestration_summary' in result:
                summary = result['orchestration_summary']
                print(f"Strategy: {summary.get('execution_strategy', 'Unknown')}")
                print(f"Stages Completed: {summary.get('stages_completed', 0)}/5")
                print(f"Total Execution Time: {summary.get('total_execution_time', 0):.2f}s")
            
            # Show detailed stage outputs
            if 'stage_outputs' in result:
                print_section("🔍 DETAILED STAGE OUTPUTS")
                stages = result['stage_outputs']
                
                for stage_name, stage_data in stages.items():
                    print_section(f"Stage: {stage_name}", char="-")
                    if isinstance(stage_data, dict):
                        for key, value in stage_data.items():
                            print(f"{key}: {value}")
                    else:
                        print(stage_data)
            
            # Show execution details
            if 'execution_details' in result:
                print_section("⚙️ EXECUTION DETAILS")
                exec_details = result['execution_details']
                print(f"Execution Success: {exec_details.get('success', False)}")
                print(f"Execution Time: {exec_details.get('execution_time', 0):.2f}s")
                print(f"Execution Type: {exec_details.get('execution_type', 'Unknown')}")
                
                if 'handover_steps' in exec_details:
                    print_section("🤝 A2A HANDOVER STEPS")
                    for i, step in enumerate(exec_details['handover_steps']):
                        print(f"\n--- Step {i+1} ---")
                        print(f"Agent: {step.get('agent_name', 'Unknown')}")
                        print(f"Agent ID: {step.get('agent_id', 'Unknown')}")
                        print(f"A2A Agent ID: {step.get('a2a_agent_id', 'N/A')}")
                        print(f"Status: {step.get('a2a_status', 'Unknown')}")
                        print(f"Execution Time: {step.get('execution_time', 0):.2f}s")
                        
                        if 'result' in step:
                            print(f"Result: {step['result'][:200]}...")
                        if 'error' in step:
                            print(f"Error: {step['error']}")
            
            # Show final response
            if 'final_response' in result:
                print_section("🎯 FINAL RESPONSE")
                print(result['final_response'])
            
            # Show A2A metadata
            if 'a2a_metadata' in result:
                print_section("🔗 A2A METADATA")
                metadata = result['a2a_metadata']
                for key, value in metadata.items():
                    print(f"{key}: {value}")
            
        else:
            print(f"❌ Orchestration failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error during orchestration: {e}")

def test_individual_agents():
    """Test individual agent execution"""
    print_section("🤖 TESTING INDIVIDUAL AGENTS")
    
    # Get available agents
    try:
        response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=10)
        if response.status_code == 200:
            agents = response.json().get('agents', [])
            print(f"Found {len(agents)} agents:")
            
            for agent in agents:
                print(f"\n--- Agent: {agent['name']} ---")
                print(f"ID: {agent['id']}")
                print(f"Description: {agent.get('description', 'N/A')}")
                print(f"Tools: {agent.get('tools', [])}")
                print(f"Model: {agent.get('model_id', 'N/A')}")
                
                # Test agent execution
                print(f"\n🧪 Testing execution...")
                test_input = "Write a short poem about Python programming"
                
                exec_response = requests.post(
                    f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent['id']}/execute",
                    json={
                        "input": test_input,
                        "stream": False
                    },
                    timeout=30
                )
                
                if exec_response.status_code == 200:
                    exec_result = exec_response.json()
                    print(f"✅ Execution successful")
                    print(f"Response: {exec_result.get('response', 'No response')[:200]}...")
                    print(f"Execution Time: {exec_result.get('execution_time', 0):.2f}s")
                else:
                    print(f"❌ Execution failed: {exec_response.status_code} - {exec_response.text}")
                    
        else:
            print(f"❌ Failed to get agents: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing agents: {e}")

def test_a2a_communication():
    """Test A2A communication in detail"""
    print_section("📨 TESTING A2A COMMUNICATION")
    
    # Register test agents
    agent1_data = {
        "id": "test_creative_001",
        "name": "Creative Poetry Agent",
        "description": "Specialized in creative writing and poetry",
        "model": "qwen3:1.7b",
        "capabilities": ["creative_writing", "poetry", "storytelling"],
        "strands_agent_id": "test_creative_001",
        "strands_data": {
            "tools": ["creative_writing", "poetry"],
            "system_prompt": "You are a creative writing assistant specializing in poetry."
        }
    }
    
    agent2_data = {
        "id": "test_technical_001",
        "name": "Python Code Agent",
        "description": "Specialized in Python programming and code generation",
        "model": "qwen3:1.7b",
        "capabilities": ["python_programming", "code_generation", "technical_writing"],
        "strands_agent_id": "test_technical_001",
        "strands_data": {
            "tools": ["python_programming", "code_generation"],
            "system_prompt": "You are a Python programming expert."
        }
    }
    
    # Register agents
    print("📝 Registering agents...")
    
    try:
        # Register agent 1
        response1 = requests.post(f"{A2A_SERVICE_URL}/api/a2a/agents", json=agent1_data, timeout=10)
        if response1.status_code == 201:
            agent1_id = response1.json()['agent']['id']
            print(f"✅ Agent 1 registered: {agent1_id}")
        else:
            print(f"❌ Agent 1 registration failed: {response1.text}")
            return
        
        # Register agent 2
        response2 = requests.post(f"{A2A_SERVICE_URL}/api/a2a/agents", json=agent2_data, timeout=10)
        if response2.status_code == 201:
            agent2_id = response2.json()['agent']['id']
            print(f"✅ Agent 2 registered: {agent2_id}")
        else:
            print(f"❌ Agent 2 registration failed: {response2.text}")
            return
        
        # Create A2A connection
        print("\n🔗 Creating A2A connection...")
        conn_response = requests.post(
            f"{A2A_SERVICE_URL}/api/a2a/connections",
            json={
                "from_agent_id": agent1_id,
                "to_agent_id": agent2_id
            },
            timeout=10
        )
        
        if conn_response.status_code == 201:
            print(f"✅ A2A connection created")
        else:
            print(f"⚠️ A2A connection failed: {conn_response.text}")
        
        # Test A2A message
        print("\n📨 Testing A2A message...")
        message_data = {
            "from_agent_id": agent1_id,
            "to_agent_id": agent2_id,
            "content": "I wrote a poem about Python. Can you help me create Python code to generate this poem?",
            "type": "collaboration_request"
        }
        
        msg_response = requests.post(
            f"{A2A_SERVICE_URL}/api/a2a/messages",
            json=message_data,
            timeout=60
        )
        
        if msg_response.status_code == 201:
            result = msg_response.json()
            print(f"✅ A2A message sent successfully")
            print(f"Message ID: {result.get('message_id', 'N/A')}")
            print(f"Response: {result.get('message', {}).get('response', 'No response')}")
            print(f"Execution Time: {result.get('message', {}).get('execution_time', 0):.2f}s")
        else:
            print(f"❌ A2A message failed: {msg_response.text}")
        
        # Get message history
        print("\n📚 A2A Message History...")
        history_response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/messages/history", timeout=10)
        if history_response.status_code == 200:
            history = history_response.json()
            print(f"Total messages: {len(history.get('messages', []))}")
            for msg in history.get('messages', [])[-3:]:  # Last 3 messages
                print(f"\n--- Message {msg['id']} ---")
                print(f"From: {msg['from_agent_id']} -> To: {msg['to_agent_id']}")
                print(f"Content: {msg['content'][:100]}...")
                print(f"Response: {msg.get('response', 'No response')[:100]}...")
                print(f"Status: {msg['status']}")
                print(f"Time: {msg['timestamp']}")
        
    except Exception as e:
        print(f"❌ Error in A2A communication test: {e}")

def main():
    """Main test function"""
    print("🔍 DETAILED A2A MULTI-AGENT ORCHESTRATION ANALYSIS")
    print("=" * 60)
    
    # Test 1: Individual Agents
    test_individual_agents()
    
    # Test 2: A2A Communication
    test_a2a_communication()
    
    # Test 3: Full Orchestration
    test_detailed_orchestration()
    
    print_section("✅ TEST COMPLETE", "All detailed outputs have been displayed above.")

if __name__ == "__main__":
    main()



