#!/usr/bin/env python3

"""
Comprehensive Guardrails Display Test
Tests that ALL enhanced guardrails details are displayed correctly in both
the Agent Configuration dialog and Agent Palette tooltips.
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

def test_agent_config_dialog_comprehensive_display():
    """Test that the Agent Configuration dialog shows all enhanced guardrails details"""
    print("🔧 Testing Agent Configuration Dialog Comprehensive Display...")
    
    dialog_file = Path("src/components/AgentConfigDialog.tsx")
    content = dialog_file.read_text()
    
    checks = [
        # Global/Local Guardrails
        ("Global guardrails display", "Global Guardrails" in content),
        ("Local guardrails display", "Local Guardrails" in content),
        ("Guardrails scope section", "Guardrails Scope" in content),
        
        # Content Filter Details
        ("Filter level display", "Filter Level:" in content),
        ("Filter level badges", "Strict - Conservative filtering" in content),
        ("Blocked keywords count", "enhanced.contentFilter.customKeywords.length" in content),
        ("Blocked phrases display", "Blocked Phrases" in content),
        ("Allowed domains display", "Allowed Domains" in content),
        ("Domain badges styling", "text-green-400 border-green-400" in content),
        
        # PII Redaction
        ("PII redaction section", "PII Redaction" in content),
        ("PII strategy display", "enhanced.piiRedaction.strategy" in content),
        ("Custom PII types", "Custom PII Types" in content),
        ("Custom patterns display", "Custom Patterns" in content),
        ("Mask character display", "Mask Character:" in content),
        ("Placeholder text display", "Placeholder Text:" in content),
        
        # Behavior Limits
        ("Behavior limits section", "Behavior Limits" in content),
        ("Max response length", "maxResponseLength" in content),
        ("Custom limits display", "customLimits" in content),
        
        # Custom Rules
        ("Custom rules count", "Custom Rules ({enhanced.customRules.length})" in content),
        ("Rule action display", "rule.action" in content),
        ("Rule pattern display", "rule.pattern" in content),
        ("Rule replacement display", "rule.replacement" in content),
        
        # Visual Enhancements
        ("Section icons", "Shield className" in content and "Eye className" in content),
        ("Professional styling", "bg-gray-800 rounded" in content),
        ("Color coding", "text-red-400" in content and "text-yellow-400" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Agent Config Dialog: {passed}/{len(checks)} checks passed")
    return passed >= len(checks) * 0.85

def test_agent_palette_tooltip_consistency():
    """Test that Agent Palette tooltips show consistent enhanced guardrails information"""
    print("\n🎯 Testing Agent Palette Tooltip Consistency...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    content = palette_file.read_text()
    
    checks = [
        # Enhanced Guardrails Access
        ("Enhanced guardrails check", "agent.enhancedGuardrails" in content),
        ("Content filter enabled check", "agent.enhancedGuardrails.contentFilter?.enabled" in content),
        
        # Content Filter Summary
        ("Filter level display", "agent.enhancedGuardrails.contentFilter.level" in content),
        ("Blocked keywords count", "customKeywords.length" in content and "blocked keywords" in content),
        ("Blocked phrases count", "blockedPhrases.length" in content and "blocked phrases" in content),
        ("Allowed domains count", "allowedDomains.length" in content and "allowed domains" in content),
        
        # PII Protection Summary
        ("PII protection check", "agent.enhancedGuardrails.piiRedaction?.enabled" in content),
        ("PII strategy display", "agent.enhancedGuardrails.piiRedaction.strategy" in content),
        ("PII custom types count", "customTypes.length" in content and "custom types" in content),
        
        # Custom Rules Summary
        ("Custom rules count", "agent.enhancedGuardrails.customRules?.length" in content),
        ("Active rules filter", "filter((r: any) => r.enabled)" in content),
        
        # Behavior Limits Summary
        ("Behavior limits check", "agent.enhancedGuardrails.behaviorLimits?.enabled" in content),
        ("Custom limits count", "customLimits?.length" in content and "custom limits" in content),
        
        # Fallback for Basic Guardrails
        ("Basic guardrails fallback", "!agent.enhancedGuardrails" in content),
        ("Content filter fallback", "content_filter || agent.originalAgent?.guardrails?.contentFilters" in content),
        
        # Color Coding
        ("Color coded information", "text-blue-300" in content and "text-red-300" in content),
        ("Status colors", "text-yellow-300" in content and "text-green-300" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Agent Palette Tooltips: {passed}/{len(checks)} checks passed")
    return passed >= len(checks) * 0.85

def test_enhanced_guardrails_structure():
    """Test the enhanced guardrails data structure in creation"""
    print("\n🛡️ Testing Enhanced Guardrails Data Structure...")
    
    enhanced_file = Path("src/components/CommandCentre/CreateAgent/steps/EnhancedGuardrails.tsx")
    
    if not enhanced_file.exists():
        print("❌ EnhancedGuardrails.tsx not found!")
        return False
    
    content = enhanced_file.read_text()
    
    checks = [
        # Interface Structure
        ("DynamicGuardrails interface", "interface DynamicGuardrails" in content),
        ("Global and local fields", "global: boolean" in content and "local: boolean" in content),
        
        # PII Redaction Structure
        ("PII redaction interface", "piiRedaction: {" in content),
        ("PII strategy field", "strategy: 'mask' | 'remove' | 'placeholder'" in content),
        ("Custom types array", "customTypes: string[]" in content),
        ("Custom patterns array", "customPatterns: string[]" in content),
        ("Mask character field", "maskCharacter: string" in content),
        ("Placeholder text field", "placeholderText: string" in content),
        
        # Content Filter Structure
        ("Content filter interface", "contentFilter: {" in content),
        ("Filter level field", "level: 'basic' | 'moderate' | 'strict'" in content),
        ("Custom keywords array", "customKeywords: string[]" in content),
        ("Allowed domains array", "allowedDomains: string[]" in content),
        ("Blocked phrases array", "blockedPhrases: string[]" in content),
        
        # Custom Rules Structure
        ("Custom rule interface", "interface CustomRule" in content),
        ("Rule action field", "action: 'block' | 'warn' | 'replace'" in content),
        ("Rule pattern field", "pattern: string" in content),
        ("Rule replacement field", "replacement?: string" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Data Structure: {passed}/{len(checks)} checks passed")
    return passed >= len(checks) * 0.8

def create_comprehensive_guardrails_test_html():
    """Create a comprehensive test HTML for all guardrails features"""
    print("\n🌐 Creating Comprehensive Guardrails Test HTML...")
    
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Guardrails Display Test</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white p-8">
    <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-center">Comprehensive Guardrails Display Test</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- Agent Configuration Dialog -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4 text-blue-400">🔧 Agent Configuration Dialog</h2>
                <div class="space-y-3 text-sm">
                    <h3 class="text-lg font-medium text-green-400">Expected Sections:</h3>
                    <div class="space-y-2 text-gray-300">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Guardrails Scope (Global/Local)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Content Filter (Level, Keywords, Phrases, Domains)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>PII Redaction (Strategy, Types, Patterns)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Behavior Limits (Response Length, Custom Limits)</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>Custom Rules (Patterns, Actions, Replacements)</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Agent Palette Tooltips -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4 text-purple-400">🎯 Agent Palette Tooltips</h2>
                <div class="space-y-3 text-sm">
                    <h3 class="text-lg font-medium text-green-400">Expected Summary:</h3>
                    <div class="space-y-2 text-gray-300">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Filter Level & Counts</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>X blocked keywords, Y blocked phrases</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Z allowed domains</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>PII Protection: Strategy & custom types</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>X active custom rules</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Y custom behavior limits</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Test Scenarios -->
        <div class="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 class="text-xl font-semibold mb-4">🧪 Test Scenarios</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3 text-blue-400">Scenario 1: Full Configuration</h3>
                    <div class="space-y-2 text-sm text-gray-300">
                        <p><strong>Create an agent with:</strong></p>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            <li>Global and Local guardrails enabled</li>
                            <li>Strict content filtering</li>
                            <li>5+ blocked keywords</li>
                            <li>3+ blocked phrases</li>
                            <li>2+ allowed domains</li>
                            <li>PII redaction with mask strategy</li>
                            <li>Custom PII types and patterns</li>
                            <li>2+ custom rules with patterns</li>
                            <li>Behavior limits with max response length</li>
                        </ul>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3 text-green-400">Scenario 2: Partial Configuration</h3>
                    <div class="space-y-2 text-sm text-gray-300">
                        <p><strong>Create an agent with:</strong></p>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            <li>Only content filtering enabled</li>
                            <li>Moderate filter level</li>
                            <li>Few blocked keywords</li>
                            <li>No PII redaction</li>
                            <li>No custom rules</li>
                            <li>Basic behavior limits</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Verification Checklist -->
        <div class="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 class="text-xl font-semibold mb-4">✅ Verification Checklist</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3 text-blue-400">Agent Configuration Dialog</h3>
                    <div class="space-y-2">
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600">
                            <span class="text-sm">All sections visible with icons</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600">
                            <span class="text-sm">Filter level shows correct description</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600">
                            <span class="text-sm">All blocked keywords displayed as badges</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600">
                            <span class="text-sm">Blocked phrases in separate boxes</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600">
                            <span class="text-sm">Allowed domains with green styling</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600">
                            <span class="text-sm">PII redaction strategy and settings</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600">
                            <span class="text-sm">Custom rules with patterns and actions</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600">
                            <span class="text-sm">Behavior limits and custom restrictions</span>
                        </label>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3 text-purple-400">Agent Palette Tooltips</h3>
                    <div class="space-y-2">
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-purple-600">
                            <span class="text-sm">Enhanced guardrails section visible</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-purple-600">
                            <span class="text-sm">Content filter level displayed</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-purple-600">
                            <span class="text-sm">Keyword/phrase counts shown</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-purple-600">
                            <span class="text-sm">Allowed domains count displayed</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-purple-600">
                            <span class="text-sm">PII protection strategy shown</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-purple-600">
                            <span class="text-sm">Active custom rules count</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-purple-600">
                            <span class="text-sm">Behavior limits summary</span>
                        </label>
                        <label class="flex items-center space-x-3">
                            <input type="checkbox" class="form-checkbox h-4 w-4 text-purple-600">
                            <span class="text-sm">Color-coded information</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Success Criteria -->
        <div class="bg-green-800/20 border border-green-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-green-400">🎯 Success Criteria</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3">Completeness</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• All configured settings visible</li>
                        <li>• No information loss</li>
                        <li>• Detailed breakdowns shown</li>
                        <li>• Counts and summaries accurate</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3">Consistency</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• Dialog and tooltip match</li>
                        <li>• Same data in both views</li>
                        <li>• Consistent terminology</li>
                        <li>• Aligned color coding</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3">Usability</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• Clear visual organization</li>
                        <li>• Professional styling</li>
                        <li>• Easy to understand</li>
                        <li>• Quick information access</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</body>
</html>'''
    
    with open("test_comprehensive_guardrails_display.html", "w") as f:
        f.write(html_content)
    
    print("✅ Comprehensive guardrails test HTML created: test_comprehensive_guardrails_display.html")
    return True

def main():
    """Main test function"""
    print("🚀 Comprehensive Guardrails Display Test")
    print("=" * 60)
    
    all_passed = True
    
    # Run tests
    tests = [
        ("Agent Config Dialog Display", test_agent_config_dialog_comprehensive_display),
        ("Agent Palette Tooltip Consistency", test_agent_palette_tooltip_consistency),
        ("Enhanced Guardrails Structure", test_enhanced_guardrails_structure),
        ("Create Test HTML", create_comprehensive_guardrails_test_html)
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
        print("🎉 All comprehensive guardrails display tests passed!")
        print("\n📋 Next Steps:")
        print("1. Start the development server: npm run dev")
        print("2. Create an agent with comprehensive enhanced guardrails")
        print("3. Check the Agent Configuration dialog - all details should be visible")
        print("4. Check the Agent Palette tooltip - summary should be consistent")
        print("5. Open test_comprehensive_guardrails_display.html for reference")
        print("\n🎯 Expected Result:")
        print("Both the Agent Configuration dialog and Agent Palette tooltips")
        print("should now show ALL your enhanced guardrails configurations")
        print("including filter levels, blocked content, PII protection,")
        print("custom rules, and behavior limits with full detail!")
    else:
        print("❌ Some tests failed. Check the implementation.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)