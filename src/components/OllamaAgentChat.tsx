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
  AlertTriangle
} from 'lucide-react';
import { ollamaAgentService, OllamaAgentConfig, AgentMessage, AgentExecution } from '@/lib/services/OllamaAgentService';
import { ollamaService } from '@/lib/services/ollamaService';
import { strandsSdkService } from '@/lib/services/StrandsSdkService';
import { useToast } from '@/hooks/use-toast';
import { RealTimeAgentMonitor } from './MultiAgentWorkspace/RealTimeAgentMonitor';

interface OllamaAgentChatProps {
  agent: OllamaAgentConfig;
  onClose?: () => void;
}

const OllamaAgentChatComponent: React.FC<OllamaAgentChatProps> = ({ agent, onClose }) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const [showMonitor, setShowMonitor] = useState(false);

  // Initialize conversation and load models once
  useEffect(() => {
    const initChat = async () => {
      try {
        // Load available models once
        if (!modelsLoaded) {
          const models = await ollamaService.listModels();
          setAvailableModels(models.map(m => m.name));
          setModelsLoaded(true);
        }

        // Initialize conversation
        console.log('Initializing conversation for agent:', agent.id);
        const convId = await ollamaAgentService.createConversation(agent.id);
        console.log('Conversation created:', convId);
        setConversationId(convId);
        
        // Load conversation messages
        const conversation = ollamaAgentService.getConversation(convId);
        if (conversation) {
          setMessages(conversation.messages.filter(msg => msg.role !== 'system'));
        }
        
        console.log('Chat initialized successfully for agent:', agent.name);
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        // Set a dummy conversation ID so chat isn't blocked
        setConversationId('temp-' + Date.now());
      }
    };

    initChat();
    loadMetrics();
    loadExecutions();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [agent.id, modelsLoaded]);

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
    if (!currentMessage.trim() || isGenerating) return;

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    const messageText = currentMessage.trim();
    
    const userMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    // Batch state updates
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsGenerating(true);

    try {
      console.log('=== MODEL SELECTION DEBUG ===');
      console.log('Agent model from config:', agent.model);
      console.log('Available models:', availableModels);
      console.log('Agent object:', { id: agent.id, name: agent.name, model: agent.model });
      
      // STRICT MODEL ENFORCEMENT - Always use the agent's configured model
      let modelToUse = agent.model;
      
      // Only use fallback if agent.model is completely missing (shouldn't happen with proper creation)
      if (!modelToUse || modelToUse.trim() === '') {
        console.error('❌ CRITICAL: Agent model is empty! This indicates a bug in agent creation.');
        console.error('Available models for fallback:', availableModels);
        
        // Show error to user
        toast({
          title: "Model Configuration Error",
          description: `Agent "${agent.name}" has no model configured. Please recreate the agent.`,
          variant: "destructive"
        });
        
        // Use fallback but warn user - prefer llama models over phi
        const preferredFallbacks = ['llama3.2:latest', 'llama3.2:1b', 'llama3.2'];
        modelToUse = preferredFallbacks.find(model => availableModels.includes(model)) || 
                     availableModels.find(model => model.includes('llama')) ||
                     availableModels[0] || 
                     'llama3.2:latest';
        console.warn('Using emergency fallback model:', modelToUse);
      } else {
        // Agent has a model configured - use it regardless of availability
        console.log('✅ Using agent configured model:', modelToUse);
        
        // Warn if model not in available list (but still use it)
        if (availableModels.length > 0 && !availableModels.includes(modelToUse)) {
          console.warn(`⚠️ Model ${modelToUse} not in available models list, but using it anyway`);
          console.warn('This might mean the model was removed or Ollama list is stale');
        }
      }
      
      console.log('Final model to use:', modelToUse);
      console.log('=== END DEBUG ===');
      
      // Quick connectivity check if no models are cached
      if (availableModels.length === 0) {
        console.log('No cached models, checking Ollama connectivity...');
        const models = await ollamaService.listModels();
        setAvailableModels(models.map(m => m.name));
        setModelsLoaded(true);
      }
      
      // Build prompt
      const prompt = agent.systemPrompt 
        ? `${agent.systemPrompt}\n\nHuman: ${messageText}\n\nAssistant:`
        : `Human: ${messageText}\n\nAssistant:`;
      
      console.log('Calling Ollama with model:', modelToUse);
      
      // Check if this is a Strands SDK agent
      if (agent.sdkType === 'strands-sdk') {
        console.log('Using Strands SDK service for agent execution');
        
        // Use Strands SDK service with real-time progress
        const execution = await strandsSdkService.executeAgentWithProgress(
          agent.id,
          messageText,
          (step: string, details: string, status: string) => {
            console.log('[Strands SDK] Progress:', step, details);
            // The real-time monitor will handle the progress display
          }
        );
        
        if (abortControllerRef.current?.signal.aborted) {
          return; // Request was cancelled
        }
        
        const assistantMessage: AgentMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: execution.response || 'No response received',
          timestamp: new Date(),
          metadata: {
            model: modelToUse,
            tokens: 0, // Strands SDK doesn't provide token count
            duration: 0, // execution time not available in current response
            tools_used: [] // tools_used not available in current response
          }
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        loadExecutions();
        return;
      }
      
      // Call Ollama directly for regular agents
      const response = await ollamaService.generateResponse(modelToUse, prompt, {
        temperature: agent.temperature || 0.7,
        max_tokens: agent.maxTokens || 1000
      });
      
      console.log('Ollama response received:', response.status);

      if (abortControllerRef.current?.signal.aborted) {
        return; // Request was cancelled
      }

      if (response.status === 'success' && response.response) {
        const assistantMessage: AgentMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          metadata: {
            model: modelToUse,
            tokens: response.eval_count || 0,
            duration: response.total_duration || 0
          }
        };

        console.log('🔍 MESSAGE METADATA DEBUG:');
        console.log('Model used for this message:', modelToUse);
        console.log('Message metadata model:', assistantMessage.metadata.model);
        console.log('Agent name:', agent.name);
        console.log('Agent configured model:', agent.model);

        // Create execution for metrics
        const execution = {
          id: `exec-${Date.now()}`,
          agentId: agent.id,
          input: messageText,
          output: response.response,
          success: true,
          duration: response.total_duration || 1000,
          tokensUsed: response.eval_count || 0,
          timestamp: new Date(),
          metadata: {
            model: modelToUse,
            temperature: agent.temperature || 0.7,
            tools_used: [],
            context_length: messages.length + 1
          }
        };

        // Batch all updates together
        setMessages(prev => [...prev, assistantMessage]);
        ollamaAgentService.addExecution(execution);
        
        // Debounce metrics updates
        setTimeout(() => {
          loadMetrics();
          loadExecutions();
        }, 100);
        
        toast({
          title: "Response Generated",
          description: `${response.eval_count || 0} tokens in ${Math.round((response.total_duration || 0) / 1000000)}ms`,
        });
      } else {
        throw new Error(response.message || 'No response from Ollama');
      }

    } catch (error) {
      console.error('Ollama call failed:', error);
      
      let errorTitle = "Failed to generate response";
      let errorDescription = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorTitle = "Connection Error";
          errorDescription = "Could not connect to Ollama. Make sure Ollama is running.";
        } else if (error.message.includes('timeout')) {
          errorTitle = "Request Timeout";
          errorDescription = "The request took too long. Please try again.";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      });
      
      // Add error message to chat
      const errorMessage: AgentMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorDescription}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-full max-h-[80vh] bg-gray-800 border-gray-700">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {agent.role || 'AI Assistant'}
                </span>
                <span className="text-gray-500">•</span>
                {agent.model ? (
                  <Badge variant="secondary" className="text-xs">
                    <Bot className="w-3 h-3 mr-1" />
                    {agent.model}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    No Model
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMonitor(!showMonitor)}
              className="text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              {showMonitor ? 'Hide Monitor' : 'Show Monitor'}
            </Button>
            <Badge variant="outline" className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              {messages.length} messages
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                console.log('=== AGENT DEBUG INFO ===');
                console.log('Full agent config:', agent);
                console.log('Agent model field:', agent.model);
                console.log('Agent model type:', typeof agent.model);
                console.log('Agent model length:', agent.model?.length);
                console.log('Available models:', availableModels);
                console.log('=== END AGENT DEBUG ===');
              }}
              title="Debug Agent Config"
            >
              🐛
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Agent Info */}
        {agent.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {agent.description}
          </p>
        )}

        {/* Capabilities */}
        {agent.capabilities && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(agent.capabilities)
              .filter(([_, enabled]) => enabled)
              .map(([capability, _]) => (
                <Badge key={capability} variant="secondary" className="text-xs">
                  {capability}
                </Badge>
              ))}
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <ScrollArea className="flex-1 h-0 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Start a conversation with {agent.name}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {agent.expertise ? `Expert in: ${agent.expertise}` : 'Ready to help!'}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg self-start">
                      <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white ml-auto'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.metadata && (
                      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 text-xs opacity-75">
                        {message.metadata.duration && (
                          <span className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            {Math.round(message.metadata.duration / 1000)}s
                          </span>
                        )}
                        {message.metadata.tokens && (
                          <span className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                            <Cpu className="w-3 h-3" />
                            {message.metadata.tokens} tokens
                          </span>
                        )}
                        {message.metadata.model && (
                          <span className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                            <Bot className="w-3 h-3" />
                            {message.metadata.model}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg self-start">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isGenerating && (
              <div className="flex gap-3 justify-start">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
                      {agent.name} is thinking
                      <span className="animate-bounce inline-block">.</span>
                      <span className="animate-bounce inline-block" style={{animationDelay: '0.1s'}}>.</span>
                      <span className="animate-bounce inline-block" style={{animationDelay: '0.2s'}}>.</span>
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${agent.name}...`}
              disabled={isGenerating}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isGenerating}
              size="icon"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Quick Stats */}
          {metrics && (
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {metrics.totalExecutions} total
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {Math.round(metrics.averageResponseTime)}ms avg
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {metrics.totalTokensUsed} tokens
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Real-time Agent Monitor */}
      <RealTimeAgentMonitor
        agentId={agent.id}
        isVisible={showMonitor}
        onClose={() => setShowMonitor(false)}
      />
    </Card>
  );
};

// Memoize component to prevent unnecessary re-renders
export const OllamaAgentChat = React.memo(OllamaAgentChatComponent, (prevProps, nextProps) => {
  return prevProps.agent.id === nextProps.agent.id && 
         prevProps.onClose === nextProps.onClose;
});