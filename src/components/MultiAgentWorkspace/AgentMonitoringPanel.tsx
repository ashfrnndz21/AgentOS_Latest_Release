import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Brain,
  Calculator,
  Cloud,
  TrendingUp,
  Search,
  Settings,
  X,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { orchestrationService, AvailableAgent } from '@/lib/services/OrchestrationService';

interface AgentMonitoringPanelProps {
  onClose?: () => void;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastSeen: string;
  responseTime: number;
  capabilities: string[];
  url: string;
}

export const AgentMonitoringPanel: React.FC<AgentMonitoringPanelProps> = ({ onClose }) => {
  const [agents, setAgents] = useState<Record<string, AgentStatus>>({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'degraded' | 'unhealthy'>('unhealthy');

  useEffect(() => {
    loadAgents();
    if (isMonitoring) {
      const interval = setInterval(loadAgents, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const loadAgents = async () => {
    try {
      const result = await orchestrationService.getAvailableAgents();
      const agentStatuses: Record<string, AgentStatus> = {};

      for (const [id, agent] of Object.entries(result.available_agents)) {
        // Check agent health
        const isHealthy = await checkAgentHealth(agent.url);
        
        agentStatuses[id] = {
          id,
          name: agent.name,
          status: isHealthy ? 'active' : 'inactive',
          lastSeen: new Date().toISOString(),
          responseTime: Math.random() * 1000 + 100, // Simulated response time
          capabilities: agent.capabilities,
          url: agent.url
        };
      }

      setAgents(agentStatuses);
      setLastUpdate(new Date());
      updateOverallHealth(agentStatuses);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const checkAgentHealth = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(`${url}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const updateOverallHealth = (agentStatuses: Record<string, AgentStatus>) => {
    const activeCount = Object.values(agentStatuses).filter(agent => agent.status === 'active').length;
    const totalCount = Object.keys(agentStatuses).length;
    
    if (activeCount === totalCount) {
      setOverallHealth('healthy');
    } else if (activeCount > totalCount / 2) {
      setOverallHealth('degraded');
    } else {
      setOverallHealth('unhealthy');
    }
  };

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'calculator': return <Calculator className="h-4 w-4" />;
      case 'research': return <Search className="h-4 w-4" />;
      case 'weather': return <Cloud className="h-4 w-4" />;
      case 'stock': return <TrendingUp className="h-4 w-4" />;
      case 'coordinator': return <Users className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'inactive': return <Badge variant="secondary" className="bg-yellow-500">Inactive</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getOverallHealthColor = () => {
    switch (overallHealth) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getOverallHealthIcon = () => {
    switch (overallHealth) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertCircle className="h-4 w-4" />;
      case 'unhealthy': return <X className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Agent Monitoring</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 ${getOverallHealthColor()}`}>
            {getOverallHealthIcon()}
            <span className="text-sm font-medium capitalize">{overallHealth}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={isMonitoring ? 'text-red-500' : 'text-green-500'}
          >
            {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={loadAgents}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {Object.values(agents).filter(a => a.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {Object.values(agents).filter(a => a.status === 'inactive').length}
              </div>
              <div className="text-sm text-gray-500">Inactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {Object.values(agents).filter(a => a.status === 'error').length}
              </div>
              <div className="text-sm text-gray-500">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {Object.keys(agents).length}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
          {lastUpdate && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent List */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-sm">Agent Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {Object.entries(agents).map(([id, agent]) => (
                <div key={id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getAgentIcon(id)}
                      <span className="font-medium">{agent.name}</span>
                    </div>
                    {getStatusBadge(agent.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Response Time:</span>
                      <span className="ml-2 font-mono">{agent.responseTime.toFixed(0)}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Seen:</span>
                      <span className="ml-2">{new Date(agent.lastSeen).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Capabilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((capability, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">URL:</div>
                    <code className="text-xs text-gray-600 dark:text-gray-400">{agent.url}</code>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Health Alerts */}
      {overallHealth !== 'healthy' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {overallHealth === 'degraded' 
              ? 'Some agents are inactive. System performance may be affected.'
              : 'Multiple agents are down. System is not fully operational.'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};











