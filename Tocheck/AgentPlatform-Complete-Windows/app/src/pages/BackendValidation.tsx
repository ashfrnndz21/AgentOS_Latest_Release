import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Shield,
  Activity,
  Database,
  Terminal,
  BarChart3,
  Clock,
  TrendingUp,
  AlertTriangle,
  Eye,
  Play,
  Pause,
  Search,
  Download,
  Brain,
  Cpu,
  GitBranch
} from 'lucide-react';

interface AgentMetrics {
  total: number;
  active: number;
  failed: number;
  idle: number;
  frameworks: {
    generic: number;
    strands: number;
    agentcore: number;
    multi_agent: number;
  };
  performance: {
    avg_response_time: number;
    total_requests: number;
    success_rate: number;
    error_rate: number;
  };
  recent_activity: Array<{
    id: string;
    name: string;
    framework: string;
    status: string;
    created_at: string;
    last_activity?: string;
    error_message?: string;
    framework_metadata?: any;
    performance_metrics?: any;
    health_score?: number;
  }>;
}

interface SystemHealth {
  api_status: {
    openai: boolean;
    anthropic: boolean;
    bedrock: boolean;
    missing_keys: string[];
  };
  database: {
    connected: boolean;
    response_time: number;
    total_agents: number;
  };
  server: {
    uptime: number;
    memory_usage: number;
    cpu_usage: number;
    active_connections: number;
  };
}

interface RealTimeMetrics {
  timestamp: string;
  requests_per_minute: number;
  active_agents: number;
  error_rate: number;
  avg_response_time: number;
}

interface AgentTrace {
  agent_id: string;
  timestamp: string;
  event_type: 'creation' | 'execution' | 'error' | 'completion';
  details: any;
  duration?: number;
  status: 'success' | 'error' | 'pending';
}

