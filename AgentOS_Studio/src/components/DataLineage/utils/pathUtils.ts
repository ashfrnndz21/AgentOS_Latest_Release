
import { EdgeType, NodeType } from '../types';

export const getPathProperties = (
  edge: EdgeType, 
  nodes: NodeType[], 
  hoveredNode: string | null,
  nodeSize: { width: number; height: number }
) => {
  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);
  
  if (!sourceNode || !targetNode) return null;
  
  // Calculate the connection points at the edges of the nodes
  const startX = sourceNode.position.x + nodeSize.width;
  const startY = sourceNode.position.y + nodeSize.height / 2;
  
  const endX = targetNode.position.x;
  const endY = targetNode.position.y + nodeSize.height / 2;
  
  // More generous offset for smoother curves
  const controlPointOffset = Math.min(150, Math.max(80, (endX - startX) / 2));
  
  // Create a bezier curve path
  let pathD = `M${startX} ${startY} C${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;
  
  // Check if this path should be highlighted (if source or target node is hovered)
  const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
  
  return {
    pathD,
    isHighlighted
  };
};
