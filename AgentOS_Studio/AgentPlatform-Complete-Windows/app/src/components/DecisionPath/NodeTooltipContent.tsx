
import React from 'react';
import { TooltipContent } from '@/components/ui/tooltip';

interface NodeTooltipContentProps {
  label: string;
  content: string;
  type: string;
  hasOperations?: boolean;
  operationsCount?: number;
  hasConversation?: boolean;
  hasGuardrailActivation?: boolean;
}

export const NodeTooltipContent: React.FC<NodeTooltipContentProps> = ({
  label,
  content,
  type,
  hasOperations,
  operationsCount,
  hasConversation,
  hasGuardrailActivation
}) => {
  return (
    <TooltipContent side="top" className="max-w-xs bg-gray-900/90 border-gray-700">
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="text-xs text-gray-300 mt-1 max-w-xs break-words">{content}</div>
      {type === 'alternate' && (
        <div className="text-xs text-amber-300 mt-1">Alternate path (guardrail triggered)</div>
      )}
      {type === 'tool' && (
        <div className="text-xs text-purple-300 mt-1">Tool usage (click for details)</div>
      )}
      {hasOperations && (
        <div className="text-xs text-green-300 mt-1">{operationsCount} operations</div>
      )}
      {hasConversation && (
        <div className="text-xs text-blue-300 mt-1">Click to view conversation history</div>
      )}
      {hasGuardrailActivation && (
        <div className="text-xs text-amber-300 mt-1">Guardrail was activated</div>
      )}
    </TooltipContent>
  );
};
