#!/usr/bin/env python3
import requests
import json

def test_step4():
    response = requests.post(
        'http://localhost:5015/api/simple-orchestration/query',
        headers={'Content-Type': 'application/json'},
        json={
            'query': 'I want to learn Python and write creative stories',
            'contextual_analysis': {
                'success': True,
                'user_intent': 'Learn Python programming and develop creative writing skills',
                'domain_analysis': {
                    'primary_domain': 'Programming',
                    'technical_level': 'beginner'
                },
                'orchestration_pattern': 'sequential'
            }
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        
        print("🎯 STEP 4: A2A EXECUTION WITH SEQUENTIAL HANDOVER")
        print("=" * 60)
        
        a2a = data.get('a2a_execution', {})
        print(f"Success: {a2a.get('success', 'N/A')}")
        print(f"Strategy: {a2a.get('execution_strategy', 'N/A')}")
        print(f"Agents executed: {a2a.get('total_agents_executed', 'N/A')}")
        
        print("\n📋 Execution Results:")
        for i, result in enumerate(a2a.get('execution_results', []), 1):
            print(f"\n  {i}. {result.get('agent_name', 'Unknown')} (Order: {result.get('execution_order', 'N/A')})")
            print(f"     Task: {result.get('task_assignment', 'N/A')}")
            print(f"     Response: {result.get('agent_response', 'N/A')}")
            print(f"     Success: {result.get('success', 'N/A')}")
            print(f"     Time: {result.get('execution_time', 'N/A')}s")
        
        print(f"\n🎯 Final Response:")
        print(a2a.get('final_response', 'N/A'))
        
        print(f"\n⏱️  Total execution time: {data.get('execution_details', {}).get('execution_time', 'N/A')} seconds")
        print(f"📊 Steps completed: {data.get('execution_details', {}).get('steps_completed', 'N/A')}")
    else:
        print(f"Error: {response.status_code}")

if __name__ == "__main__":
    test_step4()
