import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Shield, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export const ModernGuardrailNode = ({ data, selected }: any) => {
  const getGuardrailIcon = (type: string) => {
    switch (type) {
      case 'content-filter': return <Shield className="h-3 w-3 text-emerald-400" />;
      case 'pii-protection': return <Shield className="h-3 w-3 text-blue-400" />;
      case 'bias-detection': return <Shield className="h-3 w-3 text-purple-400" />;
      case 'toxicity-check': return <Shield className="h-3 w-3 text-red-400" />;
      default: return <Shield className="h-3 w-3 text-emerald-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-emerald-500';
      case 'error': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/30';
      case 'high': return 'text-orange-400 bg-orange-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'low': return 'text-green-400 bg-green-900/30';
      default: return 'text-slate-400 bg-slate-700/30';
    }
  };

  return (
    <div className={`relative backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-600/30 rounded-lg shadow-lg transition-all duration-300 w-[90px] min-h-[60px] ${
      selected 
        ? 'border-emerald-400/60 shadow-emerald-400/20 shadow-xl ring-1 ring-emerald-400/30' 
        : 'border-slate-600/30 hover:border-slate-500/50 hover:shadow-lg'
    }`}>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-400/5 to-teal-400/5 opacity-60" />
      
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-emerald-400 border border-slate-800 shadow-md shadow-emerald-400/30"
      />
      
      {/* Content */}
      <div className="relative p-2 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-1">
          <div className="p-1 rounded bg-slate-700/50 backdrop-blur-sm">
            {getGuardrailIcon(data.guardrailType)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-medium text-slate-100 truncate leading-tight">
              {(data.label || 'Guardrail').substring(0, 8)}
            </h3>
            <p className="text-[8px] text-slate-400 truncate leading-tight">
              {(data.guardrailType || 'Filter').substring(0, 8)}
            </p>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(data.status)} shadow-sm`} />
        </div>
        
        {/* Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-slate-400">Type</span>
            <span className="text-[7px] font-mono text-slate-300 bg-slate-700/30 px-1 py-0.5 rounded">
              {(data.guardrailType || 'filter').split('-')[0].substring(0, 4)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-slate-400">Level</span>
            <span className={`text-[7px] px-1 py-0.5 rounded ${getSeverityColor(data.severity)} font-mono`}>
              {(data.severity || 'medium').substring(0, 3)}
            </span>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-1">
            {data.guardrails?.length > 0 && (
              <div className="w-4 h-4 bg-emerald-500/20 rounded flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-2 w-2 text-emerald-400" />
              </div>
            )}
            <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded backdrop-blur-sm">
              Active
            </span>
          </div>
        </div>
      </div>
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-emerald-400 border border-slate-800 shadow-md shadow-emerald-400/30"
      />
    </div>
  );
};