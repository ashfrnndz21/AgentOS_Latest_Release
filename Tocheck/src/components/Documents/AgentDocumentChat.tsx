import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, MessageCircle, FileText, Bot, User, Loader2, Sparkles, Brain, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentAgentCreator } from './DocumentAgentCreator';
import { DocumentAgentManager } from './DocumentAgentManager';

interface Document {
  id: string;
  name: string;
  summary?: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  expertise: string;
  personality: string;
  model: string;
  description: string;
  document_ready: boolean;
  predefined?: boolean;
  source: 'user_created' | 'predefined';
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
  agent_info?: {
    name: string;
    role: string;
    expertise: string;
    personality: string;
  };
  metadata?: {
    chunks_retrieved?: number;
    chunks_available?: number;
    context_length?: number;
    document_metadata?: any;
  };
}

interface AgentDocumentChatProps {
  documents: Document[];
  selectedDocuments: string[];
  onDocumentSelectionChange: (selected: string[]) => void;
  ragService?: any;
}

export const AgentDocumentChat: React.FC<AgentDocumentChatProps> = ({
  documents,
  selectedDocuments,
  onDocumentSelectionChange,
  ragService
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'direct' | 'agent'>('direct');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedModel, setSelectedModel] = useState('mistral');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelFilter, setModelFilter] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load available agents on component mount and when model filter changes
  useEffect(() => {
    const loadAgents = async () => {
      try {
        console.log('🤖 Loading document-ready agents...', modelFilter ? `filtered by ${modelFilter}` : 'all models');
        
        const url = modelFilter 
          ? `http://localhost:5002/api/agents/document-ready?model_filter=${encodeURIComponent(modelFilter)}`
          : 'http://localhost:5002/api/agents/document-ready';
          
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
          setAvailableAgents(data.agents || []);
          console.log('🤖 Loaded agents:', data.agents?.length || 0);
          
          // Auto-select first agent if available and no agent currently selected
          if (data.agents && data.agents.length > 0 && !selectedAgent) {
            setSelectedAgent(data.agents[0]);
            setChatMode('agent');
          }
          
          // If current agent is not in filtered list, clear selection
          if (selectedAgent && modelFilter) {
            const agentStillAvailable = data.agents.some((agent: Agent) => agent.id === selectedAgent.id);
            if (!agentStillAvailable) {
              setSelectedAgent(null);
            }
          }
        } else {
          console.error('❌ Failed to load agents:', data);
        }
      } catch (error) {
        console.error('❌ Error loading agents:', error);
      } finally {
        setLoadingAgents(false);
      }
    };

    loadAgents();
  }, [modelFilter]); // Re-load when model filter changes

  // Function to refresh agents (called after creating new agent)
  const refreshAgents = useCallback(() => {
    setLoadingAgents(true);
    // Trigger re-load by updating a dependency
    const loadAgents = async () => {
      try {
        const url = modelFilter 
          ? `http://localhost:5002/api/agents/document-ready?model_filter=${encodeURIComponent(modelFilter)}`
          : 'http://localhost:5002/api/agents/document-ready';
          
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
          setAvailableAgents(data.agents || []);
          console.log('🔄 Refreshed agents:', data.agents?.length || 0);
        }
      } catch (error) {
        console.error('❌ Error refreshing agents:', error);
      } finally {
        setLoadingAgents(false);
      }
    };
    
    loadAgents();
  }, [modelFilter]);

  // Load available Ollama models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const { ollamaService } = await import('@/lib/services/OllamaService');
        const models = await ollamaService.listModels();
        const modelNames = models.map(model => model.name);
        setAvailableModels(modelNames);
        
        if (modelNames.length > 0 && !modelNames.includes(selectedModel)) {
          const defaultModel = modelNames.find(name => name.includes('mistral')) || modelNames[0];
          setSelectedModel(defaultModel);
        }
      } catch (error) {
        console.error('❌ Failed to load models:', error);
        setAvailableModels(['mistral', 'phi3', 'llama3.2']);
      }
    };

    loadModels();
  }, [selectedModel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleDocumentSelection = useCallback((documentId: string) => {
    const isSelected = selectedDocuments.includes(documentId);
    if (isSelected) {
      onDocumentSelectionChange(selectedDocuments.filter(id => id !== documentId));
    } else {
      onDocumentSelectionChange([...selectedDocuments, documentId]);
    }
  }, [selectedDocuments, onDocumentSelectionChange]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let response;
      
      if (chatMode === 'agent' && selectedAgent) {
        // Use agent-enhanced RAG
        console.log('🤖 Using agent:', selectedAgent.name);
        
        const agentConfig = {
          name: selectedAgent.name,
          role: selectedAgent.role,
          expertise: selectedAgent.expertise,
          personality: selectedAgent.personality,
          memory: 'No previous conversation context'
        };

        response = await fetch('http://localhost:5002/api/rag/agent-query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: userMessage.content,
            document_ids: selectedDocuments.length > 0 ? selectedDocuments : undefined,
            agent_config: agentConfig,
            model_name: selectedAgent.model || selectedModel
          })
        });
      } else {
        // Use direct RAG service
        console.log('🔍 Using direct RAG service');
        
        if (ragService) {
          const ragResponse = await ragService.queryDocuments({
            query: userMessage.content,
            documentIds: selectedDocuments.length > 0 ? selectedDocuments : undefined,
            model: selectedModel,
            maxChunks: 5
          });

          const assistantMessage: ChatMessage = {
            id: Math.random().toString(36).substring(2, 11),
            type: 'assistant',
            content: ragResponse.response,
            sources: ragResponse.sources,
            timestamp: new Date(),
            metadata: {
              chunks_retrieved: ragResponse.chunks_retrieved,
              chunks_available: ragResponse.chunks_available,
              context_length: ragResponse.context_length,
              document_metadata: ragResponse.document_metadata
            }
          };

          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        }
      }

      if (response && response.ok) {
        const result = await response.json();
        
        const assistantMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 11),
          type: 'assistant',
          content: result.response,
          sources: result.sources,
          timestamp: new Date(),
          agent_info: result.agent_info,
          metadata: {
            chunks_retrieved: result.chunks_retrieved,
            chunks_available: result.chunks_available,
            context_length: result.context_length,
            document_metadata: result.document_metadata
          }
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, selectedDocuments, chatMode, selectedAgent, selectedModel, ragService]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const activeDocuments = selectedDocuments.length > 0 
    ? documents.filter(doc => selectedDocuments.includes(doc.id))
    : documents;

  return (
    <div className="space-y-4">
      {/* Chat Mode Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">Chat Mode:</h4>
          <div className="flex gap-2">
            <Button
              variant={chatMode === 'direct' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChatMode('direct')}
            >
              🔍 Direct LLM
            </Button>
            <Button
              variant={chatMode === 'agent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChatMode('agent')}
              disabled={loadingAgents || availableAgents.length === 0}
            >
              🤖 Agent Chat
            </Button>
          </div>
        </div>

        {/* Agent Selection */}
        {chatMode === 'agent' && (
          <div className="space-y-3">
            {/* Model Filter and Agent Creator */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select 
                  value={modelFilter || "all-models"} 
                  onValueChange={(value) => setModelFilter(value === "all-models" ? "" : value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Filter by model (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-models">
                      <div className="flex items-center gap-2">
                        <Filter size={12} />
                        All Models
                      </div>
                    </SelectItem>
                    {availableModels.map(model => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <DocumentAgentCreator 
                availableModels={availableModels}
                onAgentCreated={refreshAgents}
              />
              
              <DocumentAgentManager 
                agents={availableAgents}
                onAgentDeleted={refreshAgents}
                selectedAgent={selectedAgent}
              />
            </div>

            {/* Agent Selection */}
            <Select 
              value={selectedAgent?.id || "no-selection"} 
              onValueChange={(value) => {
                if (value !== "no-selection" && value !== "loading" && value !== "no-agents") {
                  const agent = availableAgents.find(a => a.id === value);
                  setSelectedAgent(agent || null);
                }
              }}
              disabled={loadingAgents}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder={loadingAgents ? "Loading agents..." : "Select an agent"} />
              </SelectTrigger>
              <SelectContent>
                {loadingAgents ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" />
                      Loading agents...
                    </div>
                  </SelectItem>
                ) : availableAgents.length > 0 ? (
                  <>
                    {/* Custom agents section */}
                    {availableAgents.filter(agent => agent.source === 'user_created').length > 0 && (
                      availableAgents
                        .filter(agent => agent.source === 'user_created')
                        .map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center gap-2 w-full">
                              <Brain size={12} />
                              <span className="flex-1">{agent.name} - {agent.role}</span>
                              <Badge variant="outline" className="text-xs">
                                {agent.model}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                    )}
                    
                    {/* Predefined agents section */}
                    {availableAgents
                      .filter(agent => agent.source === 'predefined')
                      .map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex items-center gap-2">
                            <Sparkles size={12} />
                            <span>{agent.name} - {agent.role}</span>
                            <Badge variant="outline" className="text-xs ml-auto">
                              {agent.model}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    }
                  </>
                ) : (
                  <SelectItem value="no-agents" disabled>
                    {modelFilter 
                      ? `No agents available for ${modelFilter}`
                      : 'No agents available'
                    }
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {selectedAgent && (
              <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-white">{selectedAgent.name}</h5>
                    <p className="text-sm text-purple-400">{selectedAgent.role}</p>
                    <p className="text-xs text-gray-400 mt-1">{selectedAgent.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedAgent.model}
                      </Badge>
                      {selectedAgent.predefined && (
                        <Badge variant="secondary" className="text-xs">
                          Predefined
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Model Selection for Direct Mode */}
        {chatMode === 'direct' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Ollama Model:</h4>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map(model => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Document Selection */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white">Select Documents to Chat With:</h4>
        <div className="flex flex-wrap gap-2">
          {documents.map(doc => (
            <Badge
              key={doc.id}
              variant={selectedDocuments.includes(doc.id) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                selectedDocuments.includes(doc.id)
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'hover:bg-gray-700'
              }`}
              onClick={() => toggleDocumentSelection(doc.id)}
            >
              <FileText size={12} className="mr-1" />
              {doc.name}
            </Badge>
          ))}
        </div>
        {selectedDocuments.length === 0 && (
          <p className="text-xs text-gray-400">
            No documents selected. All documents will be used for context.
          </p>
        )}
      </div>

      {/* Chat Messages */}
      <Card className="bg-gray-800 border-gray-700">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {chatMode === 'agent' && selectedAgent 
                  ? `Start a conversation with ${selectedAgent.name}`
                  : 'Start a conversation'
                }
              </h3>
              <p className="text-gray-500">
                {chatMode === 'agent' && selectedAgent
                  ? `${selectedAgent.name} will analyze your documents using their expertise in ${selectedAgent.expertise}.`
                  : 'Ask questions about your documents. I\'ll search through them to provide accurate answers.'
                }
              </p>
            </div>
          )}

          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {message.agent_info && (
                  <div className="mb-2 pb-2 border-b border-gray-600">
                    <p className="text-xs text-purple-300 font-medium">
                      {message.agent_info.name} ({message.agent_info.role})
                    </p>
                  </div>
                )}
                
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <p className="text-xs text-gray-300 mb-1">Sources:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.sources.map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {message.metadata && message.type === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <p className="text-xs text-gray-300 mb-1">Analysis Info:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      {message.metadata.chunks_retrieved !== undefined && (
                        <div>
                          <span className="text-gray-300">Chunks:</span> {message.metadata.chunks_retrieved}
                        </div>
                      )}
                      {message.metadata.context_length && (
                        <div>
                          <span className="text-gray-300">Context:</span> {message.metadata.context_length} chars
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">
                    {chatMode === 'agent' && selectedAgent 
                      ? `${selectedAgent.name} is analyzing...`
                      : 'Thinking...'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            chatMode === 'agent' && selectedAgent
              ? `Ask ${selectedAgent.name} about ${activeDocuments.length} document${activeDocuments.length !== 1 ? 's' : ''}...`
              : `Ask about ${activeDocuments.length} document${activeDocuments.length !== 1 ? 's' : ''}...`
          }
          className="flex-1 bg-gray-800 border-gray-700 text-white"
          disabled={isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="px-4"
        >
          <Send size={16} />
        </Button>
      </div>

      {/* Context Info */}
      <div className="text-xs text-gray-400 flex items-center justify-between">
        <span>
          {chatMode === 'agent' && selectedAgent
            ? `🤖 Powered by ${selectedAgent.name} • Model: ${selectedAgent.model}`
            : `💡 Powered by Ollama • Model: ${selectedModel}`
          }
        </span>
        <span>Context: {activeDocuments.length} document{activeDocuments.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};