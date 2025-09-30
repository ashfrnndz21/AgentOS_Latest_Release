#!/usr/bin/env python3
"""
Test Improved Orchestration Service
Tests the enhanced LLM-based orchestration with sequential/parallel detection
"""

import requests
import json
import time
from datetime import datetime

# Configuration
ORCHESTRATION_URL = "http://localhost:5009"
STRANDS_SDK_URL = "http://localhost:5006"
A2A_URL = "http://localhost:5008"

def test_orchestration_improvements():
    """Test the improved orchestration service with enhanced examples"""
    
    print("🧪 Testing Improved Orchestration Service")
    print("=" * 50)
    
    # Test cases for different execution strategies
    test_cases = [
        {
            "name": "Sequential Task Detection",
            "query": "Calculate 2+2, then write the result to a file, then review the file",
            "expected_strategy": "sequential",
            "description": "Should detect sequential execution due to 'then' keywords"
        },
        {
            "name": "Parallel Task Detection", 
            "query": "Analyze three different numbers: 10, 20, 30",
            "expected_strategy": "parallel",
            "description": "Should detect parallel execution for multiple similar tasks"
        },
        {
            "name": "Single Task Detection",
            "query": "What's 5 + 3?",
            "expected_strategy": "single", 
            "description": "Should detect single execution for simple arithmetic"
        },
        {
            "name": "Complex Sequential Task",
            "query": "First, analyze the data, then create a report, and finally send it via email",
            "expected_strategy": "sequential",
            "description": "Should detect sequential execution with multiple 'then' keywords"
        },
        {
            "name": "Parallel Analysis Task",
            "query": "Check the weather in New York, London, and Tokyo simultaneously",
            "expected_strategy": "parallel",
            "description": "Should detect parallel execution for multiple locations"
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔍 Test {i}: {test_case['name']}")
        print(f"Query: {test_case['query']}")
        print(f"Expected: {test_case['expected_strategy']}")
        print(f"Description: {test_case['description']}")
        
        try:
            # Send orchestration request
            response = requests.post(f"{ORCHESTRATION_URL}/api/strands-orchestration/orchestrate", 
                                   json={
                                       'query': test_case['query'],
                                       'session_id': f'test_{i}_{int(time.time())}'
                                   }, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                execution_strategy = result.get('orchestration_plan', {}).get('execution_strategy', 'unknown')
                analysis = result.get('orchestration_plan', {}).get('analysis', {})
                reasoning = analysis.get('reasoning', 'No reasoning provided')
                
                # Check if strategy matches expectation
                strategy_match = execution_strategy == test_case['expected_strategy']
                
                print(f"✅ Response received")
                print(f"📊 Detected Strategy: {execution_strategy}")
                print(f"🎯 Strategy Match: {'✅ PASS' if strategy_match else '❌ FAIL'}")
                print(f"🧠 Reasoning: {reasoning}")
                
                # Check execution results
                execution_results = result.get('execution_results', {})
                success = execution_results.get('success', False)
                steps_completed = execution_results.get('steps_completed', 0)
                
                print(f"⚡ Execution Success: {'✅' if success else '❌'}")
                print(f"📈 Steps Completed: {steps_completed}")
                
                results.append({
                    'test_name': test_case['name'],
                    'query': test_case['query'],
                    'expected_strategy': test_case['expected_strategy'],
                    'detected_strategy': execution_strategy,
                    'strategy_match': strategy_match,
                    'execution_success': success,
                    'steps_completed': steps_completed,
                    'reasoning': reasoning,
                    'status': 'PASS' if (strategy_match and success) else 'FAIL'
                })
                
            else:
                print(f"❌ Request failed: {response.status_code}")
                print(f"Error: {response.text}")
                results.append({
                    'test_name': test_case['name'],
                    'query': test_case['query'],
                    'expected_strategy': test_case['expected_strategy'],
                    'detected_strategy': 'error',
                    'strategy_match': False,
                    'execution_success': False,
                    'steps_completed': 0,
                    'reasoning': f'HTTP {response.status_code}',
                    'status': 'FAIL'
                })
                
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append({
                'test_name': test_case['name'],
                'query': test_case['query'],
                'expected_strategy': test_case['expected_strategy'],
                'detected_strategy': 'exception',
                'strategy_match': False,
                'execution_success': False,
                'steps_completed': 0,
                'reasoning': str(e),
                'status': 'FAIL'
            })
        
        print("-" * 50)
    
    # Summary
    print("\n📊 TEST SUMMARY")
    print("=" * 50)
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r['status'] == 'PASS')
    strategy_matches = sum(1 for r in results if r['strategy_match'])
    execution_successes = sum(1 for r in results if r['execution_success'])
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed Tests: {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
    print(f"Strategy Matches: {strategy_matches} ({strategy_matches/total_tests*100:.1f}%)")
    print(f"Execution Successes: {execution_successes} ({execution_successes/total_tests*100:.1f}%)")
    
    print("\n📋 DETAILED RESULTS:")
    for result in results:
        status_emoji = "✅" if result['status'] == 'PASS' else "❌"
        print(f"{status_emoji} {result['test_name']}")
        print(f"   Query: {result['query']}")
        print(f"   Expected: {result['expected_strategy']} | Detected: {result['detected_strategy']}")
        print(f"   Strategy Match: {'✅' if result['strategy_match'] else '❌'}")
        print(f"   Execution: {'✅' if result['execution_success'] else '❌'}")
        print(f"   Reasoning: {result['reasoning']}")
        print()
    
    return results

if __name__ == "__main__":
    test_orchestration_improvements()

