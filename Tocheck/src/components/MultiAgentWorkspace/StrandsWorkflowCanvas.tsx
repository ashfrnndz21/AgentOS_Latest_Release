import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { StrandsWorkflowOrchestrator, StrandsWorkflowNode, WorkflowExecution } from '@/lib/services/StrandsWorkflowOrchestrator';
import { PaletteAgent } from '@/hooks/useOllamaAgentsForPalette';
import { MCPTool } from '@/lib/services/MCPGatewayService';
import { StrandsNativeTool } from '@/hooks/useStrandsNativeTools';

// Import custom node components
import StrandsAgentNode from './nodes/StrandsAgentNode';
import StrandsToolNode from './nodes/StrandsToolNode';
import StrandsDecisionNode from './nodes/StrandsDecisionNode';
import StrandsHandoffNode from './nodes/StrandsHandoffNode';
import StrandsOutputNode from './nodes/StrandsOutputNode';
import StrandsHumanNode from './nodes/StrandsHumanNode';
import StrandsMemoryNode from './nodes/StrandsMemoryNode';
import StrandsGuardrailNode from './nodes/StrandsGuardrailNode';
import StrandsAggregatorNode from './nodes/StrandsAggregatorNode';
import StrandsMonitorNode from './nodes/StrandsMonitorNode';
import { ChatInterfaceNode } from './nodes/ChatInterfaceNode';

// Custom edge components
import StrandsEdge from './edges/StrandsEdge';
import AnimatedStrandsEdge from './edges/AnimatedStrandsEdge';

// Execution overlay
import StrandsExecutionOverlay from './StrandsExecutionOverlay';

import { AddChatInterfaceButton } from './AddChatInterfaceButton';

// Node types mapping
const nodeTypes = {
  'strands-agent': StrandsAgentNode,
  'strands-tool': StrandsToolNode,
  'strands-decision': StrandsDecisionNode,
  'strands-handoff': StrandsHandoffNode,
  'strands-output': StrandsOutputNode,
  'strands-human': StrandsHumanNode,
  'strands-memory': StrandsMemoryNode,
  'strands-guardrail': StrandsGuardrailNode,
  'strands-aggregator': StrandsAggregatorNode,
  'strands-monitor': StrandsMonitorNode,
  'strands-chat-interface': ChatInterfaceNode,
};

// Edge types mapping
const edgeTypes = {
  'strands-edge': StrandsEdge,
  'animated-strands-edge': AnimatedStrandsEdge,
};

interface StrandsWorkflowCanvasProps {
  orchestrator: StrandsWorkflowOrchestrator;
  workflowId: string;
  onNodeSelect?: (node: StrandsWorkflowNode | null) => void;
  onExecutionStart?: (execution: WorkflowExecution) => void;
  onExecutionComplete?: (execution: WorkflowExecution) => void;
  onUpdateNode?: (nodeId: string, newData: any) => void;
  onCanvasReady?: (updateFunction: (nodeId: string, newData: any) => void) => void;
  onNodesChange?: (nodeCount: number, edgeCount: number) => void;
  className?: string;
}

