#!/usr/bin/env python3
"""
Test script for the Improved Multi-Agent Orchestrator
Demonstrates the improvements over the current system
"""

import asyncio
import httpx
import json
import time

async def test_improved_orchestrator():
    """Test the improved orchestrator with various queries"""
    
    base_url = "http://localhost:5035"
    
    # Test queries covering different scenarios
    test_queries = [
        {
            "name": "Simple Creative Query",
            "query": "Write a poem about Singapore",
            "expected_agents": ["creative_assistant"],
            "execution_strategy": "single"
        },
        {
            "name": "Multi-Agent Sequential Query", 
            "query": "Write a creative story about robots, then create Python code to analyze its sentiment",
            "expected_agents": ["creative_assistant", "technical_expert"],
            "execution_strategy": "sequential"
        },
        {
            "name": "Technical Query",
            "query": "Generate Python code for fibonacci sequence",
            "expected_agents": ["technical_expert"],
            "execution_strategy": "single"
        },
        {
            "name": "Complex Multi-Agent Query",
            "query": "Create a story about AI and then write code to analyze it",
            "expected_agents": ["creative_assistant", "technical_expert"],
            "execution_strategy": "sequential"
        }
    ]
    
    print("🧪 Testing Improved Multi-Agent Orchestrator")
    print("=" * 60)
    
    async with httpx.AsyncClient(timeout=120) as client:
        
        # Test 1: Health Check
        print("\n1️⃣ Testing Health Check...")
        try:
            response = await client.get(f"{base_url}/health")
            if response.status_code == 200:
                health_data = response.json()
                print(f"✅ Health Check: {health_data['status']}")
                print(f"   Agents Registered: {health_data['agents_registered']}")
            else:
                print(f"❌ Health Check Failed: {response.status_code}")
                return
        except Exception as e:
            print(f"❌ Health Check Error: {e}")
            return
        
        # Test 2: List Agents
        print("\n2️⃣ Testing Agent Registry...")
        try:
            response = await client.get(f"{base_url}/agents")
            if response.status_code == 200:
                agents_data = response.json()
                print(f"✅ Found {len(agents_data['agents'])} agents:")
                for agent in agents_data['agents']:
                    print(f"   - {agent['name']}: {agent['capabilities']}")
            else:
                print(f"❌ Agent List Failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Agent List Error: {e}")
        
        # Test 3: Query Processing
        print("\n3️⃣ Testing Query Processing...")
        
        for i, test_case in enumerate(test_queries, 1):
            print(f"\n   Test {i}: {test_case['name']}")
            print(f"   Query: {test_case['query']}")
            print(f"   Expected Strategy: {test_case['execution_strategy']}")
            
            try:
                start_time = time.time()
                
                response = await client.post(
                    f"{base_url}/query",
                    json={"query": test_case['query']},
                    timeout=60
                )
                
                execution_time = time.time() - start_time
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"   ✅ Success ({execution_time:.2f}s)")
                    print(f"   Status: {result['status']}")
                    print(f"   Agents Used: {result['agents_used']}")
                    print(f"   Execution Time: {result['execution_time']:.2f}s")
                    
                    # Check if expected agents were used
                    if result['agents_used']:
                        print(f"   📊 Result Type: {result['result'].get('type', 'unknown')}")
                        if result['result'].get('type') == 'multi_agent':
                            print(f"   🔄 Multi-Agent Coordination: ✅")
                        else:
                            print(f"   🎯 Single Agent Execution: ✅")
                    else:
                        print(f"   ⚠️  No agents executed")
                        
                else:
                    print(f"   ❌ Failed: {response.status_code}")
                    print(f"   Error: {response.text}")
                    
            except httpx.TimeoutException:
                print(f"   ⏰ Timeout after 60s")
            except Exception as e:
                print(f"   💥 Error: {e}")
        
        # Test 4: Compare with Current System
        print("\n4️⃣ Comparing with Current System...")
        print("   Testing same query on both systems...")
        
        test_query = "Write a creative story about robots, then create Python code to analyze its sentiment"
        
        # Test improved orchestrator
        try:
            start_time = time.time()
            response = await client.post(
                f"{base_url}/query",
                json={"query": test_query},
                timeout=60
            )
            improved_time = time.time() - start_time
            
            if response.status_code == 200:
                improved_result = response.json()
                print(f"   ✅ Improved System: {improved_time:.2f}s")
                print(f"      Agents: {improved_result['agents_used']}")
                print(f"      Status: {improved_result['status']}")
            else:
                print(f"   ❌ Improved System Failed: {response.status_code}")
                
        except Exception as e:
            print(f"   💥 Improved System Error: {e}")
        
        # Test current system
        try:
            start_time = time.time()
            response = await client.post(
                "http://localhost:5031/api/main-orchestrator/orchestrate",
                json={"query": test_query},
                timeout=60
            )
            current_time = time.time() - start_time
            
            if response.status_code == 200:
                current_result = response.json()
                print(f"   ✅ Current System: {current_time:.2f}s")
                print(f"      Agents: {current_result.get('selected_agents', [{}])[0].get('name', 'Unknown')}")
                print(f"      Status: {current_result.get('status', 'unknown')}")
            else:
                print(f"   ❌ Current System Failed: {response.status_code}")
                
        except Exception as e:
            print(f"   💥 Current System Error: {e}")

def main():
    """Run the test suite"""
    print("🚀 Starting Improved Orchestrator Tests")
    print("Make sure the improved orchestrator is running on port 5035")
    print("Make sure the current orchestrator is running on port 5031")
    print()
    
    try:
        asyncio.run(test_improved_orchestrator())
        print("\n🎉 Test Suite Completed!")
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
    except Exception as e:
        print(f"\n💥 Test suite failed: {e}")

if __name__ == "__main__":
    main()



