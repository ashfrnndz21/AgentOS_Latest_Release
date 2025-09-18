
import React from 'react';
import { Bot } from 'lucide-react';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const AgentDialogHeader: React.FC = () => {
  return (
    <DialogHeader>
      <DialogTitle className="text-xl flex items-center gap-2">
        <Bot className="text-ptt-blue" />
        Create New Agent
      </DialogTitle>
      <DialogDescription className="text-ptt-gray-medium">
        Configure a new AI agent for your project
      </DialogDescription>
    </DialogHeader>
  );
};
