/**
 * Connection Status Component
 * Shows current connection status and provides quick reconnect
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useAppConfig } from '@/config/appConfig';
import { checkConnections } from '@/lib/apiClient';

interface ConnectionStatusProps {
  showDetails?: boolean;
  showControls?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showDetails = false,
  showControls = true,
  className = ""
}) => {
  const { config, autoDetectBackend } = useAppConfig();
  const [status, setStatus] = useState({
    backend: false,
    ollama: false,
    checking: false,
    lastCheck: null as Date | null
  });

  const checkStatus = async () => {
    setStatus(prev => ({ ...prev, checking: true }));
    
    try {
      const result = await checkConnections();
      setStatus({
        backend: result.backend,
        ollama: result.ollama,
        checking: false,
        lastCheck: new Date()
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        backend: false,
        ollama: false,
        checking: false,
        lastCheck: new Date()
      }));
    }
  };

  const handleAutoFix = async () => {
    setStatus(prev => ({ ...prev, checking: true }));
    await autoDetectBackend();
    await checkStatus();
  };

  useEffect(() => {
    checkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const allConnected = status.backend && status.ollama;
  const anyDisconnected = !status.backend || !status.ollama;

  const getStatusIcon = () => {
    if (status.checking) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />;
    }
    if (allConnected) {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
    if (anyDisconnected) {
      return <XCircle className="h-4 w-4 text-red-400" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
  };

  const getStatusText = () => {
    if (status.checking) return "Checking...";
    if (allConnected) return "Connected";
    if (!status.backend && !status.ollama) return "Disconnected";
    if (!status.backend) return "Backend Offline";
    if (!status.ollama) return "Ollama Offline";
    return "Partial Connection";
  };

  const getStatusColor = () => {
    if (allConnected) return "bg-green-500";
    if (anyDisconnected) return "bg-red-500";
    return "bg-yellow-500";
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <Badge className={getStatusColor()}>
          {getStatusText()}
        </Badge>
      </div>

      {/* Detailed Status */}
      {showDetails && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span className={status.backend ? "text-green-400" : "text-red-400"}>
            Backend
          </span>
          <span>•</span>
          <span className={status.ollama ? "text-green-400" : "text-red-400"}>
            Ollama
          </span>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={checkStatus}
            disabled={status.checking}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${status.checking ? 'animate-spin' : ''}`} />
          </Button>
          
          {anyDisconnected && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAutoFix}
              disabled={status.checking}
              className="h-6 px-2 text-xs"
            >
              Auto-Fix
            </Button>
          )}
        </div>
      )}

      {/* Last Check Time */}
      {status.lastCheck && showDetails && (
        <span className="text-xs text-gray-500">
          {status.lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};