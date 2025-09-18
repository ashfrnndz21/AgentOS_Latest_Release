
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertTriangle, Shield, Check } from 'lucide-react';
import type { ConversationMessage } from './types';

interface MessageItemProps {
  message: ConversationMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  return (
    <div 
      className={`p-3 rounded-lg ${
        message.type === 'user' 
          ? 'bg-gray-800/50 border-l-4 border-blue-600' 
          : message.type === 'agent'
            ? 'bg-gray-800/30 border-l-4 border-purple-600'
            : message.type === 'guardrail'
              ? 'bg-amber-900/20 border-l-4 border-amber-600'
              : 'bg-gray-800/20 border-l-4 border-gray-600'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          {message.type === 'user' ? (
            <div className="bg-blue-600 p-1 rounded-full">
              <MessageSquare size={12} />
            </div>
          ) : message.type === 'agent' ? (
            <div className="bg-purple-600 p-1 rounded-full">
              <MessageSquare size={12} />
            </div>
          ) : message.type === 'guardrail' ? (
            <div className="bg-amber-600 p-1 rounded-full">
              <AlertTriangle size={12} />
            </div>
          ) : (
            <div className="bg-gray-600 p-1 rounded-full">
              <Shield size={12} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className={`text-xs font-medium ${
              message.type === 'user' 
                ? 'text-blue-300' 
                : message.type === 'agent'
                  ? 'text-purple-300'
                  : message.type === 'guardrail'
                    ? 'text-amber-300'
                    : 'text-gray-300'
            }`}>
              {message.type === 'user' 
                ? 'User' 
                : message.type === 'agent'
                  ? 'Agent'
                  : message.type === 'guardrail'
                    ? 'Guardrail'
                    : 'System'}
            </div>
            <div className="text-[10px] text-gray-400">
              {message.timestamp}
            </div>
          </div>
          <div className="text-sm text-gray-200 mt-1">
            {message.content}
          </div>
          
          {message.type === 'guardrail' && message.guardrailType && (
            <div className="mt-1.5 flex items-center">
              <Badge className="text-[10px] bg-amber-900/30 text-amber-300 border-amber-600/30">
                {message.guardrailType === 'pii' 
                  ? 'PII Protection' 
                  : message.guardrailType === 'content'
                    ? 'Content Filter'
                    : 'Security Check'}
              </Badge>
              <span className="text-[10px] text-gray-400 ml-2 flex items-center">
                <Check size={10} className="text-green-500 mr-1" />
                Mitigated
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
