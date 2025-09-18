/**
 * Debug version of adaptation dialog to isolate white screen issue
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DisplayableOllamaAgent } from '@/lib/services/StrandsAgentService';

interface DebugAdaptationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ollamaAgent: DisplayableOllamaAgent | null;
}

export const DebugAdaptationDialog: React.FC<DebugAdaptationDialogProps> = ({
  isOpen,
  onClose,
  ollamaAgent
}) => {
  console.log('DebugAdaptationDialog rendered with:', { isOpen, ollamaAgent });

  if (!ollamaAgent) {
    console.log('No ollama agent provided');
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Debug: {ollamaAgent.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3>Basic Info</h3>
            <p>Name: {ollamaAgent.name}</p>
            <p>Role: {ollamaAgent.role}</p>
            <p>Model: {ollamaAgent.model}</p>
          </div>

          <div>
            <h3>Optional Fields</h3>
            <p>Personality: {ollamaAgent.personality || 'N/A'}</p>
            <p>Expertise: {ollamaAgent.expertise || 'N/A'}</p>
          </div>

          <div>
            <h3>Guardrails</h3>
            <p>Enabled: {ollamaAgent.guardrails?.enabled ? 'Yes' : 'No'}</p>
            <p>Safety Level: {ollamaAgent.guardrails?.safety_level || 'N/A'}</p>
          </div>

          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};