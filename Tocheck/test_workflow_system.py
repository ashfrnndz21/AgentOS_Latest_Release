#!/usr/bin/env python3
"""
Test Multi-Agent Workflow System
Comprehensive testing of the workflow engine and agent communication
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:5002"

async def test_workflow_system():
    """Test the complete workflow system"""
    
    print("🚀 Testing Multi-Agent Workflow System")
    print("=" * 50)
    
    async with aiohttp.ClientSession() as session:
        
        # 1. Test backend health
        print("\n1. Testing backend health...")
        try:
            async with session.get(f"{BASE_URL}/health") as response:
                if response.status == 200:
                    health_data = await response.json()
                    print(f"✅ Backend healthy: {health_data['status']}")
                    print(f"   Agents in DB: {health_data.get('agents_in_db', 0)}")
                else:
                    print(f"❌ Backend health check failed: {response.status}")
                    return
        except Exception as e:
            print(f"❌ Cannot connect to backend: {e}")
            return
        
        # 2. Register test agents
        print("\n2. Registering test agents...")
        test_agents = [
            {
                "agent_id": "cvm_analyst",
                "name": "CVM Analyst",
                "role": "Customer Value Management Specialist",
                "model": "llama3",
                "capabilities": ["customer-analysis", "segmentation", "value-optimization"],
                "temperature": 0.7,
                "max_tokens": 1000
            },
            {
                "agent_id": "risk_assessor",
                "name": "Risk Assessor",
                "role": "Risk Management Specialist",
                "model": "mistral",
                "capabilities": ["risk-assessment", "compliance", "security"],
                "temperature": 0.5,
                "max_tokens": 800
            },
            {
                "agent_id": "resolution_expert",
                "name": "Resolution Expert",
                "role": "Customer Resolution Specialist",
                "model": "phi3",
                "capabilities": ["problem-solving", "customer-service", "communication"],
                "temperature": 0.8,
                "max_tokens": 1200
            }
        ]
        
        registered_agents = []
        for agent in test_agents:
            try:
                async with session.post(f"{BASE_URL}/api/agents/register", json=agent) as response:
                    if response.status == 200:
                        result = await response.json()
                        print(f"✅ Registered agent: {agent['name']}")
                        registered_agents.append(agent['agent_id'])
                    else:
                        error_text = await response.text()
                        print(f"⚠️ Failed to register {agent['name']}: {error_text}")
            except Exception as e:
                print(f"❌ Error registering {agent['name']}: {e}")
        
        if not registered_agents:
            print("❌ No agents registered successfully. Cannot continue tests.")
            return
        
        # 3. Test agent connections
        print(f"\n3. Testing agent connections ({len(registered_agents)} agents)...")
        working_agents = []
        for agent_id in registered_agents:
            try:
                async with session.post(f"{BASE_URL}/api/agents/{agent_id}/test") as response:
                    if response.status == 200:
                        result = await response.json()
                        if result.get('status') == 'connected':
                            print(f"✅ Agent {agent_id} connected (response time: {result.get('response_time', 0):.2f}ms)")
                            working_agents.append(agent_id)
                        else:
                            print(f"⚠️ Agent {agent_id} connection failed: {result.get('error', 'Unknown error')}")
                    else:
                        print(f"❌ Failed to test agent {agent_id}: {response.status}")
            except Exception as e:
                print(f"❌ Error testing agent {agent_id}: {e}")
        
        if not working_agents:
            print("❌ No agents are working. Cannot test workflows.")
            return
        
        # 4. Test quick workflow execution
        print(f"\n4. Testing quick workflow execution with {len(working_agents)} agents...")
        test_task = "A customer is complaining about delayed delivery and wants a refund. They are a premium customer with a 5-year history. Please analyze the situation and provide a comprehensive resolution strategy."
        
        try:
            workflow_request = {
                "agent_ids": working_agents,
                "user_input": test_task
            }
            
            print(f"   Task: {test_task[:100]}...")
            print(f"   Agents: {', '.join(working_agents)}")
            
            start_time = time.time()
            async with session.post(f"{BASE_URL}/api/workflows/quick-execute", json=workflow_request) as response:
                if response.status == 200:
                    result = await response.json()
                    execution_time = time.time() - start_time
                    
                    print(f"✅ Workflow executed successfully in {execution_time:.2f}s")
                    print(f"   Session ID: {result.get('session_id')}")
                    print(f"   Status: {result.get('status')}")
                    
                    # Display execution path
                    execution_path = result.get('execution_path', [])
                    if execution_path:
                        print(f"\n   Execution Path ({len(execution_path)} steps):")
                        for i, step in enumerate(execution_path):
                            agent_name = step.get('agent_id', 'Unknown')
                            output_preview = str(step.get('output', {})).get('agent_response', {}).get('content', '')[:100]
                            print(f"   {i+1}. {step.get('node_name')} ({agent_name})")
                            if output_preview:
                                print(f"      Output: {output_preview}...")
                    
                    # Display final result
                    final_result = result.get('result', {})
                    if final_result:
                        print(f"\n   Final Result Keys: {list(final_result.keys())}")
                        
                        # Show agent responses
                        agent_outputs = final_result.get('agent_outputs', {})
                        if agent_outputs:
                            print(f"\n   Agent Responses:")
                            for agent_id, output in agent_outputs.items():
                                content = output.get('content', '')[:200]
                                confidence = output.get('confidence', 0)
                                print(f"   • {agent_id}: {content}... (confidence: {confidence:.2f})")
                    
                else:
                    error_text = await response.text()
                    print(f"❌ Workflow execution failed: {response.status} - {error_text}")
                    
        except Exception as e:
            print(f"❌ Error executing workflow: {e}")
        
        # 5. Test workflow creation and execution
        print(f"\n5. Testing custom workflow creation...")
        try:
            custom_workflow = {
                "name": "Customer Analysis Workflow",
                "description": "Comprehensive customer complaint analysis with handoffs",
                "nodes": [
                    {
                        "id": "initial_analysis",
                        "type": "agent",
                        "name": "Initial Analysis",
                        "config": {"agent_id": working_agents[0]},
                        "position": {"x": 100, "y": 100},
                        "connections": ["handoff_decision"]
                    },
                    {
                        "id": "handoff_decision",
                        "type": "handoff",
                        "name": "Smart Handoff",
                        "config": {
                            "strategy": "expertise",
                            "available_agents": working_agents[1:],
                            "default_agent": working_agents[1] if len(working_agents) > 1 else working_agents[0]
                        },
                        "position": {"x": 300, "y": 100},
                        "connections": ["final_aggregation"]
                    },
                    {
                        "id": "final_aggregation",
                        "type": "aggregator",
                        "name": "Combine Results",
                        "config": {"method": "consensus"},
                        "position": {"x": 500, "y": 100},
                        "connections": []
                    }
                ],
                "edges": [
                    {"from": "initial_analysis", "to": "handoff_decision"},
                    {"from": "handoff_decision", "to": "final_aggregation"}
                ],
                "entry_point": "initial_analysis"
            }
            
            async with session.post(f"{BASE_URL}/api/workflows/create", json=custom_workflow) as response:
                if response.status == 200:
                    workflow_result = await response.json()
                    workflow_id = workflow_result.get('workflow_id')
                    print(f"✅ Custom workflow created: {workflow_id}")
                    
                    # Execute the custom workflow
                    print(f"   Executing custom workflow...")
                    execution_request = {
                        "workflow_id": workflow_id,
                        "user_input": "A VIP customer is threatening to leave due to poor service quality. They have been with us for 10 years and generate $50k annual revenue. Urgent resolution needed."
                    }
                    
                    async with session.post(f"{BASE_URL}/api/workflows/execute", json=execution_request) as exec_response:
                        if exec_response.status == 200:
                            exec_result = await exec_response.json()
                            session_id = exec_result.get('session_id')
                            print(f"✅ Custom workflow execution started: {session_id}")
                            
                            # Monitor execution
                            print(f"   Monitoring execution...")
                            for attempt in range(10):  # Wait up to 20 seconds
                                await asyncio.sleep(2)
                                
                                async with session.get(f"{BASE_URL}/api/workflows/session/{session_id}/status") as status_response:
                                    if status_response.status == 200:
                                        status_data = await status_response.json()
                                        status = status_data.get('status')
                                        steps = status_data.get('steps_completed', 0)
                                        current_node = status_data.get('current_node')
                                        
                                        print(f"   Status: {status}, Steps: {steps}, Current: {current_node}")
                                        
                                        if status in ['completed', 'error']:
                                            # Get final result
                                            async with session.get(f"{BASE_URL}/api/workflows/session/{session_id}/result") as result_response:
                                                if result_response.status == 200:
                                                    final_result = await result_response.json()
                                                    print(f"✅ Custom workflow completed!")
                                                    print(f"   Final status: {final_result.get('status')}")
                                                    
                                                    execution_path = final_result.get('execution_path', [])
                                                    print(f"   Execution steps: {len(execution_path)}")
                                                    
                                                    if final_result.get('result'):
                                                        agent_outputs = final_result['result'].get('agent_outputs', {})
                                                        print(f"   Agent responses: {len(agent_outputs)}")
                                            break
                                    else:
                                        print(f"   Failed to get status: {status_response.status}")
                            
                        else:
                            error_text = await exec_response.text()
                            print(f"❌ Failed to execute custom workflow: {error_text}")
                    
                else:
                    error_text = await response.text()
                    print(f"❌ Failed to create custom workflow: {error_text}")
                    
        except Exception as e:
            print(f"❌ Error with custom workflow: {e}")
        
        # 6. Test available agents endpoint
        print(f"\n6. Testing available agents endpoint...")
        try:
            async with session.get(f"{BASE_URL}/api/agents/available") as response:
                if response.status == 200:
                    agents_data = await response.json()
                    agents = agents_data.get('agents', {})
                    print(f"✅ Available agents: {len(agents)}")
                    
                    for agent_id, agent_info in agents.items():
                        print(f"   • {agent_info.get('name')} ({agent_info.get('role')}) - {agent_info.get('model')}")
                        
                else:
                    print(f"❌ Failed to get available agents: {response.status}")
        except Exception as e:
            print(f"❌ Error getting available agents: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Workflow system testing completed!")
    print("\nNext steps:")
    print("1. Start your React frontend")
    print("2. Navigate to Multi-Agent Workspace")
    print("3. Use the Workflow Execution Panel")
    print("4. Create and execute real workflows!")

if __name__ == "__main__":
    asyncio.run(test_workflow_system())