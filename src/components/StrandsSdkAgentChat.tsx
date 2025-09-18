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
import { strandsSdkService, StrandsSdkAgent, StrandsSdkExecution } from '@/lib/services/StrandsSdkService';
import { useToast } from '@/hooks/use-toast';

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
  const [executions, setExecutions] = useState<StrandsSdkExecution[]>([]);
  const [currentOperations, setCurrentOperations] = useState<ExecutionOperation[]>([]);
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
        container.scrollTop = container.scrollHeight;
      }
      
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    // Use setTimeout to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending scroll timeouts
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Clear operations to free memory
      setCurrentOperations([]);
      setMessages([]);
      setExecutions([]);
    };
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: StrandsSdkMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm ${agent.name}, powered by the official Strands SDK. How can I help you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [agent.name]);

  // Convert backend operations log to UI operations
  const convertBackendOperations = (backendOps: any[], toolsUsed: string[] = []): ExecutionOperation[] => {
    const operations: ExecutionOperation[] = [];
    
    backendOps.forEach((op, index) => {
      const operation: ExecutionOperation = {
        id: `op-${index}`,
        step: op.step,
        status: 'completed',
        timestamp: new Date(op.timestamp),
        details: op.details,
        icon: getIconForOperation(op.step)
      };
      
      operations.push(operation);
    });
    
    return operations;
  };

  // Get appropriate icon for operation type
  const getIconForOperation = (step: string): React.ReactNode => {
    if (step.toLowerCase().includes('config')) return <Settings className="h-4 w-4" />;
    if (step.toLowerCase().includes('model')) return <Cpu className="h-4 w-4" />;
    if (step.toLowerCase().includes('tool')) return <Zap className="h-4 w-4" />;
    if (step.toLowerCase().includes('search')) return <Search className="h-4 w-4" />;
    if (step.toLowerCase().includes('execut')) return <Play className="h-4 w-4" />;
    if (step.toLowerCase().includes('response')) return <MessageSquare className="h-4 w-4" />;
    return <Sparkles className="h-4 w-4" />;
  };

  // Update operation status
  const updateOperationStatus = (operationId: string, status: ExecutionOperation['status'], details?: string) => {
    setCurrentOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { ...op, status, details: details || op.details, timestamp: new Date() }
        : op
    ));
  };

  // Simulate realistic execution steps
  const simulateExecutionSteps = async (operations: ExecutionOperation[]) => {
    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      
      // Mark current operation as running
      updateOperationStatus(operation.id, 'running');
      
      // Simulate realistic timing for each step
      let delay = 500; // Default delay
      
      switch (operation.id) {
        case 'init':
          delay = 300;
          break;
        case 'config':
          delay = 400;
          break;
        case 'model':
          delay = 800;
          break;
        case 'tools':
          delay = 600;
          // Add tool-specific details
          if (agent.tools?.includes('web_search')) {
            setTimeout(() => {
              updateOperationStatus('tools', 'running', 'Initializing web search tool...');
            }, 200);
          }
          break;
        case 'execute':
          delay = 1000;
          // Add tool execution details
          if (agent.tools?.includes('web_search')) {
            setTimeout(() => {
              updateOperationStatus('execute', 'running', 'Performing web search...');
            }, 300);
            setTimeout(() => {
              updateOperationStatus('execute', 'running', 'Processing search results...');
            }, 700);
          }
          break;
        case 'response':
          delay = 800;
          break;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Mark as completed
      updateOperationStatus(operation.id, 'completed');
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isGenerating) return;

    const userMessage: StrandsSdkMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsGenerating(true);

    // Clear any existing operations
    setCurrentOperations([]);

    // Immediate scroll after adding user message
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 50);

    try {
      // Execute the Strands SDK agent with real-time progress streaming
      const execution = await strandsSdkService.executeAgentWithProgress(
        agent.id!, 
        userMessage.content,
        (step: string, details: string, status: string) => {
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
                lastOp.icon = <CheckCircle className="h-4 w-4" />;
              }
            }
            
            // Add new step
            const newOperation: ExecutionOperation = {
              id: `real-${Date.now()}-${newOps.length}`,
              step: step,
              status: status as 'pending' | 'running' | 'completed' | 'error',
              timestamp: new Date(),
              details: details,
              icon: status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                    status === 'error' ? <AlertTriangle className="h-4 w-4" /> :
                    <Loader2 className="h-4 w-4 animate-spin" />
            };
            
            newOps.push(newOperation);
            
            // Keep only the last MAX_OPERATIONS to prevent memory bloat
            if (newOps.length > MAX_OPERATIONS) {
              newOps = newOps.slice(-MAX_OPERATIONS);
            }
            
            return newOps;
          });
          
          // Throttled auto-scroll to reduce DOM updates
          if (!scrollTimeoutRef.current) {
            scrollTimeoutRef.current = setTimeout(() => {
              if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
              }
              scrollTimeoutRef.current = null;
            }, 200);
          }
        }
      );
      
      // Mark all current operations as completed
      setCurrentOperations(prev => prev.map(op => ({
        ...op,
        status: 'completed' as const,
        icon: <CheckCircle className="h-4 w-4" />
      })));

      // Convert current operations to final operations for the message
      const finalOperations = currentOperations.map(op => ({
        ...op,
        status: 'completed' as const,
        icon: <CheckCircle className="h-4 w-4" />
      }));
      
      // Wait a moment to show the completed progress, then add the message
      setTimeout(() => {
        // Add assistant response with the real-time operations that were captured
        const assistantMessage: StrandsSdkMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: execution.response || 'No response received',
          timestamp: new Date(),
          execution_time: undefined, // execution time not available in current response
          operations: finalOperations,
          tools_used: [] // tools_used not available in current response
        };

        setMessages(prev => [...prev, assistantMessage]);
        setExecutions(prev => [...prev, execution]);
        setCurrentOperations([]); // Clear current operations after showing completion
      }, 1000); // Show completed state for 1 second

      // Scroll after assistant response
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);

      toast({
        title: "Response Generated",
        description: `Response generated successfully`,
      });

    } catch (error) {
      console.error('Strands agent execution failed:', error);
      
      // Create error operation
      const errorOperations: ExecutionOperation[] = [{
        id: 'error',
        step: 'Execution failed',
        status: 'error',
        timestamp: new Date(),
        details: error instanceof Error ? error.message : 'Unknown error',
        icon: <AlertTriangle className="h-4 w-4" />
      }];
      
      const errorMessage: StrandsSdkMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        operations: errorOperations
      };

      setMessages(prev => [...prev, errorMessage]);
      setCurrentOperations([]); // Clear current operations
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: "destructive"
      });
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

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Operations display component
  const OperationsDisplay = ({ operations }: { operations: ExecutionOperation[] }) => {
    console.log('[StrandsSdkAgentChat] OperationsDisplay called with:', operations.length, 'operations');
    return (
    <div className="mt-3 p-3 bg-gray-800 border border-gray-600 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-purple-400" />
        <span className="text-sm font-medium text-purple-400">Strands SDK Operations</span>
      </div>
      <div className="space-y-2">
        {operations.map((operation, index) => (
          <div key={operation.id} className="flex items-center gap-3">
            <div className={`flex-shrink-0 ${
              operation.status === 'completed' ? 'text-green-400' :
              operation.status === 'running' ? 'text-blue-400' :
              operation.status === 'error' ? 'text-red-400' :
              'text-gray-500'
            }`}>
              {operation.status === 'completed' ? (
                <CheckCircle className="h-4 w-4" />
              ) : operation.status === 'running' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : operation.status === 'error' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                operation.icon || <div className="h-4 w-4 rounded-full border-2 border-gray-500" />
              )}
            </div>
            
            <div className="flex-1">
              <div className={`text-sm ${
                operation.status === 'completed' ? 'text-green-300' :
                operation.status === 'running' ? 'text-blue-300' :
                operation.status === 'error' ? 'text-red-300' :
                'text-gray-400'
              }`}>
                {operation.step}
              </div>
              {operation.details && (
                <div className="text-xs text-gray-500 mt-1">
                  {operation.details}
                </div>
              )}
            </div>
            
            {operation.status === 'completed' && index < operations.length - 1 && (
              <ArrowRight className="h-3 w-3 text-gray-500" />
            )}
          </div>
        ))}
      </div>
    </div>
    );
  };

  return (
    <Card className="h-full bg-gray-900 border-gray-700 flex flex-col">
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
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Cpu className="h-3 w-3 mr-1" />
              {agent.model_id}
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

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4"
          style={{ maxHeight: 'calc(100vh - 300px)' }}
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
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : ''}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
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
                  {message.role === 'assistant' && message.tools_used && message.tools_used.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-gray-500">Tools used:</span>
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
                  
                  {/* Show operations for assistant messages */}
                  {message.role === 'assistant' && (() => {
                    console.log('[StrandsSdkAgentChat] Message operations check:', {
                      role: message.role,
                      hasOperations: !!message.operations,
                      operationsLength: message.operations?.length || 0,
                      operations: message.operations
                    });
                    return message.operations && message.operations.length > 0;
                  })() && (
                    <OperationsDisplay operations={message.operations} />
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 order-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="text-white" size={16} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <Loader2 className="text-white animate-spin" size={16} />
                  </div>
                </div>
                <div className="bg-gray-800 text-gray-100 border border-gray-700 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-3">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Thinking with Strands SDK...</span>
                  </div>
                  
                  {/* Show current operations */}
                  {currentOperations.length > 0 && (
                    <OperationsDisplay operations={currentOperations} />
                  )}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${agent.name}...`}
              disabled={isGenerating}
              className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
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
  );
};

export { StrandsSdkAgentChat };