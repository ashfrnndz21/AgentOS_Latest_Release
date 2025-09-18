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
  RotateCcw,
  Filter,
  Search,
  Plus,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export interface UnifiedAgent {
  id: string;
  name: string;
  description: string;
  type: 'strands-sdk' | 'a2a-external' | 'a2a-local';
  status: 'active' | 'unhealthy' | 'unreachable' | 'unknown' | 'stopped';
  capabilities: string[];
  url?: string; // For A2A agents
  model?: string; // For Strands SDK agents
  last_health_check?: string;
  registered_at: string;
  is_discoverable: boolean;
  tools_enabled: string[];
}

interface UnifiedAgentPaletteProps {
  onAddAgent: (agent: UnifiedAgent) => void;
  onTestConnection: (agent: UnifiedAgent) => Promise<boolean>;
  onCreateAgent: () => void;
  onConfigureAgent: (agent: UnifiedAgent) => void;
}

export const UnifiedAgentPalette: React.FC<UnifiedAgentPaletteProps> = ({
  onAddAgent,
  onTestConnection,
  onCreateAgent,
  onConfigureAgent
}) => {
  const [agents, setAgents] = useState<UnifiedAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'strands-sdk' | 'a2a-external' | 'a2a-local'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'unhealthy' | 'unreachable'>('all');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Load all agents from unified registry
  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load from both Strands SDK and A2A registry
      const [strandsResponse, a2aResponse] = await Promise.all([
        fetch('http://localhost:5006/api/agents').catch(() => ({ json: () => ({ agents: [] }) })),
        fetch('http://localhost:5010/agents').catch(() => ({ json: () => ({ agents: [] }) }))
      ]);
      
      const [strandsData, a2aData] = await Promise.all([
        strandsResponse.json(),
        a2aResponse.json()
      ]);
      
      // Transform and merge agents
      const strandsAgents: UnifiedAgent[] = (strandsData.agents || []).map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description || `Strands SDK agent with ${agent.model || 'unknown model'}`,
        type: 'strands-sdk',
        status: 'active', // Strands SDK agents are always active when loaded
        capabilities: agent.capabilities || [],
        model: agent.model,
        registered_at: agent.created_at || new Date().toISOString(),
        is_discoverable: true,
        tools_enabled: agent.tools || []
      }));
      
      const a2aAgents: UnifiedAgent[] = (a2aData.agents || []).map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        type: 'a2a-external',
        status: agent.status,
        capabilities: agent.capabilities || [],
        url: agent.url,
        last_health_check: agent.last_health_check,
        registered_at: agent.registered_at,
        is_discoverable: true,
        tools_enabled: agent.capabilities || []
      }));
      
      setAgents([...strandsAgents, ...a2aAgents]);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh agents every 30 seconds
  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 30000);
    return () => clearInterval(interval);
  }, [loadAgents]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAgents();
    setRefreshing(false);
  };

  // Test connection
  const handleTestConnection = async (agent: UnifiedAgent) => {
    try {
      const result = await onTestConnection(agent);
      setTestResults(prev => ({ ...prev, [agent.id]: result }));
    } catch (error) {
      console.error('Failed to test connection:', error);
      setTestResults(prev => ({ ...prev, [agent.id]: false }));
    }
  };

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || agent.type === filterType;
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Get status display
  const getStatusDisplay = (agent: UnifiedAgent) => {
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
      case 'stopped':
        return { icon: Pause, color: 'text-gray-500', text: 'Stopped' };
      default:
        return { icon: Clock, color: 'text-gray-500', text: 'Unknown' };
    }
  };

  // Get agent type display
  const getAgentTypeDisplay = (type: string) => {
    switch (type) {
      case 'strands-sdk':
        return { icon: Bot, color: 'text-blue-400', text: 'Strands SDK', bg: 'bg-blue-500/10' };
      case 'a2a-external':
        return { icon: Network, color: 'text-green-400', text: 'A2A External', bg: 'bg-green-500/10' };
      case 'a2a-local':
        return { icon: Layers, color: 'text-purple-400', text: 'A2A Local', bg: 'bg-purple-500/10' };
      default:
        return { icon: Bot, color: 'text-gray-400', text: 'Unknown', bg: 'bg-gray-500/10' };
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
      case 'chat':
        return '💬';
      case 'analysis':
        return '📊';
      default:
        return '⚙️';
    }
  };

  return (
    <div className="w-80 bg-slate-900/50 backdrop-blur-sm border-r border-slate-600/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-600/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-100">Agents</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredAgents.length}
            </Badge>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateAgent}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="strands-sdk">Strands SDK</SelectItem>
                <SelectItem value="a2a-external">A2A External</SelectItem>
                <SelectItem value="a2a-local">A2A Local</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="unhealthy">Unhealthy</SelectItem>
                <SelectItem value="unreachable">Unreachable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-2 text-slate-400">Loading agents...</span>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No agents found</p>
            <p className="text-slate-500 text-xs mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Create your first agent'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAgents.map((agent) => {
              const statusDisplay = getStatusDisplay(agent);
              const typeDisplay = getAgentTypeDisplay(agent.type);
              const StatusIcon = statusDisplay.icon;
              const TypeIcon = typeDisplay.icon;
              
              return (
                <Card
                  key={agent.id}
                  className="p-3 bg-slate-800/40 border-slate-600/50 hover:border-blue-500/50 cursor-pointer transition-all duration-200 hover:bg-slate-800/60"
                  onClick={() => onAddAgent(agent)}
                >
                  <div className="space-y-3">
                    {/* Agent Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-5 w-5 text-blue-400" />
                        <div>
                          <h3 className="text-sm font-medium text-slate-100">{agent.name}</h3>
                          <p className="text-xs text-slate-400 line-clamp-1">{agent.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
                        <span className={`text-xs ${statusDisplay.color}`}>
                          {statusDisplay.text}
                        </span>
                      </div>
                    </div>

                    {/* Agent Type Badge */}
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${typeDisplay.bg} ${typeDisplay.color} border-0`}>
                        {typeDisplay.text}
                      </Badge>
                      {agent.is_discoverable && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                          Discoverable
                        </Badge>
                      )}
                    </div>

                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-1">
                      {agent.tools_enabled.slice(0, 4).map((capability) => (
                        <Badge
                          key={capability}
                          variant="secondary"
                          className="text-xs bg-slate-700/50 text-slate-300 border-slate-600"
                        >
                          {getCapabilityIcon(capability)} {capability}
                        </Badge>
                      ))}
                      {agent.tools_enabled.length > 4 && (
                        <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300">
                          +{agent.tools_enabled.length - 4}
                        </Badge>
                      )}
                    </div>

                    {/* Agent Details */}
                    <div className="space-y-1">
                      {agent.url && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Globe className="h-3 w-3" />
                          <span className="truncate">{agent.url}</span>
                        </div>
                      )}
                      {agent.model && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Settings className="h-3 w-3" />
                          <span>{agent.model}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
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
                          onConfigureAgent(agent);
                        }}
                        className="text-xs h-6 px-2 text-slate-400 hover:text-slate-200"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddAgent(agent);
                        }}
                        className="text-xs h-6 px-2 text-blue-400 hover:text-blue-300"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Add to Canvas
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-600/30">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Unified Registry</span>
          <span>Auto-refresh: 30s</span>
        </div>
      </div>
    </div>
  );
};
