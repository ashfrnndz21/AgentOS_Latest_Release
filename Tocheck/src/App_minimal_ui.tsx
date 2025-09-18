import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';

// Start with just Index - we know this works
import Index from './pages/Index';

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
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