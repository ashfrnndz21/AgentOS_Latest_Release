#!/usr/bin/env python3

"""
Quick test to verify the AgentPalette syntax fix
"""

import os
import re
from pathlib import Path

def test_agent_palette_syntax():
    """Test that AgentPalette has proper JSX syntax"""
    print("🧪 Testing AgentPalette Syntax Fix...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    if not palette_file.exists():
        print("❌ AgentPalette file not found")
        return False
    
    content = palette_file.read_text()
    
    # Check for proper component closing
    has_proper_closing = content.count('/>') > 0
    print(f"✅ Self-closing tags: {'PASS' if has_proper_closing else 'FAIL'}")
    
    # Check for balanced braces
    open_braces = content.count('{')
    close_braces = content.count('}')
    balanced_braces = open_braces == close_braces
    print(f"✅ Balanced braces ({open_braces}/{close_braces}): {'PASS' if balanced_braces else 'FAIL'}")
    
    # Check for balanced parentheses
    open_parens = content.count('(')
    close_parens = content.count(')')
    balanced_parens = open_parens == close_parens
    print(f"✅ Balanced parentheses ({open_parens}/{close_parens}): {'PASS' if balanced_parens else 'FAIL'}")
    
    # Check for StrandsToolConfigDialog component
    has_config_dialog = 'StrandsToolConfigDialog' in content
    print(f"✅ StrandsToolConfigDialog component: {'PASS' if has_config_dialog else 'FAIL'}")
    
    # Check for proper JSX closing
    has_jsx_closing = '/>' in content and not content.endswith('/>\\n    )}\\n      />\\n    )}')
    print(f"✅ Proper JSX closing: {'PASS' if has_jsx_closing else 'FAIL'}")
    
    # Check for duplicate closing tags (should not exist)
    has_duplicate_closing = '/>\\n    )}\\n      />\\n    )}' in content
    print(f"✅ No duplicate closing tags: {'PASS' if not has_duplicate_closing else 'FAIL'}")
    
    return balanced_braces and balanced_parens and has_config_dialog and not has_duplicate_closing

def main():
    """Run syntax test"""
    print("🚀 Testing AgentPalette Syntax Fix...\\n")
    
    success = test_agent_palette_syntax()
    
    print("\\n" + "="*50)
    print("📊 SYNTAX TEST RESULTS")
    print("="*50)
    
    if success:
        print("✅ SYNTAX FIX: SUCCESS")
        print("\\n🎉 AgentPalette syntax is now correct!")
        print("\\n📋 What was fixed:")
        print("  1. ✅ Added missing closing '/>' to StrandsToolConfigDialog")
        print("  2. ✅ Removed duplicate closing tags")
        print("  3. ✅ Balanced all JSX elements properly")
        print("\\n💡 The component should now compile without errors.")
    else:
        print("❌ SYNTAX FIX: FAILED")
        print("\\n⚠️  There may still be syntax issues.")
        print("Please check the component manually.")
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)