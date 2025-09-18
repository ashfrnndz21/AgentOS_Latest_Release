#!/usr/bin/env python3

"""
Script to fix escaped quotes in StrandsToolConfigDialog.tsx
"""

import re
from pathlib import Path

def fix_escaped_quotes():
    """Fix all escaped quotes in the file"""
    
    file_path = Path("src/components/MultiAgentWorkspace/config/StrandsToolConfigDialog.tsx")
    
    if not file_path.exists():
        print("❌ File not found")
        return False
    
    # Read the file
    content = file_path.read_text()
    
    # Replace escaped quotes with regular quotes
    # Fix className=\"...\" to className="..."
    content = re.sub(r'className=\\"([^"]*)\\"', r'className="\1"', content)
    
    # Fix other escaped quotes in JSX attributes
    content = re.sub(r'(\w+)=\\"([^"]*)\\"', r'\1="\2"', content)
    
    # Fix escaped quotes in string literals within JSX
    content = re.sub(r'`([^`]*)\\"([^`]*)`', r'`\1"\2`', content)
    
    # Write the fixed content back
    file_path.write_text(content)
    
    print("✅ Fixed escaped quotes in StrandsToolConfigDialog.tsx")
    return True

if __name__ == "__main__":
    success = fix_escaped_quotes()
    if success:
        print("🎉 All escaped quotes have been fixed!")
    else:
        print("❌ Failed to fix escaped quotes")