import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';

// Core working pages - added one by one
import Index from './pages/Index';
import { OllamaTerminalPage } from './pages/OllamaTerminal';
import { SimpleRealDocumentWorkspace } from './pages/SimpleRealDocumentWorkspace';
import Agents from './pages/Agents';
import CommandCentre from './pages/CommandCentre';
import { AgentControlPanel } from './pages/AgentControlPanel';
import MultiAgentWorkspace from './pages/MultiAgentWorkspace';
import { OllamaAgentDashboard } from './pages/OllamaAgentDashboard';

// Fallback for missing pages
const ComingSoon = ({ pageName }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>🚧 {pageName}</h2>
    <p>This page is being restored...</p>
    <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>← Back to Home</a>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Core working routes */}
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/ollama-terminal" element={<Layout><OllamaTerminalPage /></Layout>} />
            <Route path="/documents" element={<Layout><SimpleRealDocumentWorkspace /></Layout>} />
            <Route path="/agents" element={<Layout><Agents /></Layout>} />
            <Route path="/agent-command" element={<Layout><CommandCentre /></Layout>} />
            <Route path="/agent-control" element={<Layout><AgentControlPanel /></Layout>} />
            <Route path="/multi-agent-workspace" element={<Layout><MultiAgentWorkspace /></Layout>} />
            <Route path="/ollama-agents" element={<Layout><OllamaAgentDashboard /></Layout>} />
            
            {/* Placeholder routes */}
            <Route path="/wealth-management" element={<Layout><ComingSoon pageName="Wealth Management" /></Layout>} />
            <Route path="/customer-insights" element={<Layout><ComingSoon pageName="Customer Insights" /></Layout>} />
            <Route path="/risk-analytics" element={<Layout><ComingSoon pageName="Risk Analytics" /></Layout>} />
            <Route path="/mcp-dashboard" element={<Layout><ComingSoon pageName="MCP Dashboard" /></Layout>} />
            <Route path="/network-twin" element={<Layout><ComingSoon pageName="Network Twin" /></Layout>} />
            <Route path="/system-flow" element={<Layout><ComingSoon pageName="System Flow" /></Layout>} />
            <Route path="/settings" element={<Layout><ComingSoon pageName="Settings" /></Layout>} />
            <Route path="/debug" element={<Layout><ComingSoon pageName="Debug Tools" /></Layout>} />
            
            <Route path="*" element={<Layout><div style={{padding: '20px'}}>Page not found - <a href="/">Go Home</a></div></Layout>} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner richColors />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;