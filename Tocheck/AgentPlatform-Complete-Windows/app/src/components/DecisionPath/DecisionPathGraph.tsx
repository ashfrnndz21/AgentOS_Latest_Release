
import React, { useState, useEffect } from 'react';
import { Play, GitBranch, Wrench, Cpu, AlertTriangle, MessageSquare, Info, Database } from 'lucide-react';
import { ArrowMarkers } from './ArrowMarkers';
import { GraphHeader } from './GraphHeader';
import { GraphLegend } from './GraphLegend';
import { GraphNode } from './GraphNode';
import { PathDrawing } from './PathDrawing';
import { DecisionPathGraphProps } from './types';
import { getPulseEffect } from './utils/pathUtils';

export const DecisionPathGraph: React.FC<DecisionPathGraphProps> = ({ 
  nodes, 
  metadata,
  onNodeClick,
  selectedNode,
  highlightGuardrails = true
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showToolTips, setShowToolTips] = useState(true);
  const [animatedPaths, setAnimatedPaths] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (hoveredNode) {
      const connectedPaths: {[key: string]: boolean} = {};
      nodes.forEach(node => {
        if (node.id === hoveredNode) {
          node.connects.forEach(targetId => {
            connectedPaths[`${node.id}-${targetId}`] = true;
          });
        }
        
        if (node.connects.includes(hoveredNode)) {
          connectedPaths[`${node.id}-${hoveredNode}`] = true;
        }
      });
      
      setAnimatedPaths(connectedPaths);
    } else if (selectedNode) {
      const connectedPaths: {[key: string]: boolean} = {};
      nodes.forEach(node => {
        if (node.id === selectedNode) {
          node.connects.forEach(targetId => {
            connectedPaths[`${node.id}-${targetId}`] = true;
          });
        }
        
        if (node.connects.includes(selectedNode)) {
          connectedPaths[`${node.id}-${selectedNode}`] = true;
        }
      });
      
      setAnimatedPaths(connectedPaths);
    } else {
      setAnimatedPaths({});
    }
  }, [hoveredNode, selectedNode, nodes]);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Play':
        return <Play size={16} />;
      case 'GitBranch':
        return <GitBranch size={16} />;
      case 'Wrench':
        return <Wrench size={16} />;
      case 'Cpu':
        return <Cpu size={16} />;
      case 'AlertTriangle':
        return <AlertTriangle size={16} />;
      case 'MessageSquare':
        return <MessageSquare size={16} />;
      case 'Database':
        return <Database size={16} />;
      case 'Info':
        return <Info size={16} />;
      default:
        return <Cpu size={16} />;
    }
  };

  const toolNodes = nodes.filter(node => node.type === 'tool');

  return (
    <div className="w-full h-full overflow-hidden relative" style={{ minHeight: metadata.height + 'px' }}>
      <GraphHeader toolCount={toolNodes.length} />
      
      <svg 
        width="100%" 
        height="100%" 
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
        viewBox={`0 0 ${metadata.width} ${metadata.height}`}
        preserveAspectRatio="xMinYMin meet"
      >
        <ArrowMarkers />
        <PathDrawing 
          nodes={nodes} 
          hoveredNode={hoveredNode} 
          selectedNode={selectedNode} 
          animatedPaths={animatedPaths}
          nodeSize={metadata.nodeSize}
        />
      </svg>
      
      {nodes.map(node => {
        const nodeType = metadata.nodeTypes[node.type] || { color: '#3B82F6', icon: 'Cpu' };
        const isNodeSelected = selectedNode === node.id;
        const isNodeHovered = hoveredNode === node.id;
        const isToolNode = node.type === 'tool';
        
        return (
          <GraphNode 
            key={node.id}
            node={node}
            nodeType={nodeType}
            isHovered={isNodeHovered}
            isSelected={isNodeSelected}
            nodeSize={metadata.nodeSize}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => onNodeClick(node.id)}
            renderIcon={renderIcon}
          />
        );
      })}
      
      <GraphLegend nodeTypes={metadata.nodeTypes} />
    </div>
  );
};
