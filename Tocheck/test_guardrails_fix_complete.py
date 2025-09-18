#!/usr/bin/env python3

"""
Complete Guardrails Fix Test
Tests that guardrails are properly detected and displayed in Agent Palette tooltips.
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

def test_enhanced_guardrails_detection():
    """Test the enhanced guardrails detection logic"""
    print("🛡️ Testing Enhanced Guardrails Detection...")
    
    palette_hook_file = Path("src/hooks/useOllamaAgentsForPalette.ts")
    content = palette_hook_file.read_text()
    
    # Check for enhanced detection logic
    checks = [
        ("Enhanced detection function", "Boolean(" in content and "agent.guardrails?.enabled" in content),
        ("Safety level check (snake_case)", "agent.guardrails?.safety_level" in content),
        ("Safety level check (camelCase)", "agent.guardrails?.safetyLevel" in content),
        ("Object keys check", "Object.keys(agent.guardrails).length > 0" in content),
        ("Multiple condition OR logic", "||" in content and "hasGuardrails" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Enhanced Detection: {passed}/{len(checks)} checks passed")
    return passed >= len(checks) * 0.8

def test_tooltip_property_compatibility():
    """Test that tooltip handles both camelCase and snake_case properties"""
    print("\n🔧 Testing Tooltip Property Compatibility...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    content = palette_file.read_text()
    
    # Check for property compatibility
    checks = [
        ("Safety level compatibility", "safety_level || agent.originalAgent.guardrails.safetyLevel" in content),
        ("Content filter compatibility", "content_filter || agent.originalAgent?.guardrails?.contentFilters" in content),
        ("System prompt compatibility", "system_prompt || agent.originalAgent?.systemPrompt" in content),
        ("Max tokens compatibility", "max_tokens || agent.originalAgent?.maxTokens" in content),
        ("Conditional display for safety level", "(agent.originalAgent?.guardrails?.safety_level || agent.originalAgent?.guardrails?.safetyLevel)" in content),
        ("Conditional display for content filter", "(agent.originalAgent?.guardrails?.content_filter || agent.originalAgent?.guardrails?.contentFilters)" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Property Compatibility: {passed}/{len(checks)} checks passed")
    return passed >= len(checks) * 0.8

def test_guardrails_display_logic():
    """Test the guardrails display logic in tooltips"""
    print("\n🎯 Testing Guardrails Display Logic...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    content = palette_file.read_text()
    
    # Check for proper display logic
    checks = [
        ("Guardrails status check", "agent.guardrails ?" in content),
        ("Protected badge display", "Protected" in content and "bg-green-500/20" in content),
        ("Basic badge display", "Basic" in content and "bg-yellow-500/20" in content),
        ("Shield icon for protected", "Shield className" in content and "Protected" in content),
        ("Alert icon for basic", "AlertCircle className" in content and "Basic" in content),
        ("Security section header", "Security & Guardrails" in content),
        ("Status label", "Status:" in content and "text-gray-400" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Display Logic: {passed}/{len(checks)} checks passed")
    return passed == len(checks)

def create_guardrails_test_html():
    """Create a test HTML to verify guardrails display"""
    print("\n🌐 Creating Guardrails Test HTML...")
    
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guardrails Fix Test</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white p-8">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-center">Guardrails Fix Test</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Test Instructions -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4">📋 Test Instructions</h2>
                <div class="space-y-4 text-gray-300">
                    <p>1. Start the development server: <code class="bg-gray-700 px-2 py-1 rounded">npm run dev</code></p>
                    <p>2. Navigate to Multi-Agent Workspace</p>
                    <p>3. Hover over agents in the palette</p>
                    <p>4. Check the Security & Guardrails section</p>
                    <p>5. Verify agents with guardrails show "Protected" status</p>
                </div>
            </div>

            <!-- Expected Results -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4">✅ Expected Results</h2>
                <div class="space-y-3 text-gray-300">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Agents with guardrails: "Protected" badge</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Agents without guardrails: "Basic" badge</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Safety level displayed (if configured)</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>Content filter status (if enabled)</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Guardrails Detection Logic -->
        <div class="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">🔧 Enhanced Detection Logic</h2>
            <div class="bg-gray-700 p-4 rounded">
                <code class="text-sm text-gray-300">
                    const hasGuardrails = Boolean(<br>
                    &nbsp;&nbsp;agent.guardrails?.enabled ||<br>
                    &nbsp;&nbsp;agent.guardrails?.safety_level ||<br>
                    &nbsp;&nbsp;agent.guardrails?.safetyLevel ||<br>
                    &nbsp;&nbsp;(agent.guardrails && Object.keys(agent.guardrails).length > 0)<br>
                    );
                </code>
            </div>
            <p class="text-gray-400 text-sm mt-3">
                This enhanced logic handles multiple possible data structures and property naming conventions.
            </p>
        </div>
        
        <!-- Property Compatibility -->
        <div class="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">🔄 Property Compatibility</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3 text-blue-400">Supported Properties</h3>
                    <ul class="space-y-2 text-gray-300">
                        <li>• safety_level / safetyLevel</li>
                        <li>• content_filter / contentFilters</li>
                        <li>• system_prompt / systemPrompt</li>
                        <li>• max_tokens / maxTokens</li>
                        <li>• guardrails.enabled</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3 text-green-400">Benefits</h3>
                    <ul class="space-y-2 text-gray-300">
                        <li>• Handles backend variations</li>
                        <li>• Works with different API versions</li>
                        <li>• Robust property detection</li>
                        <li>• Fallback mechanisms</li>
                        <li>• Future-proof implementation</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Troubleshooting -->
        <div class="mt-8 bg-red-800/20 border border-red-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-red-400">🐛 Troubleshooting</h2>
            <div class="space-y-3 text-gray-300">
                <p><strong>If guardrails still don't show:</strong></p>
                <ol class="list-decimal list-inside ml-4 space-y-2">
                    <li>Run debug_guardrails_detection.py to see actual data structure</li>
                    <li>Check browser console for any errors</li>
                    <li>Verify the agent actually has guardrails configured</li>
                    <li>Refresh the agents list in the palette</li>
                    <li>Check if the backend is returning the expected data format</li>
                </ol>
            </div>
        </div>
        
        <!-- Success Criteria -->
        <div class="mt-8 bg-green-800/20 border border-green-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-green-400">🎯 Success Criteria</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3">Visual Indicators</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• Protected badge for agents with guardrails</li>
                        <li>• Basic badge for agents without guardrails</li>
                        <li>• Safety level displayed correctly</li>
                        <li>• Content filter status shown</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3">Functionality</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• Tooltips show immediately on hover</li>
                        <li>• All agent configuration details visible</li>
                        <li>• No clipping or positioning issues</li>
                        <li>• Consistent behavior across all agents</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</body>
</html>'''
    
    with open("test_guardrails_fix.html", "w") as f:
        f.write(html_content)
    
    print("✅ Guardrails test HTML created: test_guardrails_fix.html")
    return True

def main():
    """Main test function"""
    print("🚀 Complete Guardrails Fix Test")
    print("=" * 50)
    
    all_passed = True
    
    # Run tests
    tests = [
        ("Enhanced Guardrails Detection", test_enhanced_guardrails_detection),
        ("Tooltip Property Compatibility", test_tooltip_property_compatibility),
        ("Guardrails Display Logic", test_guardrails_display_logic),
        ("Create Test HTML", create_guardrails_test_html)
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
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All guardrails tests passed!")
        print("\n📋 Next Steps:")
        print("1. Start the development server: npm run dev")
        print("2. Navigate to Multi-Agent Workspace")
        print("3. Hover over agents in the palette")
        print("4. Verify guardrails status shows correctly")
        print("5. Open test_guardrails_fix.html for reference")
        print("6. Run debug_guardrails_detection.py if issues persist")
        print("\n🎯 Expected Result:")
        print("Agents with guardrails enabled should now show 'Protected' status")
        print("with proper safety level and content filter information!")
    else:
        print("❌ Some tests failed. Check the implementation.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)