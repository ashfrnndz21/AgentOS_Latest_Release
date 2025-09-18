#!/usr/bin/env python3

"""
Comprehensive test to verify all Strands nodes work consistently:
- Human, Memory, Guardrails, Aggregator, Monitor nodes
- Name updates on canvas
- Properties Panel integration
- Configuration dialogs (if they exist)
"""

import os
import re

def test_node_name_display_consistency():
    """Test that all Strands nodes use proper name fallback pattern"""
    print("🧪 Testing Node Name Display Consistency...")
    
    nodes_to_test = [
        ('StrandsHumanNode', 'Human'),
        ('StrandsMemoryNode', 'Memory'),
        ('StrandsGuardrailNode', 'Guardrail'),
        ('StrandsAggregatorNode', 'Aggregator'),
        ('StrandsMonitorNode', 'Monitor'),
        ('StrandsDecisionNode', 'Decision'),
        ('StrandsHandoffNode', 'Handoff')
    ]
    
    results = {}
    
    for node_name, default_name in nodes_to_test:
        file_path = f"src/components/MultiAgentWorkspace/nodes/{node_name}.tsx"
        
        if not os.path.exists(file_path):
            print(f"❌ {node_name} file not found")
            results[node_name] = False
            continue
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Check for proper name fallback pattern
        has_proper_fallback = f'data.label || data.name || \'{default_name}\'' in content
        
        if not has_proper_fallback:
            # Check if it at least uses data.name
            has_data_name = 'data.name' in content
            if has_data_name:
                print(f"⚠️  {node_name}: Uses data.name but missing fallback")
                results[node_name] = 'partial'
            else:
                print(f"❌ {node_name}: No name display found")
                results[node_name] = False
        else:
            print(f"✅ {node_name}: Proper name fallback")
            results[node_name] = True
    
    return results

def test_properties_panel_integration():
    """Test that all nodes are properly integrated in Properties Panel"""
    print("\n🧪 Testing Properties Panel Integration...")
    
    props_file = "src/components/MultiAgentWorkspace/PropertiesPanel.tsx"
    if not os.path.exists(props_file):
        print("❌ PropertiesPanel file not found")
        return False
    
    with open(props_file, 'r') as f:
        content = f.read()
    
    # Check for render functions for each node type
    node_types = ['decision', 'handoff', 'aggregator', 'monitor', 'human', 'memory', 'guardrail']
    render_functions = {}
    
    for node_type in node_types:
        render_function = f'render{node_type.capitalize()}Properties' in content
        render_functions[node_type] = render_function
        status = "✅ PASS" if render_function else "❌ FAIL"
        print(f"  {status} {node_type} render function")
    
    # Check for switch case handling
    switch_cases = {}
    for node_type in node_types:
        case_pattern = f"case '{node_type}'"
        has_case = case_pattern in content
        switch_cases[node_type] = has_case
    
    print(f"\n  Switch case coverage: {sum(switch_cases.values())}/{len(node_types)}")
    
    return render_functions, switch_cases

def test_configuration_dialogs_existence():
    """Test which nodes have configuration dialogs"""
    print("\n🧪 Testing Configuration Dialogs Existence...")
    
    config_dir = "src/components/MultiAgentWorkspace/config"
    if not os.path.exists(config_dir):
        print("❌ Config directory not found")
        return {}
    
    # List all config dialog files
    config_files = []
    try:
        for file in os.listdir(config_dir):
            if file.endswith('ConfigDialog.tsx'):
                config_files.append(file)
    except:
        print("❌ Could not list config directory")
        return {}
    
    print(f"  Found config dialogs: {len(config_files)}")
    for file in config_files:
        print(f"    ✅ {file}")
    
    # Check which node types have config dialogs
    node_types = ['Decision', 'Handoff', 'Aggregator', 'Monitor', 'Human', 'Memory', 'Guardrail']
    dialog_coverage = {}
    
    for node_type in node_types:
        dialog_file = f"{node_type}NodeConfigDialog.tsx"
        has_dialog = dialog_file in config_files
        dialog_coverage[node_type] = has_dialog
        status = "✅ HAS" if has_dialog else "❌ MISSING"
        print(f"    {status} {node_type}NodeConfigDialog")
    
    return dialog_coverage

def test_strands_blank_workspace_integration():
    """Test that StrandsBlankWorkspace handles all node types"""
    print("\n🧪 Testing StrandsBlankWorkspace Integration...")
    
    workspace_file = "src/components/MultiAgentWorkspace/StrandsBlankWorkspace.tsx"
    if not os.path.exists(workspace_file):
        print("❌ StrandsBlankWorkspace file not found")
        return False
    
    with open(workspace_file, 'r') as f:
        content = f.read()
    
    # Check for configuration dialog handling
    node_types = ['decision', 'handoff', 'aggregator', 'monitor', 'human', 'memory', 'guardrail']
    dialog_handling = {}
    
    for node_type in node_types:
        dialog_condition = f"configDialog.type === '{node_type}'" in content
        dialog_handling[node_type] = dialog_condition
        status = "✅ HANDLED" if dialog_condition else "❌ MISSING"
        print(f"  {status} {node_type} dialog handling")
    
    # Check for handleOpenConfiguration function
    has_open_config = 'handleOpenConfiguration' in content
    print(f"  ✅ handleOpenConfiguration: {'PASS' if has_open_config else 'FAIL'}")
    
    return dialog_handling, has_open_config

