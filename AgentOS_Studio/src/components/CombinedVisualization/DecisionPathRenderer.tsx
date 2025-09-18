
import React from 'react';
import { NodeType } from '../DecisionPath/types';
import { drawPath } from '../DecisionPath/utils/pathUtils';

interface DecisionPathRendererProps {
  nodes: NodeType[];
  hoveredNode: string | null;
  selectedNode: string | null;
  animatedPaths: {[key: string]: boolean};
  nodeSize: { width: number; height: number };
}

export const DecisionPathRenderer: React.FC<DecisionPathRendererProps> = ({
  nodes,
  hoveredNode,
  selectedNode,
  animatedPaths,
  nodeSize
}) => {
  return (
    <>
      {nodes.map(node => 
        node.connects.map(targetId => {
          const path = drawPath(node, targetId, nodes, hoveredNode, selectedNode, animatedPaths, nodeSize);
          if (!path) return null;
          
          const strokeWidth = path.isToolConnection 
            ? (path.pathHighlighted ? "3.5" : "2.5") 
            : (path.pathHighlighted ? "2.5" : "1.5");
            
          const strokeColor = path.isToolConnection 
            ? (path.pathHighlighted ? "#A78BFA" : "#9C6EFF40") 
            : (path.pathHighlighted ? "#FFFFFF" : "#666666");
          
          const markerEnd = path.isToolConnection 
            ? (path.pathHighlighted ? "url(#arrowhead-highlight)" : "url(#arrowhead-purple)") 
            : "url(#arrowhead)";
          
          return (
            <g key={`${path.pathId}-${Math.random().toString(36).substring(7)}`}>
              <path 
                d={path.pathD} 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth={strokeWidth}
                strokeDasharray={path.isAlternatePath ? "5,5" : path.isAnimated ? "12,12" : "none"} 
                strokeDashoffset={path.isAnimated ? "24" : "0"}
                className={`transition-all duration-200 ${path.isAnimated ? 'animate-connection-flow' : ''}`}
                markerEnd={markerEnd}
                style={{
                  filter: path.pathHighlighted ? "drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))" : "none"
                }}
              />
            </g>
          );
        })
      )}
    </>
  );
};
