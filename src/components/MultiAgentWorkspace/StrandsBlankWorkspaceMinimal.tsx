import React, { useState } from 'react';
import { ModernWorkspaceHeader } from './ModernWorkspaceHeader';
import { StrandsAgentPaletteWithMCP } from './StrandsAgentPaletteWithMCP';

export const StrandsBlankWorkspaceMinimal = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showProperties, setShowProperties] = useState(false);

  // Handle adding agents from palette
  const handleAddAgent = (agentType: string, agentData?: any) => {
    console.log('Adding agent:', agentType, agentData);
  };

  // Handle adding utilities from palette
  const handleAddUtility = (nodeType: string, utilityData?: any) => {
    console.log('Adding utility:', nodeType, utilityData);
  };

  // Handle MCP tool selection
  const handleSelectMCPTool = (tool: any) => {
    console.log('Selected MCP tool:', tool);
  };

  // Handle Strands tool selection
  const handleSelectStrandsTool = (tool: any) => {
    console.log('Selected Strands tool:', tool);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <ModernWorkspaceHeader />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Agent Palette */}
        <StrandsAgentPaletteWithMCP
          onAddAgent={handleAddAgent}
          onAddUtility={handleAddUtility}
          onSelectMCPTool={handleSelectMCPTool}
          onSelectStrandsTool={handleSelectStrandsTool}
        />

        {/* Center - Workflow Canvas */}
        <div className="flex-1 flex flex-col bg-gray-800">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Strands Intelligence Workspace</h2>
              <p className="text-gray-400 mb-8">Minimal version - no services loaded</p>
              <div className="bg-gray-700 p-6 rounded-lg max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Workflow Canvas</h3>
                <p className="text-gray-400 text-sm">
                  This is a minimal version of the Strands workspace. 
                  The agent palette on the left contains static tools and utilities.
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>• Strands Agents: Empty (no service connection)</p>
                  <p>• SDK Agents: Empty (no service connection)</p>
                  <p>• Utilities: Available (static definitions)</p>
                  <p>• MCP Tools: Empty (no service connection)</p>
                  <p>• Local Tools: Available (static definitions)</p>
                  <p>• External Tools: Available (static definitions)</p>
                  <p>• Ollama Agents: Empty (no service connection)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        {showProperties && selectedNode && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
            <p className="text-gray-400">Node properties would appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};
