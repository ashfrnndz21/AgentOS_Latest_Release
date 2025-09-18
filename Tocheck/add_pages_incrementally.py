#!/usr/bin/env python3

import os

print("🔄 ADDING REAL PAGES INCREMENTALLY")
print("=" * 50)

# Check which pages actually exist
pages_to_check = [
    "src/pages/Index.tsx",
    "src/pages/OllamaTerminal.tsx", 
    "src/pages/SimpleRealDocumentWorkspace.tsx",
    "src/pages/Agents.tsx",
    "src/pages/CommandCentre.tsx",
    "src/pages/AgentControlPanel.tsx",
    "src/pages/MultiAgentWorkspace.tsx"
]

print("\n📋 CHECKING PAGE AVAILABILITY:")
existing_pages = []
for page in pages_to_check:
    exists = os.path.exists(page)
    status = "✅" if exists else "❌"
    print(f"{status} {page}")
    if exists:
        existing_pages.append(page)

print(f"\n✅ Found {len(existing_pages)} existing pages")

# Now let's add the first safe page - OllamaTerminal
if "src/pages/OllamaTerminal.tsx" in existing_pages:
    print("\n🎯 Step 1: Adding OllamaTerminal page")
    
    app_content = '''import React from 'react';
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

export default App;'''
    
    with open('src/App_step1.tsx', 'w') as f:
        f.write(app_content)
    
    print("   ✅ Created App_step1.tsx with OllamaTerminal")

print("\n🎯 Ready to test step by step restoration")