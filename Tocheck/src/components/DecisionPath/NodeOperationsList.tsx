
import React from 'react';
import { NodeOperation } from './NodeOperation';

interface Operation {
  name: string;
  description: string;
  executionTime?: string;
  status?: 'success' | 'warning' | 'error';
}

interface NodeOperationsListProps {
  operations: Operation[];
}

export const NodeOperationsList: React.FC<NodeOperationsListProps> = ({ operations }) => {
  if (!operations || operations.length === 0) return null;
  
  return (
    <div className="mt-3 pt-2 border-t border-white/10 space-y-2 overflow-y-auto max-h-40">
      {operations.map((op, index) => (
        <NodeOperation
          key={index}
          name={op.name}
          description={op.description}
          executionTime={op.executionTime}
          status={op.status}
        />
      ))}
    </div>
  );
};
