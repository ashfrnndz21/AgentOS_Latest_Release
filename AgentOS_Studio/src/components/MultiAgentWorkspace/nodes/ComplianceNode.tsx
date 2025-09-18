import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Gavel, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const ComplianceNode = ({ data, selected }: any) => {
  const getComplianceStatus = () => {
    const status = data.status || 'pending';
    switch (status) {
      case 'compliant':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/30 border-green-600' };
      case 'non-compliant':
        return { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-900/30 border-red-600' };
      case 'reviewing':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-600' };
      default:
        return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-900/30 border-gray-600' };
    }
  };

  const statusInfo = getComplianceStatus();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`border-2 rounded-lg p-1 min-w-[85px] max-w-[105px] ${
      selected ? 'border-amber-400' : 'border-amber-600'
    } hover:border-amber-400/70 transition-colors ${statusInfo.bg}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-amber-400 border-2 border-white"
      />
      
      <div className="flex items-center gap-1 mb-1.5">
        <Gavel className="h-3 w-3 text-amber-400" />
        <h3 className="text-white font-medium text-[8px] truncate font-sans">{data.label || 'Compliance'}</h3>
      </div>
      
      <div className="space-y-1 text-[7px] text-gray-300">
        <div className="flex items-center gap-0.5">
          <span className="font-medium font-sans">Type:</span>
          <span className="truncate font-mono">{data.complianceType?.charAt(0) || 'R'}</span>
        </div>
        
        <div className="flex items-center gap-0.5">
          <span className="font-medium font-sans">Fmwk:</span>
          <span className="truncate font-mono">{data.framework?.split('/')[0] || 'AML'}</span>
        </div>
        
        <div className="flex items-center gap-0.5">
          <StatusIcon className={`h-2 w-2 ${statusInfo.color}`} />
          <span className={`${statusInfo.color} truncate font-mono`}>
            {(data.status || 'pending').charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="mt-1 pt-1 border-t border-gray-600">
        <div className="flex items-center justify-between text-[7px] text-gray-400">
          <span className="font-sans">Score</span>
          <span className={`${data.score >= 90 ? 'text-green-400' : data.score >= 70 ? 'text-yellow-400' : 'text-red-400'} font-mono`}>
            {data.score || 'N/A'}%
          </span>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-amber-400 border-2 border-white"
      />
    </div>
  );
};