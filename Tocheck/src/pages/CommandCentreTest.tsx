import React from 'react';

const CommandCentreTest = () => {
  return (
    <div className="flex-1 h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Agent Command Centre - Test</h1>
        <p className="text-gray-300">
          This is a test version to isolate the error. If you can see this, the routing works.
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create Agent
            </button>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Agent Status</h3>
            <p className="text-green-400">All systems operational</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <p className="text-gray-400">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCentreTest;