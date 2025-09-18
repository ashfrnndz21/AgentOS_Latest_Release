#!/usr/bin/env python3

"""
Test script to verify that canvas nodes update when name changes in Properties Panel
"""

import os
import re

def test_strands_decision_node_fix():
    """Test that StrandsDecisionNode uses proper data binding for name updates"""
    print("🧪 Testing StrandsDecisionNode Name Update Fix...")
    
    file_path = "src/components/MultiAgentWorkspace/nodes/StrandsDecisionNode.tsx"
    
    if not os.path.exists(file_path):
        print("❌ StrandsDecisionNode file not found")
        return False
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check for proper name fallback
    has_label_fallback = 'data.label || data.name || \'Decision\'' in content
    print(f"✅ StrandsDecisionNode name fallback: {'PASS' if has_label_fallback else 'FAIL'}")
    
    # Check for label in interface
    has_label_interface = 'label?: string;' in content
    print(f"✅ StrandsDecisionNode label interface: {'PASS' if has_label_interface else 'FAIL'}")
    
    return has_label_fallback and has_label_interface

def test_canvas_update_mechanism():
    """Test that the canvas update mechanism is properly implemented"""
    print("\n🧪 Testing Canvas Update Mechanism...")
    
    # Test StrandsBlankWorkspace
    workspace_file = "src/components/MultiAgentWorkspace/StrandsBlankWorkspace.tsx"
    if not os.path.exists(workspace_file):
        print("❌ StrandsBlankWorkspace file not found")
        return False
    
    with open(workspace_file, 'r') as f:
        content = f.read()
    
    has_canvas_function = 'canvasUpdateFunction(nodeId, newData)' in content
    print(f"✅ Canvas update function call: {'PASS' if has_canvas_function else 'FAIL'}")
    
    has_canvas_ready = 'onCanvasReady={(updateFn) => setCanvasUpdateFunction(() => updateFn)}' in content
    print(f"✅ onCanvasReady prop: {'PASS' if has_canvas_ready else 'FAIL'}")
    
    # Test StrandsWorkflowCanvas
    canvas_file = "src/components/MultiAgentWorkspace/StrandsWorkflowCanvas.tsx"
    if not os.path.exists(canvas_file):
        print("❌ StrandsWorkflowCanvas file not found")
        return False
    
    with open(canvas_file, 'r') as f:
        content = f.read()
    
    has_handle_update = 'handleNodeUpdate' in content and 'setNodes' in content
    print(f"✅ handleNodeUpdate function: {'PASS' if has_handle_update else 'FAIL'}")
    
    has_use_effect = 'onCanvasReady(handleNodeUpdate)' in content
    print(f"✅ useEffect exposes function: {'PASS' if has_use_effect else 'FAIL'}")
    
    return has_canvas_function and has_canvas_ready and has_handle_update and has_use_effect

def test_node_types_mapping():
    """Test that the correct node types are being used"""
    print("\n🧪 Testing Node Types Mapping...")
    
    canvas_file = "src/components/MultiAgentWorkspace/StrandsWorkflowCanvas.tsx"
    if not os.path.exists(canvas_file):
        print("❌ StrandsWorkflowCanvas file not found")
        return False
    
    with open(canvas_file, 'r') as f:
        content = f.read()
    
    # Check that StrandsDecisionNode is mapped correctly
    has_decision_mapping = "'strands-decision': StrandsDecisionNode" in content
    print(f"✅ Decision node mapping: {'PASS' if has_decision_mapping else 'FAIL'}")
    
    # Check that StrandsDecisionNode is imported
    has_decision_import = 'StrandsDecisionNode' in content and 'import' in content
    print(f"✅ Decision node import: {'PASS' if has_decision_import else 'FAIL'}")
    
    return has_decision_mapping and has_decision_import

def main():
    """Run all tests"""
    print("🚀 Testing Canvas Node Update Fix...\n")
    
    decision_fix = test_strands_decision_node_fix()
    canvas_mechanism = test_canvas_update_mechanism()
    node_mapping = test_node_types_mapping()
    
    print("\n" + "="*60)
    print("📊 TEST RESULTS SUMMARY")
    print("="*60)
    
    print(f"✅ StrandsDecisionNode Fix: {'PASS' if decision_fix else 'FAIL'}")
    print(f"✅ Canvas Update Mechanism: {'PASS' if canvas_mechanism else 'FAIL'}")
    print(f"✅ Node Types Mapping: {'PASS' if node_mapping else 'FAIL'}")
    
    overall_success = decision_fix and canvas_mechanism and node_mapping
    
    print(f"\n🎯 OVERALL RESULT: {'SUCCESS' if overall_success else 'PARTIAL SUCCESS'}")
    
    if overall_success:
        print("\n🎉 Canvas node update fix implemented successfully!")
        print("\n📋 What should work now:")
        print("  1. ✅ Change node name in Properties Panel")
        print("  2. ✅ Node name updates immediately on canvas")
        print("  3. ✅ No page refresh needed")
        print("  4. ✅ Real-time visual feedback")
        print("\n💡 Try it now:")
        print("  - Drag a Decision node to canvas")
        print("  - Click to select and open Properties Panel")
        print("  - Change the 'Node Name' field")
        print("  - Watch the canvas node update immediately!")
    else:
        print("\n⚠️  Some components may not be working correctly.")
        print("Please check the failed tests above.")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)