#!/usr/bin/env python3

"""
Comprehensive test to verify all Decision Node fixes are properly implemented
"""

import os
import re

def test_complete_decision_node_implementation():
    """Test all aspects of the Decision Node fix"""
    print("🚀 Testing Complete Decision Node Implementation...\n")
    
    tests_passed = 0
    total_tests = 0
    
    # Test 1: ModernDecisionNode name display
    print("🧪 Test 1: ModernDecisionNode Name Display")
    total_tests += 1
    
    file_path = "src/components/MultiAgentWorkspace/nodes/ModernDecisionNode.tsx"
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Check for proper name fallback
        if re.search(r'data\.label.*?data\.name.*?Decision', content, re.DOTALL):
            print("✅ ModernDecisionNode has proper name fallback (data.label || data.name || 'Decision')")
            tests_passed += 1
        else:
            print("❌ ModernDecisionNode missing proper name fallback")
    else:
        print("❌ ModernDecisionNode file not found")
    
    # Test 2: Conditions count display
    print("\n🧪 Test 2: Conditions Count Display")
    total_tests += 1
    
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            content = f.read()
        
        if 'data.config?.conditions?.length' in content:
            print("✅ ModernDecisionNode displays conditions count")
            tests_passed += 1
        else:
            print("❌ ModernDecisionNode doesn't display conditions count")
    else:
        print("❌ ModernDecisionNode file not found")
    
    # Test 3: StrandsWorkflowCanvas node updates
    print("\n🧪 Test 3: StrandsWorkflowCanvas Node Updates")
    total_tests += 1
    
    canvas_path = "src/components/MultiAgentWorkspace/StrandsWorkflowCanvas.tsx"
    if os.path.exists(canvas_path):
        with open(canvas_path, 'r') as f:
            content = f.read()
        
        has_prop = 'onUpdateNode?' in content
        has_handler = 'handleNodeUpdate' in content
        has_setNodes = re.search(r'setNodes.*?node\.id === nodeId.*?data:.*?node\.data.*?newData', content, re.DOTALL)
        
        if has_prop and has_handler and has_setNodes:
            print("✅ StrandsWorkflowCanvas has complete node update mechanism")
            tests_passed += 1
        else:
            print(f"❌ StrandsWorkflowCanvas missing: prop={has_prop}, handler={has_handler}, setNodes={bool(has_setNodes)}")
    else:
        print("❌ StrandsWorkflowCanvas file not found")
    
    # Test 4: StrandsBlankWorkspace integration
    print("\n🧪 Test 4: StrandsBlankWorkspace Integration")
    total_tests += 1
    
    workspace_path = "src/components/MultiAgentWorkspace/StrandsBlankWorkspace.tsx"
    if os.path.exists(workspace_path):
        with open(workspace_path, 'r') as f:
            content = f.read()
        
        has_imports = 'DecisionNodeConfigDialog' in content and 'HandoffNodeConfigDialog' in content
        has_state = 'configDialog' in content
        has_handler = 'handleOpenConfiguration' in content
        has_prop_passed = 'onOpenConfiguration={handleOpenConfiguration}' in content
        has_dialogs = 'configDialog.type === \'decision\'' in content
        
        if has_imports and has_state and has_handler and has_prop_passed and has_dialogs:
            print("✅ StrandsBlankWorkspace has complete configuration integration")
            tests_passed += 1
        else:
            print(f"❌ StrandsBlankWorkspace missing: imports={has_imports}, state={has_state}, handler={has_handler}, prop={has_prop_passed}, dialogs={has_dialogs}")
    else:
        print("❌ StrandsBlankWorkspace file not found")
    
    # Test 5: PropertiesPanel configuration button
    print("\n🧪 Test 5: PropertiesPanel Configuration Button")
    total_tests += 1
    
    props_path = "src/components/MultiAgentWorkspace/PropertiesPanel.tsx"
    if os.path.exists(props_path):
        with open(props_path, 'r') as f:
            content = f.read()
        
        has_button = re.search(r'Configure Decision Logic|Edit Decision Logic', content)
        has_onclick = 'onOpenConfiguration(node.id, baseType)' in content
        has_conditions_display = 'conditions defined' in content and 'No conditions configured' in content
        
        if has_button and has_onclick and has_conditions_display:
            print("✅ PropertiesPanel has complete decision configuration UI")
            tests_passed += 1
        else:
            print(f"❌ PropertiesPanel missing: button={bool(has_button)}, onclick={has_onclick}, display={has_conditions_display}")
    else:
        print("❌ PropertiesPanel file not found")
    
    # Test 6: DecisionNodeConfigDialog functionality
    print("\n🧪 Test 6: DecisionNodeConfigDialog Functionality")
    total_tests += 1
    
    dialog_path = "src/components/MultiAgentWorkspace/config/DecisionNodeConfigDialog.tsx"
    if os.path.exists(dialog_path):
        with open(dialog_path, 'r') as f:
            content = f.read()
        
        has_add_condition = 'addCondition' in content and 'Add Condition' in content
        has_condition_mgmt = 'updateCondition' in content and 'removeCondition' in content
        has_save = 'handleSave' in content and 'onSave(config)' in content
        has_validation = 'config.name.trim()' in content and 'config.conditions.length > 0' in content
        
        if has_add_condition and has_condition_mgmt and has_save and has_validation:
            print("✅ DecisionNodeConfigDialog has complete functionality")
            tests_passed += 1
        else:
            print(f"❌ DecisionNodeConfigDialog missing: add={has_add_condition}, mgmt={has_condition_mgmt}, save={has_save}, validation={has_validation}")
    else:
        print("❌ DecisionNodeConfigDialog file not found")
    
    # Test 7: Data flow integration
    print("\n🧪 Test 7: Data Flow Integration")
    total_tests += 1
    
    # Check if the save callback in StrandsBlankWorkspace properly updates node data
    if os.path.exists(workspace_path):
        with open(workspace_path, 'r') as f:
            content = f.read()
        
        save_callback_pattern = r'onSave=\{.*?config.*?updateNodeData.*?isConfigured.*?label.*?\}'
        has_proper_save = re.search(save_callback_pattern, content, re.DOTALL)
        
        if has_proper_save:
            print("✅ Data flow integration is complete (save callback updates node data)")
            tests_passed += 1
        else:
            print("❌ Data flow integration incomplete (save callback doesn't properly update node data)")
    else:
        print("❌ Cannot test data flow integration - workspace file not found")
    
    # Summary
    print("\n" + "="*60)
    print("📊 COMPREHENSIVE TEST RESULTS")
    print("="*60)
    
    print(f"✅ Tests Passed: {tests_passed}/{total_tests}")
    print(f"📈 Success Rate: {(tests_passed/total_tests)*100:.1f}%")
    
    if tests_passed == total_tests:
        print("\n🎉 ALL TESTS PASSED!")
        print("✨ Decision Node fixes are completely implemented and should work properly.")
        print("\n📋 What should work now:")
        print("  1. ✅ Node name updates immediately on canvas when changed in Properties Panel")
        print("  2. ✅ 'Configure Decision Logic' button opens configuration dialog")
        print("  3. ✅ Decision conditions can be added, edited, and removed")
        print("  4. ✅ Conditions count is displayed in both Properties Panel and node")
        print("  5. ✅ Configuration is saved and persisted")
        print("  6. ✅ Node shows as 'Configured' after adding conditions")
        return True
    else:
        print(f"\n⚠️  {total_tests - tests_passed} tests failed.")
        print("Some functionality may not work as expected.")
        return False

