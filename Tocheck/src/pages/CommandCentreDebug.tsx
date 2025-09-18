import React from 'react';
import { QuickActionsDebug } from '@/components/CommandCentre/QuickActionsDebug';

const CommandCentreDebug = () => {
  return (
    <div className="flex-1 h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Agent Command Centre - Debug</h1>
        <p className="text-gray-300 mb-8">
          Testing components step by step to identify the issue.
        </p>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Actions Debug</h2>
          <QuickActionsDebug />
        </div>
        
        <div className="mt-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-green-400">✅ Page loads successfully</p>
          <p className="text-green-400">✅ Basic components render</p>
          <p className="text-yellow-400">🔄 Testing QuickActions with CreateAgentDialog</p>
        </div>
      </div>
    </div>
  );
};

export default CommandCentreDebug;