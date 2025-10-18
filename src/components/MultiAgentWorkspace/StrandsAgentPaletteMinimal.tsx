import React, { useState } from 'react';
import { Plus, Bot } from 'lucide-react';

interface StrandsAgentPaletteProps {
  onAddAgent: (agentType: string, agentData?: any) => void;
  onAddUtility: (nodeType: string, utilityData?: any) => void;
  onSelectMCPTool?: (tool: any) => void;
  onSelectStrandsTool?: (tool: any) => void;
}

export const StrandsAgentPaletteMinimal: React.FC<StrandsAgentPaletteProps> = ({
  onAddAgent,
  onAddUtility,
  onSelectMCPTool,
  onSelectStrandsTool
}) => {
  return (
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-r border-slate-600/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-600/30">
        <h2 className="text-lg font-semibold text-white mb-2">Agent Palette</h2>
        <p className="text-sm text-slate-400">Drag agents to build workflows</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="text-center text-slate-400 py-8">
          <Bot className="h-12 w-12 mx-auto mb-2 text-slate-500" />
          <p className="text-sm">Agent Palette</p>
          <p className="text-xs text-slate-500 mt-1">A2A orchestration agents will appear here</p>
        </div>
      </div>
    </div>
  );
};

