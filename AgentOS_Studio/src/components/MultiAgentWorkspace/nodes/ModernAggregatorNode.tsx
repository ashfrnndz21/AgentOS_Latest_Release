import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Users, Settings, BarChart3, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AggregatorNodeData {
  label: string;
  criteria: string[];
  description: string;
  color: string;
  status: 'idle' | 'active' | 'success' | 'error';
  config: {
    method?: 'consensus' | 'weighted-average' | 'majority-vote' | 'expert-override';
    conflictResolution?: 'escalate' | 'default' | 'human-review';
    confidenceWeighting?: boolean;
    timeoutStrategy?: 'partial' | 'wait' | 'default';
    minimumResponses?: number;
  };
  activeResponses?: number;
  totalExpected?: number;
}

export const ModernAggregatorNode: React.FC<NodeProps<AggregatorNodeData>> = ({ 
  data, 
  selected 
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const getStatusColor = () => {
    switch (data.status) {
      case 'active': return 'border-purple-400 shadow-purple-400/50';
      case 'success': return 'border-green-400 shadow-green-400/50';
      case 'error': return 'border-red-400 shadow-red-400/50';
      default: return 'border-gray-600';
    }
  };

  const getMethodIcon = () => {
    switch (data.config.method) {
      case 'consensus': return CheckCircle;
      case 'weighted-average': return BarChart3;
      case 'majority-vote': return Users;
      case 'expert-override': return AlertTriangle;
      default: return Users;
    }
  };

  const MethodIcon = getMethodIcon();

  return (
    <Card className={`
      w-[200px] h-[120px] bg-beam-dark border-2 transition-all duration-200
      ${getStatusColor()}
      ${selected ? 'ring-2 ring-beam-blue shadow-lg' : ''}
      ${data.status === 'active' ? 'animate-pulse' : ''}
    `}>
      {/* Multiple input handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-1"
        style={{ top: '25%' }}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input-2"
        style={{ top: '50%' }}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input-3"
        style={{ top: '75%' }}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
      
      <div className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg bg-gray-800 ${data.color} flex-shrink-0`}>
            <Users className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{data.label}</h3>
            <p className="text-xs text-gray-400 truncate">Response Aggregator</p>
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

        {/* Method with Icon */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3 text-purple-400" />
            <span className="text-xs text-gray-400">Method:</span>
          </div>
          <div className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300 border border-purple-500/30">
            {data.config?.method?.replace('consensus', 'consensus').replace('weighted-average', 'weighted').replace('majority-vote', 'majority').replace('expert-override', 'expert') || 'consensus'}
          </div>
        </div>

        {/* Response Progress */}
        {data.status === 'active' && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-purple-400" />
                <span className="text-gray-400">Responses:</span>
              </div>
              <span className="text-white font-mono">
                {data.activeResponses || 0} / {data.totalExpected || 3}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((data.activeResponses || 0) / (data.totalExpected || 3)) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Aggregation Settings */}
        <div className="flex-1 mb-2 overflow-hidden">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-400">Settings:</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Min Responses:</span>
              <div className="px-1.5 py-0.5 bg-gray-700 rounded text-xs text-white font-mono">
                {data.config?.minimumResponses || 2}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Confidence:</span>
              <div className="px-1.5 py-0.5 bg-green-500/20 rounded text-xs text-green-400 font-mono">
                {data.config?.confidenceWeighting ? '✓' : '✗'}
              </div>
            </div>
          </div>
        </div>

        {/* Status with Progress */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              data.status === 'active' ? 'bg-purple-400 animate-pulse' :
              data.status === 'success' ? 'bg-green-400' :
              data.status === 'error' ? 'bg-red-400' :
              'bg-gray-500'
            }`} />
            <span className="text-xs text-gray-400">
              {data.status === 'active' ? 'Aggregating...' : 
               data.status === 'success' ? 'Completed' :
               data.status === 'error' ? 'Failed' : 'Idle'}
            </span>
          </div>
          
          {data.status === 'active' && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-purple-400 animate-pulse" />
              <span className="text-xs text-purple-400 font-mono">87%</span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
    </Card>
  );
};