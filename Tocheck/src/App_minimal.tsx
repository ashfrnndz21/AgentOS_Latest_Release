import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Banking Agent Platform</h1>
      <p>System Status: Loading...</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/ollama-terminal">Ollama Terminal</a></li>
          <li><a href="/document-chat">Document Chat</a></li>
          <li><a href="/agent-dashboard">Agent Dashboard</a></li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Backend Status</h3>
        <p>Backend: http://localhost:5052</p>
        <p>Frontend: http://localhost:8080</p>
      </div>
    </div>
  );
}

export default App;