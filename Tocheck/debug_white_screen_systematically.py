#!/usr/bin/env python3

print("🔍 SYSTEMATIC WHITE SCREEN DEBUG")
print("=" * 50)

print("\n🎯 STRATEGY:")
print("   1. Start with minimal working version (Index only)")
print("   2. Add ONE import at a time")
print("   3. Test each addition")
print("   4. Identify the exact problematic import")

print("\n✅ STEP 1: Minimal version created")
print("   - Only Index page imported")
print("   - Layout component used")
print("   - All other routes as placeholders")

print("\n🔧 STEP 2: Test imports one by one")

imports_to_test = [
    "OllamaTerminalPage",
    "SimpleRealDocumentWorkspace", 
    "Agents",
    "CommandCentre",
    "AgentControlPanel",
    "MultiAgentWorkspace",
    "OllamaAgentDashboard"
]

print(f"\n📋 IMPORTS TO TEST ({len(imports_to_test)}):")
for i, imp in enumerate(imports_to_test, 1):
    print(f"   {i}. {imp}")

print(f"\n🎯 TESTING PROCESS:")
print("   1. Test current minimal version")
print("   2. If working, add OllamaTerminalPage")
print("   3. If still working, add SimpleRealDocumentWorkspace")
print("   4. Continue until white screen appears")
print("   5. The last added import is the problematic one")

print(f"\n💡 CURRENT STATE:")
print("   - App.tsx has only Index page")
print("   - Should show original UI with sidebar")
print("   - All other routes show 'Coming Soon'")
print("   - Test this first before adding more imports")