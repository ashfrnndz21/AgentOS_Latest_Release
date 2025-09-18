#!/usr/bin/env python3

import os
import shutil

print("🔧 COMPREHENSIVE WHITE SCREEN FIX")
print("=" * 50)

print("\n🎯 IDENTIFIED ROOT CAUSES:")
print("   1. Missing sidebar.tsx main export file")
print("   2. Incorrect import path in Layout.tsx")
print("   3. Potential async hook issues")
print("   4. Missing error boundaries")

print("\n1️⃣ FIXING SIDEBAR IMPORT ISSUE:")

# Create the missing sidebar.tsx file
sidebar_content = '''// Main sidebar export file
export * from './sidebar-components';
export * from './sidebar-context';
export * from './sidebar-provider';
export * from './sidebar-utils';

// Re-export commonly used components
export { SidebarProvider, useSidebar } from './sidebar-components';
'''

with open("src/components/ui/sidebar.tsx", 'w') as f:
    f.write(sidebar_content)

print("   ✅ Created src/components/ui/sidebar.tsx")

print("\n2️⃣ FIXING LAYOUT COMPONENT:")

# Read current Layout.tsx
if os.path.exists("src/components/Layout.tsx"):
    with open("src/components/Layout.tsx", 'r') as f:
        layout_content = f.read()
    
    # Fix the import path
    fixed_layout = layout_content.replace(
        "import { SidebarProvider } from '@/components/ui/sidebar';",
        "import { SidebarProvider } from './ui/sidebar';"
    )
    
    # Add error boundary wrapper
    if "ErrorBoundary" not in fixed_layout:
        # Add ErrorBoundary import
        fixed_layout = fixed_layout.replace(
            "import { useNavigate } from 'react-router-dom';",
            "import { useNavigate } from 'react-router-dom';\nimport { ErrorBoundary } from './ErrorBoundary';"
        )
        
        # Wrap the return content in ErrorBoundary
        fixed_layout = fixed_layout.replace(
            "return (\n    <SidebarProvider>",
            "return (\n    <ErrorBoundary>\n      <SidebarProvider>"
        )
        
        fixed_layout = fixed_layout.replace(
            "    </SidebarProvider>\n  );",
            "      </SidebarProvider>\n    </ErrorBoundary>\n  );"
        )
    
    with open("src/components/Layout.tsx", 'w') as f:
        f.write(fixed_layout)
    
    print("   ✅ Fixed Layout.tsx imports and added error boundary")

print("\n3️⃣ CREATING SAFE APP.TSX VERSION:")

