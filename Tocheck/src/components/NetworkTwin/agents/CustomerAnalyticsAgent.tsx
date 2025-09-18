import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingDown, 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';

interface CustomerSegment {
  id: string;
  name: string;
  size: number;
  churnRate: number;
  avgRevenue: number;
  networkUsage: number;
  satisfactionScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  growthTrend: 'up' | 'down' | 'stable';
}

interface ServiceMetric {
  service: string;
  subscribers: number;
  churnRate: number;
  revenueImpact: number;
  networkLoad: number;
  customerSat: number;
  issues: string[];
}

interface BrowsingData {
  region: string;
  totalGB: number;
  popularServices: string[];
  peakHours: string;
  deviceTypes: { type: string; percentage: number }[];
  qualityScore: number;
}

export const CustomerAnalyticsAgent: React.FC = () => {
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([
    {
      id: 'premium',
      name: 'Premium Business',
      size: 12500,
      churnRate: 2.1,
      avgRevenue: 8500,
      networkUsage: 95,
      satisfactionScore: 94,
      riskLevel: 'low',
      growthTrend: 'up'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      size: 3200,
      churnRate: 1.8,
      avgRevenue: 25000,
      networkUsage: 87,
      satisfactionScore: 96,
      riskLevel: 'low',
      growthTrend: 'up'
    },
    {
      id: 'consumer',
      name: 'Consumer Mobile',
      size: 850000,
      churnRate: 8.5,
      avgRevenue: 45,
      networkUsage: 78,
      satisfactionScore: 82,
      riskLevel: 'medium',
      growthTrend: 'stable'
    },
    {
      id: 'youth',
      name: 'Youth Data Plans',
      size: 125000,
      churnRate: 12.3,
      avgRevenue: 25,
      networkUsage: 92,
      satisfactionScore: 76,
      riskLevel: 'high',
      growthTrend: 'down'
    }
  ]);

  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetric[]>([
    {
      service: 'Mobile Data',
      subscribers: 980000,
      churnRate: 7.2,
      revenueImpact: 45000000,
      networkLoad: 85,
      customerSat: 83,
      issues: ['Network congestion in CBD', 'Slow speeds during peak hours']
    },
    {
      service: 'Fixed Broadband',
      subscribers: 340000,
      churnRate: 4.1,
      revenueImpact: 28000000,
      networkLoad: 72,
      customerSat: 88,
      issues: ['Installation delays', 'Rural coverage gaps']
    },
    {
      service: 'Business Internet',
      subscribers: 15700,
      churnRate: 2.8,
      revenueImpact: 18500000,
      networkLoad: 68,
      customerSat: 92,
      issues: ['SLA breach concerns', 'Backup circuit reliability']
    },
    {
      service: 'IoT Connectivity',
      subscribers: 125000,
      churnRate: 3.2,
      revenueImpact: 5200000,
      networkLoad: 45,
      customerSat: 87,
      issues: ['Device compatibility', 'Coverage in remote areas']
    }
  ]);

  const [browsingData, setBrowsingData] = useState<BrowsingData[]>([
    {
      region: 'Central Business District',
      totalGB: 125000,
      popularServices: ['Netflix', 'YouTube', 'Teams', 'WhatsApp'],
      peakHours: '9:00-11:00, 19:00-22:00',
      deviceTypes: [
        { type: 'Smartphone', percentage: 65 },
        { type: 'Laptop', percentage: 25 },
        { type: 'Tablet', percentage: 10 }
      ],
      qualityScore: 87
    },
    {
      region: 'Residential Suburbs',
      totalGB: 89000,
      popularServices: ['Netflix', 'Disney+', 'Spotify', 'Instagram'],
      peakHours: '19:00-23:00',
      deviceTypes: [
        { type: 'Smartphone', percentage: 72 },
        { type: 'Smart TV', percentage: 18 },
        { type: 'Laptop', percentage: 10 }
      ],
      qualityScore: 91
    },
    {
      region: 'Industrial Areas',
      totalGB: 45000,
      popularServices: ['Teams', 'Outlook', 'SAP', 'Zoom'],
      peakHours: '8:00-17:00',
      deviceTypes: [
        { type: 'Laptop', percentage: 55 },
        { type: 'Smartphone', percentage: 35 },
        { type: 'IoT Device', percentage: 10 }
      ],
      qualityScore: 94
    }
  ]);

  const [churnPredictions, setChurnPredictions] = useState([
    { segment: 'Youth Data Plans', riskScore: 84, predictedChurn: 156, revenue_at_risk: 390000 },
    { segment: 'Consumer Mobile', riskScore: 62, predictedChurn: 5100, revenue_at_risk: 229500 },
    { segment: 'Fixed Broadband', riskScore: 28, predictedChurn: 952, revenue_at_risk: 78540 },
    { segment: 'Premium Business', riskScore: 15, predictedChurn: 26, revenue_at_risk: 221000 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setCustomerSegments(prev => prev.map(segment => ({
        ...segment,
        churnRate: Math.max(0, segment.churnRate + (Math.random() - 0.5) * 0.1),
        satisfactionScore: Math.min(100, Math.max(0, segment.satisfactionScore + (Math.random() - 0.5) * 2)),
        networkUsage: Math.min(100, Math.max(0, segment.networkUsage + (Math.random() - 0.5) * 3))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-beam-blue/20 p-3 rounded-lg">
            <Users className="h-6 w-6 text-beam-blue" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Customer Analytics Intelligence</h2>
            <p className="text-gray-400">Real-time business dimension analysis with network correlation</p>
          </div>
        </div>

        <Tabs defaultValue="segments" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-beam-dark-accent/40 border border-gray-700/50 rounded-xl p-1">
            <TabsTrigger value="segments" className="rounded-lg data-[state=active]:bg-beam-blue data-[state=active]:text-white">
              Customer Segments
            </TabsTrigger>
            <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-beam-blue data-[state=active]:text-white">
              Service Analytics
            </TabsTrigger>
            <TabsTrigger value="browsing" className="rounded-lg data-[state=active]:bg-beam-blue data-[state=active]:text-white">
              Usage Patterns
            </TabsTrigger>
            <TabsTrigger value="churn" className="rounded-lg data-[state=active]:bg-beam-blue data-[state=active]:text-white">
              Churn Prediction
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segments">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerSegments.map((segment) => (
                <Card key={segment.id} className="bg-beam-dark-accent/50 border-gray-700/50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{segment.name}</h3>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(segment.growthTrend)}
                      <Badge className={getRiskColor(segment.riskLevel)}>{segment.riskLevel.toUpperCase()}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Subscribers</div>
                      <div className="text-xl font-bold text-white">{segment.size.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Avg Revenue</div>
                      <div className="text-xl font-bold text-white">${segment.avgRevenue}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Churn Rate</span>
                        <span className="text-white">{segment.churnRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={segment.churnRate} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Satisfaction Score</span>
                        <span className="text-white">{segment.satisfactionScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={segment.satisfactionScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Network Usage</span>
                        <span className="text-white">{segment.networkUsage}%</span>
                      </div>
                      <Progress value={segment.networkUsage} className="h-2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="space-y-4">
              {serviceMetrics.map((service, index) => (
                <Card key={index} className="bg-beam-dark-accent/50 border-gray-700/50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{service.service}</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Revenue Impact</div>
                        <div className="text-lg font-bold text-white">${(service.revenueImpact / 1000000).toFixed(1)}M</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Subscribers</div>
                      <div className="text-lg font-bold text-white">{service.subscribers.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Churn Rate</div>
                      <div className="text-lg font-bold text-white">{service.churnRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Network Load</div>
                      <div className="text-lg font-bold text-white">{service.networkLoad}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Customer Sat</div>
                      <div className="text-lg font-bold text-white">{service.customerSat}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Status</div>
                      <div className="flex items-center gap-1">
                        {service.churnRate < 5 ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        )}
                        <span className="text-sm text-white">
                          {service.churnRate < 5 ? 'Healthy' : 'At Risk'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Current Issues:</div>
                    <div className="flex flex-wrap gap-2">
                      {service.issues.map((issue, idx) => (
                        <Badge key={idx} variant="outline" className="bg-red-500/10 border-red-500/20 text-red-300">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="browsing">
            <div className="space-y-4">
              {browsingData.map((region, index) => (
                <Card key={index} className="bg-beam-dark-accent/50 border-gray-700/50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{region.region}</h3>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-beam-blue" />
                      <span className="text-white font-bold">{region.totalGB.toLocaleString()} GB</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Popular Services</div>
                      <div className="flex flex-wrap gap-1">
                        {region.popularServices.map((service, idx) => (
                          <Badge key={idx} variant="outline" className="bg-beam-blue/10 border-beam-blue/20 text-beam-blue">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Peak Hours</div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{region.peakHours}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Quality Score</div>
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-green-400" />
                        <span className="text-white font-bold">{region.qualityScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Device Distribution</div>
                    <div className="grid grid-cols-3 gap-2">
                      {region.deviceTypes.map((device, idx) => (
                        <div key={idx} className="bg-beam-dark-accent/50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white">{device.type}</span>
                            <span className="text-sm font-bold text-beam-blue">{device.percentage}%</span>
                          </div>
                          <Progress value={device.percentage} className="h-1 mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="churn">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {churnPredictions.map((prediction, index) => (
                  <Card key={index} className="bg-beam-dark-accent/50 border-gray-700/50 p-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">{prediction.segment}</div>
                      <div className="text-2xl font-bold text-white mb-2">{prediction.riskScore}%</div>
                      <Progress value={prediction.riskScore} className="h-2 mb-3" />
                      <div className="text-xs text-gray-400">Risk Score</div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="bg-beam-dark-accent/50 border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Churn Prediction Details</h3>
                <div className="space-y-4">
                  {churnPredictions.map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-beam-dark-accent/30 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{prediction.segment}</div>
                        <div className="text-sm text-gray-400">
                          {prediction.predictedChurn} customers at risk
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          ${prediction.revenue_at_risk.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Revenue at Risk</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};