import React from 'react';

export const SimpleDocumentTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Simple Document Test</h1>
      <p className="text-gray-400">This is a test to see if the routing works.</p>
      <div className="mt-4 p-4 bg-gray-800 rounded">
        <p className="text-green-400">✅ If you can see this, the app is working!</p>
      </div>
    </div>
  );
};