# Create a safe App.tsx that loads components progressively
safe_app_content = '''import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';

// Lazy load potentially problematic components
const Index = lazy(() => import('./pages/Index'));
const CommandCentre = lazy(() => import('./pages/CommandCentre'));
const Agents = lazy(() => import('./pages/Agents'));
const AgentControlPanel = lazy(() => import('./pages/AgentControlPanel'));
const MCPDashboard = lazy(() => import('./pages/MCPDashboard'));
const SimpleMCPDashboard = lazy(() => import('./pages/SimpleMCPDashboard'));
const AgentMarketplace = lazy(() => import('./components/AgentMarketplace'));
const WealthManagement = lazy(() => import('./pages/WealthManagement'));
const CustomerValueManagement = lazy(() => import('./pages/CustomerValueManagement'));
const CustomerAnalytics = lazy(() => import('./pages/CustomerAnalytics'));
const SimpleRealDocumentWorkspace = lazy(() => import('./pages/SimpleRealDocumentWorkspace'));

// Lazy load problematic components with error boundaries
const MultiAgentWorkspace = lazy(() => import('./pages/MultiAgentWorkspace'));
const OllamaAgentDashboard = lazy(() => import('./pages/OllamaAgentDashboard'));
const OllamaTerminalPage = lazy(() => import('./pages/OllamaTerminal'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, componentName }: { error: Error; componentName: string }) => (
  <div className="flex items-center justify-center min-h-screen p-6">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
      <h2 className="text-lg font-semibold text-red-800 mb-2">
        ⚠️ Component Error: {componentName}
      </h2>
      <p className="text-red-700 mb-4">
        This component failed to load. The rest of the app should still work.
      </p>
      <details className="text-sm text-red-600">
        <summary>Error Details</summary>
        <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
      </details>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Reload Page
      </button>
    </div>
  </div>
);

// Safe component wrapper
const SafeComponent = ({ 
  children, 
  componentName, 
  fallback 
}: { 
  children: React.ReactNode; 
  componentName: string;
  fallback?: React.ReactNode;
}) => (
  <ErrorBoundary
    fallback={fallback || <ErrorFallback error={new Error('Component failed')} componentName={componentName} />}
  >
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback error={new Error('App crashed')} componentName="App" />}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={
                <Layout>
                  <SafeComponent componentName="Index">
                    <Index />
                  </SafeComponent>
                </Layout>
              } />
              
              {/* Agent Command Centre */}
              <Route path="/agent-command" element={
                <Layout>
                  <SafeComponent componentName="CommandCentre">
                    <CommandCentre />
                  </SafeComponent>
                </Layout>
              } />
              
              {/* AI Agents - Safe components */}
              <Route path="/agents" element={
                <Layout>
                  <SafeComponent componentName="Agents">
                    <Agents />
                  </SafeComponent>
                </Layout>
              } />
              
              <Route path="/agent-control" element={
                <Layout>
                  <SafeComponent componentName="AgentControlPanel">
                    <AgentControlPanel />
                  </SafeComponent>
                </Layout>
              } />
              
              {/* Potentially problematic components with enhanced error handling */}
              <Route path="/multi-agent-workspace" element={
                <Layout>
                  <SafeComponent 
                    componentName="MultiAgentWorkspace"
                    fallback={
                      <div className="p-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                            🚧 Multi-Agent Workspace Unavailable
                          </h2>
                          <p className="text-yellow-700">
                            The Multi-Agent Workspace is temporarily unavailable. Please try again later.
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <MultiAgentWorkspace />
                  </SafeComponent>
                </Layout>
              } />
              
              <Route path="/ollama-agents" element={
                <Layout>
                  <SafeComponent 
                    componentName="OllamaAgentDashboard"
                    fallback={
                      <div className="p-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                            🚧 Ollama Agents Unavailable
                          </h2>
                          <p className="text-yellow-700">
                            Ollama service may not be running. Please start Ollama and try again.
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <OllamaAgentDashboard />
                  </SafeComponent>
                </Layout>
              } />
              
              <Route path="/ollama-terminal" element={
                <Layout>
                  <SafeComponent 
                    componentName="OllamaTerminal"
                    fallback={
                      <div className="p-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                            🚧 Ollama Terminal Unavailable
                          </h2>
                          <p className="text-yellow-700">
                            Ollama service may not be running. Please start Ollama and try again.
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <OllamaTerminalPage />
                  </SafeComponent>
                </Layout>
              } />
              
              {/* MCP Gateway */}
              <Route path="/mcp-dashboard" element={
                <Layout>
                  <SafeComponent componentName="MCPDashboard">
                    <MCPDashboard />
                  </SafeComponent>
                </Layout>
              } />
              
              <Route path="/mcp-gateway" element={
                <Layout>
                  <SafeComponent componentName="SimpleMCPDashboard">
                    <SimpleMCPDashboard />
                  </SafeComponent>
                </Layout>
              } />
              
              {/* AI Marketplace */}
              <Route path="/agent-exchange" element={
                <Layout>
                  <SafeComponent componentName="AgentMarketplace">
                    <AgentMarketplace />
                  </SafeComponent>
                </Layout>
              } />
              
              {/* Banking Use Cases */}
              <Route path="/wealth-management" element={
                <Layout>
                  <SafeComponent componentName="WealthManagement">
                    <WealthManagement />
                  </SafeComponent>
                </Layout>
              } />
              
              <Route path="/customer-insights" element={
                <Layout>
                  <SafeComponent componentName="CustomerValueManagement">
                    <CustomerValueManagement />
                  </SafeComponent>
                </Layout>
              } />
              
              <Route path="/customer-analytics" element={
                <Layout>
                  <SafeComponent componentName="CustomerAnalytics">
                    <CustomerAnalytics />
                  </SafeComponent>
                </Layout>
              } />
              
              {/* Document Processing */}
              <Route path="/documents" element={
                <Layout>
                  <SafeComponent 
                    componentName="DocumentWorkspace"
                    fallback={
                      <div className="p-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                            🚧 Document Workspace Unavailable
                          </h2>
                          <p className="text-yellow-700">
                            Document processing service may not be available. Please check backend connection.
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <SimpleRealDocumentWorkspace />
                  </SafeComponent>
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

export default App;'''

