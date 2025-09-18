import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Play, 
  BarChart3,
  Clock,
  Zap,
  Cpu,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { ollamaAgentService, OllamaAgentConfig } from '@/lib/services/OllamaAgentService';
import { OllamaAgentDialog } from '@/components/CommandCentre/CreateAgent/OllamaAgentDialog';
import { InlineAgentChat } from '@/components/InlineAgentChat';
import { DebugOllamaAgent } from '@/components/DebugOllamaAgent';
import { AgentConfigDialog } from '@/components/AgentConfigDialog';
import { useToast } from '@/hooks/use-toast';

export const OllamaAgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<OllamaAgentConfig[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<OllamaAgentConfig | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatAgent, setChatAgent] = useState<OllamaAgentConfig | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState<string | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [configAgent, setConfigAgent] = useState<OllamaAgentConfig | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load agents immediately (synchronous)
    loadAgents();
    
    // Load health status in background (non-blocking)
    setTimeout(() => {
      loadHealthStatus();
    }, 100);
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadAgents();
      loadHealthStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadAgents = () => {
    try {
      const allAgents = ollamaAgentService.getAllAgents();
      setAgents(allAgents);
    } catch (error) {
      toast({
        title: "Failed to load agents",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadHealthStatus = async () => {
    try {
      const status = await ollamaAgentService.healthCheck();
      setHealthStatus(status);
    } catch (error) {
      console.error('Failed to load health status:', error);
    }
  };

  const handleAgentCreated = (agent: OllamaAgentConfig) => {
    setAgents(prev => [...prev, agent]);
    toast({
      title: "Agent Created",
      description: `${agent.name} is ready to use!`,
    });
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const success = await ollamaAgentService.deleteAgent(agentId);
      if (success) {
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
        if (selectedAgent?.id === agentId) {
          setSelectedAgent(null);
          setShowChat(false);
        }
        toast({
          title: "Agent Deleted",
          description: "Agent has been removed successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to delete agent",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const handleShowConfig = (agent: OllamaAgentConfig) => {
    setConfigAgent(agent);
    setShowConfigDialog(true);
  };

  const handleChatWithAgent = async (agent: OllamaAgentConfig) => {
    setChatLoading(agent.id);
    
    try {
      // First check if Ollama is running
      const healthStatus = await ollamaAgentService.healthCheck();
      
      if (healthStatus.ollamaStatus !== 'running') {
        throw new Error('Ollama is not running. Please start Ollama first.');
      }

      // Open the chat panel
      setChatAgent(agent);
      setShowChat(true);
      
      toast({
        title: "Chat Opened",
        description: `Ready to chat with ${agent.name}`,
      });

    } catch (error) {
      console.error('Chat failed:', error);
      toast({
        title: "Chat Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setChatLoading(null);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setChatAgent(null);
    // Refresh metrics after chat session
    loadAgents();
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Removed OllamaAgentChat for now - using direct chat functionality

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="text-purple-400" />
              Ollama Agent Management
            </h1>
            <p className="text-gray-400 mt-2">
              Create, manage, and interact with your local AI agents powered by Ollama models
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadAgents}>
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus size={16} className="mr-2" />
              Create Agent
            </Button>
          </div>
        </div>

        {/* Health Status */}
        {healthStatus && (
          <Alert className={`border-${healthStatus.status === 'healthy' ? 'green' : healthStatus.status === 'degraded' ? 'yellow' : 'red'}-500 bg-${healthStatus.status === 'healthy' ? 'green' : healthStatus.status === 'degraded' ? 'yellow' : 'red'}-500/10`}>
            {healthStatus.status === 'healthy' ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  System Status: {healthStatus.status} • Ollama: {healthStatus.ollamaStatus} • 
                  {healthStatus.agentCount} agents • {healthStatus.totalExecutions} total executions
                </span>
                {healthStatus.errors.length > 0 && (
                  <span className="text-sm">
                    {healthStatus.errors.length} error(s)
                  </span>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="agents" className="data-[state=active]:bg-purple-600">
              <Bot className="h-4 w-4 mr-2" />
              Agents ({agents.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="debug" className="data-[state=active]:bg-purple-600">
              🐛 Debug
            </TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                <p>Loading agents...</p>
              </div>
            ) : agents.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="text-center py-12">
                  <Bot size={64} className="mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Agents Created</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first Ollama agent to get started with local AI conversations
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus size={16} className="mr-2" />
                    Create Your First Agent
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => {
                  const metrics = ollamaAgentService.getAgentMetrics(agent.id);
                  
                  return (
                    <Card key={agent.id} className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Bot className="text-purple-400" size={20} />
                            {agent.name}
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleChatWithAgent(agent)}
                              disabled={chatLoading === agent.id}
                            >
                              {chatLoading === agent.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              ) : (
                                <MessageSquare size={14} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShowConfig(agent)}
                              title="View Agent Configuration"
                            >
                              <Settings size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAgent(agent.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-2">
                            <Cpu size={14} />
                            <span>{agent.model}</span>
                            <Badge variant="secondary">Local</Badge>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* System Prompt Preview */}
                          <div>
                            <p className="text-sm text-gray-400 mb-1">System Prompt:</p>
                            <p className="text-sm text-gray-300 line-clamp-2">
                              {agent.systemPrompt || 'No system prompt set'}
                            </p>
                          </div>

                          {/* Configuration */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Temperature:</span>
                              <span className="ml-2 text-white">{agent.temperature}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Max Tokens:</span>
                              <span className="ml-2 text-white">{agent.maxTokens}</span>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-1">
                            {agent.memory.shortTerm && <Badge variant="outline" className="text-xs">Short Memory</Badge>}
                            {agent.memory.longTerm && <Badge variant="outline" className="text-xs">Long Memory</Badge>}
                            {agent.ragEnabled && <Badge variant="outline" className="text-xs">RAG</Badge>}
                            {agent.guardrails.enabled && <Badge variant="outline" className="text-xs">Guardrails</Badge>}
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-700">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <MessageSquare size={12} className="text-blue-400" />
                                <span className="text-xs text-gray-400">Chats</span>
                              </div>
                              <p className="text-sm font-semibold">{metrics.totalExecutions}</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Clock size={12} className="text-yellow-400" />
                                <span className="text-xs text-gray-400">Avg</span>
                              </div>
                              <p className="text-sm font-semibold">
                                {metrics.totalExecutions > 0 ? formatDuration(metrics.averageResponseTime) : '-'}
                              </p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Zap size={12} className="text-green-400" />
                                <span className="text-xs text-gray-400">Success</span>
                              </div>
                              <p className="text-sm font-semibold">
                                {metrics.totalExecutions > 0 ? 
                                  `${Math.round((metrics.successfulExecutions / metrics.totalExecutions) * 100)}%` : 
                                  '-'
                                }
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button
                            onClick={() => handleChatWithAgent(agent)}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            size="sm"
                            disabled={chatLoading === agent.id}
                          >
                            {chatLoading === agent.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Chatting...
                              </>
                            ) : (
                              <>
                                <Play size={14} className="mr-2" />
                                Start Chat
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Bot className="text-purple-400" size={16} />
                    Total Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agents.length}</div>
                  <p className="text-xs text-gray-400">Active local agents</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="text-blue-400" size={16} />
                    Total Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {agents.reduce((sum, agent) => sum + ollamaAgentService.getAgentMetrics(agent.id).totalExecutions, 0)}
                  </div>
                  <p className="text-xs text-gray-400">Across all agents</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="text-green-400" size={16} />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(() => {
                      const totalExecs = agents.reduce((sum, agent) => sum + ollamaAgentService.getAgentMetrics(agent.id).totalExecutions, 0);
                      const successfulExecs = agents.reduce((sum, agent) => sum + ollamaAgentService.getAgentMetrics(agent.id).successfulExecutions, 0);
                      return totalExecs > 0 ? `${Math.round((successfulExecs / totalExecs) * 100)}%` : '-';
                    })()}
                  </div>
                  <p className="text-xs text-gray-400">Overall success rate</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="text-yellow-400" size={16} />
                    Total Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {agents.reduce((sum, agent) => sum + ollamaAgentService.getAgentMetrics(agent.id).totalTokensUsed, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-400">Tokens processed</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-gray-800 border-gray-700 mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest agent executions across all agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ollamaAgentService.getAllExecutions().slice(0, 10).map((execution) => {
                    const agent = agents.find(a => a.id === execution.agentId);
                    return (
                      <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bot className="text-purple-400" size={16} />
                          <div>
                            <p className="text-sm font-medium">{agent?.name || 'Unknown Agent'}</p>
                            <p className="text-xs text-gray-400 truncate max-w-md">
                              {execution.input}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Badge variant={execution.success ? "default" : "destructive"}>
                            {execution.success ? "Success" : "Failed"}
                          </Badge>
                          <span>{execution.tokensUsed} tokens</span>
                          <span>{formatDuration(execution.duration)}</span>
                          <span>{execution.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Debug Tab */}
          <TabsContent value="debug">
            <DebugOllamaAgent />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Panel */}
      {showChat && chatAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl h-[80vh]">
            <React.Suspense fallback={
              <Card className="bg-gray-800 border-gray-700 h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                  <p className="text-gray-400">Initializing chat...</p>
                </div>
              </Card>
            }>
              <InlineAgentChat
                agent={chatAgent}
                onClose={handleCloseChat}
              />
            </React.Suspense>
          </div>
        </div>
      )}



      {/* Create Agent Dialog */}
      <OllamaAgentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onAgentCreated={handleAgentCreated}
      />

      {/* Agent Configuration Dialog */}
      <AgentConfigDialog
        agent={configAgent}
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
      />
    </div>
  );
};