
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WorkspaceHeader = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  
  const handleStartChat = () => {
    setIsRunning(true);
    
    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: "Chat session active",
        description: "Your agentic assistant is ready"
      });
    }, 1200);
  };
  
  return (
    <div className="px-4 py-3 flex items-center justify-between bg-black/80 border-b border-true-red/30">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-medium text-white">Agentic Chat</h2>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          className={`h-9 gap-1 text-sm ${
            isRunning 
              ? "bg-true-red hover:bg-true-red-dark text-white" 
              : "bg-true-red hover:bg-true-red-dark text-white"
          } shadow-lg border border-white/20`}
          onClick={handleStartChat}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <MessageCircle size={16} />
              <span>Start Chat</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
