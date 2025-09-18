#!/usr/bin/env python3
"""
Debug script to identify why configuration buttons and save changes aren't working.
This script will analyze the current state and provide specific fixes.
"""

import json
import os
from pathlib import Path

def debug_properties_panel_buttons():
    """Debug Properties Panel button functionality"""
    
    print("🔍 Debugging Properties Panel Button Issues")
    print("=" * 60)
    
    properties_panel_path = Path("src/components/MultiAgentWorkspace/PropertiesPanel.tsx")
    
    with open(properties_panel_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("🔘 Checking Edit Decision Logic button:")
    
    # Check button implementation
    button_patterns = [
        "onClick={() => {",
        "const baseType = node.type.replace('strands-', '');",
        "onOpenConfiguration?.(node.id, baseType);",
        "Edit Decision Logic",
        "Configure Decision Logic"
    ]
    
    for pattern in button_patterns:
        if pattern in content:
            print(f"  ✅ {pattern[:40]}... - Found")
        else:
            print(f"  ❌ {pattern[:40]}... - Missing")
    
    print("\n💾 Checking Save Changes button:")
    
    # Check Save Changes button
    save_patterns = [
        "Save Changes",
        "onClick={() => {",
        "onUpdateNode(node.id, localData)",
        "saveNodeConfiguration(node.id, baseType, localData, node.position)"
    ]
    
    for pattern in save_patterns:
        if pattern in content:
            print(f"  ✅ {pattern[:40]}... - Found")
        else:
            print(f"  ❌ {pattern[:40]}... - Missing")
    
    print("\n🔄 Checking updateLocalData function:")
    
    # Check updateLocalData
    update_patterns = [
        "const updateLocalData = (field: string, value: any) => {",
        "const newData = { ...localData, [field]: value };",
        "onUpdateNode(node.id, newData);",
        "saveNodeConfiguration(node.id, baseType, newData, node.position);"
    ]
    
    for pattern in update_patterns:
        if pattern in content:
            print(f"  ✅ {pattern[:50]}... - Found")
        else:
            print(f"  ❌ {pattern[:50]}... - Missing")

def debug_blank_workspace_integration():
    """Debug BlankWorkspace integration"""
    
    print("\n🔗 Debugging BlankWorkspace Integration")
    print("=" * 60)
    
    blank_workspace_path = Path("src/components/MultiAgentWorkspace/BlankWorkspace.tsx")
    
    with open(blank_workspace_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("🔧 Checking handleOpenConfiguration:")
    
    # Check handleOpenConfiguration
    open_config_patterns = [
        "const handleOpenConfiguration = useCallback((nodeId: string, nodeType: string) => {",
        "const node = nodes.find(n => n.id === nodeId);",
        "setConfigNodeId(nodeId);",
        "setConfigDialogOpen(true);"
    ]
    
    for pattern in open_config_patterns:
        if pattern in content:
            print(f"  ✅ {pattern[:50]}... - Found")
        else:
            print(f"  ❌ {pattern[:50]}... - Missing")
    
    print("\n💾 Checking handleUtilityConfigSave:")
    
    # Check handleUtilityConfigSave
    save_config_patterns = [
        "const handleUtilityConfigSave = useCallback((config: any) => {",
        "setNodes((nds) => \n      nds.map((node) => {",
        "if (node.id === configNodeId) {",
        "label: config.name"
    ]
    
    for pattern in save_config_patterns:
        if pattern in content:
            print(f"  ✅ {pattern[:50]}... - Found")
        else:
            print(f"  ❌ {pattern[:50]}... - Missing")
    
    print("\n🎭 Checking dialog rendering:")
    
    # Check dialog rendering
    dialog_patterns = [
        "configDialogOpen && configDialogType === 'decision'",
        "DecisionNodeConfigDialog",
        "onSave={handleUtilityConfigSave}",
        "onOpenConfiguration={handleOpenConfiguration}"
    ]
    
    for pattern in dialog_patterns:
        if pattern in content:
            print(f"  ✅ {pattern[:40]}... - Found")
        else:
            print(f"  ❌ {pattern[:40]}... - Missing")

def debug_node_visual_updates():
    """Debug node visual updates"""
    
    print("\n🎨 Debugging Node Visual Updates")
    print("=" * 60)
    
    decision_node_path = Path("src/components/MultiAgentWorkspace/nodes/ModernDecisionNode.tsx")
    
    with open(decision_node_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("🏷️ Checking label display:")
    
    # Check label display
    label_patterns = [
        "data.label",
        "substring(0, 12)",
        "text-slate-100"
    ]
    
    for pattern in label_patterns:
        if pattern in content:
            print(f"  ✅ {pattern} - Found")
        else:
            print(f"  ❌ {pattern} - Missing")
    
    print("\n🟢 Checking configuration status indicator:")
    
    # Check status indicator
    status_patterns = [
        "data.isConfigured",
        "bg-green-500",
        "getStatusColor(data.status)"
    ]
    
    for pattern in status_patterns:
        if pattern in content:
            print(f"  ✅ {pattern} - Found")
        else:
            print(f"  ❌ {pattern} - Missing")

def identify_specific_issues():
    """Identify specific issues and provide fixes"""
    
    print("\n🚨 Identifying Specific Issues")
    print("=" * 60)
    
    issues = []
    
    # Check if Properties Panel is properly connected
    properties_panel_path = Path("src/components/MultiAgentWorkspace/PropertiesPanel.tsx")
    blank_workspace_path = Path("src/components/MultiAgentWorkspace/BlankWorkspace.tsx")
    
    with open(properties_panel_path, 'r', encoding='utf-8') as f:
        props_content = f.read()
    
    with open(blank_workspace_path, 'r', encoding='utf-8') as f:
        workspace_content = f.read()
    
    # Issue 1: Check if onOpenConfiguration is being passed
    if "onOpenConfiguration={handleOpenConfiguration}" not in workspace_content:
        issues.append({
            "issue": "onOpenConfiguration prop not passed to Properties Panel",
            "fix": "Add onOpenConfiguration={handleOpenConfiguration} to EnhancedPropertiesPanel in BlankWorkspace",
            "severity": "HIGH"
        })
    
    # Issue 2: Check if updateLocalData is working
    if "saveNodeConfiguration(node.id, baseType, newData, node.position);" not in props_content:
        issues.append({
            "issue": "updateLocalData not saving to persistent storage",
            "fix": "Add saveNodeConfiguration call to updateLocalData function",
            "severity": "HIGH"
        })
    
    # Issue 3: Check if configuration dialogs are rendered
    if "DecisionNodeConfigDialog" not in workspace_content:
        issues.append({
            "issue": "Configuration dialogs not rendered",
            "fix": "Add DecisionNodeConfigDialog and HandoffNodeConfigDialog rendering",
            "severity": "HIGH"
        })
    
    # Issue 4: Check if node updates are working
    if "setNodes((nds) => \n      nds.map((node) => {" not in workspace_content:
        issues.append({
            "issue": "Node updates not working properly",
            "fix": "Fix handleUtilityConfigSave to update existing nodes",
            "severity": "HIGH"
        })
    
    if issues:
        print("🔥 Issues Found:")
        for i, issue in enumerate(issues, 1):
            print(f"\n{i}. **{issue['issue']}** ({issue['severity']})")
            print(f"   Fix: {issue['fix']}")
    else:
        print("✅ No obvious issues found in code structure")
    
    return issues

def create_debug_report():
    """Create a debug report with findings"""
    
    print("\n📊 Creating Debug Report")
    print("=" * 60)
    
    report = {
        "debug_timestamp": "2024-11-09",
        "user_reported_issues": [
            "Edit Decision Logic button doesn't work",
            "Save Changes button doesn't persist changes",
            "Node canvas doesn't update when configured"
        ],
        "code_analysis": "Code structure appears correct after IDE formatting",
        "potential_causes": [
            "React state not updating properly",
            "Event handlers not firing",
            "Props not being passed correctly",
            "localStorage not persisting",
            "Node re-rendering issues"
        ],
        "debugging_steps": [
            "Check browser console for error messages",
            "Verify onOpenConfiguration prop is passed",
            "Test if updateLocalData function is called",
            "Check if configuration dialogs are imported",
            "Verify node update mechanism"
        ],
        "immediate_fixes_needed": [
            "Add console.log debugging to button clicks",
            "Verify Props Panel integration with BlankWorkspace",
            "Test configuration dialog opening",
            "Check localStorage persistence",
            "Verify node visual updates"
        ]
    }
    
    with open("CONFIGURATION-DEBUG-REPORT.md", 'w') as f:
        f.write("# Configuration Debug Report\n\n")
        f.write("## User Reported Issues\n")
        for issue in report["user_reported_issues"]:
            f.write(f"- {issue}\n")
        
        f.write("\n## Code Analysis\n")
        f.write(f"{report['code_analysis']}\n")
        
        f.write("\n## Potential Causes\n")
        for cause in report["potential_causes"]:
            f.write(f"- {cause}\n")
        
        f.write("\n## Debugging Steps\n")
        for step in report["debugging_steps"]:
            f.write(f"- {step}\n")
        
        f.write("\n## Immediate Fixes Needed\n")
        for fix in report["immediate_fixes_needed"]:
            f.write(f"- {fix}\n")
        
        f.write("\n## Next Actions\n")
        f.write("1. Add comprehensive debugging logs\n")
        f.write("2. Test each button individually\n")
        f.write("3. Verify Props Panel integration\n")
        f.write("4. Check browser console for errors\n")
        f.write("5. Test configuration persistence\n")
    
    print("📄 Created debug report: CONFIGURATION-DEBUG-REPORT.md")

if __name__ == "__main__":
    print("🚀 Starting Configuration Debug Analysis")
    print("=" * 70)
    
    # Run debug analysis
    debug_properties_panel_buttons()
    debug_blank_workspace_integration()
    debug_node_visual_updates()
    issues = identify_specific_issues()
    create_debug_report()
    
    print("\n" + "=" * 70)
    print("🎯 Debug Analysis Complete")
    
    if issues:
        print(f"❌ Found {len(issues)} issues that need fixing")
    else:
        print("✅ Code structure looks correct - issue may be runtime related")
    
    print("📋 Next: Check browser console for errors and test button functionality")