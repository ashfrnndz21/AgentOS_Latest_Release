import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Search, FileText, Clock, CheckCircle } from 'lucide-react';

export const AuditNode = ({ data, selected }: any) => {
  const getAuditStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-400' };
      case 'in-progress':
        return { icon: Clock, color: 'text-yellow-400' };
      case 'pending':
        return { icon: FileText, color: 'text-gray-400' };
      default:
        return { icon: Search, color: 'text-blue-400' };
    }
  };

  const auditStatus = data.auditStatus || 'pending';
  const statusInfo = getAuditStatus(auditStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`bg-purple-900/30 border-2 rounded-lg p-1 min-w-[85px] max-w-[105px] ${
      selected ? 'border-purple-400' : 'border-purple-600'
    } hover:border-purple-400/70 transition-colors`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
      
      <div className="flex items-center gap-1 mb-1.5">
        <Search className="h-3 w-3 text-purple-400" />
        <h3 className="text-white font-medium text-[8px] truncate font-sans">{data.label || 'Audit'}</h3>
      </div>
      
      <div className="space-y-1 text-[7px] text-gray-300">
        <div className="flex items-center gap-0.5">
          <span className="font-medium font-sans">Type:</span>
          <span className="truncate font-mono">{data.auditType?.charAt(0) || 'T'}</span>
        </div>
        
        <div className="flex items-center gap-0.5">
          <span className="font-medium font-sans">Scope:</span>
          <span className="truncate font-mono">{data.scope?.charAt(0) || 'F'}</span>
        </div>
        
        <div className="flex items-center gap-0.5">
          <StatusIcon className={`h-2 w-2 ${statusInfo.color}`} />
          <span className={`${statusInfo.color} truncate font-mono`}>
            {auditStatus.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-sans">Recs:</span>
          <span className="text-purple-400 font-mono">{data.recordCount || '0'}</span>
        </div>
      </div>
      
      <div className="mt-1 pt-1 border-t border-gray-600">
        <div className="flex items-center justify-between text-[6px] text-gray-400">
          <span className="font-sans">Ret:</span>
          <span className="truncate font-mono">{data.retention?.split(' ')[0] || '7y'}</span>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
    </div>
  );
};