import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Network
} from 'lucide-react';

import { StrandsOverviewProps } from '../types';

export const StrandsOverview: React.FC<StrandsOverviewProps> = ({
  executionTrace,
  analytics,
  onNodeClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'running':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Execution Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Network size={16} />
              Workflow Execution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">
                  {executionTrace.executionPath.length}
                </span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(executionTrace.status)}
                  <span className={`text-sm font-medium ${getStatusColor(executionTrace.status)}`}>
                    {executionTrace.status}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Nodes executed in {Math.round(executionTrace.metrics.totalExecutionTime / 1000)}s
              </div>
              <Progress 
                value={executionTrace.status === 'completed' ? 100 : 75} 
                className="h-1.5" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Brain size={16} />
              Reasoning Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-300">
                  {Math.round(executionTrace.metrics.averageConfidence * 100)}%
                </span>
                <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/30">
                  High
                </Badge>
              </div>
              <div className="text-xs text-gray-400">
                Average confidence across {executionTrace.executionPath.length} agents
              </div>
              <Progress 
                value={executionTrace.metrics.averageConfidence * 100} 
                className="h-1.5" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Zap size={16} />
              Token Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-300">
                  {Math.round(analytics.workflowEfficiency.tokenUsage.efficiency * 100)}%
                </span>
                <Badge className="bg-blue-900/30 text-blue-300 border-blue-700/30">
                  Optimal
                </Badge>
              </div>
              <div className="text-xs text-gray-400">
                {executionTrace.metrics.totalTokensUsed.toLocaleString()} tokens used
              </div>
              <Progress 
                value={analytics.workflowEfficiency.tokenUsage.efficiency * 100} 
                className="h-1.5" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Shield size={16} />
              Safety & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-300">
                  {Math.round(analytics.industrialMetrics.safetyCompliance * 100)}%
                </span>
                <Badge className="bg-green-900/30 text-green-300 border-green-700/30">
                  Compliant
                </Badge>
              </div>
              <div className="text-xs text-gray-400">
                All safety protocols validated
              </div>
              <Progress 
                value={analytics.industrialMetrics.safetyCompliance * 100} 
                className="h-1.5" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Path Visualization */}
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Target size={20} />
            Strands Execution Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Execution Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500"></div>
              <div className="space-y-4">
                {executionTrace.executionPath.map((nodeId, index) => {
                  const nodeExecution = executionTrace.nodeExecutions.get(nodeId);
                  if (!nodeExecution) return null;

                  return (
                    <div 
                      key={nodeId} 
                      className="relative flex items-center gap-4 cursor-pointer hover:bg-gray-800/30 p-2 rounded-lg transition-colors"
                      onClick={() => onNodeClick?.(nodeId)}
                    >
                      <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{index + 1}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{nodeExecution.nodeName}</h4>
                            <p className="text-gray-400 text-sm">{nodeExecution.nodeType}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm text-gray-300">
                                {Math.round(nodeExecution.duration / 1000)}s
                              </div>
                              <div className="text-xs text-gray-500">
                                {nodeExecution.tokensConsumed} tokens
                              </div>
                            </div>
                            <Badge 
                              className={`${
                                nodeExecution.confidence > 0.9 
                                  ? 'bg-green-900/30 text-green-300 border-green-700/30'
                                  : nodeExecution.confidence > 0.8
                                  ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/30'
                                  : 'bg-red-900/30 text-red-300 border-red-700/30'
                              }`}
                            >
                              {Math.round(nodeExecution.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Reasoning Preview */}
                        <div className="mt-2 p-2 bg-gray-800/40 rounded border border-gray-700/30">
                          <p className="text-xs text-gray-300 line-clamp-2">
                            {nodeExecution.reasoning.objective}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <TrendingUp size={20} />
              Workflow Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Context Efficiency</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={executionTrace.metrics.contextEfficiency * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-white font-medium">
                    {Math.round(executionTrace.metrics.contextEfficiency * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Reasoning Quality</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={executionTrace.metrics.reasoningQuality * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-white font-medium">
                    {Math.round(executionTrace.metrics.reasoningQuality * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Success Rate</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={executionTrace.metrics.successRate * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-white font-medium">
                    {Math.round(executionTrace.metrics.successRate * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Activity size={20} />
              Industrial Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Safety Compliance</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={analytics.industrialMetrics.safetyCompliance * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-green-300 font-medium">
                    {Math.round(analytics.industrialMetrics.safetyCompliance * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Process Efficiency</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={analytics.industrialMetrics.processEfficiency * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-blue-300 font-medium">
                    {Math.round(analytics.industrialMetrics.processEfficiency * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Regulatory Compliance</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={analytics.industrialMetrics.regulatoryCompliance * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-purple-300 font-medium">
                    {Math.round(analytics.industrialMetrics.regulatoryCompliance * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};