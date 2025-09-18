
import React from 'react';
import { Database, GitMerge } from 'lucide-react';

interface GraphHeaderProps {
  nodeCount: number;
}

export const GraphHeader: React.FC<GraphHeaderProps> = ({ nodeCount }) => {
  const dataSourceCount = Math.floor(nodeCount / 3); // This would ideally come from actual data
  const transformationCount = nodeCount - dataSourceCount;
  
  return (
    <div className="absolute top-2 left-2 z-10 flex items-center space-x-2">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-900/40 rounded-md border border-purple-500/30">
        <Database size={12} className="text-purple-400" />
        <span className="text-xs text-purple-300">{dataSourceCount} Source{dataSourceCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-900/40 rounded-md border border-green-500/30">
        <GitMerge size={12} className="text-green-400" />
        <span className="text-xs text-green-300">{transformationCount} Transformation{transformationCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};
