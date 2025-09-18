/**
 * Enhanced Strands Agent Node
 * Shows real-time execution status and configuration details
 */

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Settings, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  Brain,
  Zap,
  Clock,
  Eye
} from 'lucide-react';

interface AgentNodeData {
  id: string;
  name: string;
  role: string;
  model: string;
  temperature: number;
  max_tokens: number;
  reasoning_pattern: string;
  reflection_enabled: boolean;
  chain_of_thought_depth: number;
  guardrails_enabled: boolean;
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
  execution?: {
    progress: number;
    tokensUsed: number;
    duration: number;
    confidence?: number;
    currentStep?: string;
  };
  lastResult?: {
    success: boolean;
    output: string;
    tokensUsed: number;
    duration: number;
    confidence: number;
  };
  onConfigure?: () => void;
  onTest?: () => void;
}

export const EnhancedStrandsAgentNode: React.FC<NodeProps<AgentNodeData>> = ({ 
  data, 
  selected 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'paused':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Bot className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return 'border-blue-400 bg-blue-400/10';
      case 'completed':
        return 'border-green-400 bg-green-400/10';
      case 'error':
        return 'border-red-400 bg-red-400/10';
      case 'paused':
        return 'border-yellow-400 bg-yellow-400/10';
      default:
        return 'border-gray-600 bg-gray-800/50';
    }
  };

  const getNodeBorderColor = () => {
    if (selected) return 'border-blue-400 shadow-lg shadow-blue-400/20';
    return getStatusColor();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <Card className={`w-80 ${getNodeBorderColor()} transition-all duration-200`}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <div>
                <h3 className="font-semibold text-white text-sm">{data.name}</h3>
                <p className="text-xs text-gray-400">{data.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {data.guardrails_enabled && (
                <Shield className="h-3 w-3 text-green-400" title="Protected" />
              )}
              {data.reflection_enabled && (
                <Brain className="h-3 w-3 text-blue-400" title="Reflection Enabled" />
              )}
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="bg-gray-700/30 rounded p-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Model:</span>
              <Badge variant="secondary" className="text-xs">{data.model}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Pattern:</span>
              <span className="text-gray-300 capitalize">{data.reasoning_pattern}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">CoT Depth:</span>
              <span className="text-gray-300">{data.chain_of_thought_depth}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Temperature:</span>
              <span className="text-gray-300">{data.temperature}</span>
            </div>
          </div>

          {/* Execution Status */}
          {data.status === 'running' && data.execution && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300">Processing...</span>
                <span className="text-blue-300">{Math.round(data.execution.progress)}%</span>
              </div>
              <Progress value={data.execution.progress} className="h-1" />
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-blue-400" />
                  <span className="text-gray-300">{data.execution.tokensUsed}/{data.max_tokens}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-400" />
                  <span className="text-gray-300">{formatDuration(data.execution.duration)}</span>
                </div>
              </div>
              {data.execution.currentStep && (
                <div className="text-xs text-blue-300">
                  Step: {data.execution.currentStep}
                </div>
              )}
            </div>
          )}

          {/* Last Result */}
          {data.status === 'completed' && data.lastResult && (
            <div className="bg-green-900/20 border border-green-500/30 rounded p-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-300">Completed</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-300">
                    Confidence: {(data.lastResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-green-400" />
                  <span className="text-gray-300">{data.lastResult.tokensUsed} tokens</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-green-400" />
                  <span className="text-gray-300">{formatDuration(data.lastResult.duration)}</span>
                </div>
              </div>
              {showDetails && (
                <div className="text-xs text-gray-300 bg-gray-800/50 rounded p-2 mt-2">
                  <div className="font-medium mb-1">Output:</div>
                  <div className="text-gray-400">
                    {data.lastResult.output.length > 100 
                      ? data.lastResult.output.substring(0, 100) + '...'
                      : data.lastResult.output
                    }
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {data.status === 'error' && (
            <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
              <div className="flex items-center gap-2 text-xs text-red-300">
                <XCircle className="h-3 w-3" />
                <span>Execution failed</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={data.onConfigure}
              className="flex-1 text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={data.onTest}
              disabled={data.status === 'running'}
              className="flex-1 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Test
            </Button>

            {data.lastResult && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </>
  );
};