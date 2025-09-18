import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ArrowRight, Users, Zap } from 'lucide-react';

interface StrandsHandoffNodeData {
  id: string;
  name: string;
  description?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
}

const StrandsHandoffNode: React.FC<NodeProps<StrandsHandoffNodeData>> = ({ data, selected }) => {
  return (
    <div className="strands-handoff-node relative">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-400"
        style={{ left: -6 }}
      />

      <div className={`
        bg-gray-800/90 backdrop-blur-sm border-2 border-gray-600 rounded-xl p-4 min-w-[160px]
        transition-all duration-200 hover:shadow-lg
        ${selected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
      `}>
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <ArrowRight className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{data.label || data.name || 'Handoff'}</h3>
            <p className="text-xs text-gray-400">Agent Handoff</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-2">
            <Users className="h-3 w-3 text-blue-400" />
            <span className="text-xs text-blue-300">Context Transfer</span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-400"
        style={{ right: -6 }}
      />
    </div>
  );
};

export default memo(StrandsHandoffNode);