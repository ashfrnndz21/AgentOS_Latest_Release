import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Zap, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

import { StrandsAnalyticsViewProps } from '../types';

export const StrandsAnalyticsView: React.FC<StrandsAnalyticsViewProps> = ({
  analytics,
  executionTrace
}) => {
  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Clock size={16} />
              Execution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(analytics.workflowEfficiency.executionTime.average / 1000)}s
            </div>
            <div className="text-xs text-gray-400">
              Average execution time
            </div>
          </CardContent>
        </Card>

        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Zap size={16} />
              Token Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300 mb-1">
              {analytics.workflowEfficiency.tokenUsage.totalUsed.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">
              Total tokens consumed
            </div>
          </CardContent>
        </Card>

        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <TrendingUp size={16} />
              Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300 mb-1">
              {Math.round(analytics.workflowEfficiency.tokenUsage.efficiency * 100)}%
            </div>
            <div className="text-xs text-gray-400">
              Token efficiency score
            </div>
          </CardContent>
        </Card>

        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <BarChart3 size={16} />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-300 mb-1">
              {Math.round(executionTrace.metrics.successRate * 100)}%
            </div>
            <div className="text-xs text-gray-400">
              Workflow success rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">
              Reasoning Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Decision Accuracy</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={analytics.reasoningQuality.decisionAccuracy * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-white font-medium">
                    {Math.round(analytics.reasoningQuality.decisionAccuracy * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Context Utilization</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={analytics.reasoningQuality.contextUtilization * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-white font-medium">
                    {Math.round(analytics.reasoningQuality.contextUtilization * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">
              Collaboration Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Handoff Efficiency</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={analytics.collaborationPatterns.handoffEfficiency * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-white font-medium">
                    {Math.round(analytics.collaborationPatterns.handoffEfficiency * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Context Preservation</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={analytics.collaborationPatterns.contextPreservation * 100} 
                    className="w-24 h-2" 
                  />
                  <span className="text-white font-medium">
                    {Math.round(analytics.collaborationPatterns.contextPreservation * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tool Usage Analytics */}
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white">
            Tool Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.workflowEfficiency.toolUtilization.mostUsed.map((tool, index) => (
              <div key={tool} className="bg-gray-800/40 p-4 rounded border border-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{tool}</span>
                  <span className="text-sm text-gray-400">#{index + 1}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Efficiency</span>
                    <span className="text-green-300">
                      {Math.round((analytics.workflowEfficiency.toolUtilization.efficiency[tool] || 0) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Error Rate</span>
                    <span className="text-red-300">
                      {Math.round((analytics.workflowEfficiency.toolUtilization.errorRates[tool] || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};