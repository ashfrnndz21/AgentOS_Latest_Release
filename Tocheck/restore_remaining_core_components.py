#!/usr/bin/env python3
import os

print("🔧 RESTORING REMAINING CORE COMPONENTS")
print("=" * 60)

# 4. Agent Control Panel
print("\n4️⃣ CREATING AGENT CONTROL PANEL:")
agent_control_panel = '''import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Users,
  BarChart3
} from 'lucide-react';

const AgentControlPanel = () => {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: "Customer Service Agent",
      status: "active",
      type: "Ollama",
      model: "llama3.1:8b",
      uptime: "2d 14h",
      requests: 1247,
      lastActivity: "2 minutes ago"
    },
    {
      id: 2,
      name: "Risk Analysis Agent",
      status: "active",
      type: "OpenAI",
      model: "gpt-4",
      uptime: "1d 8h",
      requests: 892,
      lastActivity: "5 minutes ago"
    },
    {
      id: 3,
      name: "Document Processing Agent",
      status: "paused",
      type: "Ollama",
      model: "llama3.1:70b",
      uptime: "0h",
      requests: 0,
      lastActivity: "1 hour ago"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'paused': return Clock;
      case 'error': return AlertCircle;
      default: return Bot;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Bot className="h-8 w-8" />
          Agent Control Panel
        </h1>
        <p className="text-muted-foreground">
          Monitor, manage, and control all your AI agents from one central dashboard
        </p>
      </div>

      {/* Agent Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">+1 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,139</div>
            <p className="text-xs text-muted-foreground">+15% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">Optimal performance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Management</CardTitle>
              <CardDescription>Control and monitor all your AI agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.map((agent) => {
                  const StatusIcon = getStatusIcon(agent.status);
                  return (
                    <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <StatusIcon className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {agent.type} • {agent.model}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{agent.requests} requests</p>
                          <p className="text-xs text-muted-foreground">Uptime: {agent.uptime}</p>
                        </div>
                        
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                        
                        <div className="flex gap-2">
                          {agent.status === 'active' ? (
                            <Button size="sm" variant="outline">
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>Live performance metrics and system health</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Real-time monitoring dashboard with performance metrics would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Agent activity logs and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <p>System logs and agent activity history would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Settings</CardTitle>
              <CardDescription>Configure agent parameters and system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Agent configuration and system settings would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentControlPanel;'''

with open("src/pages/AgentControlPanel.tsx", 'w') as f:
    f.write(agent_control_panel)
print("   ✅ Agent Control Panel created")

# 5. AI Marketplace
print("\n5️⃣ CREATING AI MARKETPLACE:")
ai_marketplace = '''import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Store, 
  Download, 
  Star, 
  Users,
  Bot,
  Zap,
  Shield,
  Search,
  Filter,
  TrendingUp
} from 'lucide-react';

const AIMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const featuredAgents = [
    {
      id: 1,
      name: "Financial Risk Analyzer",
      description: "Advanced risk assessment and portfolio analysis agent",
      category: "Finance",
      rating: 4.8,
      downloads: 1247,
      price: "Free",
      tags: ["Risk Management", "Portfolio", "Analytics"],
      verified: true
    },
    {
      id: 2,
      name: "Customer Service Pro",
      description: "Intelligent customer support with multi-language capabilities",
      category: "Customer Service",
      rating: 4.9,
      downloads: 2156,
      price: "$29/month",
      tags: ["Support", "Multilingual", "Chat"],
      verified: true
    },
    {
      id: 3,
      name: "Document Intelligence",
      description: "Advanced document processing and information extraction",
      category: "Document Processing",
      rating: 4.7,
      downloads: 892,
      price: "$19/month",
      tags: ["OCR", "Extraction", "Analysis"],
      verified: false
    },
    {
      id: 4,
      name: "Fraud Detection Engine",
      description: "Real-time fraud detection and prevention system",
      category: "Security",
      rating: 4.9,
      downloads: 1543,
      price: "$49/month",
      tags: ["Security", "Fraud", "Real-time"],
      verified: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', count: 24 },
    { id: 'finance', name: 'Finance', count: 8 },
    { id: 'customer-service', name: 'Customer Service', count: 6 },
    { id: 'security', name: 'Security', count: 4 },
    { id: 'document', name: 'Document Processing', count: 6 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Store className="h-8 w-8" />
          AI Marketplace
        </h1>
        <p className="text-muted-foreground">
          Discover, install, and manage AI agents from our curated marketplace
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="featured" className="space-y-4">
        <TabsList>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="new">New Releases</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {featuredAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {agent.name}
                        {agent.verified && (
                          <Shield className="h-4 w-4 text-blue-500" />
                        )}
                      </CardTitle>
                      <CardDescription>{agent.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{agent.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {agent.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{agent.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {agent.downloads.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{agent.price}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Install
                      </Button>
                      <Button variant="outline">Preview</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Agents</CardTitle>
              <CardDescription>Top downloaded agents this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Popular agents ranking and statistics would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Releases</CardTitle>
              <CardDescription>Latest agents added to the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Newly released agents and recent updates would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>{category.count} agents available</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Browse Category
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIMarketplace;'''

with open("src/pages/AIMarketplace.tsx", 'w') as f:
    f.write(ai_marketplace)
print("   ✅ AI Marketplace created")

# 6. Enhanced Settings Page
print("\n6️⃣ ENHANCING SETTINGS PAGE:")
enhanced_settings = '''import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell,
  Database,
  Palette,
  Globe,
  Key,
  Monitor,
  Zap
} from 'lucide-react';

const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true
  });

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your platform preferences and system settings
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Platform Name</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 p-2 border rounded-lg" 
                    defaultValue="AWS Banking Agent OS"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Default Language</label>
                  <select className="w-full mt-1 p-2 border rounded-lg">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <select className="w-full mt-1 p-2 border rounded-lg">
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+1 (Central European Time)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date Format</label>
                  <select className="w-full mt-1 p-2 border rounded-lg">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 p-2 border rounded-lg" 
                    defaultValue="Demo User"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    type="email" 
                    className="w-full mt-1 p-2 border rounded-lg" 
                    defaultValue="demo@ashrepo.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <select className="w-full mt-1 p-2 border rounded-lg">
                    <option>Administrator</option>
                    <option>Manager</option>
                    <option>Analyst</option>
                    <option>Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 p-2 border rounded-lg" 
                    defaultValue="Risk Management"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Session Timeout</h3>
                    <p className="text-sm text-muted-foreground">Automatic logout after inactivity</p>
                  </div>
                  <select className="p-2 border rounded">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>Never</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">API Access</h3>
                    <p className="text-sm text-muted-foreground">Manage API keys and access tokens</p>
                  </div>
                  <Button variant="outline">Manage Keys</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.push}
                    onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">SMS Alerts</h3>
                    <p className="text-sm text-muted-foreground">Critical alerts via SMS</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
              <CardDescription>Manage external service connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Ollama Integration</h3>
                    <p className="text-sm text-muted-foreground">Local AI model management</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">MCP Gateway</h3>
                    <p className="text-sm text-muted-foreground">Model Context Protocol integration</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">AWS Services</h3>
                    <p className="text-sm text-muted-foreground">Cloud service integration</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Theme</label>
                  <select className="w-full mt-1 p-2 border rounded-lg">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>Auto (System)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Sidebar Position</label>
                  <select className="w-full mt-1 p-2 border rounded-lg">
                    <option>Left</option>
                    <option>Right</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Density</label>
                  <select className="w-full mt-1 p-2 border rounded-lg">
                    <option>Comfortable</option>
                    <option>Compact</option>
                    <option>Spacious</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

export default Settings;'''

with open("src/pages/Settings.tsx", 'w') as f:
    f.write(enhanced_settings)
print("   ✅ Enhanced Settings page created")

print("\n✅ REMAINING CORE COMPONENTS RESTORATION COMPLETE!")
print("=" * 60)