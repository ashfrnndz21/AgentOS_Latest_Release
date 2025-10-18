import React from 'react';

export const StrandsBlankWorkspaceTest = () => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-slate-100 overflow-hidden">
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-4">Strands Intelligence Workspace</h1>
        <p className="text-slate-300 text-lg mb-8">
          Advanced multi-agent workflows powered by Strands intelligence patterns and Ollama models.
        </p>
        
        <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-600/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Component</h2>
          <p className="text-slate-400">
            This is a test component to verify the routing is working correctly.
          </p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-slate-400">
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
  );
};

