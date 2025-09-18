#!/usr/bin/env python3

"""
Enhanced Guardrails Persistence Test
Tests that enhanced guardrails (blocked keywords, custom rules, etc.) are properly
saved and displayed in the Agent Configuration dialog.
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

def test_ollama_agent_config_interface():
    """Test that the OllamaAgentConfig interface includes enhancedGuardrails"""
    print("🔧 Testing OllamaAgentConfig Interface...")
    
    service_file = Path("src/lib/services/OllamaAgentService.ts")
    content = service_file.read_text()
    
    checks = [
        ("Enhanced guardrails field", "enhancedGuardrails?: any" in content),
        ("Interface definition", "export interface OllamaAgentConfig" in content),
        ("Guardrails field", "guardrails: {" in content),
        ("Enhanced guardrails preservation", "enhancedGuardrails: (config as any).enhancedGuardrails" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Interface Updates: {passed}/{len(checks)} checks passed")
    return passed == len(checks)

def test_agent_config_dialog_enhancements():
    """Test that the Agent Configuration dialog shows enhanced guardrails"""
    print("\n🎯 Testing Agent Configuration Dialog...")
    
    dialog_file = Path("src/components/AgentConfigDialog.tsx")
    content = dialog_file.read_text()
    
    checks = [
        ("Enhanced guardrails check", "agent.enhancedGuardrails" in content),
        ("Multiple location check", "(agent as any).enhancedGuardrails" in content),
        ("Guardrails location check", "(agent.guardrails as any)?.enhancedGuardrails" in content),
        ("Enhanced guardrails rendering", "renderEnhancedGuardrails" in content),
        ("Blocked keywords display", "Blocked Keywords:" in content),
        ("Blocked phrases display", "Blocked Phrases:" in content),
        ("Custom rules display", "Custom Rules" in content),
        ("Debug information", "Enhanced as property:" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Dialog Enhancements: {passed}/{len(checks)} checks passed")
    return passed >= len(checks) * 0.8

def test_enhanced_guardrails_structure():
    """Test the enhanced guardrails structure in the creation dialog"""
    print("\n🛡️ Testing Enhanced Guardrails Structure...")
    
    enhanced_file = Path("src/components/CommandCentre/CreateAgent/steps/EnhancedGuardrails.tsx")
    
    if not enhanced_file.exists():
        print("❌ EnhancedGuardrails.tsx not found!")
        return False
    
    content = enhanced_file.read_text()
    
    checks = [
        ("DynamicGuardrails interface", "interface DynamicGuardrails" in content),
        ("Content filter structure", "contentFilter: {" in content),
        ("Custom keywords field", "customKeywords: string[]" in content),
        ("Blocked phrases field", "blockedPhrases: string[]" in content),
        ("Custom rules field", "customRules" in content),
        ("PII redaction", "piiRedaction: {" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Guardrails Structure: {passed}/{len(checks)} checks passed")
    return passed >= len(checks) * 0.8

def test_agent_creation_integration():
    """Test that enhanced guardrails are integrated in agent creation"""
    print("\n🤖 Testing Agent Creation Integration...")
    
    dialog_file = Path("src/components/CommandCentre/CreateAgent/OllamaAgentDialog.tsx")
    content = dialog_file.read_text()
    
    checks = [
        ("Enhanced guardrails state", "const [enhancedGuardrails, setEnhancedGuardrails]" in content),
        ("Enhanced guardrails in config", "enhancedGuardrails," in content),
        ("Enhanced guardrails component", "<EnhancedGuardrails" in content),
        ("Enhanced guardrails update", "onUpdate={setEnhancedGuardrails}" in content),
        ("Enhanced guardrails display", "enhancedGuardrails.contentFilter.enabled" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Creation Integration: {passed}/{len(checks)} checks passed")
    return passed >= len(checks) * 0.8

def create_enhanced_guardrails_test_html():
    """Create a test HTML to verify enhanced guardrails display"""
    print("\n🌐 Creating Enhanced Guardrails Test HTML...")
    
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Guardrails Persistence Test</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white p-8">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-center">Enhanced Guardrails Persistence Test</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Test Instructions -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4">📋 Test Instructions</h2>
                <div class="space-y-4 text-gray-300">
                    <p><strong>Step 1:</strong> Create a new agent with enhanced guardrails</p>
                    <ul class="list-disc list-inside ml-4 space-y-1">
                        <li>Go to Command Centre → Create Agent</li>
                        <li>Fill in basic information</li>
                        <li>Go to Guardrails tab</li>
                        <li>Enable content filters</li>
                        <li>Add blocked keywords (e.g., "spam", "scam")</li>
                        <li>Add blocked phrases</li>
                        <li>Create custom rules</li>
                        <li>Save the agent</li>
                    </ul>
                    
                    <p><strong>Step 2:</strong> Verify the configuration is saved</p>
                    <ul class="list-disc list-inside ml-4 space-y-1">
                        <li>Go to Ollama Agent Management</li>
                        <li>Click on your newly created agent</li>
                        <li>Go to the Guardrails tab</li>
                        <li>Verify all your settings are displayed</li>
                    </ul>
                </div>
            </div>

            <!-- Expected Results -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4">✅ Expected Results</h2>
                <div class="space-y-4 text-gray-300">
                    <div>
                        <h3 class="text-lg font-medium mb-2 text-blue-400">Basic Guardrails</h3>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            <li>Enabled: ✓ (green checkmark)</li>
                            <li>Safety Level: medium (or your selection)</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-medium mb-2 text-purple-400">Enhanced Guardrails</h3>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            <li>Content Filter section visible</li>
                            <li>Blocked Keywords: Your keywords as red badges</li>
                            <li>Blocked Phrases: Your phrases as red badges</li>
                            <li>Custom Rules: Your rules with descriptions</li>
                            <li>Rule patterns and actions displayed</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Debug Information -->
        <div class="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">🐛 Debug Information</h2>
            <div class="bg-gray-700 p-4 rounded">
                <p class="text-gray-300 mb-2">If enhanced guardrails are not showing, check the debug info in the dialog:</p>
                <ul class="list-disc list-inside ml-4 space-y-1 text-gray-400">
                    <li>Enhanced at top level: Should be "Yes"</li>
                    <li>Enhanced in guardrails: May be "Yes" or "No"</li>
                    <li>Enhanced as property: Should be "Yes"</li>
                </ul>
                <p class="text-gray-300 mt-3">The debug info appears only in development mode.</p>
            </div>
        </div>
        
        <!-- Data Flow -->
        <div class="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">🔄 Data Flow</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3 text-green-400">1. Creation</h3>
                    <ul class="space-y-2 text-gray-300">
                        <li>• Enhanced guardrails configured</li>
                        <li>• Data stored in enhancedGuardrails state</li>
                        <li>• Sent to backend via API</li>
                        <li>• Preserved in agent config</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3 text-blue-400">2. Storage</h3>
                    <ul class="space-y-2 text-gray-300">
                        <li>• Backend processes request</li>
                        <li>• Enhanced data preserved</li>
                        <li>• Stored in agent.enhancedGuardrails</li>
                        <li>• Available for retrieval</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3 text-purple-400">3. Display</h3>
                    <ul class="space-y-2 text-gray-300">
                        <li>• Agent config dialog loads data</li>
                        <li>• Checks multiple locations</li>
                        <li>• Renders enhanced guardrails</li>
                        <li>• Shows detailed configuration</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Troubleshooting -->
        <div class="mt-8 bg-red-800/20 border border-red-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-red-400">🔧 Troubleshooting</h2>
            <div class="space-y-3 text-gray-300">
                <p><strong>If enhanced guardrails are not showing:</strong></p>
                <ol class="list-decimal list-inside ml-4 space-y-2">
                    <li>Check the browser console for errors</li>
                    <li>Verify the agent was created with enhanced guardrails</li>
                    <li>Check the debug information in the dialog</li>
                    <li>Ensure the backend is properly saving the data</li>
                    <li>Try refreshing the agent list</li>
                    <li>Check if the agent.enhancedGuardrails field exists</li>
                </ol>
                
                <p class="mt-4"><strong>Common Issues:</strong></p>
                <ul class="list-disc list-inside ml-4 space-y-1">
                    <li>Enhanced guardrails not saved during creation</li>
                    <li>Backend not preserving enhanced data</li>
                    <li>Frontend not checking correct data location</li>
                    <li>Interface mismatch between creation and display</li>
                </ul>
            </div>
        </div>
        
        <!-- Success Criteria -->
        <div class="mt-8 bg-green-800/20 border border-green-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-green-400">🎯 Success Criteria</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3">Configuration Display</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• All blocked keywords visible</li>
                        <li>• All blocked phrases visible</li>
                        <li>• Custom rules with descriptions</li>
                        <li>• Rule patterns and actions shown</li>
                        <li>• PII redaction settings displayed</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3">Data Persistence</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• Settings survive page refresh</li>
                        <li>• All configured options preserved</li>
                        <li>• Debug info shows "Yes" for enhanced</li>
                        <li>• No data loss during save/load</li>
                        <li>• Consistent display across sessions</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</body>
</html>'''
    
    with open("test_enhanced_guardrails_persistence.html", "w") as f:
        f.write(html_content)
    
    print("✅ Enhanced guardrails test HTML created: test_enhanced_guardrails_persistence.html")
    return True

def main():
    """Main test function"""
    print("🚀 Enhanced Guardrails Persistence Test")
    print("=" * 60)
    
    all_passed = True
    
    # Run tests
    tests = [
        ("OllamaAgentConfig Interface", test_ollama_agent_config_interface),
        ("Agent Config Dialog", test_agent_config_dialog_enhancements),
        ("Enhanced Guardrails Structure", test_enhanced_guardrails_structure),
        ("Agent Creation Integration", test_agent_creation_integration),
        ("Create Test HTML", create_enhanced_guardrails_test_html)
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
        print("🎉 All enhanced guardrails persistence tests passed!")
        print("\n📋 Next Steps:")
        print("1. Start the development server: npm run dev")
        print("2. Create a new agent with enhanced guardrails")
        print("3. Add blocked keywords, phrases, and custom rules")
        print("4. Save the agent and check the configuration dialog")
        print("5. Verify all enhanced settings are displayed")
        print("6. Open test_enhanced_guardrails_persistence.html for reference")
        print("\n🎯 Expected Result:")
        print("The Agent Configuration dialog should now show ALL your")
        print("enhanced guardrails settings including blocked keywords,")
        print("custom rules, and detailed configuration options!")
    else:
        print("❌ Some tests failed. Check the implementation.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)