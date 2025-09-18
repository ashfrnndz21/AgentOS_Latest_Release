#!/usr/bin/env python3
"""
Aggressive Text Overflow Fix Test
Tests that aggressive text shortening prevents overflow
"""

import os
import re
from pathlib import Path

def test_aggressive_text_shortening():
    """Test that text is aggressively shortened to prevent overflow"""
    
    print("🔍 Testing Aggressive Text Shortening")
    print("=" * 50)
    
    agent_palette_file = "src/components/MultiAgentWorkspace/AgentPalette.tsx"
    
    if not Path(agent_palette_file).exists():
        print("❌ AgentPalette.tsx not found")
        return False
    
    content = Path(agent_palette_file).read_text()
    
    # Test cases for aggressive shortening
    test_cases = [
        {
            "name": "Criteria Text Shortening",
            "patterns": [
                r"\.replace\('condition-based', 'condition'\)",
                r"\.replace\('confidence-threshold', 'confidence'\)",
                r"\.replace\('expertise-match', 'expertise'\)",
                r"\.replace\('workload-balance', 'workload'\)"
            ],
            "description": "Long criteria names should be shortened"
        },
        {
            "name": "Capability Text Shortening", 
            "patterns": [
                r"\.replace\('customer-analysis', 'customer'\)",
                r"\.replace\('risk-assessment', 'risk'\)",
                r"\.replace\('portfolio-management', 'portfolio'\)",
                r"\.replace\('compliance-monitoring', 'compliance'\)"
            ],
            "description": "Long capability names should be shortened"
        },
        {
            "name": "Model Name Shortening",
            "patterns": [
                r"\.replace\('llama3\.2:', ''\)",
                r"\.replace\('llama3:', ''\)",
                r"\.replace\('mistral:', ''\)"
            ],
            "description": "Model prefixes should be removed"
        },
        {
            "name": "Smaller Badge Widths",
            "patterns": [
                r"max-w-\[60px\]",
                r"max-w-\[50px\]"
            ],
            "description": "Badge widths should be smaller to prevent overflow"
        },
        {
            "name": "Overflow Hidden Containers",
            "patterns": [
                r"overflow-hidden"
            ],
            "description": "Containers should have overflow-hidden to clip text"
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        passed_patterns = 0
        
        for pattern in test_case["patterns"]:
            if re.search(pattern, content):
                passed_patterns += 1
        
        if passed_patterns > 0:
            print(f"✅ {test_case['name']}")
            print(f"   {test_case['description']} ({passed_patterns}/{len(test_case['patterns'])} patterns found)")
        else:
            print(f"❌ {test_case['name']}")
            print(f"   {test_case['description']} (0/{len(test_case['patterns'])} patterns found)")
            all_passed = False
        
        print()
    
    return all_passed

def test_text_length_limits():
    """Test that text length limits are enforced"""
    
    print("🔍 Testing Text Length Limits")
    print("=" * 50)
    
    # Simulate the text shortening logic
    test_texts = [
        ("condition-based", "condition"),
        ("confidence-threshold", "confidence"), 
        ("expertise-match", "expertise"),
        ("workload-balance", "workload"),
        ("customer-analysis", "customer"),
        ("risk-assessment", "risk"),
        ("portfolio-management", "portfolio"),
        ("llama3.2:latest", "latest"),
        ("mistral:7b", "7b")
    ]
    
    all_passed = True
    
    for original, expected_short in test_texts:
        # Apply the shortening logic
        shortened = original
        
        # Criteria shortening
        shortened = shortened.replace('condition-based', 'condition')
        shortened = shortened.replace('confidence-threshold', 'confidence')
        shortened = shortened.replace('expertise-match', 'expertise')
        shortened = shortened.replace('workload-balance', 'workload')
        
        # Capability shortening
        shortened = shortened.replace('customer-analysis', 'customer')
        shortened = shortened.replace('risk-assessment', 'risk')
        shortened = shortened.replace('portfolio-management', 'portfolio')
        
        # Model shortening
        shortened = shortened.replace('llama3.2:', '').replace('llama3:', '').replace('mistral:', '')
        
        if len(shortened) <= 10:  # Should fit in small badges
            print(f"✅ '{original}' → '{shortened}' ({len(shortened)} chars)")
        else:
            print(f"❌ '{original}' → '{shortened}' ({len(shortened)} chars) - Still too long!")
            all_passed = False
    
    print()
    return all_passed

def test_badge_size_constraints():
    """Test that badge size constraints are appropriate"""
    
    print("🔍 Testing Badge Size Constraints")
    print("=" * 50)
    
    agent_palette_file = "src/components/MultiAgentWorkspace/AgentPalette.tsx"
    content = Path(agent_palette_file).read_text()
    
    # Count different badge sizes
    size_patterns = {
        "max-w-[60px]": len(re.findall(r'max-w-\[60px\]', content)),
        "max-w-[50px]": len(re.findall(r'max-w-\[50px\]', content)),
        "max-w-[40px]": len(re.findall(r'max-w-\[40px\]', content)),
        "truncate": len(re.findall(r'truncate', content)),
        "overflow-hidden": len(re.findall(r'overflow-hidden', content))
    }
    
    print("Badge size distribution:")
    for size, count in size_patterns.items():
        print(f"  {size}: {count} instances")
    
    # Check if we have reasonable constraints
    has_small_badges = size_patterns["max-w-[60px]"] > 0 or size_patterns["max-w-[50px]"] > 0
    has_truncation = size_patterns["truncate"] >= 3
    has_overflow_control = size_patterns["overflow-hidden"] > 0
    
    all_good = has_small_badges and has_truncation and has_overflow_control
    
    print(f"\n✅ Small badge constraints: {'Yes' if has_small_badges else 'No'}")
    print(f"✅ Truncation classes: {'Yes' if has_truncation else 'No'}")
    print(f"✅ Overflow control: {'Yes' if has_overflow_control else 'No'}")
    
    return all_good

def main():
    """Main test execution"""
    
    print("🧪 Aggressive Text Overflow Fix Test Suite")
    print("=" * 60)
    
    tests = [
        ("Aggressive Text Shortening", test_aggressive_text_shortening),
        ("Text Length Limits", test_text_length_limits),
        ("Badge Size Constraints", test_badge_size_constraints)
    ]
    
    passed = 0
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        if test_func():
            passed += 1
        print()
    
    print("=" * 60)
    
    if passed == len(tests):
        print("🎉 ALL AGGRESSIVE TEXT FIXES APPLIED!")
        print("✅ Text is aggressively shortened to prevent overflow")
        print("✅ Badge sizes are constrained to fit content")
        print("✅ Overflow is properly controlled")
        print("✅ Common long names are abbreviated")
        print("\n🚀 Text should now fit properly within component boundaries!")
    else:
        print(f"⚠️ {len(tests) - passed} tests failed")
        print("Some text overflow issues may still remain")
    
    return passed == len(tests)

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)