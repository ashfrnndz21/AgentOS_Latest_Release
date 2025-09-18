import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database,
  Scissors,
  Zap,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useProcessingLogs, ProcessingLog } from '@/hooks/useProcessingLogs';

interface DocumentProcessingLogsProps {
  documents: any[];
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export const DocumentProcessingLogs: React.FC<DocumentProcessingLogsProps> = ({
  documents,
  isVisible = true,
  onToggleVisibility
}) => {
  const { logs, isLoading, error, refreshLogs, clearLogs } = useProcessingLogs();
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle scroll detection
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
    
    if (!isAtBottom && isAutoScroll) {
      setUserScrolledUp(true);
    } else if (isAtBottom && userScrolledUp) {
      setUserScrolledUp(false);
    }
  }, [isAutoScroll, userScrolledUp]);

  // Auto-scroll to bottom when new logs arrive (only if user hasn't scrolled up)
  useEffect(() => {
    if (isAutoScroll && !userScrolledUp && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isAutoScroll, userScrolledUp]);

  const getStageIcon = (stage: ProcessingLog['stage']) => {
    switch (stage) {
      case 'upload': return <FileText className="h-4 w-4" />;
      case 'loading': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'chunking': return <Scissors className="h-4 w-4" />;
      case 'embedding': return <Zap className="h-4 w-4" />;
      case 'indexing': return <Database className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: ProcessingLog['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getStageColor = (stage: ProcessingLog['stage']) => {
    switch (stage) {
      case 'ready': return 'bg-green-500/20 text-green-300';
      case 'error': return 'bg-red-500/20 text-red-300';
      case 'loading': case 'chunking': case 'embedding': case 'indexing': 
        return 'bg-blue-500/20 text-blue-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };



  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleVisibility}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
      >
        <Eye className="h-4 w-4 mr-2" />
        Show Processing Logs
      </Button>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            Document Processing Logs
            {logs.length > 0 && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                {logs.length} entries
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshLogs}
              disabled={isLoading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAutoScroll(!isAutoScroll);
                setUserScrolledUp(false);
              }}
              className={`border-gray-600 hover:bg-gray-700 ${
                isAutoScroll && !userScrolledUp 
                  ? 'text-green-400 border-green-600' 
                  : 'text-gray-300'
              }`}
            >
              {isAutoScroll && !userScrolledUp ? 'Auto-scroll ON' : 'Auto-scroll PAUSED'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {onToggleVisibility && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleVisibility}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="max-h-96 overflow-y-auto space-y-2 bg-gray-950 rounded-lg p-4"
          onScroll={handleScroll}
        >
          {error && (
            <div className="text-center text-red-400 py-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Error loading logs: {error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshLogs}
                className="mt-2 border-red-600 text-red-400 hover:bg-red-900/20"
              >
                Retry
              </Button>
            </div>
          )}
          
          {!error && logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No processing logs yet</p>
              <p className="text-sm">Upload documents to see real-time processing status</p>
              {isLoading && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Loading logs...</span>
                </div>
              )}
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-2 rounded bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                <div className={`flex-shrink-0 ${getTypeColor(log.type)}`}>
                  {getStageIcon(log.stage)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs ${getStageColor(log.stage)}`}>
                      {log.stage.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatTime(log.timestamp)}
                    </span>
                    {log.document_name && (
                      <span className="text-xs text-gray-500 truncate">
                        {log.document_name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-200">{log.message}</p>
                  {log.details && (
                    <div className="mt-1 text-xs text-gray-400 font-mono bg-gray-900/50 p-2 rounded">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </CardContent>
    </Card>
  );
};