
import React, { useState } from 'react';
import { GraphNode } from './GraphNode';
import { EdgePath } from './EdgePath';
import { ArrowMarkers } from './ArrowMarkers';
import { GraphLegend } from './GraphLegend';
import { GraphHeader } from './GraphHeader';
import { DataLineageGraphProps } from './types';

export const DataLineageGraph: React.FC<DataLineageGraphProps> = ({ 
  nodes, 
  edges,
  metadata,
  onNodeClick
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const handleNodeClick = (nodeId: string) => {
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  };

  return (
    <div className="w-full h-full overflow-hidden relative" style={{ minHeight: metadata.height + 'px' }}>
      <GraphHeader nodeCount={nodes.length} />
      
      <svg 
        width="100%" 
        height="100%" 
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
        viewBox={`0 0 ${metadata.width} ${metadata.height}`}
        preserveAspectRatio="xMinYMin meet"
      >
        <ArrowMarkers />
        
        {edges.map(edge => (
          <EdgePath 
            key={`${edge.source}-${edge.target}-${Math.random().toString(36).substring(7)}`}
            edge={edge}
            nodes={nodes}
            hoveredNode={hoveredNode}
            nodeSize={metadata.nodeSize}
          />
        ))}
      </svg>
      
      {nodes.map(node => {
        const nodeType = metadata.nodeTypes[node.type] || { color: '#3B82F6', icon: 'Database' };
        const isNodeHovered = hoveredNode === node.id;
        
        return (
          <GraphNode 
            key={node.id}
            node={node}
            isHovered={isNodeHovered}
            nodeType={nodeType}
            nodeSize={metadata.nodeSize}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => handleNodeClick(node.id)}
          />
        );
      })}
      
      <GraphLegend />
    </div>
  );
};
