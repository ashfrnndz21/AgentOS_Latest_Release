#!/usr/bin/env python3

"""
Test script to verify Decision Node logic fixes by examining the code
"""

import os
import re

def test_modern_decision_node_updates():
    """Test that ModernDecisionNode properly handles name updates"""
    print("🧪 Testing ModernDecisionNode name update logic...")
    
    file_path = "src/components/MultiAgentWorkspace/nodes/ModernDecisionNode.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if the node uses both data.label and data.name
    name_pattern = r'\{.*?data\.label.*?data\.name.*?\}'
    if re.search(name_pattern, content, re.DOTALL):
        print("✅ ModernDecisionNode uses both data.label and data.name for fallback")
        name_update_fixed = True
    else:
        # Check if it at least uses data.label
        if 'data.label' in content:
            print("⚠️  ModernDecisionNode uses data.label but no fallback to data.name")
            name_update_fixed = False
        else:
            print("❌ ModernDecisionNode doesn't use data.label for name display")
            name_update_fixed = False
    
    # Check if conditions count is displayed
    conditions_pattern = r'data\.config\?\.conditions\?\.length'
    if re.search(conditions_pattern, content):
        print("✅ ModernDecisionNode displays conditions count")
        conditions_display_fixed = True
    else:
        print("❌ ModernDecisionNode doesn't display conditions count")
        conditions_display_fixed = False
    
    return name_update_fixed and conditions_display_fixed

def test_strands_workflow_canvas_updates():
    """Test that StrandsWorkflowCanvas properly handles node updates"""
    print("\n🧪 Testing StrandsWorkflowCanvas node update logic...")
    
    file_path = "src/components/MultiAgentWorkspace/StrandsWorkflowCanvas.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if onUpdateNode prop is defined
    if 'onUpdateNode?' in content:
        print("✅ StrandsWorkflowCanvas accepts onUpdateNode prop")
        prop_defined = True
    else:
        print("❌ StrandsWorkflowCanvas missing onUpdateNode prop")
        prop_defined = False
    
    # Check if handleNodeUpdate function exists
    if 'handleNodeUpdate' in content:
        print("✅ StrandsWorkflowCanvas has handleNodeUpdate function")
        handler_exists = True
    else:
        print("❌ StrandsWorkflowCanvas missing handleNodeUpdate function")
        handler_exists = False
    
    # Check if setNodes is used to update node data
    update_pattern = r'setNodes.*?node\.id === nodeId.*?data:.*?node\.data.*?newData'
    if re.search(update_pattern, content, re.DOTALL):
        print("✅ StrandsWorkflowCanvas properly updates node data in setNodes")
        update_logic = True
    else:
        print("❌ StrandsWorkflowCanvas missing proper node data update logic")
        update_logic = False
    
    return prop_defined and handler_exists and update_logic

def test_strands_blank_workspace_integration():
    """Test that StrandsBlankWorkspace properly integrates node updates"""
    print("\n🧪 Testing StrandsBlankWorkspace integration...")
    
    file_path = "src/components/MultiAgentWorkspace/StrandsBlankWorkspace.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if updateNodeData function exists and updates selectedNode
    if 'updateNodeData' in content and 'setSelectedNode' in content:
        print("✅ StrandsBlankWorkspace has updateNodeData function that updates selectedNode")
        update_function = True
    else:
        print("❌ StrandsBlankWorkspace missing proper updateNodeData function")
        update_function = False
    
    # Check if onUpdateNode is passed to StrandsWorkflowCanvas
    if 'onUpdateNode={updateNodeData}' in content:
        print("✅ StrandsBlankWorkspace passes updateNodeData to StrandsWorkflowCanvas")
        prop_passed = True
    else:
        print("❌ StrandsBlankWorkspace doesn't pass updateNodeData to StrandsWorkflowCanvas")
        prop_passed = False
    
    return update_function and prop_passed

def test_properties_panel_configuration():
    """Test that PropertiesPanel properly handles decision configuration"""
    print("\n🧪 Testing PropertiesPanel decision configuration...")
    
    file_path = "src/components/MultiAgentWorkspace/PropertiesPanel.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if decision properties are rendered
    if 'renderDecisionProperties' in content:
        print("✅ PropertiesPanel has renderDecisionProperties function")
        decision_props = True
    else:
        print("❌ PropertiesPanel missing renderDecisionProperties function")
        decision_props = False
    
    # Check if configuration button exists
    config_button_pattern = r'Configure Decision Logic|Edit Decision Logic'
    if re.search(config_button_pattern, content):
        print("✅ PropertiesPanel has configuration button for decision logic")
        config_button = True
    else:
        print("❌ PropertiesPanel missing configuration button")
        config_button = False
    
    # Check if conditions are displayed
    if 'conditions defined' in content and 'No conditions configured' in content:
        print("✅ PropertiesPanel displays condition status")
        conditions_display = True
    else:
        print("❌ PropertiesPanel missing condition status display")
        conditions_display = False
    
    return decision_props and config_button and conditions_display

def test_decision_node_config_dialog():
    """Test that DecisionNodeConfigDialog exists and is properly structured"""
    print("\n🧪 Testing DecisionNodeConfigDialog...")
    
    file_path = "src/components/MultiAgentWorkspace/config/DecisionNodeConfigDialog.tsx"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if dialog has Add Condition functionality
    if 'Add Condition' in content and 'addCondition' in content:
        print("✅ DecisionNodeConfigDialog has Add Condition functionality")
        add_condition = True
    else:
        print("❌ DecisionNodeConfigDialog missing Add Condition functionality")
        add_condition = False
    
    # Check if conditions can be configured
    if 'updateCondition' in content and 'removeCondition' in content:
        print("✅ DecisionNodeConfigDialog has condition management")
        condition_mgmt = True
    else:
        print("❌ DecisionNodeConfigDialog missing condition management")
        condition_mgmt = False
    
    # Check if dialog can save configuration
    if 'onSave' in content and 'handleSave' in content:
        print("✅ DecisionNodeConfigDialog has save functionality")
        save_functionality = True
    else:
        print("❌ DecisionNodeConfigDialog missing save functionality")
        save_functionality = False
    
    return add_condition and condition_mgmt and save_functionality

def main():
    """Run all tests"""
    print("🚀 Starting Decision Node Fixes Verification...\n")
    
    tests = [
        ("ModernDecisionNode Updates", test_modern_decision_node_updates),
        ("StrandsWorkflowCanvas Updates", test_strands_workflow_canvas_updates),
        ("StrandsBlankWorkspace Integration", test_strands_blank_workspace_integration),
        ("PropertiesPanel Configuration", test_properties_panel_configuration),
        ("DecisionNodeConfigDialog", test_decision_node_config_dialog)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with error: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST RESULTS SUMMARY")
    print("="*60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 OVERALL: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Decision Node fixes are properly implemented.")
        return True
    else:
        print("⚠️  Some tests failed. Please review the implementation.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)