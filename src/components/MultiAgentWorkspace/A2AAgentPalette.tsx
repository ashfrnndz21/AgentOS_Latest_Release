import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bot, 
  Network, 
  Activity, 
  Zap, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  Globe,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface A2AAgent {
  id: string;
  name: string;
  description: string;
  url: string;
  capabilities: string[];
  status: 'active' | 'unhealthy' | 'unreachable' | 'unknown';
  last_health_check?: string;
  registered_at: string;
}

interface A2AAgentPaletteProps {
  onAddA2AAgent: (agent: A2AAgent) => void;
  onTestA2AConnection: (agent: A2AAgent) => Promise<boolean>;
  onDiscoverAgent: (url: string) => Promise<A2AAgent | null>;
}

export const A2AAgentPalette: React.FC<A2AAgentPaletteProps> = ({
  onAddA2AAgent,
  onTestA2AConnection,
  onDiscoverAgent
}) => {
  const [a2aAgents, setA2aAgents] = useState<A2AAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [discoverDialogOpen, setDiscoverDialogOpen] = useState(false);
  const [discoverUrl, setDiscoverUrl] = useState('');
  const [discovering, setDiscovering] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Load A2A agents from registry
  const loadA2AAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5010/agents');
      const data = await response.json();
      
      if (data.status === 'success') {
        setA2aAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to load A2A agents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh agents every 30 seconds
  useEffect(() => {
    loadA2AAgents();
    const interval = setInterval(loadA2AAgents, 30000);
    return () => clearInterval(interval);
  }, [loadA2AAgents]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadA2AAgents();
    setRefreshing(false);
  };

  // Discover new agent
  const handleDiscoverAgent = async () => {
    if (!discoverUrl.trim()) return;
    
    try {
      setDiscovering(true);
      const agent = await onDiscoverAgent(discoverUrl);
      if (agent) {
        setA2aAgents(prev => [...prev, agent]);
        setDiscoverUrl('');
        setDiscoverDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to discover agent:', error);
    } finally {
      setDiscovering(false);
    }
  };

  // Test A2A connection
  const handleTestConnection = async (agent: A2AAgent) => {
    try {
      const result = await onTestA2AConnection(agent);
      setTestResults(prev => ({ ...prev, [agent.id]: result }));
    } catch (error) {
      console.error('Failed to test connection:', error);
      setTestResults(prev => ({ ...prev, [agent.id]: false }));
    }
  };

  // Get status icon and color
  const getStatusDisplay = (agent: A2AAgent) => {
    const testResult = testResults[agent.id];
    
    if (testResult === true) {
      return { icon: CheckCircle, color: 'text-green-500', text: 'Connected' };
    } else if (testResult === false) {
      return { icon: XCircle, color: 'text-red-500', text: 'Failed' };
    }
    
    switch (agent.status) {
      case 'active':
        return { icon: CheckCircle, color: 'text-green-500', text: 'Active' };
      case 'unhealthy':
        return { icon: AlertCircle, color: 'text-yellow-500', text: 'Unhealthy' };
      case 'unreachable':
        return { icon: XCircle, color: 'text-red-500', text: 'Unreachable' };
      default:
        return { icon: Clock, color: 'text-gray-500', text: 'Unknown' };
    }
  };

  // Get capability icon
  const getCapabilityIcon = (capability: string) => {
    switch (capability.toLowerCase()) {
      case 'calculator':
        return '🧮';
      case 'research':
        return '🔍';
      case 'weather':
        return '🌤️';
      case 'stock':
        return '📈';
      case 'coordinate':
        return '🎯';
      case 'think':
        return '🧠';
      default:
        return '⚙️';
    }
  };

  return (
    <div className="w-80 bg-slate-900/50 backdrop-blur-sm border-r border-slate-600/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-600/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-100">A2A Agents</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={discoverDialogOpen} onOpenChange={setDiscoverDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-600">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Discover A2A Agent</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="discover-url" className="text-slate-300">Agent URL</Label>
                    <Input
                      id="discover-url"
                      value={discoverUrl}
                      onChange={(e) => setDiscoverUrl(e.target.value)}
                      placeholder="http://localhost:8001"
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>
                  <Button
                    onClick={handleDiscoverAgent}
                    disabled={discovering || !discoverUrl.trim()}
                    className="w-full"
                  >
                    {discovering ? 'Discovering...' : 'Discover Agent'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Agent-to-Agent communication agents
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="registered" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/60">
            <TabsTrigger value="registered" className="text-slate-400 data-[state=active]:text-slate-100 text-xs">
              Registered ({a2aAgents.length})
            </TabsTrigger>
            <TabsTrigger value="discovered" className="text-slate-400 data-[state=active]:text-slate-100 text-xs">
              Discovered
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registered" className="space-y-3 mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-400">Loading agents...</span>
              </div>
            ) : a2aAgents.length === 0 ? (
              <div className="text-center py-8">
                <Network className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No A2A agents registered</p>
                <p className="text-slate-500 text-xs mt-1">
                  Use the discover button to find agents
                </p>
              </div>
            ) : (
              a2aAgents.map((agent) => {
                const statusDisplay = getStatusDisplay(agent);
                const StatusIcon = statusDisplay.icon;
                
                return (
                  <Card
                    key={agent.id}
                    className="p-3 bg-slate-800/40 border-slate-600/50 hover:border-blue-500/50 cursor-pointer transition-all duration-200 hover:bg-slate-800/60"
                    onClick={() => onAddA2AAgent(agent)}
                  >
                    <div className="space-y-3">
                      {/* Agent Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-blue-400" />
                          <div>
                            <h3 className="text-sm font-medium text-slate-100">{agent.name}</h3>
                            <p className="text-xs text-slate-400">{agent.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
                          <span className={`text-xs ${statusDisplay.color}`}>
                            {statusDisplay.text}
                          </span>
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map((capability) => (
                          <Badge
                            key={capability}
                            variant="secondary"
                            className="text-xs bg-slate-700/50 text-slate-300 border-slate-600"
                          >
                            {getCapabilityIcon(capability)} {capability}
                          </Badge>
                        ))}
                      </div>

                      {/* URL and Actions */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Globe className="h-3 w-3" />
                          <span className="truncate">{agent.url}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestConnection(agent);
                            }}
                            className="text-xs h-6 px-2 text-slate-400 hover:text-slate-200"
                          >
                            <Activity className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddA2AAgent(agent);
                            }}
                            className="text-xs h-6 px-2 text-blue-400 hover:text-blue-300"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Add to Canvas
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="discovered" className="space-y-3 mt-4">
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No discovered agents</p>
              <p className="text-slate-500 text-xs mt-1">
                Use the discover button to find new agents
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-600/30">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Registry: localhost:5010</span>
          <span>Auto-refresh: 30s</span>
        </div>
      </div>
    </div>
  );
};











