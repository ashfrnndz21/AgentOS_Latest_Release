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
  RefreshCw
} from 'lucide-react';
import { ollamaAgentService, OllamaAgentConfig, AgentMessage, AgentExecution } from '@/lib/services/OllamaAgentService';
import { useToast } from '@/hooks/use-toast';

interface OllamaAgentChatProps {
  agent: OllamaAgentConfig;
  onClose?: () => void;
}

export const OllamaAgentChat: React.FC<OllamaAgentChatProps> = ({ agent, onClose }) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        const convId = await ollamaAgentService.createConversation(agent.id);
        setConversationId(convId);
        
        // Load conversation messages
        const conversation = ollamaAgentService.getConversation(convId);
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
    loadMetrics();
    loadExecutions();
  }, [agent.id, toast]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMetrics = () => {
    const agentMetrics = ollamaAgentService.getAgentMetrics(agent.id);
    setMetrics(agentMetrics);
  };

  const loadExecutions = () => {
    const agentExecutions = ollamaAgentService.getAgentExecutions(agent.id);
    setExecutions(agentExecutions.slice(0, 5)); // Last 5 executions
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isGenerating || !conversationId) return;

    const userMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsGenerating(true);

    try {
      const execution = await ollamaAgentService.executeAgent(
        agent.id,
        currentMessage.trim(),
        conversationId
      );

      // Add assistant response
      const assistantMessage: AgentMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: execution.output,
        timestamp: new Date(),
        metadata: {
          model: execution.metadata.model,
          tokens: execution.tokensUsed,
          duration: execution.duration,
          tools_used: execution.metadata.tools_used
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update metrics and executions
      loadMetrics();
      loadExecutions();

      toast({
        title: "Response generated",
        description: `${execution.tokensUsed} tokens in ${execution.duration}ms`,
      });

    } catch (error) {
      toast({
        title: "Failed to generate response",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });

      // Add error message
      const errorMessage: AgentMessage = {
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

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="text-purple-400" size={24} />
            <div>
              <h2 className="text-xl font-semibold">{agent.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Cpu size={14} />
                <span>{agent.model}</span>
                <Badge variant="secondary">Local</Badge>
              </div>
            </div>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {/* Agent Stats */}
        {metrics && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-400" />
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <p className="text-lg font-semibold">{metrics.totalExecutions}</p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-green-400" />
                <span className="text-sm text-gray-400">Success</span>
              </div>
              <p className="text-lg font-semibold">{metrics.successfulExecutions}</p>
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
                <BarChart3 size={16} className="text-purple-400" />
                <span className="text-sm text-gray-400">Tokens</span>
              </div>
              <p className="text-lg font-semibold">{metrics.totalTokensUsed}</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Bot size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with {agent.name}</p>
                  <p className="text-sm">This agent is powered by {agent.model}</p>
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
                        <Bot size={16} />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.metadata && (
                        <div className="flex items-center gap-1 text-xs opacity-70">
                          {message.metadata.tokens && (
                            <span>{message.metadata.tokens} tokens</span>
                          )}
                          {message.metadata.duration && (
                            <span>• {formatDuration(message.metadata.duration)}</span>
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
                      <Bot size={16} />
                      <Loader2 size={16} className="animate-spin" />
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
                onKeyPress={handleKeyPress}
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
                    <Badge variant={execution.success ? "default" : "destructive"}>
                      {execution.success ? "Success" : "Failed"}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {execution.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 truncate">
                    {execution.input}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{execution.tokensUsed} tokens</span>
                    <span>•</span>
                    <span>{formatDuration(execution.duration)}</span>
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