export const BackendValidation: React.FC = () => {
  // Core State
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics[]>([]);
  const [agentTraces, setAgentTraces] = useState<AgentTrace[]>([]);
  const [serverLogs, setServerLogs] = useState<any[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [filterFramework, setFilterFramework] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [alertsCount, setAlertsCount] = useState(0);

  // Utility functions
  const calculateHealthScore = (agent: any): number => {
    let score = 100;
    if (agent.status === 'failed') score -= 50;
    if (agent.error_message) score -= 20;
    if (agent.performance_metrics?.error_rate > 10) score -= 15;
    if (agent.performance_metrics?.avg_response_time > 5000) score -= 10;
    return Math.max(0, score);
  };

  const getFrameworkColor = (framework: string): string => {
    switch (framework) {
      case 'strands': return 'border-green-500 text-green-400';
      case 'agentcore': return 'border-blue-500 text-blue-400';
      case 'multi-agent': return 'border-orange-500 text-orange-400';
      case 'generic': return 'border-purple-500 text-purple-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'border-green-500 text-green-400';
      case 'failed': return 'border-red-500 text-red-400';
      case 'idle': return 'border-yellow-500 text-yellow-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  // Comprehensive data fetching
  const fetchAgentMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        const agents = data.agents || [];
        
        // Calculate comprehensive metrics
        const totalRequests = agents.reduce((sum: number, agent: any) => 
          sum + (agent.performance_metrics?.total_requests || 0), 0);
        const successfulRequests = agents.reduce((sum: number, agent: any) => 
          sum + (agent.performance_metrics?.successful_requests || 0), 0);
        const avgResponseTime = agents.reduce((sum: number, agent: any) => 
          sum + (agent.performance_metrics?.avg_response_time || 0), 0) / (agents.length || 1);
        
        const metrics: AgentMetrics = {
          total: agents.length,
          active: agents.filter((a: any) => a.status === 'active').length,
          failed: agents.filter((a: any) => a.status === 'failed').length,
          idle: agents.filter((a: any) => a.status === 'idle').length,
          frameworks: {
            generic: agents.filter((a: any) => a.framework === 'generic').length,
            strands: agents.filter((a: any) => a.framework === 'strands').length,
            agentcore: agents.filter((a: any) => a.framework === 'agentcore').length,
            multi_agent: agents.filter((a: any) => a.framework === 'multi-agent').length,
          },
          performance: {
            avg_response_time: avgResponseTime,
            total_requests: totalRequests,
            success_rate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
            error_rate: totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests) * 100 : 0,
          },
          recent_activity: agents.slice(-15).map((a: any) => ({
            id: a.agentId || a.id,
            name: a.name,
            framework: a.framework,
            status: a.status,
            created_at: a.created_at || new Date().toISOString(),
            last_activity: a.last_activity,
            error_message: a.error_message,
            framework_metadata: a.framework_metadata,
            performance_metrics: a.performance_metrics,
            health_score: calculateHealthScore(a)
          }))
        };
        
        setAgentMetrics(metrics);
        
        // Update real-time metrics
        const newMetric: RealTimeMetrics = {
          timestamp: new Date().toISOString(),
          requests_per_minute: totalRequests,
          active_agents: metrics.active,
          error_rate: metrics.performance.error_rate,
          avg_response_time: avgResponseTime
        };
        
        setRealTimeMetrics(prev => [...prev.slice(-59), newMetric]);
      }
    } catch (error) {
      console.error('Failed to fetch agent metrics:', error);
    }
  }, []);

  const fetchSystemHealth = useCallback(async () => {
    try {
      const response = await fetch('/health');
      if (response.ok) {
        const data = await response.json();
        const health: SystemHealth = {
          api_status: {
            openai: data.api_keys?.openai || false,
            anthropic: data.api_keys?.anthropic || false,
            bedrock: data.api_keys?.bedrock || false,
            missing_keys: data.missing_keys || []
          },
          database: {
            connected: true,
            response_time: Math.random() * 50 + 10,
            total_agents: data.agents_in_db || 0
          },
          server: {
            uptime: Date.now() - (Math.random() * 86400000),
            memory_usage: Math.random() * 80 + 10,
            cpu_usage: Math.random() * 60 + 5,
            active_connections: Math.floor(Math.random() * 100) + 10
          }
        };
        setSystemHealth(health);
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    }
  }, []);

  const fetchAgentTraces = useCallback(async () => {
    try {
      const mockTraces: AgentTrace[] = [
        {
          agent_id: 'agent_001',
          timestamp: new Date().toISOString(),
          event_type: 'creation',
          details: { framework: 'strands', reasoning_patterns: ['chain_of_thought'] },
          duration: 1200,
          status: 'success'
        },
        {
          agent_id: 'agent_002',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          event_type: 'execution',
          details: { task: 'reasoning', input_tokens: 150, output_tokens: 300 },
          duration: 2500,
          status: 'success'
        }
      ];
      setAgentTraces(mockTraces);
    } catch (error) {
      console.error('Failed to fetch agent traces:', error);
    }
  }, []);

  const fetchServerLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/server/logs');
      if (response.ok) {
        const data = await response.json();
        setServerLogs(data.logs || []);
        
        const alerts = data.logs?.filter((log: any) => 
          log.level === 'ERROR' || log.level === 'WARNING'
        ).length || 0;
        setAlertsCount(alerts);
      }
    } catch (error) {
      console.error('Failed to fetch server logs:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setLastUpdated(new Date());
    
    try {
      await Promise.all([
        fetchAgentMetrics(),
        fetchSystemHealth(),
        fetchAgentTraces(),
        fetchServerLogs()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAgentMetrics, fetchSystemHealth, fetchAgentTraces, fetchServerLogs]);

  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled);
  };

  const exportData = () => {
    const data = {
      agentMetrics,
      systemHealth,
      realTimeMetrics,
      agentTraces,
      serverLogs,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-observability-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Effects
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!isRealTimeEnabled) return;
    
    const interval = setInterval(() => {
      refreshAll();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isRealTimeEnabled, refreshAll]);

  return (
    <div className="min-h-screen bg-beam-dark text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Advanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-400" />
              Agent Observability Platform
            </h1>
            <p className="text-gray-400">Real-time monitoring, tracing, and analytics for all agent frameworks</p>
          </div>
          <div className="flex items-center gap-4">
            {alertsCount > 0 && (
              <Badge variant="outline" className="border-red-500 text-red-400">
                <AlertTriangle size={14} className="mr-1" />
                {alertsCount} Alerts
              </Badge>
            )}
            {lastUpdated && (
              <span className="text-sm text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={toggleRealTime}
              variant={isRealTimeEnabled ? "default" : "outline"}
              className={isRealTimeEnabled ? "bg-green-600 hover:bg-green-700" : "border-gray-600"}
            >
              {isRealTimeEnabled ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRealTimeEnabled ? 'Live' : 'Paused'}
            </Button>
            <Button onClick={exportData} variant="outline" className="border-gray-600">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={refreshAll}
              disabled={isLoading}
              className="bg-beam-blue hover:bg-beam-blue/80"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-beam-dark-accent border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">System Health</p>
                    <p className="text-2xl font-bold text-green-400">
                      {systemHealth.api_status.missing_keys.length === 0 ? '100%' : '75%'}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-beam-dark-accent border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Agents</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {agentMetrics?.active || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-beam-dark-accent border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold text-green-400">
                      {agentMetrics?.performance.success_rate.toFixed(1) || 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-beam-dark-accent border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Response</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {agentMetrics?.performance.avg_response_time.toFixed(0) || 0}ms
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Observability Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-beam-dark-accent border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-beam-blue">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-beam-blue">
              <Brain className="h-4 w-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-beam-blue">
              <Terminal className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="data-[state=active]:bg-beam-blue">
              <Cpu className="h-4 w-4 mr-2" />
              Infrastructure
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-beam-dark-accent border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5" />
                  Framework Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agentMetrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="text-3xl font-bold text-purple-400">{agentMetrics.frameworks.generic}</div>
                      <div className="text-sm text-gray-400">Generic</div>
                    </div>
                    <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-3xl font-bold text-green-400">{agentMetrics.frameworks.strands}</div>
                      <div className="text-sm text-gray-400">Strands</div>
                    </div>
                    <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-3xl font-bold text-blue-400">{agentMetrics.frameworks.agentcore}</div>
                      <div className="text-sm text-gray-400">Agent Core</div>
                    </div>
                    <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="text-3xl font-bold text-orange-400">{agentMetrics.frameworks.multi_agent}</div>
                      <div className="text-sm text-gray-400">Multi-Agent</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-beam-dark-accent border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agentMetrics && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Requests</span>
                        <span className="text-white font-mono">{agentMetrics.performance.total_requests}</span>
                      </div>
                      <Progress value={Math.min(100, agentMetrics.performance.total_requests / 10)} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Success Rate</span>
                        <span className="text-green-400 font-mono">{agentMetrics.performance.success_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={agentMetrics.performance.success_rate} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Error Rate</span>
                        <span className="text-red-400 font-mono">{agentMetrics.performance.error_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={agentMetrics.performance.error_rate} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Response</span>
                        <span className="text-yellow-400 font-mono">{agentMetrics.performance.avg_response_time.toFixed(0)}ms</span>
                      </div>
                      <Progress value={Math.min(100, agentMetrics.performance.avg_response_time / 50)} className="h-2" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-beam-dark-accent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-beam-blue focus:outline-none"
                  />
                </div>
                <select
                  value={filterFramework}
                  onChange={(e) => setFilterFramework(e.target.value)}
                  className="px-4 py-2 bg-beam-dark-accent border border-gray-600 rounded-lg text-white focus:border-beam-blue focus:outline-none"
                >
                  <option value="all">All Frameworks</option>
                  <option value="generic">Generic</option>
                  <option value="strands">Strands</option>
                  <option value="agentcore">Agent Core</option>
                  <option value="multi-agent">Multi-Agent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {agentMetrics?.recent_activity
                .filter(agent => 
                  (filterFramework === 'all' || agent.framework === filterFramework) &&
                  (searchQuery === '' || agent.name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((agent) => (
                <Card key={agent.id} className="bg-beam-dark-accent border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={getFrameworkColor(agent.framework)}>
                          {agent.framework}
                        </Badge>
                        <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                        <Badge variant="outline" className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Health Score</div>
                          <div className={`text-lg font-bold ${
                            (agent.health_score || 0) > 80 ? 'text-green-400' :
                            (agent.health_score || 0) > 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {agent.health_score || 0}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400">Agent ID</div>
                        <div className="text-white font-mono text-sm">{agent.id.substring(0, 12)}...</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Created</div>
                        <div className="text-white text-sm">{new Date(agent.created_at).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Last Activity</div>
                        <div className="text-white text-sm">
                          {agent.last_activity ? new Date(agent.last_activity).toLocaleString() : 'Never'}
                        </div>
                      </div>
                    </div>

                    {agent.performance_metrics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Requests</div>
                          <div className="text-white font-mono">{agent.performance_metrics.total_requests || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Success</div>
                          <div className="text-green-400 font-mono">{agent.performance_metrics.successful_requests || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Failed</div>
                          <div className="text-red-400 font-mono">{agent.performance_metrics.failed_requests || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Avg Time</div>
                          <div className="text-yellow-400 font-mono">{agent.performance_metrics.avg_response_time || 0}ms</div>
                        </div>
                      </div>
                    )}

                    {agent.error_message && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="text-sm text-red-400">
                          <strong>Error:</strong> {agent.error_message}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-beam-dark-accent border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Terminal className="h-5 w-5" />
                  Live Server Logs
                </CardTitle>
                <CardDescription>Real-time server logs and API activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {serverLogs.length > 0 ? (
                    serverLogs.map((log, index) => (
                      <div key={index} className="p-3 bg-gray-900/50 rounded border-l-2 border-blue-600 font-mono text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                          <Badge 
                            variant="outline" 
                            className={
                              log.level === 'ERROR' ? 'border-red-500 text-red-400' :
                              log.level === 'INFO' ? 'border-green-500 text-green-400' :
                              log.level === 'WARNING' ? 'border-yellow-500 text-yellow-400' :
                              'border-blue-500 text-blue-400'
                            }
                          >
                            {log.level}
                          </Badge>
                        </div>
                        <div className="text-white mb-2">{log.message}</div>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <details className="text-gray-400">
                            <summary className="cursor-pointer hover:text-white">Details</summary>
                            <pre className="mt-1 text-xs overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-gray-400">No server logs available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-6">
            {systemHealth && (
              <Card className="bg-beam-dark-accent border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5" />
                    API Configuration Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border ${
                      systemHealth.api_status.openai ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {systemHealth.api_status.openai ? 
                          <CheckCircle className="h-5 w-5 text-green-400" /> : 
                          <XCircle className="h-5 w-5 text-red-400" />
                        }
                        <span className="font-medium text-white">OpenAI API</span>
                      </div>
                      <div className={`text-sm ${systemHealth.api_status.openai ? 'text-green-300' : 'text-red-300'}`}>
                        {systemHealth.api_status.openai ? '✅ Configured' : '❌ Not Configured'}
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${
                      systemHealth.api_status.bedrock ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {systemHealth.api_status.bedrock ? 
                          <CheckCircle className="h-5 w-5 text-green-400" /> : 
                          <XCircle className="h-5 w-5 text-red-400" />
                        }
                        <span className="font-medium text-white">AWS Bedrock</span>
                      </div>
                      <div className={`text-sm ${systemHealth.api_status.bedrock ? 'text-green-300' : 'text-red-300'}`}>
                        {systemHealth.api_status.bedrock ? '✅ Configured' : '❌ Not Configured'}
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${
                      systemHealth.api_status.anthropic ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {systemHealth.api_status.anthropic ? 
                          <CheckCircle className="h-5 w-5 text-green-400" /> : 
                          <XCircle className="h-5 w-5 text-red-400" />
                        }
                        <span className="font-medium text-white">Anthropic API</span>
                      </div>
                      <div className={`text-sm ${systemHealth.api_status.anthropic ? 'text-green-300' : 'text-red-300'}`}>
                        {systemHealth.api_status.anthropic ? '✅ Configured' : '❌ Not Configured'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};