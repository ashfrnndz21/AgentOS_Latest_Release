import React from 'react';

export const OllamaAgentDashboardMinimal: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Minimal Ollama Agent Dashboard</h1>
        <p className="text-gray-400">This is a minimal test version to isolate the white screen issue.</p>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Test Status</h2>
          <p className="text-green-400">✅ Component is rendering correctly</p>
          <p className="text-green-400">✅ No white screen issue</p>
          <p className="text-yellow-400">⚠️ This means the issue is in the full component</p>
        </div>
      </div>
    </div>
  );
};

export default OllamaAgentDashboardMinimal;