#!/usr/bin/env python3
"""
Test script to see raw LLM outputs from the simple orchestration API
"""

import requests
import json
import time

def test_with_raw_llm():
    """Test and show raw LLM outputs"""
    
    print("=" * 100)
    print("TESTING WITH RAW LLM OUTPUTS")
    print("=" * 100)
    
    # Test with a simple query
    query = "I want to learn machine learning"
    contextual_analysis = {
        "success": True,
        "user_intent": "Learn machine learning concepts and applications",
        "domain_analysis": {
            "primary_domain": "Machine Learning",
            "technical_level": "intermediate"
        },
        "orchestration_pattern": "sequential"
    }
    
    print(f"Query: {query}")
    print(f"User Intent: {contextual_analysis['user_intent']}")
    print(f"Domain: {contextual_analysis['domain_analysis']['primary_domain']}")
    print(f"Technical Level: {contextual_analysis['domain_analysis']['technical_level']}")
    print("=" * 100)
    
    # Make the request
    try:
        print("Sending request to simple orchestration API...")
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
            
            # Show the agent analysis results
            agent_analysis = result.get('agent_registry_analysis', {})
            print("\n" + "=" * 100)
            print("AGENT REGISTRY ANALYSIS RESULTS:")
            print("=" * 100)
            
            if agent_analysis.get('success'):
                print(f"✅ Analysis successful")
                print(f"📊 Total agents analyzed: {agent_analysis.get('total_agents_analyzed', 0)}")
                print(f"📝 Summary: {agent_analysis.get('analysis_summary', 'N/A')}")
                
                print("\n" + "-" * 80)
                print("DETAILED AGENT ANALYSIS:")
                print("-" * 80)
                
                for i, agent in enumerate(agent_analysis.get('agent_analysis', []), 1):
                    print(f"\n🤖 AGENT {i}: {agent.get('agent_name', 'Unknown')}")
                    print(f"   📈 Association Score: {agent.get('association_score', 'N/A')}")
                    print(f"   🎯 Role Analysis: {agent.get('role_analysis', 'N/A')}")
                    print(f"   🔗 Contextual Relevance: {agent.get('contextual_relevance', 'N/A')}")
            else:
                print("❌ Agent analysis failed")
            
            # Show execution details
            exec_details = result.get('execution_details', {})
            print("\n" + "=" * 100)
            print("EXECUTION SUMMARY:")
            print("=" * 100)
            print(f"⏱️  Execution Time: {exec_details.get('execution_time', 'N/A')} seconds")
            print(f"✅ Success: {exec_details.get('success', False)}")
            print(f"📋 Steps Completed: {exec_details.get('steps_completed', 'N/A')}")
            
        else:
            print(f"❌ HTTP ERROR: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")

if __name__ == "__main__":
    test_with_raw_llm()
