import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus } from 'lucide-react';

import { ModernWorkspaceHeader } from './ModernWorkspaceHeader';
import { AgentPalette } from './AgentPalette';
import { EnhancedPropertiesPanel } from './PropertiesPanel';
import { BankingWorkflowToolbar } from './BankingWorkflowToolbar';
import { DecisionNodeConfigDialog } from './config/DecisionNodeConfigDialog';
import { HandoffNodeConfigDialog } from './config/HandoffNodeConfigDialog';
import { useUtilityConfiguration } from '@/hooks/useUtilityConfiguration';
import { ModernAgentNode } from './nodes/ModernAgentNode';
import { ModernDecisionNode } from './nodes/ModernDecisionNode';
import { ModernMemoryNode } from './nodes/ModernMemoryNode';
import { ModernGuardrailNode } from './nodes/ModernGuardrailNode';
import { ModernHandoffNode } from './nodes/ModernHandoffNode';
import { ModernAggregatorNode } from './nodes/ModernAggregatorNode';
import { ModernMonitorNode } from './nodes/ModernMonitorNode';
import { ModernHumanNode } from './nodes/ModernHumanNode';
import { ModernMCPToolNode } from './nodes/ModernMCPToolNode';
import { WorkflowConfigDialog } from './WorkflowConfigDialog';
import { EnhancedConnectionEdge } from './edges/EnhancedConnectionEdge';
import { MCPTool } from '@/lib/services/MCPGatewayService';
import { PaletteAgent } from '@/hooks/useOllamaAgentsForPalette';

const nodeTypes: any = {
  agent: ModernAgentNode,
  decision: ModernDecisionNode,
  memory: ModernMemoryNode,
  guardrail: ModernGuardrailNode,
  handoff: ModernHandoffNode,
  aggregator: ModernAggregatorNode,
  monitor: ModernMonitorNode,
  human: ModernHumanNode,
  'mcp-tool': ModernMCPToolNode,
};

