import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Square, Download, Upload, Settings } from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: any[];
  connections: any[];
  onNodesChange: (nodes: any[]) => void;
  onConnectionsChange: (connections: any[]) => void;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange,
  isRunning,
  onRun,
  onStop
}) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const exportWorkflow = useCallback(() => {
    const workflow = {
      nodes,
      connections,
      metadata: {
        name: 'Untitled Workflow',
        created: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, connections]);

  return (
    <div className="h-full relative bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-purple-900/50">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          onClick={isRunning ? onStop : onRun}
          className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          disabled={nodes.length === 0}
        >
          {isRunning ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isRunning ? 'Stop' : 'Run'}
        </Button>
        
        <Button variant="outline" onClick={exportWorkflow} disabled={nodes.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
        
        <div className="bg-slate-800/40 backdrop-blur-lg px-3 py-2 rounded text-sm text-slate-300">
          Nodes: {nodes.length} | Connections: {connections.length}
        </div>
      </div>

      {/* Canvas Grid */}
      <div 
        className="h-full w-full"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(100, 200, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      >
        {/* Render nodes */}
        <div className="relative h-full p-8 pt-20">
          {nodes.map((node) => (
            <Card
              key={node.id}
              className={`absolute w-48 cursor-pointer transition-all duration-200 ${
                selectedNode?.id === node.id 
                  ? 'border-purple-400 shadow-lg shadow-purple-400/20' 
                  : 'border-slate-600/30 hover:border-slate-500/50'
              }`}
              style={{
                left: node.position?.x || 0,
                top: node.position?.y || 0,
              }}
              onClick={() => setSelectedNode(node)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{node.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-slate-400">{node.type}</div>
                {isRunning && (
                  <div className="mt-2">
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div className="bg-green-400 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};