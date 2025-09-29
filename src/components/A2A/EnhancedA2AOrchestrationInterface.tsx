import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bot, 
  MessageSquare, 
  Eye, 
  BarChart3,
  Clock,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Download,
  Network,
  Activity,
  Timer,
  Database,
  Settings,
  Sparkles,
  Brain,
  Layers,
  Target,
  TrendingUp,
  Code,
  Server
} from 'lucide-react';
import { TextCleaningStatus } from './TextCleaningStatus';
import { OutputComparison } from './OutputComparison';

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

interface OrchestrationResult {
  success: boolean;
  session_id: string;
  final_response: string;
  orchestration_summary: {
    execution_strategy: string;
    processing_time: number;
    reasoning_quality: string;
    stages_completed: number;
    total_stages: number;
  };
  stage_1_query_analysis: any;
  stage_2_sequence_definition: any;
  stage_3_execution_strategy: any;
  stage_4_agent_analysis: any;
  stage_5_agent_matching: any;
  stage_6_orchestration_plan: any;
  selected_agent: any;
  execution_details: any;
  raw_agent_response: any;
  agent_registry_analysis: any;
  observability_trace?: any;
}

export const EnhancedA2AOrchestrationInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [observabilityData, setObservabilityData] = useState<A2ATrace | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{query: string, response: string, timestamp: string}>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Real-time updates for active orchestrations
  useEffect(() => {
    if (realTimeUpdates && orchestrationResult?.session_id) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:5018/api/a2a-observability/real-time/${orchestrationResult.session_id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'completed') {
              setRealTimeUpdates(false);
              fetchObservabilityData(orchestrationResult.session_id);
            }
          }
        } catch (error) {
          console.error('Real-time update failed:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [realTimeUpdates, orchestrationResult]);

  const handleOrchestrationQuery = async () => {
    if (!query.trim()) return;

    setIsOrchestrating(true);
    setError(null);
    setOrchestrationResult(null);
    setObservabilityData(null);

    try {
      const response = await fetch('http://localhost:5021/api/orchestrate', {
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
        
        // Add to chat history
        setChatHistory(prev => [...prev, {
          query: query.trim(),
          response: data.final_response || 'Orchestration completed',
          timestamp: new Date().toISOString()
        }]);

        // Fetch observability data if available
        if (data.session_id) {
          setTimeout(() => fetchObservabilityData(data.session_id), 1000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to orchestrate agents');
      }
    } catch (err) {
      setError('Error connecting to orchestration service');
      console.error('Orchestration error:', err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const fetchObservabilityData = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:5018/api/a2a-observability/traces/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setObservabilityData(data.trace);
      }
    } catch (error) {
      console.error('Failed to fetch observability data:', error);
    }
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

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">A2A Orchestration System</h1>
              <p className="text-gray-400">Intelligent multi-agent coordination with full observability</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {orchestrationResult && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportTraceData(orchestrationResult.session_id)}
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Trace
              </Button>
            )}
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              <Network className="h-3 w-3 mr-1" />
              Enhanced A2A
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat Interface */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
              <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="observability" className="data-[state=active]:bg-purple-600">
                <Eye className="h-4 w-4 mr-2" />
                Observability
              </TabsTrigger>
              <TabsTrigger value="cleaning" className="data-[state=active]:bg-purple-600">
                <Sparkles className="h-4 w-4 mr-2" />
                Text Cleaning
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                {/* Chat History */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {chatHistory.map((entry, index) => (
                      <div key={index} className="space-y-3">
                        {/* User Query */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-600 rounded-lg">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                              <p className="text-white">{entry.query}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimestamp(entry.timestamp)}
                            </p>
                          </div>
                        </div>

                        {/* Agent Response */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-600 rounded-lg">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                              {/* Text Cleaning Status */}
                              {orchestrationResult?.cleaning_applied && (
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline" className="text-green-400 border-green-400">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Text Cleaned
                                  </Badge>
                                  <span className="text-xs text-gray-400">
                                    LLM-powered formatting applied
                                  </span>
                                </div>
                              )}
                              <div className="prose prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap text-white text-sm">
                                  {entry.response}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Current Orchestration Status */}
                    {isOrchestrating && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-600 rounded-lg">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-center gap-2">
                              <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                              <span className="text-white">Orchestrating agents...</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                              Analyzing query, selecting agents, and coordinating execution
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-600 rounded-lg">
                          <XCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-red-900/20 rounded-lg p-4 border border-red-600">
                            <p className="text-red-400">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                {/* Query Input */}
                <div className="flex-shrink-0 p-6 border-t border-gray-700">
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Ask a question that requires multiple agents to work together..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-600 text-white resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleOrchestrationQuery();
                        }
                      }}
                    />
                    <Button
                      onClick={handleOrchestrationQuery}
                      disabled={isOrchestrating || !query.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isOrchestrating ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="flex-1 p-6">
              {orchestrationResult ? (
                <div className="space-y-6">
                  {/* Orchestration Summary */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-400" />
                        Orchestration Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {orchestrationResult.orchestration_summary.stages_completed}/{orchestrationResult.orchestration_summary.total_stages}
                          </div>
                          <p className="text-sm text-gray-400">Stages Completed</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {formatDuration(orchestrationResult.orchestration_summary.processing_time)}
                          </div>
                          <p className="text-sm text-gray-400">Processing Time</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {orchestrationResult.orchestration_summary.execution_strategy}
                          </div>
                          <p className="text-sm text-gray-400">Strategy</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {orchestrationResult.orchestration_summary.reasoning_quality}
                          </div>
                          <p className="text-sm text-gray-400">Quality</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stage Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Query Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Domain:</span>
                            <span className="text-white">{orchestrationResult.stage_1_query_analysis.domain}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Complexity:</span>
                            <span className="text-white">{orchestrationResult.stage_1_query_analysis.complexity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Intent:</span>
                            <span className="text-white">{orchestrationResult.stage_1_query_analysis.user_intent}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Agent Selection</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {orchestrationResult.stage_5_agent_matching.selected_agents?.map((agent: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                              <span className="text-white">{agent.agent_name}</span>
                              <Badge variant="outline" className="text-xs">
                                Step {agent.execution_order}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Run an orchestration to see detailed analysis</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Observability Tab */}
            <TabsContent value="observability" className="flex-1 p-6">
              {observabilityData ? (
                <div className="space-y-6">
                  {/* Trace Overview */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Eye className="h-5 w-5 text-purple-400" />
                        Trace Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {observabilityData.agents_involved.length}
                          </div>
                          <p className="text-sm text-gray-400">Agents Involved</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {observabilityData.handoffs.length}
                          </div>
                          <p className="text-sm text-gray-400">Handoffs</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {formatDuration(observabilityData.total_execution_time || 0)}
                          </div>
                          <p className="text-sm text-gray-400">Duration</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            {getStatusIcon(observabilityData.success ? 'success' : 'failed')}
                          </div>
                          <p className="text-sm text-gray-400">Status</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Handoff Timeline */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Handoff Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {observabilityData.handoffs.map((handoff, index) => (
                          <div key={handoff.id} className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                handoff.status === 'completed' ? 'bg-green-600' :
                                handoff.status === 'failed' ? 'bg-red-600' :
                                'bg-blue-600'
                              }`}>
                                <span className="text-xs font-bold text-white">{handoff.handoff_number}</span>
                              </div>
                              {index < observabilityData.handoffs.length - 1 && (
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
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Observability data will appear here after orchestration</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Quick Stats */}
        <div className="w-80 border-l border-gray-700 bg-gray-800 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Orchestration Engine</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Observability</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">A2A Service</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            {orchestrationResult && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Current Session</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Session ID:</span>
                    <span className="text-white font-mono text-xs">
                      {orchestrationResult.session_id.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Strategy:</span>
                    <span className="text-white">{orchestrationResult.orchestration_summary.execution_strategy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{formatDuration(orchestrationResult.orchestration_summary.processing_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Success:</span>
                    <span className={orchestrationResult.success ? "text-green-400" : "text-red-400"}>
                      {orchestrationResult.success ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setQuery("Calculate 2x532 and write a poem")}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Math + Poetry
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setQuery("What's the weather and help me plan my day")}
                >
                  <Server className="h-4 w-4 mr-2" />
                  Weather + Planning
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setQuery("Analyze this data and create a summary")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Data Analysis
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Text Cleaning Tab */}
        <TabsContent value="cleaning" className="flex-1 p-6">
          <div className="space-y-6">
            {/* Text Cleaning Status */}
            <TextCleaningStatus 
              enabled={true}
              className="bg-gray-800 border-gray-700"
            />

            {/* Output Comparison */}
            {orchestrationResult && orchestrationResult.cleaning_applied && (
              <OutputComparison
                rawOutput={orchestrationResult.original_final_response || orchestrationResult.final_response}
                cleanedOutput={orchestrationResult.final_response}
                agentName="Orchestrator"
                cleaningTime={0.5}
                success={orchestrationResult.cleaning_applied}
                className="bg-gray-800 border-gray-700"
              />
            )}

            {/* Chat History with Cleaning Info */}
            {chatHistory.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Chat History with Text Cleaning
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    View how text cleaning was applied to each response
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {chatHistory.map((entry, index) => (
                        <div key={index} className="space-y-2">
                          <div className="text-sm text-gray-400">
                            Query: {entry.query.substring(0, 50)}...
                          </div>
                          <div className="bg-gray-700 rounded p-3">
                            <div className="text-xs text-gray-400 mb-2">
                              Response (Text Cleaning Applied)
                            </div>
                            <div className="text-white text-sm">
                              {entry.response.substring(0, 200)}...
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Cleaning Instructions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Text Cleaning Information</CardTitle>
                <CardDescription className="text-gray-400">
                  How text cleaning improves agent outputs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Removes <code className="bg-gray-700 px-1 rounded">&lt;think&gt;</code> tags and internal reasoning</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Extracts clean, actionable information from agent outputs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Improves readability and professionalism of responses</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                    <span>Applied automatically to all agent handoffs and final responses</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </div>
    </div>
  );
};
