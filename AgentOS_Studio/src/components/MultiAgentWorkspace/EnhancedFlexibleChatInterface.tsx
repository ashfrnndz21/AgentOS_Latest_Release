import React, { useState, useRef, useEffect } from 'react';
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
  Settings,
  Maximize2,
  Minimize2,
  X,
  MessageSquare,
  Zap,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Link
} from 'lucide-react';
import { ChatConfig } from '@/lib/services/FlexibleChatService';
import { chatOrchestratorService, ChatMessage, ChatResponse } from '@/lib/services/ChatOrchestratorService';

interface EnhancedFlexibleChatInterfaceProps {
  config: ChatConfig;
  sessionId?: string;
  workflowContext?: any;
  className?: string;
  onMessage?: (message: ChatMessage) => void;
  onSessionCreated?: (sessionId: string) => void;
}

export const EnhancedFlexibleChatInterface: React.FC<EnhancedFlexibleChatInterfaceProps> = ({
  config,
  sessionId: initialSessionId,
  workflowContext,
  className = '',
  onMessage,
  onSessionCreated
}) => {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session on mount
  useEffect(() => {
    if (!sessionId) {
      initializeSession();
    } else {
      loadChatHistory();
    }
    testConnection();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const testConnection = async () => {
    try {
      const isConnected = await chatOrchestratorService.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
    }
  };

  const initializeSession = async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      let newSessionId: string;
      
      // Create session based on chat type
      if (config.type === 'direct-llm') {
        newSessionId = await chatOrchestratorService.createDirectLLMSession({
          name: config.name || 'Direct LLM Chat',
          model: config.model || 'qwen2.5:latest',
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 1000,
          systemPrompt: config.systemPrompt || ''
        });
      } else if (config.type === 'independent-agent') {
        newSessionId = await chatOrchestratorService.createIndependentAgentSession({
          name: config.name || 'Independent Agent',
          role: config.role || 'Assistant',
          model: config.model || 'qwen2.5:latest',
          personality: config.personality || '',
          capabilities: config.capabilities || [],
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 1000,
          guardrails: config.guardrails || false
        });
      } else if (config.type === 'palette-agent') {
        newSessionId = await chatOrchestratorService.createPaletteAgentSession({
          name: config.name || 'Palette Agent Chat',
          agentId: config.agentId || '',
          chatMode: config.chatMode || 'direct',
          contextSharing: config.contextSharing || false,
          workflowTrigger: config.workflowTrigger || false
        });
      } else {
        throw new Error(`Unknown chat type: ${config.type}`);
      }
      
      setSessionId(newSessionId);
      setConnectionStatus('connected');
      onSessionCreated?.(newSessionId);
      
      console.log(`✅ Chat session created: ${newSessionId} (type: ${config.type})`);
      
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      setError(`Failed to initialize chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setConnectionStatus('error');
    } finally {
      setIsInitializing(false);
    }
  };

  const loadChatHistory = async () => {
    if (!sessionId) return;
    
    try {
      const history = await chatOrchestratorService.getChatHistory(sessionId);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setError('Failed to load chat history');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isProcessing || !sessionId) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);
    setError(null);
    
    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    
    try {
      // Send message to backend
      const response = await chatOrchestratorService.sendMessage(sessionId, userMessage);
      setLastResponse(response);
      
      // Add assistant response
      const assistantMsg: ChatMessage = {
        id: response.message_id,
        session_id: sessionId,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        metadata: {
          type: response.type,
          model: response.model,
          agent_id: response.agent_id,
          agent_name: response.agent_name,
          tokens_used: response.tokens_used,
          generation_time: response.generation_time,
          routing_confidence: response.routing_confidence,
          routing_reasoning: response.routing_reasoning,
          tools_used: response.tools_used
        }
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      onMessage?.(assistantMsg);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMsg.id));
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const formatMessageContent = (message: ChatMessage) => {
    let content = message.content;
    
    // Add routing information for routed messages
    if (message.metadata?.type === 'routed-agent' && message.metadata?.routing_reasoning) {
      content += `\n\n*[Routed to ${message.metadata.agent_name || message.metadata.agent_id} - ${message.metadata.routing_reasoning}]*`;
    }
    
    // Add tools information
    if (message.metadata?.tools_used && message.metadata.tools_used.length > 0) {
      content += `\n\n*[Tools used: ${message.metadata.tools_used.join(', ')}]*`;
    }
    
    return content;
  };

  if (isInitializing) {
    return (
      <Card className={`p-6 bg-gray-900/50 border-gray-700 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          <span className="text-gray-300">Initializing chat session...</span>
        </div>
      </Card>
    );
  }

  if (error && !sessionId) {
    return (
      <Card className={`p-6 bg-gray-900/50 border-gray-700 ${className}`}>
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Chat Initialization Failed</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={initializeSession} className="bg-blue-600 hover:bg-blue-700">
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col h-96 bg-gray-900/50 border-gray-700 ${className}`}>
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
                {chatOrchestratorService.getChatTypeInfo(config.type).title}
              </Badge>
              {connectionStatus === 'connected' && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">Connected</span>
                </div>
              )}
              {connectionStatus === 'error' && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-red-400">Disconnected</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Response metadata */}
        {lastResponse && (
          <div className="text-xs text-gray-400 space-y-1">
            {lastResponse.model && <div>Model: {lastResponse.model}</div>}
            {lastResponse.tokens_used && <div>Tokens: {lastResponse.tokens_used}</div>}
            {lastResponse.generation_time && <div>Time: {lastResponse.generation_time.toFixed(2)}s</div>}
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Start a conversation...</p>
              <p className="text-xs mt-1">
                {chatOrchestratorService.getChatTypeInfo(config.type).description}
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <div className="mt-1">
                      {message.metadata?.type === 'routed-agent' ? (
                        <Target className="h-4 w-4 text-purple-400" />
                      ) : message.metadata?.type === 'palette-agent' ? (
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
                    <div className="whitespace-pre-wrap text-sm">
                      {formatMessageContent(message)}
                    </div>
                    {message.metadata && (
                      <div className="mt-2 text-xs opacity-70">
                        {message.metadata.agent_name && (
                          <div>Agent: {message.metadata.agent_name}</div>
                        )}
                        {message.metadata.routing_confidence && (
                          <div>Confidence: {(message.metadata.routing_confidence * 100).toFixed(0)}%</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

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
            placeholder={
              connectionStatus === 'connected' 
                ? "Type your message..." 
                : "Connecting..."
            }
            disabled={isProcessing || connectionStatus !== 'connected'}
            className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isProcessing || connectionStatus !== 'connected'}
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

export default EnhancedFlexibleChatInterface;