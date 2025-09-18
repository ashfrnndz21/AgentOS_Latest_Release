#!/usr/bin/env python3

"""
Enhanced Agent Palette Tooltip Fix Test
Tests the improved tooltip implementation with better positioning and detailed agent information.
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

def test_tooltip_implementation():
    """Test the enhanced tooltip implementation"""
    print("🔧 Testing Enhanced Agent Palette Tooltip Implementation...")
    
    # Check if the AgentPalette file has the correct tooltip structure
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    
    if not palette_file.exists():
        print("❌ AgentPalette.tsx not found!")
        return False
    
    content = palette_file.read_text()
    
    # Check for key tooltip features
    checks = [
        ("Fixed positioning", "position: 'fixed'" in content or 'className="fixed' in content),
        ("High z-index", "z-[9999]" in content or "zIndex: 10000" in content),
        ("Backdrop blur", "backdrop-blur" in content),
        ("Agent configuration details", "Agent Configuration:" in content),
        ("Capabilities display", "Capabilities" in content),
        ("Security status", "Security:" in content or "Guardrails:" in content),
        ("Model information", "Model:" in content),
        ("Tooltip arrow", "Tooltip Arrow" in content),
        ("Hover transitions", "group-hover:opacity-100" in content),
        ("Pointer events disabled", "pointer-events-none" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"\n📊 Tooltip Implementation: {passed}/{len(checks)} checks passed")
    
    return passed == len(checks)

def test_agent_details_structure():
    """Test that agent details are properly structured"""
    print("\n🎯 Testing Agent Details Structure...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    content = palette_file.read_text()
    
    # Check for detailed agent information sections
    detail_checks = [
        ("Agent name and role", "agent.name" in content and "agent.role" in content),
        ("Agent description", "agent.description" in content),
        ("Model information", "agent.model" in content),
        ("Agent type", "agent.type" in content),
        ("Capabilities array", "agent.capabilities" in content),
        ("Guardrails status", "agent.guardrails" in content),
        ("Professional icons", "getProfessionalAgentIcon" in content),
        ("Dynamic descriptions", "specialized for intelligent task processing" in content),
        ("Configuration grid", "grid grid-cols-2" in content),
        ("Usage instructions", "Drag to canvas or click to add" in content)
    ]
    
    passed = 0
    for check_name, condition in detail_checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"\n📊 Agent Details: {passed}/{len(detail_checks)} checks passed")
    
    return passed == len(detail_checks)

def test_tooltip_positioning():
    """Test tooltip positioning and overflow handling"""
    print("\n📐 Testing Tooltip Positioning...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    content = palette_file.read_text()
    
    positioning_checks = [
        ("Fixed positioning used", "fixed" in content and "bg-gray-900" in content),
        ("Proper left positioning", "left: '400px'" in content or "left: 'calc(100%" in content),
        ("Vertical centering", "translateY(-50%)" in content),
        ("High z-index", "zIndex: 10000" in content or "z-[9999]" in content),
        ("Overflow handling", "overflowX: 'visible'" in content or "overflow-x-visible" in content),
        ("Transition effects", "transition-all duration-300" in content),
        ("Hover states", "group-hover:opacity-100" in content and "group-hover:visible" in content),
        ("Pointer events", "pointer-events-none" in content)
    ]
    
    passed = 0
    for check_name, condition in positioning_checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"\n📊 Tooltip Positioning: {passed}/{len(positioning_checks)} checks passed")
    
    return passed == len(positioning_checks)

def create_test_html():
    """Create a test HTML file to verify tooltip functionality"""
    print("\n🌐 Creating tooltip test HTML...")
    
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Agent Palette Tooltip Test</title>
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
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-center">Enhanced Agent Palette Tooltip Test</h1>
        
        <div class="bg-gray-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Test Instructions</h2>
            <div class="space-y-4 text-gray-300">
                <p>1. Start the development server: <code class="bg-gray-700 px-2 py-1 rounded">npm run dev</code></p>
                <p>2. Navigate to the Multi-Agent Workspace</p>
                <p>3. Hover over agents in the palette to see enhanced tooltips</p>
                <p>4. Verify the following tooltip features:</p>
                <ul class="list-disc list-inside ml-4 space-y-2">
                    <li>Tooltip appears to the right of the agent card</li>
                    <li>Shows agent name, role, and description</li>
                    <li>Displays model and type information</li>
                    <li>Lists capabilities as colored badges</li>
                    <li>Shows security status (Protected/Basic)</li>
                    <li>Includes usage instructions</li>
                    <li>Has a visual arrow pointing to the agent</li>
                    <li>Tooltip is not clipped by parent containers</li>
                    <li>Smooth transitions on hover</li>
                    <li>High z-index ensures it appears above other elements</li>
                </ul>
            </div>
        </div>
        
        <div class="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4">Expected Tooltip Content</h2>
            <div class="bg-gray-700 p-4 rounded border">
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg bg-gray-600 text-blue-400">
                            <div class="w-5 h-5 bg-blue-400 rounded"></div>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold">Resume Screening Agent</h3>
                            <p class="text-xs text-gray-400">Expert in screening talent</p>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-xs font-medium text-gray-300 mb-1">Description</h4>
                        <p class="text-xs text-gray-400">You are to screen for resumes and find the right fit for roles for the hiring managers</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <span class="text-gray-400">Model:</span>
                            <div class="text-white font-medium">llama3.2:latest</div>
                        </div>
                        <div>
                            <span class="text-gray-400">Type:</span>
                            <div class="text-white font-medium">ollama</div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-xs font-medium text-gray-300 mb-2">Capabilities</h4>
                        <div class="flex flex-wrap gap-1">
                            <span class="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">Analysis</span>
                            <span class="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">Screening</span>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-400">Security:</span>
                        <span class="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs rounded">Protected</span>
                    </div>
                    
                    <div class="pt-2 border-t border-gray-600">
                        <p class="text-xs text-gray-500 text-center">Drag to canvas or click to add to workflow</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-8 bg-green-800/20 border border-green-600 p-6 rounded-lg">
            <h2 class="text-xl font-semibold mb-4 text-green-400">✅ Success Criteria</h2>
            <div class="space-y-2 text-green-300">
                <p>• Tooltips appear without being clipped</p>
                <p>• All agent configuration details are visible</p>
                <p>• Smooth hover transitions work properly</p>
                <p>• Tooltips have proper z-index and positioning</p>
                <p>• Content matches the agent configuration dialog</p>
            </div>
        </div>
    </div>
</body>
</html>'''
    
    with open("test_enhanced_tooltip.html", "w") as f:
        f.write(html_content)
    
    print("✅ Test HTML created: test_enhanced_tooltip.html")
    return True

def main():
    """Main test function"""
    print("🚀 Enhanced Agent Palette Tooltip Fix Test")
    print("=" * 50)
    
    all_passed = True
    
    # Run tests
    tests = [
        ("Tooltip Implementation", test_tooltip_implementation),
        ("Agent Details Structure", test_agent_details_structure),
        ("Tooltip Positioning", test_tooltip_positioning),
        ("Test HTML Creation", create_test_html)
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
        print("3. Hover over agents in the palette")
        print("4. Verify tooltips show detailed configuration info")
        print("5. Open test_enhanced_tooltip.html for reference")
    else:
        print("❌ Some tests failed. Check the implementation.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)