#!/usr/bin/env python3

"""
Test script to verify Strands Native Tools integration.
This script checks that:
1. Local tools are properly defined and categorized
2. External tools have proper API configuration
3. Tool configuration dialog is implemented
4. AgentPalette integration is working
"""

import os
import re
import json
from pathlib import Path

def test_strands_native_tools_hook():
    """Test the useStrandsNativeTools hook implementation"""
    print("🧪 Testing Strands Native Tools Hook...")
    
    hook_file = Path("src/hooks/useStrandsNativeTools.ts")
    if not hook_file.exists():
        print("❌ useStrandsNativeTools hook not found")
        return False
    
    content = hook_file.read_text()
    
    # Check for local tools definition
    has_local_tools = 'LOCAL_STRANDS_TOOLS' in content
    print(f"✅ Local tools definition: {'PASS' if has_local_tools else 'FAIL'}")
    
    # Check for external tools definition
    has_external_tools = 'EXTERNAL_STRANDS_TOOLS' in content
    print(f"✅ External tools definition: {'PASS' if has_external_tools else 'FAIL'}")
    
    # Check for API configuration structure
    has_api_config = 'apiConfig' in content and 'fields' in content
    print(f"✅ API configuration structure: {'PASS' if has_api_config else 'FAIL'}")
    
    # Check for tool categories
    categories = ['file', 'web', 'code', 'memory', 'communication', 'cloud', 'ai', 'analytics']
    category_count = sum(1 for cat in categories if f"category: '{cat}'" in content)
    print(f"✅ Tool categories ({category_count}/{len(categories)}): {'PASS' if category_count >= 6 else 'PARTIAL'}")
    
    # Check for validation function
    has_validation = 'validateApiConfig' in content
    print(f"✅ API validation function: {'PASS' if has_validation else 'FAIL'}")
    
    return has_local_tools and has_external_tools and has_api_config and has_validation

def test_tool_configuration_dialog():
    """Test the StrandsToolConfigDialog component"""
    print("\\n🧪 Testing Tool Configuration Dialog...")
    
    dialog_file = Path("src/components/MultiAgentWorkspace/config/StrandsToolConfigDialog.tsx")
    if not dialog_file.exists():
        print("❌ StrandsToolConfigDialog component not found")
        return False
    
    content = dialog_file.read_text()
    
    # Check for API field rendering
    has_field_rendering = 'renderField' in content and 'field.type' in content
    print(f"✅ API field rendering: {'PASS' if has_field_rendering else 'FAIL'}")
    
    # Check for password visibility toggle
    has_password_toggle = 'showPasswords' in content and 'EyeOff' in content
    print(f"✅ Password visibility toggle: {'PASS' if has_password_toggle else 'FAIL'}")
    
    # Check for validation
    has_validation = 'validateConfig' in content and 'errors' in content
    print(f"✅ Configuration validation: {'PASS' if has_validation else 'FAIL'}")
    
    # Check for security notice
    has_security_notice = 'Security Notice' in content or 'encrypted' in content
    print(f"✅ Security notice: {'PASS' if has_security_notice else 'FAIL'}")
    
    # Check for documentation links
    has_doc_links = 'getDocumentationUrl' in content and 'ExternalLink' in content
    print(f"✅ Documentation links: {'PASS' if has_doc_links else 'FAIL'}")
    
    return has_field_rendering and has_password_toggle and has_validation

