import React, { useCallback, useEffect, useState, useRef } from 'react';
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

// Import error boundary
import ErrorBoundary from './ErrorBoundary';

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
import { A2AConnectionNode } from './nodes/A2AConnectionNode';

// Custom edge components
import StrandsEdge from './edges/StrandsEdge';
import AnimatedStrandsEdge from './edges/AnimatedStrandsEdge';

// Execution overlay
import StrandsExecutionOverlay from './StrandsExecutionOverlay';

import { AddChatInterfaceButton } from './AddChatInterfaceButton';
import { OrchestratorQueryDialog } from './OrchestratorQueryDialog';

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
  'a2a-connection': A2AConnectionNode,
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
  
  // Orchestrator query dialog state
  const [showOrchestratorDialog, setShowOrchestratorDialog] = useState(false);
  const [orchestratorNode, setOrchestratorNode] = useState<Node | null>(null);

  // FIXED: Add debounced state update mechanism to prevent rapid state changes
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<{ nodes?: Node[], edges?: Edge[] }>({});

  const { screenToFlowPosition } = useReactFlow();

  // FIXED: Debounced state update function to prevent rapid state changes
  const debouncedUpdateState = useCallback((updates: { nodes?: Node[], edges?: Edge[] }) => {
    // Store pending updates
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...updates
    };

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout to apply updates
    updateTimeoutRef.current = setTimeout(() => {
      const { nodes: pendingNodes, edges: pendingEdges } = pendingUpdatesRef.current;
      
      if (pendingNodes) {
        setNodes(pendingNodes);
      }
      if (pendingEdges) {
        setEdges(pendingEdges);
      }
      
      // Clear pending updates
      pendingUpdatesRef.current = {};
    }, 100); // 100ms debounce
  }, [setNodes, setEdges]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

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
  }, []); // FIXED: Remove setNodes dependency to prevent memory leaks

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
        }
      }
    },
    [nodes, orchestrator, setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const strandsNode = node as StrandsWorkflowNode;
    
    console.log('🖱️ Node clicked:', node.data?.name, 'ID:', node.data?.id, 'isMainOrchestrator:', node.data?.isMainOrchestrator);
    
    // Check if clicked node is Main System Orchestrator (multiple checks for safety)
    if (node.data?.isMainOrchestrator || 
        node.data?.id === 'main-system-orchestrator' ||
        node.id === 'main-system-orchestrator' ||
        node.data?.name === 'Main System Orchestrator') {
      console.log('🧠 Main System Orchestrator clicked - opening query dialog');
      setOrchestratorNode(node);
      setShowOrchestratorDialog(true);
      return;
    }
    
    setSelectedNode(strandsNode);
    onNodeSelect?.(strandsNode);
  }, [onNodeSelect]);

  // Handle drag and drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const position = screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    try {
      const dragData = JSON.parse(event.dataTransfer.getData('application/json'));
      console.log('🎯 Canvas: Drop event received', dragData);

      let newNode: StrandsWorkflowNode | null = null;

      if (dragData.type === 'strands-agent') {
        // Handle Strands agent drop
        const agent = dragData.agent;
        newNode = orchestrator.createAgentNode(agent, position);
        console.log('🤖 Created Strands agent node:', newNode);
      } else if (dragData.type === 'main-system-orchestrator') {
        // Handle Main System Orchestrator drop
        console.log('🎯 Canvas: Received Main System Orchestrator drop');
        const agent = dragData.agent;
        
        // Create orchestrator node with special styling
        const paletteAgent = {
          id: 'main-system-orchestrator',
          name: 'Main System Orchestrator',
          role: 'System Coordinator',
          description: 'Coordinates A2A handoffs between orchestration-enabled agents',
          model: 'qwen3:1.7b',
          systemPrompt: 'You are the main system orchestrator coordinating multi-agent workflows.',
          temperature: 0.3,
          maxTokens: 2000,
          capabilities: ['orchestration', 'coordination', 'routing', 'execution'],
          created_at: new Date().toISOString(),
          icon: '🧠',
          guardrails: true,
          a2aEnabled: true,
          orchestrationEnabled: true,
          isMainOrchestrator: true,
          dedicatedBackend: { port: 5031, model: 'qwen3:1.7b', status: 'running' },
          a2aId: 'main-system-orchestrator',
          status: 'active'
        };
        
        newNode = orchestrator.createAgentNode(paletteAgent, position);
        // Add special styling for orchestrator node
        if (newNode) {
          newNode.style = {
            ...newNode.style,
            background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            border: '2px solid #a78bfa',
            boxShadow: '0 0 20px rgba(167, 139, 250, 0.3)'
          };
        }
        console.log('🧠 Created Main System Orchestrator node:', newNode);
      } else if (dragData.type === 'a2a-orchestration-agent') {
        // Handle A2A Orchestration agent drop
        console.log('🎯 Canvas: Received A2A orchestration agent drop:', dragData.agent.name);
        const agent = dragData.agent;
        
        // Convert A2A orchestration agent to PaletteAgent format
        const paletteAgent = {
          id: agent.id || `a2a-${Date.now()}`,
          name: agent.name,
          role: 'A2A Orchestration Agent',
          description: `Orchestration-enabled agent with ${agent.capabilities?.length || 0} capabilities`,
          model: agent.dedicated_ollama_backend?.model || 'shared',
          systemPrompt: 'You are an orchestration-enabled AI agent.',
          temperature: 0.7,
          maxTokens: 1000,
          capabilities: agent.capabilities || [],
          created_at: new Date().toISOString(),
          icon: '🌐',
          guardrails: true,
          a2aEnabled: true,
          orchestrationEnabled: true,
          dedicatedBackend: agent.dedicated_ollama_backend,
          a2aId: agent.id,
          status: 'active'
        };
        
        newNode = orchestrator.createAgentNode(paletteAgent, position);
        console.log('🤖 Created A2A orchestration agent node:', newNode);
      } else if (dragData.type === 'strands-sdk-agent') {
        // Handle Strands SDK agent drop
        console.log('🎯 Canvas: Received Strands SDK agent drop:', dragData.agent.name);
        const agent = dragData.agent;
        
        // Convert StrandsSdkAgent to PaletteAgent format
        const paletteAgent = {
          id: agent.id || `strands-sdk-${Date.now()}`,
          name: agent.name,
          role: 'Strands SDK Agent',
          description: agent.description,
          model: agent.model_id,
          systemPrompt: agent.system_prompt || 'You are a helpful assistant.',
          temperature: 0.7,
          maxTokens: 1000,
          capabilities: agent.tools || [],
          created_at: agent.created_at || new Date().toISOString(),
          icon: '🤖',
          guardrails: true,
          sdkType: 'strands-sdk',
          sdkPowered: true,
          tools: agent.tools || [],
          host: agent.host,
          model_provider: agent.model_provider,
          sdk_config: agent.sdk_config,
          sdk_version: agent.sdk_version,
          status: agent.status || 'active'
        };
        
        newNode = orchestrator.createAgentNode(paletteAgent, position);
        console.log('🤖 Created Strands SDK agent node:', newNode);
      } else if (dragData.type === 'ollama-agent') {
        // Handle Ollama agent drop (convert to Strands format)
        const agent = dragData.agent;
        const strandsAgent = {
          ...agent,
          capabilities: agent.capabilities || ['General'],
          guardrails: agent.guardrails || false,
          icon: '🤖'
        };
        newNode = orchestrator.createAgentNode(strandsAgent, position);
        console.log('🤖 Created Ollama agent node:', newNode);
      } else if (dragData.type === 'utility-node') {
        // Handle utility node drop
        const { nodeType, nodeData } = dragData;
        
        switch (nodeType) {
          case 'decision':
            newNode = orchestrator.createDecisionNode(nodeData.name || 'Decision', position);
            break;
          case 'handoff':
            newNode = orchestrator.createHandoffNode(nodeData.name || 'Handoff', position);
            break;
          case 'human':
            newNode = orchestrator.createHumanNode(nodeData.name || 'Human Input', position);
            break;
          case 'memory':
            newNode = orchestrator.createMemoryNode(nodeData.name || 'Memory', position);
            break;
          case 'guardrail':
            newNode = orchestrator.createGuardrailNode(nodeData.name || 'Guardrail', position);
            break;
          case 'aggregator':
            newNode = orchestrator.createAggregatorNode(nodeData.name || 'Aggregator', position);
            break;
          case 'monitor':
            newNode = orchestrator.createMonitorNode(nodeData.name || 'Monitor', position);
            break;
          default:
            console.warn('Unknown utility node type:', nodeType);
        }
        
        if (newNode) {
          console.log('🔧 Created utility node:', newNode);
        }
      } else if (dragData.type === 'mcp-tool') {
        // Handle MCP tool drop
        const tool = dragData.tool;
        newNode = orchestrator.createToolNode(tool, position);
        console.log('🛠️ Created MCP tool node:', newNode);
      } else if (dragData.type === 'strands-tool') {
        // Handle Strands native tool drop
        const tool = dragData.tool;
        
        // Check if it's an A2A tool
        if (tool.isA2ATool) {
          // Create A2A connection node
          newNode = {
            id: `a2a-conn-${Date.now()}`,
            type: 'a2a-connection',
            position,
            data: {
              id: `a2a-conn-${Date.now()}`,
              fromAgentId: '',
              toAgentId: '',
              messageTemplate: '',
              connectionType: tool.id === 'a2a_send_message' ? 'message' : 
                            tool.id === 'agent_handoff' ? 'handoff' : 
                            tool.id === 'coordinate_agents' ? 'coordinate' : 'message',
              isConfigured: false,
              isActive: false
            }
          };
          console.log('🔗 Created A2A connection node:', newNode);
        } else {
          // Regular tool node
          newNode = orchestrator.createStrandsToolNode(tool, position);
          console.log('🔧 Created Strands tool node:', newNode);
        }
      } else if (dragData.type === 'external-tool') {
        // Handle external tool drop
        const tool = dragData.tool;
        newNode = orchestrator.createExternalToolNode(tool, position);
        console.log('🌐 Created external tool node:', newNode);
      }

      if (newNode) {
        setNodes((nds) => nds.concat(newNode!));
        console.log('✅ Node added to canvas:', newNode);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [screenToFlowPosition, orchestrator, setNodes]);

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Get agents connected to orchestrator
  const getConnectedAgents = useCallback((orchestratorNodeId: string) => {
    // Find all edges where orchestrator is the source
    const outgoingEdges = edges.filter(e => e.source === orchestratorNodeId);
    
    // Get the target nodes (connected agents)
    const connectedNodes = outgoingEdges
      .map(edge => nodes.find(n => n.id === edge.target))
      .filter(n => n !== undefined) as Node[];
    
    console.log('🔗 Connected agents:', connectedNodes.map(n => n.data?.name));
    return connectedNodes;
  }, [edges, nodes]);

  // Execute query through orchestrator with multi-agent support
  const executeOrchestratorQuery = useCallback(async (query: string) => {
    if (!orchestratorNode) {
      throw new Error('No orchestrator node selected');
    }

    // Get connected agents
    const connectedAgents = getConnectedAgents(orchestratorNode.id);
    
    if (connectedAgents.length === 0) {
      throw new Error('No agents connected to orchestrator. Please connect agents first.');
    }

    console.log('🚀 Executing query through orchestrator:', query);
    console.log('🔗 Connected agents:', connectedAgents.map(a => a.data?.name));

    // Prepare connected agents data with full context
    const agentsData = connectedAgents.map(agent => ({
      id: agent.data?.a2aId || agent.data?.id || agent.id,
      name: agent.data?.name || 'Unknown Agent',
      capabilities: agent.data?.capabilities || [],
      port: agent.data?.dedicatedBackend?.port || null,
      node_id: agent.id
    }));

    // Visual feedback: highlight orchestrator as analyzing
    setNodes(nds => nds.map(n => 
      n.id === orchestratorNode.id 
        ? { ...n, data: { ...n.data, status: 'running' } }
        : n
    ));

    try {
      // Call Chat Orchestrator API (now with advanced features)
      const response = await fetch('http://localhost:5005/api/chat/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          session_id: `canvas-${workflowId}`,
          workflow_context: {
            canvas_mode: true,
            connected_agents: agentsData,
            total_agents: connectedAgents.length,
            enable_multi_agent: true,
            execution_strategy: 'intelligent' // Can be: intelligent, parallel, sequential, broadcast
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Orchestrator returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Visual feedback: highlight connections and agents that were used
      if (result.selected_agents && Array.isArray(result.selected_agents)) {
        console.log('📊 Agents used:', result.selected_agents.map((a: any) => a.name || a.agent_name));
        
        // Highlight all agents that were used
        const usedAgentIds = result.selected_agents.map((a: any) => a.id || a.agent_id);
        
        // Animate all connections to used agents
        usedAgentIds.forEach((agentId: string) => {
          const targetNode = connectedAgents.find(
            a => a.data?.a2aId === agentId || a.data?.id === agentId || a.id === agentId
          );
          
          if (targetNode) {
            // Highlight the node
            setNodes(nds => nds.map(n => 
              n.id === targetNode.id 
                ? { ...n, data: { ...n.data, status: 'completed' } }
                : n
            ));
            
            // Find and animate the edge
            const usedEdge = edges.find(
              e => e.source === orchestratorNode.id && e.target === targetNode.id
            );
            
            if (usedEdge) {
              setEdges(eds => eds.map(e => 
                e.id === usedEdge.id 
                  ? { 
                      ...e, 
                      animated: true, 
                      style: { ...e.style, stroke: '#10b981', strokeWidth: 3 },
                      label: '✓ Used'
                    }
                  : e
              ));
            }
          }
        });
        
        // Reset animations after 4 seconds - FIXED: Use debounced updates
        setTimeout(() => {
          debouncedUpdateState({
            edges: edges.map(e => ({
              ...e,
              animated: false,
              style: { ...e.style, stroke: '#6b7280', strokeWidth: 2 },
              label: undefined
            })),
            nodes: nodes.map(n => ({
              ...n,
              data: { ...n.data, status: 'idle' }
            }))
          });
        }, 4000);
      }

      // Mark orchestrator as completed - FIXED: Add null check and debounce updates
      if (orchestratorNode?.id) {
        setNodes(nds => nds.map(n => 
          n.id === orchestratorNode.id 
            ? { ...n, data: { ...n.data, status: 'completed' } }
            : n
        ));
      }

      console.log('✅ Orchestrator query completed:', result);
      return result;
      
    } catch (error) {
      // Reset orchestrator status on error - FIXED: Add null check
      if (orchestratorNode?.id) {
        setNodes(nds => nds.map(n => 
          n.id === orchestratorNode.id 
            ? { ...n, data: { ...n.data, status: 'error' } }
            : n
        ));
      }
      throw error;
    }
  }, [orchestratorNode, getConnectedAgents, workflowId, edges, setEdges, setNodes]);

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
    <ErrorBoundary>
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

      {/* Orchestrator Query Dialog */}
      <OrchestratorQueryDialog
        open={showOrchestratorDialog}
        onOpenChange={setShowOrchestratorDialog}
        orchestratorNode={orchestratorNode}
        connectedAgents={orchestratorNode ? getConnectedAgents(orchestratorNode.id) : []}
        onExecute={executeOrchestratorQuery}
      />
    </div>
    </ErrorBoundary>
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