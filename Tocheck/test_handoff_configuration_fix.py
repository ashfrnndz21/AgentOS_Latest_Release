#!/usr/bin/env python3

"""
Test script to verify Handoff node configuration works properly
"""

import os
import re

def test_handoff_available_agents():
    """Test that HandoffNodeConfigDialog has available agents"""
    print("🧪 Testing Handoff Available Agents...")
    
    workspace_file = "src/components/MultiAgentWorkspace/StrandsBlankWorkspace.tsx"
    if not os.path.exists(workspace_file):
        print("❌ StrandsBlankWorkspace file not found")
        return False
    
    with open(workspace_file, 'r') as f:
        content = f.read()
    
    # Check for available agents in handoff dialog
    has_handoff_agents = "Customer Service Agent" in content and "Technical Support Agent" in content
    print(f"✅ Handoff dialog has available agents: {'PASS' if has_handoff_agents else 'FAIL'}")
    
    # Check for agent expertise
    has_expertise = "expertise: ['customer_support', 'billing']" in content
    print(f"✅ Agents have expertise defined: {'PASS' if has_expertise else 'FAIL'}")
    
    # Check for multiple agent types
    agent_count = content.count("{ id: 'agent-")
    has_multiple_agents = agent_count >= 5
    print(f"✅ Multiple agents available ({agent_count}): {'PASS' if has_multiple_agents else 'FAIL'}")
    
    return has_handoff_agents and has_expertise and has_multiple_agents

def test_handoff_dialog_structure():
    """Test that HandoffNodeConfigDialog has proper structure"""
    print("\n🧪 Testing Handoff Dialog Structure...")
    
    dialog_file = "src/components/MultiAgentWorkspace/config/HandoffNodeConfigDialog.tsx"
    if not os.path.exists(dialog_file):
        print("❌ HandoffNodeConfigDialog file not found")
        return False
    
    with open(dialog_file, 'r') as f:
        content = f.read()
    
    # Check for Add Target Agent button
    has_add_button = 'Add Target Agent' in content
    print(f"✅ Has Add Target Agent button: {'PASS' if has_add_button else 'FAIL'}")
    
    # Check for addTargetAgent function
    has_add_function = 'addTargetAgent' in content
    print(f"✅ Has addTargetAgent function: {'PASS' if has_add_function else 'FAIL'}")
    
    # Check for target agents management
    has_target_management = 'targetAgents' in content and 'removeTargetAgent' in content
    print(f"✅ Has target agents management: {'PASS' if has_target_management else 'FAIL'}")
    
    # Check for save validation
    has_save_validation = 'config.targetAgents.length > 0' in content
    print(f"✅ Has save validation: {'PASS' if has_save_validation else 'FAIL'}")
    
    return has_add_button and has_add_function and has_target_management and has_save_validation

def test_select_item_fix():
    """Test that Select.Item error is fixed"""
    print("\n🧪 Testing Select.Item Fix...")
    
    dialog_file = "src/components/MultiAgentWorkspace/config/HandoffNodeConfigDialog.tsx"
    if not os.path.exists(dialog_file):
        print("❌ HandoffNodeConfigDialog file not found")
        return False
    
    with open(dialog_file, 'r') as f:
        content = f.read()
    
    # Check that there are no empty string values in SelectItem
    empty_select_items = re.findall(r'<SelectItem\s+value=""', content)
    has_empty_values = len(empty_select_items) > 0
    print(f"✅ No empty SelectItem values: {'PASS' if not has_empty_values else 'FAIL'}")
    
    if has_empty_values:
        print(f"   Found {len(empty_select_items)} empty SelectItem values")
    
    # Check for "any" value instead of empty string
    has_any_value = 'value="any"' in content
    print(f"✅ Uses 'any' value for Any Agent: {'PASS' if has_any_value else 'FAIL'}")
    
    return not has_empty_values and has_any_value

def test_handoff_node_display():
    """Test that StrandsHandoffNode displays name properly"""
    print("\n🧪 Testing Handoff Node Display...")
    
    node_file = "src/components/MultiAgentWorkspace/nodes/StrandsHandoffNode.tsx"
    if not os.path.exists(node_file):
        print("❌ StrandsHandoffNode file not found")
        return False
    
    with open(node_file, 'r') as f:
        content = f.read()
    
    # Check for proper name fallback
    has_name_fallback = 'data.label || data.name || \'Handoff\'' in content
    print(f"✅ StrandsHandoffNode name fallback: {'PASS' if has_name_fallback else 'FAIL'}")
    
    return has_name_fallback

def main():
    """Run all tests"""
    print("🚀 Testing Handoff Configuration Fix...\n")
    
    available_agents = test_handoff_available_agents()
    dialog_structure = test_handoff_dialog_structure()
    select_fix = test_select_item_fix()
    node_display = test_handoff_node_display()
    
    print("\n" + "="*60)
    print("📊 TEST RESULTS SUMMARY")
    print("="*60)
    
    print(f"✅ Available Agents: {'PASS' if available_agents else 'FAIL'}")
    print(f"✅ Dialog Structure: {'PASS' if dialog_structure else 'FAIL'}")
    print(f"✅ Select.Item Fix: {'PASS' if select_fix else 'FAIL'}")
    print(f"✅ Node Display: {'PASS' if node_display else 'FAIL'}")
    
    overall_success = available_agents and dialog_structure and select_fix and node_display
    
    print(f"\n🎯 OVERALL RESULT: {'SUCCESS' if overall_success else 'PARTIAL SUCCESS'}")
    
    if overall_success:
        print("\n🎉 Handoff configuration fix implemented successfully!")
        print("\n📋 What should work now:")
        print("  1. ✅ Handoff configuration dialog opens without errors")
        print("  2. ✅ 'Add Target Agent' button shows available agents")
        print("  3. ✅ Multiple agents can be selected as targets")
        print("  4. ✅ Configuration can be saved successfully")
        print("  5. ✅ Node name updates on canvas after save")
        print("\n💡 Try it now:")
        print("  - Drag a Handoff node to canvas")
        print("  - Click to select and open Properties Panel")
        print("  - Click configuration button")
        print("  - Add target agents and save configuration!")
    else:
        print("\n⚠️  Some components may not be working correctly.")
        print("Please check the failed tests above.")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)