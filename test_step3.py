#!/usr/bin/env python3
import requests
import json

def test_step3():
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
        
        print("🎯 STEP 3: AGENT SELECTION & SEQUENCING")
        print("=" * 50)
        
        selection = data.get('agent_selection', {})
        print(f"Selected agents: {selection.get('total_agents_selected', 'N/A')}")
        print(f"Strategy: {selection.get('execution_strategy', 'N/A')}")
        print(f"Overall reasoning: {selection.get('overall_reasoning', 'N/A')}")
        
        print("\nSelected Agent Details:")
        for i, agent in enumerate(selection.get('selected_agents', []), 1):
            print(f"  {i}. {agent.get('agent_name', 'Unknown')} (Order: {agent.get('execution_order', 'N/A')})")
            print(f"     Task: {agent.get('task_assignment', 'N/A')}")
            print(f"     Reasoning: {agent.get('selection_reasoning', 'N/A')}")
            print(f"     Confidence: {agent.get('confidence_score', 'N/A')}")
        
        print(f"\n⏱️  Total execution time: {data.get('execution_details', {}).get('execution_time', 'N/A')} seconds")
    else:
        print(f"Error: {response.status_code}")

if __name__ == "__main__":
    test_step3()
