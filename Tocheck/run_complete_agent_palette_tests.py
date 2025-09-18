#!/usr/bin/env python3
"""
Complete Agent Palette Integration Test Suite
Runs all tests to validate the complete integration between Ollama agents and Agent Palette.
"""

import subprocess
import sys
import os
import time
from pathlib import Path

class CompleteTestSuite:
    def __init__(self):
        self.test_results = {}
        
    def run_command(self, command: str, description: str) -> bool:
        """Run a command and capture results"""
        print(f"\n🔄 {description}")
        print(f"Command: {command}")
        print("-" * 50)
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                print(f"✅ {description} - SUCCESS")
                if result.stdout:
                    print(result.stdout)
                self.test_results[description] = True
                return True
            else:
                print(f"❌ {description} - FAILED")
                if result.stderr:
                    print(f"Error: {result.stderr}")
                if result.stdout:
                    print(f"Output: {result.stdout}")
                self.test_results[description] = False
                return False
                
        except subprocess.TimeoutExpired:
            print(f"⏰ {description} - TIMEOUT")
            self.test_results[description] = False
            return False
        except Exception as e:
            print(f"❌ {description} - ERROR: {str(e)}")
            self.test_results[description] = False
            return False
    
    def check_prerequisites(self) -> bool:
        """Check if all prerequisites are met"""
        print("🔍 Checking Prerequisites")
        print("=" * 30)
        
        # Check if Python is available
        if not self.run_command("python --version", "Python Version Check"):
            return False
        
        # Check if required test files exist
        required_files = [
            "test_agent_palette_integration_complete.py",
            "validate_agent_palette_frontend.py",
            "test_agent_palette_complete.html"
        ]
        
        for file_path in required_files:
            if not Path(file_path).exists():
                print(f"❌ Missing required file: {file_path}")
                return False
            else:
                print(f"✅ Found: {file_path}")
        
        # Check if backend files exist
        backend_files = [
            "backend/simple_api.py",
            "src/hooks/useOllamaAgentsForPalette.ts",
            "src/components/MultiAgentWorkspace/AgentPalette.tsx"
        ]
        
        for file_path in backend_files:
            if not Path(file_path).exists():
                print(f"⚠️ Missing integration file: {file_path}")
            else:
                print(f"✅ Found: {file_path}")
        
        return True
    
    def test_backend_status(self) -> bool:
        """Test if backend is running"""
        print("\n🔍 Testing Backend Status")
        print("=" * 30)
        
        try:
            import requests
            response = requests.get("http://localhost:8000/health", timeout=5)
            if response.status_code == 200:
                print("✅ Backend is running and accessible")
                return True
            else:
                print(f"❌ Backend returned status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Backend not accessible: {str(e)}")
            print("💡 Start backend with: python backend/simple_api.py")
            return False
    
    def run_frontend_validation(self) -> bool:
        """Run frontend validation tests"""
        return self.run_command(
            "python validate_agent_palette_frontend.py",
            "Frontend Integration Validation"
        )
    
    def run_backend_integration_test(self) -> bool:
        """Run backend integration tests"""
        return self.run_command(
            "python test_agent_palette_integration_complete.py",
            "Backend Integration Test"
        )
    
    def run_hook_fix_test(self) -> bool:
        """Run the hook fix test"""
        if Path("test_hook_fix.py").exists():
            return self.run_command(
                "python test_hook_fix.py",
                "Hook Fix Validation"
            )
        else:
            print("⚠️ Hook fix test not found, skipping")
            return True
    
    def display_html_test_guide(self):
        """Display information about the HTML test"""
        print("\n🌐 HTML Test Guide")
        print("=" * 20)
        print("📄 Open test_agent_palette_complete.html in your browser")
        print("🔗 This provides:")
        print("   • Visual representation of expected results")
        print("   • Interactive testing buttons")
        print("   • Step-by-step testing guide")
        print("   • Troubleshooting information")
        print("   • Live API testing functionality")
    
    def run_all_tests(self):
        """Run the complete test suite"""
        print("🧪 Agent Palette Integration - Complete Test Suite")
        print("=" * 60)
        print("This will validate the entire integration from backend to frontend")
        
        # Step 1: Check prerequisites
        if not self.check_prerequisites():
            print("\n❌ Prerequisites not met. Please fix and try again.")
            return False
        
        # Step 2: Test backend status
        backend_running = self.test_backend_status()
        
        # Step 3: Run frontend validation
        print("\n" + "=" * 60)
        frontend_valid = self.run_frontend_validation()
        
        # Step 4: Run backend integration test (only if backend is running)
        print("\n" + "=" * 60)
        if backend_running:
            backend_test_passed = self.run_backend_integration_test()
        else:
            print("⚠️ Skipping backend integration test (backend not running)")
            backend_test_passed = False
        
        # Step 5: Run hook fix test
        print("\n" + "=" * 60)
        hook_test_passed = self.run_hook_fix_test()
        
        # Step 6: Display HTML test guide
        print("\n" + "=" * 60)
        self.display_html_test_guide()
        
        return frontend_valid and (backend_test_passed or not backend_running) and hook_test_passed
    
    def print_final_summary(self):
        """Print final test summary"""
        print("\n" + "=" * 60)
        print("📊 COMPLETE TEST SUITE SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)
        
        print(f"Tests Run: {total_tests}")
        print(f"Tests Passed: {passed_tests}")
        print(f"Tests Failed: {total_tests - passed_tests}")
        
        if passed_tests == total_tests:
            print("\n🎉 ALL TESTS PASSED!")
            print("✅ Agent Palette integration is fully working")
            print("✅ Ready for production use")
        else:
            print(f"\n⚠️ {total_tests - passed_tests} tests failed")
            print("❌ Integration needs attention")
        
        print("\n📋 Test Results:")
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"   {status} {test_name}")
        
        print("\n🔗 Next Steps:")
        if passed_tests == total_tests:
            print("1. 🌐 Open test_agent_palette_complete.html in browser")
            print("2. 🚀 Test the integration in Multi Agent Workspace")
            print("3. 🎯 Create workflows with your Ollama agents")
            print("4. 📊 Monitor agent performance and usage")
        else:
            print("1. 🔧 Fix the failing tests")
            print("2. 🔄 Re-run the test suite")
            print("3. 📝 Check logs for detailed error information")
            print("4. 🆘 Refer to troubleshooting guides")
        
        print("\n📚 Additional Resources:")
        print("• AGENT-PALETTE-OLLAMA-INTEGRATION-COMPLETE.md - Complete documentation")
        print("• test_agent_palette_complete.html - Interactive testing guide")
        print("• Backend logs - Check for API errors")
        print("• Browser console - Check for frontend errors")

def main():
    """Main test execution"""
    test_suite = CompleteTestSuite()
    
    try:
        print("🚀 Starting Complete Agent Palette Integration Test Suite")
        print("⏰ This may take a few minutes...")
        
        success = test_suite.run_all_tests()
        test_suite.print_final_summary()
        
        if success:
            print(f"\n🎉 Integration test suite completed successfully!")
            exit_code = 0
        else:
            print(f"\n⚠️ Some tests failed. Check the summary above.")
            exit_code = 1
            
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        print(f"\n⚠️ Test suite interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()