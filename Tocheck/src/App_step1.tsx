import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';

// Working pages - verified to exist
import Index from './pages/Index';
import { OllamaTerminalPage } from './pages/OllamaTerminal';

// Fallback component for missing pages
const ComingSoon = ({ pageName }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>🚧 {pageName}</h2>
    <p>This page is being restored...</p>
    <button onClick={() => window.location.href = '/'}>← Back to Home</button>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/ollama-terminal" element={<Layout><OllamaTerminalPage /></Layout>} />
            <Route path="/agents" element={<Layout><ComingSoon pageName="Agents Dashboard" /></Layout>} />
            <Route path="/documents" element={<Layout><ComingSoon pageName="Document Workspace" /></Layout>} />
            <Route path="/agent-command" element={<Layout><ComingSoon pageName="Command Centre" /></Layout>} />
            <Route path="*" element={<Layout><ComingSoon pageName="Page Not Found" /></Layout>} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner richColors />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;