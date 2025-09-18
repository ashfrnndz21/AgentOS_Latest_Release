import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OllamaModelSelector } from './OllamaModelSelector';
import { OllamaStatus } from './OllamaStatus';

interface OllamaModelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OllamaModelsDialog: React.FC<OllamaModelsDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Ollama Model Management</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Status Section */}
          <OllamaStatus />
          
          {/* Model Management Section */}
          <OllamaModelSelector
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
          />
          
          {selectedModel && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-sm text-green-400">
                ✅ Selected Model: <span className="font-medium">{selectedModel}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This model can now be used in agent creation
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};