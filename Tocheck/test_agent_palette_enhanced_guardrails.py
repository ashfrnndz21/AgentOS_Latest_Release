#!/usr/bin/env python3

"""
Agent Palette Enhanced Guardrails Test
Tests that the Agent Palette tooltips show detailed enhanced guardrails information.
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

def test_agent_palette_enhanced_guardrails():
    """Test that Agent Palette tooltips show enhanced guardrails details"""
    print("🎨 Testing Agent Palette Enhanced Guardrails Display...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    content = palette_file.read_text()
    
    checks = [
        ("Enhanced guardrails check", "agent.originalAgent?.enhancedGuardrails" in content),
        ("Content filter details", "agent.originalAgent.enhancedGuardrails.contentFilter?.enabled" in content),
        ("Blocked keywords count", "customKeywords.length" in content and "blocked keywords" in content),
        ("Blocked phrases count", "blockedPhrases.length" in content and "blocked phrases" in content),
        ("PII redaction details", "agent.originalAgent.enhancedGuardrails.piiRedaction?.enabled" in content),
        ("PII strategy display", "Strategy: {agent.originalAgent.enhancedGuardrails.piiRedaction.strategy}" in content),
        ("Custom types count", "customTypes.length" in content and "custom types" in content),
        ("Custom rules count", "agent.originalAgent.enhancedGuardrails.customRules?.length" in content),
        ("Active rules filter", "customRules.filter((r: any) => r.enabled).length" in content),
        ("Behavior limits", "agent.originalAgent.enhancedGuardrails.behaviorLimits?.enabled" in content),
        ("Fallback condition", "!agent.originalAgent?.enhancedGuardrails" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Agent Palette Enhanced Guardrails: {passed}/{len(checks)} checks passed")
    return passed == len(checks)

def test_palette_agent_interface():
    """Test that PaletteAgent interface includes originalAgent"""
    print("\n🔧 Testing PaletteAgent Interface...")
    
    palette_hook_file = Path("src/hooks/useOllamaAgentsForPalette.ts")
    content = palette_hook_file.read_text()
    
    checks = [
        ("PaletteAgent interface", "interface PaletteAgent" in content),
        ("Original agent field", "originalAgent: OllamaAgentConfig" in content),
        ("Agent transformation", "transformOllamaAgentToPaletteAgent" in content),
        ("Original agent assignment", "originalAgent: agent" in content),
        ("Service integration", "ollamaAgentService.getAllAgents()" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 PaletteAgent Interface: {passed}/{len(checks)} checks passed")
    return passed == len(checks)

def create_enhanced_palette_test_html():
    """Create a test HTML to verify enhanced guardrails in palette tooltips"""
    print("\n🌐 Creating Enhanced Palette Test HTML...")
    
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Palette Enhanced Guardrails Test</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white p-8">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-center">Agent Palette Enhanced Guardrails Test</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Test Instructions -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4">📋 Test Instructions</h2>
                <div class="space-y-4 text-gray-300">
                    <p><strong>Step 1:</strong> Navigate to Multi-Agent Workspace</p>
                    <p><strong>Step 2:</strong> Look at the Agent Palette on the left</p>
                    <p><strong>Step 3:</strong> Hover over an agent with enhanced guardrails</p>
                    <p><strong>Step 4:</strong> Check the Security & Guardrails section in the tooltip</p>
                    <p><strong>Step 5:</strong> Verify detailed enhanced guardrails information is displayed</p>
                </div>
            </div>

            <!-- Expected Enhanced Details -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4">✅ Expected Enhanced Details</h2>
                <div class="space-y-4 text-gray-300">
                    <div>
                        <h3 class="text-lg font-medium mb-2 text-blue-400">Content Filter</h3>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            <li>Filter level (e.g., "strict", "moderate")</li>
                            <li>Number of blocked keywords</li>
                            <li>Number of blocked phrases</li>
                            <li>Number of allowed domains (if any)</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-medium mb-2 text-yellow-400">PII Protection</h3>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            <li>Protection strategy (e.g., "mask", "remove")</li>
                            <li>Number of custom PII types</li>
                            <li>Custom patterns configured</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-medium mb-2 text-orange-400">Custom Rules</h3>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            <li>Number of active custom rules</li>
                            <li>Rule descriptions and patterns</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Tooltip Structure -->
        <div class="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">🎨 Expected Tooltip Structure</h2>
            <div class="bg-gray-700 p-4 rounded">
                <div class="space-y-3 text-sm">
                    <div class="text-blue-400">🛡️ Security & Guardrails</div>
                    <div class="ml-4 space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-400">Status:</span>
                            <span class="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">🛡️ Protected</span>
                        </div>
                        
                        <div class="text-gray-400">Content Filter:</div>
                        <div class="ml-4 space-y-1 text-xs">
                            <div class="text-blue-300">Level: strict</div>
                            <div class="text-red-300">4 blocked keywords</div>
                            <div class="text-red-300">2 blocked phrases</div>
                        </div>
                        
                        <div class="text-gray-400">PII Protection:</div>
                        <div class="ml-4 space-y-1 text-xs">
                            <div class="text-yellow-300">Strategy: remove</div>
                            <div class="text-yellow-300">4 custom types</div>
                        </div>
                        
                        <div class="text-gray-400">Custom Rules:</div>
                        <div class="ml-4 text-xs">
                            <div class="text-orange-300">1 active rules</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Comparison -->
        <div class="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">🔄 Before vs After</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3 text-red-400">❌ Before (Basic)</h3>
                    <div class="bg-gray-700 p-3 rounded">
                        <div class="text-sm">
                            <div class="text-blue-400">🛡️ Security & Guardrails</div>
                            <div class="ml-4 mt-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400">Status:</span>
                                    <span class="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">🛡️ Protected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3 text-green-400">✅ After (Enhanced)</h3>
                    <div class="bg-gray-700 p-3 rounded">
                        <div class="text-sm">
                            <div class="text-blue-400">🛡️ Security & Guardrails</div>
                            <div class="ml-4 mt-2 space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-400">Status:</span>
                                    <span class="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">🛡️ Protected</span>
                                </div>
                                <div class="text-xs space-y-1">
                                    <div class="text-gray-400">Content Filter:</div>
                                    <div class="ml-2 text-blue-300">Level: strict</div>
                                    <div class="ml-2 text-red-300">4 blocked keywords</div>
                                    <div class="text-gray-400">PII Protection:</div>
                                    <div class="ml-2 text-yellow-300">Strategy: remove</div>
                                    <div class="text-gray-400">Custom Rules:</div>
                                    <div class="ml-2 text-orange-300">1 active rules</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Success Criteria -->
        <div class="mt-8 bg-green-800/20 border border-green-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-green-400">🎯 Success Criteria</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3">Tooltip Content</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• Enhanced guardrails details visible</li>
                        <li>• Content filter information displayed</li>
                        <li>• PII protection details shown</li>
                        <li>• Custom rules count displayed</li>
                        <li>• Color-coded information sections</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3">User Experience</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• Tooltip appears on hover</li>
                        <li>• Information is clearly organized</li>
                        <li>• No clipping or positioning issues</li>
                        <li>• Consistent with Agent Configuration dialog</li>
                        <li>• Professional visual presentation</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Troubleshooting -->
        <div class="mt-8 bg-red-800/20 border border-red-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-red-400">🔧 Troubleshooting</h2>
            <div class="space-y-3 text-gray-300">
                <p><strong>If enhanced details don't show:</strong></p>
                <ol class="list-decimal list-inside ml-4 space-y-2">
                    <li>Verify the agent has enhanced guardrails configured</li>
                    <li>Check that the workaround is storing enhanced data in localStorage</li>
                    <li>Ensure the Agent Palette is loading the originalAgent data</li>
                    <li>Check browser console for any errors</li>
                    <li>Try refreshing the agents in the palette</li>
                </ol>
                
                <p class="mt-4"><strong>Debug Commands:</strong></p>
                <div class="bg-gray-700 p-3 rounded mt-2">
                    <code class="text-sm">
                        // Check enhanced guardrails in localStorage<br>
                        localStorage.getItem('ollama-enhanced-guardrails')<br><br>
                        
                        // Check palette agents data<br>
                        console.log(ollamaAgentService.getAllAgents())
                    </code>
                </div>
            </div>
        </div>
    </div>
</body>
</html>'''
    
    with open("test_agent_palette_enhanced_guardrails.html", "w") as f:
        f.write(html_content)
    
    print("✅ Enhanced palette test HTML created: test_agent_palette_enhanced_guardrails.html")
    return True

def main():
    """Main test function"""
    print("🚀 Agent Palette Enhanced Guardrails Test")
    print("=" * 60)
    
    all_passed = True
    
    # Run tests
    tests = [
        ("Agent Palette Enhanced Guardrails", test_agent_palette_enhanced_guardrails),
        ("PaletteAgent Interface", test_palette_agent_interface),
        ("Create Test HTML", create_enhanced_palette_test_html)
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
        print("🎉 Agent Palette enhanced guardrails display implemented!")
        print("\n📋 What's Enhanced:")
        print("✅ Content Filter details (level, blocked keywords/phrases)")
        print("✅ PII Protection information (strategy, custom types)")
        print("✅ Custom Rules count (active rules)")
        print("✅ Behavior Limits (if configured)")
        print("✅ Color-coded information sections")
        
        print("\n🎯 Expected Result:")
        print("Agent Palette tooltips now show detailed enhanced guardrails")
        print("information instead of just 'Protected' status!")
        
        print("\n📋 Next Steps:")
        print("1. Navigate to Multi-Agent Workspace")
        print("2. Hover over agents in the palette")
        print("3. Verify enhanced guardrails details are displayed")
        print("4. Open test_agent_palette_enhanced_guardrails.html for reference")
    else:
        print("❌ Some tests failed. Check the implementation.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)