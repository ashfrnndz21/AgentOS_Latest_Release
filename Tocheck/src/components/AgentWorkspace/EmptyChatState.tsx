
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Search, Database } from 'lucide-react';

interface EmptyChatStateProps {
  projectName: string | null;
  onShowRagDemo: () => void;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({ 
  projectName,
  onShowRagDemo
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="glass-panel bg-black/70 backdrop-blur-md border border-true-red/30 rounded-xl p-8 shadow-lg max-w-2xl">
        <div className="h-12 w-12 rounded-full bg-true-red/30 flex items-center justify-center mx-auto mb-6 border border-true-red/50">
          <Bot className="h-6 w-6 text-true-red" />
        </div>
        
        <h3 className="text-2xl font-semibold text-white mb-2">
          {projectName ? `Welcome to ${projectName}` : "Welcome to Agent Workspace"}
        </h3>
        
        <p className="text-gray-300 mb-6">
          Ask a question or select one of the suggestions below to start a conversation with the AI assistant.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <Button 
            variant="outline" 
            className="flex items-center justify-start border-true-red/30 bg-black/50 hover:border-true-red hover:bg-true-red/10 text-left h-auto py-3"
          >
            <Sparkles className="h-4 w-4 mr-2 text-amber-400" />
            <div className="flex flex-col items-start">
              <span className="text-white text-sm font-medium">Analyze Network Data</span>
              <span className="text-gray-400 text-xs">Review current performance metrics</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-start border-true-red/30 bg-black/50 hover:border-true-red hover:bg-true-red/10 text-left h-auto py-3"
          >
            <Bot className="h-4 w-4 mr-2 text-true-red" />
            <div className="flex flex-col items-start">
              <span className="text-white text-sm font-medium">Optimize Customer Segments</span>
              <span className="text-gray-400 text-xs">Identify high-value customer groups</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-start border-true-red/30 bg-black/50 hover:border-true-red hover:bg-true-red/10 text-left h-auto py-3"
            onClick={onShowRagDemo}
          >
            <Search className="h-4 w-4 mr-2 text-green-400" />
            <div className="flex flex-col items-start">
              <span className="text-white text-sm font-medium">Try RAG Demo</span>
              <span className="text-gray-400 text-xs">See AI retrieval in action</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-start border-true-red/30 bg-black/50 hover:border-true-red hover:bg-true-red/10 text-left h-auto py-3"
          >
            <Database className="h-4 w-4 mr-2 text-true-red" />
            <div className="flex flex-col items-start">
              <span className="text-white text-sm font-medium">ROI Forecasting</span>
              <span className="text-gray-400 text-xs">Predict investment returns</span>
            </div>
          </Button>
        </div>
        
        <p className="text-sm text-gray-400">
          You can also configure agent settings, connect tools, and manage data sources from the toolbar above.
        </p>
      </div>
    </div>
  );
};
