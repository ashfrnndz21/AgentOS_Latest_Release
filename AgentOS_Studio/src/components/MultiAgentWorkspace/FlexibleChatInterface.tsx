import { validateModel } from '@/utils/modelValidator';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { FlexibleChatService, ChatConfig, ChatMessage } from '@/lib/services/FlexibleChatService';

interface FlexibleChatInterfaceProps {
  config: ChatConfig;
  conversationId?: string;
  workflowContext?: any;
  className?: string;
  onMessage?: (message: ChatMessage) => void;
}

export const FlexibleChatInterface: React.FC<FlexibleChatInterfaceProps> = ({
  config,
  conversationId = 'default',
  workflowContext,
  className = '',
  onMessage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatService = useRef(new FlexibleChatService());

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // Handle scroll to show/hide scroll-to-bottom button
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 3);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize with welcome message (only once)
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = getWelcomeMessage();
      if (welcomeMessage) {
        addMessage({
          type: 'system',
          content: welcomeMessage
        });
      }
    }
  }, []);

  const getWelcomeMessage = (): string => {
    switch (config.type) {
      case 'direct-llm':
        return `Ready to assist you.`;
      case 'independent-agent':
        return `${config.name || 'Agent'} ready to help.`;
      case 'palette-agent':
        return `${config.name || 'Agent'} ready to help.`;
      default:
        return 'Ready to help.';
    }
  };

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    onMessage?.(newMessage);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);
    setError(null);

    // Add user message
    addMessage({
      type: 'user',
      content: userMessage
    });

    try {
      // Execute chat with flexible service
      const response = await chatService.current.executeChat(
        config,
        userMessage,
        conversationId,
        workflowContext
      );

      // Add agent response
      addMessage({
        type: 'agent',
        content: response.response,
        metadata: response.metadata
      });

    } catch (error) {
      console.error('Chat execution failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      addMessage({
        type: 'error',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAgentIcon = () => {
    switch (config.type) {
      case 'direct-llm':
        return <Bot className="h-4 w-4" />;
      case 'independent-agent':
        return <User className="h-4 w-4" />;
      case 'palette-agent':
        return <Bot className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getAgentName = () => {
    switch (config.type) {
      case 'direct-llm':
        return validateModel(config.model) || 'LLM';
      case 'independent-agent':
        return config.name || 'Agent';
      case 'palette-agent':
        return config.name || 'Palette Agent';
      default:
        return 'Assistant';
    }
  };

  return (
    <div className={`flexible-chat-interface flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="chat-header p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
            {getAgentIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm">{getAgentName()}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {config.type.replace('-', ' ')}
              </Badge>
              {config.guardrails && (
                <Badge variant="outline" className="text-xs bg-green-500/20 border-green-500/30 text-green-300">
                  Protected
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="chat-messages flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px] min-h-[300px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 relative"
      >
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}-message`}>
            <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.type !== 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  {message.type === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  ) : (
                    getAgentIcon()
                  )}
                </div>
              )}
              
              <div className={`
                max-w-[80%] p-3 rounded-lg text-sm
                ${message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.type === 'error'
                  ? 'bg-red-600/20 border border-red-600/30 text-red-300'
                  : message.type === 'system'
                  ? 'bg-yellow-600/20 border border-yellow-600/30 text-yellow-300'
                  : 'bg-gray-700/50 border border-gray-600/30 text-gray-100'
                }
              `}>
                <div className="message-content leading-relaxed">
                  {message.content}
                </div>
                
                {/* Message Metadata */}
                {message.metadata && (
                  <div className="mt-2 pt-2 border-t border-gray-600/30 text-xs opacity-70">
                    <div className="flex items-center gap-4">
                      {message.metadata.model && (
                        <span>Model: {message.metadata.model}</span>
                      )}
                      {message.metadata.tokens && (
                        <span>Tokens: {message.metadata.tokens}</span>
                      )}
                      {message.metadata.processingTime && (
                        <span>Time: {message.metadata.processingTime}ms</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {message.type === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            
            <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left ml-11'}`}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              {getAgentIcon()}
            </div>
            <div className="bg-gray-700/50 border border-gray-600/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Error: {error}</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        
        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <div className="absolute bottom-4 right-4">
            <Button
              onClick={scrollToBottom}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${getAgentName()}...`}
            disabled={isProcessing}
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isProcessing || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        

      </div>
    </div>
  );
};