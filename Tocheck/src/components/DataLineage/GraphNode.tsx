
import React, { useState } from 'react';
import { Database, Wrench, GitMerge, FileText, MessageSquare, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NodeType, NodeTypeStyles } from './types';

interface GraphNodeProps {
  node: NodeType;
  isHovered: boolean;
  nodeType: NodeTypeStyles;
  nodeSize: { width: number; height: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void;
}

export const GraphNode: React.FC<GraphNodeProps> = ({ 
  node, 
  isHovered, 
  nodeType, 
  nodeSize,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Check if node has conversation or operations
  const hasConversation = node.id.startsWith('lineage-');
  const hasGuardrailActivation = node.id === 'lineage-1' || node.id === 'lineage-3';
  const hasOperations = node.operations && node.operations.length > 0;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database':
        return <Database size={16} />;
      case 'Wrench':
        return <Wrench size={16} />;
      case 'GitMerge':
        return <GitMerge size={16} />;
      case 'FileText':
        return <FileText size={16} />;
      default:
        return <Database size={16} />;
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  // Calculate the expanded height based on operations count
  const expandedHeight = nodeSize.height + (node.operations?.length || 0) * 25 + 10;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`absolute rounded-lg p-2 cursor-pointer transition-all duration-300 border-[1.5px] backdrop-blur-sm ${
              isHovered 
                ? 'border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'border-gray-600/40 hover:border-white/30'
            }`}
            style={{
              left: node.position.x, 
              top: node.position.y, 
              width: nodeSize.width, 
              height: expanded && hasOperations ? expandedHeight : nodeSize.height,
              backgroundColor: `${nodeType.color}20`,
              zIndex: isHovered ? 20 : 10,
              transition: 'height 0.3s ease-in-out'
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: nodeType.color }}
                >
                  {renderIcon(nodeType.icon)}
                </div>
                <span className="text-xs font-medium text-white truncate">
                  {node.label}
                </span>
                
                {hasOperations && (
                  <button 
                    className="ml-auto text-gray-300 hover:text-white transition-colors p-0.5"
                    onClick={toggleExpand}
                  >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>
              
              <div className="text-[10px] text-gray-300 line-clamp-2 mt-1">
                {node.content}
              </div>
              
              {/* Operations list (only shown when expanded) */}
              {expanded && hasOperations && (
                <div className="mt-3 pt-2 border-t border-white/10 space-y-2 overflow-y-auto max-h-40">
                  {node.operations?.map((op, index) => (
                    <div key={index} className="text-[10px] bg-black/20 rounded p-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{op.name}</span>
                        {op.executionTime && (
                          <span className="text-[8px] text-gray-400 flex items-center">
                            <Clock size={8} className="mr-0.5" /> {op.executionTime}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 mt-0.5">{op.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Conversation indicator */}
              {hasConversation && (
                <div className="flex items-center text-[9px] border-t border-white/10 pt-1 mt-1">
                  <MessageSquare size={8} className={`${hasGuardrailActivation ? 'text-amber-300' : 'text-blue-300'} mr-0.5`} />
                  <span className={hasGuardrailActivation ? 'text-amber-300' : 'text-blue-300'}>
                    {hasGuardrailActivation ? 'Guardrail' : 'Chat'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-gray-900/90 border-gray-700">
          <div className="text-sm font-medium text-white">{node.label}</div>
          <div className="text-xs text-gray-300 mt-1 max-w-xs break-words">{node.content}</div>
          <div className="text-xs text-blue-300 mt-1">{node.type.replace('_', ' ')}</div>
          {hasOperations && (
            <div className="text-xs text-green-300 mt-1">{node.operations?.length} operations</div>
          )}
          {hasConversation && (
            <div className="text-xs text-blue-300 mt-1">Click to view conversation history</div>
          )}
          {hasGuardrailActivation && (
            <div className="text-xs text-amber-300 mt-1">Guardrail was activated</div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
