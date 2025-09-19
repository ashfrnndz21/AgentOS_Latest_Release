import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Settings, 
  Monitor, 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Download,
  Trash2,
  Zap,
  Network,
  Bot,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WorkflowState {
  isRunning: boolean;
  isPaused: boolean;
  nodes: number;
  connections: number;
  executionTime: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'unhealthy' | 'unreachable';
  lastMessage?: string;
  responseTime?: number;
  messageCount: number;
}

interface ContextualSidebarProps {
  workflowState: WorkflowState;
  agentStatuses: AgentStatus[];
  onRunWorkflow: () => void;
  onPauseWorkflow: () => void;
  onStopWorkflow: () => void;
  onResetWorkflow: () => void;
  onSaveWorkflow: () => void;
  onExportWorkflow: () => void;
  onClearCanvas: () => void;
  onConfigureAgent: (agentId: string) => void;
}

export const ContextualSidebar: React.FC<ContextualSidebarProps> = ({
  workflowState,
  agentStatuses,
  onRunWorkflow,
  onPauseWorkflow,
  onStopWorkflow,
  onResetWorkflow,
  onSaveWorkflow,
  onExportWorkflow,
  onClearCanvas,
  onConfigureAgent
}) => {
  const [activeTab, setActiveTab] = useState<'control' | 'monitor' | 'communication'>('control');
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  // Simulate execution log updates
  useEffect(() => {
    if (workflowState.isRunning) {
      const interval = setInterval(() => {
        setExecutionLog(prev => [
          ...prev.slice(-9), // Keep last 10 entries
          `${new Date().toLocaleTimeString()}: Workflow step ${prev.length + 1}`
        ]);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [workflowState.isRunning]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'unreachable':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'unhealthy':
        return 'text-yellow-500';
      case 'unreachable':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="w-80 bg-slate-900/50 backdrop-blur-sm border-l border-slate-600/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-600/30">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-slate-100">Workflow Control</h2>
          <Badge 
            variant={workflowState.status === 'running' ? 'default' : 'secondary'}
            className={workflowState.status === 'running' ? 'bg-green-600' : ''}
          >
            {workflowState.status.toUpperCase()}
          </Badge>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Bot className="h-3 w-3" />
            <span>{workflowState.nodes} Agents</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Network className="h-3 w-3" />
            <span>{workflowState.connections} Connections</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/60 m-4">
            <TabsTrigger value="control" className="text-xs">Control</TabsTrigger>
            <TabsTrigger value="monitor" className="text-xs">Monitor</TabsTrigger>
            <TabsTrigger value="communication" className="text-xs">A2A</TabsTrigger>
          </TabsList>

          {/* Control Tab */}
          <TabsContent value="control" className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Primary Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-300">Execution</h3>
              <div className="grid grid-cols-2 gap-2">
                {workflowState.isRunning ? (
                  <>
                    <Button
                      onClick={onPauseWorkflow}
                      disabled={workflowState.isPaused}
                      className="bg-yellow-600 hover:bg-yellow-700"
                      size="sm"
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                    <Button
                      onClick={onStopWorkflow}
                      className="bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={onRunWorkflow}
                    disabled={workflowState.nodes === 0}
                    className="bg-green-600 hover:bg-green-700 col-span-2"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Run Workflow
                  </Button>
                )}
              </div>
            </div>

            {/* Workflow Management */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-300">Management</h3>
              <div className="space-y-2">
                <Button
                  onClick={onSaveWorkflow}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Workflow
                </Button>
                <Button
                  onClick={onExportWorkflow}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={onResetWorkflow}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={onClearCanvas}
                  variant="outline"
                  className="w-full justify-start text-red-400 border-red-600 hover:bg-red-600/10"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Canvas
                </Button>
              </div>
            </div>

            {/* Execution Progress */}
            {workflowState.isRunning && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-300">Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Execution Time</span>
                    <span>{workflowState.executionTime}s</span>
                  </div>
                  <Progress value={Math.min((workflowState.executionTime / 60) * 100, 100)} className="h-2" />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="flex-1 overflow-y-auto p-4 space-y-4">
            <h3 className="text-sm font-medium text-slate-300">Agent Status</h3>
            
            {agentStatuses.length === 0 ? (
              <div className="text-center py-8">
                <Monitor className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No agents on canvas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {agentStatuses.map((agent) => (
                  <Card key={agent.id} className="p-3 bg-slate-800/40 border-slate-600/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-slate-100">{agent.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(agent.status)}
                        <span className={`text-xs ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Messages</span>
                        <span>{agent.messageCount}</span>
                      </div>
                      {agent.responseTime && (
                        <div className="flex justify-between">
                          <span>Response Time</span>
                          <span>{agent.responseTime}ms</span>
                        </div>
                      )}
                    </div>
                    
                    {agent.lastMessage && (
                      <div className="mt-2 p-2 bg-slate-700/50 rounded text-xs text-slate-300">
                        <div className="truncate">{agent.lastMessage}</div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="flex-1 overflow-y-auto p-4 space-y-4">
            <h3 className="text-sm font-medium text-slate-300">A2A Communication</h3>
            
            {executionLog.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No communication yet</p>
                <p className="text-slate-500 text-xs mt-1">Run workflow to see A2A messages</p>
              </div>
            ) : (
              <div className="space-y-2">
                {executionLog.map((log, index) => (
                  <div key={index} className="p-2 bg-slate-800/40 rounded text-xs text-slate-300">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-600/30">
        <div className="text-xs text-slate-500 text-center">
          Multi-Agent Orchestration Platform
        </div>
      </div>
    </div>
  );
};










