import React from 'react';

export const DebugPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Debug Page</h1>
      <p className="text-gray-400 mb-4">If you can see this, the app is working!</p>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-2">App Status</h2>
          <p className="text-green-400">✅ React is rendering</p>
          <p className="text-green-400">✅ Routing is working</p>
          <p className="text-green-400">✅ Tailwind CSS is loaded</p>
        </div>
        
        <div className="p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-2">Navigation Test</h2>
          <p className="text-gray-400">Try navigating to different pages using the sidebar.</p>
        </div>
      </div>
    </div>
  );
};