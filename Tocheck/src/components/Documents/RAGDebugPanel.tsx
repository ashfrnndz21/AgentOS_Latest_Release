import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RealDocumentRAGService } from '../../lib/services/DocumentRAGService';

interface RAGDebugPanelProps {
  ragService: RealDocumentRAGService;
}

interface DebugStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: string;
}

export const RAGDebugPanel: React.FC<RAGDebugPanelProps> = ({ ragService }) => {
  const [steps, setSteps] = useState<DebugStep[]>([
    { id: 'backend', name: 'Backend Connection', status: 'pending', message: 'Not tested' },
    { id: 'rag', name: 'RAG Service Status', status: 'pending', message: 'Not tested' },
    { id: 'ollama', name: 'Ollama Models', status: 'pending', message: 'Not tested' },
    { id: 'documents', name: 'Ingested Documents', status: 'pending', message: 'Not tested' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const updateStep = useCallback((stepId: string, status: DebugStep['status'], message: string, details?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message, details }
        : step
    ));
  }, []);

  const testBackendConnection = useCallback(async () => {
    updateStep('backend', 'running', 'Testing...');
    addLog('🔄 Testing backend connection...');
    
    try {
      const response = await fetch('http://localhost:5002/health');
      const data = await response.json();
      
      if (response.ok) {
        updateStep('backend', 'success', 'Connected', JSON.stringify(data));
        addLog('✅ Backend connection successful');
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      updateStep('backend', 'error', 'Failed', errorMsg);
      addLog(`❌ Backend connection failed: ${errorMsg}`);
      return false;
    }
  }, [updateStep, addLog]);

  const testRAGStatus = useCallback(async () => {
    updateStep('rag', 'running', 'Testing...');
    addLog('🔄 Checking RAG service status...');
    
    try {
      const status = await ragService.checkRAGStatus();
      
      if (status.status === 'available') {
        const details = `Documents: ${status.stats?.total_documents || 0}, Chunks: ${status.stats?.total_chunks || 0}`;
        updateStep('rag', 'success', 'Available', details);
        addLog(`✅ RAG service available: ${details}`);
        return true;
      } else {
        throw new Error(status.message || 'RAG service not available');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      updateStep('rag', 'error', 'Unavailable', errorMsg);
      addLog(`❌ RAG service check failed: ${errorMsg}`);
      return false;
    }
  }, [ragService, updateStep, addLog]);

  const testOllamaModels = useCallback(async () => {
    updateStep('ollama', 'running', 'Testing...');
    addLog('🔄 Checking Ollama models...');
    
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      
      if (response.ok && data.models) {
        const modelNames = data.models.map((m: any) => m.name);
        const details = `Available: ${modelNames.join(', ')}`;
        updateStep('ollama', 'success', `${modelNames.length} models`, details);
        addLog(`✅ Ollama models available: ${modelNames.length}`);
        return true;
      } else {
        throw new Error('No models found or Ollama not responding');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      updateStep('ollama', 'error', 'Failed', errorMsg);
      addLog(`❌ Ollama models check failed: ${errorMsg}`);
      return false;
    }
  }, [updateStep, addLog]);

  const testIngestedDocuments = useCallback(async () => {
    updateStep('documents', 'running', 'Testing...');
    addLog('🔄 Checking ingested documents...');
    
    try {
      const documents = await ragService.listIngestedDocuments();
      const details = documents.map(doc => `${doc.filename} (${doc.chunks_created} chunks)`).join(', ');
      updateStep('documents', 'success', `${documents.length} documents`, details);
      addLog(`✅ Found ${documents.length} ingested documents`);
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      updateStep('documents', 'error', 'Failed', errorMsg);
      addLog(`❌ Document check failed: ${errorMsg}`);
      return false;
    }
  }, [ragService, updateStep, addLog]);

  const runFullDiagnostic = useCallback(async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('🚀 Starting full RAG diagnostic...');
    
    const tests = [
      { name: 'Backend Connection', fn: testBackendConnection },
      { name: 'RAG Status', fn: testRAGStatus },
      { name: 'Ollama Models', fn: testOllamaModels },
      { name: 'Ingested Documents', fn: testIngestedDocuments }
    ];
    
    for (const test of tests) {
      addLog(`Running ${test.name}...`);
      const result = await test.fn();
      if (!result) {
        addLog(`❌ Diagnostic failed at: ${test.name}`);
        break;
      }
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    addLog('🏁 Diagnostic complete');
    setIsRunning(false);
  }, [testBackendConnection, testRAGStatus, testOllamaModels, testIngestedDocuments, addLog]);

  const getStatusBadge = (status: DebugStep['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">✅ Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">❌ Error</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">🔄 Running</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">⏳ Pending</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🔧 RAG Debug Panel
          <Button 
            onClick={runFullDiagnostic} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? '🔄 Running...' : '🚀 Run Diagnostic'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Debug Steps */}
        <div className="space-y-2">
          {steps.map(step => (
            <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{step.name}</span>
                  {getStatusBadge(step.status)}
                </div>
                <div className="text-sm text-gray-600 mt-1">{step.message}</div>
                {step.details && (
                  <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-1 rounded">
                    {step.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Individual Test Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={testBackendConnection} size="sm" variant="outline">
            Test Backend
          </Button>
          <Button onClick={testRAGStatus} size="sm" variant="outline">
            Test RAG
          </Button>
          <Button onClick={testOllamaModels} size="sm" variant="outline">
            Test Ollama
          </Button>
          <Button onClick={testIngestedDocuments} size="sm" variant="outline">
            Test Documents
          </Button>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Debug Logs</h4>
            <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap">
                {logs.join('\n')}
              </pre>
            </div>
          </div>
        )}

        {/* Quick Fixes */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Quick Fixes</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• If backend fails: Check if backend is running on port 8000</li>
            <li>• If RAG fails: Check backend logs for import errors</li>
            <li>• If Ollama fails: Run `ollama serve` and `ollama pull mistral`</li>
            <li>• If documents show 0: Check browser console during upload</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};