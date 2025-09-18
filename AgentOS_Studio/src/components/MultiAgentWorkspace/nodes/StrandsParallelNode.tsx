/**
 * Strands Parallel Node Component
 * Represents parallel execution branches in the Strands workflow
 */

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Settings, Play, CheckCircle, AlertCircle } from 'lucide-react';

interface StrandsParallelNodeData {
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  config?: {
    maxConcurrentTasks: number;
    waitForAll: boolean;
    timeoutMs: number;
    branches: Array<{
      id: string;
      name: string;
      status: 'pending' | 'running' | 'completed' | 'error';
    }>;
  };
  result?: {
    completedBranches: number;
    totalBranches: number;
    executionTime: number;
  };
}

export const StrandsParallelNode: React.FC<NodeProps<StrandsParallelNodeData>> = ({ 
  data, 
  selected 
}) => {
  const { status, config, result } = data;

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'border-purple-400 bg-purple-400/10';
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
        return <Play className="w-4 h-4 text-purple-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Zap className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBranchStatusColor = (branchStatus: string) => {
    switch (branchStatus) {
      case 'running':
        return '#8b5cf6';
      case 'completed':
        return '#10b981';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getProgressPercentage = () => {
    if (!result || !config) return 0;
    return (result.completedBranches / result.totalBranches) * 100;
  };

  return (
    <>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />

      {/* Node Card */}
      <Card 
        className={`w-64 transition-all duration-200 ${getStatusColor()} ${
          selected ? 'ring-2 ring-purple-400 ring-opacity-50' : ''
        }`}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-400/20 rounded-lg">
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
                    Parallel Execution
                  </Badge>
                </div>
              </div>
            </div>
            <Settings className="w-3 h-3 text-slate-400" />
          </div>

          {/* Configuration */}
          {config && (
            <div className="space-y-2 mb-3">
              {/* Concurrency Settings */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Max Concurrent:</span>
                <span className="text-white">{config.maxConcurrentTasks}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Wait for All:</span>
                <span className="text-white">{config.waitForAll ? 'Yes' : 'No'}</span>
              </div>

              {/* Timeout */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Timeout:</span>
                <span className="text-white">{config.timeoutMs / 1000}s</span>
              </div>

              {/* Branches */}
              {config.branches.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-slate-400 mb-2">
                    Branches ({config.branches.length}):
                  </div>
                  <div className="space-y-1">
                    {config.branches.slice(0, 3).map((branch) => (
                      <div key={branch.id} className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getBranchStatusColor(branch.status) }}
                        />
                        <span className="text-xs text-slate-400 truncate">
                          {branch.name}
                        </span>
                      </div>
                    ))}
                    {config.branches.length > 3 && (
                      <div className="text-xs text-slate-500">
                        +{config.branches.length - 3} more branches
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Execution Result */}
          {result && (
            <div className="space-y-2 p-2 bg-slate-700/30 rounded-lg mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Progress:</span>
                <span className="text-xs text-white">
                  {result.completedBranches}/{result.totalBranches}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-600 rounded-full h-1.5">
                <div 
                  className="bg-purple-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>

              {result.executionTime && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Duration:</span>
                  <span className="text-xs text-white">
                    {(result.executionTime / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Status */}
          <div className="pt-2 border-t border-slate-600/30">
            <span className="text-xs text-slate-400 capitalize">
              {status}
            </span>
          </div>

          {/* Progress Bar for Running Status */}
          {status === 'running' && !result && (
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div className="bg-purple-400 h-1 rounded-full animate-pulse" style={{width: '50%'}}></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Handles - Multiple branches */}
      <Handle
        type="source"
        position={Position.Right}
        id="branch1"
        className="w-3 h-3 bg-purple-400 border-2 border-white"
        style={{ top: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="branch2"
        className="w-3 h-3 bg-purple-400 border-2 border-white"
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="branch3"
        className="w-3 h-3 bg-purple-400 border-2 border-white"
        style={{ top: '75%' }}
      />
    </>
  );
};