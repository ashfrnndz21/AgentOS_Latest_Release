
import React, { useState, useEffect } from 'react';
import { ArrowMarkers } from '../DecisionPath/ArrowMarkers';
import { GraphLegend } from './GraphLegend';
import { GraphHeader } from './GraphHeader';
import { combineGraphNodes } from '../DecisionPath/utils/pathUtils';
import { ViewSelectorTabs } from './ViewSelectorTabs';
import { DecisionPathRenderer } from './DecisionPathRenderer';
import { DataLineageRenderer } from './DataLineageRenderer';
import { NodesRenderer } from './NodesRenderer';
import { NodeType } from '../DecisionPath/types';

export interface CombinedVisualizationGraphProps {
  decisionNodes: NodeType[];
  lineageNodes: any[];
  lineageEdges: any[];
  metadata: {
    width: number;
    height: number;
    nodeSize: {
      width: number;
      height: number;
    };
    nodeTypes: {
      [key: string]: {
        color: string;
        icon: string;
      };
    };
  };
  onNodeClick: (nodeId: string) => void;
  selectedNode: string | null;
  highlightGuardrails?: boolean;
}

export const CombinedVisualizationGraph: React.FC<CombinedVisualizationGraphProps> = ({
  decisionNodes,
  lineageNodes,
  lineageEdges,
  metadata,
  onNodeClick,
  selectedNode,
  highlightGuardrails = true
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [visualizationType, setVisualizationType] = useState<'decision' | 'lineage' | 'combined'>('decision');
  const [animatedPaths, setAnimatedPaths] = useState<{[key: string]: boolean}>({});
  
  // Combine nodes based on visualization type
  const { nodes, edges } = combineGraphNodes(
    decisionNodes, 
    lineageNodes, 
    lineageEdges, 
    visualizationType,
    metadata.height / 1.5
  );
  
  // Handle animated paths for decision path visualization
  useEffect(() => {
    if (visualizationType !== 'lineage') {
      if (hoveredNode) {
        const connectedPaths: {[key: string]: boolean} = {};
        decisionNodes.forEach(node => {
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
        decisionNodes.forEach(node => {
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
    }
  }, [hoveredNode, selectedNode, decisionNodes, visualizationType]);
  
  // Get tool count for the header
  const toolNodes = decisionNodes.filter(node => node.type === 'tool');
  
  // Custom SVG viewBox based on visualization type
  const viewBoxHeight = visualizationType === 'combined' 
    ? metadata.height * 2 
    : metadata.height;
  
  return (
    <div className="w-full h-full overflow-hidden relative" style={{ 
      minHeight: visualizationType === 'combined' ? metadata.height * 2 + 'px' : metadata.height + 'px',
      background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.15) 0%, rgba(30, 27, 75, 0.05) 70%)'
    }}>
      <ViewSelectorTabs 
        visualizationType={visualizationType}
        setVisualizationType={setVisualizationType}
      />
      
      <GraphHeader 
        toolCount={toolNodes.length}
        visualizationType={visualizationType}
        nodeCount={lineageNodes.length}
      />
      
      <svg 
        width="100%" 
        height="100%" 
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
        viewBox={`0 0 ${metadata.width} ${viewBoxHeight}`}
        preserveAspectRatio="xMinYMin meet"
      >
        <ArrowMarkers />
        
        {/* Decision Path connections */}
        {visualizationType !== 'lineage' && (
          <DecisionPathRenderer 
            nodes={nodes}
            hoveredNode={hoveredNode}
            selectedNode={selectedNode}
            animatedPaths={animatedPaths}
            nodeSize={metadata.nodeSize}
          />
        )}
        
        {/* Data Lineage connections */}
        {visualizationType !== 'decision' && (
          <DataLineageRenderer 
            edges={edges} 
            nodes={nodes} 
            hoveredNode={hoveredNode} 
            nodeSize={metadata.nodeSize} 
          />
        )}
      </svg>
      
      {/* Render all nodes */}
      <NodesRenderer 
        nodes={nodes}
        visualizationType={visualizationType}
        hoveredNode={hoveredNode}
        selectedNode={selectedNode}
        nodeSize={metadata.nodeSize}
        nodeTypes={metadata.nodeTypes}
        onNodeClick={onNodeClick}
        setHoveredNode={setHoveredNode}
      />
      
      <GraphLegend 
        nodeTypes={metadata.nodeTypes} 
        visualizationType={visualizationType} 
      />
    </div>
  );
};
