import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server, Play, Square, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface BackendStatus {
  status: string;
  service?: string;
  ollama_host?: string;
}

export const BackendControl: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      // Check backend health
      const healthResponse = await apiClient.checkHealth();
      setBackendStatus(healthResponse);

      // Check Ollama status
      try {
        const ollamaResponse = await apiClient.getOllamaStatus();
        setOllamaStatus(ollamaResponse);
      } catch (ollamaError) {
        setOllamaStatus({ status: 'error', message: 'Ollama not available' });
      }

      setLastChecked(new Date());
    } catch (error) {
      setBackendStatus({ status: 'error' });
      setOllamaStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return <Badge variant="default" className="bg-green-600">Running</Badge>;
      case 'error':
      case 'not_running':
        return <Badge variant="destructive">Offline</Badge>;
      case 'timeout':
        return <Badge variant="secondary">Timeout</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
      case 'not_running':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Server className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Server size={18} />
          Backend Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Backend Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {backendStatus && getStatusIcon(backendStatus.status)}
              <span className="text-gray-300 text-sm">Backend API</span>
            </div>
            {backendStatus && getStatusBadge(backendStatus.status)}
          </div>
          
          {/* Ollama Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ollamaStatus && getStatusIcon(ollamaStatus.status)}
              <span className="text-gray-300 text-sm">Ollama Service</span>
            </div>
            {ollamaStatus && getStatusBadge(ollamaStatus.status)}
          </div>

          {/* Model Count */}
          {ollamaStatus && ollamaStatus.model_count !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Available Models</span>
              <Badge variant="outline" className="text-gray-300">
                {ollamaStatus.model_count}
              </Badge>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="space-y-2">
          <Button
            onClick={checkStatus}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh Status
          </Button>
        </div>

        {/* Last Checked */}
        {lastChecked && (
          <div className="text-xs text-gray-400 text-center">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}

        {/* Connection Info */}
        <div className="text-xs text-gray-400 space-y-1">
          <div>Backend: localhost:5002</div>
          <div>Ollama: localhost:11434</div>
        </div>

        {/* Status Messages */}
        {ollamaStatus && ollamaStatus.message && (
          <div className="text-xs text-gray-400 p-2 bg-gray-700/50 rounded">
            {ollamaStatus.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
};