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
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Tool Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(analytics.tool_usage).length > 0 ? (
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