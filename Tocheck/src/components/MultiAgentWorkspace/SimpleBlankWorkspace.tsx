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
import { Plus, Play, Square, Bot, Users, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Simple node components
const SimpleAgentNode = ({ data, selected }: any) => (
  <Card className={`w-48 ${selected ? 'border-purple-400' : 'border-slate-600/30'}`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Bot className="w-4 h-4" />
        {data.label}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <Badge variant="outline" className="text-xs">Agent</Badge>
    </CardContent>
  </Card>
);

const SimpleHumanNode = ({ data, selected }: any) => (
  <Card className={`w-48 ${selected ? 'border-purple-400' : 'border-slate-600/30'}`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Users className="w-4 h-4" />
        {data.label}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <Badge variant="outline" className="text-xs">Human</Badge>
    </CardContent>
  </Card>
);

const SimpleToolNode = ({ data, selected }: any) => (
  <Card className={`w-48 ${selected ? 'border-purple-400' : 'border-slate-600/30'}`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Zap className="w-4 h-4" />
        {data.label}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <Badge variant="outline" className="text-xs">Tool</Badge>
    </CardContent>
  </Card>
);

const SimpleDecisionNode = ({ data, selected }: any) => (
  <Card className={`w-48 ${selected ? 'border-purple-400' : 'border-slate-600/30'}`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Settings className="w-4 h-4" />
        {data.label}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <Badge variant="outline" className="text-xs">Decision</Badge>
    </CardContent>
  </Card>
);

const nodeTypes = {
  agent: SimpleAgentNode,
  human: SimpleHumanNode,
  tool: SimpleToolNode,
  decision: SimpleDecisionNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const SimpleBlankWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showPalette, setShowPalette] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        animated: true,
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = useCallback((type: string, label: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { label },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const runWorkflow = useCallback(async () => {
    setIsRunning(true);
    
    try {
      // Call backend API to execute workflow
      const response = await fetch('http://localhost:5052/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            name: node.data.label,
            config: {},
            position: node.position,
            connections: []
          })),
          connections: edges.map(edge => ({
            from: edge.source,
            to: edge.target,
            type: 'data'
          })),
          entry_point: nodes[0]?.id
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Workflow executed:', result);
      }
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setTimeout(() => setIsRunning(false), 2000);
    }
  }, [nodes, edges]);

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 text-white">
      {/* Agent Palette */}
      {showPalette && (
        <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-r border-slate-600/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Agent Palette</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowPalette(false)}
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Agents</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addNode('agent', 'AI Agent')}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  AI Agent
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addNode('human', 'Human Input')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Human Input
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Tools</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addNode('tool', 'Processing Tool')}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Processing Tool
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addNode('decision', 'Decision Point')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Decision Point
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div className="flex-1 relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {!showPalette && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPalette(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            onClick={runWorkflow}
            disabled={isRunning || nodes.length === 0}
            className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Workflow
              </>
            )}
          </Button>
          
          <div className="bg-slate-800/40 backdrop-blur-lg px-3 py-2 rounded text-sm">
            Nodes: {nodes.length} | Connections: {edges.length}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
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
            />
            <MiniMap 
              className="bg-slate-800/40 backdrop-blur-lg border border-cyan-400/20 shadow-lg rounded-xl"
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
                  Add agents and tools from the palette to create your multi-agent orchestration.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-l border-slate-600/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Properties</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedNode(null)}
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">Name</label>
              <p className="text-white">{selectedNode.data.label}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-300">Type</label>
              <p className="text-white capitalize">{selectedNode.type}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-300">ID</label>
              <p className="text-slate-400 text-sm font-mono">{selectedNode.id}</p>
            </div>
            
            <Button className="w-full">
              Configure {selectedNode.type}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};