def test_canvas_node_types_mapping():
    """Test that all node types are properly mapped in canvas"""
    print("\n🧪 Testing Canvas Node Types Mapping...")
    
    canvas_file = "src/components/MultiAgentWorkspace/StrandsWorkflowCanvas.tsx"
    if not os.path.exists(canvas_file):
        print("❌ StrandsWorkflowCanvas file not found")
        return False
    
    with open(canvas_file, 'r') as f:
        content = f.read()
    
    # Check nodeTypes mapping
    expected_mappings = [
        'strands-agent',
        'strands-tool', 
        'strands-decision',
        'strands-handoff',
        'strands-human',
        'strands-memory',
        'strands-guardrail',
        'strands-aggregator',
        'strands-monitor'
    ]
    
    mapping_results = {}
    for mapping in expected_mappings:
        has_mapping = f"'{mapping}'" in content
        mapping_results[mapping] = has_mapping
        status = "✅ MAPPED" if has_mapping else "❌ MISSING"
        print(f"  {status} {mapping}")
    
    return mapping_results

def create_missing_config_dialogs():
    """Create missing configuration dialogs for nodes that don't have them"""
    print("\n🔧 Creating Missing Configuration Dialogs...")
    
    # Check which dialogs are missing
    config_dir = "src/components/MultiAgentWorkspace/config"
    missing_dialogs = []
    
    node_types = ['Aggregator', 'Monitor', 'Human', 'Memory', 'Guardrail']
    
    for node_type in node_types:
        dialog_file = f"{config_dir}/{node_type}NodeConfigDialog.tsx"
        if not os.path.exists(dialog_file):
            missing_dialogs.append(node_type)
    
    if missing_dialogs:
        print(f"  Missing dialogs for: {', '.join(missing_dialogs)}")
        return missing_dialogs
    else:
        print("  ✅ All configuration dialogs exist")
        return []

def fix_node_name_displays():
    """Fix node name displays that don't use proper fallback"""
    print("\n🔧 Fixing Node Name Displays...")
    
    nodes_to_fix = [
        ('StrandsHumanNode', 'Human'),
        ('StrandsMemoryNode', 'Memory'), 
        ('StrandsGuardrailNode', 'Guardrail'),
        ('StrandsAggregatorNode', 'Aggregator'),
        ('StrandsMonitorNode', 'Monitor')
    ]
    
    fixes_needed = []
    
    for node_name, default_name in nodes_to_fix:
        file_path = f"src/components/MultiAgentWorkspace/nodes/{node_name}.tsx"
        
        if not os.path.exists(file_path):
            continue
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Check if it needs fixing
        has_proper_fallback = f'data.label || data.name || \'{default_name}\'' in content
        
        if not has_proper_fallback and 'data.name' in content:
            fixes_needed.append((node_name, default_name, file_path))
    
    if fixes_needed:
        print(f"  Nodes needing fixes: {len(fixes_needed)}")
        for node_name, default_name, _ in fixes_needed:
            print(f"    - {node_name} (fallback to '{default_name}')")
    else:
        print("  ✅ All nodes have proper name fallback")
    
    return fixes_needed

def main():
    """Run comprehensive test of all Strands nodes"""
    print("🚀 Testing All Strands Nodes Consistency...\n")
    
    # Test 1: Node name display consistency
    name_results = test_node_name_display_consistency()
    
    # Test 2: Properties Panel integration
    render_functions, switch_cases = test_properties_panel_integration()
    
    # Test 3: Configuration dialogs existence
    dialog_coverage = test_configuration_dialogs_existence()
    
    # Test 4: StrandsBlankWorkspace integration
    dialog_handling, has_open_config = test_strands_blank_workspace_integration()
    
    # Test 5: Canvas node types mapping
    mapping_results = test_canvas_node_types_mapping()
    
    # Analysis and fixes
    missing_dialogs = create_missing_config_dialogs()
    fixes_needed = fix_node_name_displays()
    
    # Summary
    print("\n" + "="*70)
    print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
    print("="*70)
    
    # Name display results
    name_pass = sum(1 for v in name_results.values() if v == True)
    name_partial = sum(1 for v in name_results.values() if v == 'partial')
    name_total = len(name_results)
    print(f"✅ Name Display: {name_pass}/{name_total} perfect, {name_partial} partial")
    
    # Properties Panel results
    render_pass = sum(render_functions.values())
    render_total = len(render_functions)
    print(f"✅ Properties Panel: {render_pass}/{render_total} render functions")
    
    # Configuration dialogs
    dialog_pass = sum(dialog_coverage.values())
    dialog_total = len(dialog_coverage)
    print(f"✅ Config Dialogs: {dialog_pass}/{dialog_total} exist")
    
    # Canvas mapping
    mapping_pass = sum(mapping_results.values())
    mapping_total = len(mapping_results)
    print(f"✅ Canvas Mapping: {mapping_pass}/{mapping_total} mapped")
    
    # Overall assessment
    total_issues = len(fixes_needed) + len(missing_dialogs)
    
    print(f"\n🎯 OVERALL ASSESSMENT:")
    if total_issues == 0:
        print("🎉 ALL NODES ARE CONSISTENTLY WORKING!")
        print("✨ Decision and Handoff level functionality across all nodes")
    else:
        print(f"⚠️  {total_issues} issues found that need attention:")
        if fixes_needed:
            print(f"  - {len(fixes_needed)} nodes need name display fixes")
        if missing_dialogs:
            print(f"  - {len(missing_dialogs)} nodes missing config dialogs")
    
    print(f"\n📋 RECOMMENDATIONS:")
    if fixes_needed:
        print("1. Fix name display fallbacks for consistency")
    if missing_dialogs:
        print("2. Create missing configuration dialogs")
    if not has_open_config:
        print("3. Ensure handleOpenConfiguration is implemented")
    
    return total_issues == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)