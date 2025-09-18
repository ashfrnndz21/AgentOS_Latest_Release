import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileOutput, CheckCircle } from 'lucide-react';

interface StrandsOutputNodeData {
  id: string;
  name: string;
  description?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
}

const StrandsOutputNode: React.FC<NodeProps<StrandsOutputNodeData>> = ({ data, selected }) => {
  return (
    <div className="strands-output-node relative">
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
          <div className="p-2 rounded-lg bg-green-500/20">
            <FileOutput className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{data.name}</h3>
            <p className="text-xs text-gray-400">Final Output</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-400" />
            <span className="text-xs text-green-300">Workflow Result</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(StrandsOutputNode);