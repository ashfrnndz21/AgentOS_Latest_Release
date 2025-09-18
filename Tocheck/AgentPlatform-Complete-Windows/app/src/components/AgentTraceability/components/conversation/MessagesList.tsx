
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { MessageItem } from './MessageItem';
import type { ConversationMessage } from './types';

interface MessagesListProps {
  messages: ConversationMessage[];
  showHeader: boolean;
}

export const MessagesList: React.FC<MessagesListProps> = ({ messages, showHeader }) => {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-3">
      {showHeader && (
        <h3 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
          <MessageSquare size={14} className="mr-1" /> Conversation
        </h3>
      )}
      
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};
