
import React from 'react';
import { EdgeType, NodeType } from './types';
import { getPathProperties } from '../DecisionPath/utils/pathUtils';

interface EdgePathProps {
  edge: EdgeType;
  nodes: NodeType[];
  hoveredNode: string | null;
  nodeSize: { width: number; height: number };
}

export const EdgePath: React.FC<EdgePathProps> = ({ 
  edge, 
  nodes, 
  hoveredNode,
  nodeSize 
}) => {
  const path = getPathProperties(edge, nodes, hoveredNode, nodeSize);
  
  if (!path) return null;
  
  // Determine style based on edge type for better visual differentiation
  const edgeStyle = edge.type === 'dependency' 
    ? { strokeDasharray: "5,5" } 
    : edge.type === 'transformation'
    ? { strokeWidth: path.isHighlighted ? "3" : "2" }
    : {};
  
  return (
    <path 
      key={`${edge.source}-${edge.target}`}
      d={path.pathD}
      fill="none" 
      stroke={path.isHighlighted ? "#4F8FFF" : "#666666"} 
      strokeWidth={path.isHighlighted ? "2.5" : "1.5"}
      strokeDasharray={edge.type === 'dependency' ? "5,5" : "none"}
      className="transition-all duration-200"
      markerEnd={path.isHighlighted ? "url(#arrowhead-lineage-highlight)" : "url(#arrowhead-lineage)"}
      style={{
        filter: path.isHighlighted ? "drop-shadow(0 0 2px rgba(79, 143, 255, 0.5))" : "none",
        ...edgeStyle
      }}
    />
  );
};
