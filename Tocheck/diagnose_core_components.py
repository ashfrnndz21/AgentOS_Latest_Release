#!/usr/bin/env python3

import os
import re

print("🔍 DIAGNOSING CORE COMPONENTS")
print("=" * 60)

# Check Layout component
print("\n1️⃣ LAYOUT COMPONENT ANALYSIS:")
if os.path.exists("src/components/Layout.tsx"):
    with open("src/components/Layout.tsx", 'r') as f:
        layout_content = f.read()
    
    # Check for common issues
    issues = []
    
    # Check imports
    if 'Sidebar' not in layout_content:
        issues.append("Missing Sidebar import")
    
    if 'MainContent' not in layout_content:
        issues.append("Missing MainContent import")
    
    # Check for syntax errors
    open_braces = layout_content.count('{')
    close_braces = layout_content.count('}')
    if open_braces != close_braces:
        issues.append(f"Unmatched braces: {open_braces} open, {close_braces} close")
    
    # Check for return statement
    if 'return' not in layout_content:
        issues.append("Missing return statement")
    
    if issues:
        print(f"   ⚠️ Found {len(issues)} issues:")
        for issue in issues:
            print(f"      - {issue}")
    else:
        print("   ✅ Layout component looks OK")
        
    # Show first few lines
    lines = layout_content.split('\\n')[:10]
    print("   📄 First 10 lines:")
    for i, line in enumerate(lines, 1):
        print(f"      {i:2d}: {line}")
else:
    print("   ❌ Layout.tsx not found!")

# Check Index page
print("\n2️⃣ INDEX PAGE ANALYSIS:")
if os.path.exists("src/pages/Index.tsx"):
    with open("src/pages/Index.tsx", 'r') as f:
        index_content = f.read()
    
    # Check for async operations that might hang
    hanging_patterns = [
        'useEffect.*fetch',
        'useEffect.*axios',
        'useEffect.*apiClient',
        'await.*fetch',
        'await.*axios'
    ]
    
    hanging_issues = []
    for pattern in hanging_patterns:
        if re.search(pattern, index_content, re.IGNORECASE):
            hanging_issues.append(f"Potential hanging: {pattern}")
    
    if hanging_issues:
        print(f"   ⚠️ Potential hanging operations:")
        for issue in hanging_issues:
            print(f"      - {issue}")
    else:
        print("   ✅ No obvious hanging operations")
    
    # Check imports
    import_count = len([line for line in index_content.split('\\n') if 'import' in line])
    print(f"   📦 Import count: {import_count}")
    
    if import_count > 15:
        print("   ⚠️ High import count - potential dependency issues")
else:
    print("   ❌ Index.tsx not found!")

# Check Sidebar component
print("\n3️⃣ SIDEBAR COMPONENT ANALYSIS:")
if os.path.exists("src/components/Sidebar.tsx"):
    with open("src/components/Sidebar.tsx", 'r') as f:
        sidebar_content = f.read()
    
    # Check for navigation issues
    if 'useNavigate' in sidebar_content or 'Link' in sidebar_content:
        print("   ✅ Navigation components found")
    else:
        print("   ⚠️ No navigation components found")
    
    # Check for context usage
    if 'useContext' in sidebar_content or 'Context' in sidebar_content:
        print("   📡 Uses React Context")
    
    print("   ✅ Sidebar component exists")
else:
    print("   ❌ Sidebar.tsx not found!")

# Check main.tsx
print("\n4️⃣ MAIN.TSX ANALYSIS:")
if os.path.exists("src/main.tsx"):
    with open("src/main.tsx", 'r') as f:
        main_content = f.read()
    
    if 'createRoot' in main_content:
        print("   ✅ React 18 createRoot found")
    elif 'render' in main_content:
        print("   ✅ React render found")
    else:
        print("   ❌ No render method found")
    
    if 'App' in main_content:
        print("   ✅ App component imported")
    else:
        print("   ❌ App component not imported")
else:
    print("   ❌ main.tsx not found!")

print("\n🎯 SUMMARY:")
print("   If all core components look OK, the issue is likely:")
print("   1. Complex component dependencies")
print("   2. API calls hanging on startup")
print("   3. Circular import dependencies")
print("   4. Missing environment variables")

print("\n🚀 NEXT STEPS:")
print("   1. Test current app (without problematic components)")
print("   2. If still white screen → Issue is in core components")
print("   3. If loads successfully → Issue is in disabled components")
print("   4. Test each disabled component individually")