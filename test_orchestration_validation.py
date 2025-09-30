#!/usr/bin/env python3
"""
Test Orchestration Validation
Tests sequential and parallel task orchestration with context-aware LLM detection
"""

import requests
import json
import time
import asyncio
from datetime import datetime
from typing import Dict, List, Any

# Configuration
ORCHESTRATION_URL = "http://localhost:5009"
STRANDS_SDK_URL = "http://localhost:5006"
A2A_URL = "http://localhost:5008"

class OrchestrationTester:
    def __init__(self):
        self.test_results = []
        self.agent_ids = []
        
    def log_test(self, test_name: str, status: str, details: str = ""):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.test_results.append(result)
        print(f"[{status.upper()}] {test_name}: {details}")
    
    def check_service_health(self) -> bool:
        """Check if orchestration service is running"""
        try:
            # Try the feature flags endpoint to check if service is running
            response = requests.get(f"{ORCHESTRATION_URL}/api/strands-orchestration/feature-flags", timeout=5)
            if response.status_code == 200:
                self.log_test("Service Health Check", "PASS", "Orchestration service is running")
                return True
            else:
                self.log_test("Service Health Check", "FAIL", f"Service returned {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Service Health Check", "FAIL", f"Service not accessible: {str(e)}")
            return False
    
    def create_test_agents(self) -> bool:
        """Create test agents for orchestration"""
        try:
            # Create 3 test agents with different capabilities
            agents = [
                {
                    "name": "Data Analyst Agent",
                    "description": "Specialized in data analysis and processing",
                    "model": "llama3.2:latest",
                    "system_prompt": "You are a data analyst. Process data step by step and provide insights.",
                    "tools": ["calculator", "think", "current_time"]
                },
                {
                    "name": "Report Writer Agent", 
                    "description": "Specialized in writing reports and documentation",
                    "model": "llama3.2:latest",
                    "system_prompt": "You are a report writer. Create clear, structured reports based on data.",
                    "tools": ["file_write", "think", "current_time"]
                },
                {
                    "name": "Quality Reviewer Agent",
                    "description": "Specialized in quality assurance and validation",
                    "model": "llama3.2:latest", 
                    "system_prompt": "You are a quality reviewer. Validate and improve work from other agents.",
                    "tools": ["think", "current_time"]
                }
            ]
            
            created_agents = []
            for agent_config in agents:
                response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", 
                                       json=agent_config, timeout=10)
                if response.status_code in [200, 201]:
                    agent_data = response.json()
                    agent_id = agent_data.get("id")
                    if agent_id:
                        created_agents.append(agent_id)
                        self.log_test("Agent Creation", "PASS", f"Created {agent_config['name']} (ID: {agent_id})")
                    else:
                        self.log_test("Agent Creation", "FAIL", f"Failed to get agent ID for {agent_config['name']}")
                else:
                    self.log_test("Agent Creation", "FAIL", f"Failed to create {agent_config['name']}: HTTP {response.status_code} - {response.text}")
            
            self.agent_ids = created_agents
            return len(created_agents) > 0
            
        except Exception as e:
            self.log_test("Agent Creation", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_sequential_orchestration(self) -> bool:
        """Test sequential task orchestration"""
        try:
            print("\n" + "="*60)
            print("TESTING SEQUENTIAL ORCHESTRATION")
            print("="*60)
            
            # Test query that should trigger sequential processing
            sequential_query = """
            I need to analyze sales data for Q3, create a comprehensive report, and then have it reviewed for quality. 
            This should be done step by step where each agent builds on the previous work.
            """
            
            print(f"Query: {sequential_query}")
            
            # Send to orchestration service
            payload = {
                "query": sequential_query,
                "context": {
                    "user_id": "test_user",
                    "session_id": "test_session_sequential",
                    "preferred_strategy": "sequential"
                }
            }
            
            response = requests.post(f"{ORCHESTRATION_URL}/api/strands-orchestration/orchestrate", 
                                   json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print(f"Response: {json.dumps(result, indent=2)}")
                
                # Validate sequential characteristics
                if result.get("strategy") == "sequential":
                    self.log_test("Sequential Strategy Detection", "PASS", "LLM correctly identified sequential strategy")
                else:
                    self.log_test("Sequential Strategy Detection", "FAIL", f"Expected 'sequential', got '{result.get('strategy')}'")
                
                if result.get("agent_sequence"):
                    self.log_test("Sequential Agent Sequence", "PASS", f"Generated sequence: {result.get('agent_sequence')}")
                else:
                    self.log_test("Sequential Agent Sequence", "FAIL", "No agent sequence generated")
                
                if result.get("execution_plan"):
                    self.log_test("Sequential Execution Plan", "PASS", "Execution plan generated")
                else:
                    self.log_test("Sequential Execution Plan", "FAIL", "No execution plan generated")
                
                return True
            else:
                self.log_test("Sequential Orchestration", "FAIL", f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Sequential Orchestration", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_parallel_orchestration(self) -> bool:
        """Test parallel task orchestration"""
        try:
            print("\n" + "="*60)
            print("TESTING PARALLEL ORCHESTRATION")
            print("="*60)
            
            # Test query that should trigger parallel processing
            parallel_query = """
            I need to analyze three different datasets simultaneously: customer data, sales data, and product data. 
            Each analysis should be done independently and in parallel for faster results.
            """
            
            print(f"Query: {parallel_query}")
            
            # Send to orchestration service
            payload = {
                "query": parallel_query,
                "context": {
                    "user_id": "test_user",
                    "session_id": "test_session_parallel",
                    "preferred_strategy": "parallel"
                }
            }
            
            response = requests.post(f"{ORCHESTRATION_URL}/api/strands-orchestration/orchestrate", 
                                   json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print(f"Response: {json.dumps(result, indent=2)}")
                
                # Validate parallel characteristics
                if result.get("strategy") == "parallel":
                    self.log_test("Parallel Strategy Detection", "PASS", "LLM correctly identified parallel strategy")
                else:
                    self.log_test("Parallel Strategy Detection", "FAIL", f"Expected 'parallel', got '{result.get('strategy')}'")
                
                if result.get("agent_parallel_groups"):
                    self.log_test("Parallel Agent Groups", "PASS", f"Generated parallel groups: {result.get('agent_parallel_groups')}")
                else:
                    self.log_test("Parallel Agent Groups", "FAIL", "No parallel groups generated")
                
                if result.get("execution_plan"):
                    self.log_test("Parallel Execution Plan", "PASS", "Execution plan generated")
                else:
                    self.log_test("Parallel Execution Plan", "FAIL", "No execution plan generated")
                
                return True
            else:
                self.log_test("Parallel Orchestration", "FAIL", f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Parallel Orchestration", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_context_aware_detection(self) -> bool:
        """Test LLM's ability to detect strategy from context"""
        try:
            print("\n" + "="*60)
            print("TESTING CONTEXT-AWARE STRATEGY DETECTION")
            print("="*60)
            
            test_cases = [
                {
                    "query": "Process this data pipeline: extract, transform, load, validate",
                    "expected_strategy": "sequential",
                    "description": "Pipeline processing should be sequential"
                },
                {
                    "query": "Analyze these three independent reports simultaneously",
                    "expected_strategy": "parallel", 
                    "description": "Independent analysis should be parallel"
                },
                {
                    "query": "First research the topic, then write a paper, then review it",
                    "expected_strategy": "sequential",
                    "description": "Step-by-step process should be sequential"
                },
                {
                    "query": "Check all these different systems at the same time",
                    "expected_strategy": "parallel",
                    "description": "Simultaneous checking should be parallel"
                }
            ]
            
            correct_detections = 0
            
            for i, test_case in enumerate(test_cases, 1):
                print(f"\nTest Case {i}: {test_case['description']}")
                print(f"Query: {test_case['query']}")
                
                payload = {
                    "query": test_case['query'],
                    "context": {
                        "user_id": "test_user",
                        "session_id": f"test_context_{i}",
                        "auto_detect_strategy": True
                    }
                }
                
                response = requests.post(f"{ORCHESTRATION_URL}/api/orchestrate", 
                                       json=payload, timeout=15)
                
                if response.status_code == 200:
                    result = response.json()
                    detected_strategy = result.get("strategy")
                    expected_strategy = test_case['expected_strategy']
                    
                    if detected_strategy == expected_strategy:
                        self.log_test(f"Context Detection {i}", "PASS", 
                                    f"Correctly detected {detected_strategy} for: {test_case['description']}")
                        correct_detections += 1
                    else:
                        self.log_test(f"Context Detection {i}", "FAIL", 
                                    f"Expected {expected_strategy}, got {detected_strategy}")
                else:
                    self.log_test(f"Context Detection {i}", "FAIL", 
                                f"HTTP {response.status_code}: {response.text}")
            
            accuracy = (correct_detections / len(test_cases)) * 100
            self.log_test("Overall Context Detection", "PASS" if accuracy >= 75 else "FAIL", 
                        f"Accuracy: {accuracy:.1f}% ({correct_detections}/{len(test_cases)})")
            
            return accuracy >= 75
            
        except Exception as e:
            self.log_test("Context Detection", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_actual_execution(self) -> bool:
        """Test actual execution of orchestrated tasks"""
        try:
            print("\n" + "="*60)
            print("TESTING ACTUAL TASK EXECUTION")
            print("="*60)
            
            if not self.agent_ids:
                self.log_test("Task Execution", "SKIP", "No agents available for execution")
                return False
            
            # Test sequential execution
            sequential_payload = {
                "query": "Calculate 2+2, then write the result to a file, then review the file",
                "context": {
                    "user_id": "test_user",
                    "session_id": "test_execution_sequential",
                    "strategy": "sequential",
                    "agent_ids": self.agent_ids[:3]  # Use first 3 agents
                }
            }
            
            print("Testing Sequential Execution...")
            response = requests.post(f"{ORCHESTRATION_URL}/api/strands-orchestration/orchestrate", 
                                   json=sequential_payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                print(f"Sequential Execution Result: {json.dumps(result, indent=2)}")
                self.log_test("Sequential Execution", "PASS", "Sequential task executed successfully")
            else:
                self.log_test("Sequential Execution", "FAIL", f"HTTP {response.status_code}: {response.text}")
            
            # Test parallel execution
            parallel_payload = {
                "query": "Analyze three different numbers: 10, 20, 30",
                "context": {
                    "user_id": "test_user", 
                    "session_id": "test_execution_parallel",
                    "strategy": "parallel",
                    "agent_ids": self.agent_ids[:3]  # Use first 3 agents
                }
            }
            
            print("\nTesting Parallel Execution...")
            response = requests.post(f"{ORCHESTRATION_URL}/api/strands-orchestration/orchestrate", 
                                   json=parallel_payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                print(f"Parallel Execution Result: {json.dumps(result, indent=2)}")
                self.log_test("Parallel Execution", "PASS", "Parallel task executed successfully")
                return True
            else:
                self.log_test("Parallel Execution", "FAIL", f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Task Execution", "FAIL", f"Exception: {str(e)}")
            return False
    
    def cleanup_test_agents(self):
        """Clean up test agents"""
        try:
            for agent_id in self.agent_ids:
                response = requests.delete(f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent_id}", timeout=5)
                if response.status_code == 200:
                    self.log_test("Agent Cleanup", "PASS", f"Deleted agent {agent_id}")
                else:
                    self.log_test("Agent Cleanup", "WARN", f"Failed to delete agent {agent_id}")
        except Exception as e:
            self.log_test("Agent Cleanup", "WARN", f"Cleanup error: {str(e)}")
    
    def run_all_tests(self):
        """Run all orchestration tests"""
        print("🚀 STARTING ORCHESTRATION VALIDATION TESTS")
        print("="*60)
        
        # Test 1: Service Health
        if not self.check_service_health():
            print("❌ Service not available. Please start the orchestration service.")
            return False
        
        # Test 2: Create Test Agents
        if not self.create_test_agents():
            print("❌ Failed to create test agents.")
            return False
        
        # Test 3: Sequential Orchestration
        sequential_ok = self.test_sequential_orchestration()
        
        # Test 4: Parallel Orchestration  
        parallel_ok = self.test_parallel_orchestration()
        
        # Test 5: Context-Aware Detection
        context_ok = self.test_context_aware_detection()
        
        # Test 6: Actual Execution
        execution_ok = self.test_actual_execution()
        
        # Cleanup
        self.cleanup_test_agents()
        
        # Summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['status'] == 'PASS'])
        failed_tests = len([r for r in self.test_results if r['status'] == 'FAIL'])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Key Results
        print("\nKEY RESULTS:")
        print(f"✅ Sequential Orchestration: {'PASS' if sequential_ok else 'FAIL'}")
        print(f"✅ Parallel Orchestration: {'PASS' if parallel_ok else 'FAIL'}")
        print(f"✅ Context-Aware Detection: {'PASS' if context_ok else 'FAIL'}")
        print(f"✅ Actual Execution: {'PASS' if execution_ok else 'FAIL'}")
        
        overall_success = sequential_ok and parallel_ok and context_ok and execution_ok
        print(f"\n🎯 OVERALL RESULT: {'✅ SUCCESS' if overall_success else '❌ FAILURE'}")
        
        return overall_success

if __name__ == "__main__":
    tester = OrchestrationTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)
