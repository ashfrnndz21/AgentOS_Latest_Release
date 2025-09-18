#!/usr/bin/env python3

"""
Quick verification script for Chat Interface Integration
"""

import os

def check_integration():
    print("🔍 CHECKING CHAT INTERFACE INTEGRATION:")
    
    # Check if all required files exist
    files_to_check = [
        'src/components/MultiAgentWorkspace/ChatConfigurationWizard.tsx',
        'src/lib/services/FlexibleChatService.ts',
        'src/components/MultiAgentWorkspace/nodes/ChatInterfaceNode.tsx',
        'src/components/MultiAgentWorkspace/FlexibleChatInterface.tsx',
        'src/components/MultiAgentWorkspace/AddChatInterfaceButton.tsx'
    ]
    
    all_exist = True
    for file_path in files_to_check:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - MISSING")
            all_exist = False
    
    # Check if integration points are in place
    print("\n🔧 CHECKING INTEGRATION POINTS:")
    
    # Check canvas integration
    canvas_file = 'src/components/MultiAgentWorkspace/StrandsWorkflowCanvas.tsx'
    if os.path.exists(canvas_file):
        with open(canvas_file, 'r') as f:
            canvas_content = f.read()
        
        has_import = 'AddChatInterfaceButton' in canvas_content
        has_component = '<AddChatInterfaceButton' in canvas_content
        has_event_listener = 'addChatInterfaceNode' in canvas_content
        
        print(f"   - AddChatInterfaceButton import: {'✅' if has_import else '❌'}")
        print(f"   - Button component in UI: {'✅' if has_component else '❌'}")
        print(f"   - Event listener setup: {'✅' if has_event_listener else '❌'}")
    
    # Check orchestrator integration
    orchestrator_file = 'src/lib/services/StrandsWorkflowOrchestrator.ts'
    if os.path.exists(orchestrator_file):
        with open(orchestrator_file, 'r') as f:
            orchestrator_content = f.read()
        
        has_chat_type = 'strands-chat-interface' in orchestrator_content
        has_create_method = 'createChatInterfaceNode' in orchestrator_content
        
        print(f"   - Chat interface node type: {'✅' if has_chat_type else '❌'}")
        print(f"   - Create method available: {'✅' if has_create_method else '❌'}")
    
    # Check utilities integration
    utilities_file = 'src/hooks/useStrandsUtilities.ts'
    if os.path.exists(utilities_file):
        with open(utilities_file, 'r') as f:
            utilities_content = f.read()
        
        has_chat_utility = 'chat-interface' in utilities_content
        
        print(f"   - Chat utility in palette: {'✅' if has_chat_utility else '❌'}")
    
    print(f"\n🎯 OVERALL STATUS: {'✅ READY TO USE' if all_exist else '❌ NEEDS ATTENTION'}")
    
    if all_exist:
        print("\n🚀 HOW TO ACCESS THE 4-STEP WIZARD:")
        print("1. Open Multi-Agent Workspace")
        print("2. Look for the '💬 Add Chat Interface' button in the top-right control panel")
        print("3. Click it to launch the 4-step configuration wizard")
        print("4. Choose from 3 chat types: Direct LLM, Independent Agent, or Palette Agent")
        print("5. Configure settings, UI preferences, and preview before creating")
    
    return all_exist

if __name__ == "__main__":
    check_integration()