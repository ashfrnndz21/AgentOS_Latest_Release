
import React, { useRef } from 'react';
import { Send, Paperclip, Bot } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LangChainToggle } from './LangChainToggle';
import { ApiKeyInput } from './ApiKeyInput';

interface ChatInputFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handlePromptSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  useLangChain: boolean;
  setUseLangChain: (enabled: boolean) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  apiKeyValid: boolean;
}

export const ChatInputForm: React.FC<ChatInputFormProps> = ({
  prompt,
  setPrompt,
  handlePromptSubmit,
  isLoading,
  useLangChain,
  setUseLangChain,
  apiKey,
  setApiKey,
  apiKeyValid
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handlePromptSubmit} className="max-w-5xl mx-auto">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder="Type your message here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-24 bg-beam-dark-accent/30 border-beam-blue/40 focus:border-beam-blue/70 resize-none pr-16 text-white rounded-xl shadow-inner shadow-beam-blue/5"
        />
        <div className="absolute bottom-3 right-3 flex items-center space-x-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full bg-beam-dark-accent/50 hover:text-beam-blue hover:bg-beam-dark-accent"
            disabled={isLoading}
            title="Add attachment"
          >
            <Paperclip size={16} />
          </Button>
          <Button
            type="submit"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full transition-all duration-200",
              isLoading 
                ? "bg-purple-600 hover:bg-purple-700" 
                : "bg-beam-blue hover:bg-beam-blue-dark"
            )}
            disabled={isLoading || !prompt.trim() || (useLangChain && !apiKeyValid)}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></div>
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4 space-y-4 md:space-y-0">
        <div className="text-xs text-gray-500">
          {isLoading ? 
            <span className="flex items-center text-beam-blue">
              <Bot size={14} className="mr-1" /> Assistant is thinking...
            </span> : 
            "Press Enter to send, Shift+Enter for new line"
          }
        </div>
        <div className="flex items-center space-x-4">
          <LangChainToggle 
            enabled={useLangChain} 
            onChange={setUseLangChain}
            apiKeyValid={apiKeyValid}
          />
          {useLangChain && (
            <div className="flex-1 min-w-[300px]">
              <ApiKeyInput 
                apiKey={apiKey} 
                setApiKey={setApiKey} 
              />
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
