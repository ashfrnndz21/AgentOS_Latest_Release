
import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { WorkingAgentDialog } from './CreateAgent/WorkingAgentDialog';

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAgentDialog: React.FC<CreateAgentDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  return <WorkingAgentDialog open={open} onOpenChange={onOpenChange} />;
};
