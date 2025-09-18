
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Database, Clock } from 'lucide-react';

interface OperationsListProps {
  operations: Array<{
    name: string;
    description: string;
    executionTime?: string;
    status?: 'success' | 'warning' | 'error';
  }>;
}

export const OperationsList: React.FC<OperationsListProps> = ({ operations }) => {
  if (operations.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-green-300 mb-2 flex items-center">
        <Database size={14} className="mr-1" /> Operations
      </h3>
      <div className="space-y-2">
        {operations.map((op, index) => (
          <div 
            key={index} 
            className="p-2 rounded-lg bg-green-900/10 border-l-4 border-green-700"
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-green-300">{op.name}</span>
              {op.executionTime && (
                <span className="text-xs text-gray-400 flex items-center">
                  <Clock size={12} className="mr-1" /> {op.executionTime}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-300 mt-1">{op.description}</p>
            {op.status && (
              <div className="mt-1.5">
                <Badge className={`text-[10px] ${
                  op.status === 'success' 
                    ? 'bg-green-900/30 text-green-300 border-green-700/30' 
                    : op.status === 'warning'
                      ? 'bg-amber-900/30 text-amber-300 border-amber-700/30'
                      : 'bg-red-900/30 text-red-300 border-red-700/30'
                }`}>
                  {op.status}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
