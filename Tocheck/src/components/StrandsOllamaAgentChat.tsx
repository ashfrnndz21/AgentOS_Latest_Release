import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Brain,
  Eye,
  Target,
  TreePine,
  Mirror,
  Search
} from 'lucide-react';
import { 
  StrandsOllamaAgentConfig, 
  StrandsAgentMessage, 
  StrandsAgentExecution,
  ReasoningTrace
} from '@/lib/services/StrandsOllamaAgentService';
import { useStrandsOllamaAgents } from '@/hooks/useStrandsOllamaAgents';
import { useToast } from '@/hooks/use-toast';

interface StrandsOllamaAgentChatProps {
  agent: StrandsOllamaAgentConfig;
  onClose?: () => void;
}

export const StrandsOllamaAgentChat: React.FC<StrandsOllamaAgentChatProps> = ({ agent, onClose }) => {
  const [messages, setMessages] = useState<StrandsAgentMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [executions, setExecutions] = useState<StrandsAgentExecution[]>([]);
  const [selectedReasoningType, setSelectedReasoningType] = useState<'chain_of_thought' | 'tree_of_thought' | 'reflection'>('chain_of_thought');
  const [activeTrace, setActiveTrace] = useState<ReasoningTrace | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    executeAgent, 
    createConversation, 
    getConversation, 
    getAgentMetrics, 
    getAgentExecutions 
  } = useStrandsOllamaAgents();
  
  const { toast } = useToast();

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        const convId = await createConversation(agent.id);
        setConversationId(convId);
        
        // Load conversation messages
        const conversation = getConversation(convId);
        if (conversation) {
          setMessages(conversation.messages.filter(msg => msg.role !== 'system'));
        }
      } catch (error) {
        toast({
          title: "Failed to initialize conversation",
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: "destructive"
        });
      }
    };

    initConversation();
    loadExecutions();
  }, [agent.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadExecutions = () => {
    const agentExecutions = getAgentExecutions(agent.id);
    setExecutions(agentExecutions.slice(0, 5)); // Last 5 executions
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isGenerating || !conversationId) return;

    const userMessage: StrandsAgentMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsGenerating(true);

    try {
      const execution = await executeAgent(
        agent.id,
        currentMessage.trim(),
        conversationId,
        selectedReasoningType
      );

      // Add assistant response
      const assistantMessage: StrandsAgentMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: execution.output,
        timestamp: new Date(),
        metadata: {
          model: execution.metadata.model,
          tokens: execution.tokensUsed,
          duration: execution.duration,
          reasoning_steps: execution.metadata.reasoning_steps,
          confidence_score: execution.metadata.confidence_score,
          reasoning_pattern: execution.metadata.reasoning_pattern
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Set active trace for visualization
      if (execution.reasoning_trace) {
        setActiveTrace(execution.reasoning_trace);
      }
      
      // Update executions
      loadExecutions();

      toast({
        title: "Response generated",
        description: `${execution.tokensUsed} tokens, ${execution.metadata.reasoning_steps} reasoning steps, ${Math.round(execution.metadata.confidence_score * 100)}% confidence`,
      });

    } catch (error) {
      toast({
        title: "Failed to generate response",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });

      // Add error message
      const errorMessage: StrandsAgentMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

  const getReasoningIcon = (type: string) => {
    switch (type) {
      case 'chain_of_thought': return <Brain className="h-4 w-4" />;
      case 'tree_of_thought': return <TreePine className="h-4 w-4" />;
      case 'reflection': return <Mirror className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getReasoningColor = (type: string) => {
    switch (type) {
      case 'chain_of_thought': return 'text-blue-400';
      case 'tree_of_thought': return 'text-green-400';
      case 'reflection': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const metrics = getAgentMetrics(agent.id);

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="text-purple-400" size={24} />
              <Bot className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{agent.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Cpu size={14} />
                <span>{agent.model.model_name}</span>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  Strands-Ollama
                </Badge>
              </div>
            </div>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {/* Reasoning Type Selector */}
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">Reasoning Pattern:</p>
          <div className="flex gap-2">
            {[
              { type: 'chain_of_thought', label: 'Chain-of-Thought', enabled: agent.reasoning_patterns.chain_of_thought },
              { type: 'tree_of_thought', label: 'Tree-of-Thought', enabled: agent.reasoning_patterns.tree_of_thought },
              { type: 'reflection', label: 'Reflection', enabled: agent.reasoning_patterns.reflection }
            ].map(({ type, label, enabled }) => (
              <Button
                key={type}
                size="sm"
                variant={selectedReasoningType === type ? "default" : "outline"}
                disabled={!enabled}
                onClick={() => setSelectedReasoningType(type as any)}
                className={`${selectedReasoningType === type ? 'bg-purple-600' : ''} ${!enabled ? 'opacity-50' : ''}`}
              >
                <div className={`mr-2 ${getReasoningColor(type)}`}>
                  {getReasoningIcon(type)}
                </div>
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-400" />
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <p className="text-lg font-semibold">{metrics.totalExecutions}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-yellow-400" />
              <span className="text-sm text-gray-400">Avg Time</span>
            </div>
            <p className="text-lg font-semibold">{formatDuration(metrics.averageResponseTime)}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-purple-400" />
              <span className="text-sm text-gray-400">Avg Steps</span>
            </div>
            <p className="text-lg font-semibold">{Math.round(metrics.averageReasoningSteps)}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-green-400" />
              <span className="text-sm text-gray-400">Confidence</span>
            </div>
            <p className="text-lg font-semibold">{Math.round(metrics.averageConfidenceScore * 100)}%</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-cyan-400" />
              <span className="text-sm text-gray-400">Tokens</span>
            </div>
            <p className="text-lg font-semibold">{metrics.totalTokensUsed}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 mx-4 mt-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="reasoning">Reasoning Trace</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Brain className="text-purple-400" size={48} />
                        <Bot className="text-blue-400" size={48} />
                      </div>
                      <p>Start a conversation with {agent.name}</p>
                      <p className="text-sm">This agent uses advanced reasoning patterns with {agent.model.model_name}</p>
                    </div>
                  )}

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
                            <User size={16} />
                          ) : (
                            <div className="flex items-center gap-1">
                              <Brain size={16} className="text-purple-400" />
                              <Bot size={16} className="text-blue-400" />
                            </div>
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.metadata && (
                            <div className="flex items-center gap-1 text-xs opacity-70">
                              {message.metadata.reasoning_pattern && (
                                <Badge variant="secondary" className="text-xs">
                                  {message.metadata.reasoning_pattern.replace('_', '-')}
                                </Badge>
                              )}
                              {message.metadata.tokens && (
                                <span>{message.metadata.tokens} tokens</span>
                              )}
                              {message.metadata.reasoning_steps && (
                                <span>• {message.metadata.reasoning_steps} steps</span>
                              )}
                              {message.metadata.confidence_score && (
                                <span>• {Math.round(message.metadata.confidence_score * 100)}% confidence</span>
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
                          <Brain className="text-purple-400" size={16} />
                          <Bot className="text-blue-400" size={16} />
                          <Loader2 size={16} className="animate-spin" />
                          <span className="text-sm">Reasoning with {selectedReasoningType.replace('_', '-')}...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="reasoning" className="flex-1 p-4">
              {activeTrace ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={getReasoningColor(activeTrace.pattern)}>
                        {getReasoningIcon(activeTrace.pattern)}
                      </div>
                      Reasoning Trace - {activeTrace.pattern.replace('_', ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Steps: </span>
                          <span className="text-white font-medium">{activeTrace.steps.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Confidence: </span>
                          <span className="text-white font-medium">{Math.round(activeTrace.confidence_score * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Time: </span>
                          <span className="text-white font-medium">{formatDuration(activeTrace.execution_time)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {activeTrace.steps.map((step, index) => (
                          <div key={index} className="border border-gray-600 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Step {step.step_number}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{Math.round(step.confidence * 100)}% confidence</span>
                                <span>•</span>
                                <span>{step.tokens_used} tokens</span>
                                <span>•</span>
                                <span>{formatDuration(step.execution_time)}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-300">{step.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Eye size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No reasoning trace available</p>
                  <p className="text-sm">Send a message to see the reasoning process</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${agent.name} using ${selectedReasoningType.replace('_', '-')}...`}
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
              Press Enter to send • Shift+Enter for new line • Using {selectedReasoningType.replace('_', '-')} reasoning
            </p>
          </div>
        </div>

        {/* Sidebar - Recent Executions */}
        <div className="w-80 border-l border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Activity</h3>
            <Button size="sm" variant="outline" onClick={loadExecutions}>
              <RefreshCw size={14} />
            </Button>
          </div>

          <div className="space-y-3">
            {executions.map((execution) => (
              <Card key={execution.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={execution.success ? "default" : "destructive"}>
                        {execution.success ? "Success" : "Failed"}
                      </Badge>
                      <div className={getReasoningColor(execution.metadata.reasoning_pattern)}>
                        {getReasoningIcon(execution.metadata.reasoning_pattern)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {execution.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 truncate">
                    {execution.input}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>
                      <span>{execution.tokensUsed} tokens</span>
                    </div>
                    <div>
                      <span>{formatDuration(execution.duration)}</span>
                    </div>
                    <div>
                      <span>{execution.metadata.reasoning_steps} steps</span>
                    </div>
                    <div>
                      <span>{Math.round(execution.metadata.confidence_score * 100)}% conf</span>
                    </div>
                  </div>
                  {execution.error && (
                    <Alert className="mt-2 border-red-500 bg-red-500/10">
                      <AlertDescription className="text-xs text-red-400">
                        {execution.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}

            {executions.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};