import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Brain, Database, Shield } from 'lucide-react';

export const CustomAgentNode = ({ data, selected }: any) => {
  return (
    <div className={`bg-beam-dark-accent border-2 rounded-lg p-4 min-w-[200px] ${
      selected ? 'border-beam-blue' : 'border-gray-600'
    } hover:border-beam-blue/70 transition-colors`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-beam-blue border-2 border-white"
      />
      
      <div className="flex items-center gap-2 mb-3">
        <Bot className="h-5 w-5 text-beam-blue" />
        <h3 className="text-white font-medium text-sm">{data.label || 'Agent'}</h3>
      </div>
      
      <div className="space-y-2 text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <span className="font-medium">Model:</span>
          <span>{data.model || 'gpt-4'}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Brain className="h-3 w-3" />
          <span>{data.reasoning || 'chain-of-thought'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {data.memory && <Database className="h-3 w-3 text-green-400" />}
          {data.guardrails?.length > 0 && <Shield className="h-3 w-3 text-amber-400" />}
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Status</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Ready</span>
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-beam-blue border-2 border-white"
      />
    </div>
  );
};