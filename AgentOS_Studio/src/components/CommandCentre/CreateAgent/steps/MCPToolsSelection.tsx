import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mcpGatewayService, MCPTool, MCPServer } from '@/lib/services/MCPGatewayService';
import { 
  Search,
  CheckCircle,
  Plus,
  X,
  Database,
  Code,
  Globe,
  Server,
  Settings,
  Zap,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface MCPServer {
  id: string;
  name: string;
  description: string;
  url: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  type: 'local' | 'remote' | 'aws' | 'gateway';
  transport: 'sse' | 'streamable-http' | 'auto';
  supportedTransports: string[];
  tools: MCPTool[];
  toolCount: number;
  categories: string[];
  tags: string[];
  stars: number;
  license: string;
  isPython: boolean;
  enabled: boolean;
  authentication: {
    type: 'none' | 'bearer' | 'oauth2' | 'cognito';
  };
  agentCompatibility?: {
    frameworks: string[];
    minVersion?: string;
    maxConcurrency?: number;
  };
}

interface MCPTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  category: 'math' | 'text' | 'data' | 'api' | 'aws' | 'git' | 'filesystem' | 'other';
  serverId: string;
  serverName: string;
  popularity: number;
  verified: boolean;
  agentRecommended?: boolean;
  usageComplexity: 'simple' | 'moderate' | 'advanced';
  requiredPermissions?: string[];
}

interface MCPToolsSelectionProps {
  selectedMCPTools: { toolId: string; serverId: string; }[];
  onMCPToolToggle: (toolId: string, serverId: string, checked: boolean) => void;
}

const MCPToolsSelection: React.FC<MCPToolsSelectionProps> = ({
  selectedMCPTools,
  onMCPToolToggle
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [availableTools, setAvailableTools] = useState<MCPTool[]>([]);

  // Load MCP servers and tools from the gateway service
  useEffect(() => {
    const loadMCPData = async () => {
      try {
        setLoading(true);
        setError(null);
        

        
        // Load servers from MCP Gateway
        const servers = await mcpGatewayService.getServers();

        setMcpServers(servers);
        
        // Load all available tools
        const tools = await mcpGatewayService.getTools();

        setAvailableTools(tools);
        
      } catch (err) {
        console.error('Failed to load MCP data:', err);
        setError('Failed to connect to MCP Gateway. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    loadMCPData();
  }, []);

  const getCategoryIcon = (category: MCPTool['category']) => {
    switch (category) {
      case 'aws': return <Database className="h-4 w-4 text-orange-400" />;
      case 'git': return <Code className="h-4 w-4 text-purple-400" />;
      case 'filesystem': return <Server className="h-4 w-4 text-green-400" />;
      case 'api': return <Globe className="h-4 w-4 text-blue-400" />;
      case 'text': return <Zap className="h-4 w-4 text-yellow-400" />;
      default: return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: Settings },
    { id: 'aws', label: 'AWS', icon: Database },
    { id: 'git', label: 'Git', icon: Code },
    { id: 'api', label: 'API', icon: Globe },
    { id: 'filesystem', label: 'Files', icon: Server },
    { id: 'data', label: 'Data', icon: Zap }
  ];

  const getFilteredTools = () => {
    let tools = availableTools;
    
    if (activeCategory !== 'all') {
      tools = tools.filter(t => t.category === activeCategory);
    }
    
    if (searchTerm) {
      tools = tools.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.serverName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return tools.sort((a, b) => b.popularity - a.popularity);
  };

  const isToolSelected = (toolId: string, serverId: string) => {
    return selectedMCPTools.some(tool => tool.toolId === toolId && tool.serverId === serverId);
  };

  const getComplexityColor = (complexity: MCPTool['usageComplexity']) => {
    switch (complexity) {
      case 'simple': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getServerStatusColor = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-gray-400';
      case 'testing': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredTools = getFilteredTools();
  const connectedServers = mcpServers.filter(s => s.status === 'connected');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-gray-400">Loading MCP Gateway tools...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-700/50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Connection Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700"
          >
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (connectedServers.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <Server className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No MCP Servers Connected</h3>
          <p className="text-gray-400 mb-6">
            Connect to MCP Gateway servers to access tools for your agent
          </p>
          <div className="flex justify-center gap-3">
            <Button 
              onClick={() => window.open('/mcp-dashboard', '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open MCP Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('/settings', '_blank')}
              className="border-gray-600"
            >
              Configure Servers
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-1">MCP Gateway Tools</h3>
        <p className="text-sm text-gray-400">
          Select tools from {connectedServers.length} connected server{connectedServers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tools..."
          className="bg-gray-900 border-gray-700 text-white pl-10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 p-1 bg-gray-900 rounded-lg">
        {categories.map(category => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          const toolCount = category.id === 'all' 
            ? availableTools.length 
            : availableTools.filter(t => t.category === category.id).length;
          
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{category.label}</span>
              <Badge variant="outline" className="text-xs">
                {toolCount}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Tools List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredTools.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No tools found</p>
          </div>
        ) : (
          filteredTools.map((tool) => {
            const isSelected = isToolSelected(tool.id, tool.serverId);
            const server = mcpServers.find(s => s.id === tool.serverId);
            
            return (
              <div
                key={`${tool.serverId}-${tool.id}`}
                onClick={() => onMCPToolToggle(tool.id, tool.serverId, !isSelected)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-blue-600/10 border-blue-500/30' 
                    : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600/20' : 'bg-gray-700/50'}`}>
                    {getCategoryIcon(tool.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white truncate">{tool.name}</h4>
                      {tool.verified && <CheckCircle className="h-3 w-3 text-green-400" />}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{tool.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getComplexityColor(tool.usageComplexity)}`}>
                        {tool.usageComplexity}
                      </Badge>
                      <span className="text-xs text-gray-500">{tool.serverName}</span>
                      {server && (
                        <span className={`text-xs ${getServerStatusColor(server.status)}`}>
                          {server.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`p-1 rounded-full transition-colors ${
                  isSelected ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}>
                  {isSelected ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <Plus className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Tools Summary */}
      {selectedMCPTools.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">
                Selected Tools ({selectedMCPTools.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  selectedMCPTools.forEach(tool => {
                    onMCPToolToggle(tool.toolId, tool.serverId, false);
                  });
                }}
                className="text-gray-400 hover:text-white h-6 px-2"
              >
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedMCPTools.map((selectedTool, index) => {
                const tool = availableTools.find(t => t.id === selectedTool.toolId && t.serverId === selectedTool.serverId);
                return tool ? (
                  <div key={index} className="flex items-center gap-1 bg-blue-600/20 text-blue-300 px-2 py-1 rounded-md text-sm">
                    {getCategoryIcon(tool.category)}
                    <span>{tool.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMCPToolToggle(tool.id, tool.serverId, false);
                      }}
                      className="ml-1 text-blue-400 hover:text-blue-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MCPToolsSelection;