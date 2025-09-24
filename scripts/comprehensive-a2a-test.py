#!/usr/bin/env python3
"""
Comprehensive A2A Test Script
Shows ALL LLM outputs, agent responses, and A2A handoffs in complete detail
"""

import requests
import json
import time
from datetime import datetime

# Configuration
A2A_SERVICE_URL = "http://localhost:5008"
STRANDS_SDK_URL = "http://localhost:5006"
ORCHESTRATION_URL = "http://localhost:5014"

def print_section(title, content="", char="=", width=80):
    """Print a formatted section"""
    print(f"\n{char * width}")
    print(f" {title}")
    print(f"{char * width}")
    if content:
        print(content)

def print_json(data, title="JSON Data"):
    """Pretty print JSON data"""
    print_section(title, char="-", width=60)
    print(json.dumps(data, indent=2, default=str))

def test_comprehensive_orchestration():
    """Test orchestration with complete detailed output"""
    print_section("🧪 COMPREHENSIVE A2A ORCHESTRATION TEST", width=100)
    
    # Test query
    test_query = "I want to learn how to write a poem about Python programming and then create Python code to generate that poem"
    
    print(f"📝 Test Query: {test_query}")
    print(f"⏰ Timestamp: {datetime.now().isoformat()}")
    
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
    
    print_section("🚀 ORCHESTRATION REQUEST", width=100)
    print(f"Request URL: {ORCHESTRATION_URL}/api/enhanced-orchestration/query")
    print_json(orchestration_data, "Request Payload")
    
    try:
        print_section("⏳ SENDING REQUEST...", width=100)
        start_time = time.time()
        
        response = requests.post(
            f"{ORCHESTRATION_URL}/api/enhanced-orchestration/query",
            json=orchestration_data,
            timeout=120
        )
        
        end_time = time.time()
        request_duration = end_time - start_time
        
        print_section("📊 ORCHESTRATION RESPONSE", width=100)
        print(f"Status Code: {response.status_code}")
        print(f"Request Duration: {request_duration:.2f}s")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Show complete response structure
            print_json(result, "COMPLETE ORCHESTRATION RESPONSE")
            
            # Show orchestration summary
            print_section("📋 ORCHESTRATION SUMMARY", width=100)
            print(f"Success: {result.get('success', False)}")
            print(f"Session ID: {result.get('session_id', 'N/A')}")
            print(f"Response Time: {request_duration:.2f}s")
            
            # Show orchestration details
            if 'orchestration_summary' in result:
                summary = result['orchestration_summary']
                print_section("📊 ORCHESTRATION SUMMARY DETAILS", width=100)
                print_json(summary, "Summary Data")
            
            # Show detailed stage outputs
            if 'stage_outputs' in result:
                print_section("🔍 DETAILED STAGE OUTPUTS", width=100)
                stages = result['stage_outputs']
                
                for stage_name, stage_data in stages.items():
                    print_section(f"STAGE: {stage_name.upper()}", width=100)
                    print_json(stage_data, f"{stage_name} Data")
            
            # Show execution details
            if 'execution_details' in result:
                print_section("⚙️ EXECUTION DETAILS", width=100)
                exec_details = result['execution_details']
                print_json(exec_details, "Execution Details")
                
                if 'handover_steps' in exec_details:
                    print_section("🤝 A2A HANDOVER STEPS DETAIL", width=100)
                    for i, step in enumerate(exec_details['handover_steps']):
                        print_section(f"STEP {i+1}: {step.get('agent_name', 'Unknown Agent')}", width=100)
                        print_json(step, f"Step {i+1} Details")
            
            # Show final response
            if 'final_response' in result:
                print_section("🎯 FINAL RESPONSE", width=100)
                print(result['final_response'])
            
            # Show A2A metadata
            if 'a2a_metadata' in result:
                print_section("🔗 A2A METADATA", width=100)
                print_json(result['a2a_metadata'], "A2A Metadata")
            
            # Show any errors
            if 'error' in result:
                print_section("❌ ERRORS", width=100)
                print(f"Error: {result['error']}")
            
        else:
            print_section("❌ ORCHESTRATION FAILED", width=100)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print_section("❌ EXCEPTION DURING ORCHESTRATION", width=100)
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

def test_agent_execution_detailed():
    """Test individual agent execution with detailed output"""
    print_section("🤖 DETAILED AGENT EXECUTION TEST", width=100)
    
    # Get available agents
    try:
        print("📡 Fetching available agents...")
        response = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", timeout=10)
        
        if response.status_code == 200:
            agents_data = response.json()
            print_json(agents_data, "Agents API Response")
            
            agents = agents_data.get('agents', [])
            print(f"\nFound {len(agents)} agents:")
            
            for i, agent in enumerate(agents):
                print_section(f"AGENT {i+1}: {agent['name']}", width=100)
                print_json(agent, f"Agent {i+1} Data")
                
                # Test agent execution
                print(f"\n🧪 Testing execution for {agent['name']}...")
                test_input = "Write a short poem about Python programming"
                
                print(f"Test Input: {test_input}")
                
                exec_response = requests.post(
                    f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent['id']}/execute",
                    json={
                        "input": test_input,
                        "stream": False
                    },
                    timeout=60
                )
                
                print_section(f"EXECUTION RESPONSE FOR {agent['name']}", width=100)
                print(f"Status Code: {exec_response.status_code}")
                print(f"Response Headers: {dict(exec_response.headers)}")
                
                if exec_response.status_code == 200:
                    exec_result = exec_response.json()
                    print_json(exec_result, f"Execution Result for {agent['name']}")
                else:
                    print(f"❌ Execution failed: {exec_response.text}")
                    
        else:
            print(f"❌ Failed to get agents: {response.status_code} - {response.text}")
            
    except Exception as e:
        print_section("❌ ERROR TESTING AGENTS", width=100)
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

