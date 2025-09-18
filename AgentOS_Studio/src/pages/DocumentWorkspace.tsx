import { useState, useCallback, useEffect } from 'react';
import { Upload, MessageCircle, FileText, Sparkles, AlertCircle, CheckCircle, Loader2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { DocumentUploader } from '@/components/Documents/DocumentUploader';
import { DocumentChat } from '@/components/Documents/DocumentChat';
import { DocumentLibrary } from '@/components/Documents/DocumentLibrary';
import { BackendControl } from '@/components/BackendControl';
import { realDocumentRAGService, ProcessingResult, DocumentInfo, RAGStatus } from '@/lib/services/documentRAGService';

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
  progress?: number;
  // Real RAG metrics
  chunks_created?: number;
  pages_processed?: number;
  processing_time_ms?: number;
  content_preview?: string;
  model_used?: string;
}

export default function DocumentWorkspace() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'upload' | 'chat' | 'library' | 'logs'>('upload');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [ragStatus, setRagStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2');
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [ragStats, setRagStats] = useState<any>(null);
  const [processingLogs, setProcessingLogs] = useState<Array<{
    id: string;
    message: string;
    timestamp: Date;
    type: 'info' | 'success' | 'error';
  }>>([]);

  // INSTANT LOADING - Real RAG service initialization
  useEffect(() => {
    const initializeServices = async () => {
      // Set UI to ready state IMMEDIATELY - no blocking operations
      setIsLoadingModels(false);
      addProcessingLog('⚡ Real RAG workspace loaded instantly - initializing services...', 'success');
      
      // Check Ollama backend status
      try {
        const response = await fetch('/health');
        if (response.ok) {
          setBackendStatus('available');
          addProcessingLog('✅ Ollama backend connection established', 'success');
        } else {
          setBackendStatus('unavailable');
          addProcessingLog('❌ Ollama backend responded with error', 'error');
        }
      } catch (error) {
        setBackendStatus('unavailable');
        addProcessingLog('❌ Cannot connect to Ollama backend', 'error');
        addProcessingLog('💡 Make sure the Ollama backend server is running on port 5002', 'error');
      }

      // Check Real RAG service status
      try {
        const ragStatusResponse: RAGStatus = await realDocumentRAGService.checkRAGStatus();
        if (ragStatusResponse.status === 'running') {
          setRagStatus('available');
          setRagStats(ragStatusResponse.stats);
          addProcessingLog('✅ Real RAG service connection established', 'success');
          addProcessingLog(`📊 RAG Stats: ${ragStatusResponse.stats?.total_documents || 0} docs, ${ragStatusResponse.stats?.total_chunks || 0} chunks`, 'info');
          
          // Load existing documents from RAG system
          try {
            const existingDocs: DocumentInfo[] = await realDocumentRAGService.getDocuments();
            const convertedDocs: Document[] = existingDocs.map(doc => ({
              id: doc.id,
              name: doc.filename,
              type: doc.file_type,
              size: doc.file_size,
              status: doc.processing_status === 'completed' ? 'ready' : 
                      doc.processing_status === 'error' ? 'error' : 'processing',
              uploadedAt: new Date(doc.upload_time),
              chunks_created: doc.chunks_created,
              pages_processed: doc.pages_processed,
              processing_time_ms: doc.processing_time_ms,
              error: doc.error_message,
              content_preview: doc.content_preview,
              model_used: doc.model_used
            }));
            setDocuments(convertedDocs);
            if (existingDocs.length > 0) {
              addProcessingLog(`📚 Loaded ${existingDocs.length} existing documents from RAG system`, 'info');
            }
          } catch (error) {
            addProcessingLog('⚠️ Could not load existing documents from RAG system', 'error');
          }
        } else {
          setRagStatus('unavailable');
          addProcessingLog('❌ Real RAG service not available', 'error');
          addProcessingLog('💡 Make sure the RAG backend server is running on port 5003', 'error');
        }
      } catch (error) {
        setRagStatus('unavailable');
        addProcessingLog('❌ Cannot connect to Real RAG service', 'error');
        addProcessingLog('💡 Start RAG service: python backend/rag_api.py', 'error');
      }

      // Load available Ollama models in background
      try {
        const response = await fetch('/api/ollama/models');
        if (response.ok) {
          const data = await response.json();
          const modelNames = data?.map((model: any) => model.name) || [];
          setAvailableModels(modelNames);
          
          // Set default model if not already set
          if (modelNames.length > 0 && !modelNames.includes(selectedModel)) {
            const defaultModel = modelNames.find((name: string) => name.includes('llama3.2')) || 
                               modelNames.find((name: string) => name.includes('mistral')) || 
                               modelNames[0];
            setSelectedModel(defaultModel);
          }
          
          addProcessingLog(`📋 Loaded ${modelNames.length} Ollama models`, 'success');
        } else {
          addProcessingLog('⚠️ Could not load Ollama models', 'error');
          // Fallback to common models
          setAvailableModels(['llama3.2', 'llama3.2:1b', 'mistral', 'phi3', 'codellama']);
        }
      } catch (error) {
        addProcessingLog('⚠️ Failed to connect to Ollama service', 'error');
        // Fallback to common models
        setAvailableModels(['llama3.2', 'llama3.2:1b', 'mistral', 'phi3', 'codellama']);
      }
    };
    
    initializeServices();
  }, [selectedModel]);

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
    console.log('🚀 handleDocumentUpload called with:', files.length, 'files');
    console.log('📊 Current ragStatus:', ragStatus);
    
    if (ragStatus !== 'available') {
      console.log('❌ RAG service not available, ragStatus:', ragStatus);
      addProcessingLog('❌ Real RAG service not available. Cannot process documents.', 'error');
      addProcessingLog('💡 Start RAG service: python backend/rag_api.py', 'error');
      return;
    }

    console.log('✅ RAG service available, proceeding with upload');
    addProcessingLog(`🚀 Starting REAL RAG processing for ${files.length} files`, 'info');

    for (const file of files) {
      // Add document with processing status (temporary ID)
      const tempId = Math.random().toString(36).substring(2, 11);
      const processingDoc: Document = {
        id: tempId,
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'processing',
        uploadedAt: new Date(),
        progress: 0,
        model_used: selectedModel
      };
      
      setDocuments(prev => [...prev, processingDoc]);
      addProcessingLog(`📄 Processing ${file.name} with REAL RAG service using ${selectedModel}...`, 'info');

      try {
        // Step 1: File validation with real service
        setDocuments(prev => prev.map(doc => 
          doc.id === tempId ? { ...doc, progress: 20 } : doc
        ));
        addProcessingLog(`✅ File validation passed for ${file.name}`, 'info');

        // Step 2: Process with REAL RAG service
        setDocuments(prev => prev.map(doc => 
          doc.id === tempId ? { ...doc, progress: 40 } : doc
        ));
        addProcessingLog(`🔄 Uploading to REAL RAG service with model: ${selectedModel}`, 'info');
        
        console.log('🔍 About to call processDocument with:', { fileName: file.name, model: selectedModel });
        const result: ProcessingResult = await realDocumentRAGService.processDocument(file, selectedModel);
        console.log('✅ processDocument result:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'Real RAG processing failed');
        }

        // Step 3: Verify real ingestion
        setDocuments(prev => prev.map(doc => 
          doc.id === tempId ? { ...doc, progress: 80 } : doc
        ));
        addProcessingLog(`🔍 Verifying document ingestion in RAG system...`, 'info');
        
        const verification = await realDocumentRAGService.verifyDocumentIngestion(result.document_id);
        if (!verification.success) {
          throw new Error(verification.error || 'RAG verification failed');
        }

        // Step 4: Complete - Update with REAL document data
        setDocuments(prev => prev.map(doc => 
          doc.id === tempId 
            ? { 
                id: result.document_id, // Use REAL ID from backend
                name: result.filename,
                type: file.type,
                size: result.file_size,
                status: 'ready' as const,
                uploadedAt: new Date(),
                progress: 100,
                chunks_created: result.chunks_created,
                pages_processed: result.pages_processed,
                processing_time_ms: result.processing_time_ms,
                content_preview: result.content_preview,
                model_used: selectedModel
              }
            : doc
        ));

        // Auto-select the newly processed document
        setSelectedDocuments(prev => [...prev, result.document_id]);

        // Log REAL processing metrics
        addProcessingLog(`✅ ${result.filename} processed: ${result.chunks_created} chunks, ${result.pages_processed} pages`, 'success');
        addProcessingLog(`⏱️ Real processing time: ${result.processing_time_ms}ms`, 'info');
        addProcessingLog(`✅ Verified: Document ingested into REAL RAG system`, 'success');
        addProcessingLog(`🎯 Auto-selected ${result.filename} for chat`, 'info');

        // Update RAG stats with real data
        try {
          const updatedRagStatus: RAGStatus = await realDocumentRAGService.checkRAGStatus();
          setRagStats(updatedRagStatus.stats);
          addProcessingLog(`📈 RAG system now has ${updatedRagStatus.stats?.total_documents || 0} document(s)`, 'info');
        } catch (error) {
          addProcessingLog('⚠️ Could not update RAG stats', 'error');
        }
        
      } catch (error) {
        console.error('🚨 Document processing error:', error);
        
        // Update document with error status
        setDocuments(prev => prev.map(doc => 
          doc.id === tempId 
            ? { 
                ...doc, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Unknown error',
                progress: 0
              }
            : doc
        ));
        
        // Enhanced error logging with specific suggestions
        addProcessingLog(`❌ Failed to process ${file.name}`, 'error');
        addProcessingLog(`Error details: ${error}`, 'error');
        
        // Provide specific troubleshooting suggestions
        if (error instanceof Error) {
          if (error.message.includes('HTTP 500')) {
            addProcessingLog('💡 Suggestion: Check if RAG backend is running on port 5003', 'error');
          } else if (error.message.includes('timeout')) {
            addProcessingLog('💡 Suggestion: Large files may take longer to process', 'error');
          } else if (error.message.includes('Unsupported file type')) {
            addProcessingLog('💡 Suggestion: Try uploading PDF, TXT, or MD files', 'error');
          } else if (error.message.includes('Ollama')) {
            addProcessingLog('💡 Suggestion: Ensure Ollama is running and the selected model is available', 'error');
          } else if (error.message.includes('model')) {
            addProcessingLog(`💡 Suggestion: Model "${selectedModel}" may not be available. Try: ollama pull ${selectedModel}`, 'error');
          }
        }
      }
    }
  }, [addProcessingLog, ragStatus, selectedModel]);



  // Handle chat query with REAL RAG
  const handleChatQuery = useCallback(async (query: string) => {
    if (ragStatus !== 'available') {
      return {
        response: 'Real RAG service is not available. Please ensure the RAG backend is running on port 5003.',
        sources: [],
        success: false
      };
    }

    const readyDocuments = documents.filter(doc => doc.status === 'ready');
    if (readyDocuments.length === 0) {
      return {
        response: 'Please upload and process some documents first using the Real RAG service.',
        sources: [],
        success: false
      };
    }

    if (selectedDocuments.length === 0) {
      addProcessingLog('❌ No documents selected for chat', 'error');
      return {
        response: 'Please select documents to chat with first.',
        sources: [],
        success: false
      };
    }

    addProcessingLog(`🔍 Querying ${selectedDocuments.length} documents with REAL RAG...`, 'info');

    try {
      // Use REAL RAG service for querying
      const result = await realDocumentRAGService.queryDocuments({
        query,
        document_ids: selectedDocuments,
        model_name: selectedModel,
        max_chunks: 5
      });

      if (!result.success) {
        throw new Error(result.error || 'Real RAG query failed');
      }

      addProcessingLog(`✅ REAL RAG query completed: ${result.chunks_retrieved} chunks retrieved`, 'success');
      addProcessingLog(`📊 Context: ${result.context_length} chars from ${result.sources?.length || 0} sources`, 'info');
      
      return {
        response: result.response || 'No response generated by Real RAG',
        sources: result.sources || [],
        chunks_retrieved: result.chunks_retrieved,
        chunks_available: result.chunks_available,
        context_length: result.context_length,
        success: true
      };
      
    } catch (error) {
      addProcessingLog(`❌ REAL RAG query failed: ${error}`, 'error');
      
      // Provide specific troubleshooting suggestions
      if (error instanceof Error) {
        if (error.message.includes('HTTP 500')) {
          addProcessingLog('💡 Suggestion: Check if RAG backend and Ollama are running', 'error');
        } else if (error.message.includes('timeout')) {
          addProcessingLog('💡 Suggestion: Complex queries may take longer to process', 'error');
        } else if (error.message.includes('model')) {
          addProcessingLog(`💡 Suggestion: Ensure model "${selectedModel}" is available in Ollama`, 'error');
        }
      }
      
      return {
        response: `Error processing query with Real RAG: ${error}`,
        sources: [],
        success: false
      };
    }
  }, [selectedDocuments, documents, ragStatus, selectedModel, addProcessingLog]);

  const handleDocumentDelete = useCallback(async (documentId: string) => {
    try {
      addProcessingLog(`🗑️ Deleting document: ${documentId}`, 'info');
      
      // Call the backend delete API
      const success = await realDocumentRAGService.deleteDocument(documentId);
      
      if (success) {
        // Remove from local state
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        
        // Remove from selected documents if it was selected
        setSelectedDocuments(prev => prev.filter(id => id !== documentId));
        
        // Update RAG stats
        try {
          const updatedRagStatus = await realDocumentRAGService.checkRAGStatus();
          setRagStats(updatedRagStatus.stats);
          addProcessingLog(`✅ Document deleted successfully`, 'success');
          addProcessingLog(`📊 RAG system now has ${updatedRagStatus.stats?.total_documents || 0} document(s)`, 'info');
        } catch (error) {
          addProcessingLog('⚠️ Could not update RAG stats after deletion', 'error');
        }
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      addProcessingLog(`❌ Failed to delete document: ${error}`, 'error');
      throw error;
    }
  }, [addProcessingLog]);

  const readyDocuments = documents.filter(doc => doc.status === 'ready');
  const isChatEnabled = backendStatus === 'available' && ragStatus === 'available' && readyDocuments.length > 0 && selectedDocuments.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="text-purple-400" />
            Real RAG Document Workspace
          </h1>
          <p className="text-gray-400">
            Upload documents and chat with them using REAL RAG processing with LangChain + Ollama
          </p>
        </div>

        {/* Backend Status */}
        {(backendStatus === 'checking' || ragStatus === 'checking') ? (
          <Alert className="mb-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Checking Real RAG service connections...</AlertDescription>
          </Alert>
        ) : (backendStatus === 'unavailable' || ragStatus === 'unavailable') ? (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription>
              <div className="space-y-2">
                {backendStatus === 'unavailable' && <div>❌ Ollama backend (port 5002) not available</div>}
                {ragStatus === 'unavailable' && <div>❌ Real RAG service (port 5003) not available</div>}
                <div className="text-sm">
                  <strong>Required Services:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Ollama backend: <code>python backend/ollama_api.py</code></li>
                    <li>Real RAG service: <code>python backend/rag_api.py</code></li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              ✅ All Real RAG services connected and ready for document processing.
              {ragStats && ` RAG system has ${ragStats.total_documents} documents with ${ragStats.total_chunks} chunks.`}
            </AlertDescription>
          </Alert>
        )}

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
                    disabled={isLoadingModels}
                  >
                    {model}
                    {model.includes('llama3.2') && !model.includes('1b') && ' (Recommended)'}
                    {model.includes('1b') && ' (Fast)'}
                    {model.includes('code') && ' (Code)'}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Selected: <strong>{selectedModel}</strong>
                {isLoadingModels && ' • Loading models...'}
              </p>
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
            variant={activeView === 'logs' ? 'default' : 'outline'}
            onClick={() => setActiveView('logs')}
            className="flex items-center gap-2"
          >
            <Activity size={16} />
            Processing Logs
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Upload View */}
            {activeView === 'upload' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Upload Documents to Real RAG</CardTitle>
                  <CardDescription>
                    Upload PDF, text, or markdown files for REAL RAG processing with LangChain + Ollama
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUploader
                    onUpload={handleDocumentUpload}
                    acceptedTypes={['.pdf', '.txt', '.md']}
                    maxFiles={5}
                  />
                  {ragStatus === 'unavailable' && (
                    <Alert className="mt-4 border-yellow-500 bg-yellow-500/10">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <AlertDescription>
                        Real RAG service is not available. Start it with: <code>python backend/rag_api.py</code>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Chat View */}
            {activeView === 'chat' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Chat with Real RAG</CardTitle>
                  <CardDescription>
                    Ask questions about your documents using REAL RAG processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentChat
                    documents={readyDocuments}
                    selectedDocuments={selectedDocuments}
                    onDocumentSelectionChange={setSelectedDocuments}
                    onQuery={handleChatQuery}
                    isEnabled={isChatEnabled}
                    model={selectedModel}
                  />
                  {!isChatEnabled && (
                    <Alert className="mt-4 border-yellow-500 bg-yellow-500/10">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <AlertDescription>
                        {ragStatus !== 'available' ? 'Real RAG service not available' :
                         readyDocuments.length === 0 ? 'No documents processed yet' :
                         selectedDocuments.length === 0 ? 'Please select documents to chat with' :
                         'Backend services not ready'}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Library View */}
            {activeView === 'library' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Real RAG Document Library</CardTitle>
                  <CardDescription>
                    Manage your documents processed by Real RAG and select which ones to chat with
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentLibrary
                    documents={documents}
                    selectedDocuments={selectedDocuments}
                    onDocumentSelect={setSelectedDocuments}
                    onDocumentDelete={handleDocumentDelete}
                  />
                </CardContent>
              </Card>
            )}

            {/* Processing Logs View */}
            {activeView === 'logs' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Real RAG Processing Logs</CardTitle>
                  <CardDescription>
                    Monitor real-time processing logs from the RAG pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {processingLogs.map(log => (
                      <div
                        key={log.id}
                        className={`text-sm p-3 rounded border-l-4 ${
                          log.type === 'success' 
                            ? 'bg-green-500/10 text-green-400 border-green-500' 
                            : log.type === 'error'
                            ? 'bg-red-500/10 text-red-400 border-red-500'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500'
                        }`}
                      >
                        <div className="font-mono">{log.message}</div>
                        <div className="text-gray-500 mt-1 text-xs">
                          {log.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    {processingLogs.length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-8">
                        No processing logs yet. Upload documents to see real RAG processing logs.
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
            
            {/* Real RAG Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  Real RAG Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ollama Backend:</span>
                  <Badge variant={backendStatus === 'available' ? 'default' : 'destructive'}>
                    {backendStatus === 'available' ? 'Connected' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>RAG Service:</span>
                  <Badge variant={ragStatus === 'available' ? 'default' : 'destructive'}>
                    {ragStatus === 'available' ? 'Connected' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Documents:</span>
                  <Badge variant="secondary">{readyDocuments.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Chunks:</span>
                  <Badge variant="secondary">
                    {readyDocuments.reduce((sum, doc) => sum + (doc.chunks_created || 0), 0)}
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
                <div className="flex justify-between text-sm">
                  <span>Processing:</span>
                  <Badge variant="outline">
                    {documents.filter(d => d.status === 'processing').length}
                  </Badge>
                </div>
                {ragStats && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>RAG Docs:</span>
                      <Badge variant="outline">{ragStats.total_documents || 0}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>RAG Chunks:</span>
                      <Badge variant="outline">{ragStats.total_chunks || 0}</Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Processing Logs */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity size={16} className="text-green-400" />
                  Recent Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {processingLogs.slice(-5).map(log => (
                    <div
                      key={log.id}
                      className={`text-xs p-2 rounded border-l-2 ${
                        log.type === 'success' 
                          ? 'bg-green-500/10 text-green-400 border-green-500' 
                          : log.type === 'error'
                          ? 'bg-red-500/10 text-red-400 border-red-500'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500'
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
                      <div className="mt-1">Upload documents to see real RAG logs</div>
                    </div>
                  )}
                </div>
                {processingLogs.length > 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveView('logs')}
                    className="w-full mt-2 text-xs"
                  >
                    View All Logs ({processingLogs.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}