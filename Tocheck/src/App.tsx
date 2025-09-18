import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';

// Lazy load all components for better performance
const Index = lazy(() => import('./pages/Index'));
const CommandCentre = lazy(() => import('./pages/CommandCentre'));
const Agents = lazy(() => import('./pages/Agents'));
const MCPDashboard = lazy(() => import('./pages/MCPDashboard'));
const SimpleMCPDashboard = lazy(() => import('./pages/SimpleMCPDashboard'));
const WealthManagement = lazy(() => import('./pages/WealthManagement'));
const CustomerValueManagement = lazy(() => import('./pages/CustomerValueManagement'));
const CustomerAnalytics = lazy(() => import('./pages/CustomerAnalytics'));

// Agent Use Cases - Advanced Components
const RiskAnalytics = lazy(() => import('./pages/RiskAnalytics'));
const ArchitectureDesign = lazy(() => import('./pages/ArchitectureDesign'));

// System Flow & Monitoring Components
const AgentOSLogicalFlow = lazy(() => import('./components/SystemFlow/AgentOSLogicalFlow').then(module => ({ default: module.AgentOSLogicalFlow })));
const AgentOSArchitectureDesign = lazy(() => import('./components/SystemFlow/AgentOSArchitectureDesign').then(module => ({ default: module.AgentOSArchitectureDesign })));

// Restored Git Components - Core functionality
const AgentControlPanel = lazy(() => import('./pages/AgentControlPanel'));
const SystemMonitoring = lazy(() => import('./pages/SystemMonitoring'));
const Settings = lazy(() => import('./pages/Settings'));

// Potentially problematic components with enhanced error handling
const MultiAgentWorkspace = lazy(() => import('./pages/MultiAgentWorkspace'));

// Document workspace with fallback
const SimpleRealDocumentWorkspace = lazy(() => 
  import('./pages/SimpleRealDocumentWorkspace').catch(() => 
    import('./pages/MinimalDocumentWorkspace')
  )
);

// Ollama components with fallbacks
const OllamaAgentDashboard = lazy(() => 
  import('./pages/OllamaAgentDashboard').catch(() => 
    import('./pages/SimpleOllamaAgentDashboard')
  )
);

const OllamaTerminalPage = lazy(() => 
  import('./pages/OllamaTerminal').catch(() => 
    import('./components/SimpleOllamaTerminal')
  )
);

// Agent Marketplace with fallback
const AgentMarketplace = lazy(() => 
  import('./components/AgentMarketplace').catch(() => ({
    default: () => (
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            🏪 Agent Marketplace
          </h2>
          <p className="text-blue-700">
            Agent marketplace is being prepared. Check back soon!
          </p>
        </div>
      </div>
    )
  }))
);

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
              
              {/* AI Agents - Core Components */}
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
              
              {/* AI Agents - Advanced Components with Enhanced Error Handling */}
              <Route path="/multi-agent-workspace" element={
                <Layout>
                  <SafeComponent componentName="MultiAgentWorkspace">
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
              
              {/* Agent Use Cases - Advanced Analytics */}
              <Route path="/risk-analytics" element={
                <Layout>
                  <SafeComponent componentName="RiskAnalytics">
                    <RiskAnalytics />
                  </SafeComponent>
                </Layout>
              } />
              
              <Route path="/architecture-design" element={
                <Layout>
                  <SafeComponent componentName="ArchitectureDesign">
                    <ArchitectureDesign />
                  </SafeComponent>
                </Layout>
              } />
              
              {/* Monitoring & Control */}
              <Route path="/system-flow" element={
                <Layout>
                  <SafeComponent componentName="AgentOSLogicalFlow">
                    <AgentOSLogicalFlow />
                  </SafeComponent>
                </Layout>
              } />
              
              <Route path="/architecture-flow" element={
                <Layout>
                  <SafeComponent componentName="AgentOSArchitectureDesign">
                    <AgentOSArchitectureDesign />
                  </SafeComponent>
                </Layout>
              } />
              
              <Route path="/system-monitoring" element={
                <Layout>
                  <SafeComponent componentName="SystemMonitoring">
                    <SystemMonitoring />
                  </SafeComponent>
                </Layout>
              } />
              
              {/* Configuration */}
              <Route path="/settings" element={
                <Layout>
                  <SafeComponent componentName="Settings">
                    <Settings />
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

export default App;