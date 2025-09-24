import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  MessageSquare, 
  Clock, 
  Cpu, 
  Zap,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  X,
  Search,
  Settings,
  Play,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { strandsSdkService, StrandsSdkAgent } from '@/lib/services/StrandsSdkService';
import { useToast } from '@/hooks/use-toast';
import StrandsToolTraceTooltip from './MultiAgentWorkspace/StrandsToolTraceTooltip';

interface StrandsSdkMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  execution_time?: number;
  operations?: ExecutionOperation[];
  tools_used?: string[];
}

interface ExecutionOperation {
  id: string;
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: Date;
  details?: string;
  icon?: React.ReactNode;
}

interface StrandsSdkAgentChatProps {
  agent: StrandsSdkAgent;
  onClose?: () => void;
}

const StrandsSdkAgentChat: React.FC<StrandsSdkAgentChatProps> = ({ agent, onClose }) => {
  const [messages, setMessages] = useState<StrandsSdkMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [executions, setExecutions] = useState<any[]>([]);
  const [currentOperations, setCurrentOperations] = useState<ExecutionOperation[]>([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showToolTraceTooltip, setShowToolTraceTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      // Try multiple methods to ensure scrolling works
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        // Force scroll to bottom
        container.scrollTop = container.scrollHeight;
        // Also try smooth scrolling
        setTimeout(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }, 50);
      }
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set a new timeout to scroll after a short delay
    scrollTimeoutRef.current = setTimeout(scrollToBottom, 150);
  }, [messages]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Handle scroll detection for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        const isScrolledUp = container.scrollTop > 50; // More sensitive
        setShowScrollToTop(isScrolledUp);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages]); // Re-run when messages change

  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Force scroll to top
      container.scrollTop = 0;
      // Also try smooth scrolling
      setTimeout(() => {
        container.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 50);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isGenerating) return;

    const userMessage: StrandsSdkMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsGenerating(true);

    // Clear previous operations
    setCurrentOperations([]);

    try {
      // Execute the Strands SDK agent with real-time progress streaming
      const execution = await strandsSdkService.executeAgentWithProgress(
        agent.id!, 
        userMessage.content,
        (progress: any) => {
          const { step, details, status } = progress;
          // Real-time progress callback - limit logging in production
          if (process.env.NODE_ENV === 'development') {
            console.log('[StrandsSdkAgentChat] Progress:', step);
          }
          
          setCurrentOperations(prev => {
            // Limit operations array size to prevent memory bloat
            const MAX_OPERATIONS = 20;
            let newOps = [...prev];
            
            // Mark previous step as completed if this is a new step
            if (newOps.length > 0 && status === 'running') {
              const lastOp = newOps[newOps.length - 1];
              if (lastOp.status === 'running') {
                lastOp.status = 'completed';
              }
            }
            
            // Add new operation
            const newOp: ExecutionOperation = {
              id: Date.now().toString() + Math.random(),
              step,
              status: status as 'pending' | 'running' | 'completed' | 'error',
              timestamp: new Date(),
              details,
            };
            
            newOps.push(newOp);
            
            // Limit array size
            if (newOps.length > MAX_OPERATIONS) {
              newOps = newOps.slice(-MAX_OPERATIONS);
            }
            
            return newOps;
          });
        }
      );

      // Add execution to list
      setExecutions(prev => [...prev, execution]);

      // Create assistant message
      const assistantMessage: StrandsSdkMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: execution.response || 'No response received',
        timestamp: new Date(),
        execution_time: (execution as any).execution_time,
        operations: currentOperations,
        tools_used: (execution as any).tools_used || [],
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show success toast
      toast({
        title: "Message sent successfully",
        description: `Execution completed in ${(execution as any).execution_time?.toFixed(2)}s`,
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create error message
      const errorMessage: StrandsSdkMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
        execution_time: 0,
      };

      setMessages(prev => [...prev, errorMessage]);

      // Show error toast
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setCurrentOperations([]);
    }
  };

  // Render operations panel
  const renderOperationsPanel = () => {
    if (currentOperations.length === 0 && !isGenerating) {
      return null;
    }

    return (
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Execution Progress</span>
        </div>
        
        <div className="space-y-2">
          {currentOperations.map((operation) => (
            <div key={operation.id} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                operation.status === 'completed' ? 'bg-green-400' :
                operation.status === 'running' ? 'bg-blue-400 animate-pulse' :
                operation.status === 'error' ? 'bg-red-400' :
                'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-300">{operation.step}</span>
              {operation.details && (
                <span className="text-xs text-gray-500 ml-auto">{operation.details}</span>
              )}
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm text-gray-300">Processing...</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-purple-400" size={24} />
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    {agent.name}
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Strands SDK
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-400 mt-1">
                    {agent.description || 'Powered by official Strands SDK'}
                  </p>
                </div>
              </div>
            </div>
            
              <div className="flex items-center gap-2">
                <Button
                  variant={showToolTraceTooltip ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowToolTraceTooltip(!showToolTraceTooltip)}
                  className={showToolTraceTooltip 
                    ? "bg-purple-600 hover:bg-purple-700 text-white" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-800"
                  }
                >
                  <BarChart3 size={16} />
                  <span className="ml-1 text-xs">Traces</span>
                </Button>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <Cpu className="h-3 w-3 mr-1" />
                  {agent.model || 'qwen3:1.7b'}
                </Badge>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="h-full bg-gray-900 border-gray-700 flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                style={{ 
                  maxHeight: 'calc(100vh - 280px)', 
                  minHeight: '350px',
                  overflowY: 'auto',
                  scrollBehavior: 'smooth'
                }}
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                            <Sparkles className="text-white" size={16} />
                          </div>
                        </div>
                      )}
                      
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 order-1">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : ''}`}>
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800 text-gray-100 border border-gray-700'
                          }`}
                        >
                          {message.role === 'assistant' && message.content.includes('<think>') ? (
                            <div className="space-y-3">
                              {message.content.split('<think>').map((part, index) => {
                                if (index === 0) return null; // Skip the part before first <think>
                                const [thinking, ...rest] = part.split('</think>');
                                const afterThinking = rest.join('</think>');
                                
                                // Truncate thinking to first 200 characters for better UX
                                const shortThinking = thinking.length > 200 
                                  ? thinking.substring(0, 200) + '...' 
                                  : thinking;
                                
                                return (
                                  <div key={index}>
                                    <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-3 mb-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                                        <span className="text-sm font-medium text-purple-300">Agent Thinking</span>
                                      </div>
                                      <p className="text-sm text-purple-100 whitespace-pre-wrap">{shortThinking}</p>
                                    </div>
                                    {afterThinking && (
                                      <p className="text-sm text-gray-100 whitespace-pre-wrap">{afterThinking}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{formatTimestamp(message.timestamp)}</span>
                          {message.execution_time && (
                            <>
                              <Zap size={12} />
                              <span>{message.execution_time.toFixed(2)}s</span>
                            </>
                          )}
                        </div>
                        
                        {/* Show tools used for assistant messages */}
                        {message.role === 'assistant' && message.tools_used &&
                         message.tools_used.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs text-gray-400">Tools:</span>
                            {message.tools_used.map((tool, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs bg-purple-100 text-purple-700 border-purple-200"
                              >
                                {tool === 'web_search' && <Search className="h-3 w-3 mr-1" />}
                                {tool === 'calculator' && <BarChart3 className="h-3 w-3 mr-1" />}
                                {tool === 'think' && <Sparkles className="h-3 w-3 mr-1" />}
                                {tool === 'a2a_send_message' && <MessageSquare className="h-3 w-3 mr-1" />}
                                {tool === 'coordinate_agents' && <RefreshCw className="h-3 w-3 mr-1" />}
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {message.role === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <User className="text-white" size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div ref={messagesEndRef} />
                  
                  {/* Loading/Thinking Indicator */}
                  {isGenerating && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                          <Sparkles className="text-white animate-pulse" size={16} />
                        </div>
                      </div>
                      <div className="max-w-[80%]">
                        <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                            <span className="text-sm font-medium text-purple-300">Agent Thinking...</span>
                            <div className="flex gap-1 ml-2">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Scroll to Top Button */}
                {showScrollToTop && (
                  <div className="absolute bottom-4 right-4">
                    <Button
                      onClick={scrollToTop}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-12 h-12 shadow-lg"
                      size="sm"
                    >
                      <ArrowRight className="h-5 w-5 rotate-[-90deg]" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-700 p-4 bg-gray-900 min-h-[80px]">
                <div className="flex gap-2 items-center">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${agent.name}...`}
                    disabled={isGenerating}
                    className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 h-12 text-base focus:border-purple-500 focus:ring-purple-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isGenerating}
                    className="bg-purple-600 hover:bg-purple-700 h-12 px-6"
                  >
                    {isGenerating ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Powered by official Strands SDK</span>
                  <span>{executions.length} messages sent</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tool Trace Tooltip */}
        <StrandsToolTraceTooltip
          agentId={agent.id}
          agentName={agent.name}
          isVisible={showToolTraceTooltip}
          onClose={() => setShowToolTraceTooltip(false)}
        />
      </div>
    </div>
  );
};

export { StrandsSdkAgentChat };