const edgeTypes: any = {
  enhanced: EnhancedConnectionEdge,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const BlankWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [, setSelectedMCPTool] = useState<MCPTool | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [configNodeType, setConfigNodeType] = useState('');
  
  // Configuration state
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configDialogType, setConfigDialogType] = useState<'decision' | 'handoff' | null>(null);
  const [configNodeId, setConfigNodeId] = useState<string>('');
  const [configNodePosition, setConfigNodePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Configuration hook
  const { saveNodeConfiguration } = useUtilityConfiguration();
  const [workflowMetrics] = useState({
    complianceScore: 100,
    riskLevel: 'Low',
    auditReadiness: 100,
    performanceScore: 100,
    validationErrors: [] as string[],
  });

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'enhanced',
        animated: true,
        data: {
          type: 'data',
          label: 'Data Flow',
          status: 'idle',
        }
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    console.log('🖱️ Node clicked:', node.type, node.id);
    setSelectedNode(node);
    setShowProperties(true);
    
    // Only show Properties Panel, configuration dialogs will be opened from Properties Panel buttons
    console.log('📋 Properties Panel opened for:', node.type);
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  const handleOpenConfiguration = useCallback((nodeId: string, nodeType: string) => {
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
  }, [nodes, configDialogOpen, configDialogType]);

  const addAgent = useCallback((agentType: string, agentData?: PaletteAgent) => {
    // Handle Ollama agents vs legacy agent types
    if (agentType === 'ollama-agent' && agentData) {
      // Create node from real Ollama agent
      const newNode: Node = {
        id: `ollama-${agentData.id}-${Date.now()}`,
        type: 'agent',
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: { 
          label: agentData.name,
          agentType: 'ollama-agent',
          ollamaAgentId: agentData.id,
          ollamaAgent: agentData.originalAgent,
          model: agentData.model,
          role: agentData.role,
          capabilities: agentData.capabilities,
          tools: [],
          mcpTools: [],
          guardrails: agentData.guardrails ? ['PII Protection', 'Content Filter'] : [],
          memory: true,
          reasoning: 'chain-of-thought',
          status: 'idle',
          icon: agentData.icon,
          description: agentData.description
        },
      };
      setNodes((nds) => nds.concat(newNode));
    } else {
      // Legacy agent types (fallback for any remaining static agents)
      const newNode: Node = {
        id: `${agentType.toLowerCase().replace(' ', '-')}-${Date.now()}`,
        type: 'agent',
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: { 
          label: agentType,
          agentType,
          model: 'gpt-4',
          tools: [],
          mcpTools: [],
          guardrails: [],
          memory: true,
          reasoning: 'chain-of-thought',
          status: 'idle'
        },
      };
      setNodes((nds) => nds.concat(newNode));
    }
  }, [setNodes]);

  const handleMCPToolSelect = useCallback((tool: MCPTool) => {
    setSelectedMCPTool(tool);
    // If there's a selected agent node, add the tool to it
    if (selectedNode && selectedNode.type === 'agent') {
      const currentMCPTools = (selectedNode.data.mcpTools as MCPTool[]) || [];
      const toolExists = currentMCPTools.some(t => t.id === tool.id && t.serverId === tool.serverId);
      
      if (!toolExists) {
        const updatedMCPTools = [...currentMCPTools, tool];
        updateNodeData(selectedNode.id, { mcpTools: updatedMCPTools });
      }
    }
  }, [selectedNode, updateNodeData]);

  const addUtilityNode = useCallback((nodeType: string, utilityData?: any) => {
    const position = { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 };
    const nodeId = `${nodeType}-${Date.now()}`;
    
    // If the utility needs configuration, open the config dialog
    if (utilityData?.needsConfiguration && (nodeType === 'decision' || nodeType === 'handoff')) {
      setConfigNodeId(nodeId);
      setConfigNodePosition(position);
      setConfigDialogType(nodeType as 'decision' | 'handoff');
      setConfigDialogOpen(true);
      return;
    }
    
    // Otherwise, create the node directly
    const newNode: Node = {
      id: nodeId,
      type: nodeType,
      position,
      data: { 
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        config: utilityData?.criteria ? {
          criteria: utilityData.criteria,
          ...getDefaultConfig(nodeType)
        } : getDefaultConfig(nodeType),
        criteria: utilityData?.criteria || [],
        description: utilityData?.description || getDefaultDescription(nodeType),
        color: utilityData?.color || 'text-gray-400',
        status: 'idle',
        isConfigured: false
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const getDefaultConfig = (nodeType: string) => {
    switch (nodeType) {
      case 'handoff':
        return {
          strategy: 'automatic',
          confidenceThreshold: 0.8,
          contextPreservation: 'full'
        };
      case 'decision':
        return {
          evaluationMode: 'weighted',
          conditions: []
        };
      case 'aggregator':
        return {
          method: 'consensus',
          minimumResponses: 2,
          conflictResolution: 'escalate'
        };
      case 'human':
        return {
          interruptMessage: 'Ready for user input',
          inputType: 'text',
          allowedAgents: []
        };
      default:
        return {};
    }
  };

  const getDefaultDescription = (nodeType: string) => {
    switch (nodeType) {
      case 'handoff': return 'Smart agent handoff with context transfer';
      case 'decision': return 'Decision point with intelligent routing';
      case 'aggregator': return 'Multi-agent response aggregation';
      case 'monitor': return 'Performance and behavior monitoring';
      case 'human': return 'Human-in-the-loop input collection';
      default: return 'Workflow component';
    }
  };

  const handleConfigSave = useCallback((config: any) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { config });
    }
    setShowConfigDialog(false);
  }, [selectedNode, updateNodeData]);

  // Configuration dialog handlers
  const handleUtilityConfigSave = useCallback((config: any) => {
    console.log('💾 Saving utility configuration:', { configNodeId, configDialogType, config });
    
    // Update the existing node instead of creating a new one
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === configNodeId) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              label: config.name || (configDialogType!.charAt(0).toUpperCase() + configDialogType!.slice(1)),
              config,
              description: config.description || getDefaultDescription(configDialogType!),
              color: configDialogType === 'decision' ? 'text-yellow-400' : 'text-blue-400',
              status: 'configured',
              isConfigured: true
            }
          };
          console.log('🔄 Updated node:', updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
    
    // Save configuration to persistent storage
    saveNodeConfiguration(configNodeId, configDialogType!, config, configNodePosition);
    
    // Close dialog
    setConfigDialogOpen(false);
    setConfigDialogType(null);
    setConfigNodeId('');
    
    console.log('✅ Configuration saved and dialog closed');
  }, [configNodeId, configDialogType, configNodePosition, saveNodeConfiguration]);

  const handleUtilityConfigCancel = useCallback(() => {
    setConfigDialogOpen(false);
    setConfigDialogType(null);
    setConfigNodeId('');
  }, []);

  // Get available agents for configuration dialogs
  const availableAgents = nodes
    .filter(node => node.type === 'ollama-agent' || node.type === 'agent')
    .map(node => ({
      id: node.id,
      name: String(node.data?.label || node.data?.name || 'Unnamed Agent')
    }));

  const runWorkflow = useCallback(() => {
    setIsRunning(true);
    
    // Simulate workflow execution
    setEdges(edges => edges.map(edge => ({
      ...edge,
      animated: true,
      data: { ...edge.data, status: 'active' }
    })));

    setTimeout(() => {
      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: { ...edge.data, status: 'success' }
      })));
      setIsRunning(false);
    }, 3000);
  }, [setEdges]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-slate-100 overflow-hidden">
      <ModernWorkspaceHeader />
      
      <div className="flex-1 flex w-full h-full overflow-hidden">
        {/* Agent Palette */}
        <AgentPalette 
          onAddAgent={addAgent}
          onAddUtility={addUtilityNode}
          onSelectMCPTool={handleMCPToolSelect}
        />
        
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <BankingWorkflowToolbar 
            isRunning={isRunning}
            onRun={runWorkflow}
            onStop={() => setIsRunning(false)}
            onExport={() => {}}
            nodeCount={nodes.length}
            connectionCount={edges.length}
            metrics={workflowMetrics}
            onShowCompliance={() => {}}
            onShowRiskAssessment={() => {}}
          />
          
          {/* Debug button to test dialog */}
          <button 
            onClick={() => {
              console.log('🧪 Testing dialog directly');
              setConfigDialogType('decision');
              setConfigDialogOpen(true);
            }}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1000,
              background: 'red',
              color: 'white',
              padding: '5px 10px',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Test Dialog
          </button>
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-purple-900/50"
            style={{ backgroundColor: 'transparent' }}
            onDrop={(event) => {
              event.preventDefault();
              const data = event.dataTransfer.getData('application/json');
              if (data) {
                try {
                  const dropData = JSON.parse(data);
                  const rect = event.currentTarget.getBoundingClientRect();
                  const x = event.clientX - rect.left;
                  const y = event.clientY - rect.top;
                  
                  if (dropData.type === 'mcp-tool') {
                    console.log('MCP Tool dropped:', dropData.tool);
                    
                    // Check if we're dropping on an agent node
                    const targetNode = nodes.find(node => {
                      const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
                      if (nodeElement) {
                        const nodeRect = nodeElement.getBoundingClientRect();
                        const relativeNodeRect = {
                          left: nodeRect.left - rect.left,
                          top: nodeRect.top - rect.top,
                          right: nodeRect.right - rect.left,
                          bottom: nodeRect.bottom - rect.top
                        };
                        return x >= relativeNodeRect.left && x <= relativeNodeRect.right &&
                               y >= relativeNodeRect.top && y <= relativeNodeRect.bottom;
                      }
                      return false;
                    });

                    if (targetNode && targetNode.type === 'agent') {
                      // Add tool to existing agent node
                      const currentMCPTools = (targetNode.data.mcpTools as MCPTool[]) || [];
                      const toolExists = currentMCPTools.some(t => 
                        t.id === dropData.tool.id && t.serverId === dropData.tool.serverId
                      );
                      
                      if (!toolExists) {
                        const updatedMCPTools = [...currentMCPTools, dropData.tool];
                        updateNodeData(targetNode.id, { mcpTools: updatedMCPTools });
                        console.log('MCP Tool added to agent:', targetNode.id);
                      }
                    } else {
                      // Create standalone MCP tool node
                      const reactFlowInstance = (event.target as any).closest('.react-flow');
                      if (reactFlowInstance) {
                        // Convert screen coordinates to flow coordinates
                        const flowBounds = reactFlowInstance.getBoundingClientRect();
                        const position = {
                          x: x - flowBounds.left,
                          y: y - flowBounds.top
                        };

                        const newMCPToolNode: Node = {
                          id: `mcp-tool-${dropData.tool.id}-${Date.now()}`,
                          type: 'mcp-tool',
                          position: position,
                          data: {
                            label: dropData.tool.name,
                            description: dropData.tool.description,
                            category: dropData.tool.category,
                            serverId: dropData.tool.serverId,
                            usageComplexity: dropData.tool.usageComplexity || 'simple',
                            verified: dropData.tool.verified || false,
                            status: 'idle',
                            tool: dropData.tool
                          }
                        };
                        
                        setNodes((nds) => nds.concat(newMCPToolNode));
                        console.log('MCP Tool node created:', newMCPToolNode.id);
                      }
                    }
                  } else if (dropData.type === 'utility-node') {
                    // Handle utility node drops
                    console.log('📍 Utility node dropped:', dropData);
                    const position = {
                      x: x - 100,
                      y: y - 50
                    };
                    console.log('📍 Adding utility node at position:', position);
                    addUtilityNode(dropData.nodeType, { ...dropData.nodeData, position });
                    console.log('✅ Utility node added successfully');
                  } else if (dropData.type === 'ollama-agent') {
                    // Handle agent drops
                    const position = {
                      x: x - 100,
                      y: y - 50
                    };
                    addAgent('ollama-agent', { ...dropData.agent, position });
                  }
                } catch (error) {
                  console.error('Failed to parse drop data:', error);
                }
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'copy';
            }}
          >
            <Background 
              color="rgba(100, 200, 255, 0.1)" 
              gap={40}
              size={1}
              style={{ backgroundColor: 'transparent', opacity: 0.3 }}
            />
            <Controls 
              className="bg-slate-800/40 backdrop-blur-lg border border-cyan-400/20 shadow-lg rounded-xl"
              style={{ 
                background: 'rgba(30, 41, 59, 0.8)', 
                border: '1px solid rgba(34, 211, 238, 0.2)',
                zIndex: 1000
              }}
            />
            <MiniMap 
              className="bg-slate-800/40 backdrop-blur-lg border border-cyan-400/20 shadow-lg rounded-xl"
              style={{ 
                background: 'rgba(30, 41, 59, 0.8)', 
                border: '1px solid rgba(34, 211, 238, 0.2)',
                zIndex: 1000
              }}
              nodeColor="#22d3ee"
              maskColor="rgba(30, 41, 59, 0.6)"
            />
          </ReactFlow>
          
          {/* Empty State Message */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-slate-800/40 rounded-full flex items-center justify-center border-2 border-dashed border-slate-600">
                  <Plus className="w-12 h-12 text-slate-500" />
                </div>
                <h3 className="text-xl font-medium text-slate-300 mb-2">Start Building Your Workflow</h3>
                <p className="text-slate-500 max-w-md">
                  Drag agents from the palette to create your multi-agent orchestration. 
                  Connect them to define relationships and data flow.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Properties Panel */}
        {showProperties && selectedNode && (
          <EnhancedPropertiesPanel
            node={selectedNode}
            onUpdateNode={updateNodeData}
            onClose={() => setShowProperties(false)}
            onOpenConfiguration={handleOpenConfiguration}
          />
        )}

        {/* Workflow Configuration Dialog */}
        {showConfigDialog && selectedNode && (
          <WorkflowConfigDialog
            isOpen={showConfigDialog}
            onClose={() => setShowConfigDialog(false)}
            nodeType={configNodeType}
            nodeData={selectedNode.data}
            onSave={handleConfigSave}
          />
        )}

        {/* Utility Configuration Dialogs */}
        {configDialogOpen && configDialogType === 'decision' && (
          <>
            {console.log('🎯 Rendering DecisionNodeConfigDialog')}
            <DecisionNodeConfigDialog
              isOpen={configDialogOpen}
              onClose={handleUtilityConfigCancel}
              onSave={handleUtilityConfigSave}
              availableAgents={availableAgents}
            />
          </>
        )}

        {configDialogOpen && configDialogType === 'handoff' && (
          <>
            {console.log('🎯 Rendering HandoffNodeConfigDialog')}
            <HandoffNodeConfigDialog
              isOpen={configDialogOpen}
              onClose={handleUtilityConfigCancel}
              onSave={handleUtilityConfigSave}
              availableAgents={availableAgents}
            />
          </>
        )}
      </div>
    </div>
  );
};