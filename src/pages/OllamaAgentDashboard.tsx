import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
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
  Settings,
  Sparkles,
  Info,
  Eye,
  Wrench,
  Network,
  Users,
  MemoryStick,
  Brain
} from 'lucide-react';
import { ollamaAgentService, OllamaAgentConfig } from '@/lib/services/OllamaAgentService';
import { ollamaService } from '@/lib/services/OllamaService';
import { useToast } from '@/hooks/use-toast';
import { OllamaAgentDialog } from '@/components/CommandCentre/CreateAgent/OllamaAgentDialog';
import { OllamaAgentChat } from '@/components/OllamaAgentChat';
import { AgentConfigDialog } from '@/components/AgentConfigDialog';
import { StrandsSdkAgentDialog } from '@/components/MultiAgentWorkspace/StrandsSdkAgentDialog';
import { strandsSdkService, StrandsSdkAgent } from '@/lib/services/StrandsSdkService';
import { StrandsSdkAgentChat } from '@/components/StrandsSdkAgentChat';
import { StrandsAgentAnalytics } from '@/components/MultiAgentWorkspace/StrandsAgentAnalytics';
import { A2AAgentCard } from '@/components/A2A/A2AAgentCard';
import { A2AAgentRegistrationDialog } from '@/components/A2A/A2AAgentRegistrationDialog';
import { A2AStatusIndicator } from '@/components/A2A/A2AStatusIndicator';
import { MainSystemOrchestratorCard } from '@/components/A2A/MainSystemOrchestratorCard';
import { a2aService, A2AStatus } from '@/lib/services/A2AService';

