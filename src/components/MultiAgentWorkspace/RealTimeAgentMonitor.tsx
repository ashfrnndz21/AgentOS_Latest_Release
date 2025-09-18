import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap, 
  Settings, 
  Brain,
  Wrench,
  Search,
  Calculator,
  Globe
} from 'lucide-react';

interface AgentProgress {
  agent_id: string;
  stage: string;
  details: string;
  progress: number;
  timestamp: string;
  tools_used: string[];
}

interface RealTimeAgentMonitorProps {
  agentId: string | null;
  isVisible: boolean;
  onClose: () => void;
}

const STAGE_ICONS: { [key: string]: React.ReactNode } = {
  'initializing': <Loader2 className="h-4 w-4 animate-spin text-blue-400" />,
  'config_loaded': <Settings className="h-4 w-4 text-green-400" />,
  'loading_tools': <Wrench className="h-4 w-4 text-yellow-400" />,
  'executing': <Brain className="h-4 w-4 text-purple-400" />,
  'processing_response': <Clock className="h-4 w-4 text-orange-400" />,
  'detecting_tools': <Search className="h-4 w-4 text-cyan-400" />,
  'completed': <CheckCircle className="h-4 w-4 text-green-400" />,
  'error': <AlertCircle className="h-4 w-4 text-red-400" />
};

const STAGE_LABELS: { [key: string]: string } = {
  'initializing': 'Initializing',
  'config_loaded': 'Configuration Loaded',
  'loading_tools': 'Loading Tools',
  'executing': 'Executing',
  'processing_response': 'Processing Response',
  'detecting_tools': 'Analyzing Tools',
  'completed': 'Completed',
  'error': 'Error'
};

const TOOL_ICONS: { [key: string]: React.ReactNode } = {
  'calculator': <Calculator className="h-3 w-3" />,
  'web_search': <Search className="h-3 w-3" />,
  'think': <Brain className="h-3 w-3" />,
  'current_time': <Clock className="h-3 w-3" />,
  'weather_api': <Globe className="h-3 w-3" />,
  'default': <Wrench className="h-3 w-3" />
};

export function RealTimeAgentMonitor({ agentId, isVisible, onClose }: RealTimeAgentMonitorProps) {
  const [progress, setProgress] = useState<AgentProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<AgentProgress[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isVisible || !agentId) return;

    // Connect to WebSocket
    const wsUrl = 'ws://localhost:5006';
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'agent_progress') {
          setProgress(data);
          setLogs(prev => [...prev, data].slice(-10)); // Keep last 10 logs
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isVisible, agentId]);

  if (!isVisible) return null;

  const getToolIcon = (tool: string) => {
    return TOOL_ICONS[tool] || TOOL_ICONS.default;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <Card className="bg-gray-900 border-gray-700 text-white shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              Agent Execution Monitor
              {isConnected ? (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              ) : (
                <div className="w-2 h-2 bg-red-400 rounded-full" />
              )}
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Progress */}
          {progress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {STAGE_ICONS[progress.stage]}
                  <span className="text-sm font-medium">
                    {STAGE_LABELS[progress.stage] || progress.stage}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {progress.progress}%
                </Badge>
              </div>
              
              <Progress 
                value={progress.progress} 
                className="h-2 bg-gray-700"
              />
              
              <p className="text-xs text-gray-400">
                {progress.details}
              </p>
              
              {/* Tools Used */}
              {progress.tools_used && progress.tools_used.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Tools used:</span>
                  <div className="flex gap-1">
                    {progress.tools_used.map((tool, index) => (
                      <div key={index} className="flex items-center gap-1 px-2 py-1 bg-purple-900/20 rounded text-xs">
                        {getToolIcon(tool)}
                        <span>{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Connection Status */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-gray-500">
              Agent: {agentId?.slice(0, 8)}...
            </span>
          </div>

          {/* Recent Logs */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-400">Recent Activity</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {logs.slice(-5).map((log, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">{formatTime(log.timestamp)}</span>
                    <span className="text-gray-400">{log.details}</span>
                    {log.tools_used && log.tools_used.length > 0 && (
                      <div className="flex gap-1">
                        {log.tools_used.map((tool, i) => (
                          <div key={i} className="text-purple-400">
                            {getToolIcon(tool)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


