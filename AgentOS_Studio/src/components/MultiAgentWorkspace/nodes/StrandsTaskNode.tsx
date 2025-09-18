/**
 * Strands Task Node Component
 * Represents a task in the Strands workflow
 */

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, AlertCircle, Play, Settings } from 'lucide-react';

interface StrandsTaskNodeData {
  taskId: string;
  label: string;
  taskType: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  config?: {
    description: string;
    priority: number;
    dependencies: string[];
    availableTools: string[];
  };
  result?: any;
  error?: string;
}

export const StrandsTaskNode: React.FC<NodeProps<StrandsTaskNodeData>> = ({ 
  data, 
  selected 
}) => {
  const { taskType, status, config } = data;

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'border-blue-400 bg-blue-400/10';
      case 'completed':
        return 'border-green-400 bg-green-400/10';
      case 'error':
        return 'border-red-400 bg-red-400/10';
      default:
        return 'border-slate-600/50 bg-slate-800/50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'completed':
        return <CheckSquare className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTaskTypeColor = () => {
    switch (taskType.toLowerCase()) {
      case 'analysis':
        return '#3b82f6';
      case 'research':
        return '#10b981';
      case 'calculation':
        return '#f59e0b';
      case 'decision':
        return '#ef4444';
      case 'documentation':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = () => {
    if (!config?.priority) return '#6b7280';
    
    if (config.priority >= 8) return '#ef4444'; // High priority - red
    if (config.priority >= 5) return '#f59e0b'; // Medium priority - yellow
    return '#10b981'; // Low priority - green
  };

  return (
    <>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />

      {/* Node Card */}
      <Card 
        className={`w-56 transition-all duration-200 ${getStatusColor()} ${
          selected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
        }`}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${getTaskTypeColor()}20` }}
              >
                {getStatusIcon()}
              </div>
              <div>
                <h4 className="text-sm font-medium text-white truncate">
                  {data.label}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className="text-xs border-slate-500/50 text-slate-300"
                  >
                    {taskType}
                  </Badge>
                </div>
              </div>
            </div>
            <Settings className="w-3 h-3 text-slate-400" />
          </div>

          {/* Task Details */}
          {config && (
            <div className="space-y-2">
              {/* Description */}
              {config.description && (
                <p className="text-xs text-slate-400 line-clamp-2">
                  {config.description}
                </p>
              )}

              {/* Priority */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getPriorityColor() }}
                />
                <span className="text-xs text-slate-400">
                  Priority: {config.priority}/10
                </span>
              </div>

              {/* Dependencies */}
              {config.dependencies.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Depends on: {config.dependencies.length} task{config.dependencies.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Available Tools */}
              {config.availableTools.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Tools: {config.availableTools.length}
                  </span>
                  <div className="flex gap-1">
                    {config.availableTools.slice(0, 3).map((tool, index) => (
                      <div
                        key={index}
                        className="w-1.5 h-1.5 bg-yellow-400 rounded-full"
                        title={tool}
                      />
                    ))}
                    {config.availableTools.length > 3 && (
                      <span className="text-xs text-slate-500">
                        +{config.availableTools.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Information */}
          <div className="mt-3 pt-2 border-t border-slate-600/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 capitalize">
                {status}
              </span>
              {status === 'error' && data.error && (
                <span className="text-xs text-red-400 truncate max-w-32" title={data.error}>
                  {data.error}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar for Running Status */}
          {status === 'running' && (
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div className="bg-blue-400 h-1 rounded-full animate-pulse" style={{width: '45%'}}></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
    </>
  );
};