import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Bot, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  framework: string;
  status: string;
  created_at: string;
  error_message?: string;
  metadata?: any;
  framework_metadata?: any;
}

export const RealAgentMonitoring: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5002/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
        setLastUpdated(new Date());
        console.log('Fetched agents:', data.agents);
      } else {
        console.error('Failed to fetch agents:', response.status);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    // Refresh every 10 seconds
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'generic':
        return 'border-purple-500 text-purple-400';
      case 'strands':
        return 'border-green-500 text-green-400';
      case 'agentcore':
        return 'border-blue-500 text-blue-400';
      default:
        return 'border-gray-500 text-gray-400';
    }
  };

  const frameworkCounts = {
    total: agents.length,
    generic: agents.filter(a => a.framework === 'generic').length,
    strands: agents.filter(a => a.framework === 'strands').length,
    agentcore: agents.filter(a => a.framework === 'agentcore').length,
    active: agents.filter(a => a.status === 'active').length,
    failed: agents.filter(a => a.status === 'failed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Agent Monitoring</h3>
          <p className="text-sm text-gray-400">Real-time agent status and performance</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={fetchAgents}
            disabled={isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{frameworkCounts.total}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{frameworkCounts.active}</div>
              <div className="text-xs text-gray-400">Active</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{frameworkCounts.failed}</div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{frameworkCounts.generic}</div>
              <div className="text-xs text-gray-400">Generic</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{frameworkCounts.strands}</div>
              <div className="text-xs text-gray-400">Strands</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{frameworkCounts.agentcore}</div>
              <div className="text-xs text-gray-400">AgentCore</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <Card className="bg-beam-dark-accent border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bot className="h-5 w-5" />
            Live Agents ({agents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No agents created yet</p>
              <p className="text-sm text-gray-500 mt-1">Create your first agent to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <Card key={agent.id} className="bg-gray-800/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(agent.status)}
                          <span className="font-medium text-white">{agent.name}</span>
                        </div>
                        <Badge variant="outline" className={getFrameworkColor(agent.framework)}>
                          {agent.framework}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(agent.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">ID:</span>
                        <span className="text-white ml-1 font-mono">{agent.id.substring(0, 8)}...</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className={`ml-1 ${
                          agent.status === 'active' ? 'text-green-400' : 
                          agent.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Framework:</span>
                        <span className="text-white ml-1">{agent.framework}</span>
                      </div>
                    </div>

                    {/* Framework-specific metadata */}
                    {agent.framework_metadata && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="text-xs text-gray-300 mb-2">Framework Details:</div>
                        
                        {agent.framework === 'strands' && agent.framework_metadata.reasoning_capabilities && (
                          <div className="flex flex-wrap gap-1">
                            {agent.framework_metadata.reasoning_capabilities.map((cap: string) => (
                              <Badge key={cap} variant="outline" className="text-xs border-green-600 text-green-300">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {agent.framework === 'agentcore' && (
                          <div className="flex gap-2 text-xs">
                            <span className="text-gray-400">Action Groups:</span>
                            <span className="text-white">{agent.framework_metadata.action_groups_count || 0}</span>
                            <span className="text-gray-400">Knowledge Bases:</span>
                            <span className="text-white">{agent.framework_metadata.knowledge_bases_count || 0}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error message */}
                    {agent.error_message && (
                      <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs">
                        <span className="text-red-400">Error: {agent.error_message}</span>
                      </div>
                    )}
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