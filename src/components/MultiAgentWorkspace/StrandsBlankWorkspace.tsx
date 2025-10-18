import React, { useState, useCallback, useMemo } from 'react';
import { Plus } from 'lucide-react';

import { ModernWorkspaceHeader } from './ModernWorkspaceHeader';
import { StrandsAgentPalette } from './StrandsAgentPalette';
import { EnhancedPropertiesPanel } from './PropertiesPanel';
import { BankingWorkflowToolbar } from './BankingWorkflowToolbar';
import StrandsWorkflowCanvas from './StrandsWorkflowCanvas';
import { StrandsWorkflowOrchestrator, StrandsWorkflowNode, WorkflowExecution } from '@/lib/services/StrandsWorkflowOrchestrator';
import { MCPTool } from '@/lib/services/MCPGatewayService';
// Temporarily removed Ollama integration to isolate white screen issue
// import { PaletteAgent, useOllamaAgentsForPaletteFixed as useOllamaAgentsForPalette } from '@/hooks/useOllamaAgentsForPalette.fixed';
import { DecisionNodeConfigDialog } from './config/DecisionNodeConfigDialog';
import { HandoffNodeConfigDialog } from './config/HandoffNodeConfigDialog';
import { MemoryNodeConfigDialog } from './config/MemoryNodeConfigDialog';
import { GuardrailNodeConfigDialog } from './config/GuardrailNodeConfigDialog';
import { AggregatorNodeConfigDialog } from './config/AggregatorNodeConfigDialog';
import { MonitorNodeConfigDialog } from './config/MonitorNodeConfigDialog';
import { HumanNodeConfigDialog } from './config/HumanNodeConfigDialog';

