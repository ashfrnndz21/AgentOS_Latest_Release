import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Server, HardDrive } from 'lucide-react';

export const ModernMemoryNode = ({ data, selected }: any) => {
  const getMemoryTypeInfo = (type: string) => {
    switch (type) {
      case 'short-term': 
        return { 
          icon: <Database className="h-3 w-3 text-cyan-400" />, 
          label: 'Cache',
          description: 'Fast access',
          color: 'from-cyan-400/20 to-blue-400/20'
        };
      case 'long-term': 
        return { 
          icon: <Server className="h-3 w-3 text-emerald-400" />, 
          label: 'Store',
          description: 'Persistent',
          color: 'from-emerald-400/20 to-green-400/20'
        };
      case 'episodic': 
        return { 
          icon: <Database className="h-3 w-3 text-purple-400" />, 
          label: 'Events',
          description: 'Contextual',
          color: 'from-purple-400/20 to-violet-400/20'
        };
      case 'semantic': 
        return { 
          icon: <HardDrive className="h-3 w-3 text-amber-400" />, 
          label: 'Facts',
          description: 'Knowledge',
          color: 'from-amber-400/20 to-yellow-400/20'
        };
      default: 
        return { 
          icon: <Database className="h-3 w-3 text-emerald-400" />, 
          label: 'Memory',
          description: 'Storage',
          color: 'from-emerald-400/20 to-green-400/20'
        };
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

  const memoryInfo = getMemoryTypeInfo(data.memoryType || 'short-term');
  const usagePercentage = data.usage || 45;
  const retentionDays = data.retentionDays || 30;

  return (
    <div className={`relative backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-600/30 rounded-lg shadow-lg transition-all duration-300 w-[90px] min-h-[65px] ${
      selected 
        ? 'border-emerald-400/60 shadow-emerald-400/20 shadow-xl ring-1 ring-emerald-400/30' 
        : 'border-slate-600/30 hover:border-slate-500/50 hover:shadow-lg'
    }`}>
      {/* Memory type specific glow */}
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${memoryInfo.color} opacity-60`} />
      
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
            {memoryInfo.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-medium text-slate-100 truncate leading-tight">
              {memoryInfo.label}
            </h3>
            <p className="text-[8px] text-slate-400 truncate leading-tight">
              {memoryInfo.description}
            </p>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(data.status)} shadow-sm`} />
        </div>
        
        {/* Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-slate-400">Capacity</span>
            <span className="text-[7px] font-mono text-slate-300 bg-slate-700/30 px-1 py-0.5 rounded">
              {data.memorySize || 100}MB
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-slate-400">Retention</span>
            <span className="text-[7px] font-mono text-slate-300 bg-slate-700/30 px-1 py-0.5 rounded">
              {retentionDays}d
            </span>
          </div>
          
          {/* Context specific info */}
          {data.agentContext && (
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-slate-400">Context</span>
              <span className="text-[7px] font-mono text-cyan-400 bg-cyan-900/30 px-1 py-0.5 rounded">
                {data.agentContext.substring(0, 6)}
              </span>
            </div>
          )}
          
          {/* Usage Bar */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-slate-400">Usage</span>
              <span className="text-[7px] text-slate-300">{usagePercentage}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  usagePercentage > 80 ? 'bg-red-400' :
                  usagePercentage > 60 ? 'bg-yellow-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
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