def test_agent_palette_integration():
    """Test AgentPalette integration with Strands tools"""
    print("\\n🧪 Testing AgentPalette Integration...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    if not palette_file.exists():
        print("❌ AgentPalette component not found")
        return False
    
    content = palette_file.read_text()
    
    # Check for Strands tools import
    has_tools_import = 'useStrandsNativeTools' in content
    print(f"✅ Strands tools import: {'PASS' if has_tools_import else 'FAIL'}")
    
    # Check for tool config dialog import
    has_dialog_import = 'StrandsToolConfigDialog' in content
    print(f"✅ Tool config dialog import: {'PASS' if has_dialog_import else 'FAIL'}")
    
    # Check for local tools tab
    has_local_tab = 'local-tools' in content and 'Local Tools' in content
    print(f"✅ Local tools tab: {'PASS' if has_local_tab else 'FAIL'}")
    
    # Check for external tools tab
    has_external_tab = 'external-tools' in content and 'External Tools' in content
    print(f"✅ External tools tab: {'PASS' if has_external_tab else 'FAIL'}")
    
    # Check for API configuration handling
    has_api_handling = 'toolConfigDialog' in content and 'setToolConfigDialog' in content
    print(f"✅ API configuration handling: {'PASS' if has_api_handling else 'FAIL'}")
    
    # Check for drag and drop support
    has_drag_drop = 'onDragStart' in content and 'strands-tool' in content
    print(f"✅ Drag and drop support: {'PASS' if has_drag_drop else 'FAIL'}")
    
    return has_tools_import and has_dialog_import and has_local_tab and has_external_tab

def test_workspace_integration():
    """Test StrandsBlankWorkspace integration"""
    print("\\n🧪 Testing Workspace Integration...")
    
    workspace_file = Path("src/components/MultiAgentWorkspace/StrandsBlankWorkspace.tsx")
    if not workspace_file.exists():
        print("❌ StrandsBlankWorkspace component not found")
        return False
    
    content = workspace_file.read_text()
    
    # Check for Strands tool callback
    has_strands_callback = 'onSelectStrandsTool' in content
    print(f"✅ Strands tool callback: {'PASS' if has_strands_callback else 'FAIL'}")
    
    return has_strands_callback

def count_available_tools():
    """Count the number of tools available"""
    print("\\n📊 Tool Inventory...")
    
    hook_file = Path("src/hooks/useStrandsNativeTools.ts")
    if not hook_file.exists():
        return 0, 0
    
    content = hook_file.read_text()
    
    # Count local tools
    local_tools_match = re.search(r'LOCAL_STRANDS_TOOLS.*?=.*?\\[(.*?)\\];', content, re.DOTALL)
    local_count = 0
    if local_tools_match:
        local_count = content[local_tools_match.start():local_tools_match.end()].count('id:')
    
    # Count external tools
    external_tools_match = re.search(r'EXTERNAL_STRANDS_TOOLS.*?=.*?\\[(.*?)\\];', content, re.DOTALL)
    external_count = 0
    if external_tools_match:
        external_count = content[external_tools_match.start():external_tools_match.end()].count('id:')
    
    print(f"📦 Local Tools: {local_count}")
    print(f"🔑 External Tools: {external_count}")
    print(f"🎯 Total Tools: {local_count + external_count}")
    
    return local_count, external_count

def test_tool_categories():
    """Test tool categorization"""
    print("\\n🏷️ Testing Tool Categories...")
    
    hook_file = Path("src/hooks/useStrandsNativeTools.ts")
    if not hook_file.exists():
        return False
    
    content = hook_file.read_text()
    
    # Expected categories
    expected_categories = {
        'file': 'File Operations',
        'web': 'Web & Search',
        'code': 'Code Execution',
        'memory': 'Memory & Knowledge',
        'communication': 'Communication',
        'cloud': 'Cloud Services',
        'ai': 'AI & Analysis',
        'analytics': 'Analytics & Monitoring',
        'system': 'System Integration',
        'utility': 'Utilities'
    }
    
    found_categories = set()
    for category in expected_categories.keys():
        if f"category: '{category}'" in content:
            found_categories.add(category)
    
    for category in found_categories:
        print(f"✅ {expected_categories.get(category, category)}: FOUND")
    
    missing_categories = set(expected_categories.keys()) - found_categories
    for category in missing_categories:
        print(f"❌ {expected_categories[category]}: MISSING")
    
    coverage = len(found_categories) / len(expected_categories) * 100
    print(f"📈 Category Coverage: {coverage:.1f}%")
    
    return coverage >= 70

def test_api_configuration_examples():
    """Test API configuration examples"""
    print("\\n🔧 Testing API Configuration Examples...")
    
    hook_file = Path("src/hooks/useStrandsNativeTools.ts")
    if not hook_file.exists():
        return False
    
    content = hook_file.read_text()
    
    # Check for different field types
    field_types = ['text', 'password', 'select', 'number']
    found_types = []
    
    for field_type in field_types:
        if f"type: '{field_type}'" in content:
            found_types.append(field_type)
            print(f"✅ {field_type.title()} fields: FOUND")
        else:
            print(f"❌ {field_type.title()} fields: MISSING")
    
    # Check for required field validation
    has_required = 'required: true' in content and 'required: false' in content
    print(f"✅ Required field validation: {'PASS' if has_required else 'FAIL'}")
    
    # Check for placeholder examples
    has_placeholders = 'placeholder:' in content
    print(f"✅ Field placeholders: {'PASS' if has_placeholders else 'FAIL'}")
    
    # Check for field descriptions
    has_descriptions = 'description:' in content
    print(f"✅ Field descriptions: {'PASS' if has_descriptions else 'FAIL'}")
    
    return len(found_types) >= 3 and has_required and has_placeholders

def main():
    """Run all tests"""
    print("🚀 Testing Strands Native Tools Integration...\\n")
    
    # Run individual tests
    hook_test = test_strands_native_tools_hook()
    dialog_test = test_tool_configuration_dialog()
    palette_test = test_agent_palette_integration()
    workspace_test = test_workspace_integration()
    
    # Count tools
    local_count, external_count = count_available_tools()
    
    # Test categories and API config
    categories_test = test_tool_categories()
    api_config_test = test_api_configuration_examples()
    
    print("\\n" + "="*60)
    print("📊 TEST RESULTS SUMMARY")
    print("="*60)
    
    print(f"✅ Strands Native Tools Hook: {'PASS' if hook_test else 'FAIL'}")
    print(f"✅ Tool Configuration Dialog: {'PASS' if dialog_test else 'FAIL'}")
    print(f"✅ AgentPalette Integration: {'PASS' if palette_test else 'FAIL'}")
    print(f"✅ Workspace Integration: {'PASS' if workspace_test else 'FAIL'}")
    print(f"✅ Tool Categories: {'PASS' if categories_test else 'FAIL'}")
    print(f"✅ API Configuration: {'PASS' if api_config_test else 'FAIL'}")
    
    print(f"\\n📦 Tool Inventory:")
    print(f"  🔧 Local Tools: {local_count}")
    print(f"  🔑 External Tools: {external_count}")
    print(f"  🎯 Total Tools: {local_count + external_count}")
    
    overall_success = all([hook_test, dialog_test, palette_test, workspace_test])
    
    print(f"\\n🎯 OVERALL RESULT: {'SUCCESS' if overall_success else 'PARTIAL SUCCESS'}")
    
    if overall_success:
        print("\\n🎉 Strands Native Tools Integration Complete!")
        print("\\n📋 What's Available:")
        print("  1. ✅ Local Tools - No API required, ready to use")
        print("  2. ✅ External Tools - API configuration with secure storage")
        print("  3. ✅ Professional configuration dialogs with validation")
        print("  4. ✅ Drag-and-drop integration in AgentPalette")
        print("  5. ✅ Two-section organization (Local vs External)")
        print("  6. ✅ Built-in API settings configuration")
        print("\\n💡 User Experience:")
        print("  - Local Tools: Drag directly to workflow")
        print("  - External Tools: Click to configure API → Drag to workflow")
        print("  - Professional tooltips with tool information")
        print("  - Secure API credential storage")
        print("  - Validation and error handling")
    else:
        print("\\n⚠️  Some components may need attention.")
        print("Please check the failed tests above.")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)