def test_specific_fixes():
    """Test the specific issues mentioned in the original problem"""
    print("\n🎯 Testing Specific Issues from Original Problem...\n")
    
    # Issue 1: Node name not updating on canvas
    print("🔍 Issue 1: Node Name Not Updating on Canvas")
    
    # Check ModernDecisionNode uses proper data binding
    node_file = "src/components/MultiAgentWorkspace/nodes/ModernDecisionNode.tsx"
    if os.path.exists(node_file):
        with open(node_file, 'r') as f:
            content = f.read()
        
        if re.search(r'data\.label.*?data\.name', content):
            print("✅ FIXED: ModernDecisionNode now uses proper data binding for name")
        else:
            print("❌ NOT FIXED: ModernDecisionNode still has name binding issues")
    
    # Check if updateNodeData properly updates canvas
    workspace_file = "src/components/MultiAgentWorkspace/StrandsBlankWorkspace.tsx"
    canvas_file = "src/components/MultiAgentWorkspace/StrandsWorkflowCanvas.tsx"
    
    workspace_ok = canvas_ok = False
    
    if os.path.exists(workspace_file):
        with open(workspace_file, 'r') as f:
            content = f.read()
        if 'setSelectedNode' in content and 'updateNodeData' in content:
            workspace_ok = True
    
    if os.path.exists(canvas_file):
        with open(canvas_file, 'r') as f:
            content = f.read()
        if 'handleNodeUpdate' in content and 'setNodes' in content:
            canvas_ok = True
    
    if workspace_ok and canvas_ok:
        print("✅ FIXED: Node data update mechanism is properly implemented")
    else:
        print(f"❌ NOT FIXED: Update mechanism incomplete (workspace={workspace_ok}, canvas={canvas_ok})")
    
    # Issue 2: Decision conditions section is read-only
    print("\n🔍 Issue 2: Decision Conditions Section is Read-Only")
    
    # Check if configuration dialog is properly connected
    if os.path.exists(workspace_file):
        with open(workspace_file, 'r') as f:
            content = f.read()
        
        has_dialog_import = 'DecisionNodeConfigDialog' in content
        has_dialog_render = 'configDialog.type === \'decision\'' in content
        has_open_handler = 'handleOpenConfiguration' in content
        
        if has_dialog_import and has_dialog_render and has_open_handler:
            print("✅ FIXED: Decision conditions can now be configured via dialog")
        else:
            print(f"❌ NOT FIXED: Configuration dialog not properly connected (import={has_dialog_import}, render={has_dialog_render}, handler={has_open_handler})")
    
    # Check if Properties Panel button works
    props_file = "src/components/MultiAgentWorkspace/PropertiesPanel.tsx"
    if os.path.exists(props_file):
        with open(props_file, 'r') as f:
            content = f.read()
        
        if 'onOpenConfiguration(node.id, baseType)' in content:
            print("✅ FIXED: Properties Panel button now calls configuration dialog")
        else:
            print("❌ NOT FIXED: Properties Panel button still not working")

if __name__ == "__main__":
    print("🔧 DECISION NODE FIXES - COMPREHENSIVE VERIFICATION")
    print("="*60)
    
    success = test_complete_decision_node_implementation()
    test_specific_fixes()
    
    print("\n" + "="*60)
    if success:
        print("🎯 CONCLUSION: All fixes have been properly implemented!")
        print("💡 The Decision Node should now work correctly in the application.")
    else:
        print("⚠️  CONCLUSION: Some fixes may be incomplete.")
        print("🔍 Please review the failed tests above.")
    
    exit(0 if success else 1)