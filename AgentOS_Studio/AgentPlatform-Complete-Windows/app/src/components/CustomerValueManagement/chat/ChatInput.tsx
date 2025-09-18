
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading }) => {
  const [userInput, setUserInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      onSubmit(userInput.trim());
      setUserInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Textarea
          placeholder="Ask about customer segments, campaigns..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="resize-none min-h-[60px] max-h-[120px] bg-beam-dark-accent/30 border-beam-blue/40 focus:border-beam-blue/70 text-white pr-10"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-beam-blue hover:bg-beam-blue-dark"
          disabled={isLoading || !userInput.trim()}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
};
