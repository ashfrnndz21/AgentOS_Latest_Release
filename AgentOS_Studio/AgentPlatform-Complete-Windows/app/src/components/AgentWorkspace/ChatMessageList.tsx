
import React from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatReasoningOutput } from './ChatReasoningOutput';

export interface ChatMessageListProps {
  messages: any[];
  showReasoning?: boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ 
  messages,
  showReasoning = false
}) => {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div key={index} className="message-container">
          <ChatMessage message={message} />
          {showReasoning && message.reasoning && (
            <ChatReasoningOutput 
              reasoning={message.reasoning} 
              isVisible={true} 
            />
          )}
        </div>
      ))}
    </div>
  );
};
