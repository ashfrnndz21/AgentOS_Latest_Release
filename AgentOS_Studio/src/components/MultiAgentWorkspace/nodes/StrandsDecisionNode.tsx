import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  GitBranch, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Zap,
  TrendingUp
} from 'lucide-react';
import { StrandsWorkflowNode } from '@/lib/services/StrandsWorkflowOrchestrator';

interface StrandsDecisionNodeData {
  id: string;
  name: string;
  label?: string;
  description?: string;
  decisionLogic?: any;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastExecution?: any;
  icon?: string;
  color?: string;
}

const StrandsDecisionNode: React.FC<NodeProps<StrandsDecisionNodeData>> = ({ data, selected }) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <GitBranch className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return 'border-yellow-400 shadow-yellow-400/50';
      case 'completed':
        return 'border-green-400 shadow-green-400/50';
      case 'error':
        return 'border-red-400 shadow-red-400/50';
      default:
        return 'border-gray-600';
    }
  };

  const getDecisionTypeColor = () => {
    const type = data.decisionLogic?.type;
    switch (type) {
      case 'ml_based':
        return '#8b5cf6';
      case 'agent_based':
        return '#3b82f6';
      case 'hybrid':
        return '#10b981';
      default:
        return '#f59e0b';
    }
  };

  const decisionColor = getDecisionTypeColor();

  return (
    <div className="strands-decision-node relative">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-400 hover:bg-gray-500"
        style={{ left: -6 }}
      />

      {/* Main Node Container - Rectangular Shape */}
      <div className={`
        bg-gray-800/90 backdrop-blur-sm border-2 rounded-xl p-4 min-w-[180px] max-w-[220px]
        transition-all duration-200 hover:shadow-lg
        ${selected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        ${getStatusColor()}
      `}
      style={{
        boxShadow: data.status === 'running' ? `0 0 20px ${decisionColor}40` : undefined,
      }}>
        {/* Header */}
        <div className="flex items-center space-x-2 mb-2">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${decisionColor}20` }}
          >
            {data.icon ? (
              <span className="text-lg">{data.icon}</span>
            ) : (
              <Brain className="h-5 w-5" style={{ color: decisionColor }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{data.label || data.name || 'Decision'}</h3>
            <p className="text-xs text-gray-400 capitalize">
              {data.decisionLogic?.type?.replace('_', ' ') || 'Rule Based'}
            </p>
          </div>
          {getStatusIcon()}
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-xs text-gray-300 mb-3 line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Decision Info */}
        <div className="space-y-2 mb-3">
          {data.decisionLogic?.conditions?.length > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Conditions:</span>
              <span className="text-white font-medium">{data.decisionLogic.conditions.length}</span>
            </div>
          )}
          
          {data.decisionLogic?.confidenceThreshold && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Threshold:</span>
              <span className="text-white font-medium">{Math.round(data.decisionLogic.confidenceThreshold * 100)}%</span>
            </div>
          )}
        </div>

        {/* Strands Intelligence */}
        <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <div className="flex items-center space-x-2">
            <Zap className="h-3 w-3 text-yellow-400" />
            <span className="text-xs text-yellow-300">Smart Decision</span>
          </div>
          {data.lastExecution?.confidence && (
            <span className="text-xs text-yellow-400">
              {Math.round(data.lastExecution.confidence * 100)}%
            </span>
          )}
        </div>

        {/* Execution Progress */}
        {data.status === 'running' && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent animate-pulse opacity-20"
              style={{ color: decisionColor }}
            />
          </div>
        )}
      </div>

      {/* Output Handles - True/False paths */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="w-3 h-3 bg-green-600 border-2 border-green-400 hover:bg-green-500"
        style={{ right: -6, top: '30%' }}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="w-3 h-3 bg-red-600 border-2 border-red-400 hover:bg-red-500"
        style={{ right: -6, top: '70%' }}
      />

      {/* Path Labels */}
      <div className="absolute right-2 top-1/4 transform -translate-y-1/2 text-xs text-green-400 font-medium">
        Yes
      </div>
      <div className="absolute right-2 top-3/4 transform -translate-y-1/2 text-xs text-red-400 font-medium">
        No
      </div>

      {/* Decision Result Indicator */}
      {data.status === 'completed' && data.lastExecution?.output?.decision !== undefined && (
        <div className={`absolute -right-8 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs font-medium ${
          data.lastExecution.output.decision 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {data.lastExecution.output.decision ? 'TRUE' : 'FALSE'}
        </div>
      )}

      {/* Reasoning Indicator */}
      {data.status === 'running' && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          Analyzing...
        </div>
      )}

      {/* Error Message */}
      {data.status === 'error' && data.lastExecution?.error && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded max-w-40 truncate">
          {data.lastExecution.error}
        </div>
      )}
    </div>
  );
};

export default memo(StrandsDecisionNode);