import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import Index from './pages/Index';
// import { OllamaTerminalPage } from './pages/OllamaTerminal'; // DISABLED
import { SimpleRealDocumentWorkspace } from './pages/SimpleRealDocumentWorkspace';
import CommandCentre from './pages/CommandCentre';
import Agents from './pages/Agents';
import { AgentControlPanel } from './pages/AgentControlPanel';
// import MultiAgentWorkspace from './pages/MultiAgentWorkspace'; // DISABLED
// import { OllamaAgentDashboard } from './pages/OllamaAgentDashboard'; // DISABLED
import MCPDashboard from './pages/MCPDashboard';
import { SimpleMCPDashboard } from './pages/SimpleMCPDashboard';
import { AgentMarketplace } from './components/AgentMarketplace';
import WealthManagement from './pages/WealthManagement';
import CustomerValueManagement from './pages/CustomerValueManagement';
import CustomerAnalytics from './pages/CustomerAnalytics';

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              
              {/* Agent Command Centre */}
              <Route path="/agent-command" element={<Layout><CommandCentre /></Layout>} />
              
              {/* AI Agents - DISABLED PROBLEMATIC ONES */}
              <Route path="/agents" element={<Layout><Agents /></Layout>} />
              <Route path="/agent-control" element={<Layout><AgentControlPanel /></Layout>} />
              {/* <Route path="/multi-agent-workspace" element={<Layout><MultiAgentWorkspace /></Layout>} /> DISABLED */}
              {/* <Route path="/ollama-agents" element={<Layout><OllamaAgentDashboard /></Layout>} /> DISABLED */}
              {/* <Route path="/ollama-terminal" element={<Layout><OllamaTerminalPage /></Layout>} /> DISABLED */}
              
              {/* MCP Gateway */}
              <Route path="/mcp-dashboard" element={<Layout><MCPDashboard /></Layout>} />
              <Route path="/mcp-gateway" element={<Layout><SimpleMCPDashboard /></Layout>} />
              
              {/* AI Marketplace */}
              <Route path="/agent-exchange" element={<Layout><AgentMarketplace /></Layout>} />
              
              {/* Banking Use Cases */}
              <Route path="/wealth-management" element={<Layout><WealthManagement /></Layout>} />
              <Route path="/customer-insights" element={<Layout><CustomerValueManagement /></Layout>} />
              <Route path="/customer-analytics" element={<Layout><CustomerAnalytics /></Layout>} />
              
              {/* Document Processing */}
              <Route path="/documents" element={<Layout><SimpleRealDocumentWorkspace /></Layout>} />
              
              {/* Fallback for disabled routes */}
              <Route path="/multi-agent-workspace" element={
                <Layout>
                  <div className="p-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                        🚧 Temporarily Disabled
                      </h2>
                      <p className="text-yellow-700">
                        Multi-Agent Workspace is temporarily disabled for troubleshooting.
                      </p>
                    </div>
                  </div>
                </Layout>
              } />
              
              <Route path="/ollama-agents" element={
                <Layout>
                  <div className="p-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                        🚧 Temporarily Disabled
                      </h2>
                      <p className="text-yellow-700">
                        Ollama Agent Dashboard is temporarily disabled for troubleshooting.
                      </p>
                    </div>
                  </div>
                </Layout>
              } />
              
              <Route path="/ollama-terminal" element={
                <Layout>
                  <div className="p-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                        🚧 Temporarily Disabled
                      </h2>
                      <p className="text-yellow-700">
                        Ollama Terminal is temporarily disabled for troubleshooting.
                      </p>
                    </div>
                  </div>
                </Layout>
              } />
            </Routes>
          </div>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;