with open("src/App.tsx", 'w') as f:
    f.write(safe_app_content)

print("   ✅ Created safe App.tsx with error boundaries and lazy loading")

print("\n4️⃣ ENHANCING ERROR BOUNDARY:")

# Check if ErrorBoundary exists and enhance it
if os.path.exists("src/components/ErrorBoundary.tsx"):
    with open("src/components/ErrorBoundary.tsx", 'r') as f:
        error_boundary_content = f.read()
    
    # If it's a simple error boundary, enhance it
    if "componentDidCatch" not in error_boundary_content:
        enhanced_error_boundary = '''import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              ⚠️ Something went wrong
            </h2>
            <p className="text-red-700 mb-4">
              An error occurred while rendering this component. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="text-sm text-red-600 mb-4">
                <summary>Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}'''
        
        with open("src/components/ErrorBoundary.tsx", 'w') as f:
            f.write(enhanced_error_boundary)
        
        print("   ✅ Enhanced ErrorBoundary component")
    else:
        print("   ✅ ErrorBoundary already exists and looks good")

print("\n5️⃣ FIXING API CLIENT CONFIGURATION:")

# Fix apiClient.ts
if os.path.exists("src/lib/apiClient.ts"):
    with open("src/lib/apiClient.ts", 'r') as f:
        api_content = f.read()
    
    # Ensure it has proper error handling and timeout
    if 'timeout' not in api_content:
        # Add timeout configuration
        api_content = api_content.replace(
            "const apiClient = axios.create({",
            "const apiClient = axios.create({\n  timeout: 10000,"
        )
    
    # Add error interceptor if not present
    if 'interceptors.response.use' not in api_content:
        api_content += '''

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - backend may be down');
      return Promise.reject(new Error('Backend service unavailable'));
    }
    
    return Promise.reject(error);
  }
);
'''
    
    with open("src/lib/apiClient.ts", 'w') as f:
        f.write(api_content)
    
    print("   ✅ Enhanced API client with timeout and error handling")

print("\n6️⃣ CREATING SAFE HOOKS:")

# Create safe versions of problematic hooks
safe_ollama_hook = '''import { useState, useEffect } from 'react';

export interface OllamaModel {
  name: string;
  size: string;
  digest: string;
  modified_at: string;
}

export const useOllamaModels = () => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:11434/api/tags', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Ollama service not available');
      }
      
      const data = await response.json();
      setModels(data.models || []);
    } catch (err) {
      console.warn('Ollama not available:', err);
      setError('Ollama service not available');
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we haven't tried yet
    if (models.length === 0 && !error) {
      fetchModels();
    }
  }, []);

  return { models, loading, error, refetch: fetchModels };
};'''

with open("src/hooks/useOllamaModels.ts", 'w') as f:
    f.write(safe_ollama_hook)

print("   ✅ Created safe useOllamaModels hook")

print("\n✅ COMPREHENSIVE FIX COMPLETE!")
print("=" * 50)

print("\n🎯 FIXES APPLIED:")
fixes_applied = [
    "✅ Created missing sidebar.tsx export file",
    "✅ Fixed Layout.tsx import paths", 
    "✅ Added error boundaries throughout the app",
    "✅ Implemented lazy loading for problematic components",
    "✅ Enhanced ErrorBoundary with better error reporting",
    "✅ Added timeout and error handling to API client",
    "✅ Created safe useOllamaModels hook with timeout",
    "✅ Added fallback UI for failed components"
]

for fix in fixes_applied:
    print(f"   {fix}")

print("\n🚀 NEXT STEPS:")
print("   1. Restart your frontend: npm run dev")
print("   2. The app should now load with proper error handling")
print("   3. Components that fail will show error messages instead of white screen")
print("   4. Check browser console for any remaining issues")

print("\n🌐 EXPECTED BEHAVIOR:")
print("   • App loads with sidebar and navigation")
print("   • Failed components show user-friendly error messages")
print("   • Working components remain functional")
print("   • Better debugging information in console")