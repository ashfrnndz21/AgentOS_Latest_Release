import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  Activity, 
  Clock, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Download,
  BarChart3,
  Network,
  MessageSquare,
  Settings,
  Zap,
  Timer,
  Database,
  Server,
  Code,
  Layers,
  Target,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface A2AEvent {
  id: string;
  session_id: string;
  event_type: string;
  timestamp: string;
  agent_id?: string;
  agent_name?: string;
  from_agent_id?: string;
  to_agent_id?: string;
  content?: string;
  context?: any;
  metadata?: any;
  execution_time?: number;
  status?: string;
  error?: string;
}

interface AgentHandoff {
  id: string;
  session_id: string;
  handoff_number: number;
  from_agent: {
    id: string;
    name: string;
  };
  to_agent: {
    id: string;
    name: string;
  };
  status: string;
  start_time: string;
  end_time?: string;
  execution_time?: number;
  context_transferred?: any;
  input_prepared?: string;
  output_received?: string;
  tools_used: string[];
  error?: string;
  metadata?: any;
}

interface A2ATrace {
  session_id: string;
  query: string;
  start_time: string;
  end_time?: string;
  total_execution_time?: number;
  success: boolean;
  error?: string;
  orchestration_strategy?: string;
  agents_involved: string[];
  final_response?: string;
  handoffs: AgentHandoff[];
  events: A2AEvent[];
  context_evolution: any[];
}

interface A2AMetrics {
  total_orchestrations: number;
  successful_orchestrations: number;
  failed_orchestrations: number;
  average_execution_time: number;
  average_handoffs_per_orchestration: number;
  most_used_agents: Record<string, number>;
  error_types: Record<string, number>;
  recent_performance: {
    success_rate: number;
    average_execution_time: number;
    sample_size: number;
  };
}

