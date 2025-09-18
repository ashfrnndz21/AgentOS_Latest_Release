import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Server,
  Activity,
  HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ollamaService, OllamaStatus as OllamaStatusType } from '@/lib/services/OllamaService';

interface OllamaStatusProps {
  onStatusChange?: (status: OllamaStatusType) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const OllamaStatus: React.FC<OllamaStatusProps> = ({
  onStatusChange,
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [status, setStatus] = useState<OllamaStatusType>({
    status: 'not_running',
    message: 'Checking Ollama status...'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const newStatus = await ollamaService.getStatus();
      setStatus(newStatus);
      setLastChecked(new Date());
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('Failed to check Ollama status:', error);
      setStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkStatus();
    
    if (autoRefresh) {
      const interval = setInterval(checkStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw size={16} className="animate-spin text-blue-400" />;
    }
    
    switch (status.status) {
      case 'running':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'not_running':
      case 'timeout':
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <Server size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'running': return 'text-green-400';
      case 'not_running': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'timeout': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case 'running':
        return <Badge className="bg-green-500/20 text-green-400">Running</Badge>;
      case 'not_running':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Not Running</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400">Error</Badge>;
      case 'timeout':
        return <Badge className="bg-orange-500/20 text-orange-400">Timeout</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-lg">Ollama Status</span>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Service Status</span>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {status.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          {status.host && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Host</span>
              <span className="text-sm text-gray-300">{status.host}</span>
            </div>
          )}
          
          {status.model_count !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Models Available</span>
              <span className="text-sm text-gray-300">{status.model_count}</span>
            </div>
          )}
          
          {lastChecked && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Last Checked</span>
              <span className="text-sm text-gray-300">
                {lastChecked.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Status Message */}
        {status.message && (
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-300">{status.message}</p>
            {status.suggestion && (
              <p className="text-sm text-blue-400 mt-1">💡 {status.suggestion}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={checkStatus}
            disabled={isLoading}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin mr-2' : 'mr-2'} />
            Refresh
          </Button>
          
          {status.status === 'not_running' && (
            <Button
              size="sm"
              onClick={() => window.open('https://ollama.ai', '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink size={14} className="mr-2" />
              Install Ollama
            </Button>
          )}
          
          {status.status === 'running' && (
            <Button
              size="sm"
              onClick={() => window.open('http://localhost:11434', '_blank')}
              variant="outline"
              className="border-green-600 text-green-400 hover:bg-green-600/20"
            >
              <ExternalLink size={14} className="mr-2" />
              Open Ollama
            </Button>
          )}
        </div>

        {/* Quick Stats for Running Status */}
        {status.status === 'running' && status.models && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-700">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-400">
                {status.models.length}
              </div>
              <div className="text-xs text-gray-400">Models</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-400">
                {status.models.reduce((acc, model) => acc + (model.size || 0), 0) / (1024**3) | 0}GB
              </div>
              <div className="text-xs text-gray-400">Total Size</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-400">
                <Activity size={16} className="inline" />
              </div>
              <div className="text-xs text-gray-400">Active</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};