def test_a2a_communication_detailed():
    """Test A2A communication with detailed output"""
    print_section("📨 DETAILED A2A COMMUNICATION TEST", width=100)
    
    # Register test agents
    agent1_data = {
        "id": "detailed_creative_001",
        "name": "Detailed Creative Poetry Agent",
        "description": "Specialized in creative writing and poetry with detailed output",
        "model": "qwen3:1.7b",
        "capabilities": ["creative_writing", "poetry", "storytelling", "detailed_analysis"],
        "strands_agent_id": "detailed_creative_001",
        "strands_data": {
            "tools": ["creative_writing", "poetry"],
            "system_prompt": "You are a creative writing assistant specializing in poetry. Always provide detailed, thoughtful responses."
        }
    }
    
    agent2_data = {
        "id": "detailed_technical_001",
        "name": "Detailed Python Code Agent",
        "description": "Specialized in Python programming and code generation with detailed explanations",
        "model": "qwen3:1.7b",
        "capabilities": ["python_programming", "code_generation", "technical_writing", "detailed_explanations"],
        "strands_agent_id": "detailed_technical_001",
        "strands_data": {
            "tools": ["python_programming", "code_generation"],
            "system_prompt": "You are a Python programming expert. Always provide detailed explanations and well-commented code."
        }
    }
    
    # Register agents
    print_section("📝 REGISTERING A2A AGENTS", width=100)
    
    try:
        # Register agent 1
        print("Registering Creative Agent...")
        response1 = requests.post(f"{A2A_SERVICE_URL}/api/a2a/agents", json=agent1_data, timeout=10)
        print_json(response1.json(), "Agent 1 Registration Response")
        
        if response1.status_code == 201:
            agent1_id = response1.json()['agent']['id']
            print(f"✅ Agent 1 registered: {agent1_id}")
        else:
            print(f"❌ Agent 1 registration failed")
            return
        
        # Register agent 2
        print("\nRegistering Technical Agent...")
        response2 = requests.post(f"{A2A_SERVICE_URL}/api/a2a/agents", json=agent2_data, timeout=10)
        print_json(response2.json(), "Agent 2 Registration Response")
        
        if response2.status_code == 201:
            agent2_id = response2.json()['agent']['id']
            print(f"✅ Agent 2 registered: {agent2_id}")
        else:
            print(f"❌ Agent 2 registration failed")
            return
        
        # Create A2A connection
        print_section("🔗 CREATING A2A CONNECTION", width=100)
        conn_data = {
            "from_agent_id": agent1_id,
            "to_agent_id": agent2_id
        }
        print_json(conn_data, "Connection Request")
        
        conn_response = requests.post(
            f"{A2A_SERVICE_URL}/api/a2a/connections",
            json=conn_data,
            timeout=10
        )
        print_json(conn_response.json(), "Connection Response")
        
        if conn_response.status_code == 201:
            print(f"✅ A2A connection created")
        else:
            print(f"⚠️ A2A connection failed")
        
        # Test A2A message
        print_section("📨 TESTING A2A MESSAGE", width=100)
        message_data = {
            "from_agent_id": agent1_id,
            "to_agent_id": agent2_id,
            "content": "I wrote a poem about Python programming. Can you help me create Python code to generate this poem? Please provide detailed explanations.",
            "type": "detailed_collaboration_request"
        }
        print_json(message_data, "A2A Message Request")
        
        msg_response = requests.post(
            f"{A2A_SERVICE_URL}/api/a2a/messages",
            json=message_data,
            timeout=120
        )
        print_json(msg_response.json(), "A2A Message Response")
        
        if msg_response.status_code == 201:
            result = msg_response.json()
            print(f"✅ A2A message sent successfully")
        else:
            print(f"❌ A2A message failed")
        
        # Get message history
        print_section("📚 A2A MESSAGE HISTORY", width=100)
        history_response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/messages/history", timeout=10)
        if history_response.status_code == 200:
            history = history_response.json()
            print_json(history, "Message History")
        else:
            print(f"❌ Failed to get message history: {history_response.text}")
        
    except Exception as e:
        print_section("❌ ERROR IN A2A COMMUNICATION TEST", width=100)
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Main comprehensive test function"""
    print("🔍 COMPREHENSIVE A2A MULTI-AGENT ORCHESTRATION ANALYSIS")
    print("=" * 100)
    print(f"Test started at: {datetime.now().isoformat()}")
    
    # Test 1: Individual Agents
    test_agent_execution_detailed()
    
    # Test 2: A2A Communication
    test_a2a_communication_detailed()
    
    # Test 3: Full Orchestration
    test_comprehensive_orchestration()
    
    print_section("✅ COMPREHENSIVE TEST COMPLETE", width=100)
    print(f"Test completed at: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()

