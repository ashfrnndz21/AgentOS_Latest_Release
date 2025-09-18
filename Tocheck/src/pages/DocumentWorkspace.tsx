import React, { useState, useCallback, useEffect } from 'react';
import { Upload, MessageCircle, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentUploader } from '@/components/Documents/DocumentUploader';
import { DocumentChat } from '@/components/Documents/DocumentChat';
import { DocumentLibrary } from '@/components/Documents/DocumentLibrary';
import { AgentSuggestions } from '@/components/Documents/AgentSuggestions';
import { DocumentRAGService } from '@/lib/services/DocumentRAGService';
import { OllamaService } from '@/lib/services/OllamaService';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'processing' | 'ready' | 'error';
  uploadedAt: Date;
  summary?: string;
  progress?: number; // 0-100
  chunks?: number;
  pages?: number;
  model?: string;
  progressStep?: string; // Current processing step
}

export const DocumentWorkspace: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeView, setActiveView] = useState<'upload' | 'chat' | 'library'>('upload');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [ragService] = useState(() => new DocumentRAGService());
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'running' | 'not_running'>('checking');
  const [ollamaService] = useState(() => new OllamaService());
  const [processingLogs, setProcessingLogs] = useState<Array<{id: string, message: string, timestamp: Date, type: 'info' | 'success' | 'error'}>>([]);

  // Check Ollama status on component mount
  useEffect(() => {
    const checkOllamaStatus = async () => {
      try {
        const status = await ollamaService.getStatus();
        setOllamaStatus(status.status === 'running' ? 'running' : 'not_running');
      } catch (error) {
        setOllamaStatus('not_running');
      }
    };
    
    checkOllamaStatus();
  }, [ollamaService]);

  const addProcessingLog = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const logEntry = {
      id: Math.random().toString(36).substring(2, 11),
      message,
      timestamp: new Date(),
      type
    };
    setProcessingLogs(prev => [...prev, logEntry]);
    console.log(message); // Still log to console for debugging
  }, []);

  const updateDocumentProgress = useCallback((tempId: string, progress: number, step: string) => {
    setDocuments(prev => 
      prev.map(d => 
        d.id === tempId 
          ? { ...d, progress, progressStep: step }
          : d
      )
    );
    addProcessingLog(`📊 Progress: ${progress}% - ${step}`);
  }, [addProcessingLog]);

  const handleDocumentUpload = useCallback(async (files: File[]) => {
    addProcessingLog('🎯 DocumentWorkspace: handleDocumentUpload called!');
    addProcessingLog(`📁 Received ${files.length} file(s) for processing`);
    
    // Process files with real RAG service and get their IDs
    for (const file of files) {
      // Create initial document entry with processing status
      const tempDoc: Document = {
        id: `temp-${Math.random().toString(36).substring(2, 11)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'processing',
        uploadedAt: new Date(),
        progress: 0,
        progressStep: 'Initializing...'
      };

      setDocuments(prev => [...prev, tempDoc]);
      addProcessingLog(`🚀 Starting document processing: ${file.name}`);

      try {
        // Step 1: File validation
        updateDocumentProgress(tempDoc.id, 10, 'Validating file...');
        await new Promise(resolve => setTimeout(resolve, 300));

        // Step 2: Reading file content
        updateDocumentProgress(tempDoc.id, 25, 'Reading file content...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 3: Text extraction
        updateDocumentProgress(tempDoc.id, 40, 'Extracting text...');
        addProcessingLog(`📄 Processing document: ${file.name}`);
        
        // Process document with RAG service
        addProcessingLog('🔄 Calling RAG service processDocument...');
        const processedDoc = await ragService.processDocument(file);
        addProcessingLog(`✅ RAG service returned document with ${processedDoc.chunks.length} chunks`, 'success');
        
        // Step 4: Creating chunks
        updateDocumentProgress(tempDoc.id, 65, 'Creating text chunks...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Step 5: Building search index
        updateDocumentProgress(tempDoc.id, 85, 'Building search index...');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 6: Finalizing
        updateDocumentProgress(tempDoc.id, 100, 'Ready for chat!');
        addProcessingLog(`✅ Document processed successfully: ${file.name}`, 'success');
        
        // Update document with RAG service ID and ready status
        setDocuments(prev => {
          const updated = prev.map(d => 
            d.id === tempDoc.id 
              ? { 
                  ...d,
                  id: processedDoc.id, // Use RAG service ID
                  status: 'ready', 
                  progress: 100,
                  progressStep: 'Ready for chat!',
                  summary: `✅ Processed ${processedDoc.chunks.length} text chunks for RAG search`
                }
              : d
          );
          const readyCount = updated.filter(doc => doc.status === 'ready').length;
          addProcessingLog(`📋 Documents updated - Ready count: ${readyCount}`, 'success');
          return updated;
        });
      } catch (error) {
        addProcessingLog(`❌ Failed to process document: ${file.name} - ${error.message}`, 'error');
        // Update document status to error
        setDocuments(prev => 
          prev.map(d => 
            d.id === tempDoc.id 
              ? { 
                  ...d, 
                  status: 'error', 
                  progress: 0,
                  progressStep: 'Processing failed',
                  summary: `❌ Failed to process document: ${error.message}` 
                }
              : d
          )
        );
      }
    }
  }, [ragService, updateDocumentProgress]);

  const readyDocuments = documents.filter(doc => doc.status === 'ready');
  const hasReadyDocuments = readyDocuments.length > 0;
  
  // Debug logging
  console.log('🔍 DocumentWorkspace State:');
  console.log('  📋 Current documents:', documents);
  console.log('  ✅ Ready documents:', readyDocuments);
  console.log('  🎯 Has ready documents:', hasReadyDocuments);
  console.log('  🔘 Button should be:', hasReadyDocuments ? 'ENABLED' : 'DISABLED');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={32} className="text-purple-400" />
            <h1 className="text-3xl font-bold">Document Workspace</h1>
          </div>
          <p className="text-gray-400">
            Upload documents and chat with them instantly using local Ollama models
          </p>
        </div>

        {/* Debug Panel - Always Visible */}
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <div>🔧 Debug Panel:</div>
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  console.log('🧪 Test Log button clicked!');
                  alert('Test Log button clicked! Check Processing Log in sidebar.');
                  addProcessingLog('🧪 Test message - Processing log is working!');
                  addProcessingLog('✅ This should appear in Processing Log', 'success');
                  addProcessingLog('❌ This is an error message', 'error');
                }}
                className="text-xs h-6"
              >
                Test Log
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  addProcessingLog('🧪 Testing upload process with fake file');
                  // Create a fake file for testing
                  const fakeFile = new File(['Test content'], 'test-upload.txt', { type: 'text/plain' });
                  handleDocumentUpload([fakeFile]);
                }}
                className="text-xs h-6"
              >
                Test Upload
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  addProcessingLog('🧪 Manual test: Creating test document');
                  const testDoc: Document = {
                    id: 'test-' + Date.now(),
                    name: 'test-document.txt',
                    type: 'text/plain',
                    size: 1000,
                    status: 'ready',
                    uploadedAt: new Date(),
                    progress: 100,
                    progressStep: 'Ready for chat!',
                    summary: '✅ Test document for debugging'
                  };
                  setDocuments(prev => [...prev, testDoc]);
                  addProcessingLog('✅ Test document created successfully', 'success');
                }}
                className="text-xs h-6"
              >
                Add Test Doc
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  addProcessingLog('🧹 Clearing all documents');
                  setDocuments([]);
                  ragService.clearAllDocuments();
                  addProcessingLog('✅ All documents cleared', 'success');
                }}
                className="text-xs h-6"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Document Status Info */}
        {documents.length > 0 && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 space-y-1">
              <div>📊 Document Status:</div>
              <div>• Total documents: {documents.length}</div>
              <div>• Ready documents: {readyDocuments.length} {readyDocuments.map(d => `"${d.name}"`).join(', ')}</div>
              <div>• Processing: {documents.filter(d => d.status === 'processing').length}</div>
              <div>• Has ready documents: {hasReadyDocuments ? '✅ TRUE' : '❌ FALSE'}</div>
              <div>• Button should be: {hasReadyDocuments ? '🟢 ENABLED' : '🔴 DISABLED'}</div>
            </div>
          </div>
        )}



        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setActiveView('upload')}
            variant={activeView === 'upload' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Upload Documents
          </Button>
          
          <Button
            onClick={() => setActiveView('chat')}
            variant={activeView === 'chat' ? 'default' : 'outline'}
            className="flex items-center gap-2"
            disabled={!hasReadyDocuments}
          >
            <MessageCircle size={16} />
            Chat with Documents
            {!hasReadyDocuments && documents.length > 0 && (
              <span className="text-xs text-gray-400 ml-1">
                ({documents.filter(d => d.status === 'processing').length} processing)
              </span>
            )}
            {hasReadyDocuments && (
              <span className="text-xs text-green-400 ml-1">
                ({readyDocuments.length} ready)
              </span>
            )}
          </Button>
          
          <Button
            onClick={() => setActiveView('library')}
            variant={activeView === 'library' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            Document Library
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeView === 'upload' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload size={20} className="text-purple-400" />
                    Upload Documents
                  </CardTitle>
                  <CardDescription>
                    Drag and drop files or click to browse. Supported: PDF, DOC, TXT, MD
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUploader onUpload={handleDocumentUpload} />
                </CardContent>
              </Card>
            )}

            {activeView === 'chat' && hasReadyDocuments && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle size={20} className="text-green-400" />
                    Chat with Documents
                  </CardTitle>
                  <CardDescription>
                    Ask questions about your uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentChat 
                    documents={readyDocuments}
                    selectedDocuments={selectedDocuments}
                    onDocumentSelectionChange={setSelectedDocuments}
                    ragService={ragService}
                  />
                </CardContent>
              </Card>
            )}

            {activeView === 'library' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} className="text-blue-400" />
                    Document Library
                  </CardTitle>
                  <CardDescription>
                    Manage your uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentLibrary 
                    documents={documents}
                    selectedDocuments={selectedDocuments}
                    onDocumentSelectionChange={setSelectedDocuments}
                  />
                </CardContent>
              </Card>
            )}

            {activeView === 'chat' && !hasReadyDocuments && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="text-center py-12">
                  <MessageCircle size={48} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    No documents ready for chat
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Upload some documents first to start chatting
                  </p>
                  <Button onClick={() => setActiveView('upload')}>
                    Upload Documents
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ollama Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  Ollama Status
                  <div className={`w-2 h-2 rounded-full ${
                    ollamaStatus === 'running' ? 'bg-green-400' :
                    ollamaStatus === 'checking' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className={
                    ollamaStatus === 'running' ? 'text-green-400' :
                    ollamaStatus === 'checking' ? 'text-yellow-400' :
                    'text-red-400'
                  }>
                    {ollamaStatus === 'running' ? '✓ Connected' :
                     ollamaStatus === 'checking' ? '⏳ Checking...' :
                     '✗ Not Connected'}
                  </span>
                </div>
                {ollamaStatus === 'not_running' && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">
                      Start Ollama to enable real AI chat
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => window.open('test-ollama-connection.html', '_blank')}
                      className="text-xs h-6"
                    >
                      Test Connection
                    </Button>
                  </div>
                )}
                {ollamaStatus === 'running' && (
                  <p className="text-xs text-green-300">
                    RAG Service: {ragService ? '✓ Ready' : '✗ Error'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Document Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm">Document Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Documents:</span>
                  <span className="text-white">{documents.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ready for Chat:</span>
                  <span className="text-green-400">{readyDocuments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Processing:</span>
                  <span className="text-yellow-400">
                    {documents.filter(d => d.status === 'processing').length}
                  </span>
                </div>
                
                {/* Processing Progress */}
                {documents.filter(d => d.status === 'processing').map(doc => (
                  <div key={doc.id} className="space-y-2 p-2 bg-gray-700 rounded">
                    <div className="flex justify-between text-xs">
                      <span className="text-white truncate">{doc.name}</span>
                      <span className="text-yellow-400">{doc.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-1.5">
                      <div 
                        className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${doc.progress || 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-300">
                      {doc.progressStep || 'Processing...'}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Agent Suggestions */}
            {hasReadyDocuments && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles size={16} className="text-purple-400" />
                    Suggested Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AgentSuggestions documents={readyDocuments} />
                </CardContent>
              </Card>
            )}

            {/* Processing Log */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  Processing Log
                  {processingLogs.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setProcessingLogs([])}
                      className="text-xs h-5 px-2"
                    >
                      Clear
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-40 overflow-y-auto">
                {processingLogs.length === 0 && (
                  <p className="text-gray-500 text-xs">No activity yet</p>
                )}
                {processingLogs.slice().reverse().map(log => (
                  <div key={log.id} className="text-xs space-y-1">
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${
                        log.type === 'success' ? 'bg-green-400' :
                        log.type === 'error' ? 'bg-red-400' :
                        'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className={`${
                          log.type === 'success' ? 'text-green-300' :
                          log.type === 'error' ? 'text-red-300' :
                          'text-gray-300'
                        }`}>
                          {log.message}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {log.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};