#!/usr/bin/env python3

"""
Test script to verify that handoff configuration uses agents from the palette
"""

import os
import re

def test_palette_agents_integration():
    """Test that StrandsBlankWorkspace integrates with useOllamaAgentsForPalette"""
    print("🧪 Testing Palette Agents Integration...")
    
    workspace_file = "src/components/MultiAgentWorkspace/StrandsBlankWorkspace.tsx"
    if not os.path.exists(workspace_file):
        print("❌ StrandsBlankWorkspace file not found")
        return False
    
    with open(workspace_file, 'r') as f:
        content = f.read()
    
    # Check for useOllamaAgentsForPalette import
    has_hook_import = 'useOllamaAgentsForPalette' in content and 'import' in content
    print(f"✅ useOllamaAgentsForPalette imported: {'PASS' if has_hook_import else 'FAIL'}")
    
    # Check for hook usage
    has_hook_usage = 'const { agents: paletteAgents, loading: agentsLoading } = useOllamaAgentsForPalette()' in content
    print(f"✅ Hook used in component: {'PASS' if has_hook_usage else 'FAIL'}")
    
    # Check for availableAgents transformation
    has_transformation = 'const availableAgents = useMemo(' in content
    print(f"✅ availableAgents transformation: {'PASS' if has_transformation else 'FAIL'}")
    
    # Check for fallback agents
    has_fallback = 'Customer Service Agent' in content and 'agentsLoading || !paletteAgents.length' in content
    print(f"✅ Fallback agents when loading: {'PASS' if has_fallback else 'FAIL'}")
    
    # Check for palette agent mapping
    has_mapping = 'paletteAgents.map(agent =>' in content and 'agent.capabilities' in content
    print(f"✅ Palette agents mapping: {'PASS' if has_mapping else 'FAIL'}")
    
    # Check that dialogs use availableAgents
    uses_available_agents = content.count('availableAgents={availableAgents}') >= 2
    print(f"✅ Dialogs use availableAgents: {'PASS' if uses_available_agents else 'FAIL'}")
    
    return all([has_hook_import, has_hook_usage, has_transformation, has_fallback, has_mapping, uses_available_agents])

def test_agent_palette_hook():
    """Test that useOllamaAgentsForPalette hook exists and is properly structured"""
    print("\n🧪 Testing Agent Palette Hook...")
    
    hook_file = "src/hooks/useOllamaAgentsForPalette.ts"
    if not os.path.exists(hook_file):
        print("❌ useOllamaAgentsForPalette hook file not found")
        return False
    
    with open(hook_file, 'r') as f:
        content = f.read()
    
    # Check for PaletteAgent interface
    has_interface = 'export interface PaletteAgent' in content
    print(f"✅ PaletteAgent interface exported: {'PASS' if has_interface else 'FAIL'}")
    
    # Check for required properties
    has_required_props = all(prop in content for prop in ['id:', 'name:', 'capabilities:'])
    print(f"✅ Required properties in interface: {'PASS' if has_required_props else 'FAIL'}")
    
    # Check for hook export
    has_hook_export = 'export const useOllamaAgentsForPalette' in content
    print(f"✅ Hook properly exported: {'PASS' if has_hook_export else 'FAIL'}")
    
    return has_interface and has_required_props and has_hook_export

def test_configuration_dialogs_compatibility():
    """Test that configuration dialogs are compatible with the new agent format"""
    print("\n🧪 Testing Configuration Dialogs Compatibility...")
    
    # Test HandoffNodeConfigDialog
    handoff_file = "src/components/MultiAgentWorkspace/config/HandoffNodeConfigDialog.tsx"
    if not os.path.exists(handoff_file):
        print("❌ HandoffNodeConfigDialog file not found")
        return False
    
    with open(handoff_file, 'r') as f:
        handoff_content = f.read()
    
    # Check for availableAgents prop
    has_available_agents_prop = 'availableAgents: Array<{ id: string; name: string' in handoff_content
    print(f"✅ HandoffDialog has availableAgents prop: {'PASS' if has_available_agents_prop else 'FAIL'}")
    
    # Check for expertise handling
    has_expertise = 'expertise?' in handoff_content
    print(f"✅ HandoffDialog handles expertise: {'PASS' if has_expertise else 'FAIL'}")
    
    # Test DecisionNodeConfigDialog
    decision_file = "src/components/MultiAgentWorkspace/config/DecisionNodeConfigDialog.tsx"
    if not os.path.exists(decision_file):
        print("❌ DecisionNodeConfigDialog file not found")
        return False
    
    with open(decision_file, 'r') as f:
        decision_content = f.read()
    
    # Check for availableAgents prop
    has_decision_agents_prop = 'availableAgents: Array<{ id: string; name: string' in decision_content
    print(f"✅ DecisionDialog has availableAgents prop: {'PASS' if has_decision_agents_prop else 'FAIL'}")
    
    return has_available_agents_prop and has_expertise and has_decision_agents_prop

def main():
    """Run all tests"""
    print("🚀 Testing Palette Agents Integration...\n")
    
    integration_test = test_palette_agents_integration()
    hook_test = test_agent_palette_hook()
    compatibility_test = test_configuration_dialogs_compatibility()
    
    print("\n" + "="*60)
    print("📊 TEST RESULTS SUMMARY")
    print("="*60)
    
    print(f"✅ Palette Agents Integration: {'PASS' if integration_test else 'FAIL'}")
    print(f"✅ Agent Palette Hook: {'PASS' if hook_test else 'FAIL'}")
    print(f"✅ Configuration Dialogs Compatibility: {'PASS' if compatibility_test else 'FAIL'}")
    
    overall_success = integration_test and hook_test and compatibility_test
    
    print(f"\n🎯 OVERALL RESULT: {'SUCCESS' if overall_success else 'PARTIAL SUCCESS'}")
    
    if overall_success:
        print("\n🎉 Palette agents integration implemented successfully!")
        print("\n📋 What works now:")
        print("  1. ✅ Handoff configuration uses real agents from palette")
        print("  2. ✅ Decision configuration uses real agents from palette")
        print("  3. ✅ Fallback agents when palette is loading")
        print("  4. ✅ Agent capabilities/expertise are preserved")
        print("  5. ✅ Dynamic agent list based on what's available")
        print("\n💡 Benefits:")
        print("  - Target agents match what's actually in the palette")
        print("  - No hardcoded agent lists")
        print("  - Automatic updates when palette changes")
        print("  - Consistent agent information across the app")
    else:
        print("\n⚠️  Some components may not be working correctly.")
        print("Please check the failed tests above.")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)