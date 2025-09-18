import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, MessageCircle, FileText, Loader2, Sparkles, AlertCircle, CheckCircle, Send, Bot, User, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentProcessingLogs } from '@/components/Documents/DocumentProcessingLogs';
import { DocumentChat } from '@/components/Documents/DocumentChat';
import { AgentDocumentChat } from '@/components/Documents/AgentDocumentChat';
import { OllamaService } from '@/lib/services/OllamaService';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'processing' | 'ready' | 'error';
  uploadedAt: Date;
  chunks?: number;
  error?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  documentIds?: string[];
}

// RAG Service for DocumentChat component
class SimpleRAGService {
  async queryDocuments(params: {
    query: string;
    documentIds?: string[];
    model: string;
    maxChunks?: number;
  }) {
    try {
      const response = await fetch('http://localhost:5002/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: params.query,
          document_ids: params.documentIds,
          model_name: params.model,
          max_chunks: params.maxChunks || 5
        })
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        response: result.response || 'No response generated',
        sources: result.sources || [],
        chunks_retrieved: result.chunks_retrieved || 0,
        chunks_available: result.chunks_available || 0,
        context_length: result.context_length || 0,
        document_metadata: result.document_metadata || {}
      };
    } catch (error) {
      console.error('RAG query error:', error);
      throw error;
    }
  }
}

