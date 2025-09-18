import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Square, Settings, Users, Bot, Zap } from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'agent' | 'tool' | 'decision' | 'human';
  name: string;
  position: { x: number; y: number };
  config: any;
}

interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  type: 'data' | 'control';
}

export const FunctionalBlankWorkspace = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showPalette, setShowPalette] = useState(true);

  const addNode = useCallback((type: WorkflowNode['type'], name: string) => {
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type,
      name,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      config: {}
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  const runWorkflow = useCallback(async () => {
    setIsRunning(true);
    
    try {
      // Call backend API to execute workflow
      const response = await fetch('http://localhost:5052/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          connections,
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
  }, [nodes, connections]);

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
            Nodes: {nodes.length} | Connections: {connections.length}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="h-full p-8 pt-20 overflow-auto">
          {nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
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
          ) : (
            <div className="relative">
              {nodes.map((node) => (
                <Card
                  key={node.id}
                  className={`absolute w-48 cursor-pointer transition-all duration-200 ${
                    selectedNode?.id === node.id 
                      ? 'border-purple-400 shadow-lg shadow-purple-400/20' 
                      : 'border-slate-600/30 hover:border-slate-500/50'
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                  }}
                  onClick={() => setSelectedNode(node)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {node.type === 'agent' && <Bot className="w-4 h-4" />}
                      {node.type === 'human' && <Users className="w-4 h-4" />}
                      {node.type === 'tool' && <Zap className="w-4 h-4" />}
                      {node.type === 'decision' && <Settings className="w-4 h-4" />}
                      {node.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Badge variant="outline" className="text-xs">
                      {node.type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
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
              <p className="text-white">{selectedNode.name}</p>
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