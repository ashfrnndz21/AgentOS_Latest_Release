#!/usr/bin/env python3

import requests
import json
import sys

def test_llm_analysis():
    """Test the LLM analysis step by step"""
    print("🧪 TESTING LLM ANALYSIS STEP BY STEP")
    print("=" * 50)
    
    # Test 1: Simple LLM call
    print("\n1️⃣ Testing simple LLM call...")
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen3:1.7b",
                "prompt": "Analyze this query: 'I want to write a poem about Python'. What is the user intent?",
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "max_tokens": 200
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ LLM Response: {result.get('response', '')[:100]}...")
        else:
            print(f"❌ LLM Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ LLM Exception: {e}")
        return False
    
    # Test 2: Check available agents
    print("\n2️⃣ Testing agent availability...")
    try:
        response = requests.get("http://localhost:5013/api/strands-sdk/agents", timeout=10)
        if response.status_code == 200:
            agents = response.json().get('agents', [])
            print(f"✅ Found {len(agents)} agents: {[a['name'] for a in agents]}")
        else:
            print(f"❌ Agent API Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Agent Exception: {e}")
        return False
    
    # Test 3: Simple orchestration API call
    print("\n3️⃣ Testing simple orchestration API...")
    try:
        response = requests.post(
            "http://localhost:5014/api/enhanced-orchestration/query",
            json={
                "query": "Write a simple poem about Python"
            },
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Orchestration Success: {result.get('success')}")
            print(f"✅ Strategy: {result.get('orchestration_summary', {}).get('execution_strategy', 'unknown')}")
            print(f"✅ Context Reasoning: {result.get('orchestration_summary', {}).get('context_reasoning', 'empty')[:50]}...")
        else:
            print(f"❌ Orchestration Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Orchestration Exception: {e}")
        return False
    
    print("\n✅ ALL TESTS PASSED!")
    return True

if __name__ == "__main__":
    test_llm_analysis()



