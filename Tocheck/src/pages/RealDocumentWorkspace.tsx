import React, { useState, useCallback, useEffect } from 'react';
import { Upload, MessageCircle, FileText, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DocumentUploader } from '@/components/Documents/DocumentUploader';
import { DocumentChat } from '@/components/Documents/DocumentChat';
import { DocumentLibrary } from '@/components/Documents/DocumentLibrary';
import { RealDocumentRAGService, RealDocumentContent, RAGStatus } from '@/lib/services/DocumentRAGService';
import { OllamaService } from '@/lib/services/OllamaService';
import { RAGDebugPanel } from '@/components/Documents/RAGDebugPanel';
import { DocumentMetadataPanel } from '@/components/Documents/DocumentMetadataPanel';
import { DocumentProcessingLogs } from '@/components/Documents/DocumentProcessingLogs';

interface ProcessingDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'processing' | 'ready' | 'error';
  uploadedAt: Date;
  chunks?: number;
  pages?: number;
  model?: string;
  error?: string;
}

export const RealDocumentWorkspace: React.FC = () => {
  const [documents, setDocuments] = useState<ProcessingDocument[]>([]);
  const [activeView, setActiveView] = useState<'upload' | 'chat' | 'library' | 'debug' | 'metadata' | 'logs'>('upload');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [ragService] = useState(() => {
    try {
      const service = new RealDocumentRAGService();
      console.log('✅ RealDocumentRAGService initialized successfully', service);
      return service;
    } catch (error) {
      console.error('❌ Failed to initialize RealDocumentRAGService:', error);
      return null;
    }
  });
  const [ollamaService] = useState(() => new OllamaService());
  const [ragStatus, setRagStatus] = useState<RAGStatus | null>(null);
  const [isCheckingRAG, setIsCheckingRAG] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('mistral');
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [processingLogs, setProcessingLogs] = useState<Array<{
    id: string;
    message: string;
    timestamp: Date;
    type: 'info' | 'success' | 'error';
  }>>([]);

  // INSTANT LOADING - No blocking operations during mount
  useEffect(() => {
    // Set UI to ready state IMMEDIATELY - no waiting
    setIsCheckingRAG(false);
    setDocuments([]);
    setSelectedDocuments([]);
    setAvailableModels(['mistral', 'llama2', 'codellama']); // Default models
    
    addProcessingLog('⚡ UI loaded instantly - initializing services in background...', 'success');
    
    // Check if ragService was initialized properly
    if (!ragService) {
      addProcessingLog('❌ RAG service failed to initialize - check console for errors', 'error');
      setRagStatus({
        status: 'error',
        error: 'Service initialization failed',
        message: 'RAG service could not be initialized - check browser console'
      });
      return;
    }
    
    // All service checks happen in background without blocking UI
    setTimeout(() => {
      // Quick ping to backend (fire and forget)
      fetch('http://localhost:5002/api/rag/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 seconds max
      })
      .then(response => response.json())
      .then(status => {
        setRagStatus(status);
        if (status.status === 'available') {
          addProcessingLog('✅ RAG service connected successfully', 'success');
          
          // Load real models in background
          if (ragService && ragService.getAvailableModels) {
            ragService.getAvailableModels()
              .then(models => setAvailableModels(models))
              .catch(() => {}); // Silent fail
          }
            
          // Clear documents in background
          if (ragService && ragService.clearAllDocuments) {
            ragService.clearAllDocuments()
              .then(result => {
                if (result && result.success) {
                  addProcessingLog(`🧹 Cleared ${result.cleared_count} previous documents`, 'info');
                }
              })
              .catch(() => {}); // Silent fail
          }
        } else {
          addProcessingLog('⚠️ RAG service not fully available - limited functionality', 'error');
        }
      })
      .catch((error) => {
        // Backend not available - set offline mode with detailed error
        console.error('Backend connection error:', error);
        setRagStatus({
          status: 'error',
          error: error.message || 'Backend offline',
          message: 'Backend is not responding - interface works in offline mode'
        });
        addProcessingLog(`📴 Backend connection failed: ${error.message || 'Unknown error'}`, 'error');
        addProcessingLog('💡 Check if backend is running: python3 backend/simple_api.py', 'error');
      });
    }, 1000); // 1 second delay to let backend fully start
    
    // No cleanup needed - everything is fire-and-forget
  }, []);

  const addProcessingLog = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const logEntry = {
      id: Math.random().toString(36).substring(2, 11),
      message,
      timestamp: new Date(),
      type
    };
    
    setProcessingLogs(prev => [...prev, logEntry].slice(-20)); // Keep last 20 logs
    console.log(`[${type.toUpperCase()}] ${message}`);
  }, []);

  const handleDocumentUpload = useCallback(async (files: File[]) => {
    if (!ragStatus || ragStatus.status !== 'available') {
      addProcessingLog('❌ RAG service not available. Cannot process documents.', 'error');
      return;
    }

    addProcessingLog(`🚀 Starting real RAG processing for ${files.length} files`, 'info');

    for (const file of files) {
      const documentId = Math.random().toString(36).substring(2, 11);
      
      // Add document with processing status
      const processingDoc: ProcessingDocument = {
        id: documentId,
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'processing',
        uploadedAt: new Date(),
        model: selectedModel
      };
      
      setDocuments(prev => [...prev, processingDoc]);
      addProcessingLog(`📄 Processing ${file.name} with ${selectedModel}...`, 'info');

      try {
        // Process with real RAG service
        const result = await ragService.processDocument(file, selectedModel);
        
        // Update document status
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? {
                ...doc,
                id: result.document_id, // Use real document ID from backend
                status: 'ready' as const,
                chunks: result.chunks_created,
                pages: result.pages_processed,
                model: result.model_name
              }
            : doc
        ));
        
        // Auto-select the newly processed document
        setSelectedDocuments(prev => [...prev, result.document_id]);
        
        addProcessingLog(
          `✅ ${file.name} processed: ${result.chunks_created} chunks, ${result.pages_processed} pages`, 
          'success'
        );
        addProcessingLog(`🎯 Auto-selected ${file.name} for chat`, 'info');
        
        // Verify document was actually ingested by checking RAG status
        try {
          const ragStatus = await ragService.checkRAGStatus();
          if (ragStatus.stats?.total_documents === 0) {
            addProcessingLog(`⚠️ Warning: Document appears processed but RAG system shows 0 documents. There may be a backend issue.`, 'error');
          } else {
            addProcessingLog(`✅ Verified: RAG system now has ${ragStatus.stats.total_documents} document(s)`, 'success');
          }
        } catch (verifyError) {
          addProcessingLog(`⚠️ Could not verify RAG ingest status: ${verifyError}`, 'error');
        }
        
      } catch (error) {
        // Enhanced error handling with more details
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Update document with error status
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? {
                ...doc,
                status: 'error' as const,
                error: errorMessage
              }
            : doc
        ));
        
        // Detailed error logging
        addProcessingLog(`❌ Failed to process ${file.name}`, 'error');
        addProcessingLog(`Error details: ${errorMessage}`, 'error');
        
        // Common error suggestions
        if (errorMessage.includes('PDF loading failed')) {
          addProcessingLog(`💡 Suggestion: Try a different PDF file. The current file may be corrupted, password-protected, or in an unsupported format.`, 'error');
        } else if (errorMessage.includes('model') && errorMessage.includes('not available')) {
          addProcessingLog(`💡 Suggestion: The selected model '${selectedModel}' is not available in Ollama. Try downloading it first: ollama pull ${selectedModel}`, 'error');
        } else if (errorMessage.includes('HTTP')) {
          addProcessingLog(`💡 Suggestion: Backend connection issue. Check if the backend is running on http://localhost:5002`, 'error');
        } else if (errorMessage.includes('memory') || errorMessage.includes('resource')) {
          addProcessingLog(`💡 Suggestion: Insufficient system resources. Try with a smaller PDF file or restart the backend.`, 'error');
        }
      }
    }
  }, [ragService, selectedModel, ragStatus, addProcessingLog]);

  const handleDocumentSelect = useCallback((documentIds: string[]) => {
    setSelectedDocuments(documentIds);
  }, []);

  const handleChatQuery = useCallback(async (query: string) => {
    if (selectedDocuments.length === 0) {
      addProcessingLog('❌ No documents selected for chat', 'error');
      return {
        response: 'Please select documents to chat with first.',
        sources: [],
        success: false
      };
    }

    addProcessingLog(`🔍 Querying ${selectedDocuments.length} documents with real RAG...`, 'info');

    try {
      const result = await ragService.queryDocuments({
        query,
        document_ids: selectedDocuments,
        model_name: selectedModel
      });

      if (result.status === 'success') {
        addProcessingLog(
          `✅ RAG query completed: ${result.chunks_retrieved} chunks retrieved`, 
          'success'
        );
        
        return {
          response: result.response || 'No response generated',
          sources: result.sources || [],
          relevantChunks: result.relevant_chunks || [],
          success: true
        };
      } else {
        addProcessingLog(`❌ RAG query failed: ${result.error}`, 'error');
        return {
          response: result.message || 'Query failed',
          sources: [],
          success: false
        };
      }
    } catch (error) {
      addProcessingLog(`❌ Chat query error: ${error}`, 'error');
      return {
        response: `Error: ${error}`,
        sources: [],
        success: false
      };
    }
  }, [selectedDocuments, selectedModel, ragService, addProcessingLog]);

  const readyDocuments = documents.filter(doc => doc.status === 'ready');
  const isChatEnabled = readyDocuments.length > 0 && selectedDocuments.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="text-purple-400" />
            Agentic RAG
          </h1>
          <p className="text-gray-400">
            Intelligent document processing with AI agents and RAG pipeline
          </p>
        </div>

        {/* RAG Status */}
        {isCheckingRAG ? (
          <Alert className="mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Checking RAG service status...
              <div className="mt-2 text-xs text-gray-500">
                If this takes too long, try refreshing the page or check if the backend is running.
              </div>
            </AlertDescription>
          </Alert>
        ) : initializationError ? (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription>
              <div className="space-y-2">
                <div>Failed to initialize RAG service: {initializationError}</div>
                <div className="text-sm">
                  <strong>Troubleshooting:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check if the Python backend is running on port 5002</li>
                    <li>Verify Ollama is running on port 11434</li>
                    <li>Try refreshing the page</li>
                    <li>Check browser console for more details</li>
                  </ul>
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Retry
                </button>
              </div>
            </AlertDescription>
          </Alert>
        ) : ragStatus ? (
          <Alert className={`mb-6 ${
            ragStatus.status === 'available' 
              ? 'border-green-500 bg-green-500/10' 
              : 'border-red-500 bg-red-500/10'
          }`}>
            {ragStatus.status === 'available' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription>
              {ragStatus.message}
              {ragStatus.status === 'error' && (
                <div className="mt-3 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    🔄 Retry Connection
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText('python3 backend/simple_api.py');
                      alert('Command copied to clipboard!');
                    }}
                    className="border-gray-600 text-gray-400 hover:bg-gray-700"
                  >
                    📋 Copy Start Command
                  </Button>
                </div>
              )}
              {ragStatus.status === 'unavailable' && ragStatus.required_packages && (
                <div className="mt-2">
                  <strong>Install required packages:</strong>
                  <code className="block mt-1 p-2 bg-gray-800 rounded text-sm">
                    pip install {ragStatus.required_packages.join(' ')}
                  </code>
                </div>
              )}
            </AlertDescription>
          </Alert>
        ) : null}

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
            Chat ({selectedDocuments.length} selected)
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
        {availableModels.length > 0 && (
          <Card className="mb-6 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm">Ollama Model Selection</CardTitle>
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
              <p className="text-xs text-gray-400 mt-2">
                Selected: <strong>{selectedModel}</strong>
              </p>
            </CardContent>
          </Card>
        )}

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
                  <DocumentUploader
                    onUpload={handleDocumentUpload}
                    acceptedTypes={['.pdf']}
                    maxFiles={5}
                  />
                </CardContent>
              </Card>
            )}

            {activeView === 'chat' && (
              <DocumentChat
                onQuery={handleChatQuery}
                selectedDocuments={selectedDocuments}
                isEnabled={isChatEnabled}
                model={selectedModel}
              />
            )}

            {activeView === 'library' && (
              <DocumentLibrary
                documents={documents.map(doc => ({
                  id: doc.id,
                  name: doc.name,
                  type: doc.type,
                  size: doc.size,
                  status: doc.status,
                  uploadedAt: doc.uploadedAt,
                  summary: doc.chunks ? `${doc.chunks} chunks, ${doc.pages} pages` : undefined,
                  progress: doc.status === 'processing' ? 50 : doc.status === 'ready' ? 100 : 0
                }))}
                selectedDocuments={selectedDocuments}
                onDocumentSelect={handleDocumentSelect}
              />
            )}

            {activeView === 'debug' && (
              <RAGDebugPanel ragService={ragService} />
            )}

            {activeView === 'metadata' && (
              <DocumentMetadataPanel />
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
            {/* Processing Status */}
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
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {processingLogs.slice(-10).map(log => (
                    <div
                      key={log.id}
                      className={`text-xs p-2 rounded ${
                        log.type === 'success' 
                          ? 'bg-green-500/10 text-green-400' 
                          : log.type === 'error'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      <div className="font-mono">{log.message}</div>
                      <div className="text-gray-500 mt-1">
                        {log.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  {processingLogs.length === 0 && (
                    <div className="text-xs text-gray-500 text-center py-4">
                      No processing logs yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};