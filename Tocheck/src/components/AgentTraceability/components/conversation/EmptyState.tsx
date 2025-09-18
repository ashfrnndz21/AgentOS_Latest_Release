
import React from 'react';
import { MessageSquare } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-32 text-gray-400">
      <MessageSquare className="mr-2" size={18} />
      <span>Select a node to view details and conversation history</span>
    </div>
  );
};
