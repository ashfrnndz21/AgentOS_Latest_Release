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
import { ModernAgentNode } from './nodes/ModernAgentNode';
import { ModernDecisionNode } from './nodes/ModernDecisionNode';
import { ModernMemoryNode } from './nodes/ModernMemoryNode';
import { ModernGuardrailNode } from './nodes/ModernGuardrailNode';
import { EnhancedConnectionEdge } from './edges/EnhancedConnectionEdge';

const nodeTypes = {
  agent: ModernAgentNode,
  decision: ModernDecisionNode,
  memory: ModernMemoryNode,
  guardrail: ModernGuardrailNode,
};

const edgeTypes = {
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
  const [workflowMetrics, setWorkflowMetrics] = useState({
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
    setSelectedNode(node);
    setShowProperties(true);
  }, []);

  const addAgent = useCallback((agentType: string) => {
    const newNode: Node = {
      id: `${agentType.toLowerCase().replace(' ', '-')}-${Date.now()}`,
      type: 'agent',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: agentType,
        agentType,
        model: 'gpt-4',
        tools: [],
        guardrails: [],
        memory: true,
        reasoning: 'chain-of-thought',
        status: 'idle'
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const addUtilityNode = useCallback((nodeType: string) => {
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        config: {},
        status: 'idle'
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

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
            className="bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-purple-900/50"
            style={{ backgroundColor: 'transparent' }}
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
          />
        )}
      </div>
    </div>
  );
};