import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Shield, AlertTriangle } from 'lucide-react';

export const GuardrailNode = ({ data, selected }: any) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`bg-orange-900/30 border-2 rounded-lg p-4 min-w-[160px] ${
      selected ? 'border-orange-400' : 'border-orange-600'
    } hover:border-orange-400/70 transition-colors`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-orange-400 border-2 border-white"
      />
      
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-orange-400" />
        <h3 className="text-white font-medium text-sm">{data.label || 'Guardrail'}</h3>
      </div>
      
      <div className="space-y-2 text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <span className="font-medium">Type:</span>
          <span>{data.guardrailType || 'content-filter'}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span className={getSeverityColor(data.severity)}>
            {data.severity || 'medium'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-green-400">Active</span>
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-orange-400 border-2 border-white"
      />
    </div>
  );
};