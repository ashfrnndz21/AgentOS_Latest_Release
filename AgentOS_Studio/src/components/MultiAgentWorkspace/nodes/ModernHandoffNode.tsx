import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ArrowRight, Settings, Users, Brain, Clock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface HandoffNodeData {
  label: string;
  criteria: string[];
  description: string;
  color: string;
  status: 'idle' | 'active' | 'success' | 'error';
  config: {
    strategy?: 'automatic' | 'manual' | 'hybrid';
    expertiseWeight?: number;
    workloadWeight?: number;
    confidenceThreshold?: number;
    contextPreservation?: 'full' | 'summary' | 'minimal';
  };
}

export const ModernHandoffNode: React.FC<NodeProps<HandoffNodeData>> = ({ 
  data, 
  selected 
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const getStatusColor = () => {
    switch (data.status) {
      case 'active': return 'border-blue-400 shadow-blue-400/50';
      case 'success': return 'border-green-400 shadow-green-400/50';
      case 'error': return 'border-red-400 shadow-red-400/50';
      default: return 'border-gray-600';
    }
  };

  const getCriteriaIcon = (criterion: string) => {
    if (criterion.includes('expertise')) return Brain;
    if (criterion.includes('workload')) return Users;
    if (criterion.includes('availability')) return Clock;
    return Settings;
  };

  return (
    <Card className={`
      w-[200px] h-[120px] bg-beam-dark border-2 transition-all duration-200
      ${getStatusColor()}
      ${selected ? 'ring-2 ring-beam-blue shadow-lg' : ''}
      ${data.status === 'active' ? 'animate-pulse' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      
      <div className="p-3 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg bg-gray-800 ${data.color} flex-shrink-0`}>
            <ArrowRight className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{data.label}</h3>
            <p className="text-xs text-gray-400 truncate">Smart Handoff</p>
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

        {/* Strategy & Confidence */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3 text-blue-400" />
            <span className="text-xs text-gray-400">Strategy:</span>
          </div>
          <div className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300 border border-blue-500/30">
            {data.config?.strategy || 'automatic'}
          </div>
        </div>

        {/* Handoff Criteria with Icons */}
        <div className="flex-1 mb-2 overflow-hidden">
          <div className="flex items-center gap-1 mb-1">
            <Users className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-400">Criteria:</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded text-xs text-green-300 border border-green-500/30">
                <Brain className="h-2.5 w-2.5" />
                <span>Expertise</span>
              </div>
              <div className="text-xs text-green-400 font-mono">
                {data.config?.expertiseWeight || 85}%
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded text-xs text-orange-300 border border-orange-500/30">
                <Users className="h-2.5 w-2.5" />
                <span>Workload</span>
              </div>
              <div className="text-xs text-orange-400 font-mono">
                {data.config?.workloadWeight || 65}%
              </div>
            </div>
          </div>
        </div>

        {/* Status with Activity Indicator */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              data.status === 'active' ? 'bg-blue-400 animate-pulse' :
              data.status === 'success' ? 'bg-green-400' :
              data.status === 'error' ? 'bg-red-400' :
              'bg-gray-500'
            }`} />
            <span className="text-xs text-gray-400">
              {data.status === 'active' ? 'Routing...' : 
               data.status === 'success' ? 'Completed' :
               data.status === 'error' ? 'Failed' : 'Idle'}
            </span>
          </div>
          
          {data.status === 'active' && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-400 animate-pulse" />
              <span className="text-xs text-blue-400 font-mono">2.3s</span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
    </Card>
  );
};