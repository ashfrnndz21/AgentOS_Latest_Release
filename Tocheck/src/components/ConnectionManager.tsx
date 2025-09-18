/**
 * Connection Manager Component
 * Provides easy setup, reset, and troubleshooting for all connections
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  Network,
  Server,
  Terminal
} from 'lucide-react';
import { useAppConfig } from '@/config/appConfig';

interface ConnectionStatus {
  backend: { status: 'connected' | 'disconnected' | 'checking'; error?: string };
  ollama: { status: 'connected' | 'disconnected' | 'checking'; error?: string };
}

export const ConnectionManager: React.FC = () => {
  const { 
    config, 
    updateBackendConfig, 
    updateOllamaConfig, 
    resetToDefaults, 
    autoDetectBackend,
    testBackendConnection,
    testOllamaConnection 
  } = useAppConfig();

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    backend: { status: 'checking' },
    ollama: { status: 'checking' }
  });

  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempConfig, setTempConfig] = useState({
    backendHost: config.backend.host,
    backendPort: config.backend.port.toString(),
    ollamaHost: config.ollama.host,
    ollamaPort: config.ollama.port.toString()
  });

  // Test all connections
  const testAllConnections = async () => {
    setConnectionStatus(prev => ({
      backend: { status: 'checking' },
      ollama: { status: 'checking' }
    }));

    // Test backend
    const backendResult = await testBackendConnection();
    setConnectionStatus(prev => ({
      ...prev,
      backend: {
        status: backendResult.success ? 'connected' : 'disconnected',
        error: backendResult.error
      }
    }));

    // Test Ollama
    const ollamaResult = await testOllamaConnection();
    setConnectionStatus(prev => ({
      ...prev,
      ollama: {
        status: ollamaResult.success ? 'connected' : 'disconnected',
        error: ollamaResult.error
      }
    }));
  };

  // Auto-detect and setup
  const handleAutoSetup = async () => {
    setIsAutoDetecting(true);
    
    try {
      const backendDetected = await autoDetectBackend();
      
      if (backendDetected) {
        await testAllConnections();
      }
    } finally {
      setIsAutoDetecting(false);
    }
  };

  // Apply manual configuration
  const applyManualConfig = () => {
    updateBackendConfig(tempConfig.backendHost, parseInt(tempConfig.backendPort));
    updateOllamaConfig(tempConfig.ollamaHost, parseInt(tempConfig.ollamaPort));
    testAllConnections();
  };

  // Reset everything
  const handleReset = () => {
    resetToDefaults();
    setTempConfig({
      backendHost: 'localhost',
      backendPort: '5002',
      ollamaHost: 'localhost',
      ollamaPort: '11434'
    });
    testAllConnections();
  };

  // Initial connection test
  useEffect(() => {
    testAllConnections();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge className="bg-green-500">Connected</Badge>;
      case 'disconnected': return <Badge variant="destructive">Disconnected</Badge>;
      case 'checking': return <Badge variant="secondary">Checking...</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const allConnected = connectionStatus.backend.status === 'connected' && 
                      connectionStatus.ollama.status === 'connected';

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Network className="h-5 w-5" />
          Connection Manager
          {allConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white">Backend</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(connectionStatus.backend.status)}
              {getStatusBadge(connectionStatus.backend.status)}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-green-400" />
              <span className="text-sm text-white">Ollama</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(connectionStatus.ollama.status)}
              {getStatusBadge(connectionStatus.ollama.status)}
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {(connectionStatus.backend.error || connectionStatus.ollama.error) && (
          <div className="space-y-2">
            {connectionStatus.backend.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">
                  <strong>Backend Error:</strong> {connectionStatus.backend.error}
                </p>
              </div>
            )}
            {connectionStatus.ollama.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">
                  <strong>Ollama Error:</strong> {connectionStatus.ollama.error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleAutoSetup}
            disabled={isAutoDetecting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAutoDetecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Auto-Detecting...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Auto Setup
              </>
            )}
          </Button>
          
          <Button
            onClick={testAllConnections}
            variant="outline"
            className="border-gray-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Connections
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-gray-600"
          >
            Reset to Defaults
          </Button>
          
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced
          </Button>
        </div>

        {/* Advanced Configuration */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
            <h3 className="text-sm font-medium text-white">Manual Configuration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-300">Backend Host</Label>
                <Input
                  value={tempConfig.backendHost}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, backendHost: e.target.value }))}
                  className="h-8 text-xs bg-gray-800 border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-gray-300">Backend Port</Label>
                <Input
                  type="number"
                  value={tempConfig.backendPort}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, backendPort: e.target.value }))}
                  className="h-8 text-xs bg-gray-800 border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-gray-300">Ollama Host</Label>
                <Input
                  value={tempConfig.ollamaHost}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, ollamaHost: e.target.value }))}
                  className="h-8 text-xs bg-gray-800 border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-gray-300">Ollama Port</Label>
                <Input
                  type="number"
                  value={tempConfig.ollamaPort}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, ollamaPort: e.target.value }))}
                  className="h-8 text-xs bg-gray-800 border-gray-600"
                />
              </div>
            </div>
            
            <Button
              onClick={applyManualConfig}
              size="sm"
              className="w-full"
            >
              Apply Configuration
            </Button>
          </div>
        )}

        {/* Current Configuration Display */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>Backend: {config.backend.baseUrl}</p>
          <p>Ollama: {config.ollama.baseUrl}</p>
        </div>

        {/* Success Message */}
        {allConnected && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">
              ✅ All connections established! Your system is ready to use.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};