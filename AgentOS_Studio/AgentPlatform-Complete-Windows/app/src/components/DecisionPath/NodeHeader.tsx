
import React from 'react';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { getPercentageColor } from './utils/nodeUtils';

interface NodeHeaderProps {
  label: string;
  isToolNode: boolean;
  hasOperations: boolean;
  expanded: boolean;
  percentage: number;
  timeAgo: string;
  toggleExpand: (e: React.MouseEvent) => void;
  iconContainer: React.ReactNode;
}

export const NodeHeader: React.FC<NodeHeaderProps> = ({
  label,
  isToolNode,
  hasOperations,
  expanded,
  percentage,
  timeAgo,
  toggleExpand,
  iconContainer
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0">
        {iconContainer}
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-white truncate">
            {label}
          </span>
          
          {isToolNode && (
            <ChevronRight size={12} className="text-purple-300" />
          )}
        </div>
        
        {/* Performance indicators */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className={`font-semibold ${getPercentageColor(percentage)}`}>{percentage}%</span>
          <span className="text-gray-400">{timeAgo}</span>
        </div>
      </div>
      
      {hasOperations && (
        <button 
          className="ml-auto text-gray-300 hover:text-white transition-colors p-0.5"
          onClick={toggleExpand}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </div>
  );
};
