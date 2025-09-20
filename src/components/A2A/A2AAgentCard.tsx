import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { 
  Bot, 
  MessageSquare, 
  Trash2, 
  BarChart3,
  Clock,
  Zap,
  Cpu,
  RefreshCw,
  Settings,
  Sparkles,
  Info,
  Wrench,
  Network,
  Users,
  Activity
} from 'lucide-react';
import { StrandsSdkAgent } from '@/lib/services/StrandsSdkService';

interface A2AAgentCardProps {
  agent: StrandsSdkAgent;
  onChat: (agent: StrandsSdkAgent) => void;
  onAnalytics: (agent: StrandsSdkAgent) => void;
  onDelete: (agentId: string) => void;
  onRegisterA2A?: (agent: StrandsSdkAgent) => void;
  onA2AConnected?: () => void;
  chatLoading?: string | null;
  a2aStatus?: {
    registered: boolean;
    a2a_agent_id?: string;
    a2a_status?: string;
    connections?: number;
    last_message?: string;
  };
}

export const A2AAgentCard: React.FC<A2AAgentCardProps> = ({
  agent,
  onChat,
  onAnalytics,
  onDelete,
  onRegisterA2A,
  onA2AConnected,
  chatLoading,
  a2aStatus
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connections, setConnections] = useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);

  // Fetch available agents for A2A connections
  useEffect(() => {
    const fetchAvailableAgents = async () => {
      try {
        const response = await fetch('http://localhost:5008/api/a2a/agents');
        if (response.ok) {
          const data = await response.json();
          const otherAgents = data.agents.filter((a: any) => a.id !== agent.id);
          setAvailableAgents(otherAgents);
        }
      } catch (error) {
        console.error('Failed to fetch available agents:', error);
      }
    };

    fetchAvailableAgents();
  }, [agent.id]);

  // Fetch A2A status and connections
  const fetchA2AStatus = async () => {
    try {
      // Fetch agent connections
      const connectionsResponse = await fetch(`http://localhost:5008/api/a2a/connections/${agent.id}`);
      if (connectionsResponse.ok) {
        const connectionsData = await connectionsResponse.json();
        setConnections(connectionsData.connections || []);
      }
    } catch (error) {
      console.error('Failed to fetch A2A status:', error);
    }
  };

  // Fetch A2A status on component mount and when agent changes
  useEffect(() => {
    if (a2aStatus?.registered) {
      fetchA2AStatus();
    }
  }, [agent.id, a2aStatus?.registered]);

  const handleRegisterA2A = async () => {
    setIsRegistering(true);
    try {
      // Use Strands SDK's A2A registration endpoint to avoid duplicates
      const response = await fetch(`http://localhost:5006/api/strands-sdk/a2a/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agent.id
        })
      });

      if (response.ok) {
        // Refresh A2A status
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to register agent for A2A:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleConnectToA2A = async () => {
    setIsConnecting(true);
    try {
      // Get list of other A2A agents
      const response = await fetch('http://localhost:5008/api/a2a/agents');
      if (response.ok) {
        const data = await response.json();
        const otherAgents = data.agents.filter((a: any) => a.id !== agent.id);
        
        if (otherAgents.length > 0) {
          // Connect to ALL other agents that aren't already connected
          const connectionPromises = otherAgents.map(async (otherAgent: any) => {
            // Check if already connected
            const isAlreadyConnected = connections.includes(otherAgent.id);
            if (isAlreadyConnected) {
              return { success: true, alreadyConnected: true };
            }

            // Create connection
            const connectResponse = await fetch('http://localhost:5008/api/a2a/connections', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from_agent_id: agent.id,
                to_agent_id: otherAgent.id
              })
            });

            return { 
              success: connectResponse.ok, 
              agentId: otherAgent.id,
              alreadyConnected: false
            };
          });

          // Wait for all connections to complete
          const results = await Promise.all(connectionPromises);
          const successfulConnections = results.filter(r => r.success && !r.alreadyConnected).length;
          
          if (successfulConnections > 0) {
            // Refresh A2A status instead of reloading page
            await fetchA2AStatus();
            // Update available agents count
            const updatedResponse = await fetch('http://localhost:5008/api/a2a/agents');
            if (updatedResponse.ok) {
              const updatedData = await updatedResponse.json();
              const updatedOtherAgents = updatedData.agents.filter((a: any) => a.id !== agent.id);
              setAvailableAgents(updatedOtherAgents);
            }
            // Notify parent component that connections were made
            if (onA2AConnected) {
              onA2AConnected();
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to connect agent to A2A:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-purple-400" size={20} />
            {agent.name}
            
            {/* A2A Status Indicator */}
            <div className="flex items-center gap-1">
              {a2aStatus?.registered ? (
                <Badge variant="default" className="bg-green-600 text-white">
                  <Network className="h-3 w-3 mr-1" />
                  A2A Enabled
                </Badge>
              ) : (
                <Badge variant="outline" className="border-orange-400 text-orange-400">
                  <Network className="h-3 w-3 mr-1" />
                  A2A Disabled
                </Badge>
              )}
            </div>

            {/* Configuration Tooltip */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-700">
                  <Info className="h-3 w-3 text-gray-400 hover:text-purple-400" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-gray-800 border-gray-700 text-white" side="right">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <h4 className="font-semibold text-purple-300">Agent Configuration</h4>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model:</span>
                      <span className="text-white">{(agent as any).model_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Host:</span>
                      <span className="text-white">{(agent as any).host}</span>
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
                    
                    {/* A2A Status Section */}
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Network className="h-3 w-3 text-purple-400" />
                        <span className="text-gray-400 font-medium">A2A Status</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Registered:</span>
                          <span className={a2aStatus?.registered ? "text-green-400" : "text-red-400"}>
                            {a2aStatus?.registered ? "Yes" : "No"}
                          </span>
                        </div>
                        {a2aStatus?.registered && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-400">A2A ID:</span>
                              <span className="text-white text-xs font-mono">
                                {a2aStatus.a2a_agent_id?.substring(0, 8)}...
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Connections:</span>
                              <span className="text-white">{a2aStatus.connections || 0}</span>
                            </div>
                            {a2aStatus.last_message && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Last Message:</span>
                                <span className="text-white text-xs">
                                  {new Date(a2aStatus.last_message).toLocaleTimeString()}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
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
                    
                    {/* System Prompt Preview */}
                    {(agent as any).system_prompt && (
                      <div className="border-t border-gray-600 pt-2 mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-3 w-3 text-purple-400" />
                          <span className="text-gray-400 font-medium">System Prompt</span>
                        </div>
                        <p className="text-xs text-gray-300 bg-gray-900/50 p-2 rounded border border-gray-600 max-h-20 overflow-y-auto">
                          {(agent as any).system_prompt.length > 150 
                            ? `${(agent as any).system_prompt.substring(0, 150)}...` 
                            : (agent as any).system_prompt
                          }
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
          </div>
        </div>
        <CardDescription className="text-gray-400">
          {agent.description || 'Powered by official Strands SDK'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* A2A Management Section */}
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">A2A Communication</span>
              </div>
              {a2aStatus?.registered && (
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <Activity className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            
            {!a2aStatus?.registered ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">
                  Enable A2A communication to allow this agent to interact with other agents
                </p>
                <Button
                  size="sm"
                  onClick={handleRegisterA2A}
                  disabled={isRegistering}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isRegistering ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Network className="h-3 w-3 mr-2" />
                      Register for A2A
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Connections:</span>
                  <span className="text-white">{connections.length}</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleConnectToA2A}
                  disabled={isConnecting || availableAgents.length === 0 || connections.length >= availableAgents.length}
                  variant="outline"
                  className={`w-full ${
                    availableAgents.length === 0 || connections.length >= availableAgents.length
                      ? 'border-gray-500 text-gray-500 cursor-not-allowed' 
                      : 'border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white'
                  }`}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : availableAgents.length === 0 ? (
                    <>
                      <Users className="h-3 w-3 mr-2" />
                      No Other Agents Available
                    </>
                  ) : connections.length >= availableAgents.length ? (
                    <>
                      <Users className="h-3 w-3 mr-2" />
                      All Agents Connected ({connections.length}/{availableAgents.length})
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 mr-2" />
                      Connect to All Agents ({availableAgents.length - connections.length} remaining)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Configuration Metadata */}
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

          {/* Execution Metrics */}
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
              {(agent as any).model_id}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={() => onChat(agent)}
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
              onClick={() => onAnalytics(agent)}
              title="View Analytics"
              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
            >
              <BarChart3 size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(agent.id!)}
              title="Delete Agent"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
