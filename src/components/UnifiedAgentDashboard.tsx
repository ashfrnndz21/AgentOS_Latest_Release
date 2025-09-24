import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  Trash2, 
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Network,
  Settings
} from 'lucide-react';
import { unifiedAgentService, UnifiedAgent } from '@/lib/services/UnifiedAgentService';
import { useToast } from '@/hooks/use-toast';

export const UnifiedAgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<UnifiedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    by_framework: {} as Record<string, number>,
    a2a_enabled: 0,
    a2a_disabled: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
    loadStats();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const allAgents = await unifiedAgentService.getAllAgents();
      setAgents(allAgents);
    } catch (error) {
      toast({
        title: "Failed to load agents",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const agentStats = await unifiedAgentService.getAgentStats();
      setStats(agentStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAgents(), loadStats()]);
    setRefreshing(false);
    toast({
      title: "Agents Refreshed",
      description: "All agent data has been updated",
    });
  };

  const handleRegisterA2A = async (agent: UnifiedAgent) => {
    try {
      const result = await unifiedAgentService.registerAgentForA2A(agent.id);
      
      if (result.success) {
        toast({
          title: "A2A Registration Successful",
          description: `${agent.name} is now registered for agent-to-agent communication`,
        });
        loadAgents(); // Refresh to show updated status
      } else {
        toast({
          title: "A2A Registration Failed",
          description: result.error || 'Unknown error occurred',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "A2A Registration Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const handleUnregisterA2A = async (agent: UnifiedAgent) => {
    try {
      const result = await unifiedAgentService.unregisterAgentFromA2A(agent.id);
      
      if (result.success) {
        toast({
          title: "A2A Unregistration Successful",
          description: `${agent.name} is no longer registered for A2A communication`,
        });
        loadAgents(); // Refresh to show updated status
      } else {
        toast({
          title: "A2A Unregistration Failed",
          description: result.error || 'Unknown error occurred',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "A2A Unregistration Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const handleDeleteAgent = async (agent: UnifiedAgent) => {
    if (!confirm(`Are you sure you want to delete ${agent.name}? This will remove it from all systems.`)) {
      return;
    }

    try {
      const result = await unifiedAgentService.deleteAgent(agent.id);
      
      if (result.success) {
        toast({
          title: "Agent Deleted",
          description: `${agent.name} has been deleted from: ${result.deleted_from?.join(', ')}`,
        });
        loadAgents(); // Refresh to show updated list
      } else {
        toast({
          title: "Deletion Failed",
          description: result.error || 'Unknown error occurred',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const getFrameworkBadge = (framework: string) => {
    const colors = {
      'ollama': 'bg-blue-100 text-blue-800',
      'strands': 'bg-purple-100 text-purple-800',
      'a2a': 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={colors[framework as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {framework.toUpperCase()}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading agents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Unified Agent Dashboard</h1>
          <p className="text-gray-600">Manage all your agents from one place</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">A2A Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.a2a_enabled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Strands Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.by_framework.strands || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ollama Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.by_framework.ollama || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Agent List */}
      <Card>
        <CardHeader>
          <CardTitle>All Agents ({agents.length})</CardTitle>
          <CardDescription>
            View and manage all agents across all systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-500">Create your first agent to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(agent.status)}
                        {getFrameworkBadge(agent.framework)}
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {agent.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <div><strong>Model:</strong> {agent.model_id}</div>
                      <div><strong>Created:</strong> {new Date(agent.created_at).toLocaleDateString()}</div>
                      <div><strong>Tools:</strong> {agent.tools.length} available</div>
                    </div>

                    {/* A2A Status */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">A2A Communication</span>
                        </div>
                        {agent.a2a_enabled ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Available
                          </Badge>
                        )}
                      </div>
                      
                      {agent.a2a_enabled ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnregisterA2A(agent)}
                          className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          Unregister from A2A
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRegisterA2A(agent)}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          <Network className="h-3 w-3 mr-2" />
                          Register for A2A
                        </Button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="h-3 w-3 mr-2" />
                        Chat
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteAgent(agent)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


