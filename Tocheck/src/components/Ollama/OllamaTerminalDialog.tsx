import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OllamaTerminal } from './OllamaTerminal';

interface OllamaTerminalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OllamaTerminalDialog: React.FC<OllamaTerminalDialogProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Ollama Terminal</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <OllamaTerminal height="h-[60vh]" />
        </div>
      </DialogContent>
    </Dialog>
  );
};