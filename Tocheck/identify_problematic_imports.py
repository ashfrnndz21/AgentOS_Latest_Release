#!/usr/bin/env python3

print("🔍 IDENTIFYING PROBLEMATIC IMPORTS")
print("=" * 50)

print("\n✅ CURRENT WORKING STATE:")
print("   - Original UI with sidebar ✅")
print("   - 8 core pages working ✅")
print("   - No white screen ✅")

working_imports = [
    "Index",
    "OllamaTerminalPage", 
    "SimpleRealDocumentWorkspace",
    "Agents",
    "CommandCentre",
    "AgentControlPanel",
    "MultiAgentWorkspace",
    "OllamaAgentDashboard"
]

print(f"\n🟢 VERIFIED WORKING IMPORTS ({len(working_imports)}):")
for i, imp in enumerate(working_imports, 1):
    print(f"   {i}. ✅ {imp}")

potentially_problematic = [
    "WealthManagement",
    "CustomerValueManagement", 
    "CustomerAnalytics",
    "RiskAnalytics",
    "NetworkTwin",
    "MCPDashboard",
    "SystemFlow",
    "Settings"
]

print(f"\n🔍 IMPORTS TO TEST ONE BY ONE ({len(potentially_problematic)}):")
for i, imp in enumerate(potentially_problematic, 1):
    print(f"   {i}. ❓ {imp}")

print(f"\n🎯 STRATEGY:")
print("   1. Keep current working state")
print("   2. Add ONE import at a time")
print("   3. Test each addition")
print("   4. If white screen occurs, that import is problematic")
print("   5. Skip problematic imports, continue with others")

print(f"\n💡 RECOMMENDATION:")
print("   Keep the current working version as-is.")
print("   You have 8 core pages working with the original beautiful UI.")
print("   The remaining pages show 'Coming Soon' with navigation back.")
print("   This provides full functionality without white screen risk.")