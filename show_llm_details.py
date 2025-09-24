#!/usr/bin/env python3
"""
Show detailed LLM prompt and response
"""

import requests
import json

def show_llm_details():
    """Show the exact LLM prompt and response"""
    
    print("🔍 DETAILED LLM ANALYSIS")
    print("=" * 80)
    
    # Test query
    query = "Help me write a business plan"
    contextual_analysis = {
        "success": True,
        "user_intent": "Create a comprehensive business plan for a new venture",
        "domain_analysis": {
            "primary_domain": "Business",
            "technical_level": "intermediate"
        },
        "orchestration_pattern": "sequential"
    }
    
    print(f"📝 Query: {query}")
    print(f"🎯 User Intent: {contextual_analysis['user_intent']}")
    print(f"🏢 Domain: {contextual_analysis['domain_analysis']['primary_domain']}")
    print(f"📊 Technical Level: {contextual_analysis['domain_analysis']['technical_level']}")
    print("=" * 80)
    
    # Make request
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
            
            # Show Step 1 (Contextual Analysis)
            print("📋 STEP 1: CONTEXTUAL ANALYSIS (Input)")
            print("-" * 40)
            streamlined = result.get('streamlined_analysis', {})
            print(f"✅ Success: {streamlined.get('success', False)}")
            print(f"🎯 User Intent: {streamlined.get('user_intent', 'N/A')}")
            print(f"🏢 Domain: {streamlined.get('domain_analysis', {}).get('primary_domain', 'N/A')}")
            print(f"📊 Technical Level: {streamlined.get('domain_analysis', {}).get('technical_level', 'N/A')}")
            print(f"🔄 Pattern: {streamlined.get('orchestration_pattern', 'N/A')}")
            
            # Show Step 2 (Agent Analysis)
            print("\n📋 STEP 2: AGENT REGISTRY ANALYSIS (LLM Output)")
            print("-" * 40)
            agent_analysis = result.get('agent_registry_analysis', {})
            
            if agent_analysis.get('success'):
                print(f"✅ Analysis Success: {agent_analysis.get('success')}")
                print(f"📊 Agents Analyzed: {agent_analysis.get('total_agents_analyzed', 0)}")
                print(f"📝 Summary: {agent_analysis.get('analysis_summary', 'N/A')}")
                
                print("\n🤖 AGENT DETAILS:")
                for i, agent in enumerate(agent_analysis.get('agent_analysis', []), 1):
                    print(f"\n  Agent {i}: {agent.get('agent_name', 'Unknown')}")
                    print(f"    Score: {agent.get('association_score', 'N/A')}")
                    print(f"    Role: {agent.get('role_analysis', 'N/A')}")
                    print(f"    Relevance: {agent.get('contextual_relevance', 'N/A')}")
            else:
                print("❌ Agent analysis failed")
            
            # Show execution summary
            exec_details = result.get('execution_details', {})
            print(f"\n⏱️  Total Time: {exec_details.get('execution_time', 'N/A')} seconds")
            print(f"✅ Success: {exec_details.get('success', False)}")
            
        else:
            print(f"❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    show_llm_details()

