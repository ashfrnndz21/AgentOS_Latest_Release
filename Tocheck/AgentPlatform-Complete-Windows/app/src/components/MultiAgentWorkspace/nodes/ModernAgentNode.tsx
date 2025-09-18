import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Brain, Database, Shield, Settings, Activity } from 'lucide-react';

export const ModernAgentNode = ({ data, selected }: any) => {
  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'KYC Agent': return <Bot className="h-3 w-3 text-cyan-400" />;
      case 'AML Agent': return <Shield className="h-3 w-3 text-emerald-400" />;
      case 'Credit Underwriting Agent': return <Database className="h-3 w-3 text-purple-400" />;
      case 'Fraud Detection Agent': return <Activity className="h-3 w-3 text-red-400" />;
      case 'Regulatory Reporting Agent': return <Settings className="h-3 w-3 text-yellow-400" />;
      case 'Customer Service Agent': return <Brain className="h-3 w-3 text-pink-400" />;
      default: return <Bot className="h-3 w-3 text-cyan-400" />;
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

  return (
    <div className={`relative backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-600/30 rounded-lg shadow-lg transition-all duration-300 w-[90px] min-h-[60px] ${
      selected 
        ? 'border-cyan-400/60 shadow-cyan-400/20 shadow-xl ring-1 ring-cyan-400/30' 
        : 'border-slate-600/30 hover:border-slate-500/50 hover:shadow-lg'
    }`}>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400/5 to-purple-400/5 opacity-60" />
      
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-cyan-400 border border-slate-800 shadow-md shadow-cyan-400/30"
      />
      
      {/* Content */}
      <div className="relative p-2 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-1">
          <div className="p-1 rounded bg-slate-700/50 backdrop-blur-sm">
            {getAgentIcon(data.agentType)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-medium text-slate-100 truncate leading-tight">
              {(data.label || 'Agent').substring(0, 8)}
            </h3>
            <p className="text-[8px] text-slate-400 truncate leading-tight">
              {(data.agentType || 'AI Agent').substring(0, 10)}
            </p>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(data.status)} shadow-sm`} />
        </div>
        
        {/* Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-slate-400">Model</span>
            <span className="text-[7px] font-mono text-slate-300 bg-slate-700/30 px-1 py-0.5 rounded">
              {(data.model || 'GPT-4').substring(0, 4)}
            </span>
          </div>
          
          {/* Capabilities */}
          <div className="flex items-center gap-1">
            {data.memory && (
              <div className="w-4 h-4 bg-emerald-500/20 rounded flex items-center justify-center backdrop-blur-sm">
                <Database className="h-2 w-2 text-emerald-400" />
              </div>
            )}
            {data.guardrails?.length > 0 && (
              <div className="w-4 h-4 bg-amber-500/20 rounded flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-2 w-2 text-amber-400" />
              </div>
            )}
            {data.tools?.length > 0 && (
              <span className="text-[7px] bg-cyan-500/20 text-cyan-400 px-1 py-0.5 rounded backdrop-blur-sm">
                {data.tools.length}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-cyan-400 border border-slate-800 shadow-md shadow-cyan-400/30"
      />
    </div>
  );
};