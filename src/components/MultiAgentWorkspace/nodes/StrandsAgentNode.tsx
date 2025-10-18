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
      {/* Input Handle - TOP (Blue - Receives input) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-4 h-4 !bg-blue-500 border-2 border-blue-300 hover:!bg-blue-400 hover:scale-150 transition-all cursor-crosshair shadow-lg shadow-blue-500/50"
        style={{ top: -8, zIndex: 10 }}
        isConnectable={true}
      />
      
      {/* Input Handle - LEFT (Blue - Receives input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-4 h-4 !bg-blue-500 border-2 border-blue-300 hover:!bg-blue-400 hover:scale-150 transition-all cursor-crosshair shadow-lg shadow-blue-500/50"
        style={{ left: -8, zIndex: 10 }}
        isConnectable={true}
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
            {(data.description || data.agent?.name) && (
              <p className="text-xs text-gray-300 mb-3 line-clamp-2">
                {data.description || 
                 (data.agent?.name === 'Main System Orchestrator' ? 'Master coordinator for multi-agent workflows with intelligent routing and execution management.' :
                  data.agent?.name?.includes('Network') ? 'Specialized agent for telecommunications network optimization and management.' :
                  data.agent?.name?.includes('Customer') ? 'Customer service agent for handling telco support and inquiries.' :
                  data.agent?.name?.includes('Service') ? 'Service management agent for telco operations and maintenance.' :
                  'AI agent specialized for telecommunications operations and management.')}
              </p>
            )}

        {/* Agent Details */}
        <div className="space-y-2 mb-3">
          {/* Model & Configuration */}
          <div className="space-y-1 p-2 bg-gray-700/30 rounded border border-gray-600/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Model:</span>
              <span className="text-gray-300 font-mono">{data.agent?.model || 'N/A'}</span>
            </div>
            
            {(data.agent?.temperature || data.agent?.maxTokens) && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Config:</span>
                <span className="text-gray-300">
                  {data.agent.temperature && `T:${data.agent.temperature}`}
                  {data.agent.temperature && data.agent.maxTokens && ' • '}
                  {data.agent.maxTokens && `Max:${data.agent.maxTokens}`}
                </span>
              </div>
            )}

            {data.agent?.model_provider && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Provider:</span>
                <span className="text-gray-300">{data.agent.model_provider}</span>
              </div>
            )}
          </div>

          {/* Backend & A2A Status */}
          <div className="space-y-1 p-2 bg-blue-500/10 rounded border border-blue-500/20">
            {data.agent?.dedicatedBackend?.port && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Backend Port:</span>
                <span className="text-blue-400 font-mono">{data.agent.dedicatedBackend.port}</span>
              </div>
            )}

            {data.agent?.dedicatedBackend?.status && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 capitalize">{data.agent.dedicatedBackend.status}</span>
              </div>
            )}

            {data.agent?.a2aEnabled && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">A2A:</span>
                <span className="text-green-400">✓ Enabled</span>
              </div>
            )}

            {data.agent?.orchestrationEnabled && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Orchestration:</span>
                <span className="text-green-400">✓ Ready</span>
              </div>
            )}
          </div>


          {/* Tools & Capabilities Details */}
          {(data.agent?.capabilities?.length > 0 || data.agent?.tools?.length > 0 || data.agent?.sdkType || data.agent?.host) && (
            <div className="space-y-1 p-2 bg-purple-500/10 rounded border border-purple-500/20">
              {/* Capabilities with descriptions */}
              {data.agent?.capabilities && data.agent.capabilities.length > 0 && (
                <div className="space-y-1">
                  <span className="text-gray-400 text-xs">Capabilities ({data.agent.capabilities.length}):</span>
                  <div className="space-y-1">
                    {data.agent.capabilities.map((capability: string) => (
                      <div key={capability} className="flex items-center justify-between text-xs">
                        <span className="text-purple-300">{capability}</span>
                        <span className="text-gray-500">
                          {capability === 'general' ? 'General purpose AI tasks' :
                           capability === 'research' ? 'Research and analysis' :
                           capability === 'orchestration' ? 'Multi-agent coordination' :
                           capability === 'coordination' ? 'Agent coordination' :
                           capability === 'routing' ? 'Request routing' :
                           capability === 'execution' ? 'Task execution' :
                           'Specialized function'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools */}
              {data.agent?.tools && data.agent.tools.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Tools:</span>
                  <span className="text-purple-400">{data.agent.tools.length} available</span>
                </div>
              )}

              {/* SDK Information */}
              {data.agent?.sdkType && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">SDK Type:</span>
                  <span className="text-purple-400">{data.agent.sdkType}</span>
                </div>
              )}

              {data.agent?.host && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Host:</span>
                  <span className="text-purple-400">{data.agent.host}</span>
                </div>
              )}

              {data.agent?.sdk_version && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">SDK Version:</span>
                  <span className="text-purple-400">v{data.agent.sdk_version}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Strands Features */}
        <div className="space-y-2 mb-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center justify-between">
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
          </div>
          
          {/* Reasoning Pattern */}
          {data.strandsConfig?.reasoningPattern && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Reasoning:</span>
              <span className="text-purple-400 capitalize">{data.strandsConfig.reasoningPattern}</span>
            </div>
          )}

          {/* Context Management */}
          {data.strandsConfig?.contextManagement && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Context:</span>
              <span className="text-purple-400 capitalize">
                {data.strandsConfig.contextManagement.compressionLevel}
              </span>
            </div>
          )}

          {/* Handoff Strategy */}
          {data.strandsConfig?.handoffStrategy && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Handoff:</span>
              <span className="text-purple-400 capitalize">
                {data.strandsConfig.handoffStrategy.contextTransfer}
              </span>
            </div>
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

      {/* Output Handle - RIGHT (Green - Sends output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-4 h-4 !bg-green-500 border-2 border-green-300 hover:!bg-green-400 hover:scale-150 transition-all cursor-crosshair shadow-lg shadow-green-500/50"
        style={{ right: -8, zIndex: 10 }}
        isConnectable={true}
      />

      {/* Output Handle - BOTTOM (Green - Sends output) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-4 h-4 !bg-green-500 border-2 border-green-300 hover:!bg-green-400 hover:scale-150 transition-all cursor-crosshair shadow-lg shadow-green-500/50"
        style={{ bottom: -8, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
        isConnectable={true}
      />

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