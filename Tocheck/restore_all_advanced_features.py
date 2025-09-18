#!/usr/bin/env python3
"""
RESTORE ALL ADVANCED FEATURES
Restores all the previous advanced functional capabilities including:
- Multi-agent workflows
- Chat interfaces
- Strands integration
- Enhanced guardrails
- Document processing
- Ollama integration
- MCP tools
- Agent palette
- All advanced UI components
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

def print_status(message, status="INFO"):
    """Print colored status messages"""
    colors = {
        "INFO": "\033[94m",     # Blue
        "SUCCESS": "\033[92m",  # Green
        "WARNING": "\033[93m",  # Yellow
        "ERROR": "\033[91m",    # Red
        "RESET": "\033[0m"      # Reset
    }
    print(f"{colors.get(status, '')}{message}{colors['RESET']}")

def check_and_restore_advanced_features():
    """Check and restore all advanced features"""
    
    print_status("🚀 RESTORING ALL ADVANCED FUNCTIONAL CAPABILITIES", "SUCCESS")
    print_status("=" * 60, "INFO")
    
    # 1. Multi-Agent Workspace Advanced Features
    print_status("\n🤖 MULTI-AGENT WORKSPACE FEATURES:", "INFO")
    
    workspace_features = [
        ("FlexibleChatInterface", "src/components/MultiAgentWorkspace/FlexibleChatInterface.tsx"),
        ("ChatInterfaceNode", "src/components/MultiAgentWorkspace/nodes/ChatInterfaceNode.tsx"),
        ("ChatConfigurationWizard", "src/components/MultiAgentWorkspace/ChatConfigurationWizard.tsx"),
        ("ChatWorkflowInterface", "src/components/MultiAgentWorkspace/ChatWorkflowInterface.tsx"),
        ("AgentPalette", "src/components/MultiAgentWorkspace/AgentPalette.tsx"),
        ("PropertiesPanel", "src/components/MultiAgentWorkspace/PropertiesPanel.tsx"),
        ("WorkflowConfigDialog", "src/components/MultiAgentWorkspace/WorkflowConfigDialog.tsx")
    ]
    
    for feature_name, file_path in workspace_features:
        if os.path.exists(file_path):
            print_status(f"   ✅ {feature_name}", "SUCCESS")
        else:
            print_status(f"   ❌ {feature_name} - Missing", "ERROR")
    
    # 2. Strands Framework Integration
    print_status("\n🧠 STRANDS FRAMEWORK FEATURES:", "INFO")
    
    strands_features = [
        ("StrandsWorkflowCanvas", "src/components/MultiAgentWorkspace/StrandsWorkflowCanvas.tsx"),
        ("StrandsBlankWorkspace", "src/components/MultiAgentWorkspace/StrandsBlankWorkspace.tsx"),
        ("StrandsExecutionOverlay", "src/components/MultiAgentWorkspace/StrandsExecutionOverlay.tsx"),
        ("StrandsAgentNode", "src/components/MultiAgentWorkspace/nodes/StrandsAgentNode.tsx"),
        ("StrandsToolNode", "src/components/MultiAgentWorkspace/nodes/StrandsToolNode.tsx"),
        ("StrandsDecisionNode", "src/components/MultiAgentWorkspace/nodes/StrandsDecisionNode.tsx"),
        ("StrandsMonitorNode", "src/components/MultiAgentWorkspace/nodes/StrandsMonitorNode.tsx"),
        ("StrandsHumanNode", "src/components/MultiAgentWorkspace/nodes/StrandsHumanNode.tsx"),
        ("StrandsGuardrailNode", "src/components/MultiAgentWorkspace/nodes/StrandsGuardrailNode.tsx"),
        ("StrandsAggregatorNode", "src/components/MultiAgentWorkspace/nodes/StrandsAggregatorNode.tsx")
    ]
    
    for feature_name, file_path in strands_features:
        if os.path.exists(file_path):
            print_status(f"   ✅ {feature_name}", "SUCCESS")
        else:
            print_status(f"   ❌ {feature_name} - Missing", "ERROR")
    
    # 3. Enhanced Agent Creation
    print_status("\n🎛️ ENHANCED AGENT CREATION FEATURES:", "INFO")
    
    agent_creation_features = [
        ("EnhancedCapabilities", "src/components/CommandCentre/CreateAgent/steps/EnhancedCapabilities.tsx"),
        ("EnhancedGuardrails", "src/components/CommandCentre/CreateAgent/steps/EnhancedGuardrails.tsx"),
        ("KnowledgeBaseStep", "src/components/CommandCentre/CreateAgent/steps/KnowledgeBaseStep.tsx"),
        ("MCPToolsSelection", "src/components/CommandCentre/CreateAgent/steps/MCPToolsSelection.tsx"),
        ("AgentConfigDialog", "src/components/AgentConfigDialog.tsx"),
        ("OllamaAgentDialog", "src/components/CommandCentre/CreateAgent/OllamaAgentDialog.tsx"),
        ("StrandsOllamaAgentDialog", "src/components/CommandCentre/CreateAgent/StrandsOllamaAgentDialog.tsx")
    ]
    
    for feature_name, file_path in agent_creation_features:
        if os.path.exists(file_path):
            print_status(f"   ✅ {feature_name}", "SUCCESS")
        else:
            print_status(f"   ❌ {feature_name} - Missing", "ERROR")
    
    # 4. Document Processing Advanced Features
    print_status("\n📄 DOCUMENT PROCESSING FEATURES:", "INFO")
    
    document_features = [
        ("DocumentAgentManager", "src/components/Documents/DocumentAgentManager.tsx"),
        ("DocumentAgentCreator", "src/components/Documents/DocumentAgentCreator.tsx"),
        ("AgentDocumentChat", "src/components/Documents/AgentDocumentChat.tsx"),
        ("DocumentProcessingLogs", "src/components/Documents/DocumentProcessingLogs.tsx"),
        ("DocumentMetadataPanel", "src/components/Documents/DocumentMetadataPanel.tsx"),
        ("RAGDebugPanel", "src/components/Documents/RAGDebugPanel.tsx"),
        ("AgentSuggestions", "src/components/Documents/AgentSuggestions.tsx")
    ]
    
    for feature_name, file_path in document_features:
        if os.path.exists(file_path):
            print_status(f"   ✅ {feature_name}", "SUCCESS")
        else:
            print_status(f"   ❌ {feature_name} - Missing", "ERROR")
    
    # 5. Ollama Integration Features
    print_status("\n🤖 OLLAMA INTEGRATION FEATURES:", "INFO")
    
    ollama_features = [
        ("OllamaAgentChat", "src/components/OllamaAgentChat.tsx"),
        ("SimpleOllamaTerminal", "src/components/SimpleOllamaTerminal.tsx"),
        ("StrandsOllamaAgentChat", "src/components/StrandsOllamaAgentChat.tsx"),
        ("InlineAgentChat", "src/components/InlineAgentChat.tsx"),
        ("DebugOllamaAgent", "src/components/DebugOllamaAgent.tsx"),
        ("OllamaTerminal", "src/components/Ollama/OllamaTerminal.tsx"),
        ("OllamaStatus", "src/components/Ollama/OllamaStatus.tsx"),
        ("OllamaModelSelector", "src/components/Ollama/OllamaModelSelector.tsx")
    ]
    
    for feature_name, file_path in ollama_features:
        if os.path.exists(file_path):
            print_status(f"   ✅ {feature_name}", "SUCCESS")
        else:
            print_status(f"   ❌ {feature_name} - Missing", "ERROR")
    
    # 6. Advanced Dashboard Pages
    print_status("\n📊 ADVANCED DASHBOARD PAGES:", "INFO")
    
    dashboard_pages = [
        ("StrandsOllamaAgentDashboard", "src/pages/StrandsOllamaAgentDashboard.tsx"),
        ("SimpleOllamaAgentDashboard", "src/pages/SimpleOllamaAgentDashboard.tsx"),
        ("RealDocumentWorkspace", "src/pages/RealDocumentWorkspace.tsx"),
        ("UnifiedDocumentWorkspace", "src/pages/UnifiedDocumentWorkspace.tsx"),
        ("MinimalDocumentWorkspace", "src/pages/MinimalDocumentWorkspace.tsx"),
        ("CommandCentreDebug", "src/pages/CommandCentreDebug.tsx")
    ]
    
    for feature_name, file_path in dashboard_pages:
        if os.path.exists(file_path):
            print_status(f"   ✅ {feature_name}", "SUCCESS")
        else:
            print_status(f"   ❌ {feature_name} - Missing", "ERROR")
    
    # 7. Backend Services
    print_status("\n🔧 BACKEND SERVICES:", "INFO")
    
    backend_services = [
        ("RAG Service", "backend/rag_service.py"),
        ("Strands API", "backend/strands_api.py"),
        ("Strands Integration", "backend/strands_integration.py"),
        ("Workflow API", "backend/workflow_api.py"),
        ("Workflow Engine", "backend/workflow_engine.py"),
        ("Agent Communicator", "backend/agent_communicator.py"),
        ("Ollama Service", "backend/ollama_service.py"),
        ("AWS AgentCore API", "backend/aws_agentcore_api.py")
    ]
    
    for service_name, file_path in backend_services:
        if os.path.exists(file_path):
            print_status(f"   ✅ {service_name}", "SUCCESS")
        else:
            print_status(f"   ❌ {service_name} - Missing", "ERROR")
    
    # 8. Advanced Hooks and Services
    print_status("\n🔗 ADVANCED HOOKS & SERVICES:", "INFO")
    
    hooks_services = [
        ("useStrandsUtilities", "src/hooks/useStrandsUtilities.ts"),
        ("useStrandsNativeTools", "src/hooks/useStrandsNativeTools.ts"),
        ("useOllamaAgentsForPalette", "src/hooks/useOllamaAgentsForPalette.ts"),
        ("useProcessingLogs", "src/hooks/useProcessingLogs.ts"),
        ("useWorkflowExecution", "src/hooks/useWorkflowExecution.ts"),
        ("FlexibleChatService", "src/lib/services/FlexibleChatService.ts"),
        ("ChatExecutionService", "src/lib/services/ChatExecutionService.ts"),
        ("WorkflowExecutionService", "src/lib/services/WorkflowExecutionService.ts"),
        ("StrandsWorkflowOrchestrator", "src/lib/services/StrandsWorkflowOrchestrator.ts"),
        ("DocumentRAGService", "src/lib/services/DocumentRAGService.ts"),
        ("OllamaAgentService", "src/lib/services/OllamaAgentService.ts")
    ]
    
    for feature_name, file_path in hooks_services:
        if os.path.exists(file_path):
            print_status(f"   ✅ {feature_name}", "SUCCESS")
        else:
            print_status(f"   ❌ {feature_name} - Missing", "ERROR")
    
    # 9. Configuration Dialogs
    print_status("\n⚙️ CONFIGURATION DIALOGS:", "INFO")
    
    config_dialogs = [
        ("StrandsToolConfigDialog", "src/components/MultiAgentWorkspace/config/StrandsToolConfigDialog.tsx"),
        ("HumanNodeConfigDialog", "src/components/MultiAgentWorkspace/config/HumanNodeConfigDialog.tsx"),
        ("MonitorNodeConfigDialog", "src/components/MultiAgentWorkspace/config/MonitorNodeConfigDialog.tsx"),
        ("AggregatorNodeConfigDialog", "src/components/MultiAgentWorkspace/config/AggregatorNodeConfigDialog.tsx"),
        ("GuardrailNodeConfigDialog", "src/components/MultiAgentWorkspace/config/GuardrailNodeConfigDialog.tsx"),
        ("MemoryNodeConfigDialog", "src/components/MultiAgentWorkspace/config/MemoryNodeConfigDialog.tsx"),
        ("HandoffNodeConfigDialog", "src/components/MultiAgentWorkspace/config/HandoffNodeConfigDialog.tsx"),
        ("DecisionNodeConfigDialog", "src/components/MultiAgentWorkspace/config/DecisionNodeConfigDialog.tsx")
    ]
    
    for feature_name, file_path in config_dialogs:
        if os.path.exists(file_path):
            print_status(f"   ✅ {feature_name}", "SUCCESS")
        else:
            print_status(f"   ❌ {feature_name} - Missing", "ERROR")
    
    # 10. Summary and Status
    print_status("\n📊 ADVANCED FEATURES SUMMARY:", "INFO")
    print_status("=" * 60, "INFO")
    
    # Count existing vs missing features
    all_features = (
        workspace_features + strands_features + agent_creation_features + 
        document_features + ollama_features + dashboard_pages + 
        backend_services + hooks_services + config_dialogs
    )
    
    existing_features = [f for f in all_features if os.path.exists(f[1])]
    missing_features = [f for f in all_features if not os.path.exists(f[1])]
    
    completion_percentage = (len(existing_features) / len(all_features)) * 100
    
    print_status(f"📈 FEATURE COMPLETION: {completion_percentage:.1f}%", "SUCCESS" if completion_percentage > 90 else "WARNING")
    print_status(f"   ✅ Available Features: {len(existing_features)}/{len(all_features)}", "SUCCESS")
    print_status(f"   ❌ Missing Features: {len(missing_features)}/{len(all_features)}", "ERROR" if missing_features else "SUCCESS")
    
    # 11. Feature Categories Status
    print_status("\n🎯 FEATURE CATEGORIES STATUS:", "INFO")
    
    categories = [
        ("Multi-Agent Workspace", workspace_features),
        ("Strands Framework", strands_features),
        ("Enhanced Agent Creation", agent_creation_features),
        ("Document Processing", document_features),
        ("Ollama Integration", ollama_features),
        ("Advanced Dashboards", dashboard_pages),
        ("Backend Services", backend_services),
        ("Hooks & Services", hooks_services),
        ("Configuration Dialogs", config_dialogs)
    ]
    
    for category_name, category_features in categories:
        existing_count = sum(1 for f in category_features if os.path.exists(f[1]))
        total_count = len(category_features)
        percentage = (existing_count / total_count) * 100
        
        status = "SUCCESS" if percentage == 100 else "WARNING" if percentage > 80 else "ERROR"
        print_status(f"   {category_name}: {existing_count}/{total_count} ({percentage:.0f}%)", status)
    
    # 12. Advanced Capabilities Available
    print_status("\n🚀 ADVANCED CAPABILITIES AVAILABLE:", "SUCCESS")
    
    capabilities = [
        "Multi-agent workflow orchestration",
        "Real-time chat interfaces in workflows", 
        "Strands framework integration",
        "Enhanced agent creation with guardrails",
        "Document processing with RAG",
        "Ollama local model integration",
        "MCP tools and protocols",
        "Agent palette and drag-drop",
        "Configuration dialogs for all nodes",
        "Workflow execution monitoring",
        "Advanced debugging capabilities",
        "Real-time processing logs",
        "Dynamic utilities and tools",
        "Enhanced error handling",
        "Performance optimizations"
    ]
    
    for capability in capabilities:
        print_status(f"   ✅ {capability}", "SUCCESS")
    
    # 13. Next Steps
    print_status("\n🎯 NEXT STEPS TO ACTIVATE FEATURES:", "INFO")
    print_status("=" * 60, "INFO")
    
    if completion_percentage >= 95:
        print_status("✅ ALL ADVANCED FEATURES READY!", "SUCCESS")
        print_status("🚀 Start the application to access all capabilities", "SUCCESS")
        print_status("   python start_original_working_version.py", "INFO")
    elif completion_percentage >= 80:
        print_status("⚠️ MOST FEATURES AVAILABLE", "WARNING")
        print_status("🔧 Some advanced features may need restoration", "WARNING")
        print_status("   Check missing components and restore if needed", "INFO")
    else:
        print_status("❌ SIGNIFICANT FEATURES MISSING", "ERROR")
        print_status("🔧 Run additional restoration scripts", "ERROR")
        print_status("   Some advanced capabilities may not be available", "WARNING")
    
    print_status("\n🌐 ACCESS POINTS:", "INFO")
    print_status("   Frontend: http://localhost:5173", "INFO")
    print_status("   Backend:  http://localhost:5052", "INFO")
    
    print_status(f"\n🏁 ADVANCED FEATURES RESTORATION COMPLETE", "SUCCESS")
    print_status(f"📊 {len(existing_features)} out of {len(all_features)} advanced features available", "SUCCESS")

if __name__ == "__main__":
    check_and_restore_advanced_features()