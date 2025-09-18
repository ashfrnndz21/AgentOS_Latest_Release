#!/usr/bin/env python3
"""
Text Overflow Fix Test
Tests that text overflow issues in Agent Palette are resolved
"""

import os
import re
from pathlib import Path

def test_badge_truncation():
    """Test that Badge components have proper truncation classes"""
    
    print("🔍 Testing Badge Text Overflow Fixes")
    print("=" * 50)
    
    agent_palette_file = "src/components/MultiAgentWorkspace/AgentPalette.tsx"
    
    if not Path(agent_palette_file).exists():
        print("❌ AgentPalette.tsx not found")
        return False
    
    content = Path(agent_palette_file).read_text()
    
    # Test cases for proper truncation
    test_cases = [
        {
            "name": "Utility Node Criteria Badges",
            "pattern": r'Badge.*variant="outline".*className="text-xs px-1 py-0 border-gray-600 max-w-\[80px\] truncate"',
            "description": "Utility node criteria should have max-width and truncate"
        },
        {
            "name": "Agent Capabilities Badges", 
            "pattern": r'Badge.*variant="outline".*className="text-xs px-1 py-0 border-gray-600 max-w-\[70px\] truncate"',
            "description": "Agent capabilities should have max-width and truncate"
        },
        {
            "name": "Agent Model Badge",
            "pattern": r'Badge.*variant="secondary".*className="text-xs px-1\.5 py-0\.5 bg-gray-700 max-w-\[80px\] truncate"',
            "description": "Agent model badge should have max-width and truncate"
        },
        {
            "name": "MCP Tool Category Badge",
            "pattern": r'Badge.*variant="outline".*className="text-xs px-1\.5 py-0\.5 h-5 border-gray-600 max-w-\[60px\] truncate"',
            "description": "MCP tool category should have max-width and truncate"
        },
        {
            "name": "MCP Tool Complexity Badge",
            "pattern": r'Badge.*variant="outline".*className=.*max-w-\[50px\] truncate',
            "description": "MCP tool complexity should have max-width and truncate"
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        found = re.search(test_case["pattern"], content, re.DOTALL)
        
        if found:
            print(f"✅ {test_case['name']}")
            print(f"   {test_case['description']}")
        else:
            print(f"❌ {test_case['name']}")
            print(f"   {test_case['description']}")
            all_passed = False
        
        print()
    
    return all_passed

def test_text_improvements():
    """Test for text improvement features"""
    
    print("🔍 Testing Text Improvement Features")
    print("=" * 50)
    
    agent_palette_file = "src/components/MultiAgentWorkspace/AgentPalette.tsx"
    content = Path(agent_palette_file).read_text()
    
    improvements = [
        {
            "name": "Criterion Text Formatting",
            "pattern": r"criterion\.replace\('-', ' '\)",
            "description": "Criteria text should replace hyphens with spaces for readability"
        },
        {
            "name": "Flex Wrap for Badges",
            "pattern": r'className="flex gap-1 flex-wrap"',
            "description": "Badge containers should have flex-wrap to prevent overflow"
        },
        {
            "name": "Min Width Zero",
            "pattern": r'className="flex-1 min-w-0',
            "description": "Flex containers should have min-w-0 to allow truncation"
        },
        {
            "name": "Line Clamp for Descriptions",
            "pattern": r'className="text-xs text-gray-400.*line-clamp-2',
            "description": "Descriptions should use line-clamp for multi-line truncation"
        }
    ]
    
    all_passed = True
    
    for improvement in improvements:
        found = re.search(improvement["pattern"], content)
        
        if found:
            print(f"✅ {improvement['name']}")
            print(f"   {improvement['description']}")
        else:
            print(f"❌ {improvement['name']}")
            print(f"   {improvement['description']}")
            all_passed = False
        
        print()
    
    return all_passed

def test_layout_constraints():
    """Test layout constraints to prevent overflow"""
    
    print("🔍 Testing Layout Constraints")
    print("=" * 50)
    
    agent_palette_file = "src/components/MultiAgentWorkspace/AgentPalette.tsx"
    content = Path(agent_palette_file).read_text()
    
    constraints = [
        {
            "name": "Standard Card Dimensions",
            "pattern": r'STANDARD_CARD_HEIGHT.*STANDARD_CARD_WIDTH',
            "description": "Cards should use standardized dimensions"
        },
        {
            "name": "Truncate Class Usage",
            "count": len(re.findall(r'truncate', content)),
            "min_expected": 5,
            "description": "Should have multiple truncate classes for text overflow prevention"
        },
        {
            "name": "Max Width Classes",
            "count": len(re.findall(r'max-w-\[', content)),
            "min_expected": 4,
            "description": "Should have multiple max-width constraints"
        }
    ]
    
    all_passed = True
    
    for constraint in constraints:
        if "pattern" in constraint:
            found = re.search(constraint["pattern"], content)
            if found:
                print(f"✅ {constraint['name']}")
                print(f"   {constraint['description']}")
            else:
                print(f"❌ {constraint['name']}")
                print(f"   {constraint['description']}")
                all_passed = False
        elif "count" in constraint:
            if constraint["count"] >= constraint["min_expected"]:
                print(f"✅ {constraint['name']}")
                print(f"   Found {constraint['count']} instances (expected >= {constraint['min_expected']})")
            else:
                print(f"❌ {constraint['name']}")
                print(f"   Found {constraint['count']} instances (expected >= {constraint['min_expected']})")
                all_passed = False
        
        print()
    
    return all_passed

def main():
    """Main test execution"""
    
    print("🧪 Text Overflow Fix Test Suite")
    print("=" * 60)
    
    tests = [
        ("Badge Truncation", test_badge_truncation),
        ("Text Improvements", test_text_improvements),
        ("Layout Constraints", test_layout_constraints)
    ]
    
    passed = 0
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        if test_func():
            passed += 1
        print()
    
    print("=" * 60)
    
    if passed == len(tests):
        print("🎉 ALL TEXT OVERFLOW FIXES APPLIED!")
        print("✅ Badge components have proper truncation")
        print("✅ Text formatting improvements implemented")
        print("✅ Layout constraints prevent overflow")
        print("✅ Agent Palette should display text properly")
        print("\n🚀 Text should no longer spill outside component boundaries!")
    else:
        print(f"⚠️ {len(tests) - passed} tests failed")
        print("Some text overflow issues may remain")
    
    return passed == len(tests)

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)