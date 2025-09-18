
import React, { useState } from 'react';
import { GraphNode } from '../DecisionPath/GraphNode';
import { NodeType } from '../DecisionPath/types';
import { IconRenderer } from './IconRenderer';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NodesRendererProps {
  nodes: NodeType[];
  visualizationType: 'decision' | 'lineage' | 'combined';
  hoveredNode: string | null;
  selectedNode: string | null;
  nodeSize: { width: number; height: number };
  nodeTypes: {
    [key: string]: {
      color: string;
      icon: string;
    };
  };
  onNodeClick: (nodeId: string) => void;
  setHoveredNode: (nodeId: string | null) => void;
}

export const NodesRenderer: React.FC<NodesRendererProps> = ({
  nodes,
  visualizationType,
  hoveredNode,
  selectedNode,
  nodeSize,
  nodeTypes,
  onNodeClick,
  setHoveredNode
}) => {
  // Track expanded nodes
  const [expandedNodes, setExpandedNodes] = useState<{[key: string]: boolean}>({});
  
  const toggleNodeExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };
  
  return (
    <>
      {nodes.map((node: NodeType) => {
        const nodeType = nodeTypes[node.type] || { color: '#3B82F6', icon: 'Cpu' };
        const isNodeSelected = selectedNode === node.id;
        const isNodeHovered = hoveredNode === node.id;
        const isNodeExpanded = expandedNodes[node.id] || false;
        
        // Skip nodes that shouldn't be in this view
        if ((visualizationType === 'decision' && (node as any).isCombinedView) ||
            (visualizationType === 'lineage' && !((node as any).isCombinedView))) {
          return null;
        }
        
        return (
          <GraphNode 
            key={node.id}
            node={node}
            nodeType={nodeType}
            isHovered={isNodeHovered}
            isSelected={isNodeSelected}
            nodeSize={nodeSize}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => onNodeClick(node.id)}
            renderIcon={(iconName: string) => <IconRenderer iconName={iconName} />}
          />
        );
      })}
    </>
  );
};
