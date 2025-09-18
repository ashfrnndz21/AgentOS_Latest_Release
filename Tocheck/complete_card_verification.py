#!/usr/bin/env python3
"""
Complete Card Import Verification
Checks all components that use Card to ensure proper imports
"""

import os
import re
from pathlib import Path

def find_card_usage_files():
    """Find all files that use Card component"""
    
    card_usage_files = []
    
    # Search in src/components directory
    for file_path in Path("src/components").rglob("*.tsx"):
        if file_path.exists():
            content = file_path.read_text()
            if "<Card" in content:
                card_usage_files.append(str(file_path))
    
    return card_usage_files

def check_card_import(file_path):
    """Check if a file has proper Card import"""
    
    content = Path(file_path).read_text()
    
    # Check for Card import patterns
    import_patterns = [
        r"import\s*{\s*Card\s*}\s*from",
        r"import\s*{\s*[^}]*Card[^}]*}\s*from"
    ]
    
    has_import = any(re.search(pattern, content) for pattern in import_patterns)
    has_usage = "<Card" in content
    
    return {
        "file": file_path,
        "has_import": has_import,
        "has_usage": has_usage,
        "needs_fix": has_usage and not has_import
    }

def main():
    """Main verification function"""
    
    print("🔍 Complete Card Import Verification")
    print("=" * 60)
    
    # Find all files using Card
    card_files = find_card_usage_files()
    
    print(f"Found {len(card_files)} files using Card component:")
    print()
    
    issues_found = []
    
    for file_path in sorted(card_files):
        result = check_card_import(file_path)
        
        status = "✅" if not result["needs_fix"] else "❌"
        file_name = Path(file_path).name
        
        print(f"{status} {file_name}")
        print(f"   Path: {file_path}")
        print(f"   Import: {'Yes' if result['has_import'] else 'No'}")
        print(f"   Usage:  {'Yes' if result['has_usage'] else 'No'}")
        
        if result["needs_fix"]:
            print(f"   🚨 ISSUE: Uses Card but missing import!")
            issues_found.append(result)
        
        print()
    
    # Check Card component itself
    print("📦 Card Component Check:")
    card_component_path = "src/components/ui/card.tsx"
    if Path(card_component_path).exists():
        content = Path(card_component_path).read_text()
        if "export { Card" in content:
            print("✅ Card component properly exported")
        else:
            print("❌ Card component export issue")
            issues_found.append({"file": card_component_path, "issue": "export"})
    else:
        print("❌ Card component file missing")
        issues_found.append({"file": card_component_path, "issue": "missing"})
    
    print("\n" + "=" * 60)
    
    if not issues_found:
        print("🎉 ALL CARD IMPORTS ARE CORRECT!")
        print("✅ No ReferenceError issues detected")
        print("✅ All components properly import Card")
        print("✅ Card component is properly exported")
        print("\n🚀 The Multi-Agent Workspace should work without Card errors!")
    else:
        print(f"⚠️  Found {len(issues_found)} issues:")
        for issue in issues_found:
            print(f"   - {issue['file']}")
        
        print("\n🔧 Recommended fixes:")
        for issue in issues_found:
            if issue.get("needs_fix"):
                print(f"   - Add Card import to {issue['file']}")
    
    return len(issues_found) == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)