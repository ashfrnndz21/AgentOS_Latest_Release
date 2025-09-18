
import React from 'react';
import { NodeType } from '../DecisionPath/types';
import { getPathProperties } from '../DecisionPath/utils/pathUtils';

interface DataLineageRendererProps {
  edges: any[];
  nodes: NodeType[];
  hoveredNode: string | null;
  nodeSize: { width: number; height: number };
}

export const DataLineageRenderer: React.FC<DataLineageRendererProps> = ({
  edges,
  nodes,
  hoveredNode,
  nodeSize
}) => {
  return (
    <>
      {edges.map((edge: any) => {
        // Skip if not a data lineage edge
        if (!edge.source || !edge.target) return null;
        
        const path = getPathProperties(edge, nodes, hoveredNode, nodeSize);
        if (!path) return null;
        
        // Enhanced styling for different edge types
        const strokeStyle = edge.type === 'cross_connection'
          ? {
              stroke: "#A78BFA",
              strokeWidth: "2",
              strokeDasharray: "5,5"
            }
          : edge.type === 'alternate_connection'
          ? {
              stroke: "#F59E0B",
              strokeWidth: "2",
              strokeDasharray: "5,5"
            }
          : {
              stroke: path.isHighlighted ? "#4F8FFF" : "#666666",
              strokeWidth: path.isHighlighted ? "2.5" : "1.5",
              strokeDasharray: edge.type === 'dependency' ? "5,5" : "none"
            };
        
        return (
          <path 
            key={`${edge.source}-${edge.target}-${Math.random().toString(36).substring(7)}`}
            d={path.pathD}
            fill="none" 
            stroke={strokeStyle.stroke}
            strokeWidth={strokeStyle.strokeWidth}
            strokeDasharray={strokeStyle.strokeDasharray}
            className="transition-all duration-200"
            markerEnd={path.isHighlighted ? "url(#arrowhead-lineage-highlight)" : "url(#arrowhead-lineage)"}
            style={{
              filter: path.isHighlighted ? "drop-shadow(0 0 2px rgba(79, 143, 255, 0.5))" : "none"
            }}
          />
        );
      })}
    </>
  );
};
