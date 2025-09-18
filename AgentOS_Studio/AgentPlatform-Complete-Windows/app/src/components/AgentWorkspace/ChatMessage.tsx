
import React, { useState } from 'react';
import { Bot, Eye, EyeOff } from 'lucide-react';
import { Message } from './types';
import { Button } from '@/components/ui/button';
import { ChatReasoningOutput } from './ChatReasoningOutput';
import { useMessageReasoning } from './hooks/useMessageReasoning';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const { mockReasoning } = useMessageReasoning(message);

  const toggleReasoning = () => {
    setShowReasoning(!showReasoning);
  };

  return (
    <div 
      className={`p-4 rounded-lg max-w-3xl ${
        message.role === 'user' 
          ? 'ml-auto bg-beam-blue/20 border border-beam-blue/30 text-white' 
          : 'mr-auto bg-beam-dark-accent/70 border border-gray-700/50 text-gray-200'
      }`}
    >
      <div className="flex items-start mb-2">
        <div className={`flex items-center text-xs font-medium ${
          message.role === 'user' ? 'text-beam-blue-light' : 'text-purple-400'
        }`}>
          {message.role === 'user' ? 
            <MessageUserBadge /> : 
            <MessageAssistantBadge />
          }
          <span className="ml-2 text-gray-500">{message.timestamp}</span>
          
          {message.role === 'assistant' && mockReasoning && (
            <ReasoningToggleButton 
              showReasoning={showReasoning} 
              toggleReasoning={toggleReasoning} 
            />
          )}
        </div>
      </div>
      <p className="whitespace-pre-line">{message.content}</p>
      
      {message.role === 'assistant' && mockReasoning && (
        <ChatReasoningOutput 
          reasoning={mockReasoning} 
          isVisible={showReasoning} 
        />
      )}
    </div>
  );
};

// User badge component
const MessageUserBadge = () => (
  <div className="flex items-center">
    <div className="w-6 h-6 rounded-full bg-beam-blue/30 border border-beam-blue/50 flex items-center justify-center mr-2">
      <span className="text-xs">You</span>
    </div>
    User
  </div>
);

// Assistant badge component
const MessageAssistantBadge = () => (
  <div className="flex items-center">
    <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-600/50 flex items-center justify-center mr-2">
      <Bot size={12} />
    </div>
    Assistant
  </div>
);

// Reasoning toggle button component
interface ReasoningToggleButtonProps {
  showReasoning: boolean;
  toggleReasoning: () => void;
}

const ReasoningToggleButton: React.FC<ReasoningToggleButtonProps> = ({ 
  showReasoning, 
  toggleReasoning 
}) => (
  <Button 
    variant="ghost" 
    size="sm" 
    className="ml-2 h-6 px-2 text-xs" 
    onClick={toggleReasoning}
  >
    {showReasoning ? (
      <><EyeOff size={12} className="mr-1" /> Hide reasoning</>
    ) : (
      <><Eye size={12} className="mr-1" /> Show reasoning</>
    )}
  </Button>
);
