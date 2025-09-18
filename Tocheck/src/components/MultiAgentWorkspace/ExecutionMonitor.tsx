import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Square, RotateCcw, AlertCircle, CheckCircle, 
  Clock, Activity, Zap 
} from 'lucide-react';
import { workflowService, WorkflowExecution } from '@/lib/services/WorkflowService';

interface ExecutionMonitorProps {
  sessionId: string | null;
  onClose: () => void;
}

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  sessionId,
  onClose
}) => {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchStatus = async () => {
      try {
        setLoading(true);
        const status = await workflowService.getExecutionStatus(sessionId);
        setExecution(status);
      } catch (error) {
        console.error('Failed to fetch execution status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchStatus, 2000);
    
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!sessionId) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Execution Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">No active execution</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    if (!execution) return <Clock className="w-4 h-4" />;
    
    switch (execution.status) {
      case 'running':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'paused':
        return <Square className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    if (!execution) return 'bg-slate-600';
    
    switch (execution.status) {
      case 'running':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-green-600';
      case 'failed':
        return 'bg-red-600';
      case 'paused':
        return 'bg-yellow-600';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Execution Monitor
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
            <span className="text-sm text-slate-400">Loading...</span>
          </div>
        ) : execution ? (
          <>
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="font-medium capitalize">{execution.status}</span>
              </div>
              <Badge className={getStatusColor()}>
                {execution.status}
              </Badge>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{execution.progress || 0}%</span>
              </div>
              <Progress value={execution.progress || 0} className="w-full" />
            </div>

            {/* Session Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Session ID:</span>
                <span className="font-mono text-xs">{execution.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Workflow ID:</span>
                <span className="font-mono text-xs">{execution.workflow_id}</span>
              </div>
            </div>

            {/* Results or Error */}
            {execution.status === 'completed' && execution.results && (
              <div className="p-3 bg-green-900/20 border border-green-700/30 rounded">
                <h4 className="text-sm font-medium text-green-300 mb-2">Results</h4>
                <pre className="text-xs text-green-200 overflow-auto max-h-32">
                  {JSON.stringify(execution.results, null, 2)}
                </pre>
              </div>
            )}

            {execution.status === 'failed' && execution.error && (
              <div className="p-3 bg-red-900/20 border border-red-700/30 rounded">
                <h4 className="text-sm font-medium text-red-300 mb-2">Error</h4>
                <p className="text-xs text-red-200">{execution.error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {execution.status === 'running' && (
                <Button size="sm" variant="outline" className="flex-1">
                  <Square className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              
              {(execution.status === 'completed' || execution.status === 'failed') && (
                <Button size="sm" variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
              )}
            </div>
          </>
        ) : (
          <p className="text-slate-400">Failed to load execution status</p>
        )}
      </CardContent>
    </Card>
  );
};