#!/usr/bin/env python3
"""
Test script to see LLM outputs from the simple orchestration API
"""

import requests
import json
import time

def test_llm_outputs():
    """Test the simple orchestration API and show detailed outputs"""
    
    # Test data
    query = "Help me with Python programming"
    contextual_analysis = {
        "success": True,
        "user_intent": "Learn Python programming fundamentals",
        "domain_analysis": {
            "primary_domain": "Programming",
            "technical_level": "beginner"
        },
        "orchestration_pattern": "direct"
    }
    
    print("=" * 80)
    print("TESTING SIMPLE 2-STEP ORCHESTRATION API")
    print("=" * 80)
    print(f"Query: {query}")
    print(f"Contextual Analysis: {json.dumps(contextual_analysis, indent=2)}")
    print("=" * 80)
    
    # Make the request
    try:
        response = requests.post(
            'http://localhost:5015/api/simple-orchestration/query',
            headers={'Content-Type': 'application/json'},
            json={
                'query': query,
                'contextual_analysis': contextual_analysis
            },
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print("=" * 80)
            print("STEP 1 - STREAMLINED ANALYSIS:")
            print("=" * 80)
            print(json.dumps(result.get('streamlined_analysis', {}), indent=2))
            
            print("\n" + "=" * 80)
            print("STEP 2 - AGENT REGISTRY ANALYSIS:")
            print("=" * 80)
            agent_analysis = result.get('agent_registry_analysis', {})
            print(f"Success: {agent_analysis.get('success', False)}")
            print(f"Total Agents Analyzed: {agent_analysis.get('total_agents_analyzed', 0)}")
            print(f"Analysis Summary: {agent_analysis.get('analysis_summary', 'N/A')}")
            
            print("\nAgent Analysis Details:")
            for i, agent in enumerate(agent_analysis.get('agent_analysis', []), 1):
                print(f"\n--- Agent {i} ---")
                print(f"Name: {agent.get('agent_name', 'N/A')}")
                print(f"Association Score: {agent.get('association_score', 'N/A')}")
                print(f"Role Analysis: {agent.get('role_analysis', 'N/A')}")
                print(f"Contextual Relevance: {agent.get('contextual_relevance', 'N/A')}")
            
            print("\n" + "=" * 80)
            print("EXECUTION DETAILS:")
            print("=" * 80)
            exec_details = result.get('execution_details', {})
            print(f"Success: {exec_details.get('success', False)}")
            print(f"Execution Time: {exec_details.get('execution_time', 'N/A')} seconds")
            print(f"Steps Completed: {exec_details.get('steps_completed', 'N/A')}")
            
        else:
            print(f"❌ ERROR: HTTP {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")

if __name__ == "__main__":
    test_llm_outputs()
