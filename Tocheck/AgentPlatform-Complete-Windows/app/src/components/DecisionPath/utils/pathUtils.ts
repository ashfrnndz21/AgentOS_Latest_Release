
import { NodeType, PathProperties } from '../types';

export const drawPath = (
  sourceNode: NodeType, 
  targetId: string, 
  nodes: NodeType[], 
  hoveredNode: string | null,
  selectedNode: string | null,
  animatedPaths: {[key: string]: boolean},
  nodeSize: { width: number; height: number }
): PathProperties | null => {
  const targetNode = nodes.find(node => node.id === targetId);
  if (!targetNode) return null;
  
  // Calculate connection points on the edges of the nodes
  const sourceRight = sourceNode.position.x + nodeSize.width;
  const sourceCenter = sourceNode.position.y + nodeSize.height / 2;
  const targetLeft = targetNode.position.x;
  const targetCenter = targetNode.position.y + nodeSize.height / 2;
  
  // Exact connection points
  const startX = sourceRight;
  const startY = sourceCenter;
  const endX = targetLeft;
  const endY = targetCenter;
  
  // Calculate distance for bezier curve control points
  const distance = Math.abs(endX - startX);
  // Optimize control point distance based on spacing between nodes
  const controlPointOffset = Math.min(150, Math.max(80, distance / 3));
  
  const pathId = `${sourceNode.id}-${targetId}`;
  const isAnimated = animatedPaths[pathId] || false;
  const isAlternatePath = targetNode.type === 'alternate';
  
  // Create a bezier curve path with smooth control points
  let pathD = `M${startX} ${startY} C${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;
  
  const pathHighlighted = 
    hoveredNode === sourceNode.id || 
    hoveredNode === targetId || 
    selectedNode === sourceNode.id || 
    selectedNode === targetId;
  
  const isToolConnection = sourceNode.type === 'tool' || targetNode.type === 'tool';
  
  return {
    pathD,
    pathId,
    isAnimated,
    isAlternatePath,
    pathHighlighted,
    isToolConnection
  };
};

export const getPathProperties = (
  edge: any, 
  nodes: any[], 
  hoveredNode: string | null,
  nodeSize: { width: number; height: number }
) => {
  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);
  
  if (!sourceNode || !targetNode) return null;
  
  // Calculate the connection points at the edges of the nodes
  const sourceRight = sourceNode.position.x + nodeSize.width;
  const sourceCenter = sourceNode.position.y + nodeSize.height / 2;
  const targetLeft = targetNode.position.x;
  const targetCenter = targetNode.position.y + nodeSize.height / 2;
  
  // Exact connection points
  const startX = sourceRight;
  const startY = sourceCenter;
  const endX = targetLeft;
  const endY = targetCenter;
  
  // Calculate optimal curve control points based on distance
  const distance = Math.abs(endX - startX);
  const controlPointOffset = Math.min(150, Math.max(80, distance / 3));
  
  // Create a smooth bezier curve path 
  let pathD = `M${startX} ${startY} C${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;
  
  // Check if this path should be highlighted (if source or target node is hovered)
  const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
  
  return {
    pathD,
    isHighlighted
  };
};

export const getPulseEffect = (isToolNode: boolean, isSelected: boolean): string => {
  if (isToolNode && !isSelected) {
    return "animate-pulse-slow";
  }
  return "";
};

// Combined view utility to toggle between visualization types
export const combineGraphNodes = (
  decisionNodes: any[],
  lineageNodes: any[],
  lineageEdges: any[],
  combinedType: 'decision' | 'lineage' | 'combined',
  verticalSpacing: number = 200
) => {
  if (combinedType === 'decision') {
    return { 
      nodes: decisionNodes, 
      edges: [] 
    };
  }
  
  if (combinedType === 'lineage') {
    return { 
      nodes: lineageNodes, 
      edges: lineageEdges 
    };
  }
  
  // For combined view, we'll position lineage nodes below decision nodes
  const combinedNodes = [...decisionNodes];
  
  // Improved positioning for lineage nodes to ensure proper arrow alignment
  const modifiedLineageNodes = lineageNodes.map(node => {
    // Calculate a horizontal position based on where connection targets might be
    const decisionNodeConnections = decisionNodes.filter(
      dNode => dNode.type === 'tool' || dNode.type === 'alternate'
    );
    
    // Base horizontal positioning - create a more balanced layout
    const baseX = node.position.x + 70; 
    
    return {
      ...node,
      position: {
        x: baseX,
        y: node.position.y + verticalSpacing
      },
      isCombinedView: true
    };
  });
  
  combinedNodes.push(...modifiedLineageNodes);
  
  // Adjust lineage edges for the new positions
  const modifiedEdges = lineageEdges.map(edge => ({
    ...edge,
    isCombinedView: true
  }));
  
  // Create connections between decision nodes and lineage nodes
  const crossEdges = [];
  
  // Create targeted connections between decision and data nodes
  decisionNodes.forEach(decisionNode => {
    if (decisionNode.type === 'tool') {
      // Find related data nodes with more specific targeting
      const relatedDataNodes = lineageNodes.filter(
        dataNode => dataNode.type === 'data_source' || dataNode.type === 'transformation'
      );
      
      if (relatedDataNodes.length > 0) {
        // Connect to the most relevant data node
        const dataNode = relatedDataNodes[0];
        crossEdges.push({
          source: decisionNode.id,
          target: dataNode.id,
          type: 'cross_connection',
          isCombinedView: true
        });
      }
    }
  });
  
  // Add crossedges from alternate paths to outputs
  decisionNodes.forEach(decisionNode => {
    if (decisionNode.type === 'alternate') {
      // Find output nodes
      const outputNodes = lineageNodes.filter(
        dataNode => dataNode.type === 'output'
      );
      
      if (outputNodes.length > 0) {
        // Connect alternate decision paths to output nodes
        crossEdges.push({
          source: decisionNode.id,
          target: outputNodes[0].id,
          type: 'alternate_connection',
          isCombinedView: true
        });
      }
    }
  });
  
  return {
    nodes: combinedNodes,
    edges: [...modifiedEdges, ...crossEdges]
  };
};
