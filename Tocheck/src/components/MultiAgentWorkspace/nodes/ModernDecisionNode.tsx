import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, ArrowRight, ArrowDown } from 'lucide-react';

export const ModernDecisionNode = ({ data, selected }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-emerald-500';
      case 'error': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`relative backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-600/30 rounded-lg shadow-lg transition-all duration-300 w-[90px] min-h-[60px] ${
      selected 
        ? 'border-amber-400/60 shadow-amber-400/20 shadow-xl ring-1 ring-amber-400/30' 
        : 'border-slate-600/30 hover:border-slate-500/50 hover:shadow-lg'
    }`}>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-400/5 to-orange-400/5 opacity-60" />
      
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-amber-400 border border-slate-800 shadow-md shadow-amber-400/30"
      />
      
      {/* Content */}
      <div className="relative p-2 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-1">
          <div className="p-1 rounded bg-slate-700/50 backdrop-blur-sm">
            <GitBranch className="h-3 w-3 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-medium text-slate-100 truncate leading-tight">
              {(data.label || data.name || 'Decision').substring(0, 12)}
            </h3>
            <p className="text-[8px] text-slate-400 truncate leading-tight">
              Logic Gate
            </p>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${data.isConfigured ? 'bg-green-500' : getStatusColor(data.status)} shadow-sm`} />
        </div>
        
        {/* Decision paths */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[7px]">
            <span className="text-slate-400">Conditions</span>
            <span className="text-slate-300 font-mono">
              {data.config?.conditions?.length || 0} rules
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-sm"></div>
              <span className="text-[7px] text-slate-400">True</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full shadow-sm"></div>
              <span className="text-[7px] text-slate-400">False</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-2 h-2 bg-green-400 border border-slate-800 shadow-md shadow-green-400/30"
        style={{ left: '30%', bottom: '-4px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-2 h-2 bg-red-400 border border-slate-800 shadow-md shadow-red-400/30"
        style={{ left: '70%', bottom: '-4px' }}
      />
    </div>
  );
};