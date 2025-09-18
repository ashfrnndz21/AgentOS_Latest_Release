import React from 'react';

const MCPGatewayTest: React.FC = () => {
  console.log('MCPGatewayTest rendering...');
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-4">MCP Gateway Test</h1>
      <p className="text-gray-400">This is a test to see if the component renders properly.</p>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-4">
        <p className="text-white">Test card content</p>
      </div>
    </div>
  );
};

export default MCPGatewayTest;