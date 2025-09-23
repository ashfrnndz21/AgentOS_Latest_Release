import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
  Panel,
  NodeTypes,
  EdgeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { A2AAgentNode } from './nodes/A2AAgentNode';
import { A2AConnectionNode } from './nodes/A2AConnectionNode';
import { UnifiedAgent } from './UnifiedAgentPalette';
import { workflowDefinitionService, WorkflowDefinition } from '@/lib/services/WorkflowDefinitionService';

// Custom node types
const nodeTypes: NodeTypes = {
  'a2a-agent': A2AAgentNode,
  'a2a-connection': A2AConnectionNode,
};

// Custom edge types
const edgeTypes: EdgeTypes = {
  'a2a-edge': (props) => (
    <div className="a2a-edge">
      <div className="a2a-edge-content">
        <span className="a2a-edge-label">{props.data?.label || 'A2A'}</span>
      </div>
    </div>
  ),
};

interface A2AWorkflowCanvasProps {
  onWorkflowChange: (workflow: WorkflowDefinition) => void;
  onExecutionStart: () => void;
  onExecutionComplete: (results: any) => void;
}

export const A2AWorkflowCanvas: React.FC<A2AWorkflowCanvasProps> = ({
  onWorkflowChange,
  onExecutionStart,
  onExecutionComplete
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);

  const { addNodes, addEdges, getNode, getEdge } = useReactFlow();

  // Initialize workflow
  useEffect(() => {
    const newWorkflow = workflowDefinitionService.createWorkflow(
      'A2A Workflow',
      'Multi-agent A2A communication workflow'
    );
    setWorkflow(newWorkflow);
  }, []);

  // Handle adding agent to canvas
  const handleAddAgent = useCallback((agent: UnifiedAgent) => {
    const newNode: Node = {
      id: `agent_${agent.id}_${Date.now()}`,
      type: 'a2a-agent',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          url: agent.url || '',
          capabilities: agent.capabilities,
          status: agent.status,
          last_health_check: agent.last_health_check
        },
        isConnected: false,
        messageCount: 0
      }
    };

    addNodes([newNode]);
    
    // Add to workflow definition
    if (workflow) {
      const workflowNode = workflowDefinitionService.addAgentNode(
        workflow.id,
        agent.id,
        newNode.position
      );
      onWorkflowChange(workflow);
    }
  }, [addNodes, workflow, onWorkflowChange]);

  // Handle connection creation
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;

    const newEdge: Edge = {
      id: `edge_${connection.source}_${connection.target}`,
      source: connection.source,
      target: connection.target,
      type: 'a2a-edge',
      data: {
        label: 'A2A Communication'
      }
    };

    addEdges([newEdge]);
    
    // Add to workflow definition
    if (workflow) {
      workflowDefinitionService.addConnection(
        workflow.id,
        connection.source,
        connection.target,
        'a2a',
        {
          messageType: 'request',
          timeout: 30,
          retryCount: 3
        }
      );
      onWorkflowChange(workflow);
    }
  }, [addEdges, workflow, onWorkflowChange]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Execute workflow
  const executeWorkflow = useCallback(async () => {
    if (!workflow) return;

    setIsExecuting(true);
    onExecutionStart();

    try {
      const results = await workflowDefinitionService.executeWorkflow(
        workflow.id,
        'Execute A2A workflow'
      );

      setExecutionResults(results);
      onExecutionComplete(results);

      // Update node statuses based on results
      setNodes(prevNodes => 
        prevNodes.map(node => {
          const result = results.results.find(r => r.agentId === node.data.agent?.id);
          if (result) {
            return {
              ...node,
              data: {
                ...node.data,
                status: result.status === 'success' ? 'completed' : 'error',
                lastMessage: result.response,
                messageCount: (node.data.messageCount || 0) + 1
              }
            };
          }
          return node;
        })
      );
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [workflow, setNodes, onExecutionStart, onExecutionComplete]);

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setExecutionResults(null);
    
    if (workflow) {
      const newWorkflow = workflowDefinitionService.createWorkflow(
        'A2A Workflow',
        'Multi-agent A2A communication workflow'
      );
      setWorkflow(newWorkflow);
      onWorkflowChange(newWorkflow);
    }
  }, [setNodes, setEdges, workflow, onWorkflowChange]);

  // Save workflow
  const saveWorkflow = useCallback(() => {
    if (workflow) {
      // In a real implementation, this would save to a backend
      console.log('Saving workflow:', workflow);
    }
  }, [workflow]);

  // Export workflow
  const exportWorkflow = useCallback(() => {
    if (workflow) {
      const dataStr = JSON.stringify(workflow, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workflow.name}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [workflow]);

  // Get workflow statistics
  const workflowStats = useMemo(() => {
    const agentNodes = nodes.filter(node => node.type === 'a2a-agent');
    const connectionEdges = edges.filter(edge => edge.type === 'a2a-edge');
    
    return {
      nodes: agentNodes.length,
      connections: connectionEdges.length,
      isExecuting,
      hasResults: !!executionResults
    };
  }, [nodes, edges, isExecuting, executionResults]);

  return (
    <div className="h-full w-full bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#374151" gap={20} />
        <Controls className="bg-slate-800 border-slate-600" />
        <MiniMap 
          className="bg-slate-800 border-slate-600"
          nodeColor="#3B82F6"
          maskColor="rgba(0, 0, 0, 0.5)"
        />
        
        {/* Workflow Controls Panel */}
        <Panel position="top-left" className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 m-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100">A2A Workflow</h3>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{workflowStats.nodes} Agents</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{workflowStats.connections} Connections</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={executeWorkflow}
                disabled={isExecuting || workflowStats.nodes === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium"
              >
                {isExecuting ? 'Executing...' : 'Execute Workflow'}
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={resetWorkflow}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm"
                >
                  Reset
                </button>
                <button
                  onClick={saveWorkflow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                >
                  Save
                </button>
              </div>
              
              <button
                onClick={exportWorkflow}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
              >
                Export
              </button>
            </div>
          </div>
        </Panel>

        {/* Execution Results Panel */}
        {executionResults && (
          <Panel position="bottom-right" className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 m-4 max-w-md">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-100">Execution Results</h3>
              
              <div className="space-y-2">
                {executionResults.results.map((result: any, index: number) => (
                  <div key={index} className="p-2 bg-slate-700/50 rounded text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-100">{result.agentId}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        result.status === 'success' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Response: {result.response}
                    </div>
                    <div className="text-xs text-slate-500">
                      Time: {result.responseTime}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        )}

        {/* Instructions Panel */}
        {nodes.length === 0 && (
          <Panel position="center" className="text-center">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-8 max-w-md">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-xl font-semibold text-slate-100 mb-2">
                Start Building Your A2A Workflow
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                Drag agents from the palette to create your intelligent multi-agent workflow. 
                Connect them to enable A2A communication.
              </p>
              <div className="flex justify-center space-x-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>A2A Agents</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Connections</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Orchestration</span>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

// Wrapper component with ReactFlowProvider
export const A2AWorkflowCanvasWrapper: React.FC<A2AWorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <A2AWorkflowCanvas {...props} />
    </ReactFlowProvider>
  );
};











