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

import { WorkspaceHeader } from './WorkspaceHeader';
import { AgentPalette } from './AgentPalette';
import { PropertiesPanel } from './PropertiesPanel';
import { WorkflowToolbar } from './WorkflowToolbar';
import { CustomAgentNode } from './nodes/CustomAgentNode';
import { DecisionNode } from './nodes/DecisionNode';
import { MemoryNode } from './nodes/MemoryNode';
import { GuardrailNode } from './nodes/GuardrailNode';
import { TaskHandoffEdge } from './edges/TaskHandoffEdge';

const nodeTypes = {
  agent: CustomAgentNode,
  decision: DecisionNode,
  memory: MemoryNode,
  guardrail: GuardrailNode,
};

const edgeTypes = {
  taskHandoff: TaskHandoffEdge,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const MultiAgentWorkspaceBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'taskHandoff',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowProperties(true);
  }, []);

  const addAgentNode = useCallback((agentType: string) => {
    const newNode: Node = {
      id: `${agentType}-${Date.now()}`,
      type: 'agent',
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: { 
        label: agentType,
        agentType,
        model: 'gpt-4',
        tools: [],
        guardrails: [],
        memory: true,
        reasoning: 'chain-of-thought'
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const addUtilityNode = useCallback((nodeType: string) => {
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: { 
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        config: {}
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
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-beam-dark text-beam-text">
      <WorkspaceHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Agent Palette */}
        <AgentPalette 
          onAddAgent={addAgentNode}
          onAddUtility={addUtilityNode}
        />
        
        {/* Main Canvas */}
        <div className="flex-1 relative">
          <WorkflowToolbar 
            isRunning={isRunning}
            onRun={runWorkflow}
            onStop={() => setIsRunning(false)}
            nodeCount={nodes.length}
            connectionCount={edges.length}
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
            className="bg-beam-dark"
            style={{ backgroundColor: '#0f172a' }}
          >
            <Background 
              color="#1e293b" 
              gap={20}
              style={{ backgroundColor: '#0f172a' }}
            />
            <Controls 
              className="bg-beam-dark-accent border-gray-700"
              style={{ background: '#1e293b', border: '1px solid #374151' }}
            />
            <MiniMap 
              className="bg-beam-dark-accent border-gray-700"
              style={{ background: '#1e293b', border: '1px solid #374151' }}
              nodeColor="#10b981"
            />
          </ReactFlow>
        </div>
        
        {/* Properties Panel */}
        {showProperties && selectedNode && (
          <PropertiesPanel
            node={selectedNode}
            onUpdateNode={updateNodeData}
            onClose={() => setShowProperties(false)}
          />
        )}
      </div>
    </div>
  );
};