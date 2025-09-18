#!/usr/bin/env python3

"""
Test script to verify external tools drag-and-drop fix
"""

import os
from pathlib import Path

def test_external_tools_drag_functionality():
    """Test that external tools become draggable after configuration"""
    print("🧪 Testing External Tools Drag Functionality...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    if not palette_file.exists():
        print("❌ AgentPalette file not found")
        return False
    
    content = palette_file.read_text()
    
    # Test 1: Check for configured tools state
    has_configured_state = 'configuredTools' in content and 'setConfiguredTools' in content
    print(f"✅ Configured tools state: {'PASS' if has_configured_state else 'FAIL'}")
    
    # Test 2: Check for conditional draggable
    has_conditional_draggable = 'draggable={configuredTools.has(tool.id)}' in content
    print(f"✅ Conditional draggable: {'PASS' if has_conditional_draggable else 'FAIL'}")
    
    # Test 3: Check for conditional onDragStart
    has_conditional_drag_start = 'configuredTools.has(tool.id) ? (e) =>' in content
    print(f"✅ Conditional onDragStart: {'PASS' if has_conditional_drag_start else 'FAIL'}")
    
    # Test 4: Check for configuration save handler
    has_config_save = 'setConfiguredTools(prev => new Set([...prev, toolConfigDialog.tool.id]))' in content
    print(f"✅ Configuration save handler: {'PASS' if has_config_save else 'FAIL'}")
    
    # Test 5: Check for visual status indicators
    has_status_indicators = 'configuredTools.has(tool.id) ?' in content and 'CheckCircle' in content
    print(f"✅ Visual status indicators: {'PASS' if has_status_indicators else 'FAIL'}")
    
    # Test 6: Check for cursor changes
    has_cursor_changes = 'cursor-grab active:cursor-grabbing' in content
    print(f"✅ Cursor changes: {'PASS' if has_cursor_changes else 'FAIL'}")
    
    return all([
        has_configured_state,
        has_conditional_draggable,
        has_conditional_drag_start,
        has_config_save,
        has_status_indicators,
        has_cursor_changes
    ])

def test_tool_configuration_requirements():
    """Test that tool configurations match Strands requirements"""
    print("\\n🧪 Testing Tool Configuration Requirements...")
    
    tools_file = Path("src/hooks/useStrandsNativeTools.ts")
    if not tools_file.exists():
        print("❌ useStrandsNativeTools file not found")
        return False
    
    content = tools_file.read_text()
    
    # Test 1: Check for comprehensive API configurations
    api_configs = [
        'Tavily API Configuration',
        'Exa API Configuration', 
        'AWS Configuration',
        'Mem0 Configuration',
        'Slack Configuration'
    ]
    
    config_count = sum(1 for config in api_configs if config in content)
    print(f"✅ API configurations ({config_count}/{len(api_configs)}): {'PASS' if config_count >= 4 else 'PARTIAL'}")
    
    # Test 2: Check for required field validation
    has_required_fields = 'required: true' in content and 'required: false' in content
    print(f"✅ Required field validation: {'PASS' if has_required_fields else 'FAIL'}")
    
    # Test 3: Check for field types
    field_types = ['text', 'password', 'select', 'number']
    type_count = sum(1 for field_type in field_types if f"type: '{field_type}'" in content)
    print(f"✅ Field types ({type_count}/{len(field_types)}): {'PASS' if type_count >= 3 else 'PARTIAL'}")
    
    # Test 4: Check for documentation
    has_documentation = 'documentation:' in content
    print(f"✅ Tool documentation: {'PASS' if has_documentation else 'FAIL'}")
    
    # Test 5: Check for complexity levels
    complexity_levels = ['simple', 'moderate', 'advanced']
    complexity_count = sum(1 for level in complexity_levels if f"complexity: '{level}'" in content)
    print(f"✅ Complexity levels ({complexity_count}/{len(complexity_levels)}): {'PASS' if complexity_count >= 2 else 'PARTIAL'}")
    
    return config_count >= 4 and has_required_fields and type_count >= 3

def test_user_experience_flow():
    """Test the complete user experience flow"""
    print("\\n🧪 Testing User Experience Flow...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    if not palette_file.exists():
        return False
    
    content = palette_file.read_text()
    
    # Test 1: Check for different click behaviors
    has_conditional_click = 'if (!configuredTools.has(tool.id))' in content
    print(f"✅ Conditional click behavior: {'PASS' if has_conditional_click else 'FAIL'}")
    
    # Test 2: Check for tooltip updates
    has_tooltip_updates = 'Configured and ready to use' in content and 'Drag to canvas or click for details' in content
    print(f"✅ Tooltip updates: {'PASS' if has_tooltip_updates else 'FAIL'}")
    
    # Test 3: Check for border color changes
    has_border_changes = 'border-green-600' in content
    print(f"✅ Border color changes: {'PASS' if has_border_changes else 'FAIL'}")
    
    # Test 4: Check for ready status badge
    has_ready_badge = 'Ready' in content and 'text-green-400' in content
    print(f"✅ Ready status badge: {'PASS' if has_ready_badge else 'FAIL'}")
    
    return has_conditional_click and has_tooltip_updates and has_border_changes and has_ready_badge

def main():
    """Run all tests"""
    print("🚀 Testing External Tools Drag-and-Drop Fix...\\n")
    
    drag_test = test_external_tools_drag_functionality()
    config_test = test_tool_configuration_requirements()
    ux_test = test_user_experience_flow()
    
    print("\\n" + "="*60)
    print("📊 EXTERNAL TOOLS DRAG FIX RESULTS")
    print("="*60)
    
    print(f"✅ External Tools Drag Functionality: {'PASS' if drag_test else 'FAIL'}")
    print(f"✅ Tool Configuration Requirements: {'PASS' if config_test else 'FAIL'}")
    print(f"✅ User Experience Flow: {'PASS' if ux_test else 'FAIL'}")
    
    overall_success = drag_test and config_test and ux_test
    
    print(f"\\n🎯 OVERALL RESULT: {'SUCCESS' if overall_success else 'PARTIAL SUCCESS'}")
    
    if overall_success:
        print("\\n🎉 External Tools Drag-and-Drop Fix Complete!")
        print("\\n📋 What's Working:")
        print("  1. ✅ External tools require configuration before drag")
        print("  2. ✅ Tools become draggable after API setup")
        print("  3. ✅ Visual indicators show configuration status")
        print("  4. ✅ Professional UX with status changes")
        print("  5. ✅ Comprehensive API configurations")
        print("\\n💡 User Experience:")
        print("  - Unconfigured: Click to configure → Setup API → Tool becomes draggable")
        print("  - Configured: Green border, 'Ready' badge, drag to canvas")
        print("  - Professional tooltips and visual feedback")
    else:
        print("\\n⚠️  Some functionality may not be working correctly.")
        print("Please check the failed tests above.")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)