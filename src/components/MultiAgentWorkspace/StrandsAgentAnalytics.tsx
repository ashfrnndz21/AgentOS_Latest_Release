import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Clock, 
  Zap, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Activity,
  MessageSquare,
  Settings,
  Calendar,
  Target,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface StrandsAgentAnalyticsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
}

interface AgentAnalytics {
  agent_info: {
    id: string;
    name: string;
    description: string;
    model_id: string;
    tools: string[];
    created_at: string;
    updated_at: string;
  };
  execution_stats: {
    total_executions: number;
    avg_execution_time: number;
    min_execution_time: number;
    max_execution_time: number;
    successful_executions: number;
    failed_executions: number;
    success_rate: number;
  };
  tool_usage: { [key: string]: number };
  total_tokens: number;
  hourly_usage: { [key: string]: number };
  recent_executions: Array<{
    input: string;
    output: string;
    execution_time: number;
    success: boolean;
    timestamp: string;
  }>;
}

export function StrandsAgentAnalytics({ 
  open, 
  onOpenChange, 
  agentId, 
  agentName 
}: StrandsAgentAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!agentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5006/api/strands-sdk/agents/${agentId}/analytics`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Analytics data received:', data);
      console.log('Tool usage:', data.tool_usage);
      console.log('Tool usage type:', typeof data.tool_usage);
      console.log('Tool usage keys:', data.tool_usage ? Object.keys(data.tool_usage) : 'null');
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && agentId) {
      fetchAnalytics();
    }
  }, [open, agentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'web_search': return '🔍';
      case 'calculator': return '🧮';
      case 'current_time': return '⏰';
      case 'weather_api': return '🌤️';
      case 'think': return '🤔';
      case 'memory': return '🧠';
      case 'use_llm': return '🤖';
      case 'file_read': return '📖';
      case 'file_write': return '✍️';
      case 'editor': return '📝';
      case 'tavily': return '🌐';
      case 'http_request': return '🌍';
      case 'python_repl': return '🐍';
      case 'code_execution': return '⚡';
      case 'shell': return '💻';
      case 'generate_image': return '🎨';
      case 'speak': return '🗣️';
      case 'slack': return '💬';
      case 'workflow': return '🔄';
      case 'agent_graph': return '🕸️';
      case 'use_agent': return '👥';
      case 'handoff_to_user': return '🤝';
      case 'cron': return '⏰';
      case 'journal': return '📔';
      case 'retrieve': return '🔍';
      case 'load_tool': return '🔧';
      case 'batch': return '📦';
      case 'graph': return '📊';
      case 'swarm': return '🐝';
      case 'use_aws': return '☁️';
      case 'mcp_client': return '🔌';
      case 'agent_core_memory': return '🧠';
      case 'mem0_memory': return '💾';
      case 'nova_reels': return '🎬';
      case 'diagram': return '📈';
      case 'a2a_discover_agent': return '🔍';
      case 'a2a_list_discovered_agents': return '📋';
      case 'a2a_send_message': return '📤';
      case 'coordinate_agents': return '🎯';
      case 'agent_handoff': return '🤝';
      case 'database_query': return '🗄️';
      case 'environment': return '🌍';
      case 'sleep': return '😴';
      case 'stop': return '⏹️';
      default: return '🛠️';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Analytics: {agentName}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              disabled={loading}
              className="ml-auto border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading && !analytics && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-400">Loading analytics...</span>
          </div>
        )}

        {error && (
          <Card className="border-red-600 bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {analytics && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-blue-600">
                <Zap className="h-4 w-4 mr-2" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Agent Info */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Agent Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <span className="ml-2 text-white">{analytics.agent_info.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Model:</span>
                      <span className="ml-2 text-white">{analytics.agent_info.model_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <span className="ml-2 text-white">{formatDate(analytics.agent_info.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tools:</span>
                      <span className="ml-2">
                        {analytics.agent_info.tools.length > 0 ? (
                          analytics.agent_info.tools.map(tool => (
                            <Badge key={tool} variant="outline" className="ml-1 text-xs">
                              {getToolIcon(tool)} {tool}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500">No tools</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Description:</span>
                    <p className="text-white mt-1">{analytics.agent_info.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Executions</p>
                        <p className="text-2xl font-bold text-white">{analytics.execution_stats.total_executions}</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Success Rate</p>
                        <p className="text-2xl font-bold text-green-400">{analytics.execution_stats.success_rate}%</p>
                      </div>
                      <Target className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Avg Response Time</p>
                        <p className="text-2xl font-bold text-yellow-400">{analytics.execution_stats.avg_execution_time}s</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Tokens</p>
                        <p className="text-2xl font-bold text-purple-400">{analytics.total_tokens.toLocaleString()}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Execution Stats */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Execution Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Successful:</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-400">{analytics.execution_stats.successful_executions}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Failed:</span>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-400" />
                        <span className="text-red-400">{analytics.execution_stats.failed_executions}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Min Time:</span>
                      <span className="text-white">{analytics.execution_stats.min_execution_time}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Time:</span>
                      <span className="text-white">{analytics.execution_stats.max_execution_time}s</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Hourly Usage */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Usage Pattern (24h)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(analytics.hourly_usage).map(([hour, count]) => (
                        <div key={hour} className="flex items-center gap-2">
                          <span className="text-gray-400 w-8">{hour}:00</span>
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-400 h-2 rounded-full" 
                              style={{ width: `${(count / Math.max(...Object.values(analytics.hourly_usage))) * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-sm w-8">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              {/* Tool Usage Statistics */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Tool Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
                      <p className="text-gray-400">Loading tool usage data...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <div className="text-red-400 mb-2">⚠️</div>
                      <p className="text-red-400">{error}</p>
                    </div>
                  ) : analytics && analytics.tool_usage && Object.keys(analytics.tool_usage).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(analytics.tool_usage).map(([tool, count]) => (
                        <div key={tool} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getToolIcon(tool)}</span>
                            <span className="text-white">{tool.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-400 h-2 rounded-full" 
                                style={{ width: `${(count / Math.max(...Object.values(analytics.tool_usage))) * 100}%` }}
                              />
                            </div>
                            <span className="text-white font-medium w-8">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No tool usage recorded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tool Performance Metrics */}
              {analytics && analytics.tool_performance && Object.keys(analytics.tool_performance).length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Tool Performance Metrics</CardTitle>
                    <p className="text-gray-400 text-sm">Execution timing and performance data</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.tool_performance).map(([tool, perf]) => (
                        <div key={tool} className="p-4 bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">{getToolIcon(tool)}</span>
                            <span className="text-white font-medium">{tool.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Avg Time</p>
                              <p className="text-white font-medium">{perf.avg_execution_time}s</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Min Time</p>
                              <p className="text-white font-medium">{perf.min_execution_time}s</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Max Time</p>
                              <p className="text-white font-medium">{perf.max_execution_time}s</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Invocations</p>
                              <p className="text-white font-medium">{perf.total_invocations}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tool Success Rates */}
              {analytics && analytics.tool_success_rates && Object.keys(analytics.tool_success_rates).length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Tool Success Rates</CardTitle>
                    <p className="text-gray-400 text-sm">Reliability and error rates for each tool</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.tool_success_rates).map(([tool, rates]) => (
                        <div key={tool} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getToolIcon(tool)}</span>
                            <span className="text-white">{tool.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-green-400 font-medium">{rates.success_rate}%</p>
                              <p className="text-gray-400 text-xs">Success Rate</p>
                            </div>
                            <div className="text-center">
                              <p className="text-red-400 font-medium">{rates.failure_rate}%</p>
                              <p className="text-gray-400 text-xs">Failure Rate</p>
                            </div>
                            <div className="text-center">
                              <p className="text-white font-medium">{rates.successful_invocations}/{rates.total_invocations}</p>
                              <p className="text-gray-400 text-xs">Success/Total</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tool Sequences */}
              {analytics && analytics.tool_sequences && analytics.tool_sequences.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Tool Sequences</CardTitle>
                    <p className="text-gray-400 text-sm">Order of tools used in recent executions</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.tool_sequences.slice(0, 5).map((seq, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">#{index + 1}</span>
                            <div className="flex items-center gap-1">
                              {seq.sequence.map((tool, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <span className="text-lg">{getToolIcon(tool)}</span>
                                  <span className="text-white text-sm">{tool}</span>
                                  {i < seq.sequence.length - 1 && <span className="text-gray-400">→</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${seq.success ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                              {seq.success ? 'Success' : 'Failed'}
                            </span>
                            <span className="text-gray-400">{seq.execution_time}s</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tool Combinations */}
              {analytics && analytics.tool_combinations && Object.keys(analytics.tool_combinations).length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Tool Combinations</CardTitle>
                    <p className="text-gray-400 text-sm">Most common tool usage patterns</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.tool_combinations)
                        .sort(([,a], [,b]) => b.count - a.count)
                        .slice(0, 5)
                        .map(([combo, data]) => (
                        <div key={combo} className="p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {combo.split(',').map((tool, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <span className="text-lg">{getToolIcon(tool.trim())}</span>
                                  <span className="text-white text-sm">{tool.trim()}</span>
                                  {i < combo.split(',').length - 1 && <span className="text-gray-400">+</span>}
                                </div>
                              ))}
                            </div>
                            <span className="text-purple-400 font-medium">{data.count} times</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Avg Time</p>
                              <p className="text-white">{data.avg_execution_time}s</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Success Rate</p>
                              <p className="text-white">{data.success_rate}%</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Usage</p>
                              <p className="text-white">{data.count} executions</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Executions</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.recent_executions.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.recent_executions.map((execution, index) => (
                        <div key={index} className="border border-gray-600 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {execution.success ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-400" />
                              )}
                              <span className="text-sm text-gray-400">{formatDate(execution.timestamp)}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {execution.execution_time}s
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div>
                              <span className="text-xs text-gray-500">Input:</span>
                              <p className="text-sm text-gray-300">{execution.input}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Output:</span>
                              <p className="text-sm text-gray-300">{execution.output}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No execution history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}