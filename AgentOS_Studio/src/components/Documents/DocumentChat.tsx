import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, MessageCircle, FileText, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Document {
  id: string;
  name: string;
  summary?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
  metadata?: {
    chunks_retrieved?: number;
    chunks_available?: number;
    context_length?: number;
  };
}

interface DocumentChatProps {
  documents: Document[];
  selectedDocuments: string[];
  onDocumentSelectionChange: (selected: string[]) => void;
  onQuery?: (query: string) => Promise<any>;
  isEnabled?: boolean;
  model?: string;
}

export const DocumentChat: React.FC<DocumentChatProps> = ({
  documents,
  selectedDocuments,
  onDocumentSelectionChange,
  onQuery,
  isEnabled = true,
  model = 'llama3.2'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(model);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load available Ollama models on component mount
  useEffect(() => {
    const loadAvailableModels = async () => {
      try {
        const response = await fetch('/api/ollama/models');
        if (response.ok) {
          const data = await response.json();
          const modelNames = data?.map((model: any) => model.name) || [];
          setAvailableModels(modelNames);
          
          // Set default model to first available or keep current
          if (modelNames.length > 0 && !modelNames.includes(selectedModel)) {
            const defaultModel = modelNames.find((name: string) => name.includes('llama3.2')) || modelNames[0];
            setSelectedModel(defaultModel);
          }
        }
      } catch (error) {
        console.error('Failed to load Ollama models:', error);
        // Fallback to popular models if API fails
        const fallbackModels = ['llama3.2', 'llama3.2:1b', 'mistral', 'phi3', 'gemma2', 'codellama'];
        setAvailableModels(fallbackModels);
      } finally {
        setLoadingModels(false);
      }
    };
    
    loadAvailableModels();
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
    if (!inputValue.trim() || isLoading || !isEnabled) return;

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
      
      if (onQuery) {
        // Use provided query function (real RAG)
        response = await onQuery(userMessage.content);
      } else {
        // Fallback to simulation
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        response = {
          response: `Based on your documents, here's what I found about "${userMessage.content}":

This is a simulated response. Please ensure the RAG service is properly configured for real document chat functionality.`,
          sources: selectedDocuments.length > 0 
            ? documents.filter(d => selectedDocuments.includes(d.id)).map(d => d.name)
            : documents.slice(0, 2).map(d => d.name),
          success: true
        };
      }

      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 11),
          type: 'assistant',
          content: response.response || 'No response generated',
          sources: response.sources || [],
          timestamp: new Date(),
          metadata: {
            chunks_retrieved: response.chunks_retrieved,
            chunks_available: response.chunks_available,
            context_length: response.context_length
          }
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.response || 'Query failed');
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
  }, [inputValue, isLoading, isEnabled, selectedDocuments, documents, onQuery]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
  const activeDocuments = selectedDocuments.length > 0 ? selectedDocs : documents;

  return (
    <div className="space-y-4">
      {/* Model Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">Ollama Model:</h4>
          <Select value={selectedModel} onValueChange={setSelectedModel} disabled={loadingModels}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue placeholder={loadingModels ? "Loading models..." : "Select model"} />
            </SelectTrigger>
            <SelectContent>
              {loadingModels ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" />
                    Loading available models...
                  </div>
                </SelectItem>
              ) : availableModels.length > 0 ? (
                availableModels.map(model => (
                  <SelectItem key={model} value={model}>
                    {model}
                    {model.includes('llama3.2') && !model.includes('1b') && ' (Recommended)'}
                    {model.includes('1b') && ' (Fast)'}
                    {model.includes('code') && ' (Code)'}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-models" disabled>
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-400">No models available</p>
                    <p className="text-xs text-gray-500">Install with: ollama pull llama3.2</p>
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
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
                Start a conversation
              </h3>
              <p className="text-gray-500">
                Ask questions about your documents. I'll search through them to provide accurate answers.
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
                    <p className="text-xs text-gray-300 mb-1">Retrieval Info:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      {message.metadata.chunks_retrieved !== undefined && (
                        <div>
                          <span className="text-gray-300">Chunks:</span> {message.metadata.chunks_retrieved}
                          {message.metadata.chunks_available && ` / ${message.metadata.chunks_available}`}
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
                  <span className="text-sm">Thinking...</span>
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
          onKeyPress={handleKeyPress}
          placeholder={
            isEnabled 
              ? `Ask about ${activeDocuments.length} document${activeDocuments.length !== 1 ? 's' : ''}...`
              : "Please upload documents and ensure Ollama is running"
          }
          className="flex-1 bg-gray-800 border-gray-700 text-white"
          disabled={!isEnabled || isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading || !isEnabled}
          className="px-4"
        >
          <Send size={16} />
        </Button>
      </div>

      {/* Context Info */}
      <div className="text-xs text-gray-400 flex items-center justify-between">
        <span>💡 Powered by Ollama • Model: {selectedModel}</span>
        <span>Context: {activeDocuments.length} document{activeDocuments.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};