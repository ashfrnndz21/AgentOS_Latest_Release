#!/usr/bin/env python3
"""
Test script to add enhanced debugging to identify runtime issues.
This will add comprehensive logging to track exactly what's happening.
"""

import json
import os
from pathlib import Path

def add_enhanced_debugging():
    """Add enhanced debugging to track runtime issues"""
    
    print("🔍 Adding Enhanced Debugging to Track Runtime Issues")
    print("=" * 60)
    
    # Add debugging to Properties Panel button clicks
    properties_panel_path = Path("src/components/MultiAgentWorkspace/PropertiesPanel.tsx")
    
    with open(properties_panel_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if we need to add more debugging
    if "🚀 BUTTON CLICKED:" not in content:
        print("📝 Adding enhanced debugging to Properties Panel...")
        
        # Add debugging to Edit Decision Logic button
        old_button = """      <Button 
        onClick={() => {
          const baseType = node.type.replace('strands-', '');
          console.log('🔧 Opening Decision configuration from Properties Panel', { nodeId: node.id, nodeType: node.type, baseType });
          onOpenConfiguration?.(node.id, baseType);
        }}"""
        
        new_button = """      <Button 
        onClick={() => {
          console.log('🚀 BUTTON CLICKED: Edit Decision Logic');
          console.log('📊 Button click data:', { 
            nodeId: node.id, 
            nodeType: node.type, 
            onOpenConfiguration: typeof onOpenConfiguration,
            localData: localData 
          });
          
          const baseType = node.type.replace('strands-', '');
          console.log('🔧 Opening Decision configuration from Properties Panel', { nodeId: node.id, nodeType: node.type, baseType });
          
          if (onOpenConfiguration) {
            console.log('✅ Calling onOpenConfiguration...');
            onOpenConfiguration(node.id, baseType);
          } else {
            console.error('❌ onOpenConfiguration is not available!');
          }
        }}"""
        
        if old_button in content:
            content = content.replace(old_button, new_button)
            print("  ✅ Added debugging to Edit Decision Logic button")
        
        # Add debugging to Save Changes button
        old_save = """          <Button 
            onClick={() => {
              // Update node data in the workflow
              onUpdateNode(node.id, localData);
              
              // Save to persistent storage
              const baseType = node.type.replace('strands-', '');
              saveNodeConfiguration(node.id, baseType, localData, node.position);
              
              console.log('💾 Configuration saved to localStorage', { nodeId: node.id, nodeType: node.type, config: localData });
            }}"""
        
        new_save = """          <Button 
            onClick={() => {
              console.log('🚀 BUTTON CLICKED: Save Changes');
              console.log('📊 Save button data:', { 
                nodeId: node.id, 
                nodeType: node.type, 
                localData: localData,
                onUpdateNode: typeof onUpdateNode,
                saveNodeConfiguration: typeof saveNodeConfiguration
              });
              
              // Update node data in the workflow
              console.log('🔄 Calling onUpdateNode...');
              onUpdateNode(node.id, localData);
              
              // Save to persistent storage
              const baseType = node.type.replace('strands-', '');
              console.log('💾 Calling saveNodeConfiguration...');
              saveNodeConfiguration(node.id, baseType, localData, node.position);
              
              console.log('✅ Configuration saved to localStorage', { nodeId: node.id, nodeType: node.type, config: localData });
            }}"""
        
        if old_save in content:
            content = content.replace(old_save, new_save)
            print("  ✅ Added debugging to Save Changes button")
        
        # Add debugging to updateLocalData
        old_update = """  const updateLocalData = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    
    // Update the node in the workflow immediately
    onUpdateNode(node.id, newData);
    
    // Also save to persistent storage for immediate persistence
    const baseType = node.type.replace('strands-', '');
    saveNodeConfiguration(node.id, baseType, newData, node.position);
    
    console.log('🔄 Updated node data:', { nodeId: node.id, field, value, newData });
  };"""
        
        new_update = """  const updateLocalData = (field: string, value: any) => {
    console.log('🚀 UPDATE LOCAL DATA CALLED:', { field, value, nodeId: node.id });
    
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    
    // Update the node in the workflow immediately
    console.log('🔄 Calling onUpdateNode from updateLocalData...');
    onUpdateNode(node.id, newData);
    
    // Also save to persistent storage for immediate persistence
    const baseType = node.type.replace('strands-', '');
    console.log('💾 Calling saveNodeConfiguration from updateLocalData...');
    saveNodeConfiguration(node.id, baseType, newData, node.position);
    
    console.log('✅ Updated node data:', { nodeId: node.id, field, value, newData });
  };"""
        
        if old_update in content:
            content = content.replace(old_update, new_update)
            print("  ✅ Added debugging to updateLocalData function")
        
        # Write the updated content
        with open(properties_panel_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ Enhanced debugging added to Properties Panel")
    else:
        print("✅ Enhanced debugging already present")

def add_blank_workspace_debugging():
    """Add debugging to BlankWorkspace handlers"""
    
    print("\n🔗 Adding Debugging to BlankWorkspace Handlers")
    print("=" * 60)
    
    blank_workspace_path = Path("src/components/MultiAgentWorkspace/BlankWorkspace.tsx")
    
    with open(blank_workspace_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add debugging to handleOpenConfiguration
    if "🚀 HANDLE OPEN CONFIG CALLED:" not in content:
        old_handler = """  const handleOpenConfiguration = useCallback((nodeId: string, nodeType: string) => {
    console.log('🔧 Opening configuration from Properties Panel:', { nodeId, nodeType });
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    if (nodeType === 'decision' || nodeType === 'handoff') {
      setConfigNodeId(nodeId);
      setConfigNodePosition(node.position);
      setConfigDialogType(nodeType as 'decision' | 'handoff');
      setConfigDialogOpen(true);
      console.log('✅ Configuration dialog opened for:', nodeType);
    } else if (['aggregator', 'monitor', 'human'].includes(nodeType)) {
      // For other utility nodes, show the old config dialog for now
      console.log('🔧 Opening old config dialog for:', nodeType);
      setConfigNodeType(nodeType);
      setShowConfigDialog(true);
    }
  }, [nodes]);"""
        
        new_handler = """  const handleOpenConfiguration = useCallback((nodeId: string, nodeType: string) => {
    console.log('🚀 HANDLE OPEN CONFIG CALLED:', { nodeId, nodeType });
    console.log('📊 Current state:', { 
      configDialogOpen, 
      configDialogType, 
      nodesCount: nodes.length,
      selectedNodeId: nodeId 
    });
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      console.error('❌ Node not found:', nodeId);
      return;
    }
    
    console.log('✅ Node found:', node);
    
    if (nodeType === 'decision' || nodeType === 'handoff') {
      console.log('🎯 Opening configuration dialog for:', nodeType);
      setConfigNodeId(nodeId);
      setConfigNodePosition(node.position);
      setConfigDialogType(nodeType as 'decision' | 'handoff');
      setConfigDialogOpen(true);
      console.log('✅ Configuration dialog state set:', { 
        configNodeId: nodeId, 
        configDialogType: nodeType, 
        configDialogOpen: true 
      });
    } else if (['aggregator', 'monitor', 'human'].includes(nodeType)) {
      // For other utility nodes, show the old config dialog for now
      console.log('🔧 Opening old config dialog for:', nodeType);
      setConfigNodeType(nodeType);
      setShowConfigDialog(true);
    }
  }, [nodes, configDialogOpen, configDialogType]);"""
        
        if old_handler in content:
            content = content.replace(old_handler, new_handler)
            print("  ✅ Added debugging to handleOpenConfiguration")
        
        # Write the updated content
        with open(blank_workspace_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ Enhanced debugging added to BlankWorkspace")
    else:
        print("✅ Enhanced debugging already present")

def create_debugging_guide():
    """Create a guide for debugging the runtime issues"""
    
    guide = {
        "title": "Runtime Debugging Guide for Configuration Issues",
        "debugging_steps": [
            "1. Open browser Developer Tools (F12)",
            "2. Go to Console tab",
            "3. Click on a Decision node to select it",
            "4. Try changing the Node Name in Properties Panel",
            "5. Click 'Save Changes' button",
            "6. Click 'Edit Decision Logic' button",
            "7. Check console for debug messages"
        ],
        "expected_console_messages": [
            "🚀 UPDATE LOCAL DATA CALLED: when changing node name",
            "🚀 BUTTON CLICKED: Save Changes when clicking save",
            "🚀 BUTTON CLICKED: Edit Decision Logic when clicking edit",
            "🚀 HANDLE OPEN CONFIG CALLED: when opening configuration",
            "✅ Configuration dialog state set: when dialog should open"
        ],
        "troubleshooting": [
            "If no console messages appear: JavaScript errors are preventing execution",
            "If UPDATE LOCAL DATA not called: Input change events not firing",
            "If BUTTON CLICKED not appearing: Button click events not firing",
            "If HANDLE OPEN CONFIG not called: onOpenConfiguration prop not passed",
            "If dialog state set but dialog doesn't open: Dialog rendering issue"
        ],
        "common_fixes": [
            "Check for JavaScript errors in console",
            "Verify React components are properly mounted",
            "Check if props are being passed correctly",
            "Verify event handlers are attached",
            "Check if state updates are triggering re-renders"
        ]
    }
    
    with open("RUNTIME-DEBUGGING-GUIDE.md", 'w') as f:
        f.write("# Runtime Debugging Guide for Configuration Issues\n\n")
        f.write("## Debugging Steps\n")
        for step in guide["debugging_steps"]:
            f.write(f"{step}\n")
        
        f.write("\n## Expected Console Messages\n")
        for message in guide["expected_console_messages"]:
            f.write(f"- {message}\n")
        
        f.write("\n## Troubleshooting\n")
        for issue in guide["troubleshooting"]:
            f.write(f"- {issue}\n")
        
        f.write("\n## Common Fixes\n")
        for fix in guide["common_fixes"]:
            f.write(f"- {fix}\n")
        
        f.write("\n## What Each Button Should Do\n\n")
        f.write("### Edit Decision Logic Button\n")
        f.write("- Opens a detailed configuration dialog\n")
        f.write("- Allows setting up conditions and decision rules\n")
        f.write("- Should show console message: 🚀 BUTTON CLICKED: Edit Decision Logic\n\n")
        
        f.write("### Save Changes Button\n")
        f.write("- Saves all Properties Panel changes to localStorage\n")
        f.write("- Updates the node on the canvas immediately\n")
        f.write("- Should show console message: 🚀 BUTTON CLICKED: Save Changes\n\n")
        
        f.write("### Node Name Field\n")
        f.write("- Should update the node name on canvas in real-time\n")
        f.write("- Should show console message: 🚀 UPDATE LOCAL DATA CALLED\n")
        f.write("- Changes should persist after page refresh\n")
    
    print(f"\n📄 Created debugging guide: RUNTIME-DEBUGGING-GUIDE.md")

if __name__ == "__main__":
    print("🚀 Starting Runtime Debugging Enhancement")
    print("=" * 70)
    
    # Add enhanced debugging
    add_enhanced_debugging()
    add_blank_workspace_debugging()
    create_debugging_guide()
    
    print("\n" + "=" * 70)
    print("✅ Enhanced debugging added successfully!")
    print("\n🎯 Next Steps:")
    print("1. Refresh your browser page")
    print("2. Open Developer Tools (F12) → Console tab")
    print("3. Try clicking the buttons and changing values")
    print("4. Check console for debug messages")
    print("5. Report what messages you see (or don't see)")
    
    print("\n📋 This will help identify exactly where the issue is occurring!")