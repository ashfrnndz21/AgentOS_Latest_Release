
import React from 'react';
import { CheckCircle } from 'lucide-react';

export const CompletionScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="rounded-full bg-green-500/20 p-3">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h2 className="text-xl font-semibold text-white text-center">Agent Configuration Complete</h2>
      <p className="text-gray-400 text-center max-w-md">
        Your AI agent has been configured successfully and is ready to be created.
        Click "Create Agent" to finalize and add it to your workspace.
      </p>
    </div>
  );
};
