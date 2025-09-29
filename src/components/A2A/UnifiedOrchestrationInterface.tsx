import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Server,
  Send
} from 'lucide-react';
import { unifiedOrchestrationService, OrchestrationResponse } from '@/lib/services/UnifiedOrchestrationService';

interface ChatEntry {
  query: string;
  response: string;
  timestamp: string;
  session_id?: string;
  workflow_summary?: any;
  analysis?: any;
}

export const UnifiedOrchestrationInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Load system status on mount
  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      const status = await unifiedOrchestrationService.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const handleOrchestrationQuery = async () => {
    if (!query.trim()) return;

    setIsOrchestrating(true);
    setError(null);
    setOrchestrationResult(null);

    try {
      const result = await unifiedOrchestrationService.orchestrate({
        query: query.trim(),
        options: {
          enable_observability: true
        }
      });

      setOrchestrationResult(result);
      
      // Add to chat history
      setChatHistory(prev => [...prev, {
        query: query.trim(),
        response: result.response,
        timestamp: new Date().toISOString(),
        session_id: result.session_id,
        workflow_summary: result.workflow_summary,
        analysis: result.analysis
      }]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Orchestration failed');
      console.error('Orchestration error:', err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const handleQuickOrchestration = async () => {
    if (!query.trim()) return;

    setIsOrchestrating(true);
    setError(null);

    try {
      const result = await unifiedOrchestrationService.quickOrchestrate({
        query: query.trim()
      });

      // Add to chat history
      setChatHistory(prev => [...prev, {
        query: query.trim(),
        response: result.response,
        timestamp: new Date().toISOString()
      }]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quick orchestration failed');
      console.error('Quick orchestration error:', err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'unhealthy':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
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
              <h1 className="text-2xl font-bold text-white">Unified Orchestration System</h1>
              <p className="text-gray-400">6-Stage LLM Analysis + Dynamic Agent Discovery + A2A Communication</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              <Network className="h-3 w-3 mr-1" />
              Unified API
            </Badge>
            {systemStatus && (
              <Badge 
                variant="outline" 
                className={`${
                  systemStatus.status === 'healthy' ? 'border-green-400 text-green-400' :
                  systemStatus.status === 'degraded' ? 'border-yellow-400 text-yellow-400' :
                  'border-red-400 text-red-400'
                }`}
              >
                {getStatusIcon(systemStatus.status)}
                <span className="ml-1">{systemStatus.status}</span>
              </Badge>
            )}
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
              <TabsTrigger value="workflow" className="data-[state=active]:bg-purple-600">
                <Layers className="h-4 w-4 mr-2" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="status" className="data-[state=active]:bg-purple-600">
                <Activity className="h-4 w-4 mr-2" />
                Status
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
                              {/* Workflow Summary */}
                              {entry.workflow_summary && (
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline" className="text-green-400 border-green-400">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {entry.workflow_summary.stages_completed}/{entry.workflow_summary.total_stages} Stages
                                  </Badge>
                                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                                    <Users className="h-3 w-3 mr-1" />
                                    {entry.workflow_summary.agents_used.length} Agents
                                  </Badge>
                                  <Badge variant="outline" className="text-purple-400 border-purple-400">
                                    <Timer className="h-3 w-3 mr-1" />
                                    {formatDuration(entry.workflow_summary.processing_time)}
                                  </Badge>
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
                              <span className="text-white">Unified orchestration in progress...</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                              6-Stage LLM Analysis → Dynamic Agent Discovery → A2A Communication → Clean Output
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
                    <div className="flex flex-col gap-2">
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
                      <Button
                        onClick={handleQuickOrchestration}
                        disabled={isOrchestrating || !query.trim()}
                        variant="outline"
                        className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                        size="sm"
                      >
                        Quick
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="flex-1 p-6">
              {orchestrationResult ? (
                <div className="space-y-6">
                  {/* Workflow Summary */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-400" />
                        Workflow Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {orchestrationResult.workflow_summary.stages_completed}/{orchestrationResult.workflow_summary.total_stages}
                          </div>
                          <p className="text-sm text-gray-400">Stages Completed</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {formatDuration(orchestrationResult.workflow_summary.processing_time)}
                          </div>
                          <p className="text-sm text-gray-400">Processing Time</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {orchestrationResult.workflow_summary.execution_strategy}
                          </div>
                          <p className="text-sm text-gray-400">Strategy</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {orchestrationResult.workflow_summary.agents_used.length}
                          </div>
                          <p className="text-sm text-gray-400">Agents Used</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 6-Stage Analysis */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">6-Stage LLM Analysis</CardTitle>
                      <CardDescription className="text-gray-400">
                        Detailed analysis from the unified orchestrator
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(orchestrationResult.analysis).map(([stage, data]) => (
                          <div key={stage} className="border border-gray-600 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-2">{stage.replace(/_/g, ' ').toUpperCase()}</h4>
                            <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                              {JSON.stringify(data, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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

            {/* Workflow Tab */}
            <TabsContent value="workflow" className="flex-1 p-6">
              {orchestrationResult ? (
                <div className="space-y-6">
                  {/* Workflow Steps */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Layers className="h-5 w-5 text-purple-400" />
                        Unified Workflow Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { step: 1, name: "Complex Analysis", description: "6-Stage LLM Analysis", status: "completed" },
                          { step: 2, name: "Agent Discovery", description: "Dynamic Agent Selection", status: "completed" },
                          { step: 3, name: "A2A Communication", description: "Intelligent Handoffs", status: "completed" },
                          { step: 4, name: "Clean Output", description: "Text Cleaning & Synthesis", status: "completed" }
                        ].map((step) => (
                          <div key={step.step} className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                              {step.step < 4 && (
                                <div className="w-0.5 h-8 bg-gray-600 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{step.name}</h4>
                              <p className="text-gray-400 text-sm">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Agent Selection Details */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Agent Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Available:</span>
                          <span className="text-white">{orchestrationResult.agent_selection.total_available}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Selected Agents:</span>
                          <span className="text-white">{orchestrationResult.agent_selection.selected_agents.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Selection Method:</span>
                          <span className="text-white">LLM-driven discovery</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Workflow details will appear here after orchestration</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Status Tab */}
            <TabsContent value="status" className="flex-1 p-6">
              <div className="space-y-6">
                {/* System Status */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-400" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {systemStatus ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Overall Status:</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(systemStatus.status)}
                            <span className="text-white capitalize">{systemStatus.status}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(systemStatus.components).map(([component, status]) => (
                            <div key={component} className="flex items-center justify-between">
                              <span className="text-gray-400 capitalize">{component.replace(/_/g, ' ')}:</span>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(status as string)}
                                <span className="text-white capitalize">{status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Version:</span>
                          <span className="text-white">{systemStatus.version}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                        <p>Loading system status...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Quick Stats */}
        <div className="w-80 border-l border-gray-700 bg-gray-800 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Unified System</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Orchestrator</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">6-Stage Analysis</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Agent Discovery</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">A2A Communication</span>
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
                    <span className="text-white">{orchestrationResult.workflow_summary.execution_strategy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{formatDuration(orchestrationResult.workflow_summary.processing_time)}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};
