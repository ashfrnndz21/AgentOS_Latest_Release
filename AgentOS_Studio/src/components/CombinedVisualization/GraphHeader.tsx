
import React from 'react';
import { Wrench, Shield, Database, GitMerge } from 'lucide-react';

interface GraphHeaderProps {
  toolCount: number;
  nodeCount: number;
  visualizationType: 'decision' | 'lineage' | 'combined';
}

export const GraphHeader: React.FC<GraphHeaderProps> = ({ 
  toolCount, 
  nodeCount, 
  visualizationType 
}) => {
  const dataSourceCount = Math.floor(nodeCount / 3); // This would ideally come from actual data
  const transformationCount = nodeCount - dataSourceCount;
  
  return (
    <div className="absolute top-2 left-2 z-10 flex items-center space-x-2">
      {(visualizationType === 'decision' || visualizationType === 'combined') && (
        <>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-900/50 rounded-md border border-purple-500/40 shadow-md">
            <Wrench size={14} className="text-purple-300" />
            <span className="text-xs font-medium text-purple-200">{toolCount} Tool{toolCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-900/50 rounded-md border border-amber-500/40 shadow-md">
            <Shield size={14} className="text-amber-300" />
            <span className="text-xs font-medium text-amber-200">Guardrails Active</span>
          </div>
        </>
      )}
      
      {(visualizationType === 'lineage' || visualizationType === 'combined') && (
        <>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-900/50 rounded-md border border-blue-500/40 shadow-md">
            <Database size={14} className="text-blue-300" />
            <span className="text-xs font-medium text-blue-200">{dataSourceCount} Source{dataSourceCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-900/50 rounded-md border border-green-500/40 shadow-md">
            <GitMerge size={14} className="text-green-300" />
            <span className="text-xs font-medium text-green-200">{transformationCount} Transformation{transformationCount !== 1 ? 's' : ''}</span>
          </div>
        </>
      )}
    </div>
  );
};
