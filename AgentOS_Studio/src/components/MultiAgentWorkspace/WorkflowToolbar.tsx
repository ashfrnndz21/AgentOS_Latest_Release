import React from 'react';
import { Play, Square, RotateCcw, Share2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface WorkflowToolbarProps {
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  nodeCount: number;
  connectionCount: number;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  isRunning,
  onRun,
  onStop,
  nodeCount,
  connectionCount,
}) => {
  return (
    <div className="absolute top-4 left-4 z-10 bg-beam-dark-accent/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-lg">
      <div className="flex items-center gap-3">
        {/* Execution Controls */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button 
              onClick={onRun} 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={nodeCount === 0}
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          ) : (
            <Button onClick={onStop} size="sm" variant="destructive">
              <Square className="h-4 w-4 mr-1" />
              Stop
            </Button>
          )}
          
          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-beam-dark">
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-gray-600" />

        {/* Import/Export */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-beam-dark">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          
          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-beam-dark">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-gray-600" />

        {/* Workflow Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <span>{nodeCount} Nodes</span>
          <span>{connectionCount} Connections</span>
          {isRunning && (
            <span className="flex items-center gap-1 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Running
            </span>
          )}
        </div>
      </div>
    </div>
  );
};