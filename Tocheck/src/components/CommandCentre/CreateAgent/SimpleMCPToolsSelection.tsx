import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface MCPTool {
  id: string;
  name: string;
  description: string;
  category: 'math' | 'text' | 'data' | 'api' | 'aws' | 'git' | 'filesystem' | 'other';
  serverId: string;
  serverName: string;
  popularity: number;
  verified: boolean;
  usageComplexity: 'simple' | 'moderate' | 'advanced';
}

interface MCPServer {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  toolCount: number;
}

interface SimpleMCPToolsSelectionProps {
  selectedMCPTools: { toolId: string; serverId: string; }[];
  onMCPToolToggle: (toolId: string, serverId: string, checked: boolean) => void;
}

export const SimpleMCPToolsSelection: React.FC<SimpleMCPToolsSelectionProps> = ({
  selectedMCPTools,
  onMCPToolToggle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Mock data for demo - in real implementation this would come from MCPGatewayService
  const mockServers: MCPServer[] = [
    { id: 'aws-server', name: 'AWS Tools', status: 'connected', toolCount: 15 },
    { id: 'git-server', name: 'Git Tools', status: 'connected', toolCount: 8 },
    { id: 'filesystem-server', name: 'File System', status: 'connected', toolCount: 12 }
  ];

  const mockTools: MCPTool[] = [
    {
      id: 'aws-s3-list',
      name: 'S3 List Objects',
      description: 'List objects in an S3 bucket',
      category: 'aws',
      serverId: 'aws-server',
      serverName: 'AWS Tools',
      popularity: 95,
      verified: true,
      usageComplexity: 'simple'
    },
    {
      id: 'git-status',
      name: 'Git Status',
      description: 'Check the status of a git repository',
      category: 'git',
      serverId: 'git-server',
      serverName: 'Git Tools',
      popularity: 88,
      verified: true,
      usageComplexity: 'simple'
    },
    {
      id: 'file-read',
      name: 'Read File',
      description: 'Read contents of a file',
      category: 'filesystem',
      serverId: 'filesystem-server',
      serverName: 'File System',
      popularity: 92,
      verified: true,
      usageComplexity: 'simple'
    },
    {
      id: 'aws-lambda-invoke',
      name: 'Lambda Invoke',
      description: 'Invoke an AWS Lambda function',
      category: 'aws',
      serverId: 'aws-server',
      serverName: 'AWS Tools',
      popularity: 78,
      verified: true,
      usageComplexity: 'moderate'
    },
    {
      id: 'git-commit',
      name: 'Git Commit',
      description: 'Create a git commit with changes',
      category: 'git',
      serverId: 'git-server',
      serverName: 'Git Tools',
      popularity: 85,
      verified: true,
      usageComplexity: 'moderate'
    }
  ];

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
    { id: 'filesystem', label: 'Files', icon: Server }
  ];

  const getFilteredTools = () => {
    let tools = mockTools;
    
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

  const filteredTools = getFilteredTools();
  const connectedServers = mockServers.filter(s => s.status === 'connected');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <Label className="text-white text-lg block mb-2">MCP Gateway Tools</Label>
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
          className="bg-beam-dark border-gray-700 text-white pl-10"
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
      <div className="flex gap-1 p-1 bg-beam-dark rounded-lg">
        {categories.map(category => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          const toolCount = category.id === 'all' 
            ? mockTools.length 
            : mockTools.filter(t => t.category === category.id).length;
          
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-beam-blue text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
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
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {filteredTools.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No tools found</p>
          </div>
        ) : (
          filteredTools.map((tool) => {
            const isSelected = isToolSelected(tool.id, tool.serverId);
            
            return (
              <div
                key={`${tool.serverId}-${tool.id}`}
                onClick={() => onMCPToolToggle(tool.id, tool.serverId, !isSelected)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-beam-blue/10 border-beam-blue/30' 
                    : 'bg-beam-dark border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-beam-blue/20' : 'bg-gray-700/50'}`}>
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
                    </div>
                  </div>
                </div>
                <div className={`p-1 rounded-full transition-colors ${
                  isSelected ? 'bg-beam-blue' : 'bg-gray-700 hover:bg-gray-600'
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
        <Card className="bg-beam-dark border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">
                Selected MCP Tools ({selectedMCPTools.length})
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
                const tool = mockTools.find(t => t.id === selectedTool.toolId && t.serverId === selectedTool.serverId);
                return tool ? (
                  <div key={index} className="flex items-center gap-1 bg-beam-blue/20 text-blue-300 px-2 py-1 rounded-md text-sm">
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