import React, { useState } from 'react';

const SimpleMCPDashboard: React.FC = () => {
  const [servers] = useState([
    {
      id: 'math-server-1',
      name: 'Math Operations Server',
      url: 'http://localhost:3001/mcp',
      status: 'connected',
      type: 'local',
      tools: ['add_numbers', 'multiply_numbers']
    },
    {
      id: 'text-server-1',
      name: 'Text Processing Server',
      url: 'http://localhost:3002/mcp',
      status: 'connected',
      type: 'local',
      tools: ['greet_user', 'analyze_text']
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">MCP Dashboard</h1>
            <p className="text-gray-400 mt-2">Monitor and test your Model Context Protocol servers</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg px-3 py-1">
              <span className="text-green-400 text-sm">{servers.length} Connected</span>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Servers</p>
                <p className="text-2xl font-bold text-white">{servers.length}</p>
              </div>
              <div className="text-2xl">🖥️</div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Available Tools</p>
                <p className="text-2xl font-bold text-white">{servers.reduce((acc, s) => acc + s.tools.length, 0)}</p>
              </div>
              <div className="text-2xl">🛠️</div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Health Status</p>
                <p className="text-2xl font-bold text-green-400">Healthy</p>
              </div>
              <div className="text-2xl">💚</div>
            </div>
          </div>
        </div>

        {/* Servers List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Servers</h2>
          {servers.map((server) => (
            <div key={server.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🟢</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{server.name}</h3>
                    <p className="text-gray-400 text-sm">{server.url}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                    {server.type.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
                    {server.status}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400">Tools</p>
                    <p className="text-white font-semibold">{server.tools.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="text-white font-semibold capitalize">{server.status}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
                    🧪 Test
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors">
                    ⚙️ Configure
                  </button>
                </div>
              </div>

              {/* Tools List */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Available Tools:</p>
                <div className="flex flex-wrap gap-2">
                  {server.tools.map((tool, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleMCPDashboard;