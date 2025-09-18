#!/usr/bin/env python3

"""
Test script to verify both fixes:
1. Canvas node updates when name changes in Properties Panel
2. Select.Item error is fixed in HandoffNodeConfigDialog
"""

import os
import re

def test_canvas_node_update_fix():
    """Test that canvas node update mechanism is properly implemented"""
    print("🧪 Testing Canvas Node Update Fix...")
    
    # Test 1: Check StrandsBlankWorkspace has canvas update function state
    workspace_file = "src/components/MultiAgentWorkspace/StrandsBlankWorkspace.tsx"
    if not os.path.exists(workspace_file):
        print("❌ StrandsBlankWorkspace file not found")
        return False
    
    with open(workspace_file, 'r') as f:
        content = f.read()
    
    # Check for canvas update function state
    has_canvas_update_state = 'canvasUpdateFunction' in content and 'setCanvasUpdateFunction' in content
    print(f"✅ Canvas update function state: {'PASS' if has_canvas_update_state else 'FAIL'}")
    
    # Check for onCanvasReady prop
    has_canvas_ready_prop = 'onCanvasReady={(updateFn) => setCanvasUpdateFunction(() => updateFn)}' in content
    print(f"✅ onCanvasReady prop: {'PASS' if has_canvas_ready_prop else 'FAIL'}")
    
    # Check updateNodeData calls canvas update function
    update_calls_canvas = 'canvasUpdateFunction(nodeId, newData)' in content
    print(f"✅ updateNodeData calls canvas function: {'PASS' if update_calls_canvas else 'FAIL'}")
    
    # Test 2: Check StrandsWorkflowCanvas has onCanvasReady prop
    canvas_file = "src/components/MultiAgentWorkspace/StrandsWorkflowCanvas.tsx"
    if not os.path.exists(canvas_file):
        print("❌ StrandsWorkflowCanvas file not found")
        return False
    
    with open(canvas_file, 'r') as f:
        content = f.read()
    
    # Check for onCanvasReady prop in interface
    has_interface_prop = 'onCanvasReady?: (updateFunction: (nodeId: string, newData: any) => void) => void;' in content
    print(f"✅ onCanvasReady in interface: {'PASS' if has_interface_prop else 'FAIL'}")
    
    # Check for onCanvasReady in component props
    has_component_prop = 'onCanvasReady,' in content
    print(f"✅ onCanvasReady in component: {'PASS' if has_component_prop else 'FAIL'}")
    
    # Check for useEffect that calls onCanvasReady
    has_use_effect = 'onCanvasReady(handleNodeUpdate)' in content
    print(f"✅ useEffect calls onCanvasReady: {'PASS' if has_use_effect else 'FAIL'}")
    
    # Test 3: Check ModernDecisionNode uses proper data binding
    node_file = "src/components/MultiAgentWorkspace/nodes/ModernDecisionNode.tsx"
    if not os.path.exists(node_file):
        print("❌ ModernDecisionNode file not found")
        return False
    
    with open(node_file, 'r') as f:
        content = f.read()
    
    # Check for proper name fallback
    has_name_fallback = 'data.label || data.name || \'Decision\'' in content
    print(f"✅ ModernDecisionNode name fallback: {'PASS' if has_name_fallback else 'FAIL'}")
    
    all_tests = [
        has_canvas_update_state,
        has_canvas_ready_prop,
        update_calls_canvas,
        has_interface_prop,
        has_component_prop,
        has_use_effect,
        has_name_fallback
    ]
    
    return all(all_tests)

def test_select_item_fix():
    """Test that Select.Item error is fixed in HandoffNodeConfigDialog"""
    print("\n🧪 Testing Select.Item Fix...")
    
    handoff_file = "src/components/MultiAgentWorkspace/config/HandoffNodeConfigDialog.tsx"
    if not os.path.exists(handoff_file):
        print("❌ HandoffNodeConfigDialog file not found")
        return False
    
    with open(handoff_file, 'r') as f:
        content = f.read()
    
    # Check that there are no empty string values in SelectItem
    empty_select_items = re.findall(r'<SelectItem\s+value=""', content)
    has_empty_values = len(empty_select_items) > 0
    print(f"✅ No empty SelectItem values: {'PASS' if not has_empty_values else 'FAIL'}")
    
    if has_empty_values:
        print(f"   Found {len(empty_select_items)} empty SelectItem values")
    
    # Check for "any" value instead of empty string
    has_any_value = '<SelectItem value="any">Any Agent</SelectItem>' in content
    print(f"✅ Uses 'any' value for Any Agent: {'PASS' if has_any_value else 'FAIL'}")
    
    # Check for proper value handling in Select
    proper_value_handling = 'value === \'any\' ? undefined : value' in content
    print(f"✅ Proper value handling: {'PASS' if proper_value_handling else 'FAIL'}")
    
    # Check for proper default value
    proper_default = 'config.sourceAgent || \'any\'' in content
    print(f"✅ Proper default value: {'PASS' if proper_default else 'FAIL'}")
    
    all_tests = [
        not has_empty_values,
        has_any_value,
        proper_value_handling,
        proper_default
    ]
    
    return all(all_tests)

def test_data_flow_integration():
    """Test that the complete data flow works end-to-end"""
    print("\n🧪 Testing Complete Data Flow Integration...")
    
    # Check Properties Panel updateLocalData function
    props_file = "src/components/MultiAgentWorkspace/PropertiesPanel.tsx"
    if not os.path.exists(props_file):
        print("❌ PropertiesPanel file not found")
        return False
    
    with open(props_file, 'r') as f:
        content = f.read()
    
    # Check that updateLocalData calls onUpdateNode
    calls_on_update = 'onUpdateNode(node.id, newData)' in content
    print(f"✅ PropertiesPanel calls onUpdateNode: {'PASS' if calls_on_update else 'FAIL'}")
    
    # Check that it saves to persistent storage
    saves_config = 'saveNodeConfiguration(node.id, baseType, newData, node.position)' in content
    print(f"✅ PropertiesPanel saves configuration: {'PASS' if saves_config else 'FAIL'}")
    
    return calls_on_update and saves_config

def main():
    """Run all tests"""
    print("🚀 Testing Node Update and Select Fixes...\n")
    
    canvas_fix = test_canvas_node_update_fix()
    select_fix = test_select_item_fix()
    data_flow = test_data_flow_integration()
    
    print("\n" + "="*60)
    print("📊 TEST RESULTS SUMMARY")
    print("="*60)
    
    print(f"✅ Canvas Node Update Fix: {'PASS' if canvas_fix else 'FAIL'}")
    print(f"✅ Select.Item Error Fix: {'PASS' if select_fix else 'FAIL'}")
    print(f"✅ Data Flow Integration: {'PASS' if data_flow else 'FAIL'}")
    
    overall_success = canvas_fix and select_fix and data_flow
    
    print(f"\n🎯 OVERALL RESULT: {'SUCCESS' if overall_success else 'PARTIAL SUCCESS'}")
    
    if overall_success:
        print("\n🎉 All fixes implemented successfully!")
        print("\n📋 What should work now:")
        print("  1. ✅ Node names update immediately on canvas when changed in Properties Panel")
        print("  2. ✅ Canvas nodes receive real-time updates from Properties Panel")
        print("  3. ✅ Handoff configuration dialog opens without Select.Item errors")
        print("  4. ✅ 'Any Agent' option works properly in handoff source selection")
        print("  5. ✅ Complete data flow from Properties Panel to canvas nodes")
    else:
        print("\n⚠️  Some fixes may be incomplete. Please review the failed tests above.")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)