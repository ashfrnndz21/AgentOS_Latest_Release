
import React from 'react';
import { Bot } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: ChatMessage;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content, timestamp } = message;
  
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] p-3 rounded-lg ${
          role === 'user' 
            ? 'bg-beam-blue/20 border border-beam-blue/30' 
            : 'bg-beam-dark-accent/50 border border-gray-700/50'
        }`}
      >
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          {role === 'assistant' && <Bot className="h-3 w-3 text-beam-blue" />}
          {role === 'user' ? 'You' : 'CVM Assistant'}
          <span className="opacity-50">• {timestamp}</span>
        </div>
        <p className="text-sm text-white">{content}</p>
      </div>
    </div>
  );
};
