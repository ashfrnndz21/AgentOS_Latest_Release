import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { mcpGatewayService, MCPServer, MCPTool } from '@/lib/services/MCPGatewayService';
import { toast } from 'sonner';
import { 
  Server, 
  Search, 
  Globe, 
  Shield, 
  Zap, 
  Database,
  CheckCircle,
  Plus,
  Settings,
  BarChart3,
  Users,
  Code,
  Edit,
  Trash2,
  TestTube,
  XCircle,
  AlertCircle,
  Loader2,
  Activity,
  TrendingUp
} from 'lucide-react';

const MCPGateway: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialog states
  const [addServerOpen, setAddServerOpen] = useState(false);
  const [addToolOpen, setAddToolOpen] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [serversData, toolsData] = await Promise.all([
        mcpGatewayService.getServers(),
        mcpGatewayService.getTools()
      ]);
      setServers(serversData);
      setTools(toolsData);
    } catch (error) {
      console.error('Failed to load MCP data:', error);
      toast.error('Failed to load MCP data');
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const connectedServers = servers.filter(s => s.status === 'connected');
  const totalTools = tools.length;
  const verifiedTools = tools.filter(t => t.verified).length;
  const activeAgents = 12; // Mock data

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">MCP Gateway</h1>
          <p className="text-gray-400 mt-2">Enterprise-ready gateway for AI development tools and agent integration</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-green-900/30 border border-green-500/30 rounded-lg px-3 py-1">
            <span className="text-green-400 text-sm">{connectedServers.length} Connected</span>
          </div>
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg px-3 py-1">
            <span className="text-blue-400 text-sm">{totalTools} Tools Available</span>
          </div>
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg px-3 py-1">
            <span className="text-purple-400 text-sm">{verifiedTools} Verified</span>
          </div>
          <Button 
            onClick={() => setAddServerOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>
      </div>

      {/* Gateway Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Gateway Servers</p>
                <p className="text-2xl font-bold text-white">{servers.length}</p>
                <p className="text-xs text-gray-500">{connectedServers.length} connected</p>
              </div>
              <Server className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Available Tools</p>
                <p className="text-2xl font-bold text-white">{totalTools}</p>
                <p className="text-xs text-gray-500">{verifiedTools} verified</p>
              </div>
              <Zap className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Agents</p>
                <p className="text-2xl font-bold text-white">{activeAgents}</p>
                <p className="text-xs text-gray-500">Using gateway tools</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Security Status</p>
                <p className="text-2xl font-bold text-green-400">Secure</p>
                <p className="text-xs text-gray-500">All authenticated</p>
              </div>
              <Shield className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="servers" className="data-[state=active]:bg-blue-600">
            <Server className="h-4 w-4 mr-2" />
            Servers
          </TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-blue-600">
            <Zap className="h-4 w-4 mr-2" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription>Manage your MCP gateway and tool discovery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setAddServerOpen(true)}
                  className="bg-green-600 hover:bg-green-700 p-4 h-auto flex flex-col items-center space-y-2"
                >
                  <Plus className="h-6 w-6" />
                  <span>Add Server</span>
                </Button>
                <Button 
                  onClick={() => setAddToolOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 p-4 h-auto flex flex-col items-center space-y-2"
                >
                  <Code className="h-6 w-6" />
                  <span>Create Tool</span>
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 p-4 h-auto flex flex-col items-center space-y-2">
                  <Search className="h-6 w-6" />
                  <span>Discover Tools</span>
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700 p-4 h-auto flex flex-col items-center space-y-2">
                  <Settings className="h-6 w-6" />
                  <span>Gateway Config</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                  <Activity className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-white text-sm">Server "AWS AgentCore Gateway" connected</p>
                    <p className="text-gray-400 text-xs">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-white text-sm">New tool "S3 Upload" registered</p>
                    <p className="text-gray-400 text-xs">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-white text-sm">Agent "Banking Assistant" used 3 tools</p>
                    <p className="text-gray-400 text-xs">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servers" className="space-y-6">
          <ServersTab 
            servers={servers}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <ToolsTab 
            tools={tools}
            servers={servers}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab servers={servers} tools={tools} />
        </TabsContent>
      </Tabs>

      {/* Add Server Dialog */}
      <AddServerDialog 
        open={addServerOpen}
        onOpenChange={setAddServerOpen}
        onSuccess={loadData}
      />

      {/* Add Tool Dialog */}
      <AddToolDialog 
        open={addToolOpen}
        onOpenChange={setAddToolOpen}
        servers={servers}
        onSuccess={loadData}
      />
    </div>
  );
};