export const StrandsBlankWorkspace = () => {
  const [orchestrator] = useState(() => new StrandsWorkflowOrchestrator());
  const [workflowId] = useState(() => orchestrator.createWorkflow('New Strands Workflow', 'Intelligent multi-agent workflow powered by Strands'));
  const [selectedNode, setSelectedNode] = useState<StrandsWorkflowNode | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [configDialog, setConfigDialog] = useState<{ type: string; nodeId: string } | null>(null);
  const [canvasUpdateFunction, setCanvasUpdateFunction] = useState<((nodeId: string, newData: any) => void) | null>(null);
  
  // Temporarily disabled Ollama integration
  const paletteAgents: any[] = [];
  const agentsLoading = false;
  
  // Transform palette agents for configuration dialogs
  const availableAgents = useMemo(() => {
    if (agentsLoading || !paletteAgents.length) {
      // Fallback agents when palette agents are loading or empty
      return [
        { id: 'agent-1', name: 'Customer Service Agent', expertise: ['customer_support', 'billing'] },
        { id: 'agent-2', name: 'Technical Support Agent', expertise: ['technical_issues', 'troubleshooting'] },
        { id: 'agent-3', name: 'Sales Agent', expertise: ['sales', 'product_info'] },
        { id: 'agent-4', name: 'Escalation Agent', expertise: ['complex_issues', 'management'] },
        { id: 'agent-5', name: 'Billing Specialist', expertise: ['billing', 'payments', 'refunds'] }
      ];
    }
    
    // Transform palette agents to configuration format
    return paletteAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      expertise: agent.capabilities || []
    }));
  }, [paletteAgents, agentsLoading]);
  const [workflowMetrics] = useState({
    complianceScore: 100,
    riskLevel: 'Low',
    auditReadiness: 100,
    performanceScore: 100,
    validationErrors: [] as string[],
  });

  const handleNodeSelect = useCallback((node: StrandsWorkflowNode | null) => {
    setSelectedNode(node);
    setShowProperties(!!node);
  }, []);

  const handleExecutionStart = useCallback((execution: WorkflowExecution) => {
    setCurrentExecution(execution);
    setIsRunning(true);
    console.log('Strands workflow execution started:', execution);
  }, []);

  const handleExecutionComplete = useCallback((execution: WorkflowExecution) => {
    setExecutionHistory(prev => [...prev, execution]);
    setIsRunning(false);
    console.log('Strands workflow execution completed:', execution);
  }, []);

  // Legacy support for existing agent palette
  const addAgent = useCallback((agentType: string, agentData?: any) => {
    console.log('Legacy addAgent called - will be handled by drag and drop:', agentType, agentData);
  }, []);

  const addUtility = useCallback((nodeType: string, utilityData?: any) => {
    console.log('Legacy addUtility called - will be handled by drag and drop:', nodeType, utilityData);
  }, []);

  const handleSelectMCPTool = useCallback((tool: MCPTool) => {
    console.log('MCP Tool selected:', tool);
    // Could auto-add to canvas or show in a dialog
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    console.log('🔄 StrandsBlankWorkspace: Updating node data:', nodeId, newData);
    
    // Update the selected node immediately for UI responsiveness
    if (selectedNode && selectedNode.id === nodeId) {
      const updatedNode = { ...selectedNode, data: { ...selectedNode.data, ...newData } };
      setSelectedNode(updatedNode);
      console.log('✅ Updated selected node:', updatedNode);
    }
    
    // Also update the canvas nodes if we have the update function
    if (canvasUpdateFunction) {
      canvasUpdateFunction(nodeId, newData);
      console.log('✅ Updated canvas node via canvas update function');
    }
  }, [selectedNode, canvasUpdateFunction]);

  const handleOpenConfiguration = useCallback((nodeId: string, nodeType: string) => {
    console.log('🔧 Opening configuration dialog:', { nodeId, nodeType });
    setConfigDialog({ type: nodeType, nodeId });
  }, []);

  const runWorkflow = useCallback(async () => {
    if (isRunning) return;
    
    try {
      setIsRunning(true);
      const workflow = orchestrator.getWorkflow(workflowId);
      
      if (!workflow || workflow.nodes.length === 0) {
        console.warn('No workflow to execute');
        setIsRunning(false);
        return;
      }

      const execution = await orchestrator.executeWorkflow(workflowId, {
        message: 'Starting Strands workflow execution',
        timestamp: new Date().toISOString()
      });

      handleExecutionStart(execution);
      
      // The execution will complete automatically through the orchestrator
      setTimeout(() => {
        handleExecutionComplete(execution);
      }, 5000); // Simulate execution time

    } catch (error) {
      console.error('Workflow execution failed:', error);
      setIsRunning(false);
    }
  }, [workflowId, orchestrator, isRunning, handleExecutionStart, handleExecutionComplete]);

  const stopWorkflow = useCallback(() => {
    setIsRunning(false);
    setCurrentExecution(null);
  }, []);

  // Track canvas nodes for empty state
  const [canvasNodeCount, setCanvasNodeCount] = useState(0);
  const [canvasConnectionCount, setCanvasConnectionCount] = useState(0);
  
  // Get current workflow stats (for metrics)
  const workflow = orchestrator.getWorkflow(workflowId);
  const nodeCount = canvasNodeCount; // Use canvas count for UI
  const connectionCount = canvasConnectionCount; // Use canvas count for UI

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-slate-100 overflow-hidden">
      <ModernWorkspaceHeader />
      
      <div className="flex-1 flex w-full h-full overflow-hidden">
        {/* Enhanced Agent Palette with Strands Integration */}
        <StrandsAgentPalette 
          onAddAgent={addAgent}
          onAddUtility={addUtility}
          onSelectMCPTool={handleSelectMCPTool}
          onSelectStrandsTool={(tool) => {
            console.log('Strands tool selected:', tool);
            // Handle Strands tool selection - could add to canvas or show configuration
          }}
        />
        
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {/* Enhanced Toolbar with Strands Features */}
          <BankingWorkflowToolbar 
            isRunning={isRunning}
            onRun={runWorkflow}
            onStop={stopWorkflow}
            onExport={() => {
              const workflowData = {
                workflow: orchestrator.getWorkflow(workflowId),
                executions: executionHistory,
                metadata: {
                  created: new Date().toISOString(),
                  version: '1.0.0',
                  type: 'strands-workflow'
                }
              };
              console.log('Export workflow:', workflowData);
            }}
            nodeCount={nodeCount}
            connectionCount={connectionCount}
            metrics={workflowMetrics}
            onShowCompliance={() => {}}
            onShowRiskAssessment={() => {}}
          />
          
          {/* Strands Workflow Canvas */}
          <StrandsWorkflowCanvas
            orchestrator={orchestrator}
            workflowId={workflowId}
            onNodeSelect={handleNodeSelect}
            onExecutionStart={handleExecutionStart}
            onExecutionComplete={handleExecutionComplete}
            onUpdateNode={updateNodeData}
            onCanvasReady={(updateFn) => setCanvasUpdateFunction(() => updateFn)}
            onNodesChange={(nodeCount, edgeCount) => {
              setCanvasNodeCount(nodeCount);
              setCanvasConnectionCount(edgeCount);
            }}
            className="h-full"
          />
          
          {/* Empty State Message */}
          {nodeCount === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-slate-800/40 rounded-full flex items-center justify-center border-2 border-dashed border-slate-600">
                  <Plus className="w-12 h-12 text-slate-500" />
                </div>
                <h3 className="text-xl font-medium text-slate-300 mb-2">Start Building Your Strands Workflow</h3>
                <p className="text-slate-500 max-w-md">
                  Drag agents from the palette to create your intelligent multi-agent workflow. 
                  Strands will provide reasoning, tool integration, and smart handoffs.
                </p>
                <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Strands Reasoning</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Smart Connections</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Tool Integration</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Properties Panel for Strands Nodes */}
        {showProperties && selectedNode && (
          <EnhancedPropertiesPanel
            node={selectedNode}
            onUpdateNode={updateNodeData}
            onClose={() => setShowProperties(false)}
            onOpenConfiguration={handleOpenConfiguration}
            orchestrator={orchestrator}
          />
        )}

        {/* Configuration Dialogs */}
        {configDialog && configDialog.type === 'decision' && (
          <DecisionNodeConfigDialog
            isOpen={true}
            onClose={() => setConfigDialog(null)}
            onSave={(config) => {
              console.log('💾 Saving decision configuration:', config);
              updateNodeData(configDialog.nodeId, { 
                config, 
                isConfigured: true,
                label: config.name 
              });
              setConfigDialog(null);
            }}
            initialConfig={selectedNode?.data?.config}
            availableAgents={availableAgents}
          />
        )}

        {configDialog && configDialog.type === 'handoff' && (
          <HandoffNodeConfigDialog
            isOpen={true}
            onClose={() => setConfigDialog(null)}
            onSave={(config) => {
              console.log('💾 Saving handoff configuration:', config);
              updateNodeData(configDialog.nodeId, { 
                config, 
                isConfigured: true,
                label: config.name 
              });
              setConfigDialog(null);
            }}
            initialConfig={selectedNode?.data?.config}
            availableAgents={availableAgents}
          />
        )}

        {configDialog && configDialog.type === 'memory' && (
          <MemoryNodeConfigDialog
            isOpen={true}
            onClose={() => setConfigDialog(null)}
            onSave={(config) => {
              console.log('💾 Saving memory configuration:', config);
              updateNodeData(configDialog.nodeId, { 
                config, 
                isConfigured: true,
                label: config.name 
              });
              setConfigDialog(null);
            }}
            initialConfig={selectedNode?.data?.config}
          />
        )}

        {configDialog && configDialog.type === 'guardrail' && (
          <GuardrailNodeConfigDialog
            isOpen={true}
            onClose={() => setConfigDialog(null)}
            onSave={(config) => {
              console.log('💾 Saving guardrail configuration:', config);
              updateNodeData(configDialog.nodeId, { 
                config, 
                isConfigured: true,
                label: config.name 
              });
              setConfigDialog(null);
            }}
            initialConfig={selectedNode?.data?.config}
          />
        )}

        {configDialog && configDialog.type === 'aggregator' && (
          <AggregatorNodeConfigDialog
            isOpen={true}
            onClose={() => setConfigDialog(null)}
            onSave={(config) => {
              console.log('💾 Saving aggregator configuration:', config);
              updateNodeData(configDialog.nodeId, { 
                config, 
                isConfigured: true,
                label: config.name 
              });
              setConfigDialog(null);
            }}
            initialConfig={selectedNode?.data?.config}
          />
        )}

        {configDialog && configDialog.type === 'monitor' && (
          <MonitorNodeConfigDialog
            isOpen={true}
            onClose={() => setConfigDialog(null)}
            onSave={(config) => {
              console.log('💾 Saving monitor configuration:', config);
              updateNodeData(configDialog.nodeId, { 
                config, 
                isConfigured: true,
                label: config.name 
              });
              setConfigDialog(null);
            }}
            initialConfig={selectedNode?.data?.config}
          />
        )}

        {configDialog && configDialog.type === 'human' && (
          <HumanNodeConfigDialog
            isOpen={true}
            onClose={() => setConfigDialog(null)}
            onSave={(config) => {
              console.log('💾 Saving human configuration:', config);
              updateNodeData(configDialog.nodeId, { 
                config, 
                isConfigured: true,
                label: config.name 
              });
              setConfigDialog(null);
            }}
            initialConfig={selectedNode?.data?.config}
          />
        )}
      </div>
    </div>
  );
};