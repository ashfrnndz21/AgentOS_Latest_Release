import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, MessageSquare, X, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { ModernWorkspaceHeader } from './ModernWorkspaceHeader';
import { StrandsAgentPaletteMinimal as StrandsAgentPalette } from './StrandsAgentPaletteMinimal';
import { EnhancedPropertiesPanel } from './PropertiesPanel';
import { BankingWorkflowToolbar } from './BankingWorkflowToolbar';
import StrandsWorkflowCanvas from './StrandsWorkflowCanvas';
// Temporarily removed service imports to isolate white screen issue
// import { strandsWorkflowOrchestrator, StrandsWorkflowNode, WorkflowExecution } from '@/lib/services/StrandsWorkflowOrchestrator';
// import { MCPTool } from '@/lib/services/MCPGatewayService';
// import { strandsSdkService, StrandsSdkAgent } from '@/lib/services/StrandsSdkService';
// Temporarily removed Ollama integration to isolate white screen issue
// import { PaletteAgent, useOllamaAgentsForPaletteFixed as useOllamaAgentsForPalette } from '@/hooks/useOllamaAgentsForPalette.fixed';
import { DecisionNodeConfigDialog } from './config/DecisionNodeConfigDialog';
import { HandoffNodeConfigDialog } from './config/HandoffNodeConfigDialog';
import { MemoryNodeConfigDialog } from './config/MemoryNodeConfigDialog';
import { GuardrailNodeConfigDialog } from './config/GuardrailNodeConfigDialog';
import { AggregatorNodeConfigDialog } from './config/AggregatorNodeConfigDialog';
import { MonitorNodeConfigDialog } from './config/MonitorNodeConfigDialog';
import { HumanNodeConfigDialog } from './config/HumanNodeConfigDialog';

export const StrandsBlankWorkspaceOriginal = () => {
  const [orchestrator] = useState(() => strandsWorkflowOrchestrator);
  const [workflowId] = useState(() => orchestrator.createWorkflow('New Strands Workflow', 'Intelligent multi-agent workflow powered by Strands'));
  const [selectedNode, setSelectedNode] = useState<StrandsWorkflowNode | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [configDialog, setConfigDialog] = useState<{ type: string; nodeId: string } | null>(null);
  const [canvasUpdateFunction, setCanvasUpdateFunction] = useState<((nodeId: string, newData: any) => void) | null>(null);

  // Strands SDK agents state
  const [strandsSdkAgents, setStrandsSdkAgents] = useState<StrandsSdkAgent[]>([]);

  // Load Strands SDK agents
  const loadStrandsSdkAgents = useCallback(async () => {
    try {
      const agents = await strandsSdkService.getStrandsSdkAgents();
      setStrandsSdkAgents(agents);
    } catch (error) {
      console.error('Failed to load Strands SDK agents:', error);
    }
  }, []);

  useEffect(() => {
    loadStrandsSdkAgents();
    const interval = setInterval(loadStrandsSdkAgents, 30000);
    return () => clearInterval(interval);
  }, [loadStrandsSdkAgents]);

  // Handle node selection
  const handleNodeSelect = useCallback((node: StrandsWorkflowNode | null) => {
    setSelectedNode(node);
    setShowProperties(!!node);
  }, []);

  // Handle workflow execution
  const handleRunWorkflow = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    try {
      const execution = await orchestrator.executeWorkflow(workflowId);
      setCurrentExecution(execution);
      setExecutionHistory(prev => [execution, ...prev]);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [orchestrator, workflowId, isRunning]);

  // Handle node configuration
  const handleNodeConfig = useCallback((nodeId: string, nodeType: string) => {
    setConfigDialog({ type: nodeType, nodeId });
  }, []);

  // Handle adding agents from palette
  const handleAddAgent = useCallback((agentType: string, agentData?: any) => {
    console.log('Adding agent:', agentType, agentData);
    // This would typically add the agent to the workflow
  }, []);

  // Handle adding utilities from palette
  const handleAddUtility = useCallback((nodeType: string, utilityData?: any) => {
    console.log('Adding utility:', nodeType, utilityData);
    // This would typically add the utility to the workflow
  }, []);

  // Handle MCP tool selection
  const handleSelectMCPTool = useCallback((tool: MCPTool) => {
    console.log('Selected MCP tool:', tool);
    // This would typically add the tool to the workflow
  }, []);

  // Handle Strands tool selection
  const handleSelectStrandsTool = useCallback((tool: any) => {
    console.log('Selected Strands tool:', tool);
    // This would typically add the tool to the workflow
  }, []);

  // Canvas update function
  const handleCanvasUpdate = useCallback((nodeId: string, newData: any) => {
    if (canvasUpdateFunction) {
      canvasUpdateFunction(nodeId, newData);
    }
  }, [canvasUpdateFunction]);

  // Render configuration dialog based on type
  const renderConfigDialog = () => {
    if (!configDialog) return null;

    const commonProps = {
      open: !!configDialog,
      onOpenChange: (open: boolean) => !open && setConfigDialog(null),
      nodeId: configDialog.nodeId,
    };

    switch (configDialog.type) {
      case 'decision':
        return <DecisionNodeConfigDialog {...commonProps} />;
      case 'handoff':
        return <HandoffNodeConfigDialog {...commonProps} />;
      case 'memory':
        return <MemoryNodeConfigDialog {...commonProps} />;
      case 'guardrail':
        return <GuardrailNodeConfigDialog {...commonProps} />;
      case 'aggregator':
        return <AggregatorNodeConfigDialog {...commonProps} />;
      case 'monitor':
        return <MonitorNodeConfigDialog {...commonProps} />;
      case 'human':
        return <HumanNodeConfigDialog {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <ModernWorkspaceHeader />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Agent Palette */}
        <StrandsAgentPalette
          onAddAgent={handleAddAgent}
          onAddUtility={handleAddUtility}
          onSelectMCPTool={handleSelectMCPTool}
          onSelectStrandsTool={handleSelectStrandsTool}
          externalStrandsSdkAgents={strandsSdkAgents}
          onLoadStrandsSdkAgents={loadStrandsSdkAgents}
        />

        {/* Center - Workflow Canvas */}
        <div className="flex-1 flex flex-col">
          <StrandsWorkflowCanvas
            orchestrator={orchestrator}
            workflowId={workflowId}
            onNodeSelect={handleNodeSelect}
            onCanvasReady={setCanvasUpdateFunction}
          />
        </div>

        {/* Right Sidebar - Properties Panel */}
        {showProperties && selectedNode && (
          <EnhancedPropertiesPanel
            node={selectedNode}
            onClose={() => setShowProperties(false)}
            onUpdate={handleCanvasUpdate}
          />
        )}
      </div>

      {/* Configuration Dialogs */}
      {renderConfigDialog()}
    </div>
  );
};
