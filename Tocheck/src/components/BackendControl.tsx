import React, { useState, useEffect } from 'react';
import { Play, Square, RefreshCw, Server, CheckCircle, AlertCircle, Loader2, Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface BackendStatus {
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  port?: number;
  pid?: number;
  uptime?: string;
  error?: string;
}

interface TimeoutConfig {
  generation_timeout: number;
  health_check_timeout: number;
  model_pull_timeout: number;
  command_timeout: number;
}

interface BackendConfig {
  timeouts: TimeoutConfig;
  ollama_host: string;
  backend_port: number;
}

export const BackendControl: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({ status: 'stopped' });
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<BackendConfig>({
    timeouts: {
      generation_timeout: 300,
      health_check_timeout: 5,
      model_pull_timeout: 300,
      command_timeout: 60
    },
    ollama_host: 'http://localhost:11434',
    backend_port: 5052
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lastError, setLastError] = useState<string>('');

  // Load backend configuration
  const loadConfig = async () => {
    try {
      const response = await fetch(`http://localhost:${config.backend_port}/config`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.log('Could not load config, using defaults');
    }
  };

  // Save backend configuration
  const saveConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await fetch(`http://localhost:${config.backend_port}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        // Configuration saved successfully
        console.log('Configuration saved');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setConfigLoading(false);
    }
  };

  // Check backend status
  const checkBackendStatus = async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }
    
    const port = config.backend_port;
    setLastError('');
    
    console.log('🔍 Checking backend status on port:', port);
    console.log('🌐 Current frontend URL:', window.location.href);
    
    // Try multiple URL variations to handle different setups
    const urlsToTry = [
      `http://localhost:${port}/health`,
      `http://127.0.0.1:${port}/health`
    ];
    
    for (const url of urlsToTry) {
      console.log(`Trying backend at: ${url}`);
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          cache: 'no-cache'
        });
        
        console.log(`Response from ${url}:`, response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Backend data:', data);
          
          setBackendStatus({
            status: 'running',
            port: port,
            uptime: data.uptime || data.timestamp || 'Connected'
          });
          
          if (showLoading) setIsLoading(false);
          return; // Success, exit function
        }
      } catch (error) {
        console.log(`Failed to connect to ${url}:`, error);
        setLastError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    // If we get here, all attempts failed
    setBackendStatus({ 
      status: 'stopped',
      error: lastError || 'Cannot connect to backend. Check if Python backend is running on port ' + port
    });
    
    if (showLoading) {
      setIsLoading(false);
    }
  };

  // Refresh status with loading indicator
  const refreshStatus = async () => {
    console.log('Refreshing status for port:', config.backend_port);
    await checkBackendStatus(true);
  };

  // Debug function to test connection
  const testConnection = async () => {
    console.log('=== COMPREHENSIVE BACKEND DEBUG TEST ===');
    console.log('Current config:', config);
    console.log('Frontend URL:', window.location.origin);
    
    const port = config.backend_port;
    const urlsToTest = [
      `http://localhost:${port}/health`,
      `http://127.0.0.1:${port}/health`
    ];
    
    let successCount = 0;
    let results = [];
    
    for (const url of urlsToTest) {
      console.log(`\n--- Testing: ${url} ---`);
      
      try {
        const startTime = Date.now();
        const response = await fetch(url, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          cache: 'no-cache'
        });
        const endTime = Date.now();
        
        console.log(`Response time: ${endTime - startTime}ms`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const data = await response.json();
          console.log('Data:', data);
          
          results.push(`✅ ${url}: SUCCESS (${response.status})`);
          successCount++;
          
          // Update status on first success
          if (successCount === 1) {
            setBackendStatus({
              status: 'running',
              port: port,
              uptime: data.uptime || data.timestamp || 'Connected'
            });
          }
        } else {
          results.push(`❌ ${url}: HTTP ${response.status} - ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error testing ${url}:`, error);
        results.push(`❌ ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Show comprehensive results
    const message = `
🔍 BACKEND CONNECTION TEST RESULTS

Frontend: ${window.location.origin}
Backend Port: ${port}

${results.join('\n')}

${successCount > 0 ? 
  `✅ SUCCESS: ${successCount}/${urlsToTest.length} connections working` : 
  `❌ FAILED: All connections failed. Backend may not be running.`}

Check browser console for detailed logs.
    `.trim();
    
    alert(message);
  };

  // Start backend
  const startBackend = async () => {
    setIsLoading(true);
    setBackendStatus({ status: 'starting' });
    
    try {
      // First check if backend is already running
      const healthCheck = await fetch(`http://localhost:${config.backend_port}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (healthCheck.ok) {
        // Backend is already running
        const data = await healthCheck.json();
        setBackendStatus({
          status: 'running',
          port: config.backend_port,
          uptime: data.uptime || 'Unknown'
        });
        return;
      }
      
      // Try to start the backend via API call
      const response = await fetch(`http://localhost:${config.backend_port}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setBackendStatus({ status: 'running', port: config.backend_port });
      } else {
        // If API call fails, try to start via system command
        await startBackendViaCommand();
      }
    } catch (error) {
      // If direct API fails, try to start via command
      await startBackendViaCommand();
    } finally {
      setIsLoading(false);
      // Check status after a delay
      setTimeout(() => checkBackendStatus(), 2000);
    }
  };

  // Restart backend
  const restartBackend = async () => {
    setIsLoading(true);
    setBackendStatus({ status: 'stopping' });
    
    try {
      // First stop the backend
      await fetch(`http://localhost:${config.backend_port}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Then start it again
      setBackendStatus({ status: 'starting' });
      const response = await fetch(`http://localhost:${config.backend_port}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setBackendStatus({ status: 'running', port: config.backend_port });
      } else {
        await startBackendViaCommand();
      }
    } catch (error) {
      setBackendStatus({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to restart backend' 
      });
    } finally {
      setIsLoading(false);
      setTimeout(checkBackendStatus, 2000);
    }
  };

  // Restart RAG service and clear documents
  const restartRAGService = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:${config.backend_port}/api/rag/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ RAG service restarted:', result);
        
        // Show success message
        alert(`RAG service restarted successfully!\nCleared ${result.cleared_count || 0} documents.`);
      } else {
        throw new Error(`Failed to restart RAG service: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Failed to restart RAG service:', error);
      alert(`Failed to restart RAG service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Start backend via system command
  const startBackendViaCommand = async () => {
    try {
      // In a web environment, we can't directly start system processes
      // This would need to be handled by a desktop app wrapper or manual start
      
      setBackendStatus({ 
        status: 'error', 
        error: 'Cannot start backend automatically. Please start manually using: cd backend && python simple_api.py' 
      });
      
    } catch (error) {
      setBackendStatus({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to start backend' 
      });
    }
  };

  // Stop backend
  const stopBackend = async () => {
    setIsLoading(true);
    setBackendStatus({ status: 'stopping' });
    
    try {
      const response = await fetch(`http://localhost:${config.backend_port}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setBackendStatus({ status: 'stopped' });
      } else {
        throw new Error('Failed to stop backend');
      }
    } catch (error) {
      setBackendStatus({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to stop backend' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check status on component mount and set up polling
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await loadConfig();
        // Small delay to ensure config is loaded
        setTimeout(() => checkBackendStatus(), 500);
      } catch (error) {
        console.error('Failed to initialize backend control:', error);
      }
    };
    
    initializeComponent();
    
    // Poll status every 15 seconds (less frequent to avoid spam)
    const interval = setInterval(() => checkBackendStatus(), 15000);
    
    return () => clearInterval(interval);
  }, []);

  // Re-check status when config changes
  useEffect(() => {
    if (config.backend_port && config.backend_port !== 5002) {
      console.log('Config changed, rechecking status for port:', config.backend_port);
      setTimeout(() => checkBackendStatus(), 1000);
    }
  }, [config.backend_port]);

  // Update timeout configuration
  const updateTimeout = (key: keyof TimeoutConfig, value: number) => {
    setConfig(prev => ({
      ...prev,
      timeouts: {
        ...prev.timeouts,
        [key]: value
      }
    }));
  };

  const getStatusColor = () => {
    switch (backendStatus.status) {
      case 'running': return 'text-green-400';
      case 'stopped': return 'text-gray-400';
      case 'starting': case 'stopping': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (backendStatus.status) {
      case 'running': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'stopped': return <Square className="h-4 w-4 text-gray-400" />;
      case 'starting': case 'stopping': return <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return <Server className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-400" />
            Python Backend Control
          </div>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            size="sm"
            variant="ghost"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
        
        {/* Prominent Online/Offline Indicator */}
        <div className="flex items-center justify-center py-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            backendStatus.status === 'running' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : backendStatus.status === 'starting' || backendStatus.status === 'stopping'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              backendStatus.status === 'running' 
                ? 'bg-green-400 animate-pulse' 
                : backendStatus.status === 'starting' || backendStatus.status === 'stopping'
                ? 'bg-yellow-400 animate-pulse'
                : 'bg-red-400'
            }`} />
            {backendStatus.status === 'running' ? 'ONLINE' : 
             backendStatus.status === 'starting' ? 'STARTING...' :
             backendStatus.status === 'stopping' ? 'STOPPING...' : 'OFFLINE'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Status & Control</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            {/* Status Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Status:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor()} border-current`}
                  >
                    {backendStatus.status.charAt(0).toUpperCase() + backendStatus.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              {backendStatus.port && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Port:</span>
                  <Badge variant="secondary">{backendStatus.port}</Badge>
                </div>
              )}
              
              {backendStatus.uptime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Uptime:</span>
                  <span className="text-sm text-gray-400">{backendStatus.uptime}</span>
                </div>
              )}
            </div>

            {/* Error Display */}
            {(backendStatus.status === 'error' || (backendStatus.status === 'stopped' && backendStatus.error)) && backendStatus.error && (
              <Alert className="border-red-500 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  <div className="space-y-1">
                    <p className="font-medium">Connection Error:</p>
                    <p className="text-xs">{backendStatus.error}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Control Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {backendStatus.status === 'stopped' || backendStatus.status === 'error' ? (
                <Button
                  onClick={startBackend}
                  disabled={isLoading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Start
                </Button>
              ) : backendStatus.status === 'running' ? (
                <Button
                  onClick={stopBackend}
                  disabled={isLoading}
                  size="sm"
                  variant="destructive"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  Stop
                </Button>
              ) : (
                <Button disabled size="sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {backendStatus.status === 'starting' ? 'Starting...' : 'Stopping...'}
                </Button>
              )}
              
              <Button
                onClick={restartBackend}
                disabled={isLoading || backendStatus.status === 'stopped'}
                size="sm"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>
              
              <Button
                onClick={refreshStatus}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={testConnection}
                size="sm"
                variant="outline"
              >
                <Server className="h-4 w-4 mr-2" />
                Debug
              </Button>
            </div>

            {/* Frontend & RAG Service Controls */}
            <div className="space-y-2">
              <div className="text-xs text-gray-400 font-medium">Service Controls</div>
              
              {/* Frontend Restart Button */}
              <Button
                onClick={() => {
                  // Clear browser cache and reload
                  if ('caches' in window) {
                    caches.keys().then(names => {
                      names.forEach(name => caches.delete(name));
                    });
                  }
                  
                  // Clear localStorage
                  localStorage.clear();
                  sessionStorage.clear();
                  
                  // Show restart message
                  alert('🚀 Frontend cache cleared!\n\nTo complete the restart:\n1. Stop the dev server (Ctrl+C)\n2. Run: ./restart-frontend-complete.sh\n3. Or manually: npm run dev\n\nPage will reload in 2 seconds...');
                  
                  // Force reload after delay
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                }}
                size="sm"
                variant="outline"
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restart Frontend (Clear Cache)
              </Button>
              
              {/* RAG Service Controls */}
              {backendStatus.status === 'running' && (
                <Button
                  onClick={restartRAGService}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Documents & Restart RAG
                </Button>
              )}
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Frontend restart clears cache and reloads fresh code</p>
                {backendStatus.status === 'running' && (
                  <p>• RAG restart clears all uploaded documents</p>
                )}
              </div>
            </div>

            <div className="hidden">
              {/* Spacer for grid layout */}
            </div>

            {/* Quick Start Instructions */}
            {backendStatus.status === 'stopped' && (
              <div className="text-xs text-gray-400 space-y-1">
                <p>Manual start options:</p>
                <div className="bg-gray-900 p-2 rounded font-mono text-xs space-y-1">
                  <p>cd backend</p>
                  <p>python simple_api.py</p>
                  <p className="text-gray-500"># or</p>
                  <p>uvicorn simple_api:app --host 0.0.0.0 --port 5002</p>
                </div>
              </div>
            )}

            {/* Connection Info */}
            {backendStatus.status === 'running' && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400">
                  <p>Backend running at:</p>
                  <code className="bg-gray-900 px-2 py-1 rounded">
                    http://localhost:{backendStatus.port}
                  </code>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">Connected and responding</span>
                </div>
              </div>
            )}

            {/* Offline Info */}
            {backendStatus.status === 'stopped' && !backendStatus.error && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-400">Backend is offline</span>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Expected at: <code className="bg-gray-900 px-1 rounded">http://localhost:{config.backend_port}</code></p>
                  <p className="mt-1">This manages the Python API backend, not Ollama directly</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4">
            {/* Timeout Configuration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-300">Timeout Settings</h4>
                <Button
                  onClick={saveConfig}
                  disabled={configLoading}
                  size="sm"
                  variant="outline"
                >
                  {configLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="generation-timeout" className="text-xs text-gray-400">
                    Generation Timeout (seconds)
                  </Label>
                  <Input
                    id="generation-timeout"
                    type="number"
                    value={config.timeouts.generation_timeout}
                    onChange={(e) => updateTimeout('generation_timeout', parseInt(e.target.value) || 300)}
                    className="h-8 text-xs"
                    min="30"
                    max="1800"
                  />
                  <p className="text-xs text-gray-500">How long to wait for AI responses</p>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="health-timeout" className="text-xs text-gray-400">
                    Health Check Timeout (seconds)
                  </Label>
                  <Input
                    id="health-timeout"
                    type="number"
                    value={config.timeouts.health_check_timeout}
                    onChange={(e) => updateTimeout('health_check_timeout', parseInt(e.target.value) || 5)}
                    className="h-8 text-xs"
                    min="1"
                    max="30"
                  />
                  <p className="text-xs text-gray-500">Backend health check timeout</p>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="model-pull-timeout" className="text-xs text-gray-400">
                    Model Pull Timeout (seconds)
                  </Label>
                  <Input
                    id="model-pull-timeout"
                    type="number"
                    value={config.timeouts.model_pull_timeout}
                    onChange={(e) => updateTimeout('model_pull_timeout', parseInt(e.target.value) || 300)}
                    className="h-8 text-xs"
                    min="60"
                    max="3600"
                  />
                  <p className="text-xs text-gray-500">Timeout for downloading models</p>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="command-timeout" className="text-xs text-gray-400">
                    Command Timeout (seconds)
                  </Label>
                  <Input
                    id="command-timeout"
                    type="number"
                    value={config.timeouts.command_timeout}
                    onChange={(e) => updateTimeout('command_timeout', parseInt(e.target.value) || 60)}
                    className="h-8 text-xs"
                    min="10"
                    max="300"
                  />
                  <p className="text-xs text-gray-500">General command execution timeout</p>
                </div>
              </div>
              
              <Separator />
              
              {/* Connection Settings */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Connection Settings</h4>
                
                <div className="space-y-1">
                  <Label htmlFor="ollama-host" className="text-xs text-gray-400">
                    Ollama Host
                  </Label>
                  <Input
                    id="ollama-host"
                    value={config.ollama_host}
                    onChange={(e) => setConfig(prev => ({ ...prev, ollama_host: e.target.value }))}
                    className="h-8 text-xs"
                    placeholder="http://localhost:11434"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="backend-port" className="text-xs text-gray-400">
                    Backend Port
                  </Label>
                  <Input
                    id="backend-port"
                    type="number"
                    value={config.backend_port}
                    onChange={(e) => setConfig(prev => ({ ...prev, backend_port: parseInt(e.target.value) || 5002 }))}
                    className="h-8 text-xs"
                    min="1000"
                    max="65535"
                  />
                </div>
              </div>
              
              {/* Preset Configurations */}
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Quick Presets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      timeouts: {
                        generation_timeout: 120,
                        health_check_timeout: 3,
                        model_pull_timeout: 180,
                        command_timeout: 30
                      }
                    }))}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Fast
                  </Button>
                  <Button
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      timeouts: {
                        generation_timeout: 600,
                        health_check_timeout: 10,
                        model_pull_timeout: 900,
                        command_timeout: 120
                      }
                    }))}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Slow/Stable
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};