// Helper Components
const ServersTab: React.FC<{
  servers: MCPServer[];
  onRefresh: () => void;
}> = ({ servers, onRefresh }) => {
  const getStatusIcon = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'testing': return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const testConnection = async (server: MCPServer) => {
    try {
      await mcpGatewayService.updateServer(server.id, { status: 'testing' });
      onRefresh();
      
      // Simulate connection test
      setTimeout(async () => {
        const success = await mcpGatewayService.testServerConnection(server.id);
        await mcpGatewayService.updateServer(server.id, { 
          status: success ? 'connected' : 'error',
          lastHealthCheck: new Date()
        });
        onRefresh();
        toast.success(success ? 'Connection successful' : 'Connection failed');
      }, 2000);
    } catch (error) {
      toast.error('Failed to test connection');
    }
  };

  const deleteServer = async (serverId: string) => {
    try {
      await mcpGatewayService.deleteServer(serverId);
      toast.success('Server deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete server');
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">MCP Servers</CardTitle>
            <CardDescription>Manage your Model Context Protocol servers</CardDescription>
          </div>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {servers.map((server) => (
            <div key={server.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(server.status)}
                <div className="flex items-center space-x-2">
                  {server.type === 'aws' && <Database className="h-4 w-4 text-orange-500" />}
                  {server.type === 'remote' && <Globe className="h-4 w-4 text-blue-500" />}
                  {server.type === 'local' && <Server className="h-4 w-4 text-green-500" />}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{server.name}</h3>
                  <p className="text-gray-400 text-sm">{server.description}</p>
                  <p className="text-gray-500 text-xs">{server.url}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${
                  server.type === 'aws' ? 'bg-orange-900/30 text-orange-400 border-orange-500/30' :
                  server.type === 'remote' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' :
                  'bg-green-900/30 text-green-400 border-green-500/30'
                }`}>
                  {server.type.toUpperCase()}
                </Badge>
                <Badge className={`${
                  server.status === 'connected' ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                  server.status === 'error' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                  'bg-gray-900/30 text-gray-400 border-gray-500/30'
                }`}>
                  {server.status}
                </Badge>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(server)}
                    disabled={server.status === 'testing'}
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteServer(server.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ToolsTab: React.FC<{
  tools: MCPTool[];
  servers: MCPServer[];
  onRefresh: () => void;
}> = ({ tools, servers, onRefresh }) => {
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

  const deleteTool = async (toolId: string) => {
    try {
      await mcpGatewayService.deleteTool(toolId);
      toast.success('Tool deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete tool');
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">MCP Tools</CardTitle>
            <CardDescription>Available tools from connected servers</CardDescription>
          </div>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {tools.map((tool) => (
            <div key={tool.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {getCategoryIcon(tool.category)}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold">{tool.name}</h3>
                    {tool.verified && <CheckCircle className="h-3 w-3 text-green-400" />}
                  </div>
                  <p className="text-gray-400 text-sm">{tool.description}</p>
                  <p className="text-gray-500 text-xs">{tool.serverName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {tool.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {tool.usageComplexity}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTool(tool.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AnalyticsTab: React.FC<{
  servers: MCPServer[];
  tools: MCPTool[];
}> = ({ servers, tools }) => {
  const connectedServers = servers.filter(s => s.status === 'connected');
  const verifiedTools = tools.filter(t => t.verified);
  const toolsByCategory = tools.reduce((acc, tool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Server Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Connected</span>
                <span className="text-green-400">{connectedServers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Disconnected</span>
                <span className="text-red-400">{servers.length - connectedServers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="text-white">{servers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Tool Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Tools</span>
                <span className="text-white">{tools.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Verified</span>
                <span className="text-green-400">{verifiedTools.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Categories</span>
                <span className="text-blue-400">{Object.keys(toolsByCategory).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Usage Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Agents</span>
                <span className="text-purple-400">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tool Calls Today</span>
                <span className="text-yellow-400">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate</span>
                <span className="text-green-400">98.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Tools by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(toolsByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-white capitalize">{category}</span>
                </div>
                <span className="text-gray-400">{count} tools</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AddServerDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}> = ({ open, onOpenChange, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<MCPServer>>({
    name: '',
    description: '',
    url: '',
    type: 'remote',
    transport: 'auto',
    authentication: { type: 'none' },
    enabled: true
  });

  const handleSubmit = async () => {
    try {
      await mcpGatewayService.registerServer(formData);
      toast.success('Server added successfully');
      onSuccess();
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        url: '',
        type: 'remote',
        transport: 'auto',
        authentication: { type: 'none' },
        enabled: true
      });
    } catch (error) {
      toast.error('Failed to add server');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add MCP Server</DialogTitle>
          <DialogDescription className="text-gray-400">
            Register a new Model Context Protocol server
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-white">Server Name</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My MCP Server"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Server description..."
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Server URL</Label>
            <Input
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="http://localhost:8000/mcp"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Server Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as MCPServer['type'] })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="local">Local Server</SelectItem>
                <SelectItem value="remote">Remote Server</SelectItem>
                <SelectItem value="aws">AWS Gateway</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            />
            <Label className="text-white">Enable server</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              Add Server
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddToolDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servers: MCPServer[];
  onSuccess: () => void;
}> = ({ open, onOpenChange, servers, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<MCPTool>>({
    name: '',
    description: '',
    category: 'other',
    usageComplexity: 'simple',
    verified: false,
    agentRecommended: false
  });
  const [selectedServerId, setSelectedServerId] = useState('');

  const handleSubmit = async () => {
    if (!selectedServerId) {
      toast.error('Please select a server');
      return;
    }

    try {
      await mcpGatewayService.createTool(selectedServerId, formData);
      toast.success('Tool created successfully');
      onSuccess();
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        category: 'other',
        usageComplexity: 'simple',
        verified: false,
        agentRecommended: false
      });
      setSelectedServerId('');
    } catch (error) {
      toast.error('Failed to create tool');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create MCP Tool</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new tool for an MCP server
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-white">Server</Label>
            <Select value={selectedServerId} onValueChange={setSelectedServerId}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {servers.map((server) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">Tool Name</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Tool"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tool description..."
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as MCPTool['category'] })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="aws">AWS</SelectItem>
                <SelectItem value="git">Git</SelectItem>
                <SelectItem value="filesystem">Filesystem</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">Complexity</Label>
            <Select
              value={formData.usageComplexity}
              onValueChange={(value) => setFormData({ ...formData, usageComplexity: value as MCPTool['usageComplexity'] })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.verified}
              onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
            />
            <Label className="text-white">Verified tool</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              Create Tool
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MCPGateway;