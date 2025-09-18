
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatSuggestionsProps {
  suggestions?: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ suggestions, onSelectSuggestion }) => {
  const defaultSuggestions = [
    "Show me high value customers",
    "Which campaign has the best ROI?",
    "Compare retention campaigns",
    "What's our customer lifetime value?"
  ];
  
  const displaySuggestions = suggestions || defaultSuggestions;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="bg-beam-dark-accent/50 rounded-full p-3 mb-3">
        <MessageSquare className="h-6 w-6 text-beam-blue" />
      </div>
      <h3 className="text-white font-medium">Ask CVM Assistant</h3>
      <p className="text-gray-400 text-sm mt-2">
        Ask questions about customer segments, campaigns, or analytics.
      </p>
      <div className="grid grid-cols-1 gap-2 mt-4 w-full">
        {displaySuggestions.map((suggestion, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="justify-start text-left text-gray-300 hover:text-white border-gray-700 hover:bg-beam-dark-accent"
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};
