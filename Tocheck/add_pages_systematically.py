#!/usr/bin/env python3

print("🔧 ADDING PAGES SYSTEMATICALLY")
print("=" * 50)

print("\n✅ Current working pages added:")
print("   - Index (Home)")
print("   - OllamaTerminal") 
print("   - SimpleRealDocumentWorkspace")
print("   - Agents")
print("   - CommandCentre")

print("\n🎯 Adding remaining safe pages...")

# Add the remaining core pages that we know work
app_content = '''import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';

// Core working pages
import Index from './pages/Index';
import { OllamaTerminalPage } from './pages/OllamaTerminal';
import { SimpleRealDocumentWorkspace } from './pages/SimpleRealDocumentWorkspace';
import Agents from './pages/Agents';
import CommandCentre from './pages/CommandCentre';
import { AgentControlPanel } from './pages/AgentControlPanel';
import MultiAgentWorkspace from './pages/MultiAgentWorkspace';

// Additional safe pages
import { OllamaAgentDashboard } from './pages/OllamaAgentDashboard';
import Settings from './pages/Settings';

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
            {/* Core Platform Routes */}
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/agents" element={<Layout><Agents /></Layout>} />
            <Route path="/agent-control" element={<Layout><AgentControlPanel /></Layout>} />
            <Route path="/multi-agent-workspace" element={<Layout><MultiAgentWorkspace /></Layout>} />
            
            {/* Command Centre */}
            <Route path="/agent-command" element={<Layout><CommandCentre /></Layout>} />
            
            {/* Ollama Routes */}
            <Route path="/ollama-terminal" element={<Layout><OllamaTerminalPage /></Layout>} />
            <Route path="/ollama-agents" element={<Layout><OllamaAgentDashboard /></Layout>} />
            
            {/* Documents */}
            <Route path="/documents" element={<Layout><SimpleRealDocumentWorkspace /></Layout>} />
            
            {/* System */}
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            
            {/* Placeholder routes for remaining pages */}
            <Route path="/wealth-management" element={<Layout><ComingSoon pageName="Wealth Management" /></Layout>} />
            <Route path="/customer-insights" element={<Layout><ComingSoon pageName="Customer Insights" /></Layout>} />
            <Route path="/risk-analytics" element={<Layout><ComingSoon pageName="Risk Analytics" /></Layout>} />
            <Route path="/mcp-dashboard" element={<Layout><ComingSoon pageName="MCP Dashboard" /></Layout>} />
            <Route path="/network-twin" element={<Layout><ComingSoon pageName="Network Twin" /></Layout>} />
            <Route path="/system-flow" element={<Layout><ComingSoon pageName="System Flow" /></Layout>} />
            <Route path="/debug" element={<Layout><ComingSoon pageName="Debug Tools" /></Layout>} />
            
            <Route path="*" element={<Layout><ComingSoon pageName="Page Not Found" /></Layout>} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner richColors />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;'''

with open('src/App_systematic.tsx', 'w') as f:
    f.write(app_content)

print("\n✅ Created systematic version with core pages")
print("   - 9 working pages")
print("   - 7 placeholder pages") 
print("   - Safe fallback system")

print("\n🎯 This approach ensures:")
print("   - No blank screens")
print("   - Core functionality available")
print("   - Gradual expansion possible")