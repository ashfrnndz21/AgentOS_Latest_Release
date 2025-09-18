import React, { useState } from 'react';
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

export default WealthManagement;