import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, HardDrive } from 'lucide-react';

export const MemoryNode = ({ data, selected }: any) => {
  return (
    <div className={`bg-green-900/30 border-2 rounded-lg p-4 min-w-[160px] ${
      selected ? 'border-green-400' : 'border-green-600'
    } hover:border-green-400/70 transition-colors`}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-400 border-2 border-white"
      />
      
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-5 w-5 text-green-400" />
        <h3 className="text-white font-medium text-sm">{data.label || 'Memory'}</h3>
      </div>
      
      <div className="space-y-2 text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <HardDrive className="h-3 w-3" />
          <span>{data.memoryType || 'short-term'}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Size:</span>
          <span>{data.memorySize || 100}MB</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <span className="text-gray-400">45% used</span>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-400 border-2 border-white"
      />
    </div>
  );
};