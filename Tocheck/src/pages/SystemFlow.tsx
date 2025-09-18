import React from 'react';
import { AgentOSArchitectureDesign } from '@/components/SystemFlow/AgentOSArchitectureDesign';

const SystemFlow: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">System Architecture Flow</h1>
        <p className="text-gray-400">
          Visualize how the Agent Command Centre connects to MCP Gateway, Agent Control Panel, and the entire system workflow
        </p>
      </div>
      
      <AgentOSArchitectureDesign />
    </div>
  );
};

export default SystemFlow;