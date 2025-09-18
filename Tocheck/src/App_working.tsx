import React, { useState, useEffect } from 'react';
import { apiClient } from './lib/apiClient';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [ollamaModels, setOllamaModels] = useState([]);
  const [terminalCommand, setTerminalCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  useEffect(() => {
    checkBackendStatus();
    loadOllamaModels();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await apiClient.checkHealth();
      setBackendStatus(`✅ Connected (Port: ${response.port})`);
    } catch (error) {
      setBackendStatus('❌ Backend not connected');
    }
  };

  const loadOllamaModels = async () => {
    try {
      const response = await apiClient.getOllamaModels();
      setOllamaModels(response.models || []);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const executeOllamaCommand = async () => {
    if (!terminalCommand.trim()) return;
    
    try {
      setTerminalOutput('Executing...');
      const response = await apiClient.executeOllamaCommand(terminalCommand);
      setTerminalOutput(response.output || 'Command executed successfully');
    } catch (error) {
      setTerminalOutput(`Error: ${error.message}`);
    }
  };

  const uploadDocument = async () => {
    if (!documentFile) return;
    
    try {
      const formData = new FormData();
      formData.append('file', documentFile);
      
      const response = await apiClient.uploadDocument(formData);
      alert('Document uploaded successfully!');
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    }
  };

  const queryDocuments = async () => {
    if (!chatQuery.trim()) return;
    
    try {
      setChatResponse('Thinking...');
      const response = await apiClient.queryDocuments(chatQuery, 'llama3.2:latest');
      setChatResponse(response.response || 'No response received');
    } catch (error) {
      setChatResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏦 Banking Agent Platform</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f8ff', border: '1px solid #ccc' }}>
        <h3>System Status</h3>
        <p><strong>Backend:</strong> {backendStatus}</p>
        <p><strong>Ollama Models:</strong> {ollamaModels.length} available</p>
        <button onClick={checkBackendStatus} style={{ marginRight: '10px' }}>Refresh Status</button>
        <button onClick={loadOllamaModels}>Reload Models</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Ollama Terminal */}
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
          <h3>🤖 Ollama Terminal</h3>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={terminalCommand}
              onChange={(e) => setTerminalCommand(e.target.value)}
              placeholder="Enter Ollama command (e.g., ollama list)"
              style={{ width: '70%', padding: '5px', marginRight: '10px' }}
              onKeyPress={(e) => e.key === 'Enter' && executeOllamaCommand()}
            />
            <button onClick={executeOllamaCommand}>Execute</button>
          </div>
          <div style={{ 
            backgroundColor: '#000', 
            color: '#0f0', 
            padding: '10px', 
            minHeight: '100px', 
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
            {terminalOutput || 'Ready for commands...'}
          </div>
        </div>

        {/* Document Chat */}
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
          <h3>📄 Document Chat</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>Upload Document (PDF)</h4>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setDocumentFile(e.target.files[0])}
              style={{ marginRight: '10px' }}
            />
            <button onClick={uploadDocument} disabled={!documentFile}>
              Upload
            </button>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <h4>Chat with Documents</h4>
            <input
              type="text"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              placeholder="Ask a question about your documents..."
              style={{ width: '70%', padding: '5px', marginRight: '10px' }}
              onKeyPress={(e) => e.key === 'Enter' && queryDocuments()}
            />
            <button onClick={queryDocuments}>Ask</button>
          </div>

          <div style={{ 
            backgroundColor: '#f9f9f9', 
            border: '1px solid #ddd',
            padding: '10px', 
            minHeight: '100px',
            whiteSpace: 'pre-wrap'
          }}>
            {chatResponse || 'Upload a document and ask questions...'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Backend: http://localhost:5052 | Frontend: http://localhost:8080</p>
      </div>
    </div>
  );
}

export default App;