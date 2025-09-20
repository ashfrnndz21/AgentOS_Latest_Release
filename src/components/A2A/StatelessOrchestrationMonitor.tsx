import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Bot, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MemoryStick,
  Activity,
  Zap
} from 'lucide-react';

interface StatelessOrchestrationResult {
  success: boolean;
  session_id: string;
  selected_agent?: string;
  query_type?: string;
  execution_time?: number;
  result?: any;
  error?: string;
}

interface SessionInfo {
  session_id: string;
  created_at: string;
  query: string;
  status: string;
  duration: number;
}

interface HealthInfo {
  status: string;
  memory_usage: string;
  active_sessions: number;
  model_health: Record<string, boolean>;
  timestamp: string;
}

export const StatelessOrchestrationMonitor: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<StatelessOrchestrationResult | null>(null);
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthInfo = async () => {
    try {
      const response = await fetch('http://localhost:5013/api/stateless-orchestration/health');
      const data = await response.json();
      setHealthInfo(data);
    } catch (error) {
      console.error('Failed to fetch health info:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:5013/api/stateless-orchestration/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const processQuery = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5013/api/stateless-orchestration/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();
      setResult(data);
      
      if (!data.success) {
        setError(data.error || 'Unknown error occurred');
      }

      // Refresh health and sessions info
      await fetchHealthInfo();
      await fetchSessions();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error');
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanupSession = async (sessionId: string) => {
    try {
      await fetch(`http://localhost:5013/api/stateless-orchestration/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      await fetchSessions();
    } catch (error) {
      console.error('Failed to cleanup session:', error);
    }
  };

  useEffect(() => {
    fetchHealthInfo();
    fetchSessions();
    
    const interval = setInterval(() => {
      fetchHealthInfo();
      fetchSessions();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'active':
        return <Activity className="h-4 w-4 text-blue-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'failed':
        return 'bg-red-600';
      case 'active':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-400" />
            Stateless Orchestration
          </h2>
          <p className="text-gray-400 mt-1">
            Memory-efficient, stateless agent orchestration with automatic cleanup
          </p>
        </div>
        
        {/* Health Status */}
        {healthInfo && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">
                Memory: {healthInfo.memory_usage}
              </span>
            </div>
            <Badge variant="outline" className="border-green-400 text-green-400">
              {healthInfo.active_sessions} active sessions
            </Badge>
          </div>
        )}
      </div>

      {/* Query Input */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-400" />
            Query Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query (e.g., 'I am not feeling well - what should I do?')"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && processQuery()}
            />
            <Button
              onClick={processQuery}
              disabled={isProcessing || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Process
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="bg-red-900/20 border-red-500/30">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Result Display */}
      {result && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              Processing Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Session ID</label>
                <p className="text-white font-mono text-xs">{result.session_id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Selected Agent</label>
                <p className="text-white">{result.selected_agent || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Query Type</label>
                <p className="text-white">{result.query_type || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Execution Time</label>
                <p className="text-white">{result.execution_time?.toFixed(2)}s</p>
              </div>
            </div>

            {result.success && result.result && (
              <div>
                <label className="text-sm text-gray-400">Agent Response</label>
                <div className="bg-gray-700 p-3 rounded-lg mt-1">
                  <pre className="text-white text-sm whitespace-pre-wrap">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {!result.success && result.error && (
              <div>
                <label className="text-sm text-gray-400">Error</label>
                <div className="bg-red-900/20 p-3 rounded-lg mt-1 border border-red-500/30">
                  <p className="text-red-200">{result.error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Active Sessions ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No active sessions</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(session.status)}
                    <div>
                      <p className="text-white text-sm font-mono">
                        {session.session_id.substring(0, 8)}...
                      </p>
                      <p className="text-gray-400 text-xs">
                        {session.query} • {session.duration.toFixed(1)}s ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cleanupSession(session.session_id)}
                      className="text-xs"
                    >
                      Cleanup
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Health */}
      {healthInfo && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-400" />
              Model Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(healthInfo.model_health).map(([model, isHealthy]) => (
                <div key={model} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{model}</span>
                  <Badge
                    className={isHealthy ? 'bg-green-600' : 'bg-red-600'}
                  >
                    {isHealthy ? 'Healthy' : 'Unhealthy'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
