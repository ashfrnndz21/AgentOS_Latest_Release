import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  X,
  Clock
} from 'lucide-react';
import { ollamaAgentService, OllamaAgentConfig } from '@/lib/services/OllamaAgentService';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  duration?: number;
  tokens?: number;
}

interface InlineAgentChatProps {
  agent: OllamaAgentConfig;
  onClose: () => void;
}

export const InlineAgentChat: React.FC<InlineAgentChatProps> = ({ agent, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize conversation
  useEffect(() => {
    let isMounted = true;
    console.log('Initializing conversation for agent:', agent.id);
    
    const initConversation = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Conversation initialization timeout')), 10000)
        );
        
        const conversationPromise = ollamaAgentService.createConversation(agent.id);
        
        const convId = await Promise.race([conversationPromise, timeoutPromise]) as string;
        
        if (!isMounted) return; // Component unmounted, don't update state
        
        console.log('Conversation created:', convId);
        setConversationId(convId);
        
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Hello! I'm ${agent.name}. ${agent.systemPrompt || 'How can I help you today?'}`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        console.log('Welcome message added');
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Failed to initialize conversation:', error);
        toast({
          title: "Failed to initialize chat",
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: "destructive"
        });
        
        // Set a fallback conversation ID to prevent further issues
        setConversationId('fallback-' + Date.now());
      }
    };

    initConversation();
    
    return () => {
      isMounted = false;
    };
  }, [agent.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isGenerating || !conversationId) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsGenerating(true);

    try {
      const startTime = Date.now();
      const execution = await ollamaAgentService.executeAgent(
        agent.id,
        currentMessage.trim(),
        conversationId
      );



      if (execution.success) {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: execution.output,
          timestamp: new Date(),
          duration: execution.duration,
          tokens: execution.tokensUsed
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        toast({
          title: "Response received",
          description: `${execution.tokensUsed} tokens in ${execution.duration}ms`,
        });
      } else {
        throw new Error(execution.error || 'Failed to generate response');
      }

    } catch (error) {
      toast({
        title: "Failed to generate response",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });

      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Card className="bg-gray-800 border-gray-700 h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-purple-400" size={20} />
            Chat with {agent.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {agent.model}
            </Badge>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === 'user' ? (
                      <User size={14} />
                    ) : (
                      <Bot size={14} />
                    )}
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.duration && (
                      <div className="flex items-center gap-1 text-xs opacity-70">
                        <Clock size={12} />
                        <span>{formatDuration(message.duration)}</span>
                        {message.tokens && (
                          <span>• {message.tokens} tokens</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex gap-3 justify-start">
                <div className="bg-gray-700 text-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bot size={14} />
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message ${agent.name}...`}
              disabled={isGenerating}
              className="bg-gray-700 border-gray-600"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isGenerating || !currentMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
};