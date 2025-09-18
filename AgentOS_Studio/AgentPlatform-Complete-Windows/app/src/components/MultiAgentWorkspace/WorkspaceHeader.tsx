import React from 'react';
import { Workflow, Bot, Share2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WorkspaceHeader = () => {
  return (
    <div className="h-16 bg-beam-dark-accent border-b border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Workflow className="h-6 w-6 text-beam-blue" />
          <h1 className="text-xl font-bold text-white">Multi Agent Workspace</h1>
        </div>
        <div className="h-6 w-px bg-gray-600" />
        <span className="text-sm text-gray-400">Build integrated agentic workflows</span>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="bg-beam-dark border-gray-600 text-gray-300 hover:bg-beam-dark-accent">
          <Save className="h-4 w-4 mr-2" />
          Save Workflow
        </Button>
        <Button variant="outline" size="sm" className="bg-beam-dark border-gray-600 text-gray-300 hover:bg-beam-dark-accent">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button size="sm" className="bg-beam-blue hover:bg-beam-blue/90">
          <Bot className="h-4 w-4 mr-2" />
          Deploy
        </Button>
      </div>
    </div>
  );
};