export const A2AObservabilityPanel: React.FC = () => {
  const [traces, setTraces] = useState<A2ATrace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<A2ATrace | null>(null);
  const [handoffs, setHandoffs] = useState<AgentHandoff[]>([]);
  const [metrics, setMetrics] = useState<A2AMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('traces');
  const [realTimeUpdates, setRealTimeUpdates] = useState(false);

  // Fetch traces
  const fetchTraces = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5018/api/a2a-observability/traces?limit=20');
      if (response.ok) {
        const data = await response.json();
        setTraces(data.traces || []);
      }
    } catch (error) {
      console.error('Failed to fetch traces:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch handoffs
  const fetchHandoffs = async () => {
    try {
      const response = await fetch('http://localhost:5018/api/a2a-observability/handoffs?limit=20');
      if (response.ok) {
        const data = await response.json();
        setHandoffs(data.handoffs || []);
      }
    } catch (error) {
      console.error('Failed to fetch handoffs:', error);
    }
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5018/api/a2a-observability/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  // Fetch detailed trace
  const fetchTraceDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:5018/api/a2a-observability/traces/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTrace(data.trace);
      }
    } catch (error) {
      console.error('Failed to fetch trace details:', error);
    }
  };

  // Real-time updates
  useEffect(() => {
    if (realTimeUpdates && selectedTrace) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:5018/api/a2a-observability/real-time/${selectedTrace.session_id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'completed') {
              setRealTimeUpdates(false);
              fetchTraceDetails(selectedTrace.session_id);
            }
          }
        } catch (error) {
          console.error('Real-time update failed:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [realTimeUpdates, selectedTrace]);

  // Initial load
  useEffect(() => {
    fetchTraces();
    fetchHandoffs();
    fetchMetrics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'in_progress':
      case 'active':
        return <Activity className="h-4 w-4 text-blue-400 animate-pulse" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    return `${seconds.toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const exportTraceData = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:5018/api/a2a-observability/export/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.trace_data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `a2a-trace-${sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export trace data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="h-6 w-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">A2A Observability</h2>
            <p className="text-sm text-gray-400">Monitor agent conversations and handovers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              fetchTraces();
              fetchHandoffs();
              fetchMetrics();
            }}
            disabled={loading}
            className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {selectedTrace && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportTraceData(selectedTrace.session_id)}
              className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-400">Total Orchestrations</span>
              </div>
              <p className="text-2xl font-bold text-white">{metrics.total_orchestrations}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-400">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {((metrics.successful_orchestrations / metrics.total_orchestrations) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Avg Execution</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatDuration(metrics.average_execution_time)}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-400">Avg Handoffs</span>
              </div>
              <p className="text-2xl font-bold text-white">{metrics.average_handoffs_per_orchestration.toFixed(1)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
          <TabsTrigger value="traces" className="data-[state=active]:bg-purple-600">
            <Eye className="h-4 w-4 mr-2" />
            Traces
          </TabsTrigger>
          <TabsTrigger value="handoffs" className="data-[state=active]:bg-purple-600">
            <ArrowRight className="h-4 w-4 mr-2" />
            Handoffs
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-purple-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
        </TabsList>

        {/* Traces Tab */}
        <TabsContent value="traces" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traces List */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-400" />
                  Recent Orchestrations
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Click on a trace to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {traces.map((trace) => (
                      <div
                        key={trace.session_id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedTrace?.session_id === trace.session_id
                            ? 'border-purple-500 bg-purple-900/20'
                            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                        }`}
                        onClick={() => fetchTraceDetails(trace.session_id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(trace.success ? 'success' : 'failed')}
                            <span className="text-sm font-medium text-white">
                              {trace.query.substring(0, 50)}...
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {trace.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(trace.start_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {trace.total_execution_time ? formatDuration(trace.total_execution_time) : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {trace.agents_involved.length} agents
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Trace Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-400" />
                  Trace Details
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {selectedTrace ? 'Detailed view of selected orchestration' : 'Select a trace to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTrace ? (
                  <div className="space-y-4">
                    {/* Trace Overview */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                      <h4 className="font-medium text-white mb-2">Orchestration Overview</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Query:</span>
                          <p className="text-white">{selectedTrace.query}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Strategy:</span>
                          <p className="text-white">{selectedTrace.orchestration_strategy}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Duration:</span>
                          <p className="text-white">{formatDuration(selectedTrace.total_execution_time || 0)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Agents:</span>
                          <p className="text-white">{selectedTrace.agents_involved.join(', ')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Handoffs Timeline */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                      <h4 className="font-medium text-white mb-3">Handoff Timeline</h4>
                      <div className="space-y-3">
                        {selectedTrace.handoffs.map((handoff, index) => (
                          <div key={handoff.id} className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                handoff.status === 'completed' ? 'bg-green-600' :
                                handoff.status === 'failed' ? 'bg-red-600' :
                                'bg-blue-600'
                              }`}>
                                <span className="text-xs font-bold text-white">{handoff.handoff_number}</span>
                              </div>
                              {index < selectedTrace.handoffs.length - 1 && (
                                <div className="w-0.5 h-8 bg-gray-600 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-white">
                                  {handoff.from_agent.name} → {handoff.to_agent.name}
                                </span>
                                {getStatusIcon(handoff.status)}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>{formatTimestamp(handoff.start_time)}</span>
                                {handoff.execution_time && (
                                  <span>{formatDuration(handoff.execution_time)}</span>
                                )}
                                {handoff.tools_used.length > 0 && (
                                  <span>{handoff.tools_used.length} tools</span>
                                )}
                              </div>
                              {handoff.error && (
                                <p className="text-xs text-red-400 mt-1">{handoff.error}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Real-time Updates */}
                    {selectedTrace.end_time === undefined && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                          className={`${
                            realTimeUpdates 
                              ? 'border-green-400 text-green-400' 
                              : 'border-gray-400 text-gray-400'
                          }`}
                        >
                          {realTimeUpdates ? (
                            <>
                              <Pause className="h-3 w-3 mr-2" />
                              Stop Updates
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-2" />
                              Live Updates
                            </>
                          )}
                        </Button>
                        {realTimeUpdates && (
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            <Activity className="h-3 w-3 mr-1 animate-pulse" />
                            Live
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a trace from the list to view detailed information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Handoffs Tab */}
        <TabsContent value="handoffs" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-purple-400" />
                Recent Agent Handoffs
              </CardTitle>
              <CardDescription className="text-gray-400">
                Detailed view of agent-to-agent handoffs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {handoffs.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <ArrowRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No handoffs available</p>
                      <p className="text-sm">Run an A2A orchestration to see agent handoffs</p>
                    </div>
                  ) : (
                    handoffs.map((handoff) => (
                    <div key={handoff.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Handoff #{handoff.handoff_number}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-green-400">
                            {handoff.status?.replace('HandoffStatus.', '') || 'COMPLETED'}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-blue-400">
                            {handoff.execution_time?.toFixed(2)}s
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(handoff.start_time)}
                        </span>
                      </div>

                      {/* Agent Flow */}
                      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-blue-400">
                              {handoff.from_agent?.name || 'Orchestrator'}
                            </div>
                            <div className="text-xs text-gray-400">From</div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-purple-400" />
                          <div className="text-center">
                            <div className="text-sm font-medium text-green-400">
                              {handoff.to_agent?.name || 'Next Agent'}
                            </div>
                            <div className="text-xs text-gray-400">To</div>
                          </div>
                        </div>
                      </div>

                      {/* Context Transferred */}
                      {handoff.context_transferred && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-purple-400" />
                            Context Transferred
                          </h4>
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            {handoff.context_transferred.query && (
                              <div className="mb-2">
                                <div className="text-xs text-gray-400 mb-1">Query:</div>
                                <div className="text-sm text-gray-300">{handoff.context_transferred.query}</div>
                              </div>
                            )}
                            {handoff.context_transferred.previous_context && (
                              <div>
                                <div className="text-xs text-gray-400 mb-1">Previous Context:</div>
                                <div className="text-sm text-gray-300 max-h-20 overflow-y-auto">
                                  {handoff.context_transferred.previous_context.length > 200 
                                    ? handoff.context_transferred.previous_context.substring(0, 200) + '...'
                                    : handoff.context_transferred.previous_context}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tools Used */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                          <Settings className="h-4 w-4 text-yellow-400" />
                          Tools Used
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {handoff.tools_used && handoff.tools_used.length > 0 ? (
                            handoff.tools_used.map((tool, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-yellow-400">
                                {tool}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">No tools used</span>
                          )}
                        </div>
                      </div>

                      {/* Output Received */}
                      {handoff.output_received && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                            <Code className="h-4 w-4 text-green-400" />
                            Agent Output
                          </h4>
                          <div className="bg-gray-800/50 p-3 rounded-lg max-h-32 overflow-y-auto">
                            <div className="text-sm text-gray-300 whitespace-pre-wrap">
                              {handoff.output_received.length > 300 
                                ? handoff.output_received.substring(0, 300) + '...'
                                : handoff.output_received}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Execution Details */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="text-gray-400 mb-1">Start Time:</div>
                          <div className="text-gray-300">{new Date(handoff.start_time).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">End Time:</div>
                          <div className="text-gray-300">{new Date(handoff.end_time).toLocaleString()}</div>
                        </div>
                      </div>
                      
                      {/* Error Display */}
                      {handoff.error && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-600 rounded-lg">
                          <div className="text-sm font-medium text-red-400 mb-1">Error:</div>
                          <div className="text-sm text-red-300">{handoff.error}</div>
                        </div>
                      )}
                    </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agent Usage */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    Agent Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(metrics.most_used_agents)
                      .sort(([,a], [,b]) => b - a)
                      .map(([agent, count]) => (
                        <div key={agent} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{agent}</span>
                          <Badge variant="outline" className="text-xs">
                            {count} uses
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Error Analysis */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    Error Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(metrics.error_types)
                      .sort(([,a], [,b]) => b - a)
                      .map(([error, count]) => (
                        <div key={error} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{error}</span>
                          <Badge variant="outline" className="text-xs text-red-400 border-red-400">
                            {count} occurrences
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
