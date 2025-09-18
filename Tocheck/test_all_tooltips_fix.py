#!/usr/bin/env python3

"""
All Tooltips Fix Test
Tests that agents, utilities, and MCP tools all have properly positioned tooltips
that don't get clipped by parent containers.
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

def test_agent_tooltips():
    """Test agent tooltips positioning"""
    print("🤖 Testing Agent Tooltips...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    content = palette_file.read_text()
    
    # Check for agent tooltip features
    checks = [
        ("Fixed positioning", "fixed bg-gray-900/95" in content),
        ("Proper left positioning", "left: '400px'" in content),
        ("Vertical centering", "translateY(-50%)" in content),
        ("High z-index", "zIndex: 10000" in content),
        ("Backdrop blur", "backdrop-blur-sm" in content),
        ("Pointer events disabled", "pointer-events-none" in content),
        ("Tooltip arrow", "Tooltip Arrow" in content),
        ("Complete agent configuration", "Agent Configuration:" in content),
        ("Basic Information section", "Basic Information" in content),
        ("System Prompt section", "System Prompt" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ Agent tooltips: {check_name}")
            passed += 1
        else:
            print(f"❌ Agent tooltips: {check_name}")
    
    print(f"📊 Agent Tooltips: {passed}/{len(checks)} checks passed")
    return passed >= len(checks) * 0.9

def test_utility_tooltips():
    """Test utility node tooltips positioning"""
    print("\n🔧 Testing Utility Tooltips...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    content = palette_file.read_text()
    
    # Find utility tooltips section
    utility_section_start = content.find('TabsContent value="utilities"')
    utility_section_end = content.find('TabsContent value="mcp-tools"')
    utility_section = content[utility_section_start:utility_section_end] if utility_section_start != -1 and utility_section_end != -1 else content
    
    # Check for utility tooltip features
    checks = [
        ("Fixed positioning in utilities", "fixed bg-gray-900/95" in utility_section),
        ("Proper positioning style", "left: '400px'" in utility_section and "top: '50%'" in utility_section),
        ("Transform centering", "translateY(-50%)" in utility_section),
        ("High z-index", "zIndex: 10000" in utility_section),
        ("Backdrop blur", "backdrop-blur-sm" in utility_section),
        ("Pointer events disabled", "pointer-events-none" in utility_section),
        ("Tooltip arrow for utilities", utility_section.count("Tooltip Arrow") >= 1),
        ("Configuration Options section", "Configuration Options" in utility_section),
        ("Best For section", "Best For" in utility_section),
        ("Workflow utility description", "Workflow Utility" in utility_section)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ Utility tooltips: {check_name}")
            passed += 1
        else:
            print(f"❌ Utility tooltips: {check_name}")
    
    print(f"📊 Utility Tooltips: {passed}/{len(checks)} checks passed")
    return passed >= len(checks) * 0.8

def test_mcp_tooltips():
    """Test MCP tools tooltips positioning"""
    print("\n🛠️ Testing MCP Tools Tooltips...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    content = palette_file.read_text()
    
    # Find MCP tools section
    mcp_section_start = content.find('TabsContent value="mcp-tools"')
    mcp_section = content[mcp_section_start:] if mcp_section_start != -1 else content
    
    # Check for MCP tooltip features
    checks = [
        ("Fixed positioning in MCP", "fixed bg-gray-900/95" in mcp_section),
        ("Proper positioning style", "left: '400px'" in mcp_section and "top: '50%'" in mcp_section),
        ("Transform centering", "translateY(-50%)" in mcp_section),
        ("High z-index", "zIndex: 10000" in mcp_section),
        ("Backdrop blur", "backdrop-blur-sm" in mcp_section),
        ("Pointer events disabled", "pointer-events-none" in mcp_section),
        ("Tooltip arrow for MCP", mcp_section.count("Tooltip Arrow") >= 1),
        ("Tool Details section", "Tool Details" in mcp_section),
        ("Server Info section", "Server Info" in mcp_section),
        ("Usage section", "Usage" in mcp_section and "category ===" in mcp_section),
        ("MCP Tool description", "MCP Tool" in mcp_section)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ MCP tooltips: {check_name}")
            passed += 1
        else:
            print(f"❌ MCP tooltips: {check_name}")
    
    print(f"📊 MCP Tools Tooltips: {passed}/{len(checks)} checks passed")
    return passed >= len(checks) * 0.8

def test_consistent_positioning():
    """Test that all tooltips use consistent positioning"""
    print("\n📐 Testing Consistent Positioning Across All Tooltips...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    content = palette_file.read_text()
    
    # Count occurrences of consistent positioning patterns
    fixed_positioning_count = content.count("fixed bg-gray-900/95")
    left_400px_count = content.count("left: '400px'")
    translate_y_count = content.count("translateY(-50%)")
    z_index_count = content.count("zIndex: 10000")
    backdrop_blur_count = content.count("backdrop-blur-sm")
    pointer_events_count = content.count("pointer-events-none")
    tooltip_arrow_count = content.count("Tooltip Arrow")
    
    # We expect at least 3 of each (agents, utilities, MCP tools)
    expected_count = 3
    
    checks = [
        ("Consistent fixed positioning", fixed_positioning_count >= expected_count),
        ("Consistent left positioning", left_400px_count >= expected_count),
        ("Consistent vertical centering", translate_y_count >= expected_count),
        ("Consistent z-index", z_index_count >= expected_count),
        ("Consistent backdrop blur", backdrop_blur_count >= expected_count),
        ("Consistent pointer events", pointer_events_count >= expected_count),
        ("Consistent tooltip arrows", tooltip_arrow_count >= expected_count)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ Consistency: {check_name}")
            passed += 1
        else:
            print(f"❌ Consistency: {check_name}")
    
    print(f"📊 Positioning Consistency: {passed}/{len(checks)} checks passed")
    
    # Print counts for debugging
    print(f"\n🔍 Debug Info:")
    print(f"   Fixed positioning: {fixed_positioning_count} occurrences")
    print(f"   Left 400px: {left_400px_count} occurrences")
    print(f"   TranslateY: {translate_y_count} occurrences")
    print(f"   Z-index 10000: {z_index_count} occurrences")
    print(f"   Backdrop blur: {backdrop_blur_count} occurrences")
    print(f"   Pointer events: {pointer_events_count} occurrences")
    print(f"   Tooltip arrows: {tooltip_arrow_count} occurrences")
    
    return passed == len(checks)

def create_comprehensive_tooltip_test_html():
    """Create a comprehensive test HTML for all tooltips"""
    print("\n🌐 Creating comprehensive tooltip test HTML...")
    
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Tooltips Fix Test</title>
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
        <h1 class="text-3xl font-bold mb-8 text-center">All Tooltips Fix Test</h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <!-- Agents Tooltips -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4 text-blue-400">🤖 Agent Tooltips</h2>
                <div class="space-y-3 text-sm">
                    <div class="text-green-400">✅ Expected Features:</div>
                    <ul class="list-disc list-inside ml-4 space-y-1 text-gray-300">
                        <li>Complete agent configuration</li>
                        <li>Basic Information section</li>
                        <li>Model Configuration details</li>
                        <li>Capabilities as badges</li>
                        <li>Security & Guardrails status</li>
                        <li>System Prompt (scrollable)</li>
                        <li>Professional styling</li>
                        <li>Fixed positioning (no clipping)</li>
                    </ul>
                </div>
            </div>

            <!-- Utilities Tooltips -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4 text-yellow-400">🔧 Utility Tooltips</h2>
                <div class="space-y-3 text-sm">
                    <div class="text-green-400">✅ Expected Features:</div>
                    <ul class="list-disc list-inside ml-4 space-y-1 text-gray-300">
                        <li>Node type and description</li>
                        <li>Configuration Options</li>
                        <li>Best For use cases</li>
                        <li>Color-coded indicators</li>
                        <li>Professional icons</li>
                        <li>Usage instructions</li>
                        <li>Fixed positioning (no clipping)</li>
                        <li>Consistent styling</li>
                    </ul>
                </div>
            </div>

            <!-- MCP Tools Tooltips -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <h2 class="text-xl font-semibold mb-4 text-purple-400">🛠️ MCP Tools Tooltips</h2>
                <div class="space-y-3 text-sm">
                    <div class="text-green-400">✅ Expected Features:</div>
                    <ul class="list-disc list-inside ml-4 space-y-1 text-gray-300">
                        <li>Tool name and description</li>
                        <li>Category and complexity</li>
                        <li>Server information</li>
                        <li>Usage examples</li>
                        <li>Verification status</li>
                        <li>Action instructions</li>
                        <li>Fixed positioning (no clipping)</li>
                        <li>Consistent styling</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Test Instructions -->
        <div class="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 class="text-xl font-semibold mb-4">📋 Test Instructions</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3 text-blue-400">Setup</h3>
                    <ol class="list-decimal list-inside space-y-2 text-gray-300">
                        <li>Start the development server: <code class="bg-gray-700 px-2 py-1 rounded">npm run dev</code></li>
                        <li>Navigate to Multi-Agent Workspace</li>
                        <li>Open the Agent Palette on the left</li>
                        <li>Switch between Agents, Utilities, and MCP Tools tabs</li>
                    </ol>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3 text-green-400">Testing</h3>
                    <ol class="list-decimal list-inside space-y-2 text-gray-300">
                        <li>Hover over items in each tab</li>
                        <li>Verify tooltips appear to the right</li>
                        <li>Check that tooltips are not clipped</li>
                        <li>Confirm all content is visible</li>
                    </ol>
                </div>
            </div>
        </div>
        
        <!-- Positioning Details -->
        <div class="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 class="text-xl font-semibold mb-4">📐 Positioning Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3 text-blue-400">Fixed Positioning</h3>
                    <div class="bg-gray-700 p-3 rounded">
                        <code class="text-sm text-gray-300">
                            position: fixed;<br>
                            left: 400px;<br>
                            top: 50%;<br>
                            transform: translateY(-50%);<br>
                            z-index: 10000;
                        </code>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3 text-green-400">Benefits</h3>
                    <ul class="list-disc list-inside space-y-2 text-gray-300">
                        <li>No clipping by parent containers</li>
                        <li>Consistent positioning across tabs</li>
                        <li>High z-index ensures visibility</li>
                        <li>Proper vertical centering</li>
                        <li>Professional backdrop blur effect</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Success Criteria -->
        <div class="bg-green-800/20 border border-green-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-green-400">✅ Success Criteria</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3">Agents Tab</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• Complete configuration tooltips</li>
                        <li>• No clipping issues</li>
                        <li>• Professional styling</li>
                        <li>• Smooth transitions</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3">Utilities Tab</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• Detailed node information</li>
                        <li>• Configuration options visible</li>
                        <li>• No clipping issues</li>
                        <li>• Consistent positioning</li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium mb-3">MCP Tools Tab</h3>
                    <ul class="space-y-2 text-green-300">
                        <li>• Complete tool details</li>
                        <li>• Server information visible</li>
                        <li>• No clipping issues</li>
                        <li>• Consistent styling</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</body>
</html>'''
    
    with open("test_all_tooltips_fix.html", "w") as f:
        f.write(html_content)
    
    print("✅ Comprehensive tooltip test HTML created: test_all_tooltips_fix.html")
    return True

def main():
    """Main test function"""
    print("🚀 All Tooltips Fix Test")
    print("=" * 50)
    
    all_passed = True
    
    # Run tests
    tests = [
        ("Agent Tooltips", test_agent_tooltips),
        ("Utility Tooltips", test_utility_tooltips),
        ("MCP Tools Tooltips", test_mcp_tooltips),
        ("Consistent Positioning", test_consistent_positioning),
        ("Test HTML Creation", create_comprehensive_tooltip_test_html)
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
        print("🎉 All tooltip tests passed!")
        print("\n📋 Next Steps:")
        print("1. Start the development server: npm run dev")
        print("2. Navigate to Multi-Agent Workspace")
        print("3. Test all three tabs: Agents, Utilities, MCP Tools")
        print("4. Hover over items in each tab")
        print("5. Verify tooltips appear properly positioned")
        print("6. Open test_all_tooltips_fix.html for reference")
        print("\n🎯 Expected Result:")
        print("All tooltips (agents, utilities, MCP tools) should now")
        print("appear to the right without being clipped by containers!")
    else:
        print("❌ Some tests failed. Check the implementation.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)