export const SimpleRealDocumentWorkspace: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeView, setActiveView] = useState<'upload' | 'chat' | 'library' | 'debug' | 'metadata' | 'logs'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('mistral');
  const [ollamaService] = useState(() => new OllamaService());
  const [ragService] = useState(() => new SimpleRAGService());
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Handle file upload with real backend processing
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setIsUploading(true);
    
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
        // Check if backend is available
        if (backendStatus === 'error') {
          throw new Error('Backend is offline - cannot process documents');
        }
        
        // Upload to real backend RAG service
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model_name', selectedModel);
        
        const response = await fetch('http://localhost:5002/api/rag/ingest', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Update document status with real results
          setDocuments(prev => prev.map(doc => 
            doc.id === documentId 
              ? {
                  ...doc,
                  id: result.document_id || documentId,
                  status: result.status === 'success' ? 'ready' as const : 'error' as const,
                  chunks: result.chunks_created,
                  error: result.status === 'error' ? result.error : undefined
                }
              : doc
          ));
        } else {
          const errorText = await response.text();
          throw new Error(`Upload failed (${response.status}): ${errorText}`);
        }
        
      } catch (error) {
        console.error('❌ Document upload failed:', error);
        // Update document with error status
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? { 
                ...doc, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Upload failed' 
              }
            : doc
        ));
      }
    }
    
    setIsUploading(false);
  }, []);

  // Drag and drop handlers
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

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Load Ollama models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        setBackendStatus('checking');
        
        // First check backend health
        const healthResponse = await fetch('http://localhost:5002/health');
        if (!healthResponse.ok) {
          throw new Error('Backend not responding');
        }
        
        // Then get Ollama models
        console.log('🔍 Calling ollamaService.listModels()...');
        const ollamaModels = await ollamaService.listModels();
        console.log('📋 Raw Ollama models response:', ollamaModels);
        
        const modelNames = ollamaModels.map(model => model.name);
        console.log('🎯 Extracted model names:', modelNames);
        
        setAvailableModels(modelNames);
        setBackendStatus('connected');
        
        // Set default model if available
        if (modelNames.length > 0 && !modelNames.includes(selectedModel)) {
          const defaultModel = modelNames.find(name => 
            name.includes('llama3.2') && !name.includes('1b')
          ) || modelNames.find(name => 
            name.includes('mistral')
          ) || modelNames[0];
          
          setSelectedModel(defaultModel);
          console.log('🎯 Selected default model:', defaultModel);
        }
      } catch (error) {
        console.error('❌ Failed to load models or connect to backend:', error);
        setBackendStatus('error');
        
        // Try to get models directly from Ollama as fallback
        try {
          const directResponse = await fetch('http://localhost:11434/api/tags');
          if (directResponse.ok) {
            const data = await directResponse.json();
            const modelNames = data.models?.map((m: any) => m.name) || [];
            if (modelNames.length > 0) {
              console.log('🔄 Using direct Ollama connection:', modelNames);
              setAvailableModels(modelNames);
              
              const defaultModel = modelNames.find((name: string) => 
                name.includes('llama3.2') && !name.includes('1b')
              ) || modelNames.find((name: string) => 
                name.includes('mistral')
              ) || modelNames[0];
              
              setSelectedModel(defaultModel);
              return;
            }
          }
        } catch (directError) {
          console.error('❌ Direct Ollama connection also failed:', directError);
        }
        
        // Final fallback to common models
        const fallbackModels = ['mistral:latest', 'llama3.2:latest', 'qwen2.5:latest'];
        setAvailableModels(fallbackModels);
        console.log('🔄 Using fallback models:', fallbackModels);
      }
    };

    loadModels();
  }, []); // Run only once on mount

  // Handle document selection change from DocumentChat
  const handleDocumentSelectionChange = useCallback((selected: string[]) => {
    setSelectedDocuments(selected);
  }, []);

  const readyDocuments = documents.filter(doc => doc.status === 'ready');
  const isChatEnabled = readyDocuments.length > 0; // Enable chat if there are ready documents

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            📄 Agentic RAG
          </h1>
          <p className="text-gray-400">
            Intelligent document processing with AI agents and RAG pipeline
          </p>
        </div>

        {/* Backend Status Alert */}
        {backendStatus === 'error' && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Backend is not responding - document processing unavailable</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      🔄 Retry Connection
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-red-300">
                  💡 To fix: Start the backend with <code className="bg-red-900/30 px-1 rounded">python backend/simple_api.py</code>
                  {availableModels.length > 0 && (
                    <span className="ml-2">• Ollama models loaded directly: {availableModels.length} available</span>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {backendStatus === 'connected' && (
          <Alert className="mb-6 border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>✅ Backend connected • {availableModels.length} Ollama models available</span>
                <Badge variant="outline" className="border-green-600 text-green-400">
                  Ready for RAG
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
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
            onClick={() => {
              setActiveView('chat');
              // Auto-select all ready documents if none are selected
              if (selectedDocuments.length === 0 && readyDocuments.length > 0) {
                setSelectedDocuments(readyDocuments.map(doc => doc.id));
              }
            }}
            disabled={!isChatEnabled}
            className="flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Chat ({selectedDocuments.length > 0 ? selectedDocuments.length : readyDocuments.length} docs)
          </Button>
          <Button
            variant={activeView === 'library' ? 'default' : 'outline'}
            onClick={() => setActiveView('library')}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            Library ({readyDocuments.length})
          </Button>
          <Button
            variant={activeView === 'debug' ? 'default' : 'outline'}
            onClick={() => setActiveView('debug')}
            className="flex items-center gap-2"
          >
            <Sparkles size={16} />
            Debug RAG
          </Button>
          <Button
            variant={activeView === 'metadata' ? 'default' : 'outline'}
            onClick={() => setActiveView('metadata')}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            Metadata & Chunks
          </Button>
          <Button
            variant={activeView === 'logs' ? 'default' : 'outline'}
            onClick={() => setActiveView('logs')}
            className="flex items-center gap-2"
          >
            <Loader2 size={16} />
            Processing Logs
          </Button>
        </div>

        {/* Model Selection */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Ollama Model Selection
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                🔄 Refresh Models
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableModels.length > 0 ? (
              <>
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
                <p className="text-xs text-gray-400 mt-2">
                  Selected: {selectedModel} • {availableModels.length} models available
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Loading models...</p>
                <p className="text-xs text-gray-500 mt-1">
                  Status: {backendStatus}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeView === 'upload' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                  <CardDescription>
                    Upload PDF documents for real RAG processing with LangChain + Ollama
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Drop PDF files here or click to browse</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Supports: .pdf • Max size: 50 MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild disabled={isUploading}>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Browse Files'
                        )}
                      </label>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeView === 'chat' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Chat with Documents</CardTitle>
                  <CardDescription>
                    {readyDocuments.length > 0 
                      ? `Chat with ${readyDocuments.length} processed documents using real RAG • ${selectedDocuments.length > 0 ? `${selectedDocuments.length} selected` : 'All documents active'}`
                      : 'No documents ready - upload some documents first'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {readyDocuments.length > 0 ? (
                    <AgentDocumentChat
                      documents={readyDocuments.map(doc => ({
                        id: doc.id,
                        name: doc.name,
                        summary: `${doc.chunks || 0} chunks processed`
                      }))}
                      selectedDocuments={selectedDocuments.length > 0 ? selectedDocuments : readyDocuments.map(doc => doc.id)}
                      onDocumentSelectionChange={handleDocumentSelectionChange}
                      ragService={ragService}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <Upload size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No documents available</p>
                      <p className="text-sm text-gray-400">Upload some documents to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeView === 'library' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Document Library
                    {readyDocuments.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDocuments(readyDocuments.map(doc => doc.id))}
                          className="text-xs"
                        >
                          Select All Ready
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDocuments([])}
                          className="text-xs"
                        >
                          Clear Selection
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Manage your uploaded documents and select them for chat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div 
                          key={doc.id} 
                          className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
                            selectedDocuments.includes(doc.id)
                              ? 'bg-purple-600/20 border border-purple-500'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                          onClick={() => {
                            if (doc.status === 'ready') {
                              const isSelected = selectedDocuments.includes(doc.id);
                              if (isSelected) {
                                setSelectedDocuments(prev => prev.filter(id => id !== doc.id));
                              } else {
                                setSelectedDocuments(prev => [...prev, doc.id]);
                              }
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <FileText size={20} />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-400">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                                {doc.chunks && ` • ${doc.chunks} chunks`}
                                {doc.error && ` • Error: ${doc.error}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedDocuments.includes(doc.id) && doc.status === 'ready' && (
                              <Badge variant="default" className="bg-purple-600">
                                Selected for Chat
                              </Badge>
                            )}
                            {doc.status === 'processing' && (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              doc.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                              doc.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {readyDocuments.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-700/50 rounded border border-gray-600">
                          <p className="text-sm text-gray-300 mb-2">
                            💡 Click on ready documents to select them for chat
                          </p>
                          <p className="text-xs text-gray-400">
                            Selected: {selectedDocuments.length} / {readyDocuments.length} ready documents
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No documents uploaded yet</p>
                      <p className="text-sm text-gray-400">Upload some documents to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeView === 'debug' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>RAG Debug Panel</CardTitle>
                  <CardDescription>
                    Debug and monitor RAG processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                    <p>RAG Debug functionality</p>
                    <p className="text-sm text-gray-400">Monitor embeddings, chunks, and retrieval</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeView === 'metadata' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Document Metadata & Chunks</CardTitle>
                  <CardDescription>
                    View document chunks and metadata
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Document metadata viewer</p>
                    <p className="text-sm text-gray-400">Inspect chunks, embeddings, and metadata</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeView === 'logs' && (
              <DocumentProcessingLogs 
                documents={documents}
                isVisible={true}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RAG Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  Real RAG Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Documents:</span>
                  <Badge variant="secondary">{readyDocuments.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Chunks:</span>
                  <Badge variant="secondary">
                    {readyDocuments.reduce((sum, doc) => sum + (doc.chunks || 0), 0)}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Selected:</span>
                  <Badge variant="secondary">{selectedDocuments.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Model:</span>
                  <Badge variant="outline">{selectedModel}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Processing Logs */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm">Processing Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    {backendStatus === 'connected' ? (
                      <>
                        <CheckCircle size={12} className="text-green-400" />
                        <span className="text-green-400">Backend Connected</span>
                      </>
                    ) : backendStatus === 'error' ? (
                      <>
                        <AlertCircle size={12} className="text-red-400" />
                        <span className="text-red-400">Backend Offline</span>
                      </>
                    ) : (
                      <>
                        <Loader2 size={12} className="text-blue-400 animate-spin" />
                        <span className="text-blue-400">Checking...</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Real-time processing events appear in the Processing Logs tab
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};