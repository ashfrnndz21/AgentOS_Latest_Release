import React from 'react';

export const StrandsBlankWorkspaceSimple = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-4">
          <h1 className="text-xl font-bold">Strands Intelligence Workspace</h1>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex">
          {/* Left sidebar - Agent Palette */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 p-4">
            <h2 className="text-lg font-semibold mb-4">Agent Palette</h2>
            <div className="space-y-2">
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="font-medium">Test Agent</div>
                <div className="text-sm text-gray-400">Sample agent for testing</div>
              </div>
            </div>
          </div>
          
          {/* Canvas area */}
          <div className="flex-1 bg-gray-900 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Strands Canvas</h3>
                <p className="text-gray-400">Drag agents from the palette to create workflows</p>
              </div>
            </div>
          </div>
          
          {/* Right sidebar - Properties */}
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            <h2 className="text-lg font-semibold mb-4">Properties</h2>
            <div className="text-gray-400">
              Select an agent or node to view properties
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



