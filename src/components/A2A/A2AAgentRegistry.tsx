import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useA2A, A2AAgent, A2AMessage } from '@/hooks/useA2A';
import { Bot, MessageSquare, Users, Activity, Send, RefreshCw, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface A2AAgentRegistryProps {
  className?: string;
}

export const A2AAgentRegistry: React.FC<A2AAgentRegistryProps> = ({ className }) => {
  const {
    agents,
    agentsLoading,
    agentsError,
    refreshAgents,
    messages,
    messagesLoading,
    messagesError,
    sendMessage,
    refreshMessages,
    isConnected,
    connectionError,
    strandsAgents,
    strandsAgentsLoading,
    refreshStrandsAgents,
    sendStrandsMessage,
    mainSystemAgents,
    mainSystemAgentsLoading,
    refreshMainSystemAgents,
    deleteAgent,
    healthStatus,
    checkHealth
  } = useA2A();

  const [selectedAgent, setSelectedAgent] = useState<A2AAgent | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [targetAgentId, setTargetAgentId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    refreshAgents();
    refreshStrandsAgents();
    refreshMainSystemAgents();
    refreshMessages();
    checkHealth();
  }, [refreshAgents, refreshStrandsAgents, refreshMainSystemAgents, refreshMessages, checkHealth]);

  const handleSendMessage = async () => {
    if (!selectedAgent || !targetAgentId || !messageContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select an agent, target agent, and enter a message.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      await sendStrandsMessage(selectedAgent.id, targetAgentId, messageContent);
      setMessageContent('');
      toast({
        title: "Message Sent",
        description: `Message sent from ${selectedAgent.name} to target agent.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Send Message",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (!confirm(`Are you sure you want to delete "${agentName}"? This will remove it from all systems.`)) {
      return;
    }

    try {
      await deleteAgent(agentId);
      toast({
        title: "Agent Deleted",
        description: `"${agentName}" has been removed from all systems.`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete agent",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthStatusColor = () => {
    switch (healthStatus) {
      case 'healthy': return 'text-green-500';
      case 'unhealthy': return 'text-red-500';
      case 'checking': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            A2A Agent Registry
          </h2>
          <p className="text-muted-foreground">
            Manage and communicate with Agent-to-Agent registered agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${getHealthStatusColor()}`}>
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {healthStatus === 'healthy' ? 'Connected' : healthStatus === 'unhealthy' ? 'Disconnected' : 'Checking...'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              checkHealth();
              refreshAgents();
              refreshStrandsAgents();
              refreshMainSystemAgents();
              refreshMessages();
            }}
            disabled={agentsLoading || strandsAgentsLoading}
          >
            <RefreshCw className={`h-4 w-4 ${agentsLoading || strandsAgentsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Error */}
      {connectionError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="font-medium">Connection Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{connectionError}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">All Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="strands">Strands Agents ({strandsAgents.length})</TabsTrigger>
          <TabsTrigger value="main">Main System ({mainSystemAgents.length})</TabsTrigger>
          <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
        </TabsList>

        {/* All Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          {agentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading agents...</span>
            </div>
          ) : agentsError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">Error loading agents: {agentsError}</p>
              </CardContent>
            </Card>
          ) : agents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No agents registered yet</p>
                  <p className="text-sm">Create agents through the Create Strands Agent workflow</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        {agent.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAgent(agent.id, agent.name);
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {agent.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {agent.model}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {agent.status}
                        </Badge>
                      </div>
                      {agent.capabilities && agent.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.slice(0, 3).map((capability) => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Registered: {new Date(agent.registered_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Strands Agents Tab */}
        <TabsContent value="strands" className="space-y-4">
          {strandsAgentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading Strands agents...</span>
            </div>
          ) : strandsAgents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No Strands agents registered with A2A</p>
                  <p className="text-sm">Create agents through the Create Strands Agent workflow</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {strandsAgents.map((agent) => (
                <Card
                  key={agent.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        {agent.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAgent(agent.id, agent.name);
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {agent.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {agent.model}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Strands SDK
                        </Badge>
                      </div>
                      {agent.capabilities && agent.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.slice(0, 3).map((capability) => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Registered: {new Date(agent.registered_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Main System Agents Tab */}
        <TabsContent value="main" className="space-y-4">
          {mainSystemAgentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading main system agents...</span>
            </div>
          ) : mainSystemAgents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No main system agents found</p>
                  <p className="text-sm">These are agents created through the main Ollama management system</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mainSystemAgents.map((agent) => (
                <Card
                  key={agent.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        {agent.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAgent(agent.id, agent.name);
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {agent.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {agent.model}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {agent.framework || 'Main System'}
                        </Badge>
                      </div>
                      {agent.capabilities && agent.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.slice(0, 3).map((capability) => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(agent.registered_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Message List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Message History
                </CardTitle>
                <CardDescription>
                  Recent A2A communication between agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="ml-2">Loading messages...</span>
                  </div>
                ) : messagesError ? (
                  <p className="text-red-600">Error loading messages: {messagesError}</p>
                ) : messages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No messages yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {messages.map((message) => (
                      <div key={message.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{message.from_agent_name}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium text-sm">{message.to_agent_name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {message.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{message.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send A2A Message
                </CardTitle>
                <CardDescription>
                  Send a message between registered agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="from-agent">From Agent</Label>
                  <Select
                    value={selectedAgent?.id || ''}
                    onValueChange={(value) => {
                      const agent = [...agents, ...strandsAgents].find(a => a.id === value);
                      setSelectedAgent(agent || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...agents, ...strandsAgents, ...mainSystemAgents].map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} ({agent.model}) - {(agent as any).framework || 'A2A'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to-agent">To Agent</Label>
                  <Select
                    value={targetAgentId}
                    onValueChange={setTargetAgentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...agents, ...strandsAgents, ...mainSystemAgents]
                        .filter(agent => agent.id !== selectedAgent?.id)
                        .map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} ({agent.model}) - {(agent as any).framework || 'A2A'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!selectedAgent || !targetAgentId || !messageContent.trim() || isSending}
                  className="w-full"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default A2AAgentRegistry;
