import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export const DecisionNode = ({ data, selected }: any) => {
  return (
    <div className={`bg-amber-900/30 border-2 rounded-lg p-4 min-w-[160px] ${
      selected ? 'border-amber-400' : 'border-amber-600'
    } hover:border-amber-400/70 transition-colors`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-amber-400 border-2 border-white"
      />
      
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className="h-5 w-5 text-amber-400" />
        <h3 className="text-white font-medium text-sm">{data.label || 'Decision'}</h3>
      </div>
      
      <div className="text-xs text-gray-300 mb-3">
        <span>Conditional routing based on criteria</span>
      </div>
      
      <div className="flex justify-between">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="w-3 h-3 bg-green-400 border-2 border-white"
          style={{ left: '25%' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="w-3 h-3 bg-red-400 border-2 border-white"
          style={{ left: '75%' }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>True</span>
        <span>False</span>
      </div>
    </div>
  );
};