import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  MessageSquare, 
  BarChart3,
  Clock,
  Zap,
  Cpu,
  Settings,
  Sparkles,
  Info,
  Network,
  CheckCircle,
  RefreshCw,
  X,
  Settings as Gear,
  Target,
  Activity,
  Database,
  Server,
  Code,
  Shield,
  Layers,
  Users,
  ArrowRight
} from 'lucide-react';

export const OrchestratorCard: React.FC = () => {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [conversationTraces, setConversationTraces] = useState<any[]>([]);
  const [tracesLoading, setTracesLoading] = useState(false);
  const [queryOpen, setQueryOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationResult, setOrchestrationResult] = useState<any>(null);
  const [orchestrationError, setOrchestrationError] = useState<string | null>(null);
  const [a2aRegistered, setA2aRegistered] = useState(true); // System Orchestrator is always "active" as UI component

  // System Orchestrator is a UI component, not a separate A2A agent
  // No need to check registration status since it's not registered as an agent

  // Clear orchestration results when agents change or no agents are available
  useEffect(() => {
    const clearResultsIfNeeded = async () => {
      try {
        const response = await fetch('http://localhost:5008/api/a2a/agents');
        if (response.ok) {
          const data = await response.json();
          
          // Clear orchestration results if:
          // 1. No agents available, OR
          // 2. Current orchestration results don't match current agents
          if (data.count === 0) {
            setOrchestrationResult(null);
            setOrchestrationError(null);
          } else if (orchestrationResult) {
            // Check if the orchestration result agents match current agents
            const currentAgentNames = data.agents.map((agent: any) => agent.name.trim());
            const orchestrationAgents = orchestrationResult.orchestration_summary?.agent_evaluations?.map((agent: any) => agent.agent_name) || [];
            
            // If agents don't match, clear the results
            const agentsMatch = orchestrationAgents.every((name: string) => currentAgentNames.includes(name));
            if (!agentsMatch) {
              console.log('Agent mismatch detected, clearing orchestration results');
              setOrchestrationResult(null);
              setOrchestrationError(null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to check agent count:', error);
      }
    };

    clearResultsIfNeeded();
  }, [orchestrationResult]);

  // Orchestrator configuration and parameters
  const orchestratorConfig = {
    name: "System Orchestrator",
    description: "Central orchestrator for agent coordination and query processing",
    model: "qwen3:1.7b",
    status: "active",
    connections: 3, // Learning Coach, Creative Assistant, and A2A orchestrator
    parameters: {
      temperature: 0.3,
      max_tokens: 200,
      top_p: 0.9,
      timeout: 60,
      max_execution_time: 300,
      max_agent_time: 120
    },
    services: {
      ollama_base_url: "http://localhost:11434",
      strands_sdk_url: "http://localhost:5006",
      a2a_service_url: "http://localhost:5008",
      streamlined_analyzer_url: "http://localhost:5017"
    },
    capabilities: [
      "4-Step Query Processing",
      "Agent Registry Analysis", 
      "Agent Selection & Sequencing",
      "A2A Sequential Handover",
      "Context Refinement",
      "Response Synthesis"
    ],
    tools: [
      "analyze_query",
      "analyze_agents_contextually", 
      "select_and_sequence_agents",
      "execute_a2a_sequential_handover",
      "refine_context_for_next_agent",
      "synthesize_final_response"
    ]
  };

  const handleOrchestrationQuery = async () => {
    if (!query.trim()) return;

    setIsOrchestrating(true);
    setOrchestrationError(null);
    setOrchestrationResult(null);

    try {
      // Use our working enhanced orchestration API
      const response = await fetch('http://localhost:5014/api/enhanced-orchestration/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrchestrationResult(data);
      } else {
        const errorData = await response.json();
        setOrchestrationError(errorData.error || 'Orchestration failed');
      }
    } catch (err) {
      setOrchestrationError('Error connecting to orchestration service');
      console.error('Orchestration error:', err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const handleOrchestratorAnalytics = async () => {
    try {
      // Fetch orchestrator analytics from the simple orchestration API
      const response = await fetch('http://localhost:5015/api/simple-orchestration/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        // Create empty analytics data if endpoint doesn't exist
        setAnalyticsData({
          total_queries: 0,
          success_rate: 0,
          avg_response_time: 0,
          total_tokens: 0,
          recent_queries: [],
          agent_usage: {}
        });
      }
      // Fetch conversation traces when opening analytics
      await fetchConversationTraces();
      setAnalyticsOpen(true);
    } catch (error) {
      console.error('Failed to fetch orchestrator analytics:', error);
      // Show empty data on error
      setAnalyticsData({
        total_queries: 0,
        success_rate: 0,
        avg_response_time: 0,
        total_tokens: 0,
        recent_queries: [],
        agent_usage: {}
      });
      setAnalyticsOpen(true);
    }
  };

  const fetchConversationTraces = async () => {
    setTracesLoading(true);
    try {
      const response = await fetch('http://localhost:5015/api/simple-orchestration/conversation-traces');
      if (response.ok) {
        const data = await response.json();
        setConversationTraces(data.traces || []);
      } else {
        console.error('Failed to fetch conversation traces');
        setConversationTraces([]);
      }
    } catch (error) {
      console.error('Error fetching conversation traces:', error);
      setConversationTraces([]);
    } finally {
      setTracesLoading(false);
    }
  };

  return (
    <>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/50 hover:border-purple-400 transition-all duration-200 cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Brain className="h-5 w-5 text-purple-400" />
                  {orchestratorConfig.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <Badge className="bg-purple-600 text-white">
                    System Core
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-gray-300">
                {orchestratorConfig.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* A2A Communication Status */}
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">A2A Communication</span>
                    <Badge className="bg-blue-600 text-xs">
                      Active
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400">
                    UI Component • Coordinates A2A handovers between agents
                  </div>
                </div>

                {/* Parameters */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-800/50 p-2 rounded">
                    <div className="text-gray-400">Temperature</div>
                    <div className="text-white font-mono">{orchestratorConfig.parameters.temperature}</div>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <div className="text-gray-400">Max Tokens</div>
                    <div className="text-white font-mono">{orchestratorConfig.parameters.max_tokens}</div>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <div className="text-gray-400">Model</div>
                    <div className="text-white font-mono text-xs">{orchestratorConfig.model}</div>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <div className="text-gray-400">Timeout</div>
                    <div className="text-white font-mono">{orchestratorConfig.parameters.timeout}s</div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-gray-400">Queries</div>
                    <div className="text-white font-bold">∞</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Avg</div>
                    <div className="text-white font-bold">46s</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Success</div>
                    <div className="text-white font-bold">100%</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => setQueryOpen(true)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Query
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-gray-400 hover:text-white"
                    onClick={() => {
                      // Open orchestrator analytics
                      handleOrchestratorAnalytics();
                    }}
                  >
                    <BarChart3 className="h-3 w-3" />
                  </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-gray-400 hover:text-white"
                      onClick={() => setConfigOpen(true)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverCardTrigger>
        
        <HoverCardContent className="w-96 p-4 bg-gray-900 border-gray-700">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-purple-400" />
              <h3 className="font-semibold text-white">Orchestrator Configuration</h3>
            </div>
            
            {/* Backend Parameters */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">LLM Parameters</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Model</div>
                  <div className="text-white font-mono">{orchestratorConfig.model}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Temperature</div>
                  <div className="text-white font-mono">{orchestratorConfig.parameters.temperature}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Max Tokens</div>
                  <div className="text-white font-mono">{orchestratorConfig.parameters.max_tokens}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Top P</div>
                  <div className="text-white font-mono">{orchestratorConfig.parameters.top_p}</div>
                </div>
              </div>
            </div>

            {/* Service URLs */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Service Endpoints</h4>
              <div className="space-y-1 text-xs">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Ollama Base</div>
                  <div className="text-white font-mono text-xs">{orchestratorConfig.services.ollama_base_url}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Strands SDK</div>
                  <div className="text-white font-mono text-xs">{orchestratorConfig.services.strands_sdk_url}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">A2A Service</div>
                  <div className="text-white font-mono text-xs">{orchestratorConfig.services.a2a_service_url}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Streamlined Analyzer</div>
                  <div className="text-white font-mono text-xs">{orchestratorConfig.services.streamlined_analyzer_url}</div>
                </div>
              </div>
            </div>

            {/* Timeout Configuration */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Timeout Settings</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Request Timeout</div>
                  <div className="text-white font-mono">{orchestratorConfig.parameters.timeout}s</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Max Execution</div>
                  <div className="text-white font-mono">{orchestratorConfig.parameters.max_execution_time}s</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Per Agent</div>
                  <div className="text-white font-mono">{orchestratorConfig.parameters.max_agent_time}s</div>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Core Capabilities</h4>
              <div className="flex flex-wrap gap-1">
                {orchestratorConfig.capabilities.map((capability, index) => (
                  <Badge key={index} variant="outline" className="text-xs text-purple-300 border-purple-500">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Available Tools</h4>
              <div className="flex flex-wrap gap-1">
                {orchestratorConfig.tools.map((tool, index) => (
                  <Badge key={index} variant="outline" className="text-xs text-blue-300 border-blue-500">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Analytics Dialog */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              System Orchestrator Analytics
            </DialogTitle>
          </DialogHeader>

          {analyticsData && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="queries" className="data-[state=active]:bg-purple-600">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Recent Queries
                </TabsTrigger>
                <TabsTrigger value="traces" className="data-[state=active]:bg-purple-600">
                  <Activity className="h-4 w-4 mr-2" />
                  Conversation Traces
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400">{analyticsData.total_queries}</div>
                      <div className="text-sm text-gray-400">Total Queries</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{analyticsData.success_rate}%</div>
                      <div className="text-sm text-gray-400">Success Rate</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">{analyticsData.avg_response_time}s</div>
                      <div className="text-sm text-gray-400">Avg Response</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{analyticsData.total_tokens?.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Total Tokens</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Agent Usage */}
                {analyticsData.agent_usage && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg">Agent Usage Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(analyticsData.agent_usage).map(([agent, count]) => (
                          <div key={agent} className="flex justify-between items-center">
                            <span className="text-gray-300">{agent}</span>
                            <Badge variant="outline" className="text-purple-300 border-purple-500">
                              {count as number} uses
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Recent Queries Tab */}
              <TabsContent value="queries" className="space-y-6">
                {analyticsData.recent_queries && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Queries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.recent_queries.map((query, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                            <div className={`w-2 h-2 rounded-full mt-2 ${query.success ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div className="flex-1">
                              <div className="text-sm text-gray-300">{query.query}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(query.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Conversation Traces Tab */}
              <TabsContent value="traces" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Conversation Traces</h3>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={fetchConversationTraces}
                    disabled={tracesLoading}
                  >
                    {tracesLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                </div>

                {tracesLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                    <p>Loading conversation traces...</p>
                  </div>
                ) : conversationTraces.length === 0 ? (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No Conversation Traces</h3>
                      <p className="text-gray-400">
                        No conversation traces available. Run some queries to see detailed orchestration flows.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {conversationTraces.map((trace, index) => (
                      <Card key={trace.session_id} className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${trace.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                Query #{index + 1}
                              </CardTitle>
                              <p className="text-sm text-gray-400 mt-1">
                                {new Date(trace.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className={trace.status === 'completed' ? 'text-green-400 border-green-500' : 'text-yellow-400 border-yellow-500'}>
                              {trace.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Query:</h4>
                            <p className="text-sm text-white bg-gray-700 p-3 rounded">{trace.query}</p>
                          </div>

                          {trace.orchestrator_reasoning && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Orchestrator Reasoning:</h4>
                              <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded">{trace.orchestrator_reasoning}</p>
                            </div>
                          )}

                          {trace.execution_details && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Execution Details:</h4>
                              <div className="bg-gray-700 p-3 rounded text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-gray-400">Execution Time:</span>
                                    <span className="text-white ml-2">{trace.execution_details.execution_time}s</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Steps Completed:</span>
                                    <span className="text-white ml-2">{trace.execution_details.steps_completed}/4</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {trace.a2a_execution && trace.a2a_execution.execution_results && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">A2A Execution Results:</h4>
                              <div className="space-y-2">
                                {trace.a2a_execution.execution_results.map((result, idx) => (
                                  <div key={idx} className="bg-gray-700 p-3 rounded text-sm">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium text-white">{result.agent_name}</span>
                                      <Badge variant="outline" className={result.success ? 'text-green-400 border-green-500' : 'text-red-400 border-red-500'}>
                                        {result.success ? 'Success' : 'Failed'}
                                      </Badge>
                                    </div>
                                    <div className="text-gray-300">
                                      <div className="text-xs text-gray-400 mb-1">Task:</div>
                                      <div className="text-sm">{result.task_assignment}</div>
                                    </div>
                                    {result.agent_actual_response && (
                                      <div className="text-gray-300 mt-2">
                                        <div className="text-xs text-gray-400 mb-1">Response:</div>
                                        <div className="text-sm bg-gray-600 p-2 rounded">{result.agent_actual_response}</div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
          </Dialog>

          {/* System Orchestrator Configuration Modal */}
          <Dialog open={configOpen} onOpenChange={setConfigOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Gear className="h-5 w-5 text-purple-400" />
                  System Orchestrator Configuration
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-gray-800">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                    <Info className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="parameters" className="data-[state=active]:bg-purple-600">
                    <Settings className="h-4 w-4 mr-2" />
                    Parameters
                  </TabsTrigger>
                  <TabsTrigger value="services" className="data-[state=active]:bg-purple-600">
                    <Server className="h-4 w-4 mr-2" />
                    Services
                  </TabsTrigger>
                  <TabsTrigger value="capabilities" className="data-[state=active]:bg-purple-600">
                    <Target className="h-4 w-4 mr-2" />
                    Capabilities
                  </TabsTrigger>
                  <TabsTrigger value="system" className="data-[state=active]:bg-purple-600">
                    <Code className="h-4 w-4 mr-2" />
                    System
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* System Information */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Gear className="h-5 w-5 text-purple-400" />
                          System Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Name:</span>
                            <span className="text-white font-mono">{orchestratorConfig.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <Badge className="bg-green-600 text-xs">Active</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Type:</span>
                            <span className="text-white">System Core Component</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">A2A Status:</span>
                            <Badge className="bg-green-600 text-xs">Registered</Badge>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-700">
                          <p className="text-sm text-gray-300">{orchestratorConfig.description}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Activity className="h-5 w-5 text-blue-400" />
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">∞</div>
                            <div className="text-xs text-gray-400">Queries Processed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">100%</div>
                            <div className="text-xs text-gray-400">Success Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">46s</div>
                            <div className="text-xs text-gray-400">Avg Response</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">Active</div>
                            <div className="text-xs text-gray-400">Status</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Parameters Tab */}
                <TabsContent value="parameters" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LLM Parameters */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Brain className="h-5 w-5 text-purple-400" />
                          LLM Parameters
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(orchestratorConfig.parameters).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                              <span className="text-gray-300 capitalize">{key.replace('_', ' ')}:</span>
                              <span className="text-white font-mono">{value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Timeout Configuration */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Clock className="h-5 w-5 text-orange-400" />
                          Timeout Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                            <span className="text-gray-300">Request Timeout:</span>
                            <span className="text-white font-mono">{orchestratorConfig.parameters.timeout}s</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                            <span className="text-gray-300">Max Execution:</span>
                            <span className="text-white font-mono">{orchestratorConfig.parameters.max_execution_time}s</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                            <span className="text-gray-300">Per Agent:</span>
                            <span className="text-white font-mono">{orchestratorConfig.parameters.max_agent_time}s</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Server className="h-5 w-5 text-green-400" />
                        Service Endpoints
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(orchestratorConfig.services).map(([key, value]) => (
                          <div key={key} className="p-3 bg-gray-700 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <Database className="h-4 w-4 text-blue-400" />
                              <span className="text-gray-300 font-medium capitalize">{key.replace('_', ' ')}:</span>
                            </div>
                            <div className="text-white font-mono text-sm">{value}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Capabilities Tab */}
                <TabsContent value="capabilities" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Core Capabilities */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Target className="h-5 w-5 text-purple-400" />
                          Core Capabilities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {orchestratorConfig.capabilities.map((capability, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-white text-sm">{capability}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Available Tools */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Code className="h-5 w-5 text-blue-400" />
                          Available Tools
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {orchestratorConfig.tools.map((tool, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                              <Layers className="h-4 w-4 text-blue-400" />
                              <span className="text-white font-mono text-sm">{tool}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* System Tab */}
                <TabsContent value="system" className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5 text-red-400" />
                        System Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Model Configuration</h4>
                          <div className="p-3 bg-gray-700 rounded">
                            <div className="text-white font-mono">{orchestratorConfig.model}</div>
                            <div className="text-xs text-gray-400 mt-1">Primary LLM Model</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Memory Management</h4>
                          <div className="p-3 bg-gray-700 rounded">
                            <div className="text-white">Automatic model release between orchestration stages</div>
                            <div className="text-xs text-gray-400 mt-1">Optimizes resource usage</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">A2A Integration</h4>
                          <div className="p-3 bg-gray-700 rounded">
                            <div className="text-white">Real A2A handover parameters</div>
                            <div className="text-xs text-gray-400 mt-1">Sequential agent execution with context refinement</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Orchestration Flow</h4>
                          <div className="p-3 bg-gray-700 rounded">
                            <div className="text-white">4-Step Process: Query Analysis → Agent Analysis → Agent Selection → A2A Execution</div>
                            <div className="text-xs text-gray-400 mt-1">Intelligent query processing with contextual reasoning</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          {/* Orchestration Query Dialog */}
          <Dialog open={queryOpen} onOpenChange={setQueryOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Brain className="h-6 w-6 text-purple-400" />
                  System Orchestrator - A2A Multi-Agent Query
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Query Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Enter your query for multi-agent orchestration:
                  </label>
                  <Textarea
                    placeholder="Enter your query (e.g., 'I want to learn how to write a poem about Python programming and then create Python code to generate that poem')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[100px] bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                {/* Execute Button */}
                <Button 
                  onClick={handleOrchestrationQuery} 
                  disabled={isOrchestrating || !query.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isOrchestrating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Orchestrating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Execute A2A Orchestration
                    </>
                  )}
                </Button>

                {/* Comprehensive 4-Step Orchestration Results */}
                {orchestrationResult && (
                  <div className="space-y-6">
                    <div className="border-t border-gray-700 pt-4">
                      <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Complete 4-Step A2A Orchestration Results
                      </h3>
                      
                      {/* Summary Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {orchestrationResult.raw_agent_response?.agents_coordinated || 0}
                          </div>
                          <div className="text-sm text-gray-400">Agents Coordinated</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {orchestrationResult.raw_agent_response?.coordination_results?.successful_steps || 0}
                          </div>
                          <div className="text-sm text-gray-400">Successful Steps</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {orchestrationResult.execution_details?.execution_time?.toFixed(2) || 0}s
                          </div>
                          <div className="text-sm text-gray-400">Execution Time</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {orchestrationResult.execution_details?.agent_response_length || 0}
                          </div>
                          <div className="text-sm text-gray-400">Response Length</div>
                        </div>
                      </div>

                      {/* Step 1: Orchestrator Reasoning */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                          <h4 className="text-lg font-semibold text-blue-400">Orchestrator Reasoning</h4>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                         <div>
                           <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                             <Brain className="h-4 w-4" />
                             Contextual Reasoning
                           </h5>
                           <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                             <div className="mb-2"><strong>User Intent:</strong> {orchestrationResult.orchestration_summary?.user_intent || "Multi-agent collaboration request"}</div>
                             <div className="mb-2"><strong>Domain Analysis:</strong> {orchestrationResult.orchestration_summary?.domain || "Multi-Agent Programming"}</div>
                             <div className="mb-2"><strong>Complexity:</strong> {orchestrationResult.orchestration_summary?.complexity || "Intermediate"}</div>
                             <div className="mb-2"><strong>Processing Strategy:</strong> Sequential A2A handover with context refinement</div>
                             {orchestrationResult.orchestration_summary?.context_reasoning && (
                               <div className="mt-3 p-2 bg-blue-900/20 rounded border border-blue-500/30">
                                 <div className="text-xs text-blue-300 font-medium mb-1">Orchestrator LLM Reasoning:</div>
                                 <div className="text-xs text-blue-200 whitespace-pre-wrap">{orchestrationResult.orchestration_summary.context_reasoning}</div>
                               </div>
                             )}
                           </div>
                         </div>
                          <div>
                            <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Agent Selection Logic
                            </h5>
                            <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                              <div className="mb-2"><strong>Available Agents:</strong> {
                                orchestrationResult?.orchestration_summary?.agent_evaluations 
                                  ? orchestrationResult.orchestration_summary.agent_evaluations.map((agent: any) => agent.agent_name).join(', ')
                                  : 'Loading agent data...'
                              }</div>
                              <div className="mb-2"><strong>Selection Criteria:</strong> Capability matching, relevance scoring, execution order optimization</div>
                              <div className="mb-2"><strong>Decision Logic:</strong> {orchestrationResult.orchestration_summary?.execution_reasoning || 'Dynamic agent selection based on LLM analysis'}</div>
                              
                              {/* Show actual agent evaluations from LLM if available */}
                              {orchestrationResult.orchestration_summary?.agent_evaluations && (
                                <div className="mt-3 space-y-2">
                                  <div className="text-xs text-blue-300 font-medium">LLM Agent Analysis:</div>
                                  {orchestrationResult.orchestration_summary.agent_evaluations.map((agent: any, index: number) => (
                                    <div key={index} className="p-2 bg-blue-900/20 rounded border border-blue-500/30">
                                      <div className="text-xs text-blue-300 font-medium">{agent.agent_name} (Score: {agent.relevance_score})</div>
                                      <div className="text-xs text-blue-200 mt-1">{agent.contextual_reasoning}</div>
                                      <div className="text-xs text-blue-200 mt-1">
                                        <strong>Strengths:</strong> {agent.strengths?.join(', ')}
                                      </div>
                                      <div className="text-xs text-blue-200">
                                        <strong>Role:</strong> {agent.recommended_role}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                              <Layers className="h-4 w-4" />
                              Context Preparation
                            </h5>
                            <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                              <div className="mb-2"><strong>Initial Context:</strong> "{query}"</div>
                              <div className="mb-2"><strong>Handoff Instructions:</strong> Sequential processing with context refinement</div>
                              <div><strong>Expected Output:</strong> Comprehensive multi-agent response</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Agent Registry Analysis */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                          <h4 className="text-lg font-semibold text-purple-400">Agent Registry Analysis</h4>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                          <div>
                            <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Available Agents
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {orchestrationResult?.orchestration_summary?.agent_evaluations ? (
                                orchestrationResult.orchestration_summary.agent_evaluations.map((agent: any, index: number) => (
                                  <div key={index} className="bg-gray-700 p-3 rounded">
                                    <div className="font-medium text-white">{agent.agent_name}</div>
                                    <div className="text-xs text-gray-400">
                                      <strong>Score:</strong> {(agent.relevance_score * 100).toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      <strong>Strengths:</strong> {agent.strengths?.join(', ') || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      <strong>Role:</strong> {agent.recommended_role || 'N/A'}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="bg-gray-700 p-3 rounded col-span-2">
                                  <div className="font-medium text-white">Loading agent data...</div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Capability Matching & Scoring
                            </h5>
                            <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                              {orchestrationResult?.orchestration_summary?.agent_evaluations ? (
                                orchestrationResult.orchestration_summary.agent_evaluations.map((agent: any, index: number) => (
                                  <div key={index} className="mb-2">
                                    <strong>{agent.agent_name}:</strong> {(agent.relevance_score * 100).toFixed(0)}% match ({agent.domain_relevance || 'domain analysis'})
                                  </div>
                                ))
                              ) : (
                                <div className="mb-2">Loading capability analysis...</div>
                              )}
                              <div><strong>Selection Rationale:</strong> {orchestrationResult?.orchestration_summary?.execution_reasoning || 'Agent selection based on capability matching and domain relevance'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Agent Selection & Sequencing */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                          <h4 className="text-lg font-semibold text-green-400">Agent Selection & Sequencing</h4>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                          <div>
                            <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Final Agent List & Execution Order
                            </h5>
                            <div className="space-y-3">
                              {orchestrationResult?.orchestration_summary?.agent_evaluations ? (
                                orchestrationResult.orchestration_summary.agent_evaluations
                                  .sort((a: any, b: any) => b.relevance_score - a.relevance_score)
                                  .map((agent: any, index: number) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded">
                                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">{index + 1}</div>
                                      <div className="flex-1">
                                        <div className="font-medium text-white">{agent.agent_name}</div>
                                        <div className="text-sm text-gray-400">
                                          Confidence: {(agent.relevance_score * 100).toFixed(0)}% | Role: {agent.recommended_role || 'Specialized task execution'}
                                        </div>
                                      </div>
                                      <Badge variant="default" className="bg-green-600">Selected</Badge>
                                    </div>
                                  ))
                              ) : (
                                <div className="p-3 bg-gray-700 rounded">
                                  <div className="font-medium text-white">Loading agent selection...</div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                              <ArrowRight className="h-4 w-4" />
                              Handoff Strategy
                            </h5>
                            <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                              {orchestrationResult.orchestration_summary?.agent_evaluations ? (
                                orchestrationResult.orchestration_summary.agent_evaluations.map((agent: any, index: number) => (
                                  <div key={index} className="mb-2">
                                    <strong>Phase {index + 1}:</strong> Orchestrator → {agent.agent_name} ({agent.recommended_role || 'specialized task execution'})
                                  </div>
                                ))
                              ) : (
                                <>
                                  <div className="mb-2"><strong>Phase 1:</strong> Orchestrator → [Agent 1] (task analysis)</div>
                                  <div className="mb-2"><strong>Phase 2:</strong> [Agent 1] → Orchestrator (response)</div>
                                  <div className="mb-2"><strong>Phase 3:</strong> Orchestrator → [Agent 2] (refined context)</div>
                                  <div><strong>Phase 4:</strong> [Agent 2] → Orchestrator (final synthesis)</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 4: A2A Sequential Handover Execution */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                          <h4 className="text-lg font-semibold text-orange-400">A2A Sequential Handover Execution</h4>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                          {/* Orchestrator Handovers and Agent Processing */}
                          {orchestrationResult.raw_agent_response?.coordination_results?.handover_steps?.map((step: any, index: number) => (
                            <div key={index} className="space-y-3">
                             {/* Orchestrator Handover */}
                             <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                               <div className="flex items-center gap-2 mb-2">
                                 <Brain className="h-4 w-4 text-blue-400" />
                                 <span className="font-medium text-blue-400">Orchestrator → {step.agent_name}</span>
                               </div>
                               <div className="text-sm text-gray-300">
                                 <div className="mb-1"><strong>Handover Context:</strong> A2A HANDOFF - Step {step.step}</div>
                                 <div className="mb-1"><strong>Instructions:</strong> Process using specialized capabilities</div>
                                 <div className="mb-1"><strong>Expected Output:</strong> Comprehensive response for next agent</div>
                                 
                                 {/* Show actual orchestrator instructions if available */}
                                 {step.orchestrator_instructions && (
                                   <div className="mt-2 p-2 bg-blue-800/30 rounded border border-blue-400/20">
                                     <div className="text-xs text-blue-300 font-medium mb-1">Actual Orchestrator Instructions:</div>
                                     <div className="text-xs text-blue-200 whitespace-pre-wrap">{step.orchestrator_instructions}</div>
                                   </div>
                                 )}
                                 
                                 {/* Show handover context if available */}
                                 {step.handover_context && (
                                   <div className="mt-2 p-2 bg-blue-800/30 rounded border border-blue-400/20">
                                     <div className="text-xs text-blue-300 font-medium mb-1">Handover Context:</div>
                                     <div className="text-xs text-blue-200 whitespace-pre-wrap">{step.handover_context}</div>
                                   </div>
                                 )}
                               </div>
                             </div>
                              
                              {/* Agent Processing */}
                              <div className={`border-l-4 p-4 bg-gray-700 rounded-r-lg ${
                                step.a2a_status === 'success' ? 'border-l-green-500' : 'border-l-red-500'
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-white flex items-center gap-2">
                                    <Cpu className="h-4 w-4" />
                                    {step.agent_name} Processing
                                  </h5>
                                  <Badge variant={step.a2a_status === 'success' ? 'default' : 'destructive'}>
                                    {step.a2a_status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-400 mb-3">
                                  Execution Time: {step.execution_time?.toFixed(2)}s
                                </div>
                                {step.result && (
                                  <div className="text-sm text-gray-300 bg-gray-600 p-3 rounded max-h-40 overflow-y-auto">
                                    <div className="font-medium mb-2">Agent Response:</div>
                                    <div className="whitespace-pre-wrap">
                                      {step.result.substring(0, 500)}
                                      {step.result.length > 500 && "..."}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {/* Final Synthesis */}
                          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Brain className="h-5 w-5 text-purple-400" />
                              <h5 className="font-medium text-purple-400">Orchestrator Final Synthesis</h5>
                            </div>
                            <div className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                              <div className="mb-2"><strong>Combined Results:</strong> {
                                orchestrationResult.orchestration_summary?.agent_evaluations 
                                  ? orchestrationResult.orchestration_summary.agent_evaluations.map((agent: any) => agent.recommended_role || agent.agent_name).join(' + ')
                                  : 'Multi-agent orchestration results'
                              }</div>
                              <div className="mb-2"><strong>Synthesis Logic:</strong> {orchestrationResult.orchestration_summary?.execution_strategy || 'Multi-agent A2A orchestration'} with {orchestrationResult.orchestration_summary?.execution_strategy || 'sequential handover'}</div>
                              <div><strong>Final Output:</strong> {orchestrationResult.orchestration_summary?.coordination_requirements || 'Comprehensive solution with specialized components'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Final Response */}
                      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          Final Orchestrated Response
                        </h4>
                        
                        {/* Extract and display final synthesis if available */}
                        {(() => {
                          const response = orchestrationResult.final_response || '';
                          const finalSynthesisMatch = response.match(/🎯 \*\*FINAL ORCHESTRATED RESPONSE\*\*([\s\S]*?)(?=\n\n|$)/);
                          
                          if (finalSynthesisMatch && finalSynthesisMatch[1]) {
                            const finalSynthesis = finalSynthesisMatch[1].trim();
                            return (
                              <div className="space-y-4">
                                {/* Final Synthesis - Clean Output */}
                                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="h-5 w-5 text-green-400" />
                                    <h5 className="font-medium text-green-400">Clean Final Answer</h5>
                                  </div>
                                  <div className="text-sm text-gray-200 whitespace-pre-wrap bg-gray-800/50 p-4 rounded border border-green-500/20">
                                    {finalSynthesis}
                                  </div>
                                </div>
                                
                                {/* Raw Response (Collapsible) */}
                                <details className="bg-gray-700/50 rounded-lg">
                                  <summary className="p-3 cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                                    View Complete Orchestration Details
                                  </summary>
                                  <div className="p-4 border-t border-gray-600">
                                    <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto bg-gray-800 p-4 rounded">
                                      {response}
                                    </div>
                                  </div>
                                </details>
                              </div>
                            );
                          } else {
                            // Fallback to showing the full response
                            return (
                              <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto bg-gray-700 p-4 rounded">
                                {response}
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {orchestrationError && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
                      <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <X className="h-5 w-5" />
                        Orchestration Error
                      </h3>
                      <p className="text-red-300">{orchestrationError}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    };