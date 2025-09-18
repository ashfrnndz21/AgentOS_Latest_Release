
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Bot } from 'lucide-react';

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const ActionDialog: React.FC<ActionDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-beam-dark-accent border-gray-700 text-white sm:max-w-md z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader onClick={(e) => e.stopPropagation()}>
          <DialogTitle className="text-xl flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        {children}
      </DialogContent>
    </Dialog>
  );
};
