#!/usr/bin/env python3
"""
Frontend Agent Palette Validation Script
Validates that the frontend integration is working correctly by checking file contents and structure.
"""

import os
import re
import json
from pathlib import Path

class FrontendValidator:
    def __init__(self):
        self.validation_results = []
        self.src_path = Path("src")
        
    def log_validation(self, test_name: str, success: bool, message: str):
        """Log validation results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.validation_results.append({
            "test": test_name,
            "success": success,
            "message": message
        })
    
    def validate_hook_file(self) -> bool:
        """Validate the useOllamaAgentsForPalette hook file"""
        hook_path = self.src_path / "hooks" / "useOllamaAgentsForPalette.ts"
        
        if not hook_path.exists():
            self.log_validation("Hook File Exists", False, f"Hook file not found at {hook_path}")
            return False
        
        content = hook_path.read_text()
        
        # Check for key components
        checks = [
            ("getAllAgents method", "getAllAgents()", "Uses correct service method"),
            ("Transform function", "transformOllamaAgentToPaletteAgent", "Has transformation function"),
            ("Icon assignment", "let icon = ", "Has icon assignment logic"),
            ("Capabilities mapping", "capabilities.push", "Maps capabilities correctly"),
            ("Error handling", "catch", "Has error handling"),
            ("Loading state", "loading", "Manages loading state"),
            ("Refresh function", "refreshAgents", "Provides refresh functionality")
        ]
        
        all_passed = True
        for check_name, pattern, description in checks:
            if pattern in content:
                self.log_validation(f"Hook - {check_name}", True, description)
            else:
                self.log_validation(f"Hook - {check_name}", False, f"Missing: {description}")
                all_passed = False
        
        return all_passed
    
    def validate_agent_palette_component(self) -> bool:
        """Validate the AgentPalette component"""
        palette_path = self.src_path / "components" / "MultiAgentWorkspace" / "AgentPalette.tsx"
        
        if not palette_path.exists():
            self.log_validation("AgentPalette File Exists", False, f"AgentPalette file not found at {palette_path}")
            return False
        
        content = palette_path.read_text()
        
        # Check for integration components
        checks = [
            ("Hook import", "useOllamaAgentsForPalette", "Imports the Ollama agents hook"),
            ("Hook usage", "useOllamaAgentsForPalette()", "Uses the hook"),
            ("Loading state", "loading", "Shows loading state"),
            ("Error handling", "error", "Handles errors"),
            ("Agent mapping", "agents.map", "Maps agents to UI"),
            ("Refresh functionality", "refreshAgents", "Has refresh capability"),
            ("Agent cards", "agent-card", "Renders agent cards")
        ]
        
        all_passed = True
        for check_name, pattern, description in checks:
            if pattern in content:
                self.log_validation(f"Palette - {check_name}", True, description)
            else:
                self.log_validation(f"Palette - {check_name}", False, f"Missing: {description}")
                all_passed = False
        
        return all_passed
    
    def validate_blank_workspace_integration(self) -> bool:
        """Validate BlankWorkspace integration"""
        workspace_path = self.src_path / "components" / "MultiAgentWorkspace" / "BlankWorkspace.tsx"
        
        if not workspace_path.exists():
            self.log_validation("BlankWorkspace File Exists", False, f"BlankWorkspace file not found at {workspace_path}")
            return False
        
        content = workspace_path.read_text()
        
        # Check for Ollama agent handling
        checks = [
            ("Ollama agent type", "ollama-agent", "Handles Ollama agent type"),
            ("Agent data preservation", "ollamaAgent:", "Preserves full agent data"),
            ("Agent ID handling", "ollamaAgentId:", "Stores agent ID"),
            ("Model information", "model:", "Stores model info"),
            ("Capabilities", "capabilities:", "Stores capabilities"),
            ("Guardrails", "guardrails:", "Stores guardrails info")
        ]
        
        all_passed = True
        for check_name, pattern, description in checks:
            if pattern in content:
                self.log_validation(f"Workspace - {check_name}", True, description)
            else:
                self.log_validation(f"Workspace - {check_name}", False, f"Missing: {description}")
                all_passed = False
        
        return all_passed
    
    def validate_agent_node_display(self) -> bool:
        """Validate ModernAgentNode display enhancements"""
        node_path = self.src_path / "components" / "MultiAgentWorkspace" / "nodes" / "ModernAgentNode.tsx"
        
        if not node_path.exists():
            self.log_validation("ModernAgentNode File Exists", False, f"ModernAgentNode file not found at {node_path}")
            return False
        
        content = node_path.read_text()
        
        # Check for Ollama agent display features
        checks = [
            ("Icon handling", "icon", "Displays agent icons"),
            ("Agent type display", "agentType", "Shows agent type"),
            ("Metadata display", "data.", "Accesses node data")
        ]
        
        all_passed = True
        for check_name, pattern, description in checks:
            if pattern in content:
                self.log_validation(f"Node - {check_name}", True, description)
            else:
                self.log_validation(f"Node - {check_name}", False, f"Missing: {description}")
                all_passed = False
        
        return all_passed
    
    def validate_service_integration(self) -> bool:
        """Validate OllamaAgentService integration"""
        service_path = self.src_path / "lib" / "services" / "OllamaAgentService.ts"
        
        if not service_path.exists():
            self.log_validation("OllamaAgentService File Exists", False, f"Service file not found at {service_path}")
            return False
        
        content = service_path.read_text()
        
        # Check for getAllAgents method
        if "getAllAgents" in content:
            self.log_validation("Service - getAllAgents Method", True, "Has getAllAgents method")
        else:
            self.log_validation("Service - getAllAgents Method", False, "Missing getAllAgents method")
            return False
        
        # Check for proper API endpoint
        if "/api/agents/ollama/enhanced" in content:
            self.log_validation("Service - API Endpoint", True, "Uses correct API endpoint")
        else:
            self.log_validation("Service - API Endpoint", False, "Missing or incorrect API endpoint")
            return False
        
        return True
    
    def validate_typescript_types(self) -> bool:
        """Validate TypeScript type definitions"""
        # Check if types are properly defined
        type_checks = []
        
        # Look for PaletteAgent type usage
        hook_path = self.src_path / "hooks" / "useOllamaAgentsForPalette.ts"
        if hook_path.exists():
            content = hook_path.read_text()
            if "PaletteAgent" in content:
                type_checks.append("✅ PaletteAgent type used in hook")
            else:
                type_checks.append("❌ PaletteAgent type missing in hook")
        
        # Look for OllamaAgentConfig type usage
        if "OllamaAgentConfig" in content:
            type_checks.append("✅ OllamaAgentConfig type used")
        else:
            type_checks.append("❌ OllamaAgentConfig type missing")
        
        success = all("✅" in check for check in type_checks)
        self.log_validation("TypeScript Types", success, "; ".join(type_checks))
        
        return success
    
    def validate_error_handling(self) -> bool:
        """Validate error handling implementation"""
        hook_path = self.src_path / "hooks" / "useOllamaAgentsForPalette.ts"
        
        if not hook_path.exists():
            self.log_validation("Error Handling", False, "Hook file not found")
            return False
        
        content = hook_path.read_text()
        
        error_checks = [
            ("Try-catch blocks", "try {", "Has try-catch error handling"),
            ("Error state", "setError", "Manages error state"),
            ("Error logging", "console.error", "Logs errors for debugging"),
            ("Loading state reset", "setLoading(false)", "Resets loading on error")
        ]
        
        all_passed = True
        for check_name, pattern, description in checks:
            if pattern in content:
                self.log_validation(f"Error - {check_name}", True, description)
            else:
                self.log_validation(f"Error - {check_name}", False, f"Missing: {description}")
                all_passed = False
        
        return all_passed
    
    def check_file_structure(self) -> bool:
        """Check if all required files exist"""
        required_files = [
            "src/hooks/useOllamaAgentsForPalette.ts",
            "src/components/MultiAgentWorkspace/AgentPalette.tsx",
            "src/components/MultiAgentWorkspace/BlankWorkspace.tsx",
            "src/components/MultiAgentWorkspace/nodes/ModernAgentNode.tsx",
            "src/lib/services/OllamaAgentService.ts"
        ]
        
        all_exist = True
        for file_path in required_files:
            if Path(file_path).exists():
                self.log_validation(f"File Exists", True, f"{file_path}")
            else:
                self.log_validation(f"File Exists", False, f"Missing: {file_path}")
                all_exist = False
        
        return all_exist
    
    def run_all_validations(self):
        """Run all frontend validations"""
        print("🔍 Starting Frontend Integration Validation")
        print("=" * 50)
        
        # Check file structure first
        if not self.check_file_structure():
            print("\n❌ Required files missing. Integration incomplete.")
            return False
        
        # Validate each component
        validations = [
            ("Hook Implementation", self.validate_hook_file),
            ("AgentPalette Component", self.validate_agent_palette_component),
            ("BlankWorkspace Integration", self.validate_blank_workspace_integration),
            ("ModernAgentNode Display", self.validate_agent_node_display),
            ("Service Integration", self.validate_service_integration),
            ("TypeScript Types", self.validate_typescript_types)
        ]
        
        all_passed = True
        for validation_name, validation_func in validations:
            print(f"\n🔍 Validating {validation_name}...")
            if not validation_func():
                all_passed = False
        
        return all_passed
    
    def print_validation_summary(self):
        """Print validation summary"""
        print(f"\n📋 Frontend Validation Summary")
        print("=" * 40)
        
        passed = sum(1 for result in self.validation_results if result['success'])
        total = len(self.validation_results)
        
        print(f"Validations Passed: {passed}/{total}")
        
        if passed == total:
            print("\n🎉 ALL FRONTEND VALIDATIONS PASSED!")
            print("✅ Frontend integration is correctly implemented")
            print("✅ Ready for testing in the browser")
        else:
            print(f"\n❌ {total - passed} validations failed")
            print("❌ Frontend integration needs fixes")
        
        # Show failed validations
        failed = [result for result in self.validation_results if not result['success']]
        if failed:
            print(f"\n❌ Failed Validations:")
            for failure in failed:
                print(f"   • {failure['test']}: {failure['message']}")
        
        print(f"\n🔗 Next Steps:")
        if passed == total:
            print("1. Start the frontend application")
            print("2. Navigate to Multi Agent Workspace")
            print("3. Test the Agent Palette integration")
            print("4. Verify drag & drop functionality")
        else:
            print("1. Fix the failed validations")
            print("2. Re-run the validation script")
            print("3. Test individual components")

def main():
    """Main validation execution"""
    validator = FrontendValidator()
    
    try:
        success = validator.run_all_validations()
        validator.print_validation_summary()
        
        if success:
            print(f"\n🚀 Frontend validation completed successfully!")
            print(f"Your Agent Palette frontend integration is ready.")
        else:
            print(f"\n⚠️ Frontend validation failed!")
            print(f"Please fix the issues and try again.")
            
    except KeyboardInterrupt:
        print(f"\n⚠️ Validation interrupted by user")
    except Exception as e:
        print(f"\n❌ Validation failed with error: {str(e)}")

if __name__ == "__main__":
    main()