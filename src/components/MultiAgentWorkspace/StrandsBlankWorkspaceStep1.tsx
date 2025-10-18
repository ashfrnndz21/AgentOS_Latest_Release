import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { ModernWorkspaceHeader } from './ModernWorkspaceHeader';

export const StrandsBlankWorkspaceStep1 = () => {
  const [canvasNodeCount] = useState(0);
  const [canvasConnectionCount] = useState(0);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-slate-100 overflow-hidden">
      {/* Modern Header */}
      <ModernWorkspaceHeader />
      
      <div className="flex-1 flex w-full h-full overflow-hidden">
        {/* Simple Sidebar */}
        <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-r border-slate-600/30 p-4">
          <h2 className="text-lg font-medium text-white mb-4">Agent Palette</h2>
          <p className="text-slate-400 text-sm">A2A orchestration agents will appear here</p>
        </div>
        
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {/* Simple Toolbar */}
          <div className="bg-slate-800/40 backdrop-blur-lg border-b border-slate-600/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-400">{canvasNodeCount} Nodes</span>
                <span className="text-sm text-slate-400">{canvasConnectionCount} Connections</span>
              </div>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                Run Workflow
              </button>
            </div>
          </div>
          
          {/* Empty State Message */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-slate-800/40 rounded-full flex items-center justify-center border-2 border-dashed border-slate-600">
                <Plus className="w-12 h-12 text-slate-500" />
              </div>
              <h3 className="text-xl font-medium text-slate-300 mb-2">Start Building Your Strands Workflow</h3>
              <p className="text-slate-500 max-w-md">
                Drag agents from the palette to create your intelligent multi-agent workflow. 
                Strands will provide reasoning, tool integration, and smart handoffs.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-slate-400">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Strands Reasoning</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Smart Connections</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Tool Integration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

