import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Bot, 
  Cpu, 
  Database, 
  Network, 
  Activity, 
  Plus,
  MessageSquare,
  BarChart3,
  Eye,
  Users,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useOllamaModels } from '@/hooks/useOllamaModels';
import { useToast } from '@/hooks/use-toast';

export const StrandsOllamaAgentDashboard: React.FC = () => {
  const { isLoading } = useOllamaModels();
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('agents');
  const { toast } = useToast();

  // Mock data for now to prevent blank screen
  const agents: any[] = [];
  const aggregateMetrics = {
    totalAgents: 0,
    totalExecutions: 0,
    averageResponseTime: 0,
    totalTokensUsed: 0,
    successRate: 1.0
  };

  const getAgentStatus = (agent: any) => {
    // Mock status logic
    return 'ready';
  };

  const handleDeleteAgent = async (agentId: string) => {
    console.log('Delete agent:', agentId);
    toast({
      title: "Feature Coming Soon",
      description: "Agent deletion will be available with full Strands integration",
    });
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400';
      case 'busy': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'busy': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Brain className="text-purple-400" size={32} />
                <span className="text-purple-400 text-xl font-bold">Strands</span>
                <span className="text-gray-400">×</span>
                <Bot className="text-blue-400" size={32} />
                <span className="text-blue-400 text-xl font-bold">Ollama</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Advanced Reasoning Agents</h1>
            <p className="text-gray-400">
              Manage agents with sophisticated reasoning patterns and local model execution
            </p>
          </div>
          
          <Button
            onClick={() => setCreateAgentOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Strands-Ollama Agent
          </Button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Agents</p>
                  <p className="text-2xl font-bold text-white">{aggregateMetrics.totalAgents}</p>
                </div>
                <Bot className="text-blue-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Reasoning Time</p>
                  <p className="text-2xl font-bold text-white">
                    {formatTime(aggregateMetrics.averageResponseTime)}
                  </p>
                </div>
                <Clock className="text-yellow-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Executions</p>
                  <p className="text-2xl font-bold text-white">
                    {aggregateMetrics.totalExecutions}
                  </p>
                </div>
                <Activity className="text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(aggregateMetrics.successRate * 100)}%
                  </p>
                </div>
                <Target className="text-purple-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="agents" className="data-[state=active]:bg-purple-600">
              <Bot className="h-4 w-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="data-[state=active]:bg-purple-600">
              <Brain className="h-4 w-4 mr-2" />
              Reasoning
            </TabsTrigger>
            <TabsTrigger value="orchestration" className="data-[state=active]:bg-purple-600">
              <Network className="h-4 w-4 mr-2" />
              Multi-Agent
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            {isLoading ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                  <p className="text-gray-400">Loading Strands-Ollama agents...</p>
                </CardContent>
              </Card>
            ) : agents.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Strands-Ollama Agents</h3>
                  <p className="text-gray-400 mb-4">
                    Create your first advanced reasoning agent to get started
                  </p>
                  <Button
                    onClick={() => setCreateAgentOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Agent
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {agents.map((agent) => {
                  const status = getAgentStatus(agent);
                  
                  return (
                    <Card key={agent.id} className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <Brain className="text-purple-400" size={20} />
                                <Bot className="text-blue-400" size={20} />
                              </div>
                              <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
                              <div className={`flex items-center gap-1 ${getStatusColor(status)}`}>
                                {getStatusIcon(status)}
                                <span className="text-sm capitalize">{status}</span>
                              </div>
                            </div>
                            
                            {agent.description && (
                              <p className="text-gray-400 text-sm mb-3">{agent.description}</p>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-400 mb-2">Strands Capabilities</p>
                                <div className="flex flex-wrap gap-1">
                                  {agent.capabilities?.map((capability: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                                      {capability}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-400 mb-2">Available Tools</p>
                                <div className="flex flex-wrap gap-1">
                                  {agent.tools?.length > 0 ? agent.tools.map((tool: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                                      {tool}
                                    </Badge>
                                  )) : (
                                    <span className="text-xs text-gray-500">No tools configured</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Cpu size={14} />
                                <span>{agent.model}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>Created {formatDate(agent.created_at)}</span>
                              </div>
                              {agent.memory_enabled && (
                                <div className="flex items-center gap-1">
                                  <Database size={14} />
                                  <span>Memory Enabled</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Conversations: </span>
                                <span className="text-white font-medium">{agent.conversation_count || 0}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Avg Time: </span>
                                <span className="text-white font-medium">{formatTime(agent.avg_response_time || 0)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Tokens Used: </span>
                                <span className="text-white font-medium">{agent.total_tokens_used || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => console.log('Chat with agent:', agent.id)}
                              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAgent(agent.id)}
                              className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Reasoning Tab */}
          <TabsContent value="reasoning" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-purple-400" />
                  Reasoning Patterns Overview
                </CardTitle>
                <CardDescription>
                  Advanced reasoning capabilities available in your Strands-Ollama agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Chain-of-Thought', desc: 'Step-by-step logical reasoning', icon: '🔗', complexity: 'Basic' },
                    { name: 'Tree-of-Thought', desc: 'Multiple path exploration', icon: '🌳', complexity: 'Advanced' },
                    { name: 'Reflection', desc: 'Self-evaluation and improvement', icon: '🪞', complexity: 'Intermediate' },
                    { name: 'Self-Critique', desc: 'Critical analysis of outputs', icon: '🔍', complexity: 'Advanced' },
                    { name: 'Multi-Step', desc: 'Complex problem breakdown', icon: '📋', complexity: 'Intermediate' },
                    { name: 'Analogical', desc: 'Pattern-based reasoning', icon: '🔄', complexity: 'Advanced' }
                  ].map((pattern, index) => (
                    <Card key={index} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{pattern.icon}</span>
                          <h4 className="font-medium text-white">{pattern.name}</h4>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{pattern.desc}</p>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            pattern.complexity === 'Basic' ? 'bg-green-500/20 text-green-300' :
                            pattern.complexity === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {pattern.complexity}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Multi-Agent Orchestration Tab */}
          <TabsContent value="orchestration" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="text-cyan-400" />
                  Multi-Agent Orchestration
                </CardTitle>
                <CardDescription>
                  Coordinate multiple Strands-Ollama agents for collaborative reasoning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="border-cyan-500 bg-cyan-500/10 mb-4">
                  <Network className="h-4 w-4 text-cyan-400" />
                  <AlertDescription>
                    Multi-agent orchestration allows you to create collaborative reasoning networks where agents work together to solve complex problems.
                  </AlertDescription>
                </Alert>
                
                <div className="text-center py-8">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-white mb-2">Multi-Agent Orchestration</h3>
                  <p className="text-gray-400 mb-4">
                    Create collaborative reasoning networks with multiple agents
                  </p>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Network className="h-4 w-4 mr-2" />
                    Create Agent Network
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="text-green-400" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>
                  Monitor and analyze the performance of your Strands-Ollama agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h3>
                  <p className="text-gray-400 mb-4">
                    Detailed performance metrics and reasoning analytics coming soon
                  </p>
                  <Button variant="outline" className="border-gray-600">
                    <Eye className="h-4 w-4 mr-2" />
                    View Detailed Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Coming Soon Message */}
        {createAgentOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-gray-900 border-gray-700 max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-purple-400" />
                  Strands Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Real Strands framework integration is being developed. This will provide:
                </p>
                <ul className="text-sm text-gray-400 space-y-1 mb-4">
                  <li>• Advanced reasoning patterns</li>
                  <li>• Local Ollama model execution</li>
                  <li>• Memory systems</li>
                  <li>• Tool integration</li>
                </ul>
                <div className="flex gap-2">
                  <Button onClick={() => setCreateAgentOpen(false)}>
                    Close
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setCreateAgentOpen(false);
                      window.location.href = '/ollama-agents';
                    }}
                  >
                    Use Basic Ollama Agents
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};