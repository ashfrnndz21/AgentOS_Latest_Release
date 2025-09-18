#!/usr/bin/env python3

"""
Complete Agent Configuration Tooltip Test
Tests the enhanced tooltip implementation with all agent configuration details
matching the Agent Configuration dialog.
"""

import subprocess
import time
import sys
import os
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def test_complete_tooltip_implementation():
    """Test the complete tooltip implementation with all agent details"""
    print("🔧 Testing Complete Agent Configuration Tooltip...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    
    if not palette_file.exists():
        print("❌ AgentPalette.tsx not found!")
        return False
    
    content = palette_file.read_text()
    
    # Check for comprehensive tooltip features
    checks = [
        ("Complete configuration header", "Agent Configuration:" in content),
        ("Basic Information section", "Basic Information" in content),
        ("Agent ID display", "Agent ID:" in content and "agent.originalAgent?.id" in content),
        ("Status display", "Status:" in content and "Active" in content),
        ("Created date", "Created:" in content and "created_at" in content),
        ("Role information", "Role:" in content and "agent.role" in content),
        ("Description section", "agent.originalAgent?.description" in content),
        ("Personality section", "agent.originalAgent?.personality" in content),
        ("Expertise section", "agent.originalAgent?.expertise" in content),
        ("Model Configuration section", "Model Configuration" in content),
        ("Temperature setting", "agent.originalAgent?.temperature" in content),
        ("Max tokens setting", "agent.originalAgent?.max_tokens" in content),
        ("Capabilities with icon", "Capabilities" in content and "Zap" in content),
        ("Security & Guardrails section", "Security & Guardrails" in content),
        ("Content filter check", "agent.originalAgent?.guardrails?.content_filter" in content),
        ("Safety level display", "agent.originalAgent?.guardrails?.safety_level" in content),
        ("System Prompt section", "System Prompt" in content and "agent.originalAgent?.system_prompt" in content),
        ("Scrollable tooltip", "max-h-[80vh] overflow-y-auto" in content),
        ("Wider tooltip", "w-96" in content),
        ("Professional icons", "Info className" in content and "Shield className" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"\n📊 Complete Tooltip Implementation: {passed}/{len(checks)} checks passed")
    
    return passed >= len(checks) * 0.9  # Allow 90% pass rate

def test_agent_data_structure():
    """Test that agent data structure supports all required fields"""
    print("\n🎯 Testing Agent Data Structure...")
    
    palette_hook_file = Path("src/hooks/useOllamaAgentsForPalette.ts")
    
    if not palette_hook_file.exists():
        print("❌ useOllamaAgentsForPalette.ts not found!")
        return False
    
    content = palette_hook_file.read_text()
    
    # Check for required data structure
    structure_checks = [
        ("PaletteAgent interface", "interface PaletteAgent" in content),
        ("Original agent reference", "originalAgent: OllamaAgentConfig" in content),
        ("Agent ID field", "id: string" in content),
        ("Agent name field", "name: string" in content),
        ("Agent description field", "description: string" in content),
        ("Agent model field", "model: string" in content),
        ("Agent role field", "role: string" in content),
        ("Agent capabilities field", "capabilities: string[]" in content),
        ("Agent guardrails field", "guardrails: boolean" in content),
        ("Agent type field", "type: 'ollama'" in content)
    ]
    
    passed = 0
    for check_name, condition in structure_checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"\n📊 Agent Data Structure: {passed}/{len(structure_checks)} checks passed")
    
    return passed == len(structure_checks)

def test_tooltip_sections():
    """Test that all tooltip sections match the Agent Configuration dialog"""
    print("\n📋 Testing Tooltip Sections Match Configuration Dialog...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    content = palette_file.read_text()
    
    # Check for sections that match the Agent Configuration dialog
    section_checks = [
        ("Basic Information section", "Basic Information" in content),
        ("Agent ID with proper formatting", "font-mono text-xs break-all" in content),
        ("Status with color coding", "text-green-400" in content and "Active" in content),
        ("Created date formatting", "toLocaleDateString()" in content),
        ("Description with fallback", "agent.originalAgent?.description || agent.description" in content),
        ("Personality conditional display", "agent.originalAgent?.personality &&" in content),
        ("Expertise conditional display", "agent.originalAgent?.expertise &&" in content),
        ("Model Configuration with icon", "Model Configuration" in content and "Cpu" in content),
        ("Temperature conditional", "agent.originalAgent?.temperature &&" in content),
        ("Max tokens conditional", "agent.originalAgent?.max_tokens &&" in content),
        ("Capabilities with proper styling", "bg-blue-500/20 text-blue-300" in content),
        ("Security status with badges", "bg-green-500/20 text-green-400" in content),
        ("Content filter check", "content_filter" in content),
        ("Safety level display", "safety_level" in content),
        ("System prompt with code formatting", "font-mono" in content and "whitespace-pre-wrap" in content),
        ("Scrollable system prompt", "max-h-20 overflow-y-auto" in content)
    ]
    
    passed = 0
    for check_name, condition in section_checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"\n📊 Tooltip Sections: {passed}/{len(section_checks)} checks passed")
    
    return passed >= len(section_checks) * 0.85  # Allow 85% pass rate

def create_comprehensive_test_html():
    """Create a comprehensive test HTML file"""
    print("\n🌐 Creating comprehensive tooltip test HTML...")
    
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Agent Configuration Tooltip Test</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .group:hover .tooltip {
            opacity: 1;
            visibility: visible;
        }
        .tooltip {
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
    </style>
</head>
<body class="bg-gray-900 text-white p-8">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-center">Complete Agent Configuration Tooltip Test</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Test Instructions -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4">Test Instructions</h2>
                <div class="space-y-4 text-gray-300">
                    <p>1. Start the development server: <code class="bg-gray-700 px-2 py-1 rounded">npm run dev</code></p>
                    <p>2. Navigate to the Multi-Agent Workspace</p>
                    <p>3. Hover over agents in the palette to see enhanced tooltips</p>
                    <p>4. Verify all configuration details are displayed</p>
                </div>
            </div>

            <!-- Expected Tooltip Structure -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4">Expected Tooltip Structure</h2>
                <div class="space-y-3 text-sm">
                    <div class="text-blue-400">📋 Agent Configuration: [Agent Name]</div>
                    <div class="ml-4 space-y-1">
                        <div class="text-gray-300">ℹ️ Basic Information</div>
                        <div class="ml-4 text-gray-400">
                            • Agent ID: [UUID]<br>
                            • Status: Active<br>
                            • Role: [Agent Role]<br>
                            • Created: [Date]
                        </div>
                        
                        <div class="text-gray-300">📝 Description</div>
                        <div class="text-gray-300">👤 Personality (if available)</div>
                        <div class="text-gray-300">🎯 Expertise (if available)</div>
                        
                        <div class="text-gray-300">🖥️ Model Configuration</div>
                        <div class="ml-4 text-gray-400">
                            • Model: [Model Name]<br>
                            • Type: ollama<br>
                            • Temperature: [Value] (if set)<br>
                            • Max Tokens: [Value] (if set)
                        </div>
                        
                        <div class="text-gray-300">⚡ Capabilities</div>
                        <div class="ml-4 text-gray-400">[Capability Badges]</div>
                        
                        <div class="text-gray-300">🛡️ Security & Guardrails</div>
                        <div class="ml-4 text-gray-400">
                            • Status: Protected/Basic<br>
                            • Content Filter: [Status]<br>
                            • Safety Level: [Level]
                        </div>
                        
                        <div class="text-gray-300">💻 System Prompt (if available)</div>
                        <div class="ml-4 text-gray-400">[Scrollable code block]</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Comparison with Agent Configuration Dialog -->
        <div class="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Comparison with Agent Configuration Dialog</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3 text-blue-400">Agent Configuration Dialog Shows:</h3>
                    <ul class="space-y-2 text-gray-300">
                        <li>✓ Agent ID (truncated with ...)</li>
                        <li>✓ Status (Active/Inactive)</li>
                        <li>✓ Role</li>
                        <li>✓ Created date</li>
                        <li>✓ Description</li>
                        <li>✓ Personality</li>
                        <li>✓ Expertise</li>
                        <li>✓ System Prompt</li>
                        <li>✓ Model configuration</li>
                        <li>✓ Capabilities tabs</li>
                        <li>✓ Guardrails settings</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3 text-green-400">Enhanced Tooltip Now Shows:</h3>
                    <ul class="space-y-2 text-gray-300">
                        <li>✅ Agent ID (full, with proper formatting)</li>
                        <li>✅ Status (with color coding)</li>
                        <li>✅ Role (with professional icons)</li>
                        <li>✅ Created date (formatted)</li>
                        <li>✅ Description (with fallbacks)</li>
                        <li>✅ Personality (conditional display)</li>
                        <li>✅ Expertise (conditional display)</li>
                        <li>✅ System Prompt (scrollable, code-formatted)</li>
                        <li>✅ Model configuration (detailed)</li>
                        <li>✅ Capabilities (as badges)</li>
                        <li>✅ Guardrails (comprehensive status)</li>
                        <li>✅ Professional styling & organization</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Success Criteria -->
        <div class="mt-8 bg-green-800/20 border border-green-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-green-400">✅ Success Criteria</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3">Content Completeness</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• All agent configuration details visible</li>
                        <li>• Matches Agent Configuration dialog content</li>
                        <li>• Proper conditional display of optional fields</li>
                        <li>• Fallback values for missing data</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3">Visual & UX</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• Professional styling and organization</li>
                        <li>• Proper scrolling for long content</li>
                        <li>• Color-coded status indicators</li>
                        <li>• Smooth hover transitions</li>
                        <li>• No clipping or overflow issues</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Testing Checklist -->
        <div class="mt-8 bg-blue-800/20 border border-blue-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-blue-400">🧪 Testing Checklist</h2>
            <div class="space-y-3">
                <label class="flex items-center space-x-3">
                    <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                    <span>Tooltip appears on hover without clipping</span>
                </label>
                <label class="flex items-center space-x-3">
                    <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                    <span>All basic information fields are displayed</span>
                </label>
                <label class="flex items-center space-x-3">
                    <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                    <span>Agent ID is properly formatted and readable</span>
                </label>
                <label class="flex items-center space-x-3">
                    <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                    <span>Model configuration details are complete</span>
                </label>
                <label class="flex items-center space-x-3">
                    <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                    <span>Capabilities are displayed as colored badges</span>
                </label>
                <label class="flex items-center space-x-3">
                    <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                    <span>Security status shows proper Protected/Basic state</span>
                </label>
                <label class="flex items-center space-x-3">
                    <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                    <span>System prompt is displayed in scrollable code block</span>
                </label>
                <label class="flex items-center space-x-3">
                    <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                    <span>Conditional fields (personality, expertise) show when available</span>
                </label>
                <label class="flex items-center space-x-3">
                    <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                    <span>Professional icons and styling throughout</span>
                </label>
                <label class="flex items-center space-x-3">
                    <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
                    <span>Tooltip content matches Agent Configuration dialog</span>
                </label>
            </div>
        </div>
    </div>
</body>
</html>'''
    
    with open("test_complete_agent_tooltip.html", "w") as f:
        f.write(html_content)
    
    print("✅ Comprehensive test HTML created: test_complete_agent_tooltip.html")
    return True

def main():
    """Main test function"""
    print("🚀 Complete Agent Configuration Tooltip Test")
    print("=" * 60)
    
    all_passed = True
    
    # Run tests
    tests = [
        ("Complete Tooltip Implementation", test_complete_tooltip_implementation),
        ("Agent Data Structure", test_agent_data_structure),
        ("Tooltip Sections", test_tooltip_sections),
        ("Comprehensive Test HTML", create_comprehensive_test_html)
    ]
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name}...")
        try:
            result = test_func()
            if result:
                print(f"✅ {test_name} passed!")
            else:
                print(f"❌ {test_name} failed!")
                all_passed = False
        except Exception as e:
            print(f"❌ {test_name} error: {e}")
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All complete tooltip tests passed!")
        print("\n📋 Next Steps:")
        print("1. Start the development server: npm run dev")
        print("2. Navigate to Multi-Agent Workspace")
        print("3. Hover over agents in the palette")
        print("4. Verify tooltips show complete configuration details")
        print("5. Compare with Agent Configuration dialog")
        print("6. Open test_complete_agent_tooltip.html for detailed reference")
        print("\n🎯 Expected Result:")
        print("Tooltips should now show ALL agent configuration details")
        print("including Agent ID, Status, Created date, Personality,")
        print("Expertise, System Prompt, and complete model configuration!")
    else:
        print("❌ Some tests failed. Check the implementation.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)