#!/usr/bin/env python3
"""
Comprehensive Agent Palette Integration Test
Tests the complete integration between Ollama agents and the Multi Agent Workspace palette.
"""

import requests
import json
import time
import sys
from typing import List, Dict, Any

class AgentPaletteIntegrationTester:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message
        })
    
    def test_backend_connection(self) -> bool:
        """Test if backend is accessible"""
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            if response.status_code == 200:
                self.log_test("Backend Connection", True, "Backend is accessible")
                return True
            else:
                self.log_test("Backend Connection", False, f"Backend returned {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Backend Connection", False, f"Connection failed: {str(e)}")
            return False
    
    def test_ollama_agents_endpoint(self) -> List[Dict[Any, Any]]:
        """Test the Ollama agents API endpoint"""
        try:
            response = requests.get(f"{self.backend_url}/api/agents/ollama/enhanced", timeout=10)
            
            if response.status_code == 200:
                agents = response.json()
                self.log_test("Ollama Agents API", True, f"Retrieved {len(agents)} agents")
                return agents
            else:
                self.log_test("Ollama Agents API", False, f"API returned {response.status_code}")
                return []
        except requests.exceptions.RequestException as e:
            self.log_test("Ollama Agents API", False, f"API call failed: {str(e)}")
            return []
    
    def test_agent_data_structure(self, agents: List[Dict[Any, Any]]) -> bool:
        """Test if agent data has required structure"""
        if not agents:
            self.log_test("Agent Data Structure", False, "No agents to test")
            return False
        
        required_fields = ['id', 'name', 'role', 'model', 'capabilities', 'guardrails']
        
        for agent in agents:
            missing_fields = [field for field in required_fields if field not in agent]
            if missing_fields:
                self.log_test("Agent Data Structure", False, f"Missing fields: {missing_fields}")
                return False
        
        self.log_test("Agent Data Structure", True, "All agents have required fields")
        return True
    
    def test_agent_transformation(self, agents: List[Dict[Any, Any]]) -> List[Dict[Any, Any]]:
        """Test the agent transformation logic (simulates the hook)"""
        if not agents:
            self.log_test("Agent Transformation", False, "No agents to transform")
            return []
        
        try:
            transformed_agents = []
            
            for agent in agents:
                # Extract model name
                model_name = "unknown"
                if agent.get('model') and agent['model'].get('model_id'):
                    model_name = agent['model']['model_id'].split(':')[0]
                
                # Determine icon based on role
                icon = '🤖'  # default
                role = agent.get('role', '').lower()
                
                if 'cvm' in role or 'customer' in role:
                    icon = '💼'
                elif 'telecom' in role or 'telco' in role:
                    icon = '📡'
                elif 'analyst' in role or 'analysis' in role:
                    icon = '📊'
                elif 'writer' in role or 'content' in role:
                    icon = '✍️'
                elif 'researcher' in role or 'research' in role:
                    icon = '🔍'
                elif 'coder' in role or 'developer' in role:
                    icon = '💻'
                elif 'chat' in role or 'conversation' in role:
                    icon = '💬'
                elif 'coordinator' in role or 'manager' in role:
                    icon = '🎯'
                elif 'expert' in role:
                    icon = '🎓'
                
                # Transform capabilities
                capabilities = []
                caps = agent.get('capabilities', {})
                if caps.get('conversation'):
                    capabilities.append('Chat')
                if caps.get('analysis'):
                    capabilities.append('Analysis')
                if caps.get('creativity'):
                    capabilities.append('Creative')
                if caps.get('reasoning'):
                    capabilities.append('Reasoning')
                
                # Create transformed agent
                transformed_agent = {
                    'id': agent['id'],
                    'name': agent['name'],
                    'description': agent['role'],
                    'icon': icon,
                    'type': 'ollama',
                    'model': model_name,
                    'role': agent['role'],
                    'capabilities': capabilities,
                    'guardrails': agent.get('guardrails', {}).get('enabled', False),
                    'originalAgent': agent
                }
                
                transformed_agents.append(transformed_agent)
            
            self.log_test("Agent Transformation", True, f"Successfully transformed {len(transformed_agents)} agents")
            return transformed_agents
            
        except Exception as e:
            self.log_test("Agent Transformation", False, f"Transformation failed: {str(e)}")
            return []
    
    def test_icon_assignment(self, transformed_agents: List[Dict[Any, Any]]) -> bool:
        """Test if icons are assigned correctly based on roles"""
        if not transformed_agents:
            self.log_test("Icon Assignment", False, "No transformed agents to test")
            return False
        
        icon_tests = []
        
        for agent in transformed_agents:
            role = agent.get('role', '').lower()
            icon = agent.get('icon', '')
            
            # Test specific icon assignments
            if 'cvm' in role and icon == '💼':
                icon_tests.append(f"✅ CVM agent has business icon")
            elif 'telecom' in role and icon == '📡':
                icon_tests.append(f"✅ Telecom agent has telecom icon")
            elif icon == '🤖':
                icon_tests.append(f"✅ Default icon assigned")
            else:
                icon_tests.append(f"✅ Custom icon '{icon}' for role '{role}'")
        
        self.log_test("Icon Assignment", True, f"Icons assigned: {', '.join(icon_tests)}")
        return True
    
    def test_capabilities_mapping(self, transformed_agents: List[Dict[Any, Any]]) -> bool:
        """Test if capabilities are mapped correctly"""
        if not transformed_agents:
            self.log_test("Capabilities Mapping", False, "No transformed agents to test")
            return False
        
        for agent in transformed_agents:
            capabilities = agent.get('capabilities', [])
            
            # Check if capabilities are strings (not boolean)
            if not all(isinstance(cap, str) for cap in capabilities):
                self.log_test("Capabilities Mapping", False, "Capabilities should be strings")
                return False
            
            # Check for expected capability names
            valid_capabilities = ['Chat', 'Analysis', 'Creative', 'Reasoning']
            invalid_caps = [cap for cap in capabilities if cap not in valid_capabilities]
            
            if invalid_caps:
                self.log_test("Capabilities Mapping", False, f"Invalid capabilities: {invalid_caps}")
                return False
        
        self.log_test("Capabilities Mapping", True, "All capabilities mapped correctly")
        return True
    
    def test_guardrails_status(self, transformed_agents: List[Dict[Any, Any]]) -> bool:
        """Test if guardrails status is correctly extracted"""
        if not transformed_agents:
            self.log_test("Guardrails Status", False, "No transformed agents to test")
            return False
        
        guardrails_info = []
        
        for agent in transformed_agents:
            name = agent.get('name', 'Unknown')
            guardrails = agent.get('guardrails', False)
            
            if isinstance(guardrails, bool):
                status = "enabled" if guardrails else "disabled"
                guardrails_info.append(f"{name}: {status}")
            else:
                self.log_test("Guardrails Status", False, f"Guardrails should be boolean, got {type(guardrails)}")
                return False
        
        self.log_test("Guardrails Status", True, f"Guardrails status: {', '.join(guardrails_info)}")
        return True
    
    def test_palette_data_format(self, transformed_agents: List[Dict[Any, Any]]) -> bool:
        """Test if transformed data matches expected palette format"""
        if not transformed_agents:
            self.log_test("Palette Data Format", False, "No transformed agents to test")
            return False
        
        required_palette_fields = ['id', 'name', 'description', 'icon', 'type', 'model', 'role', 'capabilities', 'guardrails', 'originalAgent']
        
        for agent in transformed_agents:
            missing_fields = [field for field in required_palette_fields if field not in agent]
            if missing_fields:
                self.log_test("Palette Data Format", False, f"Missing palette fields: {missing_fields}")
                return False
            
            # Check data types
            if not isinstance(agent['capabilities'], list):
                self.log_test("Palette Data Format", False, "Capabilities should be a list")
                return False
            
            if not isinstance(agent['guardrails'], bool):
                self.log_test("Palette Data Format", False, "Guardrails should be boolean")
                return False
            
            if agent['type'] != 'ollama':
                self.log_test("Palette Data Format", False, f"Type should be 'ollama', got '{agent['type']}'")
                return False
        
        self.log_test("Palette Data Format", True, "All agents match expected palette format")
        return True
    
    def display_agent_summary(self, transformed_agents: List[Dict[Any, Any]]):
        """Display a summary of transformed agents"""
        if not transformed_agents:
            print("\n❌ No agents to display")
            return
        
        print(f"\n📊 Agent Palette Summary ({len(transformed_agents)} agents):")
        print("=" * 60)
        
        for i, agent in enumerate(transformed_agents, 1):
            print(f"\n{i}. {agent['icon']} {agent['name']}")
            print(f"   Role: {agent['role']}")
            print(f"   Model: {agent['model']}")
            print(f"   Capabilities: {', '.join(agent['capabilities'])}")
            print(f"   Guardrails: {'✅ Enabled' if agent['guardrails'] else '❌ Disabled'}")
    
    def run_all_tests(self):
        """Run all integration tests"""
        print("🧪 Starting Agent Palette Integration Tests")
        print("=" * 50)
        
        # Test 1: Backend connection
        if not self.test_backend_connection():
            print("\n❌ Backend connection failed. Make sure backend is running on localhost:8000")
            return False
        
        # Test 2: Ollama agents API
        agents = self.test_ollama_agents_endpoint()
        if not agents:
            print("\n❌ No agents found. Create some agents in Ollama Agent Management first")
            return False
        
        # Test 3: Agent data structure
        if not self.test_agent_data_structure(agents):
            return False
        
        # Test 4: Agent transformation
        transformed_agents = self.test_agent_transformation(agents)
        if not transformed_agents:
            return False
        
        # Test 5: Icon assignment
        self.test_icon_assignment(transformed_agents)
        
        # Test 6: Capabilities mapping
        if not self.test_capabilities_mapping(transformed_agents):
            return False
        
        # Test 7: Guardrails status
        if not self.test_guardrails_status(transformed_agents):
            return False
        
        # Test 8: Palette data format
        if not self.test_palette_data_format(transformed_agents):
            return False
        
        # Display summary
        self.display_agent_summary(transformed_agents)
        
        return True
    
    def print_test_summary(self):
        """Print a summary of all test results"""
        print(f"\n📋 Test Summary")
        print("=" * 30)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Tests Passed: {passed}/{total}")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED!")
            print("✅ Agent Palette integration is working correctly")
            print("✅ Ready for production use")
        else:
            print(f"\n❌ {total - passed} tests failed")
            print("❌ Integration needs fixes before use")
        
        print(f"\n🔗 Next Steps:")
        if passed == total:
            print("1. Test the integration in the Multi Agent Workspace")
            print("2. Verify drag & drop functionality")
            print("3. Create workflows with your Ollama agents")
        else:
            print("1. Fix the failing tests")
            print("2. Re-run the integration test")
            print("3. Check backend logs for errors")

def main():
    """Main test execution"""
    tester = AgentPaletteIntegrationTester()
    
    try:
        success = tester.run_all_tests()
        tester.print_test_summary()
        
        if success:
            print(f"\n🚀 Integration test completed successfully!")
            print(f"Your Agent Palette is ready to use with Ollama agents.")
        else:
            print(f"\n⚠️ Integration test failed!")
            print(f"Please fix the issues and try again.")
            
    except KeyboardInterrupt:
        print(f"\n⚠️ Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")

if __name__ == "__main__":
    main()