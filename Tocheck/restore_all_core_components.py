#!/usr/bin/env python3
import os

print("🔧 RESTORING ALL CORE PLATFORM COMPONENTS")
print("=" * 60)

# 1. Enhanced Dashboard (Index page)
print("\n1️⃣ CREATING ENHANCED DASHBOARD:")
enhanced_dashboard = '''import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Bot, 
  Activity, 
  Globe, 
  FileText, 
  Settings,
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  DollarSign
} from 'lucide-react';

const Index = () => {
  const [systemStats, setSystemStats] = useState({
    activeAgents: 12,
    totalWorkflows: 8,
    systemLoad: 23,
    uptime: '99.9%'
  });

  const quickActions = [
    {
      title: "Create Agent",
      description: "Build a new AI agent",
      icon: Bot,
      color: "bg-blue-500",
      path: "/command-centre"
    },
    {
      title: "Multi-Agent Workspace", 
      description: "Collaborative workflows",
      icon: Users,
      color: "bg-green-500",
      path: "/multi-agent-workspace"
    },
    {
      title: "Risk Analytics",
      description: "Financial risk assessment",
      icon: TrendingUp,
      color: "bg-purple-500", 
      path: "/risk-analytics"
    },
    {
      title: "Document Processing",
      description: "RAG and document chat",
      icon: FileText,
      color: "bg-orange-500",
      path: "/documents"
    }
  ];

  const systemMetrics = [
    {
      title: "Active Agents",
      value: systemStats.activeAgents,
      change: "+2 from yesterday",
      icon: Bot,
      color: "text-blue-600"
    },
    {
      title: "Running Workflows", 
      value: systemStats.totalWorkflows,
      change: "+1 this hour",
      icon: Activity,
      color: "text-green-600"
    },
    {
      title: "System Load",
      value: `${systemStats.systemLoad}%`,
      change: "Optimal performance",
      icon: BarChart3,
      color: "text-purple-600"
    },
    {
      title: "Uptime",
      value: systemStats.uptime,
      change: "Last 30 days",
      icon: Shield,
      color: "text-emerald-600"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🏦 Banking Agent Platform</h1>
        <p className="text-muted-foreground text-lg">
          Welcome to your comprehensive AI agent management platform
        </p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => window.location.href = action.path}>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New agent "Risk Analyzer" created</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Workflow "Customer Onboarding" completed</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System performance optimized</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform status and monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Backend Services</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database Connection</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ollama Integration</span>
                <Badge className="bg-yellow-100 text-yellow-800">Checking...</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">MCP Gateway</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;'''

with open("src/pages/Index.tsx", 'w') as f:
    f.write(enhanced_dashboard)
print("   ✅ Enhanced Dashboard created")

# 2. Customer Value Management
print("\n2️⃣ CREATING CUSTOMER VALUE MANAGEMENT:")
cvm_page = '''import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  BarChart3,
  PieChart,
  UserCheck,
  Star,
  AlertTriangle
} from 'lucide-react';

const CustomerValueManagement = () => {
  const [selectedSegment, setSelectedSegment] = useState('all');

  const customerMetrics = [
    {
      title: "Total Customers",
      value: "24,567",
      change: "+12% this month",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Customer Lifetime Value",
      value: "$45,230",
      change: "+8.5% vs last quarter",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Retention Rate",
      value: "94.2%",
      change: "+2.1% improvement",
      icon: UserCheck,
      color: "text-purple-600"
    },
    {
      title: "Satisfaction Score",
      value: "4.7/5",
      change: "+0.3 this month",
      icon: Star,
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-8 w-8" />
          Customer Value Management
        </h1>
        <p className="text-muted-foreground">
          Analyze customer behavior, predict value, and optimize relationships
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {customerMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution</CardTitle>
                <CardDescription>Breakdown by customer segments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Premium Banking</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded">
                        <div className="w-16 h-2 bg-purple-500 rounded"></div>
                      </div>
                      <span className="text-sm">3,420</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Business Banking</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded">
                        <div className="w-20 h-2 bg-blue-500 rounded"></div>
                      </div>
                      <span className="text-sm">8,950</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Personal Banking</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded">
                        <div className="w-24 h-2 bg-green-500 rounded"></div>
                      </div>
                      <span className="text-sm">12,197</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Segment</CardTitle>
                <CardDescription>Monthly revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Premium Banking</span>
                    <span className="font-bold">$125M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Business Banking</span>
                    <span className="font-bold">$89M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Personal Banking</span>
                    <span className="font-bold">$45M</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments Analysis</CardTitle>
              <CardDescription>Detailed breakdown of customer categories</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Customer segmentation analysis and detailed metrics would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>AI-powered customer behavior analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Customer insights and predictive analytics would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaigns</CardTitle>
              <CardDescription>Targeted customer engagement campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Marketing campaign management and performance metrics would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerValueManagement;'''

with open("src/pages/CustomerValueManagement.tsx", 'w') as f:
    f.write(cvm_page)
print("   ✅ Customer Value Management created")

# 3. Wealth Management
print("\n3️⃣ CREATING WEALTH MANAGEMENT:")
wealth_management = '''import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart,
  BarChart3,
  Target,
  Shield,
  Briefcase,
  Users
} from 'lucide-react';

const WealthManagement = () => {
  const portfolioMetrics = [
    {
      title: "Total Assets Under Management",
      value: "$2.4B",
      change: "+12.5% YTD",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Portfolios",
      value: "1,247",
      change: "+8.2% this quarter",
      icon: Briefcase,
      color: "text-blue-600"
    },
    {
      title: "Average Portfolio Performance",
      value: "+15.3%",
      change: "vs benchmark +12.1%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Client Satisfaction",
      value: "96.8%",
      change: "+2.1% improvement",
      icon: Users,
      color: "text-emerald-600"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Wealth Management
        </h1>
        <p className="text-muted-foreground">
          Comprehensive portfolio management and investment advisory platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {portfolioMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="portfolios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolios" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
                <CardDescription>Asset distribution across portfolios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Equities</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded">
                        <div className="w-16 h-2 bg-blue-500 rounded"></div>
                      </div>
                      <span className="text-sm">65%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fixed Income</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded">
                        <div className="w-6 h-2 bg-green-500 rounded"></div>
                      </div>
                      <span className="text-sm">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Alternative Investments</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded">
                        <div className="w-2 h-2 bg-purple-500 rounded"></div>
                      </div>
                      <span className="text-sm">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Portfolios</CardTitle>
                <CardDescription>Best performing portfolios this quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Growth Portfolio A</p>
                      <p className="text-sm text-muted-foreground">$45M AUM</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+18.5%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Balanced Portfolio B</p>
                      <p className="text-sm text-muted-foreground">$32M AUM</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+16.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Conservative Portfolio C</p>
                      <p className="text-sm text-muted-foreground">$28M AUM</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+14.8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Portfolio performance metrics and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Detailed performance analytics and benchmarking would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
              <CardDescription>Portfolio risk assessment and monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Risk analysis tools and portfolio risk metrics would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>Client portfolio overview and management</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Client management interface and portfolio assignments would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WealthManagement;'''

with open("src/pages/WealthManagement.tsx", 'w') as f:
    f.write(wealth_management)
print("   ✅ Wealth Management created")

print("\n✅ CORE COMPONENTS RESTORATION COMPLETE!")
print("=" * 60)