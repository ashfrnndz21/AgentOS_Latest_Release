#!/usr/bin/env python3
"""
Quick test of the unified orchestrator with RAN query
"""

import asyncio
from unified_system_orchestrator import unified_orchestrator

async def test_ran_query():
    """Test the RAN query"""
    query = "How does RAN Affect churn and what is the PRB utilization & Churn thresholds that we should set to monitor these performance kpis"
    
    print("🚀 Testing RAN Query...")
    print(f"📝 Query: {query}")
    print("=" * 80)
    
    try:
        result = await unified_orchestrator.process_query(query=query)
        
        print("✅ SUCCESS!")
        print(f"📊 Session ID: {result.get('session_id')}")
        print(f"🎯 Strategy: {result.get('workflow_summary', {}).get('execution_strategy')}")
        print(f"⏱️  Time: {result.get('workflow_summary', {}).get('processing_time')}s")
        print(f"🤖 Agents: {result.get('workflow_summary', {}).get('agents_used')}")
        print("\n📝 CLEAN RESPONSE:")
        print("-" * 40)
        print(result.get('response', 'No response'))
        print("-" * 40)
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ran_query())
