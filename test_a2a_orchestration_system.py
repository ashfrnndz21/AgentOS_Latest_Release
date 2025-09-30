#!/usr/bin/env python3
"""
Comprehensive A2A Orchestration System Test Suite
Tests the complete A2A orchestration implementation with detailed validation
"""

import requests
import json
import time
import uuid
from datetime import datetime
from typing import Dict, List, Any

# API Configuration
STRANDS_SDK_URL = "http://localhost:5006"
A2A_SERVICE_URL = "http://localhost:5008"
ENHANCED_ORCHESTRATION_URL = "http://localhost:5014"

class A2AOrchestrationTester:
    """Comprehensive tester for A2A orchestration system"""
    
    def __init__(self):
        self.test_results = []
        self.created_agents = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        result = {
            "test_name": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def test_service_health(self) -> bool:
        """Test all services are healthy"""
        print("\n🔍 Testing Service Health...")
        print("=" * 50)
        
        services = [
            ("Strands SDK", f"{STRANDS_SDK_URL}/api/strands-sdk/health"),
            ("A2A Service", f"{A2A_SERVICE_URL}/api/a2a/health"),
            ("Enhanced Orchestration", f"{ENHANCED_ORCHESTRATION_URL}/api/enhanced-orchestration/health")
        ]
        
        all_healthy = True
        for service_name, url in services:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    self.log_test(f"{service_name} Health Check", True, "Service is healthy")
                else:
                    self.log_test(f"{service_name} Health Check", False, f"HTTP {response.status_code}")
                    all_healthy = False
            except Exception as e:
                self.log_test(f"{service_name} Health Check", False, f"Connection error: {e}")
                all_healthy = False
                
        return all_healthy
    
    def test_agent_creation_with_a2a(self) -> bool:
        """Test agent creation with automatic A2A registration"""
        print("\n🤖 Testing Agent Creation with A2A Registration...")
        print("=" * 50)
        
        # Test agent data
        agent_data = {
            "name": "Test Banking Agent",
            "description": "Specialized in banking operations and financial services",
            "model_id": "qwen3:1.7b",
            "system_prompt": "You are a banking expert specializing in financial services, account management, and customer support.",
            "tools": ["calculator", "web_search", "current_time"],
            "temperature": 0.3,
            "max_tokens": 2000
        }
        
        try:
            # Create agent
            response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", 
                                   json=agent_data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                agent_id = result['id']
                self.created_agents.append(agent_id)
                
                # Check A2A registration
                a2a_registration = result.get('a2a_registration', {})
                if a2a_registration.get('registered'):
                    self.log_test("Agent Creation with A2A", True, 
                                f"Agent {agent_id} created and registered with A2A")
                    return True
                else:
                    self.log_test("Agent Creation with A2A", False, 
                                f"A2A registration failed: {a2a_registration.get('error', 'Unknown error')}")
                    return False
            else:
                self.log_test("Agent Creation with A2A", False, 
                            f"Agent creation failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Agent Creation with A2A", False, f"Exception: {e}")
            return False
    
    def test_a2a_agent_discovery(self) -> bool:
        """Test A2A agent discovery and registration"""
        print("\n🔍 Testing A2A Agent Discovery...")
        print("=" * 50)
        
        try:
            response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                agents = result.get('agents', [])
                
                if len(agents) > 0:
                    self.log_test("A2A Agent Discovery", True, 
                                f"Found {len(agents)} registered agents")
                    
                    # Check if our test agent is registered
                    test_agent = next((a for a in agents if a['name'] == 'Test Banking Agent'), None)
                    if test_agent:
                        self.log_test("Test Agent A2A Registration", True, 
                                    f"Test agent found in A2A registry: {test_agent['id']}")
                        return True
                    else:
                        self.log_test("Test Agent A2A Registration", False, 
                                    "Test agent not found in A2A registry")
                        return False
                else:
                    self.log_test("A2A Agent Discovery", False, "No agents found in A2A registry")
                    return False
            else:
                self.log_test("A2A Agent Discovery", False, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("A2A Agent Discovery", False, f"Exception: {e}")
            return False
    
    def test_enhanced_orchestration_reasoning(self) -> bool:
        """Test enhanced orchestration with detailed reasoning"""
        print("\n🧠 Testing Enhanced Orchestration with Reasoning...")
        print("=" * 50)
        
        test_queries = [
            {
                "query": "I need help with a complex financial calculation and then write a report about it",
                "expected_strategy": "sequential",
                "description": "Sequential task requiring calculation then writing"
            },
            {
                "query": "What's 2+2?",
                "expected_strategy": "single",
                "description": "Simple single task"
            },
            {
                "query": "Help me create a marketing campaign for a new product and also analyze the market competition",
                "expected_strategy": "sequential",
                "description": "Complex sequential tasks"
            }
        ]
        
        all_passed = True
        
        for i, test_case in enumerate(test_queries, 1):
            print(f"\n🔍 Test Query {i}: {test_case['description']}")
            print(f"Query: {test_case['query']}")
            
            try:
                response = requests.post(f"{ENHANCED_ORCHESTRATION_URL}/api/enhanced-orchestration/query",
                                       json={
                                           'query': test_case['query'],
                                           'session_id': f'test_reasoning_{i}_{int(time.time())}'
                                       }, timeout=180)  # Increased timeout to 3 minutes
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Check if response has detailed reasoning
                    has_reasoning = all([
                        'stage_1_query_analysis' in result,
                        'stage_2_sequence_definition' in result,
                        'stage_3_execution_strategy' in result,
                        'stage_4_agent_analysis' in result,
                        'stage_5_agent_matching' in result,
                        'stage_6_orchestration_plan' in result,
                        'orchestration_summary' in result
                    ])
                    
                    if has_reasoning:
                        # Check execution strategy
                        actual_strategy = result.get('stage_3_execution_strategy', {}).get('strategy', 'unknown')
                        strategy_match = actual_strategy == test_case['expected_strategy']
                        
                        # Check reasoning quality
                        reasoning_quality = result.get('orchestration_summary', {}).get('reasoning_quality', 'unknown')
                        
                        self.log_test(f"Orchestration Reasoning {i}", True, 
                                    f"Strategy: {actual_strategy}, Quality: {reasoning_quality}")
                        
                        if not strategy_match:
                            self.log_test(f"Strategy Match {i}", False, 
                                        f"Expected: {test_case['expected_strategy']}, Got: {actual_strategy}")
                            all_passed = False
                        else:
                            self.log_test(f"Strategy Match {i}", True, 
                                        f"Strategy correctly identified as {actual_strategy}")
                    else:
                        self.log_test(f"Orchestration Reasoning {i}", False, 
                                    "Missing detailed reasoning structure")
                        all_passed = False
                else:
                    self.log_test(f"Orchestration Query {i}", False, 
                                f"HTTP {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Orchestration Query {i}", False, f"Exception: {e}")
                all_passed = False
        
        return all_passed
    
    def test_a2a_communication(self) -> bool:
        """Test A2A communication between agents"""
        print("\n💬 Testing A2A Communication...")
        print("=" * 50)
        
        try:
            # Get available agents
            response = requests.get(f"{A2A_SERVICE_URL}/api/a2a/agents", timeout=10)
            if response.status_code != 200:
                self.log_test("A2A Communication", False, "Failed to get agents")
                return False
            
            agents = response.json().get('agents', [])
            if len(agents) < 2:
                self.log_test("A2A Communication", False, "Need at least 2 agents for communication test")
                return False
            
            # Test message sending
            from_agent = agents[0]
            to_agent = agents[1]
            
            message_data = {
                "from_agent_id": from_agent['id'],
                "to_agent_id": to_agent['id'],
                "content": "Hello from A2A communication test!",
                "type": "test_message"
            }
            
            response = requests.post(f"{A2A_SERVICE_URL}/api/a2a/messages",
                                   json=message_data, timeout=10)
            
            if response.status_code == 201:
                result = response.json()
                message_id = result.get('message', {}).get('id')
                
                self.log_test("A2A Message Sending", True, 
                            f"Message sent successfully: {message_id}")
                
                # Test message history
                history_response = requests.get(
                    f"{A2A_SERVICE_URL}/api/a2a/messages/{from_agent['id']}/{to_agent['id']}",
                    timeout=10
                )
                
                if history_response.status_code == 200:
                    history = history_response.json().get('messages', [])
                    if len(history) > 0:
                        self.log_test("A2A Message History", True, 
                                    f"Found {len(history)} messages in history")
                        return True
                    else:
                        self.log_test("A2A Message History", False, "No messages found in history")
                        return False
                else:
                    self.log_test("A2A Message History", False, f"HTTP {history_response.status_code}")
                    return False
            else:
                self.log_test("A2A Message Sending", False, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("A2A Communication", False, f"Exception: {e}")
            return False
    
    def test_agent_cleanup(self) -> bool:
        """Test agent cleanup and A2A unregistration"""
        print("\n🧹 Testing Agent Cleanup...")
        print("=" * 50)
        
        all_cleaned = True
        
        for agent_id in self.created_agents:
            try:
                # Delete agent from Strands SDK
                response = requests.delete(f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent_id}", timeout=10)
                
                if response.status_code == 200:
                    result = response.json()
                    cleanup_results = result.get('cleanup_results', {})
                    
                    if cleanup_results.get('a2a_service') == 'success':
                        self.log_test(f"Agent Cleanup {agent_id}", True, 
                                    "Agent deleted and A2A unregistered")
                    else:
                        self.log_test(f"Agent Cleanup {agent_id}", False, 
                                    f"A2A cleanup status: {cleanup_results.get('a2a_service', 'unknown')}")
                        all_cleaned = False
                else:
                    self.log_test(f"Agent Cleanup {agent_id}", False, f"HTTP {response.status_code}")
                    all_cleaned = False
                    
            except Exception as e:
                self.log_test(f"Agent Cleanup {agent_id}", False, f"Exception: {e}")
                all_cleaned = False
        
        return all_cleaned
    
    def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run all tests and return comprehensive results"""
        print("🚀 Starting Comprehensive A2A Orchestration System Test")
        print("=" * 70)
        
        start_time = datetime.now()
        
        # Run all tests
        tests = [
            ("Service Health", self.test_service_health),
            ("Agent Creation with A2A", self.test_agent_creation_with_a2a),
            ("A2A Agent Discovery", self.test_a2a_agent_discovery),
            ("Enhanced Orchestration Reasoning", self.test_enhanced_orchestration_reasoning),
            ("A2A Communication", self.test_a2a_communication),
            ("Agent Cleanup", self.test_agent_cleanup)
        ]
        
        test_results = {}
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                test_results[test_name] = result
            except Exception as e:
                print(f"❌ Test {test_name} failed with exception: {e}")
                test_results[test_name] = False
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Calculate summary
        total_tests = len(tests)
        passed_tests = sum(1 for result in test_results.values() if result)
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 70)
        print("📊 COMPREHENSIVE TEST RESULTS")
        print("=" * 70)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print(f"Duration: {duration:.2f} seconds")
        
        print("\n📋 Detailed Results:")
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {status} {test_name}")
        
        return {
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "success_rate": (passed_tests/total_tests)*100,
                "duration_seconds": duration
            },
            "test_results": test_results,
            "detailed_logs": self.test_results
        }

def main():
    """Main test execution"""
    tester = A2AOrchestrationTester()
    results = tester.run_comprehensive_test()
    
    # Save results to file
    with open(f"a2a_orchestration_test_results_{int(time.time())}.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: a2a_orchestration_test_results_{int(time.time())}.json")
    
    # Exit with appropriate code
    if results["summary"]["failed_tests"] == 0:
        print("\n🎉 All tests passed! A2A Orchestration System is working perfectly!")
        exit(0)
    else:
        print(f"\n⚠️  {results['summary']['failed_tests']} tests failed. Please check the logs.")
        exit(1)

if __name__ == "__main__":
    main()
