/**
 * Execution Results Panel
 * Shows real-time workflow execution results and metrics
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Clock, 
  Zap, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  RotateCcw,
  TrendingUp,
  Activity,
  Target,
  Brain,
  GitBranch,
  Shield,
  Users
} from 'lucide-react';

interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  tokensUsed?: number;
  confidence?: number;
  output?: any;
  error?: string;
  metadata?: any;
}

interface ExecutionResult {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  totalTokens: number;
  totalCost: number;
  steps: ExecutionStep[];
  finalOutput?: any;
  error?: string;
  metrics: {
    successRate: number;
    averageConfidence: number;
    nodesExecuted: number;
    errorsEncountered: number;
  };
}

interface ExecutionResultsPanelProps {
  execution: ExecutionResult | null;
  isVisible: boolean;
  onClose: () => void;
  onRerun: () => void;
  onExport: () => void;
}

export const ExecutionResultsPanel: React.FC<ExecutionResultsPanelProps> = ({
  execution,
  isVisible,
  onClose,
  onRerun,
  onExport
}) => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  if (!isVisible || !execution) return null;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const getStepIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'strands-agent':
        return <Brain className="h-4 w-4 text-blue-400" />;
      case 'strands-decision':
        return <GitBranch className="h-4 w-4 text-yellow-400" />;
      case 'strands-guardrail':
        return <Shield className="h-4 w-4 text-red-400" />;
      case 'strands-aggregator':
        return <Users className="h-4 w-4 text-purple-400" />;
      default:
        return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'running':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const completedSteps = execution.steps.filter(s => s.status === 'completed').length;
  const failedSteps = execution.steps.filter(s => s.status === 'failed').length;
  const runningSteps = execution.steps.filter(s => s.status === 'running').length;

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Execution Results
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(execution.status)}>
            {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
          </Badge>
          {execution.totalDuration && (
            <span className="text-sm text-gray-400">
              {formatDuration(execution.totalDuration)}
            </span>
          )}
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="p-4 border-b border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{execution.steps.length}</div>
            <div className="text-xs text-gray-400">Total Steps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{completedSteps}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{execution.totalTokens}</div>
            <div className="text-xs text-gray-400">Tokens</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{formatCost(execution.totalCost)}</div>
            <div className="text-xs text-gray-400">Cost</div>
          </div>
        </div>

        {/* Progress Bar */}
        {execution.status === 'running' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-300">
                {completedSteps}/{execution.steps.length}
              </span>
            </div>
            <Progress 
              value={(completedSteps / execution.steps.length) * 100} 
              className="h-2"
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="steps" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 mx-4 mt-4">
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>

          {/* Steps Tab */}
          <TabsContent value="steps" className="flex-1 px-4 pb-4 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
                {execution.steps.map((step, index) => (
                  <Card 
                    key={step.nodeId}
                    className={`bg-gray-800/50 border-gray-600 cursor-pointer transition-all ${
                      selectedStep === step.nodeId ? 'border-blue-400 bg-blue-400/10' : ''
                    }`}
                    onClick={() => setSelectedStep(selectedStep === step.nodeId ? null : step.nodeId)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs text-white">
                            {index + 1}
                          </div>
                          {getStepIcon(step.nodeType)}
                          <div>
                            <div className="font-medium text-white text-sm">{step.nodeName}</div>
                            <div className="text-xs text-gray-400 capitalize">
                              {step.nodeType.replace('strands-', '')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(step.status)}
                          <Badge className={getStatusColor(step.status)}>
                            {step.status}
                          </Badge>
                        </div>
                      </div>

                      {step.duration && (
                        <div className="flex items-center gap-4 text-xs mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-300">{formatDuration(step.duration)}</span>
                          </div>
                          {step.tokensUsed && (
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-300">{step.tokensUsed} tokens</span>
                            </div>
                          )}
                          {step.confidence && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-300">{(step.confidence * 100).toFixed(0)}%</span>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedStep === step.nodeId && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          {step.output && (
                            <div className="bg-gray-700/50 rounded p-2 mb-2">
                              <div className="text-xs text-gray-400 mb-1">Output:</div>
                              <div className="text-xs text-gray-200 font-mono">
                                {typeof step.output === 'string' 
                                  ? step.output.length > 200 
                                    ? step.output.substring(0, 200) + '...'
                                    : step.output
                                  : JSON.stringify(step.output, null, 2).substring(0, 200)
                                }
                              </div>
                            </div>
                          )}
                          
                          {step.error && (
                            <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                              <div className="text-xs text-red-400 mb-1">Error:</div>
                              <div className="text-xs text-red-300">{step.error}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="flex-1 px-4 pb-4">
            <div className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-sm text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Success Rate</span>
                    <span className="text-green-400 font-medium">
                      {(execution.metrics.successRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Avg Confidence</span>
                    <span className="text-blue-400 font-medium">
                      {(execution.metrics.averageConfidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Nodes Executed</span>
                    <span className="text-white font-medium">{execution.metrics.nodesExecuted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Errors</span>
                    <span className="text-red-400 font-medium">{execution.metrics.errorsEncountered}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-sm text-white">Resource Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Total Tokens</span>
                    <span className="text-blue-400 font-medium">{execution.totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Total Cost</span>
                    <span className="text-yellow-400 font-medium">{formatCost(execution.totalCost)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Execution Time</span>
                    <span className="text-white font-medium">
                      {execution.totalDuration ? formatDuration(execution.totalDuration) : 'Running...'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Output Tab */}
          <TabsContent value="output" className="flex-1 px-4 pb-4 min-h-0">
            <ScrollArea className="h-full">
              {execution.finalOutput ? (
                <Card className="bg-green-900/20 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Final Output
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-800 rounded p-3 font-mono text-sm text-gray-200">
                      {typeof execution.finalOutput === 'string' 
                        ? execution.finalOutput
                        : JSON.stringify(execution.finalOutput, null, 2)
                      }
                    </div>
                  </CardContent>
                </Card>
              ) : execution.status === 'running' ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-blue-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-gray-400 text-sm">Execution in progress...</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No output available</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={onRerun}
            disabled={execution.status === 'running'}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Run Again
          </Button>
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};