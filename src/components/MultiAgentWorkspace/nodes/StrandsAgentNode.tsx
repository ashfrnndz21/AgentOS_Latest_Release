import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Bot, Brain, Shield, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { StrandsWorkflowNode } from '@/lib/services/StrandsWorkflowOrchestrator';

interface StrandsAgentNodeData {
  id: string;
  name: string;
  description?: string;
  agent?: any;
  strandsConfig?: any;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastExecution?: any;
  icon?: string;
  color?: string;
  badge?: string;
}

const StrandsAgentNode: React.FC<NodeProps<StrandsAgentNodeData>> = ({ data, selected }) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Bot className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return 'border-blue-400 shadow-blue-400/50';
      case 'completed':
        return 'border-green-400 shadow-green-400/50';
      case 'error':
        return 'border-red-400 shadow-red-400/50';
      default:
        return 'border-gray-600';
    }
  };

  const getBadgeColor = () => {
    switch (data.badge) {
      case 'Protected':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Basic':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={`strands-agent-node relative`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-400 hover:bg-gray-500"
        style={{ left: -6 }}
      />

      {/* Main Node Container */}
      <div
        className={`
          relative bg-gray-800/90 backdrop-blur-sm border-2 rounded-xl p-4 min-w-[200px] max-w-[280px]
          transition-all duration-200 hover:shadow-lg
          ${selected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
          ${getStatusColor()}
        `}
        style={{
          boxShadow: data.status === 'running' ? `0 0 20px ${data.color}40` : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${data.color}20` }}
            >
              {data.icon ? (
                <span className="text-lg">{data.icon}</span>
              ) : (
                <Brain className="h-5 w-5" style={{ color: data.color }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {data.name}
              </h3>
              <p className="text-xs text-gray-400">
                {data.agent?.role || 'AI Agent'}
              </p>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-1">
            {getStatusIcon()}
          </div>
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-xs text-gray-300 mb-3 line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Agent Details */}
        <div className="space-y-2 mb-3">
          {/* Model Info */}
          {data.agent?.model && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Model:</span>
              <span className="text-gray-300 font-mono">{data.agent.model}</span>
            </div>
          )}

          {/* Capabilities */}
          {data.agent?.capabilities && data.agent.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.agent.capabilities.slice(0, 3).map((capability: string) => (
                <span
                  key={capability}
                  className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded border border-gray-600"
                >
                  {capability}
                </span>
              ))}
              {data.agent.capabilities.length > 3 && (
                <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded border border-gray-600">
                  +{data.agent.capabilities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Strands Features */}
        <div className="flex items-center justify-between mb-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center space-x-2">
            <Zap className="h-3 w-3 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium">
              {data.agent?.sdkType === 'strands-sdk' ? 'Strands SDK' : 'Strands Powered'}
            </span>
          </div>
          {data.agent?.sdkType === 'strands-sdk' && data.agent?.tools && (
            <span className="text-xs text-purple-400">
              {data.agent.tools.length} tools
            </span>
          )}
          {data.strandsConfig?.reasoningPattern && (
            <span className="text-xs text-purple-400 capitalize">
              {data.strandsConfig.reasoningPattern}
            </span>
          )}
        </div>

        {/* Security Badge */}
        {data.badge && (
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs border ${getBadgeColor()}`}>
              <Shield className="h-3 w-3" />
              <span>{data.badge}</span>
            </div>
            
            {/* Execution Stats */}
            {data.lastExecution && (
              <div className="text-xs text-gray-400">
                {data.lastExecution.executionTime}ms
              </div>
            )}
          </div>
        )}

        {/* Execution Progress */}
        {data.status === 'running' && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse" />
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-400 hover:bg-gray-500"
        style={{ right: -6 }}
      />

      {/* Tool Access Handles (if agent has tool access) */}
      {data.strandsConfig?.toolAccess?.allowedTools?.length > 0 && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="tools"
          className="w-3 h-3 bg-orange-600 border-2 border-orange-400 hover:bg-orange-500"
          style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
        />
      )}

      {/* Reasoning Indicator */}
      {data.status === 'running' && (
        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          Thinking...
        </div>
      )}
    </div>
  );
};

export default memo(StrandsAgentNode);