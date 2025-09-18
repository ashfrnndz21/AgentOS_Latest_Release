
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PanelRight, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WorkspaceToolbarProps {
  showProperties: boolean;
  toggleProperties: () => void;
  projectName: string | null;
}

export const WorkspaceToolbar = ({ 
  showProperties, 
  toggleProperties,
  projectName 
}: WorkspaceToolbarProps) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefreshClick = () => {
    setIsRefreshing(true);
    toast({
      title: "Refreshing Chat Context",
      description: "Updating chat with the latest information.",
    });
    
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Chat Context Updated",
        description: "Your conversation context has been refreshed.",
      });
    }, 1500);
  };

  if (!projectName) return null;

  return (
    <div className="p-2 border-b border-gray-700/50 bg-beam-dark-accent/20 flex items-center justify-between">
      <h3 className="text-white font-medium ml-2">{projectName}</h3>
      
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-8 text-sm transition-all flex gap-1 items-center", 
            isRefreshing && "text-beam-blue",
            "hover:bg-gray-800/30"
          )}
          onClick={handleRefreshClick}
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          <span className="hidden md:inline">Refresh Context</span>
        </Button>
        
        <Separator orientation="vertical" className="mx-2 h-6 bg-gray-700/50" />
        
        <Button 
          variant={showProperties ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 transition-colors flex gap-1 items-center", 
            showProperties ? "bg-beam-blue hover:bg-beam-blue-dark" : "hover:text-beam-blue hover:bg-gray-800/30"
          )}
          onClick={toggleProperties}
        >
          <PanelRight size={14} />
          <span className="hidden md:inline">{showProperties ? "Hide Info" : "Show Info"}</span>
        </Button>
      </div>
    </div>
  );
};
