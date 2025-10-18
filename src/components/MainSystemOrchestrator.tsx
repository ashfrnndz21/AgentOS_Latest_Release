import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Network,
  CheckCircle,
  Search,
  Workflow,
  RefreshCw,
  Play,
  Users,
  Activity,
  Database,
  Server,
  Code,
  Shield,
  Layers,
  ArrowRight,
  Target,
  Bot,
  Globe
} from 'lucide-react';

interface AgentCapability {
  agent_id: string;
  name: string;
  capabilities: string[];
  model: string;
  status: string;
  a2a_enabled: boolean;
}

interface OrchestrationResult {
  session_id: string;
  status: string;
  agents_involved: string[];
  workflow_steps: any[];
  orchestration_results: any;
  total_execution_time: number;
  final_response?: string;
  success: boolean;
}

export const MainSystemOrchestrator: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResult | null>(null);
  const [orchestrationError, setOrchestrationError] = useState<string | null>(null);
  const [availableAgents, setAvailableAgents] = useState<AgentCapability[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('orchestrate');

  const BASE_URL = 'http://localhost:5031';

  // Load initial data
  useEffect(() => {
    loadHealthStatus();
    loadAvailableAgents();
    loadSessions();
  }, []);

  const loadHealthStatus = async () => {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
      }
    } catch (error) {
      console.error('Failed to load health status:', error);
    }
  };

  const loadAvailableAgents = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/main-orchestrator/discover-agents`);
      if (response.ok) {
        const data = await response.json();
        setAvailableAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to load available agents:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/main-orchestrator/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.session_history || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleOrchestrate = async () => {
    if (!query.trim()) {
      setOrchestrationError('Please enter a query');
      return;
    }

    setIsOrchestrating(true);
    setOrchestrationError(null);
    setOrchestrationResult(null);

    try {
      const response = await fetch(`${BASE_URL}/api/main-orchestrator/orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrchestrationResult(data.orchestration_result);
        loadSessions(); // Refresh sessions
      } else {
        const errorData = await response.json();
        setOrchestrationError(errorData.error || 'Orchestration failed');
      }
    } catch (error) {
      setOrchestrationError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsOrchestrating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setOrchestrationError('Please enter a query');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/main-orchestrator/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Query Analysis:', data.analysis);
        // You could display this in a modal or separate section
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Main System Orchestrator</h2>
          <p className="text-gray-400 mt-2">
            Independent backend orchestrator using Granite4:micro with A2A Strands SDK integration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-400 border-green-400">
            <Bot className="w-3 h-3 mr-1" />
            Granite4:micro
          </Badge>
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            <Network className="w-3 h-3 mr-1" />
            A2A Enabled
          </Badge>
        </div>
      </div>

      {/* Health Status */}
      {healthStatus && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{healthStatus.status}</div>
                <div className="text-sm text-gray-400">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{healthStatus.model}</div>
                <div className="text-sm text-gray-400">Model</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{healthStatus.active_sessions}</div>
                <div className="text-sm text-gray-400">Active Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{healthStatus.registered_agents}</div>
                <div className="text-sm text-gray-400">Registered Agents</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="orchestrate" className="data-[state=active]:bg-purple-600">
            <Workflow className="w-4 h-4 mr-2" />
            Orchestrate
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-purple-600">
            <Users className="w-4 h-4 mr-2" />
            Agents ({availableAgents.length})
          </TabsTrigger>
          <TabsTrigger value="sessions" className="data-[state=active]:bg-purple-600">
            <Database className="w-4 h-4 mr-2" />
            Sessions ({sessions.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Orchestrate Tab */}
        <TabsContent value="orchestrate" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                Query Orchestration
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter a query to orchestrate across available agents using Granite4:micro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  placeholder="Enter your query for multi-agent orchestration..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[120px] bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleOrchestrate}
                  disabled={isOrchestrating || !query.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isOrchestrating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Orchestrating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Orchestrate
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleAnalyze}
                  disabled={!query.trim()}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Analyze Only
                </Button>
              </div>

              {orchestrationError && (
                <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
                  <p className="text-red-400">Error: {orchestrationError}</p>
                </div>
              )}

              {orchestrationResult && (
                <div className="space-y-4">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                        Orchestration Result
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            Session: {orchestrationResult.session_id.slice(0, 8)}...
                          </Badge>
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {orchestrationResult.agents_involved.length} Agents
                          </Badge>
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            {orchestrationResult.total_execution_time.toFixed(2)}s
                          </Badge>
                        </div>
                        
                        {orchestrationResult.final_response && (
                          <div className="mt-4">
                            <h4 className="text-white font-semibold mb-2">Final Response:</h4>
                            <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                              <p className="text-gray-300 whitespace-pre-wrap">
                                {orchestrationResult.final_response}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Orchestration-Enabled Agents
              </CardTitle>
              <CardDescription className="text-gray-400">
                Agents registered for A2A orchestration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableAgents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No orchestration-enabled agents found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create and register agents with orchestration enabled
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableAgents.map((agent) => (
                    <Card key={agent.agent_id} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-semibold">{agent.name}</h3>
                            <p className="text-sm text-gray-400">ID: {agent.agent_id.slice(0, 8)}...</p>
                            <p className="text-sm text-gray-400">Model: {agent.model}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={agent.status === 'active' ? 'text-green-400 border-green-400' : 'text-gray-400 border-gray-400'}
                            >
                              {agent.status}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={agent.a2a_enabled ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-gray-400'}
                            >
                              A2A
                            </Badge>
                          </div>
                        </div>
                        {agent.capabilities.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-400">Capabilities:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {agent.capabilities.map((capability) => (
                                <Badge key={capability} variant="secondary" className="text-xs">
                                  {capability}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2 text-green-400" />
                Orchestration Sessions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Recent orchestration sessions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No orchestration sessions yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Run your first orchestration to see session history
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <Card key={index} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-semibold">
                            Session {session.session_id.slice(0, 8)}...
                          </h3>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">Query: {session.query}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{session.agents_involved.length} agents</span>
                          <span>{session.total_execution_time.toFixed(2)}s</span>
                          <span>{new Date(session.timestamp).toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
                Orchestration Analytics
              </CardTitle>
              <CardDescription className="text-gray-400">
                Performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{sessions.length}</div>
                  <div className="text-sm text-gray-400">Total Sessions</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {sessions.length > 0 ? (sessions.reduce((sum, s) => sum + s.total_execution_time, 0) / sessions.length).toFixed(2) : '0.00'}s
                  </div>
                  <div className="text-sm text-gray-400">Avg Execution Time</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{availableAgents.length}</div>
                  <div className="text-sm text-gray-400">Available Agents</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

