import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Server, Plus, TestTube, Settings, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  type: 'local' | 'remote' | 'aws';
  authentication?: {
    type: 'bearer' | 'cognito' | 'none';
    token?: string;
    cognitoConfig?: {
      userPoolId: string;
      clientId: string;
      region: string;
    };
  };
  tools: string[];
  lastTested?: Date;
  enabled: boolean;
}

const MCPSettings: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newServer, setNewServer] = useState<Partial<MCPServer>>({
    name: '',
    url: '',
    type: 'local',
    authentication: { type: 'none' },
    enabled: true
  });

  // Load saved MCP servers from localStorage
  useEffect(() => {
    const savedServers = localStorage.getItem('mcp-servers');
    if (savedServers) {
      setServers(JSON.parse(savedServers));
    }
  }, []);

  // Save servers to localStorage
  const saveServers = (updatedServers: MCPServer[]) => {
    setServers(updatedServers);
    localStorage.setItem('mcp-servers', JSON.stringify(updatedServers));
  };

  const testMCPConnection = async (server: MCPServer) => {
    const updatedServers = servers.map(s => 
      s.id === server.id ? { ...s, status: 'testing' as const } : s
    );
    saveServers(updatedServers);

    try {
      // Simulate MCP connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection
      const testedServers = servers.map(s => 
        s.id === server.id ? { 
          ...s, 
          status: 'connected' as const, 
          lastTested: new Date(),
          tools: ['add_numbers', 'multiply_numbers', 'greet_user'] // Mock tools
        } : s
      );
      saveServers(testedServers);
      toast.success(`Successfully connected to ${server.name}`);
    } catch (error) {
      const errorServers = servers.map(s => 
        s.id === server.id ? { ...s, status: 'error' as const } : s
      );
      saveServers(errorServers);
      toast.error(`Failed to connect to ${server.name}`);
    }
  };

  const addMCPServer = () => {
    if (!newServer.name || !newServer.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    const server: MCPServer = {
      id: Date.now().toString(),
      name: newServer.name,
      url: newServer.url,
      type: newServer.type || 'local',
      status: 'disconnected',
      authentication: newServer.authentication,
      tools: [],
      enabled: newServer.enabled || true
    };

    saveServers([...servers, server]);
    setNewServer({
      name: '',
      url: '',
      type: 'local',
      authentication: { type: 'none' },
      enabled: true
    });
    setIsAddDialogOpen(false);
    toast.success('MCP server added successfully');
  };

  const removeMCPServer = (serverId: string) => {
    const updatedServers = servers.filter(s => s.id !== serverId);
    saveServers(updatedServers);
    toast.success('MCP server removed');
  };

  const toggleServerEnabled = (serverId: string) => {
    const updatedServers = servers.map(s => 
      s.id === serverId ? { ...s, enabled: !s.enabled } : s
    );
    saveServers(updatedServers);
  };

  const getStatusIcon = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'testing': return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">MCP Servers</h2>
          <p className="text-gray-400">Manage Model Context Protocol servers for your agents</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add MCP Server
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add MCP Server</DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure a new Model Context Protocol server
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="server-name" className="text-white">Server Name</Label>
                <Input
                  id="server-name"
                  value={newServer.name || ''}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  placeholder="My MCP Server"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="server-url" className="text-white">Server URL</Label>
                <Input
                  id="server-url"
                  value={newServer.url || ''}
                  onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                  placeholder="http://localhost:8000/mcp"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="server-type" className="text-white">Server Type</Label>
                <Select
                  value={newServer.type}
                  onValueChange={(value) => setNewServer({ ...newServer, type: value as MCPServer['type'] })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="local">Local Server</SelectItem>
                    <SelectItem value="remote">Remote Server</SelectItem>
                    <SelectItem value="aws">AWS AgentCore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="auth-type" className="text-white">Authentication</Label>
                <Select
                  value={newServer.authentication?.type}
                  onValueChange={(value) => setNewServer({ 
                    ...newServer, 
                    authentication: { ...newServer.authentication, type: value as any }
                  })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="none">No Authentication</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="cognito">AWS Cognito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newServer.authentication?.type === 'bearer' && (
                <div>
                  <Label htmlFor="bearer-token" className="text-white">Bearer Token</Label>
                  <Input
                    id="bearer-token"
                    type="password"
                    value={newServer.authentication?.token || ''}
                    onChange={(e) => setNewServer({ 
                      ...newServer, 
                      authentication: { ...newServer.authentication, token: e.target.value }
                    })}
                    placeholder="Enter bearer token"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="server-enabled"
                  checked={newServer.enabled}
                  onCheckedChange={(checked) => setNewServer({ ...newServer, enabled: checked })}
                />
                <Label htmlFor="server-enabled" className="text-white">Enable server</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addMCPServer} className="bg-blue-600 hover:bg-blue-700">
                  Add Server
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {servers.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Server className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No MCP Servers</h3>
              <p className="text-gray-400 text-center mb-4">
                Add your first Model Context Protocol server to get started
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add MCP Server
              </Button>
            </CardContent>
          </Card>
        ) : (
          servers.map((server) => (
            <Card key={server.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(server.status)}
                    <div>
                      <CardTitle className="text-white">{server.name}</CardTitle>
                      <CardDescription className="text-gray-400">{server.url}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={server.type === 'aws' ? 'default' : 'secondary'}>
                      {server.type.toUpperCase()}
                    </Badge>
                    <Switch
                      checked={server.enabled}
                      onCheckedChange={() => toggleServerEnabled(server.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p className="text-white capitalize">{server.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Tools</p>
                      <p className="text-white">{server.tools.length} available</p>
                    </div>
                    {server.lastTested && (
                      <div>
                        <p className="text-sm text-gray-400">Last Tested</p>
                        <p className="text-white">{server.lastTested.toLocaleTimeString()}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testMCPConnection(server)}
                      disabled={server.status === 'testing'}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      {server.status === 'testing' ? 'Testing...' : 'Test'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMCPServer(server.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {server.tools.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Available Tools:</p>
                    <div className="flex flex-wrap gap-2">
                      {server.tools.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MCPSettings;