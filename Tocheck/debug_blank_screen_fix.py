#!/usr/bin/env python3

print("🔍 DEBUGGING BLANK SCREEN - INCREMENTAL RESTORATION")
print("=" * 60)

# Step 1: Check if basic components exist
import os

components_to_check = [
    "src/components/Layout.tsx",
    "src/components/ErrorBoundary.tsx", 
    "src/pages/Index.tsx",
    "src/components/ui/toaster.tsx",
    "src/components/ui/sonner.tsx",
    "src/components/ui/tooltip.tsx"
]

print("\n📋 CHECKING CRITICAL COMPONENTS:")
for component in components_to_check:
    exists = os.path.exists(component)
    status = "✅" if exists else "❌"
    print(f"{status} {component}")

print("\n🔧 SOLUTION: Restore working app first, then add routes incrementally")
print("This prevents import dependency conflicts that cause blank screens")