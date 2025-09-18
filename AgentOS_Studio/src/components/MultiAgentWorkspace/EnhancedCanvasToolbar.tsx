/**
 * Enhanced Canvas Toolbar
 * Provides real-time workflow execution controls and status
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Settings,
  BarChart3,
  Clock,
  Zap,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  Share,
  Template
} from 'lucide-react';

interface WorkflowStatus {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  nodeCount: number;
  connectionCount: number;
  lastExecutionTime?: number;
  lastExecutionCost?: number;
  currentStep?: string;
  progress?: number;
  tokensUsed?: number;
  totalTokens?: number;
}

interface EnhancedCanvasToolbarProps {
  workflowStatus: WorkflowStatus;
  onExecute: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onShowAnalytics: () => void;
  onShowSettings: () => void;
  onShowTemplates: () => void;
  onExport: () => void;
  onShare: () => void;
  isExecuting: boolean;
  canExecute: boolean;
}

export const EnhancedCanvasToolbar: React.FC<EnhancedCanvasToolbarProps> = ({
  workflowStatus,
  onExecute,
  onPause,
  onStop,
  onReset,
  onShowAnalytics,
  onShowSettings,
  onShowTemplates,
  onExport,
  onShare,
  isExecuting,
  canExecute
}) => {
  const getStatusIcon = () => {
    switch (workflowStatus.status) {
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (workflowStatus.status) {
      case 'running':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div className="bg-gray-800/50 border-b border-gray-700 p-4 space-y-4">
      {/* Main Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Execution Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onExecute}
              disabled={!canExecute || isExecuting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Execute
            </Button>

            {isExecuting && (
              <>
                <Button
                  onClick={onPause}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>

                <Button
                  onClick={onStop}
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}

            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              disabled={isExecuting}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Workflow Actions */}
          <div className="flex items-center gap-2 border-l border-gray-600 pl-3">
            <Button
              onClick={onShowTemplates}
              variant="outline"
              size="sm"
            >
              <Template className="h-4 w-4 mr-2" />
              Templates
            </Button>

            <Button
              onClick={onShowAnalytics}
              variant="outline"
              size="sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>

            <Button
              onClick={onShowSettings}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Export & Share */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            onClick={onShare}
            variant="outline"
            size="sm"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
        <div className="flex items-center gap-6">
          {/* Workflow Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>
              {workflowStatus.status.charAt(0).toUpperCase() + workflowStatus.status.slice(1)}
            </Badge>
            {workflowStatus.currentStep && (
              <span className="text-sm text-gray-400">
                Step: {workflowStatus.currentStep}
              </span>
            )}
          </div>

          {/* Workflow Metrics */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300">Nodes: {workflowStatus.nodeCount}</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-gray-300">Connections: {workflowStatus.connectionCount}</span>
            </div>

            {workflowStatus.lastExecutionTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300">
                  Last Run: {formatDuration(workflowStatus.lastExecutionTime)}
                </span>
              </div>
            )}

            {workflowStatus.lastExecutionCost && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300">
                  Cost: {formatCost(workflowStatus.lastExecutionCost)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Execution Progress */}
        {isExecuting && workflowStatus.progress !== undefined && (
          <div className="flex items-center gap-3">
            {workflowStatus.tokensUsed !== undefined && workflowStatus.totalTokens && (
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-blue-400" />
                <span className="text-sm text-gray-300">
                  {workflowStatus.tokensUsed}/{workflowStatus.totalTokens} tokens
                </span>
              </div>
            )}
            
            <div className="w-32">
              <Progress 
                value={workflowStatus.progress} 
                className="h-2"
              />
            </div>
            
            <span className="text-sm text-gray-300">
              {Math.round(workflowStatus.progress)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};