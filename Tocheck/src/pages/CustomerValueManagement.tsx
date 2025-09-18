import React, { useState } from 'react';
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

export default CustomerValueManagement;