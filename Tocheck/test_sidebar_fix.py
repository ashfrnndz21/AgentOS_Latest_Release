#!/usr/bin/env python3

import os

print("🔧 TESTING SIDEBAR FIX")
print("=" * 40)

print("\n📋 CHECKING SIDEBAR FILES:")

# Check if all required files exist
sidebar_files = [
    "src/components/ui/sidebar.tsx",
    "src/components/ui/sidebar/index.ts",
    "src/components/ui/sidebar/sidebar-components.tsx",
    "src/components/ui/sidebar/sidebar-context.tsx",
    "src/components/ui/sidebar/sidebar-provider.tsx",
    "src/components/ui/sidebar/sidebar-utils.ts"
]

all_exist = True
for file in sidebar_files:
    if os.path.exists(file):
        print(f"   ✅ {file}")
    else:
        print(f"   ❌ {file}")
        all_exist = False

if all_exist:
    print("\n✅ All sidebar files exist!")
else:
    print("\n❌ Some sidebar files are missing!")

print("\n📋 CHECKING IMPORT PATHS:")

# Check the main sidebar.tsx file
if os.path.exists("src/components/ui/sidebar.tsx"):
    with open("src/components/ui/sidebar.tsx", 'r') as f:
        content = f.read()
    
    if "./sidebar/sidebar-components" in content:
        print("   ✅ Correct import path for sidebar-components")
    else:
        print("   ❌ Wrong import path for sidebar-components")
    
    if "./sidebar/sidebar-provider" in content:
        print("   ✅ Correct import path for sidebar-provider")
    else:
        print("   ❌ Wrong import path for sidebar-provider")

# Check Layout.tsx import
if os.path.exists("src/components/Layout.tsx"):
    with open("src/components/Layout.tsx", 'r') as f:
        layout_content = f.read()
    
    if "from './ui/sidebar'" in layout_content:
        print("   ✅ Layout.tsx imports from correct path")
    else:
        print("   ❌ Layout.tsx has wrong import path")

print("\n🚀 NEXT STEPS:")
print("   1. The sidebar import issue should now be fixed")
print("   2. Restart your frontend server")
print("   3. The app should load without the import error")

print("\n💡 IF STILL HAVING ISSUES:")
print("   • Check browser console for any remaining errors")
print("   • Verify all sidebar files are properly exported")
print("   • Try clearing browser cache and restarting dev server")