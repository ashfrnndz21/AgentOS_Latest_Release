
import React from 'react';
import { ChatSuggestions } from './ChatSuggestions';

interface EmptyChatStateProps {
  onSelectSuggestion: (suggestion: string) => void;
  suggestions?: string[];
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onSelectSuggestion, suggestions }) => {
  return <ChatSuggestions onSelectSuggestion={onSelectSuggestion} suggestions={suggestions} />;
};
