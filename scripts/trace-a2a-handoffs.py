#!/usr/bin/env python3
"""
A2A Handoff Trace Script
Shows exactly what was handed over between orchestrator and agents
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

def trace_a2a_handoffs():
    """Trace all A2A handoffs and messages"""
    print_section("🔍 A2A HANDOFF TRACE ANALYSIS", width=100)
    
    # Test query
    test_query = "I want to learn how to write a poem about Python programming and then create Python code to generate that poem"
    
    print(f"📝 Test Query: {test_query}")
    print(f"⏰ Timestamp: {datetime.now().isoformat()}")
    
    # Get current A2A agents
    print_section("🤖 CURRENT A2A AGENTS", width=100)
    try:
        response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents", timeout=10)
        if response.status_code == 200:
            agents = response.json().get('agents', [])
            print(f"Found {len(agents)} A2A agents:")
            for agent in agents:
                print(f"\n--- {agent['name']} ---")
                print(f"ID: {agent['id']}")
                print(f"Description: {agent.get('description', 'N/A')}")
                print(f"Capabilities: {agent.get('capabilities', [])}")
                print(f"Status: {agent.get('status', 'N/A')}")
                print(f"Created: {agent.get('created_at', 'N/A')}")
        else:
            print(f"❌ Failed to get A2A agents: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting A2A agents: {e}")
    
    # Get A2A connections
    print_section("🔗 A2A CONNECTIONS", width=100)
    try:
        response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/connections", timeout=10)
        if response.status_code == 200:
            connections = response.json().get('connections', [])
            print(f"Found {len(connections)} A2A connections:")
            for conn in connections:
                print(f"\n--- Connection {conn['id']} ---")
                print(f"From: {conn['from_agent_id']}")
                print(f"To: {conn['to_agent_id']}")
                print(f"Status: {conn['status']}")
                print(f"Message Count: {conn['message_count']}")
                print(f"Created: {conn['created_at']}")
                print(f"Last Used: {conn['last_used']}")
        else:
            print(f"❌ Failed to get A2A connections: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting A2A connections: {e}")
    
    # Get complete message history
    print_section("📚 COMPLETE A2A MESSAGE HISTORY", width=100)
    try:
        response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/messages/history", timeout=10)
        if response.status_code == 200:
            history = response.json()
            messages = history.get('messages', [])
            print(f"Total messages in history: {len(messages)}")
            
            for i, msg in enumerate(messages):
                print_section(f"MESSAGE {i+1}: {msg['id']}", width=100)
                print(f"From Agent: {msg['from_agent_id']}")
                print(f"To Agent: {msg['to_agent_id']}")
                print(f"Message Type: {msg['message_type']}")
                print(f"Timestamp: {msg['timestamp']}")
                print(f"Status: {msg['status']}")
                print(f"Execution Time: {msg['execution_time']:.4f}s")
                print(f"Content: {msg['content']}")
                print(f"Response: {msg.get('response', 'No response')}")
                print(f"Metadata: {msg.get('metadata', {})}")
        else:
            print(f"❌ Failed to get message history: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting message history: {e}")
    
    # Test new orchestration with detailed tracing
    print_section("🧪 NEW ORCHESTRATION WITH DETAILED TRACING", width=100)
    
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
    
    print("🚀 Starting new orchestration...")
    print(f"Request: {json.dumps(orchestration_data, indent=2)}")
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{ORCHESTRATION_URL}/api/enhanced-orchestration/query",
            json=orchestration_data,
            timeout=120
        )
        end_time = time.time()
        
        print(f"⏱️ Orchestration completed in {end_time - start_time:.2f}s")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Show orchestration result
            print_section("📊 ORCHESTRATION RESULT", width=100)
            print(f"Success: {result.get('success', False)}")
            print(f"Session ID: {result.get('session_id', 'N/A')}")
            
            # Show execution details
            if 'execution_details' in result:
                exec_details = result['execution_details']
                print_section("⚙️ EXECUTION DETAILS", width=100)
                print(f"Success: {exec_details.get('success', False)}")
                print(f"Execution Time: {exec_details.get('execution_time', 0):.4f}s")
                print(f"Agent Response Length: {exec_details.get('agent_response_length', 0)}")
            
            # Show raw agent response with handoff details
            if 'raw_agent_response' in result:
                raw_response = result['raw_agent_response']
                print_section("🤖 RAW AGENT RESPONSE", width=100)
                print(f"Orchestration Type: {raw_response.get('orchestration_type', 'N/A')}")
                print(f"Agents Coordinated: {raw_response.get('agents_coordinated', 0)}")
                print(f"Success: {raw_response.get('success', False)}")
                print(f"Execution Time: {raw_response.get('execution_time', 0):.4f}s")
                
                # Show coordination results
                if 'coordination_results' in raw_response:
                    coord_results = raw_response['coordination_results']
                    print_section("🔄 COORDINATION RESULTS", width=100)
                    print(f"A2A Framework: {coord_results.get('a2a_framework', False)}")
                    print(f"Strands Integration: {coord_results.get('strands_integration', False)}")
                    print(f"Successful Steps: {coord_results.get('successful_steps', 0)}")
                    
                    # Show handover steps
                    if 'handover_steps' in coord_results:
                        print_section("🤝 HANDOVER STEPS DETAIL", width=100)
                        for i, step in enumerate(coord_results['handover_steps']):
                            print_section(f"STEP {i+1}: {step.get('agent_name', 'Unknown')}", width=100)
                            print(f"Agent ID: {step.get('agent_id', 'N/A')}")
                            print(f"A2A Agent ID: {step.get('a2a_agent_id', 'N/A')}")
                            print(f"A2A Status: {step.get('a2a_status', 'N/A')}")
                            print(f"Execution Time: {step.get('execution_time', 0):.4f}s")
                            print(f"Step Number: {step.get('step', 'N/A')}")
                            print(f"Result: {step.get('result', 'No result')}")
                            if 'error' in step:
                                print(f"Error: {step['error']}")
                
                # Show A2A metadata
                if 'a2a_metadata' in raw_response:
                    print_section("🔗 A2A METADATA", width=100)
                    metadata = raw_response['a2a_metadata']
                    for key, value in metadata.items():
                        print(f"{key}: {value}")
            
            # Show final response
            if 'final_response' in result:
                print_section("🎯 FINAL RESPONSE", width=100)
                print(result['final_response'])
        
        else:
            print(f"❌ Orchestration failed: {response.text}")
    
    except Exception as e:
        print(f"❌ Error during orchestration: {e}")
        import traceback
        traceback.print_exc()
    
    # Get updated message history after orchestration
    print_section("📚 UPDATED MESSAGE HISTORY AFTER ORCHESTRATION", width=100)
    try:
        response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/messages/history", timeout=10)
        if response.status_code == 200:
            history = response.json()
            messages = history.get('messages', [])
            print(f"Total messages after orchestration: {len(messages)}")
            
            # Show only new messages (last 5)
            recent_messages = messages[-5:] if len(messages) > 5 else messages
            print(f"Showing last {len(recent_messages)} messages:")
            
            for i, msg in enumerate(recent_messages):
                print_section(f"RECENT MESSAGE {i+1}: {msg['id']}", width=100)
                print(f"From: {msg['from_agent_id']} -> To: {msg['to_agent_id']}")
                print(f"Type: {msg['message_type']}")
                print(f"Time: {msg['timestamp']}")
                print(f"Status: {msg['status']}")
                print(f"Content: {msg['content'][:200]}...")
                print(f"Response: {msg.get('response', 'No response')[:200]}...")
        else:
            print(f"❌ Failed to get updated message history: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting updated message history: {e}")

def main():
    """Main trace function"""
    print("🔍 A2A HANDOFF TRACE ANALYSIS")
    print("=" * 100)
    print(f"Analysis started at: {datetime.now().isoformat()}")
    
    trace_a2a_handoffs()
    
    print_section("✅ TRACE ANALYSIS COMPLETE", width=100)
    print(f"Analysis completed at: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()

