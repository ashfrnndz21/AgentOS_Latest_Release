
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network } from 'lucide-react';
import { DecisionPathGraph } from '@/components/DecisionPath';
import { mockOperations } from './mocks';

interface GraphVisualizerProps {
  decisionNodes: any[];
  lineageNodes: any[];
  lineageEdges: any[];
  decisionPathMetadata: any;
  dataLineageMetadata: any;
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  decisionNodes,
  lineageNodes,
  lineageEdges,
  decisionPathMetadata,
  dataLineageMetadata,
  selectedNode,
  onNodeClick
}) => {
  const handleNodeClick = (nodeId: string) => {
    console.log("Node clicked in GraphVisualizer:", nodeId);
    onNodeClick(nodeId);
  };

  return (
    <Card className="bg-beam-dark/70 border border-gray-700/30 overflow-hidden">
      <CardHeader className="p-3 border-b border-gray-700/30 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Network size={16} className="text-purple-400" />
          <CardTitle className="text-md font-medium text-white">Agentic Decision Path</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 overflow-hidden">
        <div className="h-[550px] relative" style={{
          background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.15) 0%, rgba(30, 27, 75, 0.05) 70%)'
        }}>
          <DecisionPathGraph 
            nodes={decisionNodes.map(node => ({
              ...node,
              operations: mockOperations[node.id]
            }))} 
            metadata={{
              ...decisionPathMetadata,
              // Adjust node size to match reference design
              nodeSize: {
                width: 180,
                height: 68
              }
            }}
            onNodeClick={handleNodeClick}
            selectedNode={selectedNode}
            highlightGuardrails={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};
