
import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';

export const CompletionScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="rounded-full bg-green-500/20 p-3 relative">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
      </div>
      <h2 className="text-xl font-semibold text-white text-center">Agent Configuration Complete</h2>
      <p className="text-gray-400 text-center max-w-md">
        Your AI agent has been configured successfully and is ready to be created.
        Click "Create Agent" to finalize and deploy it to your workspace.
      </p>
      <div className="text-xs text-gray-500 text-center">
        The agent will be created with your selected model, tools, and MCP integrations.
      </div>
    </div>
  );
};
