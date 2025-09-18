
import React from 'react';
import { Clock } from 'lucide-react';

interface OperationProps {
  name: string;
  description: string;
  executionTime?: string;
  status?: 'success' | 'warning' | 'error';
}

export const NodeOperation: React.FC<OperationProps> = ({ 
  name, 
  description, 
  executionTime, 
  status 
}) => {
  return (
    <div className="text-[10px] bg-black/20 rounded p-1">
      <div className="flex items-center justify-between">
        <span className="font-medium text-white">{name}</span>
        {executionTime && (
          <span className="text-[8px] text-gray-400 flex items-center">
            <Clock size={8} className="mr-0.5" /> {executionTime}
          </span>
        )}
      </div>
      <p className="text-gray-300 mt-0.5">{description}</p>
    </div>
  );
};
