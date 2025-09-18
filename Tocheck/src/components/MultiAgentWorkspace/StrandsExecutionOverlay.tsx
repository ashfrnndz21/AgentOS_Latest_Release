import React from 'react';
import { X, Clock, CheckCircle, AlertCircle, Zap, TrendingUp } from 'lucide-react';
import { WorkflowExecution } from '@/lib/services/StrandsWorkflowOrchestrator';

interface StrandsExecutionOverlayProps {
  execution: WorkflowExecution;
  onClose: () => void;
}

const StrandsExecutionOverlay: React.FC<StrandsExecutionOverlayProps> = ({
  execution,
  onClose,
}) => {
  const getStatusIcon = () => {
    switch (execution.status) {
      case 'running':
        return <Clock className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (execution.status) {
      case 'running':
        return 'border-blue-400 bg-blue-400/10';
      case 'completed':
        return 'border-green-400 bg-green-400/10';
      case 'error':
        return 'border-red-400 bg-red-400/10';
      default:
        return 'border-gray-400 bg-gray-400/10';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-700 ${getStatusColor()}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-lg font-semibold text-white">
                Workflow Execution
              </h2>
              <p className="text-sm text-gray-400">
                ID: {execution.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Status and Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Timing</span>
              </div>
              <div className="space-y-1 text-xs text-gray-300">
                <div>Started: {execution.startTime.toLocaleTimeString()}</div>
                {execution.endTime && (
                  <div>Ended: {execution.endTime.toLocaleTimeString()}</div>
                )}
                <div>Duration: {formatDuration(execution.metrics.totalExecutionTime)}</div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">Metrics</span>
              </div>
              <div className="space-y-1 text-xs text-gray-300">
                <div>Tokens Used: {execution.metrics.totalTokensUsed.toLocaleString()}</div>
                <div>Tools Used: {execution.metrics.toolsUsed.length}</div>
                <div>Success Rate: {Math.round(execution.metrics.successRate * 100)}%</div>
              </div>
            </div>
          </div>

          {/* Execution Path */}
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Execution Path</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {execution.executionPath.map((nodeId, index) => (
                <div key={nodeId} className="flex items-center">
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    nodeId === execution.currentNode
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {nodeId.split('_')[0]}
                  </div>
                  {index < execution.executionPath.length - 1 && (
                    <div className="mx-2 text-gray-500">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Node Results */}
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-white">Node Results</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(execution.results).map(([nodeId, result]) => (
                <div key={nodeId} className="bg-gray-800/50 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">
                      {nodeId.split('_')[0]}
                    </span>
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDuration(result.executionTime)}
                      </span>
                    </div>
                  </div>
                  
                  {result.confidence && (
                    <div className="text-xs text-gray-400 mb-1">
                      Confidence: {Math.round(result.confidence * 100)}%
                    </div>
                  )}
                  
                  {result.toolsUsed.length > 0 && (
                    <div className="text-xs text-gray-400 mb-1">
                      Tools: {result.toolsUsed.join(', ')}
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-xs text-red-400 bg-red-400/10 rounded p-1 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                  
                  {result.output && typeof result.output === 'string' && (
                    <div className="text-xs text-gray-300 bg-gray-900/50 rounded p-1 mt-1 font-mono">
                      {result.output.length > 100 
                        ? `${result.output.substring(0, 100)}...` 
                        : result.output
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Context Information */}
          {execution.context.metadata && Object.keys(execution.context.metadata).length > 0 && (
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Context Metadata</span>
              </div>
              <div className="text-xs text-gray-300 font-mono bg-gray-900/50 rounded p-2">
                {JSON.stringify(execution.context.metadata, null, 2)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="text-xs text-gray-400">
            Execution Status: <span className="capitalize font-medium">{execution.status}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrandsExecutionOverlay;