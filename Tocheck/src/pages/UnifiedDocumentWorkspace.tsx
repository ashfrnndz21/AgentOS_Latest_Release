import React, { useState, useCallback, useEffect } from 'react';
import { Upload, MessageCircle, FileText, Sparkles, AlertCircle, CheckCircle, Loader2, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OllamaService } from '@/lib/services/OllamaService';
import { BackendControl } from '@/components/BackendControl';
import { DocumentProcessingLogs } from '@/components/Documents/DocumentProcessingLogs';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'processing' | 'ready' | 'error';
  uploadedAt: Date;
  content?: string;
  chunks?: string[];
  error?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export const UnifiedDocumentWorkspace: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [ollamaService] = useState(() => new OllamaService());
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'running' | 'not_running'>('checking');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // UI state
  const [activeView, setActiveView] = useState<'upload' | 'chat' | 'library'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [showProcessingLogs, setShowProcessingLogs] = useState(true);

  // Initialize Ollama and load models
  useEffect(() => {
    const initializeOllama = async () => {
      try {
        setIsLoadingModels(true);
        
        // Check Ollama status
        const status = await ollamaService.getStatus();
        setOllamaStatus(status.status === 'running' ? 'running' : 'not_running');
        
        if (status.status === 'running') {
          // Load available models
          const models = await ollamaService.listModels();
          const modelNames = models.map(model => model.name);
          setAvailableModels(modelNames);
          
          // Set default model
          if (modelNames.length > 0) {
            const defaultModel = modelNames.find(name => name.includes('mistral')) || 
                               modelNames.find(name => name.includes('llama')) || 
                               modelNames[0];
            setSelectedModel(defaultModel);
          }
        }
      } catch (error) {
        console.error('Failed to initialize Ollama:', error);
        setOllamaStatus('not_running');
      } finally {
        setIsLoadingModels(false);
      }
    };

    initializeOllama();
  }, [ollamaService]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const documentId = Math.random().toString(36).substring(2, 11);
      
      // Add document with processing status
      const newDoc: Document = {
        id: documentId,
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'processing',
        uploadedAt: new Date()
      };
      
      setDocuments(prev => [...prev, newDoc]);
      
      try {
        // Process document (simple text extraction for now)
        const content = await extractTextFromFile(file);
        const chunks = chunkText(content);
        
        // Update document status
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'ready' as const, content, chunks }
            : doc
        ));
        
      } catch (error) {
        // Update document with error status
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? { 
                ...doc, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              }
            : doc
        ));
      }
    }
  }, []);

  // Extract text from file
  const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        
        if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          resolve(content);
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          // For demo purposes, simulate PDF content
          resolve(`PDF Content from ${file.name}\n\nThis is extracted content from the PDF document. In a production environment, this would use a proper PDF parsing library to extract the actual text content.`);
        } else {
          resolve(content || `Content from ${file.name}`);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Simple text chunking
  const chunkText = (text: string, chunkSize: number = 1000): string[] => {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Handle file input
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Find relevant chunks for query
  const findRelevantChunks = useCallback((query: string): { chunks: string[], sources: string[] } => {
    const queryLower = query.toLowerCase();
    const relevantChunks: { chunk: string, source: string, score: number }[] = [];
    
    const documentsToSearch = selectedDocuments.length > 0 
      ? documents.filter(doc => selectedDocuments.includes(doc.id) && doc.status === 'ready')
      : documents.filter(doc => doc.status === 'ready');
    
    for (const doc of documentsToSearch) {
      if (doc.chunks) {
        for (const chunk of doc.chunks) {
          const chunkLower = chunk.toLowerCase();
          
          // Simple relevance scoring
          const queryWords = queryLower.split(/\s+/);
          let score = 0;
          
          for (const word of queryWords) {
            if (word.length > 2) {
              const matches = (chunkLower.match(new RegExp(word, 'g')) || []).length;
              score += matches;
            }
          }
          
          if (score > 0) {
            relevantChunks.push({ chunk, source: doc.name, score });
          }
        }
      }
    }
    
    // Sort by relevance and take top 3
    relevantChunks.sort((a, b) => b.score - a.score);
    const topChunks = relevantChunks.slice(0, 3);
    
    return {
      chunks: topChunks.map(item => item.chunk),
      sources: [...new Set(topChunks.map(item => item.source))]
    };
  }, [documents, selectedDocuments]);

  // Handle chat message
  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || isGenerating || !selectedModel) return;
    
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      type: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsGenerating(true);
    
    try {
      let prompt = currentMessage.trim();
      let sources: string[] = [];
      
      // If documents are available, use RAG
      const readyDocs = documents.filter(doc => doc.status === 'ready');
      if (readyDocs.length > 0) {
        const { chunks, sources: docSources } = findRelevantChunks(currentMessage.trim());
        
        if (chunks.length > 0) {
          const context = chunks.join('\n\n---\n\n');
          prompt = `Based on the following document context, please answer the user's question. If the information is not available in the context, please say so.

DOCUMENT CONTEXT:
${context}

USER QUESTION: ${currentMessage.trim()}

ANSWER:`;
          sources = docSources;
        }
      }
      
      // Generate response with Ollama
      const response = await ollamaService.generateResponse({
        model: selectedModel,
        prompt,
        options: {
          temperature: 0.7,
          max_tokens: 1000
        }
      });
      
      if (response.status === 'success' && response.response) {
        const assistantMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 11),
          type: 'assistant',
          content: response.response,
          timestamp: new Date(),
          sources: sources.length > 0 ? sources : undefined
        };
        
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.message || 'Failed to generate response');
      }
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 11),
        type: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  }, [currentMessage, isGenerating, selectedModel, documents, findRelevantChunks, ollamaService]);

  // Handle document selection
  const toggleDocumentSelection = useCallback((documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  }, []);

  const readyDocuments = documents.filter(doc => doc.status === 'ready');
  const isChatEnabled = ollamaStatus === 'running' && selectedModel && !isLoadingModels;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="text-purple-400" />
            Document Chat with Ollama
          </h1>
          <p className="text-gray-400">
            Upload documents and chat with them using local Ollama models
          </p>
        </div>

        {/* Ollama Status */}
        {isLoadingModels ? (
          <Alert className="mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Loading Ollama models...</AlertDescription>
          </Alert>
        ) : ollamaStatus === 'not_running' ? (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription>
              Ollama is not running. Please start Ollama with: <code className="bg-gray-800 px-2 py-1 rounded">ollama serve</code>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              Ollama is running with {availableModels.length} models available
            </AlertDescription>
          </Alert>
        )}

        {/* Model Selection */}
        {availableModels.length > 0 && (
          <Card className="mb-6 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm">Select Ollama Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {availableModels.map(model => (
                  <Button
                    key={model}
                    variant={selectedModel === model ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedModel(model)}
                  >
                    {model}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeView === 'upload' ? 'default' : 'outline'}
            onClick={() => setActiveView('upload')}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Upload Documents
          </Button>
          <Button
            variant={activeView === 'chat' ? 'default' : 'outline'}
            onClick={() => setActiveView('chat')}
            disabled={!isChatEnabled}
            className="flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Chat
          </Button>
          <Button
            variant={activeView === 'library' ? 'default' : 'outline'}
            onClick={() => setActiveView('library')}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            Library ({readyDocuments.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Upload View */}
            {activeView === 'upload' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                  <CardDescription>
                    Upload text files, PDFs, or other documents to chat with them
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-purple-400 bg-purple-400/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      Drop files here or click to browse
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Supports: .txt, .md, .pdf • Max size: 50 MB
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".txt,.md,.pdf"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-input"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="file-input" className="cursor-pointer">
                        Browse Files
                      </label>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chat View */}
            {activeView === 'chat' && (
              <Card className="bg-gray-800 border-gray-700 h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle size={20} />
                    Chat with Documents
                  </CardTitle>
                  <CardDescription>
                    {selectedDocuments.length > 0 
                      ? `Chatting with ${selectedDocuments.length} selected documents`
                      : readyDocuments.length > 0 
                        ? `Chatting with all ${readyDocuments.length} documents`
                        : 'No documents available - upload some documents first'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-4">
                      {chatMessages.map(message => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.type === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.type === 'user'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {message.type === 'user' ? (
                                <User size={16} />
                              ) : (
                                <Bot size={16} />
                              )}
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-600">
                                <p className="text-xs opacity-70">Sources:</p>
                                <div className="flex gap-1 mt-1">
                                  {message.sources.map((source, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
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
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder={
                        isChatEnabled 
                          ? "Ask a question about your documents..." 
                          : "Please select a model and ensure Ollama is running"
                      }
                      disabled={!isChatEnabled || isGenerating}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="bg-gray-700 border-gray-600"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!isChatEnabled || isGenerating || !currentMessage.trim()}
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Library View */}
            {activeView === 'library' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Document Library</CardTitle>
                  <CardDescription>
                    Manage your uploaded documents and select which ones to chat with
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div
                        key={doc.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedDocuments.includes(doc.id)
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => doc.status === 'ready' && toggleDocumentSelection(doc.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText size={20} className="text-blue-400" />
                            <div>
                              <p className="font-medium text-white">{doc.name}</p>
                              <p className="text-xs text-gray-400">
                                {(doc.size / 1024).toFixed(1)} KB • {doc.uploadedAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.status === 'processing' && (
                              <Loader2 size={16} className="animate-spin text-blue-400" />
                            )}
                            {doc.status === 'ready' && (
                              <>
                                <CheckCircle size={16} className="text-green-400" />
                                {doc.chunks && (
                                  <Badge variant="secondary">{doc.chunks.length} chunks</Badge>
                                )}
                              </>
                            )}
                            {doc.status === 'error' && (
                              <AlertCircle size={16} className="text-red-400" />
                            )}
                          </div>
                        </div>
                        {doc.status === 'error' && doc.error && (
                          <p className="text-xs text-red-400 mt-2">{doc.error}</p>
                        )}
                      </div>
                    ))}
                    {documents.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No documents uploaded yet</p>
                        <p className="text-sm">Upload some documents to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Backend Control */}
            <BackendControl />
            
            {/* Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ollama:</span>
                  <Badge variant={ollamaStatus === 'running' ? 'default' : 'destructive'}>
                    {ollamaStatus === 'running' ? 'Running' : 'Not Running'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Model:</span>
                  <Badge variant="outline">{selectedModel || 'None'}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Documents:</span>
                  <Badge variant="secondary">{readyDocuments.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Selected:</span>
                  <Badge variant="secondary">{selectedDocuments.length}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedDocuments([])}
                  disabled={selectedDocuments.length === 0}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedDocuments(readyDocuments.map(doc => doc.id))}
                  disabled={readyDocuments.length === 0}
                >
                  Select All Documents
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setChatMessages([])}
                  disabled={chatMessages.length === 0}
                >
                  Clear Chat History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowProcessingLogs(!showProcessingLogs)}
                >
                  {showProcessingLogs ? 'Hide' : 'Show'} Processing Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Document Processing Logs */}
        <div className="mt-6">
          <DocumentProcessingLogs 
            documents={documents}
            isVisible={showProcessingLogs}
            onToggleVisibility={() => setShowProcessingLogs(!showProcessingLogs)}
          />
        </div>
      </div>
    </div>
  );
};