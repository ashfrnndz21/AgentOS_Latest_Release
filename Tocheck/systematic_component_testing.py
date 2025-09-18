#!/usr/bin/env python3

import os
import time

print("🔧 SYSTEMATIC COMPONENT TESTING")
print("=" * 60)

print("\n🎯 PHASE 1: TEST WITHOUT PROBLEMATIC COMPONENTS")
print("   Current App.tsx excludes:")
print("   ❌ MultiAgentWorkspace")
print("   ❌ OllamaAgentDashboard") 
print("   ❌ OllamaTerminal")

print("\n🚀 INSTRUCTIONS:")
print("   1. Start your app: npm run dev")
print("   2. Check if it loads (no white screen)")
print("   3. Report back the result")

print("\n📋 IF APP LOADS SUCCESSFULLY:")
print("   ✅ The issue is in one of the disabled components")
print("   ✅ We'll test each component individually")

print("\n📋 IF STILL WHITE SCREEN:")
print("   ❌ The issue is in core components:")
print("   • Layout component")
print("   • Index page")
print("   • Sidebar component")
print("   • Core routing")

# Create individual test versions for each problematic component
test_versions = {
    "Test MultiAgentWorkspace Only": '''import React from 'react';
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

export default App;''',

    "Test OllamaAgentDashboard Only": '''import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from './components/ui/tooltip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import Index from './pages/Index';
import { OllamaAgentDashboard } from './pages/OllamaAgentDashboard';

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/ollama-agents" element={<Layout><OllamaAgentDashboard /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;''',

    "Test OllamaTerminal Only": '''import React from 'react';
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

export default App;'''
}

print(f"\n🧪 CREATING INDIVIDUAL TEST FILES:")
for i, (name, code) in enumerate(test_versions.items(), 1):
    filename = f"src/App_test_individual_{i}.tsx"
    with open(filename, 'w') as f:
        f.write(code)
    print(f"   ✅ Created {filename} - {name}")

print(f"\n🎯 TESTING SEQUENCE:")
print("   1. First test current app (without problematic components)")
print("   2. If successful, test each component individually:")
print("      • cp src/App_test_individual_1.tsx src/App.tsx  # Test MultiAgentWorkspace")
print("      • cp src/App_test_individual_2.tsx src/App.tsx  # Test OllamaAgentDashboard") 
print("      • cp src/App_test_individual_3.tsx src/App.tsx  # Test OllamaTerminal")

print(f"\n💡 EXPECTED RESULTS:")
print("   • If one component causes white screen → That's the culprit")
print("   • If all work individually → Issue is with component interaction")
print("   • If none work → Issue is in core components")

print(f"\n🔍 CORE COMPONENT FALLBACK TEST:")
print("   If all individual tests fail, test minimal core:")

minimal_core = '''import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🔍 Minimal Core Test</h1>
      <p>If you see this, React core is working</p>
    </div>
  );
}

export default App;'''

with open("src/App_minimal_core.tsx", 'w') as f:
    f.write(minimal_core)

print("   ✅ Created src/App_minimal_core.tsx")
print("   Use: cp src/App_minimal_core.tsx src/App.tsx")

print(f"\n🚀 START TESTING NOW:")
print("   npm run dev")
print("   Report if current app loads or shows white screen")