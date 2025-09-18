
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { ChatSuggestions } from './ChatSuggestions';
import { EmptyChatState } from './EmptyChatState';
import { useCvmChat } from './useCvmChat';
import { CvmAgents } from './CvmAgents';
import { useCvmChatContext } from '../context/CvmChatContext';

export const CvmChatInterface = () => {
  const { chatMessages } = useCvmChatContext();
  const { isLoading, processQuery } = useCvmChat();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Suggestions for the empty state
  const suggestions = [
    "What's the value of my high-value customers?",
    "Show me segment performance trends",
    "Compare campaign ROI across segments",
    "Which segment has the highest churn rate?",
    "What's our best performing campaign?"
  ];

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Handle form submission
  const handleSubmit = (query: string) => {
    if (query.trim()) {
      processQuery(query);
    }
  };

  return (
    <Card className="bg-beam-dark-accent/70 border-gray-700 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-white flex items-center">
            <Bot className="mr-2 h-5 w-5 text-beam-blue" />
            CVM Assistant
          </CardTitle>
          <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-700/30">
            {chatMessages.length > 0 ? 'Active' : 'Ready'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-3 pt-2">
        {/* Agents section */}
        <CvmAgents />
        
        {/* Chat messages */}
        <ScrollArea className="flex-grow pr-4 mb-4">
          {chatMessages.length === 0 ? (
            <EmptyChatState 
              onSelectSuggestion={handleSubmit} 
              suggestions={suggestions}
            />
          ) : (
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              <div ref={endOfMessagesRef} />
            </div>
          )}
        </ScrollArea>

        {/* Suggestions */}
        {chatMessages.length === 0 && (
          <ChatSuggestions 
            suggestions={suggestions} 
            onSelectSuggestion={handleSubmit} 
          />
        )}

        {/* Chat input */}
        <ChatInput 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </CardContent>
    </Card>
  );
};
