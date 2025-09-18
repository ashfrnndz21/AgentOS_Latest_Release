import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from './components/ui/tooltip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import Index from './pages/Index';
import { OllamaTerminalPage } from './pages/OllamaTerminal';

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/ollama-terminal" element={<Layout><OllamaTerminalPage /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;