
import React from 'react';
import { Wrench, Shield } from 'lucide-react';
import { GraphHeaderProps } from './types';

export const GraphHeader: React.FC<GraphHeaderProps> = ({ toolCount }) => {
  return (
    <div className="absolute top-2 left-2 z-10 flex items-center space-x-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-900/50 rounded-md border border-purple-500/40 shadow-md">
        <Wrench size={14} className="text-purple-300" />
        <span className="text-xs font-medium text-purple-200">{toolCount} Tool{toolCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-900/50 rounded-md border border-amber-500/40 shadow-md">
        <Shield size={14} className="text-amber-300" />
        <span className="text-xs font-medium text-amber-200">Guardrails Active</span>
      </div>
    </div>
  );
};
