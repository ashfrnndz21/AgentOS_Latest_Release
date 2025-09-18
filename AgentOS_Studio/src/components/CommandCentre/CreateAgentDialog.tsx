
import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { DebugWorkingDialog } from './CreateAgent/DebugWorkingDialog';

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAgentDialog: React.FC<CreateAgentDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  return <DebugWorkingDialog open={open} onOpenChange={onOpenChange} />;
};
