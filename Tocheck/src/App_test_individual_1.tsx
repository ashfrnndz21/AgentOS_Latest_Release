import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from './components/ui/tooltip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import Index from './pages/Index';
import MultiAgentWorkspace from './pages/MultiAgentWorkspace';

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/multi-agent-workspace" element={<Layout><MultiAgentWorkspace /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;