import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { StrandsReasoningViewProps } from '../types';

export const StrandsReasoningView: React.FC<StrandsReasoningViewProps> = ({
  executionTrace,
  selectedNode,
  onNodeClick
}) => {
  const selectedNodeExecution = selectedNode ? executionTrace.nodeExecutions.get(selectedNode) : null;

  return (
    <div className="space-y-6">
      {/* Reasoning Overview */}
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Brain size={20} />
            Strands Reasoning Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/40 rounded-lg">
              <Target size={24} className="text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {Math.round(executionTrace.metrics.reasoningQuality * 100)}%
              </div>
              <div className="text-sm text-gray-400">Reasoning Quality</div>
            </div>
            
            <div className="text-center p-4 bg-gray-800/40 rounded-lg">
              <Lightbulb size={24} className="text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {executionTrace.executionPath.length}
              </div>
              <div className="text-sm text-gray-400">Reasoning Steps</div>
            </div>
            
            <div className="text-center p-4 bg-gray-800/40 rounded-lg">
              <TrendingUp size={24} className="text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {Math.round(executionTrace.metrics.averageConfidence * 100)}%
              </div>
              <div className="text-sm text-gray-400">Avg Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Reasoning Details */}
      {selectedNodeExecution ? (
        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">
              Reasoning: {selectedNodeExecution.nodeName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Objective */}
              <div>
                <h4 className="text-white font-medium mb-2">Objective</h4>
                <p className="text-gray-300 text-sm bg-gray-800/40 p-3 rounded border border-gray-700/30">
                  {selectedNodeExecution.reasoning.objective}
                </p>
              </div>

              {/* Approach */}
              <div>
                <h4 className="text-white font-medium mb-2">Approach</h4>
                <p className="text-gray-300 text-sm bg-gray-800/40 p-3 rounded border border-gray-700/30">
                  {selectedNodeExecution.reasoning.approach}
                </p>
              </div>

              {/* Reasoning Steps */}
              <div>
                <h4 className="text-white font-medium mb-2">Reasoning Steps</h4>
                <div className="space-y-3">
                  {selectedNodeExecution.reasoning.steps.map((step, index) => (
                    <div key={index} className="bg-gray-800/40 p-3 rounded border border-gray-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-400 font-medium">Step {step.step}</span>
                        <Badge className="bg-green-900/30 text-green-300 border-green-700/30">
                          {Math.round(step.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{step.description}</p>
                      <p className="text-gray-400 text-xs">{step.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusion */}
              <div>
                <h4 className="text-white font-medium mb-2">Conclusion</h4>
                <p className="text-gray-300 text-sm bg-gray-800/40 p-3 rounded border border-gray-700/30">
                  {selectedNodeExecution.reasoning.conclusion}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardContent className="text-center py-12">
            <Brain size={48} className="text-gray-500 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Select a Node</h3>
            <p className="text-gray-400 text-sm">
              Click on a node in the execution path to view detailed reasoning analysis
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};