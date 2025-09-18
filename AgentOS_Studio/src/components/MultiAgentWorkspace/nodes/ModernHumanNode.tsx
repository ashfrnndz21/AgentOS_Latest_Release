import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { User, Settings, MessageCircle, Clock, Play, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface HumanNodeData {
  label: string;
  description: string;
  color: string;
  status: 'idle' | 'waiting' | 'active' | 'completed';
  config: {
    interruptMessage?: string;
    timeout?: number;
    activeAgent?: string;
    allowedAgents?: string[];
    inputType?: 'text' | 'choice' | 'approval';
  };
  lastInput?: string;
  waitingFor?: string;
}

export const ModernHumanNode: React.FC<NodeProps<HumanNodeData>> = ({ 
  data, 
  selected 
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const getStatusColor = () => {
    switch (data.status) {
      case 'waiting': return 'border-yellow-400 shadow-yellow-400/50';
      case 'active': return 'border-blue-400 shadow-blue-400/50';
      case 'completed': return 'border-green-400 shadow-green-400/50';
      default: return 'border-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'waiting': return Clock;
      case 'active': return MessageCircle;
      case 'completed': return Play;
      default: return Pause;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className={`
      w-[200px] h-[120px] bg-beam-dark border-2 transition-all duration-200
      ${getStatusColor()}
      ${selected ? 'ring-2 ring-beam-blue shadow-lg' : ''}
      ${data.status === 'waiting' ? 'animate-pulse' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-yellow-400 border-2 border-white"
      />
      
      <div className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg bg-gray-800 ${data.color} flex-shrink-0`}>
            <User className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{data.label}</h3>
            <p className="text-xs text-gray-400 truncate">Human Input</p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white flex-shrink-0"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        {/* Input Type */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Input Type:</span>
          <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-600">
            {data.config?.inputType || 'text'}
          </Badge>
        </div>

        {/* Active Agent */}
        {data.config?.activeAgent && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Active Agent:</span>
            <span className="text-xs text-white truncate">{data.config.activeAgent}</span>
          </div>
        )}

        {/* Interrupt Message (if waiting) */}
        {data.config?.interruptMessage && data.status === 'waiting' && (
          <div className="flex-1 mb-2">
            <div className="text-xs text-yellow-400 mb-1">Waiting for input:</div>
            <div className="text-xs text-gray-300 bg-yellow-500/10 p-2 rounded border border-yellow-500/30">
              {data.config.interruptMessage}
            </div>
          </div>
        )}

        {/* Last Input */}
        {data.lastInput && (
          <div className="flex-1 mb-2">
            <div className="text-xs text-blue-400 mb-1">Last Input:</div>
            <div className="text-xs text-gray-300 bg-blue-500/10 p-2 rounded border border-blue-500/30 truncate">
              {data.lastInput}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-3 w-3 ${
              data.status === 'waiting' ? 'text-yellow-400' :
              data.status === 'active' ? 'text-blue-400' :
              data.status === 'completed' ? 'text-green-400' :
              'text-gray-400'
            }`} />
            <span className="text-xs text-gray-400">
              {data.status}
            </span>
          </div>
          
          {data.status === 'waiting' && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-yellow-400 border-2 border-white"
      />
    </Card>
  );
};