const StrandsWorkflowCanvas: React.FC<StrandsWorkflowCanvasProps> = ({
  orchestrator,
  workflowId,
  onNodeSelect,
  onExecutionStart,
  onExecutionComplete,
  onUpdateNode,
  onCanvasReady,
  onNodesChange: onNodesCountChange,
  className = ''
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<StrandsWorkflowNode | null>(null);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>([]);


  const { screenToFlowPosition } = useReactFlow();

  // Listen for chat interface node creation events
  useEffect(() => {
    const handleAddChatInterfaceNode = (event: CustomEvent) => {
      console.log('🎯 Canvas: Received addChatInterfaceNode event', event.detail);
      const { node } = event.detail;
      console.log('📦 Canvas: Adding node to canvas', node);
      setNodes(prevNodes => {
        const newNodes = [...prevNodes, node];
        console.log('📊 Canvas: Updated nodes array', newNodes);
        return newNodes;
      });
    };

    window.addEventListener('addChatInterfaceNode', handleAddChatInterfaceNode as EventListener);
    console.log('👂 Canvas: Event listener registered for addChatInterfaceNode');
    
    return () => {
      window.removeEventListener('addChatInterfaceNode', handleAddChatInterfaceNode as EventListener);
      console.log('🧹 Canvas: Event listener removed for addChatInterfaceNode');
    };
  }, [setNodes]);

  // Handle node data updates
  const handleNodeUpdate = useCallback((nodeId: string, newData: any) => {
    console.log('🔄 StrandsWorkflowCanvas: Updating node data', { nodeId, newData });
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
    
    // Also update the selected node if it's the one being updated
    setSelectedNode((prev) =>
      prev && prev.id === nodeId
        ? { ...prev, data: { ...prev.data, ...newData } }
        : prev
    );
    
    // Call the parent callback if provided
    if (onUpdateNode) {
      onUpdateNode(nodeId, newData);
    }
  }, [setNodes, onUpdateNode]);

  // Expose the update function to parent when canvas is ready
  React.useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady(handleNodeUpdate);
    }
  }, [onCanvasReady, handleNodeUpdate]);

  // Track nodes and edges changes for empty state
  React.useEffect(() => {
    if (onNodesCountChange) {
      onNodesCountChange(nodes.length, edges.length);
    }
  }, [nodes.length, edges.length, onNodesCountChange]);

  // Handle node connections
  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find(n => n.id === params.source) as StrandsWorkflowNode;
      const targetNode = nodes.find(n => n.id === params.target) as StrandsWorkflowNode;

      if (sourceNode && targetNode) {
        const validation = orchestrator.validateConnection(sourceNode, targetNode);
        
        if (validation.valid) {
          const newEdge = {
            ...params,
            id: `edge_${params.source}_${params.target}`,
            type: 'strands-edge',
            animated: false,
            style: {
              stroke: '#6b7280',
              strokeWidth: 2,
            },
            markerEnd: {
              type: 'arrowclosed' as const,
              color: '#6b7280',
            },
          };
          
          setEdges((eds) => addEdge(newEdge, eds));
        } else {
          // Show validation error
          console.warn('Invalid connection:', validation.reason);
          // You could show a toast notification here
        }
      }
    },
    [nodes, orchestrator, setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const strandsNode = node as StrandsWorkflowNode;
    setSelectedNode(strandsNode);
    onNodeSelect?.(strandsNode);
  }, [onNodeSelect]);

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Handle drag and drop from agent palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      try {
        const dragData = JSON.parse(event.dataTransfer.getData('application/json'));
        console.log('🎯 Drop data received:', dragData);
        
        let newNode: StrandsWorkflowNode;

        if (dragData.type === 'ollama-agent' && dragData.agent) {
          // Create agent node from palette agent
          console.log('✅ Creating Ollama agent node');
          newNode = orchestrator.createAgentNode(dragData.agent as PaletteAgent, position);
        } else if (dragData.type === 'mcp-tool' && dragData.tool) {
          // Create tool node from MCP tool
          console.log('✅ Creating MCP tool node');
          newNode = orchestrator.createToolNode(dragData.tool as MCPTool, position);
        } else if (dragData.type === 'strands-tool' && dragData.tool) {
          // Create tool node from Strands native tool
          console.log('✅ Creating Strands native tool node:', dragData.tool.name);
          // Convert Strands tool to MCPTool-like format for compatibility
          const mcpCompatibleTool = {
            id: dragData.tool.id,
            name: dragData.tool.name,
            description: dragData.tool.description,
            category: dragData.tool.category,
            serverId: 'strands-native',
            usageComplexity: dragData.tool.complexity,
            schema: {
              type: 'function',
              function: {
                name: dragData.tool.id,
                description: dragData.tool.description,
                parameters: dragData.tool.apiConfig || {}
              }
            }
          };
          newNode = orchestrator.createToolNode(mcpCompatibleTool as any, position);
        } else if (dragData.type === 'utility-node' && dragData.nodeType) {
          // Create utility nodes (decision, handoff, human, etc.)
          console.log('✅ Creating utility node:', dragData.nodeType);
          if (dragData.nodeType === 'decision') {
            newNode = orchestrator.createDecisionNode(dragData.nodeData?.name || 'Decision Point', position);
          } else if (dragData.nodeType === 'handoff') {
            newNode = orchestrator.createHandoffNode('Agent Handoff', position);
          } else if (dragData.nodeType === 'human') {
            newNode = orchestrator.createHumanNode('Human Input', position);
          } else if (dragData.nodeType === 'memory') {
            newNode = orchestrator.createMemoryNode('Shared Memory', position);
          } else if (dragData.nodeType === 'guardrail') {
            newNode = orchestrator.createGuardrailNode('Safety Check', position);
          } else if (dragData.nodeType === 'aggregator') {
            newNode = orchestrator.createAggregatorNode('Response Aggregator', position);
          } else if (dragData.nodeType === 'monitor') {
            newNode = orchestrator.createMonitorNode('Performance Monitor', position);
          } else {
            console.warn('❌ Unknown utility node type:', dragData.nodeType);
            return;
          }
        } else if (dragData.type === 'decision-node') {
          // Legacy decision node support
          console.log('✅ Creating legacy decision node');
          newNode = orchestrator.createDecisionNode(dragData.name || 'Decision Point', position);
        } else {
          console.warn('❌ Unknown drag data type:', dragData.type, dragData);
          return;
        }

        setNodes((nds) => nds.concat(newNode));

        // Auto-suggest connections if there are existing nodes
        if (nodes.length > 0) {
          const suggestions = orchestrator.suggestNextNodes(newNode, {
            conversationHistory: [],
            currentData: {},
            userPreferences: {},
            executionState: 'idle',
            metadata: {}
          });

          // You could show suggestions in a popup or automatically create connections
          console.log('Connection suggestions:', suggestions);
        }

      } catch (error) {
        console.error('Error handling drop:', error);
      }
    },
    [screenToFlowPosition, orchestrator, setNodes, nodes]
  );

  // Execute workflow
  const executeWorkflow = useCallback(async () => {
    if (isExecuting || nodes.length === 0) return;

    setIsExecuting(true);
    
    try {
      // Update workflow in orchestrator
      const workflow = orchestrator.getWorkflow(workflowId);
      if (workflow) {
        workflow.nodes = nodes as StrandsWorkflowNode[];
        workflow.edges = edges;
      }

      const execution = await orchestrator.executeWorkflow(workflowId, {
        message: 'Starting workflow execution',
        timestamp: new Date().toISOString()
      });

      setCurrentExecution(execution);
      setExecutionHistory(prev => [...prev, execution]);
      
      onExecutionStart?.(execution);

      // Animate execution flow
      await animateExecution(execution);

      onExecutionComplete?.(execution);

    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [workflowId, nodes, edges, isExecuting, orchestrator, onExecutionStart, onExecutionComplete]);

  // Animate execution flow
  const animateExecution = async (execution: WorkflowExecution) => {
    for (const nodeId of execution.executionPath) {
      // Highlight current node
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            status: node.id === nodeId ? 'running' : node.data.status,
          },
        }))
      );

      // Animate edges leading to this node
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          animated: edge.target === nodeId,
          style: {
            ...edge.style,
            stroke: edge.target === nodeId ? '#10b981' : '#6b7280',
          },
        }))
      );

      // Wait for node execution (simulate)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mark node as completed
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            status: node.id === nodeId ? 'completed' : node.data.status,
          },
        }))
      );
    }

    // Reset animations
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: false,
        style: {
          ...edge.style,
          stroke: '#6b7280',
        },
      }))
    );
  };

  // Clear workflow
  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setCurrentExecution(null);
  }, [setNodes, setEdges]);

  // Save workflow
  const saveWorkflow = useCallback(() => {
    const workflowData = {
      nodes: nodes as StrandsWorkflowNode[],
      edges,
      metadata: {
        name: `Workflow ${workflowId}`,
        created: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length
      }
    };

    // Save to localStorage for now
    localStorage.setItem(`strands_workflow_${workflowId}`, JSON.stringify(workflowData));
    console.log('Workflow saved:', workflowData);
  }, [workflowId, nodes, edges]);

  // Load workflow
  const loadWorkflow = useCallback(() => {
    try {
      const saved = localStorage.getItem(`strands_workflow_${workflowId}`);
      if (saved) {
        const workflowData = JSON.parse(saved);
        setNodes(workflowData.nodes || []);
        setEdges(workflowData.edges || []);
        console.log('Workflow loaded:', workflowData);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
    }
  }, [workflowId, setNodes, setEdges]);

  // Load workflow on mount
  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  return (
    <div className={`strands-workflow-canvas h-full w-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-900"
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1} 
          color="#374151" 
        />
        
        <Controls 
          className="bg-gray-800 border-gray-700"
          showInteractive={false}
        />
        
        <MiniMap 
          className="bg-gray-800 border-gray-700"
          nodeColor={(node) => {
            const strandsNode = node as StrandsWorkflowNode;
            return strandsNode.data.color || '#6b7280';
          }}
          maskColor="rgba(0, 0, 0, 0.2)"
        />

        {/* Workflow Controls Panel */}
        <Panel position="top-right" className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
          <div className="flex flex-col space-y-2">
            <button
              onClick={executeWorkflow}
              disabled={isExecuting || nodes.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isExecuting || nodes.length === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isExecuting ? 'Executing...' : 'Execute Workflow'}
            </button>



            <AddChatInterfaceButton
              orchestrator={orchestrator}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
            />
            
            <button
              onClick={saveWorkflow}
              disabled={nodes.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-600 disabled:text-gray-400"
            >
              Save Workflow
            </button>
            
            <button
              onClick={clearWorkflow}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Clear Canvas
            </button>
          </div>

          {/* Workflow Stats */}
          <div className="text-sm text-gray-300 pt-2 border-t border-gray-700">
            <div>Nodes: {nodes.length}</div>
            <div>Connections: {edges.length}</div>
            {currentExecution && (
              <div className="mt-2">
                <div>Status: {currentExecution.status}</div>
                <div>Executions: {executionHistory.length}</div>
              </div>
            )}
          </div>
        </Panel>

        {/* Execution Overlay */}
        {currentExecution && (
          <StrandsExecutionOverlay 
            execution={currentExecution}
            onClose={() => setCurrentExecution(null)}
          />
        )}


      </ReactFlow>
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const StrandsWorkflowCanvasWrapper: React.FC<StrandsWorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <StrandsWorkflowCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default StrandsWorkflowCanvasWrapper;