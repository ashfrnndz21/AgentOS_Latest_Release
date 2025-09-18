import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ArrowRight, MessageSquare, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface A2AConnectionData {
  fromAgent: string;
  toAgent: string;
  messageType: 'request' | 'response' | 'notification' | 'error';
  status: 'pending' | 'success' | 'failed' | 'timeout';
  timestamp?: string;
  message?: string;
  responseTime?: number;
  retryCount?: number;
}

export const A2AConnectionNode: React.FC<NodeProps<A2AConnectionData>> = memo(({ data, selected }) => {
  const { 
    fromAgent, 
    toAgent, 
    messageType, 
    status, 
    timestamp, 
    message, 
    responseTime, 
    retryCount = 0 
  } = data;

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'timeout':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-500/10';
      case 'failed':
        return 'border-red-500 bg-red-500/10';
      case 'timeout':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'pending':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getMessageTypeIcon = () => {
    switch (messageType) {
      case 'request':
        return '📤';
      case 'response':
        return '📥';
      case 'notification':
        return '🔔';
      case 'error':
        return '❌';
      default:
        return '💬';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Delivered';
      case 'failed':
        return 'Failed';
      case 'timeout':
        return 'Timeout';
      case 'pending':
        return 'Sending...';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className={`min-w-[180px] p-3 border-2 ${getStatusColor()} ${
      selected ? 'ring-2 ring-blue-500' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-slate-100">A2A Connection</span>
        </div>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <Badge variant="secondary" className="text-xs">
            {getStatusText()}
          </Badge>
        </div>
      </div>

      {/* Agent Flow */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-300 truncate max-w-[60px]">
          {fromAgent}
        </div>
        <div className="flex items-center gap-1">
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <span className="text-xs text-slate-400">
            {getMessageTypeIcon()}
          </span>
        </div>
        <div className="text-xs text-slate-300 truncate max-w-[60px] text-right">
          {toAgent}
        </div>
      </div>

      {/* Message Preview */}
      {message && (
        <div className="mb-2 p-2 bg-slate-700/50 rounded text-xs text-slate-300">
          <div className="truncate">{message}</div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{responseTime ? `${responseTime}ms` : '--'}</span>
        </div>
        {retryCount > 0 && (
          <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-400">
            Retry: {retryCount}
          </Badge>
        )}
      </div>

      {/* Timestamp */}
      {timestamp && (
        <div className="mt-1 text-xs text-slate-500">
          {new Date(timestamp).toLocaleTimeString()}
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-slate-800"
        style={{ top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-slate-800"
        style={{ top: '70%' }}
      />
    </Card>
  );
});

A2AConnectionNode.displayName = 'A2AConnectionNode';