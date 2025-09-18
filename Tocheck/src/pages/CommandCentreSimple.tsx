import React from 'react';

const CommandCentreSimple = () => {
  return (
    <div className="flex-1 h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Agent Command Centre - Simple Test</h1>
        <p className="text-gray-300 mb-8">
          This is a simple test to verify routing works. If you see this, the route is working.
        </p>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Actions Test</h2>
          <button 
            onClick={() => alert('Button works!')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Button
          </button>
        </div>
        
        <div className="mt-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/ollama-agents'}
              className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Go to Ollama Agents
            </button>
            <button 
              onClick={() => window.location.href = '/documents'}
              className="block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Go to Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCentreSimple;