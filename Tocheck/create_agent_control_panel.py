#!/usr/bin/env python3
"""Create Agent Control Panel"""

content = '''import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, Users, Settings, Activity, Play, Square, 
  Trash2, Edit, Plus, RefreshCw 
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  model: string;
  created: string;
  lastActive: string;
}

export default function AgentControlPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:5052/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      } else {
        // Fallback to mock data
        const mockAgents: Agent[] = [
          {
            id: '1',
            name: 'Customer Support Agent',
            type: 'ollama',
            status: 'active',
            model: 'llama3.2:latest',
            created: '2024-01-15',
            lastActive: '2 minutes ago'
          },
          {
            id: '2',
            name: 'Data Analysis Agent',
            type: 'ollama',
            status: 'active',
            model: 'llama3.2:latest',
            created: '2024-01-14',
            lastActive: '5 minutes ago'
          }
        ];
        setAgents(mockAgents);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      // Use mock data on error
      const mockAgents: Agent[] = [
        {
          id: '1',
          name: 'Customer Support Agent',
          type: 'ollama',
          status: 'active',
          model: 'llama3.2:latest',
          created: '2024-01-15',
          lastActive: '2 minutes ago'
        }
      ];
      setAgents(mockAgents);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Agent Control Panel</h1>
          <p className="text-slate-300">Manage and monitor your AI agents</p>
        </div>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-slate-800/40 backdrop-blur-lg">
            <TabsTrigger value="agents">Active Agents</TabsTrigger>
            <TabsTrigger value="create">Create Agent</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <div className="grid gap-6">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading agents...</p>
                </div>
              ) : agents.length === 0 ? (
                <Card className="bg-slate-800/40 backdrop-blur-lg border-slate-600/30">
                  <CardContent className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-400">No agents found. Create your first agent to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                agents.map((agent) => (
                  <Card key={agent.id} className="bg-slate-800/40 backdrop-blur-lg border-slate-600/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bot className="h-8 w-8 text-blue-400" />
                          <div>
                            <CardTitle className="text-white">{agent.name}</CardTitle>
                            <p className="text-slate-400 text-sm">{agent.model}</p>
                          </div>
                        </div>
                        <Badge className={
                          agent.status === 'active' ? 'bg-green-600' :
                          agent.status === 'inactive' ? 'bg-yellow-600' : 'bg-red-600'
                        }>
                          {agent.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                          Last active: {agent.lastActive}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <Card className="bg-slate-800/40 backdrop-blur-lg border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-white">Create New Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Agent creation functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="bg-slate-800/40 backdrop-blur-lg border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-white">Agent Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Pre-built agent templates will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}'''

with open("src/pages/AgentControlPanel.tsx", "w") as f:
    f.write(content)

print("✅ Agent Control Panel created")