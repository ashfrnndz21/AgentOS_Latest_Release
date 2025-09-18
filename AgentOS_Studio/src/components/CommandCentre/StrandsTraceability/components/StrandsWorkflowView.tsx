import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { StrandsWorkflowViewProps } from '../types';

export const StrandsWorkflowView: React.FC<StrandsWorkflowViewProps> = ({
  executionTrace,
  visualization,
  selectedNode,
  onNodeClick
}) => {
  return (
    <div className="space-y-6">
      {/* Workflow Controls */}
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Network size={20} />
              Strands Workflow Visualization
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <Play size={16} className="mr-1" />
                Replay
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <Pause size={16} className="mr-1" />
                Pause
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <RotateCcw size={16} className="mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Interactive Workflow Canvas */}
          <div className="h-96 bg-gray-900/50 border border-gray-700/50 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <Network size={48} className="text-purple-400 mx-auto" />
              <div>
                <h3 className="text-white font-medium">Interactive Workflow Canvas</h3>
                <p className="text-gray-400 text-sm">
                  Visual representation of {executionTrace.workflowName}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Execution Path: {executionTrace.executionPath.join(' → ')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Details */}
      {selectedNode && (
        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">
              Node Details: {selectedNode}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300">
              <p>Selected node: {selectedNode}</p>
              <p className="text-sm text-gray-400 mt-2">
                Detailed node information and execution context will be displayed here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};