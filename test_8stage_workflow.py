#!/usr/bin/env python3
"""
Test script for 8-Stage Workflow Integration
Tests the complete 8-stage orchestration system with JSON integration
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
ORCHESTRATION_API_URL = "http://localhost:5021"
TEST_QUERY = "Write me a poem about Singapore and rain and get a python code written for it to regenerate the poem"

def test_8stage_workflow():
    """Test the complete 8-stage workflow"""
    print("🚀 Testing 8-Stage Workflow Integration")
    print("=" * 60)
    
    # Test 1: Health Check
    print("\n📊 Test 1: Health Check")
    try:
        response = requests.get(f"{ORCHESTRATION_API_URL}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Orchestration API is healthy")
            health_data = response.json()
            print(f"   Status: {health_data.get('status', 'unknown')}")
            print(f"   Version: {health_data.get('version', 'unknown')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: 8-Stage Orchestration
    print(f"\n🎯 Test 2: 8-Stage Orchestration")
    print(f"Query: {TEST_QUERY}")
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{ORCHESTRATION_API_URL}/api/orchestrate",
            json={"query": TEST_QUERY},
            timeout=120  # 2 minutes timeout for complex orchestration
        )
        execution_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 8-Stage orchestration completed successfully")
            print(f"   Execution time: {execution_time:.2f}s")
            print(f"   Session ID: {result.get('session_id', 'N/A')}")
            print(f"   Success: {result.get('success', False)}")
            
            # Validate 8-stage structure
            validate_8stage_structure(result)
            
            return True
        else:
            print(f"❌ Orchestration failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   Raw response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Orchestration error: {e}")
        return False

def validate_8stage_structure(result):
    """Validate the 8-stage JSON structure"""
    print("\n🔍 Validating 8-Stage Structure")
    
    # Check complete_data_flow
    complete_data_flow = result.get('complete_data_flow', {})
    if not complete_data_flow:
        print("❌ Missing complete_data_flow")
        return False
    
    print("✅ complete_data_flow present")
    
    # Check stages
    stages = complete_data_flow.get('stages', {})
    expected_stages = [
        'stage_1_analysis',
        'stage_2_discovery', 
        'stage_3_execution',
        'stage_4_agent_analysis',
        'stage_5_agent_matching',
        'stage_6_orchestration_plan',
        'stage_7_message_flow',
        'stage_8_final_synthesis'
    ]
    
    missing_stages = []
    for stage in expected_stages:
        if stage not in stages:
            missing_stages.append(stage)
        else:
            print(f"✅ {stage} present")
    
    if missing_stages:
        print(f"❌ Missing stages: {missing_stages}")
        return False
    
    # Check workflow summary
    workflow_summary = result.get('workflow_summary', {})
    if workflow_summary.get('total_stages') == 8:
        print("✅ Total stages: 8")
    else:
        print(f"❌ Expected 8 stages, got: {workflow_summary.get('total_stages', 'N/A')}")
    
    # Check data exchanges
    data_exchanges = complete_data_flow.get('data_exchanges', [])
    if data_exchanges:
        print(f"✅ Data exchanges: {len(data_exchanges)}")
    else:
        print("⚠️  No data exchanges found")
    
    # Check handoffs
    handoffs = complete_data_flow.get('handoffs', [])
    if handoffs:
        print(f"✅ Handoffs: {len(handoffs)}")
    else:
        print("⚠️  No handoffs found")
    
    # Check orchestrator processing
    orchestrator_processing = complete_data_flow.get('orchestrator_processing', [])
    if orchestrator_processing:
        print(f"✅ Orchestrator processing phases: {len(orchestrator_processing)}")
    else:
        print("⚠️  No orchestrator processing found")
    
    print("\n📋 Stage Details:")
    for i, stage_name in enumerate(expected_stages, 1):
        stage_data = stages.get(stage_name, {})
        output = stage_data.get('output', {})
        timestamp = stage_data.get('timestamp', 'N/A')
        
        if output:
            print(f"   Stage {i} ({stage_name}): ✅ Completed at {timestamp}")
        else:
            print(f"   Stage {i} ({stage_name}): ⚠️  No output")
    
    return True

def test_frontend_integration():
    """Test frontend integration points"""
    print("\n🌐 Testing Frontend Integration")
    
    # Test if frontend can access the orchestration endpoint
    try:
        # Simulate frontend request
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        response = requests.post(
            f"{ORCHESTRATION_API_URL}/api/orchestrate",
            json={"query": "Test query for frontend integration"},
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Frontend integration successful")
            print(f"   Response structure: {list(result.keys())}")
            return True
        else:
            print(f"❌ Frontend integration failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Frontend integration error: {e}")
        return False

def main():
    """Main test function"""
    print("🎯 8-Stage Workflow Integration Test")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)
    
    # Run tests
    tests_passed = 0
    total_tests = 3
    
    # Test 1: Health Check
    if test_8stage_workflow():
        tests_passed += 1
    
    # Test 2: Frontend Integration
    if test_frontend_integration():
        tests_passed += 1
    
    # Test 3: JSON Structure Validation
    if validate_8stage_structure({}):  # This will fail but shows the validation logic
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 60)
    print(f"📊 Test Summary: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! 8-Stage workflow is ready.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
