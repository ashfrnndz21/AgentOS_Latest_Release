
import React, { useState } from 'react';
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { GraphNodeProps } from './types';
import { getRandomPercentage, getRandomTimeAgo } from './utils/nodeUtils';
import { NodeHeader } from './NodeHeader';
import { NodeOperationsList } from './NodeOperationsList';
import { NodeIndicators } from './NodeIndicators';
import { NodeTooltipContent } from './NodeTooltipContent';

export const GraphNode: React.FC<GraphNodeProps> = ({ 
  node, 
  nodeType, 
  isHovered, 
  isSelected, 
  nodeSize, 
  onMouseEnter, 
  onMouseLeave, 
  onClick,
  renderIcon 
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const isToolNode = node.type === 'tool';
  const isAlternateNode = node.type === 'alternate';
  const pulseEffect = isToolNode && !isSelected ? "animate-pulse-slow" : "";
  const floatEffect = isToolNode && !isSelected ? "animate-float" : "";
  
  // Mock data to show conversation indicator - in a real app, this would come from the node data
  const hasConversation = ['decision-1', 'decision-2', 'decision-3', 'tool-1'].includes(node.id);
  const hasGuardrailActivation = ['decision-2', 'tool-1'].includes(node.id);
  const hasOperations = node.operations && node.operations.length > 0;
  
  // Calculate the expanded height based on operations count
  const expandedHeight = nodeSize.height + (node.operations?.length || 0) * 25 + 10;
  
  // Get random data for demo
  const percentage = getRandomPercentage();
  const timeAgo = getRandomTimeAgo();
  
  // Define base node styles
  const nodeStyles = {
    left: node.position.x, 
    top: node.position.y, 
    width: nodeSize.width, 
    minHeight: expanded && hasOperations ? expandedHeight : nodeSize.height,
    backgroundColor: isAlternateNode ? 'rgba(245, 158, 11, 0.15)' : 
                     isToolNode ? `${nodeType.color}30` : 
                     `${nodeType.color}20`,
    borderColor: isAlternateNode ? 'rgb(245, 158, 11, 0.5)' : 
                 isToolNode ? 'rgba(139, 92, 246, 0.5)' : 
                 'rgba(107, 114, 128, 0.4)',
    zIndex: isSelected || isHovered ? 20 : (isToolNode ? 15 : 10),
    transition: 'height 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
  } as React.CSSProperties;
  
  // Add box shadow conditionally
  if (isSelected || isHovered) {
    nodeStyles.boxShadow = '0 0 15px rgba(255, 255, 255, 0.2)';
    nodeStyles.borderColor = isAlternateNode ? 'rgb(245, 158, 11)' : 
                             isToolNode ? 'rgba(139, 92, 246)' : 
                             'rgba(255, 255, 255, 0.7)';
  }
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Create icon container for reuse
  const iconContainer = (
    <div 
      className={`w-6 h-6 rounded-full flex items-center justify-center ${
        isToolNode ? 'ring-1 ring-purple-500/50' : ''
      }`}
      style={{ backgroundColor: nodeType.color }}
    >
      {renderIcon(nodeType.icon)}
    </div>
  );

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <div 
          className={`absolute rounded-md p-3 cursor-pointer transition-all duration-300 border backdrop-blur-sm ${
            isSelected 
              ? 'ring-1 ring-white/40' 
              : isHovered
                ? 'shadow-lg'
                : isToolNode 
                  ? 'shadow-[0_0_10px_rgba(139,92,246,0.15)]'
                  : ''
          } ${pulseEffect} ${floatEffect}`}
          style={nodeStyles}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="flex flex-col h-full justify-between">
            <NodeHeader 
              label={node.label}
              isToolNode={isToolNode}
              hasOperations={hasOperations}
              expanded={expanded}
              percentage={percentage}
              timeAgo={timeAgo}
              toggleExpand={toggleExpand}
              iconContainer={iconContainer}
            />
            
            {/* Operations list (only shown when expanded) */}
            {expanded && hasOperations && (
              <NodeOperationsList operations={node.operations || []} />
            )}
            
            <NodeIndicators 
              isToolNode={isToolNode}
              hasConversation={hasConversation}
              hasGuardrailActivation={hasGuardrailActivation}
              toolDetails={node.toolDetails}
            />
          </div>
        </div>
      </TooltipTrigger>
      
      <NodeTooltipContent 
        label={node.label}
        content={node.content}
        type={node.type}
        hasOperations={hasOperations}
        operationsCount={node.operations?.length}
        hasConversation={hasConversation}
        hasGuardrailActivation={hasGuardrailActivation}
      />
    </Tooltip>
  );
};
