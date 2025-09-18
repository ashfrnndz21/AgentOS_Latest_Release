
import React from 'react';
import { MessageSquare, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCvmChatContext } from './context/CvmChatContext';
import { toast } from '@/components/ui/use-toast';

export const CvmModeToggle: React.FC = () => {
  const { chatMode, setChatMode } = useCvmChatContext();

  const toggleMode = () => {
    setChatMode(!chatMode);
    toast({
      title: chatMode ? "UI Navigation Mode" : "Chat Mode",
      description: chatMode 
        ? "Switched to traditional UI navigation" 
        : "Ask questions to navigate customer value data",
      duration: 3000,
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleMode}
      className="flex items-center gap-2 border-gray-700 text-white hover:bg-beam-dark-accent"
    >
      {chatMode ? (
        <>
          <Columns size={16} className="text-beam-blue" />
          <span>UI Mode</span>
        </>
      ) : (
        <>
          <MessageSquare size={16} className="text-beam-blue" />
          <span>Chat Mode</span>
        </>
      )}
    </Button>
  );
};
