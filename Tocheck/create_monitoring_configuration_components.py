#!/usr/bin/env python3
import os

print("🔧 CREATING MONITORING & CONFIGURATION COMPONENTS")
print("=" * 60)

# 1. Monitoring Dashboard
print("\n1️⃣ CREATING MONITORING DASHBOARD:")
monitoring_dashboard = '''import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Monitor, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Zap,
  Clock,
  Server,
  Database
} from 'lucide-react';

const MonitoringDashboard = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 23,
    memoryUsage: 67,
    diskUsage: 45,
    networkLatency: 12
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'High memory usage detected on Agent Server 2',
      timestamp: '2 minutes ago',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      message: 'System backup completed successfully',
      timestamp: '15 minutes ago',
      severity: 'low'
    },
    {
      id: 3,
      type: 'error',
      message: 'Connection timeout to external API',
      timestamp: '1 hour ago',
      severity: 'high'
    }
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'info': return CheckCircle;
      default: return CheckCircle;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Monitor className="h-8 w-8" />
          System Monitoring
        </h1>
        <p className="text-muted-foreground">
          Real-time system performance monitoring and alerting dashboard
        </p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.cpuUsage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${systemMetrics.cpuUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.memoryUsage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${systemMetrics.memoryUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.diskUsage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${systemMetrics.diskUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.networkLatency}ms</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Backend Services</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Database Connection</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ollama Service</span>
                    <Badge className="bg-green-100 text-green-800">Running</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>MCP Gateway</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Agent Processes</span>
                    <Badge className="bg-yellow-100 text-yellow-800">12 Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Requests/Second</span>
                    <span className="font-bold">247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Response Time</span>
                    <span className="font-bold">125ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Error Rate</span>
                    <span className="font-bold text-green-600">0.02%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Uptime</span>
                    <span className="font-bold">99.98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const AlertIcon = getAlertIcon(alert.type);
                  return (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertIcon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getAlertColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Performance charts and detailed analytics would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system events and activity logs</CardDescription>
            </CardHeader>
            <CardContent>
              <p>System logs and event history would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;'''

with open("src/pages/MonitoringDashboard.tsx", 'w') as f:
    f.write(monitoring_dashboard)
print("   ✅ Monitoring Dashboard created")

# 2. Configuration Management
print("\n2️⃣ CREATING CONFIGURATION MANAGEMENT:")
configuration_management = '''import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Settings, 
  Database, 
  Shield, 
  Zap,
  Globe,
  Key,
  Server,
  Code,
  FileText,
  Download,
  Upload
} from 'lucide-react';

const ConfigurationManagement = () => {
  const [configs, setConfigs] = useState([
    {
      id: 1,
      name: "Database Configuration",
      category: "Infrastructure",
      status: "active",
      lastModified: "2 hours ago",
      description: "Database connection and performance settings"
    },
    {
      id: 2,
      name: "Ollama Integration",
      category: "AI Services",
      status: "active",
      lastModified: "1 day ago",
      description: "Local AI model configuration and endpoints"
    },
    {
      id: 3,
      name: "Security Policies",
      category: "Security",
      status: "active",
      lastModified: "3 days ago",
      description: "Authentication and authorization settings"
    },
    {
      id: 4,
      name: "MCP Gateway",
      category: "Integration",
      status: "pending",
      lastModified: "5 minutes ago",
      description: "Model Context Protocol gateway configuration"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configuration Management
        </h1>
        <p className="text-muted-foreground">
          Manage system configurations, integrations, and deployment settings
        </p>
      </div>

      <Tabs defaultValue="configurations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="configurations" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">System Configurations</h2>
            <Button>
              <Code className="mr-2 h-4 w-4" />
              New Configuration
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {configs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(config.status)}>
                      {config.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{config.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Modified:</span>
                      <span>{config.lastModified}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">Export</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
              <CardDescription>Manage connections to external services and APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5" />
                    <div>
                      <h3 className="font-medium">PostgreSQL Database</h3>
                      <p className="text-sm text-muted-foreground">Primary data storage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5" />
                    <div>
                      <h3 className="font-medium">Ollama Service</h3>
                      <p className="text-sm text-muted-foreground">Local AI model hosting</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5" />
                    <div>
                      <h3 className="font-medium">MCP Gateway</h3>
                      <p className="text-sm text-muted-foreground">Model Context Protocol</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Running</Badge>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <div>
                      <h3 className="font-medium">AWS Services</h3>
                      <p className="text-sm text-muted-foreground">Cloud infrastructure</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Configuring</Badge>
                    <Button size="sm" variant="outline">Setup</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Configuration</CardTitle>
              <CardDescription>Manage deployment settings and environment configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Environment</label>
                    <select className="w-full mt-1 p-2 border rounded-lg">
                      <option>Development</option>
                      <option>Staging</option>
                      <option>Production</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Deployment Mode</label>
                    <select className="w-full mt-1 p-2 border rounded-lg">
                      <option>Docker</option>
                      <option>Kubernetes</option>
                      <option>Standalone</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Auto-scaling</label>
                    <select className="w-full mt-1 p-2 border rounded-lg">
                      <option>Enabled</option>
                      <option>Disabled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Load Balancer</label>
                    <select className="w-full mt-1 p-2 border rounded-lg">
                      <option>AWS ALB</option>
                      <option>NGINX</option>
                      <option>None</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Manage system backups and configuration exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export Configuration
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Configuration
                  </Button>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Backup
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Recent Backups</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Full System Backup - 2024-01-15</span>
                      <Button size="sm" variant="outline">Restore</Button>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Configuration Backup - 2024-01-14</span>
                      <Button size="sm" variant="outline">Restore</Button>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Database Backup - 2024-01-13</span>
                      <Button size="sm" variant="outline">Restore</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigurationManagement;'''

with open("src/pages/ConfigurationManagement.tsx", 'w') as f:
    f.write(configuration_management)
print("   ✅ Configuration Management created")

print("\n✅ MONITORING & CONFIGURATION COMPONENTS COMPLETE!")
print("=" * 60)