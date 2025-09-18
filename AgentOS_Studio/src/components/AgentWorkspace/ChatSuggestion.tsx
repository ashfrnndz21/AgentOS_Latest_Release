
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatSuggestionProps {
  suggestion: string;
  onSelect: (suggestion: string) => void;
}

export const ChatSuggestion: React.FC<ChatSuggestionProps> = ({ 
  suggestion, 
  onSelect 
}) => {
  return (
    <div
      onClick={() => onSelect(suggestion)}
      className="p-4 border border-gray-700/50 rounded-lg text-base text-gray-300 bg-beam-dark-accent/40 cursor-pointer hover:bg-beam-dark-accent/70 hover:border-beam-blue/30 hover:text-white transition-colors flex items-center"
    >
      <MessageCircle size={14} className="mr-2 text-beam-blue" />
      {suggestion}
    </div>
  );
};
