/**
 * Workflow Execution Interface
 * Provides real-time execution monitoring and control
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Clock,
  Zap,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  BarChart3,
  Download,
  Share
} from 'lucide-react';

interface WorkflowExecutionInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string;
  onExecute: (input: any) => Promise<any>;
}

interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  tokensUsed?: number;
  output?: any;
  error?: string;
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
}

export const WorkflowExecutionInterface: React.FC<WorkflowExecutionInterfaceProps> = ({
  isOpen,
  onClose,
  workflowId,
  onExecute
}) => {
  const [inputData, setInputData] = useState('{\n  "message": "Hello, I need help with my account"\n}');
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);

  const handleExecute = async () => {
    try {
      setIsExecuting(true);
      const input = JSON.parse(inputData);
      
      // Create initial execution state
      const newExecution: ExecutionResult = {
        id: `exec_${Date.now()}`,
        status: 'running',
        startTime: new Date(),
        totalTokens: 0,
        totalCost: 0,
        steps: []
      };
      
      setExecution(newExecution);
      
      // Execute workflow
      const result = await onExecute(input);
      
      // Update execution with results
      const completedExecution: ExecutionResult = {
        ...newExecution,
        status: result.success ? 'completed' : 'failed',
        endTime: new Date(),
        totalDuration: result.execution_time,
        totalTokens: result.total_tokens || 0,
        totalCost: (result.total_tokens || 0) * 0.000006, // Rough cost estimate
        steps: result.node_results ? Object.entries(result.node_results).map(([nodeId, nodeResult]: [string, any]) => ({
          nodeId,
          nodeName: nodeResult.name || nodeId,
          nodeType: nodeResult.type || 'unknown',
          status: nodeResult.success ? 'completed' : 'failed',
          duration: nodeResult.execution_time,
          tokensUsed: nodeResult.tokens_used,
          output: nodeResult.output,
          error: nodeResult.error
        })) : [],
        finalOutput: result.output,
        error: result.error
      };
      
      setExecution(completedExecution);
      setExecutionHistory(prev => [completedExecution, ...prev.slice(0, 9)]); // Keep last 10
      
    } catch (error) {
      console.error('Execution failed:', error);
      setExecution(prev => prev ? {
        ...prev,
        status: 'failed',
        endTime: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      } : null);
    } finally {
      setIsExecuting(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 border-gray-700 text-white flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Play className="h-6 w-6 text-green-400" />
            Execute Workflow
          </DialogTitle>
          <p className="text-sm text-gray-400">
            Run your workflow with real data and see live results
          </p>
        </DialogHeader>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Left Panel - Input & Controls */}
          <div className="w-1/3 space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm">Input Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Label className="text-xs text-gray-400">JSON Input</Label>
                <Textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white font-mono text-sm mt-2"
                  rows={8}
                  placeholder="Enter JSON input data"
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm">Execution Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isExecuting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Workflow
                    </>
                  )}
                </Button>

                {execution && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Status:</span>
                      <Badge className={getStatusColor(execution.status)}>
                        {execution.status}
                      </Badge>
                    </div>
                    
                    {execution.totalDuration && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{formatDuration(execution.totalDuration)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Tokens:</span>
                      <span className="text-white">{execution.totalTokens.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-white">{formatCost(execution.totalCost)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Execution History */}
            {executionHistory.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Recent Executions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {executionHistory.map((exec) => (
                        <div
                          key={exec.id}
                          className="flex items-center justify-between p-2 rounded bg-gray-700/50 cursor-pointer hover:bg-gray-700"
                          onClick={() => setExecution(exec)}
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(exec.status)}
                            <span className="text-xs text-gray-300">
                              {exec.startTime.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {exec.totalDuration ? formatDuration(exec.totalDuration) : 'Running...'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Execution Results */}
          <div className="flex-1 space-y-4">
            {execution ? (
              <>
                {/* Execution Overview */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Execution Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{execution.steps.length}</div>
                        <div className="text-xs text-gray-400">Steps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {execution.steps.filter(s => s.status === 'completed').length}
                        </div>
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
                  </CardContent>
                </Card>

                {/* Step-by-Step Results */}
                <Card className="bg-gray-800/50 border-gray-700 flex-1">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Execution Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {execution.steps.map((step, index) => (
                          <div
                            key={step.nodeId}
                            className="border border-gray-600 rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-white">{step.nodeName}</div>
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
                              <div className="flex items-center gap-4 text-sm">
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
                              </div>
                            )}

                            {step.output && (
                              <div className="bg-gray-700/50 rounded p-3">
                                <div className="text-xs text-gray-400 mb-2">Output:</div>
                                <div className="text-sm text-gray-200 font-mono">
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
                              <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                                <div className="text-xs text-red-400 mb-2">Error:</div>
                                <div className="text-sm text-red-300">{step.error}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Final Output */}
                {execution.finalOutput && (
                  <Card className="bg-green-900/20 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2 text-green-400">
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
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Ready to Execute</h3>
                  <p className="text-gray-500">
                    Configure your input data and click "Execute Workflow" to see real-time results
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-700">
          <div className="flex gap-2">
            {execution && (
              <>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};