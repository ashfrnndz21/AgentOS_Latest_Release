
import React from 'react';
import { Database, MessageSquare } from 'lucide-react';

interface NodeIndicatorsProps {
  isToolNode: boolean;
  hasConversation: boolean;
  hasGuardrailActivation: boolean;
  toolDetails?: {
    executionTime?: string;
    databases?: string[];
    input?: string;
    output?: string;
    query?: string;
  };
}

export const NodeIndicators: React.FC<NodeIndicatorsProps> = ({
  isToolNode,
  hasConversation,
  hasGuardrailActivation,
  toolDetails
}) => {
  return (
    <div className="flex items-center justify-between mt-1">
      {isToolNode && toolDetails && (
        <div className="text-[9px] text-gray-400 pt-1">
          {toolDetails.executionTime && (
            <span className="text-purple-300">{toolDetails.executionTime}</span>
          )}
          {toolDetails.databases && toolDetails.databases.length > 0 && (
            <span className="ml-1 flex items-center">
              <Database size={8} className="text-purple-300 mr-0.5" />
              {toolDetails.databases.length}
            </span>
          )}
        </div>
      )}
      
      {/* Conversation indicator */}
      {hasConversation && (
        <div className={`flex items-center text-[9px] ${isToolNode ? '' : 'pt-1'}`}>
          <MessageSquare size={8} className={`${hasGuardrailActivation ? 'text-amber-300' : 'text-blue-300'} mr-0.5`} />
          <span className={hasGuardrailActivation ? 'text-amber-300' : 'text-blue-300'}>
            {hasGuardrailActivation ? 'Guardrail' : 'Chat'}
          </span>
        </div>
      )}
    </div>
  );
};
