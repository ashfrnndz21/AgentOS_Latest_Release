#!/usr/bin/env python3
"""
Quick Card Import Verification
"""

import os
from pathlib import Path

def check_card_imports():
    """Check Card imports in node components"""
    
    node_files = [
        "src/components/MultiAgentWorkspace/nodes/ModernAgentNode.tsx",
        "src/components/MultiAgentWorkspace/nodes/ModernHandoffNode.tsx", 
        "src/components/MultiAgentWorkspace/nodes/ModernAggregatorNode.tsx",
        "src/components/MultiAgentWorkspace/nodes/ModernMonitorNode.tsx",
        "src/components/MultiAgentWorkspace/nodes/ModernHumanNode.tsx",
        "src/components/MultiAgentWorkspace/nodes/ModernMCPToolNode.tsx"
    ]
    
    print("🔍 Checking Card imports in node components...")
    print("=" * 50)
    
    all_good = True
    
    for file_path in node_files:
        if Path(file_path).exists():
            content = Path(file_path).read_text()
            
            # Check for Card import
            has_card_import = "import { Card }" in content
            
            # Check for Card usage
            has_card_usage = "<Card" in content
            
            status = "✅" if (has_card_import or not has_card_usage) else "❌"
            
            print(f"{status} {Path(file_path).name}")
            print(f"   Import: {'Yes' if has_card_import else 'No'}")
            print(f"   Usage:  {'Yes' if has_card_usage else 'No'}")
            
            if has_card_usage and not has_card_import:
                print(f"   ⚠️  ISSUE: Uses Card but missing import!")
                all_good = False
            
            print()
        else:
            print(f"❌ {file_path} - File not found")
            all_good = False
    
    # Check Card component exists
    card_file = "src/components/ui/card.tsx"
    if Path(card_file).exists():
        print("✅ Card component file exists")
        
        content = Path(card_file).read_text()
        if "export { Card" in content:
            print("✅ Card component properly exported")
        else:
            print("❌ Card component export issue")
            all_good = False
    else:
        print("❌ Card component file missing")
        all_good = False
    
    print("\n" + "=" * 50)
    if all_good:
        print("🎉 All Card imports are correct!")
        print("✅ No ReferenceError issues detected")
    else:
        print("⚠️  Issues found with Card imports")
    
    return all_good

if __name__ == "__main__":
    check_card_imports()