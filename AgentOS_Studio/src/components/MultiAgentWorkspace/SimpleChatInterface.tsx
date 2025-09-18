import React, { useState, useRef, useEffect } from 'react';

// Add custom CSS for scrollbar
const scrollbarStyles = `
  .chat-messages-container {
    scrollbar-width: thin;
    scrollbar-color: #6B7280 #374151;
  }
  
  .chat-messages-container::-webkit-scrollbar {
    width: 6px;
  }
  
  .chat-messages-container::-webkit-scrollbar-track {
    background: #374151;
    border-radius: 3px;
  }
  
  .chat-messages-container::-webkit-scrollbar-thumb {
    background: #6B7280;
    border-radius: 3px;
  }
  
  .chat-messages-container::-webkit-scrollbar-thumb:hover {
    background: #9CA3AF;
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('chat-scrollbar-styles')) {
  const style = document.createElement('style');
  style.id = 'chat-scrollbar-styles';
  style.textContent = scrollbarStyles;
  document.head.appendChild(style);
}
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Link,
  ChevronDown
} from 'lucide-react';
import { ChatConfig } from '@/lib/services/FlexibleChatService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface SimpleChatInterfaceProps {
  config: ChatConfig;
  sessionId?: string;
  className?: string;
  onMessage?: (message: ChatMessage) => void;
}

export const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({
  config,
  sessionId,
  className = '',
  onMessage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error'>('connected');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll detection for scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isNearBottom && messages.length > 2);
    };

    // Throttle scroll events for better performance
    let scrollTimeout: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    container.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [messages.length]);

  const scrollToBottom = (force = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (force) {
      // Force scroll to bottom
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    } else {
      // Check if user is near bottom before auto-scrolling
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (isNearBottom) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 100);
      }
    }
  };

  const handleScrollToBottom = () => {
    scrollToBottom(true); // Force scroll
    setShowScrollButton(false);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);
    setError(null);
    
    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    
    try {
      let response;
      
      if (config.type === 'direct-llm') {
        // Use Ollama API directly
        response = await fetch('/api/ollama/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.model || 'qwen2.5:latest',
            prompt: userMessage,
            temperature: config.temperature || 0.7,
            max_tokens: config.maxTokens || 1000,
            system_prompt: config.systemPrompt || ''
          })
        });
      } else if (config.type === 'independent-agent') {
        // Create a temporary agent and execute
        const agentConfig = {
          name: config.name || 'Chat Agent',
          role: config.role || 'Assistant',
          model: config.model || 'qwen2.5:latest',
          personality: config.personality || '',
          system_prompt: `You are ${config.name || 'an assistant'}, a ${config.role || 'helpful assistant'}. ${config.personality ? `Your personality: ${config.personality}` : ''}`,
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 1000
        };
        
        response = await fetch('/api/ollama/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: agentConfig.model,
            prompt: userMessage,
            temperature: agentConfig.temperature,
            max_tokens: agentConfig.max_tokens,
            system_prompt: agentConfig.system_prompt
          })
        });
      } else if (config.type === 'palette-agent' && config.agentId) {
        // Execute existing agent
        response = await fetch(`/api/agents/ollama/${config.agentId}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: userMessage })
        });
      } else {
        throw new Error('Invalid chat configuration');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      let assistantContent = '';
      
      if (config.type === 'palette-agent') {
        assistantContent = data.output || data.response || 'No response received';
      } else {
        assistantContent = data.response || data.output || 'No response received';
      }
      
      // Add assistant response
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        metadata: {
          type: config.type,
          model: config.model,
          agent_id: config.agentId,
          tokens_used: data.tokens_used,
          generation_time: data.generation_time
        }
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      onMessage?.(assistantMsg);
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setConnectionStatus('error');
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getChatTypeIcon = () => {
    switch (config.type) {
      case 'direct-llm':
        return <Bot className="h-4 w-4" />;
      case 'independent-agent':
        return <User className="h-4 w-4" />;
      case 'palette-agent':
        return <Link className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChatTypeColor = () => {
    switch (config.type) {
      case 'direct-llm':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'independent-agent':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'palette-agent':
        return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
    }
  };

  const getChatTypeTitle = () => {
    switch (config.type) {
      case 'direct-llm':
        return 'Direct LLM Chat';
      case 'independent-agent':
        return 'Independent Agent';
      case 'palette-agent':
        return 'Palette Agent';
      default:
        return 'Chat Interface';
    }
  };

  return (
    <Card className={`flex flex-col bg-gray-900/50 border-gray-700 ${className}`}
      style={{ height: '400px', minHeight: '400px', maxHeight: '600px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getChatTypeColor()}`}>
            {getChatTypeIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-white">{config.name || 'Chat Interface'}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {getChatTypeTitle()}
              </Badge>
              {connectionStatus === 'connected' && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">Ready</span>
                </div>
              )}
              {connectionStatus === 'error' && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-red-400">Error</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Model info */}
        {config.model && (
          <div className="text-xs text-gray-400">
            <div>Model: {config.model.replace(':latest', '')}</div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          ref={messagesContainerRef}
          className="chat-messages-container h-full overflow-y-scroll p-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Start a conversation...</p>
                <p className="text-xs mt-1">
                  {config.type === 'direct-llm' && 'Direct conversation with Ollama models'}
                  {config.type === 'independent-agent' && 'Chat with your custom agent'}
                  {config.type === 'palette-agent' && 'Chat with workflow agents'}
                </p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 transition-all duration-200 hover:shadow-md ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-800 text-gray-100 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <div className="mt-1">
                        {config.type === 'palette-agent' ? (
                          <Link className="h-4 w-4 text-purple-400" />
                        ) : (
                          <Bot className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                    )}
                    {message.role === 'user' && (
                      <User className="h-4 w-4 text-white mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap text-sm break-words leading-relaxed">
                        {message.content}
                      </div>
                      {message.metadata && (
                        <div className="mt-2 text-xs opacity-70">
                          {message.metadata.tokens_used && (
                            <div>Tokens: {message.metadata.tokens_used}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator when processing */}
            {isProcessing && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-1 duration-300">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-800 text-gray-100 border border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-blue-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            onClick={handleScrollToBottom}
            className="absolute bottom-4 right-4 h-10 w-10 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:scale-105 animate-in fade-in slide-in-from-bottom-2"
            title="Scroll to bottom"
          >
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-900/20 border-t border-red-700/30">
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isProcessing}
            className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Status indicators */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <div>
            {sessionId && <span>Session: {sessionId.slice(0, 8)}...</span>}
          </div>
          <div className="flex items-center space-x-2">
            {isProcessing && (
              <div className="flex items-center space-x-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
            {connectionStatus === 'connected' && !isProcessing && (
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span>Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SimpleChatInterface;