export const OllamaAgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<OllamaAgentConfig[]>([]);
  const [strandsAgents, setStrandsAgents] = useState<StrandsSdkAgent[]>([]);
  const [a2aAgents, setA2aAgents] = useState<StrandsSdkAgent[]>([]);
  const [a2aStatuses, setA2aStatuses] = useState<Record<string, A2AStatus>>({});
  const [actualA2AConnections, setActualA2AConnections] = useState<number>(0);
  const [selectedAgent, setSelectedAgent] = useState<OllamaAgentConfig | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStrandsSdkDialog, setShowStrandsSdkDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatAgent, setChatAgent] = useState<OllamaAgentConfig | null>(null);
  const [showStrandsChat, setShowStrandsChat] = useState(false);
  const [strandsChatAgent, setStrandsChatAgent] = useState<StrandsSdkAgent | null>(null);
  const [analyticsAgent, setAnalyticsAgent] = useState<{ id: string; name: string } | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState<string | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [configAgent, setConfigAgent] = useState<OllamaAgentConfig | null>(null);
  const [showA2ARegistrationDialog, setShowA2ARegistrationDialog] = useState(false);
  const [a2aRegistrationAgent, setA2aRegistrationAgent] = useState<StrandsSdkAgent | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<{
    memory_usage: string;
    active_sessions: number;
    orchestrator_model: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load all types of agents and health status
    const loadAllData = async () => {
      await Promise.all([
        loadAgents(),
        loadStrandsAgents(),
        loadA2AAgents(),
        loadSystemMetrics()
      ]);
    };
    
    loadAllData();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadAgents();
      loadStrandsAgents();
      loadA2AAgents();
      loadHealthStatus();
      loadSystemMetrics();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []); // Empty dependency array - only run once on mount

  // Load health status when agents change
  useEffect(() => {
    if (agents.length > 0 || strandsAgents.length > 0) {
      loadHealthStatus();
    }
  }, [agents, strandsAgents]);

  const loadAgents = async () => {
    try {
      // Load agents from API instead of localStorage to sync with Strands
      const response = await fetch('/api/agents/ollama');
      if (response.ok) {
        const data = await response.json();
        const apiAgents = data.agents || [];
        
        // Convert API format to OllamaAgentConfig format
        const convertedAgents: OllamaAgentConfig[] = apiAgents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          role: agent.role || '',
          description: agent.description || '',
          model: agent.model?.model_id || agent.model || '',
          personality: agent.personality || '',
          expertise: agent.expertise || '',
          systemPrompt: agent.system_prompt || '',
          temperature: agent.temperature || 0.7,
          maxTokens: agent.max_tokens || 1000,
          tools: [],
          memory: {
            shortTerm: false,
            longTerm: false,
            contextual: false
          },
          ragEnabled: false,
          knowledgeBases: [],
          guardrails: {
            enabled: agent.guardrails?.enabled || false,
            rules: agent.guardrails?.rules || [],
            safetyLevel: agent.guardrails?.safetyLevel || 'medium',
            contentFilters: agent.guardrails?.contentFilters || []
          },
          capabilities: {
            conversation: true,
            analysis: false,
            creativity: false,
            reasoning: false
          },
          behavior: {
            response_style: 'helpful',
            communication_tone: 'professional'
          },
          createdAt: agent.created_at || new Date().toISOString(),
          updatedAt: agent.updated_at || new Date().toISOString(),
          status: 'active'
        }));
        
        setAgents(convertedAgents);
      } else {
        // Fallback to localStorage if API fails
        const localAgents = ollamaAgentService.getAllAgents();
        setAgents(localAgents);
      }
    } catch (error) {
      console.error('Failed to load agents from API, falling back to localStorage:', error);
      // Fallback to localStorage
      try {
        const localAgents = ollamaAgentService.getAllAgents();
        setAgents(localAgents);
      } catch (localError) {
        toast({
          title: "Failed to load agents",
          description: localError instanceof Error ? localError.message : 'Unknown error',
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadA2AAgents = async () => {
    try {
      // Load A2A-enabled Strands agents from A2A service to get only registered agents
      const response = await fetch('http://localhost:5008/api/a2a/agents');
      if (response.ok) {
        const data = await response.json();
        // Get all A2A agents (they should match Strands SDK agents by ID)
        const a2aAgents = data.agents || [];
        
        // Convert to StrandsSdkAgent format (A2A service format)
        const convertedAgents = a2aAgents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          description: agent.description || '',
          model: agent.model || 'llama3.2:latest',
          systemPrompt: agent.system_prompt || '',
          tools: agent.capabilities || [],
          temperature: 0.7,
          maxTokens: 1000,
          status: agent.status || 'active',
          createdAt: agent.registered_at || new Date().toISOString(),
          updatedAt: agent.last_seen || new Date().toISOString(),
          recent_executions: []
        }));
        
        setA2aAgents(convertedAgents);
        
        // Load A2A statuses for each agent
        const statusPromises = convertedAgents.map(async (agent) => {
          try {
            const a2aStatus = await a2aService.getAgentA2AStatus(agent.id!);
            return { agentId: agent.id!, status: a2aStatus };
          } catch (error) {
            console.error(`Failed to load A2A status for agent ${agent.id}:`, error);
            return { agentId: agent.id!, status: { registered: false, a2a_status: 'error' } };
          }
        });
        
        const statuses = await Promise.all(statusPromises);
        const statusMap = statuses.reduce((acc, { agentId, status }) => {
          acc[agentId] = status;
          return acc;
        }, {} as Record<string, A2AStatus>);
        
        setA2aStatuses(statusMap);
        
        // Load actual A2A connections count (only count connections between strands_ agents)
        const connectionCount = await getActualA2AConnections();
        setActualA2AConnections(connectionCount);
        
        console.log('[Dashboard] Loaded A2A agents:', {
          count: convertedAgents.length,
          actualConnections: connectionCount,
          agentsWithStrandsPrefix: convertedAgents.filter(a => a.id?.startsWith('strands_')).length
        });
      } else {
        console.error('[Dashboard] Failed to fetch A2A agents:', response.status);
      }
    } catch (error) {
      console.error('[Dashboard] Failed to load A2A agents:', error);
    }
  };

  const loadHealthStatus = async () => {
    try {
      const status = await ollamaAgentService.healthCheck();
      
      // Use the actual loaded agents count - only count regular agents for the main count
      // A2A agents are handled separately in their own tab
      const totalAgentCount = agents.length;
      
      // Calculate total executions from all sources
      const strandsExecutions = strandsAgents.reduce((sum, agent) => sum + ((agent as any).recent_executions?.length || 0), 0);
      const totalExecutions = status.totalExecutions + strandsExecutions;
      
      console.log('[Health Status] Debug counts:', {
        ollamaAgents: agents.length,
        strandsSdkAgents: strandsAgents.length,
        a2aAgents: a2aAgents.length,
        totalAgents: totalAgentCount,
        ollamaExecutions: status.totalExecutions,
        strandsSdkExecutions: strandsExecutions,
        totalExecutions: totalExecutions
      });
      
      // Update the health status with combined counts
      setHealthStatus({
        ...status,
        agentCount: totalAgentCount,
        totalExecutions: totalExecutions
      });
    } catch (error) {
      console.error('Failed to load health status:', error);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5015/api/modern-orchestration/health');
      const data = await response.json();
      setSystemMetrics({
        memory_usage: data.memory_usage,
        active_sessions: data.active_sessions,
        orchestrator_model: data.orchestrator_model
      });
    } catch (error) {
      console.error('Error loading system metrics:', error);
    }
  };

  const handleAgentCreated = async (agent: OllamaAgentConfig) => {
    try {
      // Create agent in API database to sync with Strands
      const response = await fetch('/api/agents/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: agent.name,
          role: agent.role,
          description: agent.description,
          systemPrompt: agent.systemPrompt,
          model: agent.model,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
          guardrails: agent.guardrails
        })
      });

      if (response.ok) {
        // Reload agents from API to get the latest data
        await loadAgents();
        toast({
          title: "Agent Created",
          description: `${agent.name} is ready to use and synced with Strands!`,
        });
      } else {
        // Fallback to local creation
        setAgents(prev => [...prev, agent]);
        toast({
          title: "Agent Created Locally",
          description: `${agent.name} is ready to use (local only)!`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Failed to create agent in API, using local only:', error);
      // Fallback to local creation
      setAgents(prev => [...prev, agent]);
      toast({
        title: "Agent Created Locally",
        description: `${agent.name} is ready to use (local only)!`,
        variant: "default"
      });
    }

    // Refresh metrics after agent creation
    setTimeout(() => {
      loadHealthStatus();
    }, 500);
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      // Delete from API database first to sync with Strands
      const apiResponse = await fetch(`/api/agents/ollama/${agentId}`, {
        method: 'DELETE'
      });

      // Also delete from localStorage
      const localSuccess = await ollamaAgentService.deleteAgent(agentId);

      if (apiResponse.ok || localSuccess) {
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
        if (selectedAgent?.id === agentId) {
          setSelectedAgent(null);
          setShowChat(false);
        }
        // Refresh health status after deletion
        setTimeout(() => {
          loadHealthStatus();
        }, 500);
        toast({
          title: "Agent Deleted",
          description: "Agent has been removed successfully from both local and API storage",
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

  const loadStrandsAgents = async () => {
    try {
      // Direct call to Strands SDK service (bypass proxy)
      const response = await fetch('http://localhost:5006/api/strands-sdk/agents');
      if (response.ok) {
        const data = await response.json();
        const strandsAgentsList = data.agents || [];
        
        // Convert to StrandsSdkAgent format
        const convertedAgents = strandsAgentsList.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          description: agent.description || '',
          model: agent.model_id || agent.model || 'llama3.2:latest',
          systemPrompt: agent.system_prompt || '',
          tools: agent.tools || [],
          temperature: agent.sdk_config?.ollama_config?.temperature || 0.7,
          maxTokens: agent.sdk_config?.ollama_config?.max_tokens || 1000,
          status: agent.status || 'active',
          createdAt: agent.created_at || new Date().toISOString(),
          updatedAt: agent.updated_at || new Date().toISOString(),
          recent_executions: agent.recent_executions || []
        }));
        
        setStrandsAgents(convertedAgents);
        console.log('[Dashboard] Loaded Strands SDK agents:', convertedAgents.length);
      } else {
        console.error('[Dashboard] Failed to fetch Strands agents:', response.status);
      }
    } catch (error) {
      console.error('[Dashboard] Failed to load Strands agents:', error);
      // Don't show error toast, just log it
    }
  };


  const handleStrandsAgentCreated = () => {
    // Reload all agent lists
    loadAgents();
    loadStrandsAgents();
    loadA2AAgents();
    toast({
      title: "Strands Agent Created",
      description: "Your Strands SDK agent has been created successfully!",
    });
  };

  const handleChatWithStrandsAgent = async (agent: StrandsSdkAgent) => {
    setChatLoading(agent.id!);
    
    try {
      // First check if the Strands SDK service is healthy
      const healthStatus = await strandsSdkService.checkHealth();
      
      if (healthStatus.status !== 'healthy') {
        throw new Error('Strands SDK service is not available. Please check the service.');
      }

      // Open the Strands chat panel
      setStrandsChatAgent(agent);
      setShowStrandsChat(true);
      
      toast({
        title: "Strands Chat Opened",
        description: `Ready to chat with ${agent.name} using official Strands SDK`,
      });

    } catch (error) {
      console.error('Strands chat failed:', error);
      toast({
        title: "Chat Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setChatLoading(null);
    }
  };

  const handleOpenAnalytics = (agent: StrandsSdkAgent) => {
    setAnalyticsAgent({ id: agent.id!, name: agent.name });
    setShowAnalytics(true);
  };

  const handleDeleteStrandsAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      // First try to delete from Strands SDK service
      let sdkDeleted = false;
      try {
        const sdkResponse = await fetch(`http://localhost:5006/api/strands-sdk/agents/${agentId}`, {
          method: 'DELETE'
        });
        sdkDeleted = sdkResponse.ok;
      } catch (sdkError) {
        console.log('Strands SDK deletion failed (agent may not exist there):', sdkError);
      }

      // Then delete from A2A service
      let a2aDeleted = false;
      try {
        const a2aResponse = await fetch(`http://localhost:5008/api/a2a/agents/${agentId}`, {
          method: 'DELETE'
        });
        a2aDeleted = a2aResponse.ok;
      } catch (a2aError) {
        console.log('A2A deletion failed:', a2aError);
      }

      // Update UI if either deletion succeeded
      if (sdkDeleted || a2aDeleted) {
        setStrandsAgents(prev => prev.filter(agent => agent.id !== agentId));
        setA2aAgents(prev => prev.filter(agent => agent.id !== agentId));
        
        toast({
          title: "Agent Deleted",
          description: `Agent has been removed successfully.`,
        });
        
        // Refresh agents to update the UI
        await loadStrandsAgents();
        await loadA2AAgents();
      } else {
        throw new Error('Failed to delete agent from both services');
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

  const handleRegisterA2A = (agent: StrandsSdkAgent) => {
    setA2aRegistrationAgent(agent);
    setShowA2ARegistrationDialog(true);
  };

  const handleA2ARegistered = () => {
    // Reload A2A agents and statuses
    loadA2AAgents();
    toast({
      title: "A2A Registration Complete",
      description: "Agent has been registered for A2A communication!",
    });
  };

  const handleA2AConnected = async () => {
    // Reload A2A agents and statuses to update connection counts
    await loadA2AAgents();
    toast({
      title: "A2A Connection Complete",
      description: "Agents have been connected for A2A communication!",
    });
  };

  const getActualA2AConnections = async (): Promise<number> => {
    try {
      const response = await fetch('http://localhost:5008/api/a2a/connections');
      const data = await response.json();
      
      // Count all A2A connections
      const connectionCount = data.connections?.length || 0;
      console.log('[Dashboard] A2A connections count:', connectionCount);
      return connectionCount;
    } catch (error) {
      console.error('Failed to get A2A connections:', error);
      return 0;
    }
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

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="text-purple-400" />
              Agent Management
            </h1>
            <p className="text-gray-400 mt-2">
              Create, manage, and interact with your local AI agents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => {
              loadAgents();
              loadStrandsAgents();
              loadA2AAgents();
            }}>
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (confirm('⚠️ This will delete ALL agents. Are you sure?')) {
                  // Clear all agents from all services
                  setAgents([]);
                  setStrandsAgents([]);
                  setA2aAgents([]);
                  setSelectedAgent(null);
                  setShowChat(false);
                  toast({
                    title: "All Agents Cleared",
                    description: "All agents have been deleted. You can now create fresh agents.",
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={16} className="mr-2" />
              Clear All
            </Button>
            <Button onClick={() => setShowStrandsSdkDialog(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
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
                  {healthStatus.agentCount} legacy agents • {a2aAgents.length} A2A agents • {healthStatus.totalExecutions} total executions
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

        {/* Main System Orchestrator - Central Multi-Agent Coordination */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MainSystemOrchestratorCard />
        </div>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="agents" className="data-[state=active]:bg-purple-600">
              <Bot className="h-4 w-4 mr-2" />
              Agents ({strandsAgents.length})
            </TabsTrigger>
            <TabsTrigger value="a2a" className="data-[state=active]:bg-purple-600">
              <Network className="h-4 w-4 mr-2" />
              A2A Agents ({a2aAgents.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                <p>Loading agents...</p>
              </div>
            ) : strandsAgents.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="text-center py-12">
                  <Bot size={64} className="mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Agents Created</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first agent to get started with local AI conversations
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowStrandsSdkDialog(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Plus size={16} className="mr-2" />
                      Create Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Legacy Agents */}
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
                              title="Start Chat"
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
                              title="Delete Agent"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-2">
                            <Cpu size={14} />
                            {agent.model ? (
                              <>
                                <span>{agent.model}</span>
                                <Badge variant="secondary">Local</Badge>
                                <Badge variant="default" className="bg-green-600 text-xs">✓ Model OK</Badge>
                              </>
                            ) : (
                              <>
                                <span className="text-red-400">No Model Configured</span>
                                <Badge variant="destructive" className="text-xs">⚠️ Fix Needed</Badge>
                              </>
                            )}
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
                            {agent.memory?.shortTerm && <Badge variant="outline" className="text-xs">Short Memory</Badge>}
                            {agent.memory?.longTerm && <Badge variant="outline" className="text-xs">Long Memory</Badge>}
                            {agent.ragEnabled && <Badge variant="outline" className="text-xs">RAG</Badge>}
                            {agent.guardrails?.enabled && <Badge variant="outline" className="text-xs">Guardrails</Badge>}
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

                {/* Strands SDK Agents */}
                {strandsAgents.map((agent) => {
                  // Check if agent is registered in A2A service
                  const isA2ARegistered = a2aAgents.some(a2aAgent => a2aAgent.id === agent.id) || a2aStatuses[agent.id!]?.registered || false;
                  const connections = a2aStatuses[agent.id!]?.connections || 0;
                  
                  return (
                  <Card key={`strands-sdk-${agent.id}`} className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="text-purple-400" size={20} />
                          {agent.name}
                          
                          {/* Enhanced Configuration Tooltip */}
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-700" title="View Agent Details">
                                <Info className="h-3 w-3 text-gray-400 hover:text-purple-400" />
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-96 bg-gray-800 border-gray-700 text-white" side="right">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-purple-400" />
                                  <h4 className="font-semibold text-purple-300">Agent Configuration</h4>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Model:</span>
                                    <span className="text-white">{agent.model || 'qwen3:1.7b'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Host:</span>
                                    <span className="text-white">{(agent as any).host || 'http://localhost:11434'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Temperature:</span>
                                    <span className="text-white">
                                      {(() => {
                                        try {
                                          const config = JSON.parse((agent as any).sdk_config || '{}');
                                          return config?.ollama_config?.temperature || 0.7;
                                        } catch {
                                          return 0.7;
                                        }
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Max Tokens:</span>
                                    <span className="text-white">
                                      {(() => {
                                        try {
                                          const config = JSON.parse((agent as any).sdk_config || '{}');
                                          return config?.ollama_config?.max_tokens || 1000;
                                        } catch {
                                          return 1000;
                                        }
                                      })()}
                                    </span>
                                  </div>
                                  
                                  {/* Tools Section */}
                                  {agent.tools && agent.tools.length > 0 && (
                                    <>
                                      <div className="border-t border-gray-600 pt-2 mt-2">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Wrench className="h-3 w-3 text-purple-400" />
                                          <span className="text-gray-400 font-medium">Tools ({agent.tools.length})</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {agent.tools.map((tool, index) => (
                                            <Badge key={index} variant="outline" className="text-xs border-purple-400/30 text-purple-300">
                                              {tool.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  
                                  {/* Enhanced System Prompt Section */}
                                  {(agent as any).system_prompt && (
                                    <div className="border-t border-gray-600 pt-2 mt-2">
                                      <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="h-3 w-3 text-purple-400" />
                                        <span className="text-gray-400 font-medium">System Prompt</span>
                                        <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-300">
                                          Role-Specific
                                        </Badge>
                                      </div>
                                      <div className="bg-gray-900/50 p-3 rounded border border-gray-600 max-h-32 overflow-y-auto">
                                        <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
                                          {(agent as any).system_prompt}
                                        </p>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        This prompt defines the agent's role, behavior, and capabilities
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* SDK Info */}
                                  <div className="border-t border-gray-600 pt-2 mt-2">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="h-3 w-3 text-purple-400" />
                                      <span className="text-xs text-purple-300">Official Strands SDK Agent</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Strands SDK
                          </Badge>
                          {isA2ARegistered ? (
                            <Badge variant="default" className="bg-green-600 text-white">
                              <Network className="h-3 w-3 mr-1" />
                              A2A Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-400 text-orange-400">
                              <Network className="h-3 w-3 mr-1" />
                              A2A Available
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="text-gray-400">
                        {agent.description || 'Powered by official Strands SDK'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Configuration Metadata - Same as Legacy Agents */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Temperature:</span>
                            <span className="ml-2 text-white">
                              {(() => {
                                try {
                                  const config = JSON.parse((agent as any).sdk_config || '{}');
                                  return config?.ollama_config?.temperature || 0.7;
                                } catch {
                                  return 0.7;
                                }
                              })()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Max Tokens:</span>
                            <span className="ml-2 text-white">
                              {(() => {
                                try {
                                  const config = JSON.parse((agent as any).sdk_config || '{}');
                                  return config?.ollama_config?.max_tokens || 1000;
                                } catch {
                                  return 1000;
                                }
                              })()}
                            </span>
                          </div>
                        </div>

                        {/* Execution Metrics - Same as Legacy Agents */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <MessageSquare size={12} className="text-blue-400" />
                              <span className="text-xs text-gray-400">Chats</span>
                            </div>
                            <p className="text-sm font-semibold">
                              {(agent as any).recent_executions?.length || 0}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Clock size={12} className="text-yellow-400" />
                              <span className="text-xs text-gray-400">Avg</span>
                            </div>
                            <p className="text-sm font-semibold">
                              {(agent as any).recent_executions?.length > 0 
                                ? `${((agent as any).recent_executions.reduce((sum: number, exec: any) => sum + (exec.execution_time || 0), 0) / (agent as any).recent_executions.length).toFixed(1)}s`
                                : '1.0s'
                              }
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Zap size={12} className="text-green-400" />
                              <span className="text-xs text-gray-400">Success</span>
                            </div>
                            <p className="text-sm font-semibold">
                              {(agent as any).recent_executions?.length > 0 
                                ? `${Math.round(((agent as any).recent_executions.filter((exec: any) => exec.success).length / (agent as any).recent_executions.length) * 100)}%`
                                : '100%'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Model:</span>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {agent.model || 'qwen3:1.7b'}
                          </Badge>
                        </div>
                        {/* A2A Status Section */}
                        {isA2ARegistered ? (
                          <div className="bg-green-900/20 p-3 rounded-lg border border-green-500/30 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Network className="h-4 w-4 text-green-400" />
                              <span className="text-sm font-medium text-green-300">A2A Communication: Active</span>
                            </div>
                            <div className="text-xs text-green-200">
                              Connections: {connections}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-500/30 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Network className="h-4 w-4 text-orange-400" />
                              <span className="text-sm font-medium text-orange-300">A2A Registration Available</span>
                            </div>
                            <p className="text-xs text-orange-200 mb-3">
                              This agent can be registered for agent-to-agent communication
                            </p>
                            <Button
                              size="sm"
                              onClick={() => handleRegisterA2A(agent)}
                              className="w-full bg-orange-600 hover:bg-orange-700"
                            >
                              <Network className="h-3 w-3 mr-2" />
                              Register for A2A
                            </Button>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                            onClick={() => handleChatWithStrandsAgent(agent)}
                            disabled={chatLoading === agent.id}
                          >
                            {chatLoading === agent.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <MessageSquare size={14} className="mr-2" />
                                Chat with Agent
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenAnalytics(agent)}
                            title="View Analytics"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            <BarChart3 size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteStrandsAgent(agent.id!)}
                            title="Delete Agent"
                          >
                            <Trash2 size={14} />
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

          {/* A2A Agents Tab */}
          <TabsContent value="a2a">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                <p>Loading A2A agents...</p>
              </div>
            ) : a2aAgents.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="text-center py-12">
                  <Network size={64} className="mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No A2A Agents Available</h3>
                  <p className="text-gray-400 mb-6">
                    A2A-enabled agents will appear here when they are created and registered for agent-to-agent communication
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowStrandsSdkDialog(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Sparkles size={16} className="mr-2" />
                      Create Strands Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* A2A System Status */}
                <A2AStatusIndicator
                  isActive={true}
                  agentsConnected={a2aAgents.length}
                  lastActivity="Just now"
                  status="idle"
                />

                {/* Registered A2A Agents */}
                {a2aAgents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Network className="h-5 w-5 text-green-400" />
                      Registered A2A Agents ({a2aAgents.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {a2aAgents.map((agent) => (
                          <A2AAgentCard
                            key={`a2a-registered-${agent.id}`}
                            agent={agent}
                            onChat={handleChatWithStrandsAgent}
                            onAnalytics={handleOpenAnalytics}
                            onDelete={handleDeleteStrandsAgent}
                            onA2AConnected={handleA2AConnected}
                            chatLoading={chatLoading}
                            a2aStatus={a2aStatuses[agent.id!]}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* System Status */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MemoryStick className="h-5 w-5 text-blue-400" />
                    System Status
                  </h3>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <MemoryStick className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Memory Usage</p>
                            <p className="text-lg font-semibold text-white">
                              {systemMetrics ? systemMetrics.memory_usage : 'Loading...'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <Users className="h-5 w-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Active Sessions</p>
                            <p className="text-lg font-semibold text-white">
                              {systemMetrics ? `${systemMetrics.active_sessions} sessions` : 'Loading...'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Brain className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Model</p>
                            <p className="text-lg font-semibold text-white">
                              {systemMetrics ? systemMetrics.orchestrator_model : 'Loading...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Unregistered Agents */}
                {a2aAgents.filter(agent => !a2aStatuses[agent.id!]?.registered).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-orange-400" />
                      Available for A2A Registration ({a2aAgents.filter(agent => !a2aStatuses[agent.id!]?.registered).length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {a2aAgents
                        .filter(agent => !a2aStatuses[agent.id!]?.registered)
                        .map((agent) => (
                          <Card key={`a2a-unregistered-${agent.id}`} className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-colors">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                  <Sparkles className="text-purple-400" size={20} />
                                  {agent.name}
                                  <Badge variant="outline" className="border-orange-400 text-orange-400">
                                    <Network className="h-3 w-3 mr-1" />
                                    Not Registered
                                  </Badge>
                                </CardTitle>
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Strands SDK
                                </Badge>
                              </div>
                              <CardDescription className="text-gray-400">
                                {agent.description || 'Powered by official Strands SDK'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-500/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Network className="h-4 w-4 text-orange-400" />
                                    <span className="text-sm font-medium text-orange-300">A2A Registration Available</span>
                                  </div>
                                  <p className="text-xs text-orange-200 mb-3">
                                    This agent can be registered for agent-to-agent communication
                                  </p>
                                  <Button
                                    size="sm"
                                    onClick={() => handleRegisterA2A(agent)}
                                    className="w-full bg-orange-600 hover:bg-orange-700"
                                  >
                                    <Network className="h-3 w-3 mr-2" />
                                    Register for A2A
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-400">Model:</span>
                                    <span className="ml-2 text-white">{(agent as any).model_id}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Tools:</span>
                                    <span className="ml-2 text-white">{agent.tools?.length || 0}</span>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    onClick={() => handleChatWithStrandsAgent(agent)}
                                    disabled={chatLoading === agent.id}
                                  >
                                    {chatLoading === agent.id ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                        Starting...
                                      </>
                                    ) : (
                                      <>
                                        <MessageSquare size={14} className="mr-2" />
                                        Chat
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteStrandsAgent(agent.id!)}
                                    title="Delete Agent"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>


          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Bot className="text-purple-400" size={16} />
                    Legacy Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agents.length}</div>
                  <p className="text-xs text-gray-400">
                    agents
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Network className="text-orange-400" size={16} />
                    A2A Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{a2aAgents.length}</div>
                  <p className="text-xs text-gray-400">
                    {a2aAgents.length} registered
                  </p>
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
                    {(() => {
                      const legacyTotal = agents.reduce((sum, agent) => sum + ollamaAgentService.getAgentMetrics(agent.id).totalExecutions, 0);
                      const strandsTotal = strandsAgents.reduce((sum, agent) => sum + ((agent as any).recent_executions?.length || 0), 0);
                      return legacyTotal + strandsTotal;
                    })()}
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
                      // Legacy agents
                      const legacyTotalExecs = agents.reduce((sum, agent) => sum + ollamaAgentService.getAgentMetrics(agent.id).totalExecutions, 0);
                      const legacySuccessfulExecs = agents.reduce((sum, agent) => sum + ollamaAgentService.getAgentMetrics(agent.id).successfulExecutions, 0);
                      
                      // Strands SDK agents
                      const strandsTotalExecs = strandsAgents.reduce((sum, agent) => sum + ((agent as any).recent_executions?.length || 0), 0);
                      const strandsSuccessfulExecs = strandsAgents.reduce((sum, agent) => {
                        return sum + (((agent as any).recent_executions?.filter((exec: any) => exec.success).length || 0));
                      }, 0);
                      
                      const totalExecs = legacyTotalExecs + strandsTotalExecs;
                      const successfulExecs = legacySuccessfulExecs + strandsSuccessfulExecs;
                      
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
                    {(() => {
                      // Legacy agents tokens
                      const legacyTokens = agents.reduce((sum, agent) => sum + ollamaAgentService.getAgentMetrics(agent.id).totalTokensUsed, 0);
                      
                      // Strands SDK agents tokens (estimate from input/output length)
                      const strandsTokens = strandsAgents.reduce((sum, agent) => {
                        return sum + (((agent as any).recent_executions?.reduce((execSum: number, exec: any) => {
                          // Rough estimate: 1 token ≈ 4 characters
                          const inputTokens = Math.ceil((exec.input_text?.length || 0) / 4);
                          const outputTokens = Math.ceil((exec.output_text?.length || 0) / 4);
                          return execSum + inputTokens + outputTokens;
                        }, 0) || 0));
                      }, 0);
                      
                      return (legacyTokens + strandsTokens).toLocaleString();
                    })()}
                  </div>
                  <p className="text-xs text-gray-400">Tokens processed</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Legacy Chat Interface */}
      {showChat && chatAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl h-[80vh]">
            <OllamaAgentChat 
              agent={chatAgent} 
              onClose={() => {
                setShowChat(false);
                setChatAgent(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Strands SDK Chat Interface */}
      {showStrandsChat && strandsChatAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl h-[80vh]">
            <StrandsSdkAgentChat 
              agent={strandsChatAgent} 
              onClose={() => {
                setShowStrandsChat(false);
                setStrandsChatAgent(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Strands Agent Analytics */}
      {analyticsAgent && (
        <StrandsAgentAnalytics
          open={showAnalytics}
          onOpenChange={setShowAnalytics}
          agentId={analyticsAgent.id}
          agentName={analyticsAgent.name}
        />
      )}

      {/* Create Agent Dialog */}
      <OllamaAgentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onAgentCreated={handleAgentCreated}
      />

      <StrandsSdkAgentDialog
        open={showStrandsSdkDialog}
        onOpenChange={setShowStrandsSdkDialog}
        onAgentCreated={handleStrandsAgentCreated}
      />

      {/* Agent Configuration Dialog */}
      <AgentConfigDialog
        agent={configAgent}
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
      />

      {/* A2A Registration Dialog */}
      <A2AAgentRegistrationDialog
        open={showA2ARegistrationDialog}
        onOpenChange={setShowA2ARegistrationDialog}
        agent={a2aRegistrationAgent}
        onRegistered={handleA2ARegistered}
      />
    </div>
  );
};

export default OllamaAgentDashboard;