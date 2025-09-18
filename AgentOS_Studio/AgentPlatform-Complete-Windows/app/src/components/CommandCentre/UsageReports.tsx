
import React from 'react';
import { BarChart2 } from 'lucide-react';
import { ActionDialog } from './CreateAgent/ActionDialog';

interface UsageReportsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UsageReports: React.FC<UsageReportsProps> = ({ open, onOpenChange }) => {
  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Usage Reports"
      description="View AI usage metrics and reports"
      icon={<BarChart2 className="text-beam-blue" />}
    >
      <div className="p-4 text-gray-300 text-center">
        Usage reports will be displayed here.
      </div>
    </ActionDialog>
  );
};
