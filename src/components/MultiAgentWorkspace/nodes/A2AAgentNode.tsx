import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Bot, Network, Activity, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface A2AAgentData {
  agent: {
    id: string;
    name: string;
    description: string;
    url: string;
    capabilities: string[];
    status: 'active' | 'unhealthy' | 'unreachable' | 'unknown';
    last_health_check?: string;
  };
  isConnected?: boolean;
  lastMessage?: string;
  messageCount?: number;
}

export const A2AAgentNode: React.FC<NodeProps<A2AAgentData>> = memo(({ data, selected }) => {
  const { agent, isConnected, lastMessage, messageCount = 0 } = data;

  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    switch (agent.status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'unreachable':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    if (isConnected) return 'border-green-500';
    
    switch (agent.status) {
      case 'active':
        return 'border-green-500';
      case 'unhealthy':
        return 'border-yellow-500';
      case 'unreachable':
        return 'border-red-500';
      default:
        return 'border-gray-500';
    }
  };

  const getCapabilityIcon = (capability: string) => {
    switch (capability.toLowerCase()) {
      case 'calculator':
        return '🧮';
      case 'research':
        return '🔍';
      case 'weather':
        return '🌤️';
      case 'stock':
        return '📈';
      case 'coordinate':
        return '🎯';
      case 'think':
        return '🧠';
      default:
        return '⚙️';
    }
  };

  return (
    <Card className={`min-w-[200px] p-3 bg-slate-800/90 border-2 ${getStatusColor()} ${
      selected ? 'ring-2 ring-blue-500' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-medium text-slate-100">{agent.name}</h3>
            <p className="text-xs text-slate-400 truncate max-w-[120px]">{agent.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          {messageCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
              {messageCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 mb-2 line-clamp-2">{agent.description}</p>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1 mb-2">
        {agent.capabilities.slice(0, 3).map((capability) => (
          <Badge
            key={capability}
            variant="secondary"
            className="text-xs bg-slate-700/50 text-slate-300 border-slate-600"
          >
            {getCapabilityIcon(capability)} {capability}
          </Badge>
        ))}
        {agent.capabilities.length > 3 && (
          <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300">
            +{agent.capabilities.length - 3}
          </Badge>
        )}
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <Network className="h-3 w-3" />
          <span>A2A Agent</span>
        </div>
        {isConnected && (
          <div className="flex items-center gap-1 text-green-400">
            <Activity className="h-3 w-3" />
            <span>Connected</span>
          </div>
        )}
      </div>

      {/* Last Message Preview */}
      {lastMessage && (
        <div className="mt-2 p-2 bg-slate-700/50 rounded text-xs text-slate-300">
          <div className="truncate">{lastMessage}</div>
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-slate-800"
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-slate-800"
        style={{ top: '50%' }}
      />
    </Card>
  );
});

A2AAgentNode.displayName = 'A2AAgentNode';










