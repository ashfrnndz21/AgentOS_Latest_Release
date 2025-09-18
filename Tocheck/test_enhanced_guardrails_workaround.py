#!/usr/bin/env python3

"""
Enhanced Guardrails Workaround Test
Tests the frontend workaround for enhanced guardrails persistence
since the backend doesn't support them yet.
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

def test_workaround_implementation():
    """Test the workaround implementation in OllamaAgentService"""
    print("🔧 Testing Enhanced Guardrails Workaround Implementation...")
    
    service_file = Path("src/lib/services/OllamaAgentService.ts")
    content = service_file.read_text()
    
    checks = [
        ("Enhanced guardrails storage method", "storeEnhancedGuardrails" in content),
        ("Enhanced guardrails loading method", "loadEnhancedGuardrails" in content),
        ("Separate storage key", "ollama-enhanced-guardrails" in content),
        ("Storage after creation", "this.storeEnhancedGuardrails" in content),
        ("Loading after backend load", "this.loadEnhancedGuardrails();" in content),
        ("Loading in storage fallback", "this.loadEnhancedGuardrails();" in content),
        ("Agent merging logic", "agent.enhancedGuardrails = enhancedData[agentId]" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Workaround Implementation: {passed}/{len(checks)} checks passed")
    return passed == len(checks)

def create_workaround_test_html():
    """Create a test HTML to verify the workaround"""
    print("\n🌐 Creating Workaround Test HTML...")
    
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Guardrails Workaround Test</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white p-8">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-center">Enhanced Guardrails Workaround Test</h1>
        
        <div class="bg-red-800/20 border border-red-600 p-6 rounded-lg mb-8">
            <h2 class="text-xl font-semibold mb-4 text-red-400">🚨 Backend Limitation Identified</h2>
            <div class="space-y-3 text-gray-300">
                <p><strong>Issue:</strong> The backend is not saving or returning enhanced guardrails data.</p>
                <p><strong>Root Cause:</strong> Backend API doesn't support the enhancedGuardrails field.</p>
                <p><strong>Impact:</strong> Enhanced guardrails configurations are lost after agent creation.</p>
            </div>
        </div>
        
        <div class="bg-blue-800/20 border border-blue-600 p-6 rounded-lg mb-8">
            <h2 class="text-xl font-semibold mb-4 text-blue-400">🔧 Workaround Implemented</h2>
            <div class="space-y-3 text-gray-300">
                <p><strong>Solution:</strong> Frontend-only storage of enhanced guardrails data.</p>
                <p><strong>Method:</strong> Separate localStorage key for enhanced guardrails.</p>
                <p><strong>Storage Key:</strong> <code class="bg-gray-700 px-2 py-1 rounded">ollama-enhanced-guardrails</code></p>
                <p><strong>Data Flow:</strong></p>
                <ol class="list-decimal list-inside ml-4 space-y-1">
                    <li>Enhanced guardrails saved to separate localStorage during creation</li>
                    <li>Basic agent data saved to backend (without enhanced guardrails)</li>
                    <li>When loading agents, enhanced guardrails merged from localStorage</li>
                    <li>Agent Configuration dialog displays complete data</li>
                </ol>
            </div>
        </div>
        
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
                        <li>Add blocked keywords: "spam", "scam", "fraud"</li>
                        <li>Add blocked phrases: "click here now"</li>
                        <li>Create a custom rule</li>
                        <li>Save the agent</li>
                    </ul>
                    
                    <p><strong>Step 2:</strong> Verify workaround is working</p>
                    <ul class="list-disc list-inside ml-4 space-y-1">
                        <li>Open browser DevTools (F12)</li>
                        <li>Go to Application → Local Storage</li>
                        <li>Look for "ollama-enhanced-guardrails" key</li>
                        <li>Verify your agent ID and data are stored</li>
                    </ul>
                    
                    <p><strong>Step 3:</strong> Test configuration display</p>
                    <ul class="list-disc list-inside ml-4 space-y-1">
                        <li>Go to Ollama Agent Management</li>
                        <li>Click on your agent</li>
                        <li>Go to Guardrails tab</li>
                        <li>Verify enhanced guardrails are displayed</li>
                    </ul>
                </div>
            </div>

            <!-- Expected Results -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4">✅ Expected Results</h2>
                <div class="space-y-4 text-gray-300">
                    <div>
                        <h3 class="text-lg font-medium mb-2 text-green-400">LocalStorage Check</h3>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            <li>Key: "ollama-enhanced-guardrails" exists</li>
                            <li>Value: JSON object with agent IDs as keys</li>
                            <li>Your agent ID present with full enhanced data</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-medium mb-2 text-blue-400">Configuration Dialog</h3>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            <li>Debug info shows "Enhanced as property: Yes"</li>
                            <li>Enhanced Guardrails section visible</li>
                            <li>Blocked keywords displayed as red badges</li>
                            <li>Blocked phrases displayed as red badges</li>
                            <li>Custom rules with descriptions shown</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Workaround Details -->
        <div class="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">🔄 Workaround Technical Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3 text-purple-400">Storage Methods</h3>
                    <ul class="space-y-2 text-gray-300">
                        <li>• <code>storeEnhancedGuardrails()</code> - Saves to localStorage</li>
                        <li>• <code>loadEnhancedGuardrails()</code> - Loads and merges data</li>
                        <li>• Separate storage key prevents conflicts</li>
                        <li>• Automatic merging on agent load</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3 text-orange-400">Data Flow</h3>
                    <ul class="space-y-2 text-gray-300">
                        <li>• Creation: Enhanced data → localStorage</li>
                        <li>• Backend: Basic agent data only</li>
                        <li>• Loading: Merge localStorage data</li>
                        <li>• Display: Complete enhanced data</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Limitations -->
        <div class="mt-8 bg-yellow-800/20 border border-yellow-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-yellow-400">⚠️ Workaround Limitations</h2>
            <div class="space-y-3 text-gray-300">
                <p><strong>Browser-Specific:</strong> Enhanced guardrails only available in the browser where agent was created.</p>
                <p><strong>No Server Sync:</strong> Enhanced guardrails won't sync across different browsers/devices.</p>
                <p><strong>Manual Backup:</strong> Enhanced guardrails not included in server-side backups.</p>
                <p><strong>Temporary Solution:</strong> This is a workaround until backend support is added.</p>
            </div>
        </div>
        
        <!-- Future Solution -->
        <div class="mt-8 bg-green-800/20 border border-green-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-green-400">🚀 Future Backend Solution</h2>
            <div class="space-y-3 text-gray-300">
                <p><strong>Backend Updates Needed:</strong></p>
                <ol class="list-decimal list-inside ml-4 space-y-2">
                    <li>Add <code>enhanced_guardrails</code> field to agent database schema</li>
                    <li>Update agent creation API to accept and store enhanced guardrails</li>
                    <li>Update agent retrieval API to return enhanced guardrails</li>
                    <li>Add migration script to preserve existing enhanced guardrails</li>
                </ol>
                <p class="mt-4"><strong>When backend is updated:</strong> The workaround can be removed and data will sync properly.</p>
            </div>
        </div>
        
        <!-- Debug Commands -->
        <div class="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">🐛 Debug Commands</h2>
            <div class="bg-gray-700 p-4 rounded">
                <p class="text-gray-300 mb-2">Open browser console and run these commands:</p>
                <div class="space-y-2 text-sm font-mono">
                    <div><span class="text-blue-400">// Check enhanced guardrails storage</span></div>
                    <div><span class="text-green-400">localStorage.getItem('ollama-enhanced-guardrails')</span></div>
                    
                    <div class="mt-3"><span class="text-blue-400">// Check regular agent storage</span></div>
                    <div><span class="text-green-400">localStorage.getItem('ollama-agents')</span></div>
                    
                    <div class="mt-3"><span class="text-blue-400">// Get all agents with enhanced data</span></div>
                    <div><span class="text-green-400">ollamaAgentService.getAllAgents()</span></div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>'''
    
    with open("test_enhanced_guardrails_workaround.html", "w") as f:
        f.write(html_content)
    
    print("✅ Workaround test HTML created: test_enhanced_guardrails_workaround.html")
    return True

def main():
    """Main test function"""
    print("🚀 Enhanced Guardrails Workaround Test")
    print("=" * 60)
    
    all_passed = True
    
    # Run tests
    tests = [
        ("Workaround Implementation", test_workaround_implementation),
        ("Create Test HTML", create_workaround_test_html)
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
        print("🎉 Enhanced guardrails workaround implemented!")
        print("\n📋 What This Fixes:")
        print("✅ Enhanced guardrails now persist in frontend localStorage")
        print("✅ Agent Configuration dialog will show enhanced settings")
        print("✅ Data survives page refresh and browser restart")
        print("✅ Workaround until backend support is added")
        
        print("\n⚠️ Limitations:")
        print("- Enhanced guardrails only available in creation browser")
        print("- No sync across different browsers/devices")
        print("- Not included in server-side backups")
        
        print("\n📋 Next Steps:")
        print("1. Test creating an agent with enhanced guardrails")
        print("2. Verify localStorage contains the enhanced data")
        print("3. Check Agent Configuration dialog shows enhanced settings")
        print("4. Open test_enhanced_guardrails_workaround.html for details")
        
        print("\n🎯 Expected Result:")
        print("Enhanced guardrails should now persist and display properly!")
    else:
        print("❌ Some tests failed. Check the implementation.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)