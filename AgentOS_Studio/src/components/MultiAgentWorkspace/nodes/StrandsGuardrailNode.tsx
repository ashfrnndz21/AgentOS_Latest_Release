import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Shield, AlertTriangle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface StrandsGuardrailNodeData {
  id: string;
  name: string;
  description?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  icon?: string;
  color?: string;
}

const StrandsGuardrailNode: React.FC<NodeProps<StrandsGuardrailNodeData>> = ({ data, selected }) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <Clock className="h-4 w-4 text-red-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return 'border-red-400 shadow-red-400/50';
      case 'completed':
        return 'border-green-400 shadow-green-400/50';
      case 'error':
        return 'border-red-400 shadow-red-400/50';
      default:
        return 'border-gray-600';
    }
  };

  return (
    <div className="strands-guardrail-node relative">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-400 hover:bg-gray-500"
        style={{ left: -6 }}
      />

      <div className={`
        bg-gray-800/90 backdrop-blur-sm border-2 rounded-xl p-4 min-w-[160px] max-w-[200px]
        transition-all duration-200 hover:shadow-lg
        ${selected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        ${getStatusColor()}
      `}>
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-2 rounded-lg bg-red-500/20">
            <Shield className="h-4 w-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{data.label || data.name || 'Guardrail'}</h3>
            <p className="text-xs text-gray-400">Safety Check</p>
          </div>
          {getStatusIcon()}
        </div>

        {data.description && (
          <p className="text-xs text-gray-300 mb-2 line-clamp-2">
            {data.description}
          </p>
        )}

        <div className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-3 w-3 text-red-400" />
            <span className="text-xs text-red-300">Compliance</span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="pass"
        className="w-3 h-3 bg-green-600 border-2 border-green-400 hover:bg-green-500"
        style={{ right: -6, top: '30%' }}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        id="fail"
        className="w-3 h-3 bg-red-600 border-2 border-red-400 hover:bg-red-500"
        style={{ right: -6, top: '70%' }}
      />

      {/* Path Labels */}
      <div className="absolute right-2 top-1/4 transform -translate-y-1/2 text-xs text-green-400 font-medium">
        Pass
      </div>
      <div className="absolute right-2 top-3/4 transform -translate-y-1/2 text-xs text-red-400 font-medium">
        Block
      </div>
    </div>
  );
};

export default memo(StrandsGuardrailNode);