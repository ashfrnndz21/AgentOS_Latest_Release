import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Globe,
  Smartphone,
  MonitorSpeaker,
  Router,
  Signal,
  Users,
  Clock,
  BarChart3
} from 'lucide-react';

interface BusinessImpact {
  category: string;
  currentRevenue: number;
  projectedLoss: number;
  affectedCustomers: number;
  serviceLevel: number;
  networkCause: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  trendDirection: 'up' | 'down' | 'stable';
}

interface ServiceKPI {
  service: string;
  availability: number;
  performance: number;
  customerSat: number;
  revenueImpact: number;
  issueCount: number;
  slaCompliance: number;
  icon: React.ReactNode;
}

interface NetworkBusinessCorrelation {
  networkMetric: string;
  businessMetric: string;
  correlation: number;
  impact: string;
  recommendation: string;
  currentValue: number;
  targetValue: number;
}

export const ServiceImpactAgent: React.FC = () => {
  const [businessImpacts, setBusinessImpacts] = useState<BusinessImpact[]>([
    {
      category: 'Mobile Data Services',
      currentRevenue: 42500000,
      projectedLoss: 850000,
      affectedCustomers: 125000,
      serviceLevel: 87,
      networkCause: 'Peak hour congestion in urban areas',
      priority: 'critical',
      trendDirection: 'down'
    },
    {
      category: 'Enterprise Solutions',
      currentRevenue: 18750000,
      projectedLoss: 320000,
      affectedCustomers: 2400,
      serviceLevel: 94,
      networkCause: 'Fiber link redundancy issues',
      priority: 'high',
      trendDirection: 'stable'
    },
    {
      category: 'Fixed Broadband',
      currentRevenue: 28200000,
      projectedLoss: 180000,
      affectedCustomers: 8500,
      serviceLevel: 91,
      networkCause: 'DSL performance degradation',
      priority: 'medium',
      trendDirection: 'up'
    },
    {
      category: 'IoT & M2M',
      currentRevenue: 5200000,
      projectedLoss: 45000,
      affectedCustomers: 15000,
      serviceLevel: 96,
      networkCause: 'Coverage gaps in rural deployment',
      priority: 'low',
      trendDirection: 'up'
    }
  ]);

  const [serviceKPIs, setServiceKPIs] = useState<ServiceKPI[]>([
    {
      service: 'Mobile Network',
      availability: 99.2,
      performance: 87,
      customerSat: 83,
      revenueImpact: 42500000,
      issueCount: 12,
      slaCompliance: 94,
      icon: <Smartphone className="h-5 w-5 text-beam-blue" />
    },
    {
      service: 'Fixed Broadband',
      availability: 99.7,
      performance: 91,
      customerSat: 88,
      revenueImpact: 28200000,
      issueCount: 4,
      slaCompliance: 97,
      icon: <Router className="h-5 w-5 text-beam-blue" />
    },
    {
      service: 'Enterprise WAN',
      availability: 99.9,
      performance: 94,
      customerSat: 92,
      revenueImpact: 18750000,
      issueCount: 2,
      slaCompliance: 98,
      icon: <Globe className="h-5 w-5 text-beam-blue" />
    },
    {
      service: 'Data Center',
      availability: 99.95,
      performance: 96,
      customerSat: 94,
      revenueImpact: 12400000,
      issueCount: 1,
      slaCompliance: 99,
      icon: <MonitorSpeaker className="h-5 w-5 text-beam-blue" />
    }
  ]);

  const [correlations, setCorrelations] = useState<NetworkBusinessCorrelation[]>([
    {
      networkMetric: 'Peak Hour Latency',
      businessMetric: 'Customer Churn Rate',
      correlation: 0.78,
      impact: 'High latency increases churn by 2.3% per 10ms',
      recommendation: 'Implement traffic shaping during 7-10 PM',
      currentValue: 45,
      targetValue: 25
    },
    {
      networkMetric: 'Network Availability',
      businessMetric: 'Enterprise Revenue',
      correlation: 0.92,
      impact: '1% availability drop = $850K revenue loss',
      recommendation: 'Deploy redundant links in critical areas',
      currentValue: 99.2,
      targetValue: 99.8
    },
    {
      networkMetric: 'Download Speed',
      businessMetric: 'Customer Satisfaction',
      correlation: 0.84,
      impact: 'Speed degradation below 25Mbps affects satisfaction',
      recommendation: 'Upgrade capacity in congested cells',
      currentValue: 28.5,
      targetValue: 50.0
    },
    {
      networkMetric: 'Call Drop Rate',
      businessMetric: 'Premium Plan Retention',
      correlation: 0.71,
      impact: '>1% drop rate causes 15% premium churn',
      recommendation: 'Optimize handover parameters',
      currentValue: 1.8,
      targetValue: 0.5
    }
  ]);

  const [realTimeAlerts, setRealTimeAlerts] = useState([
    {
      id: 1,
      severity: 'critical',
      message: 'Enterprise SLA breach detected - CBD fiber link',
      revenue_impact: 125000,
      affected_customers: 340,
      timestamp: new Date()
    },
    {
      id: 2,
      severity: 'high',
      message: 'Mobile data speeds below 20Mbps in Zone 5',
      revenue_impact: 45000,
      affected_customers: 12500,
      timestamp: new Date()
    },
    {
      id: 3,
      severity: 'medium',
      message: 'Increased complaints about video streaming quality',
      revenue_impact: 18000,
      affected_customers: 5600,
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time KPI updates
      setServiceKPIs(prev => prev.map(kpi => ({
        ...kpi,
        availability: Math.max(95, Math.min(100, kpi.availability + (Math.random() - 0.5) * 0.2)),
        performance: Math.max(70, Math.min(100, kpi.performance + (Math.random() - 0.5) * 2)),
        customerSat: Math.max(70, Math.min(100, kpi.customerSat + (Math.random() - 0.5) * 1.5))
      })));

      // Update business impacts
      setBusinessImpacts(prev => prev.map(impact => ({
        ...impact,
        serviceLevel: Math.max(70, Math.min(100, impact.serviceLevel + (Math.random() - 0.5) * 2)),
        projectedLoss: Math.max(0, impact.projectedLoss + (Math.random() - 0.5) * 50000)
      })));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-500/10';
      case 'high': return 'border-l-orange-500 bg-orange-500/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/10';
      default: return 'border-l-green-500 bg-green-500/10';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <BarChart3 className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-ptt-red/20 p-3 rounded-lg">
            <DollarSign className="h-6 w-6 text-ptt-red" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Service Impact Analysis</h2>
            <p className="text-gray-400">Real-time business correlation with network performance</p>
          </div>
        </div>

        <Tabs defaultValue="impact" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-beam-dark-accent/40 border border-gray-700/50 rounded-xl p-1">
            <TabsTrigger value="impact" className="rounded-lg data-[state=active]:bg-beam-blue data-[state=active]:text-white">
              Business Impact
            </TabsTrigger>
            <TabsTrigger value="kpis" className="rounded-lg data-[state=active]:bg-beam-blue data-[state=active]:text-white">
              Service KPIs
            </TabsTrigger>
            <TabsTrigger value="correlation" className="rounded-lg data-[state=active]:bg-beam-blue data-[state=active]:text-white">
              Network-Business Link
            </TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-beam-blue data-[state=active]:text-white">
              Real-time Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="impact">
            <div className="space-y-4">
              {businessImpacts.map((impact, index) => (
                <Card key={index} className="bg-beam-dark-accent/50 border-gray-700/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{impact.category}</h3>
                      {getTrendIcon(impact.trendDirection)}
                    </div>
                    <Badge className={getPriorityColor(impact.priority)}>
                      {impact.priority.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Current Revenue</div>
                      <div className="text-lg font-bold text-white">
                        ${(impact.currentRevenue / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Projected Loss</div>
                      <div className="text-lg font-bold text-red-400">
                        ${(impact.projectedLoss / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Affected Customers</div>
                      <div className="text-lg font-bold text-white">
                        {impact.affectedCustomers.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Service Level</div>
                      <div className="text-lg font-bold text-white">{impact.serviceLevel}%</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Service Performance</span>
                      <span className="text-white">{impact.serviceLevel}%</span>
                    </div>
                    <Progress value={impact.serviceLevel} className="h-2" />
                  </div>

                  <div className="bg-beam-dark-accent/30 p-3 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Network Root Cause:</div>
                    <div className="text-white">{impact.networkCause}</div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="kpis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceKPIs.map((kpi, index) => (
                <Card key={index} className="bg-beam-dark-accent/50 border-gray-700/50 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-beam-blue/20 p-2 rounded-lg">
                      {kpi.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{kpi.service}</h3>
                      <div className="text-sm text-gray-400">
                        Revenue: ${(kpi.revenueImpact / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Availability</span>
                        <span className="text-white">{kpi.availability.toFixed(1)}%</span>
                      </div>
                      <Progress value={kpi.availability} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Performance</span>
                        <span className="text-white">{kpi.performance}%</span>
                      </div>
                      <Progress value={kpi.performance} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Customer Satisfaction</span>
                        <span className="text-white">{kpi.customerSat}%</span>
                      </div>
                      <Progress value={kpi.customerSat} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">SLA Compliance</span>
                        <span className="text-white">{kpi.slaCompliance}%</span>
                      </div>
                      <Progress value={kpi.slaCompliance} className="h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700/50">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{kpi.issueCount}</div>
                      <div className="text-xs text-gray-400">Active Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {kpi.issueCount <= 2 ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        )}
                        <span className="text-sm font-bold text-white">
                          {kpi.issueCount <= 2 ? 'Healthy' : 'Monitor'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">Status</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="correlation">
            <div className="space-y-4">
              {correlations.map((corr, index) => (
                <Card key={index} className="bg-beam-dark-accent/50 border-gray-700/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {corr.networkMetric} ↔ {corr.businessMetric}
                      </h3>
                      <div className="text-sm text-gray-400">
                        Correlation: {(corr.correlation * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {(corr.correlation * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-400">Correlation</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Progress value={corr.correlation * 100} className="h-3" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-beam-dark-accent/30 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">Current Value</div>
                      <div className="text-lg font-bold text-white">
                        {corr.currentValue}{corr.networkMetric.includes('Rate') ? '%' : 
                         corr.networkMetric.includes('Speed') ? ' Mbps' : 
                         corr.networkMetric.includes('Latency') ? 'ms' : 
                         corr.networkMetric.includes('Availability') ? '%' : ''}
                      </div>
                    </div>
                    <div className="bg-beam-dark-accent/30 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">Target Value</div>
                      <div className="text-lg font-bold text-green-400">
                        {corr.targetValue}{corr.networkMetric.includes('Rate') ? '%' : 
                         corr.networkMetric.includes('Speed') ? ' Mbps' : 
                         corr.networkMetric.includes('Latency') ? 'ms' : 
                         corr.networkMetric.includes('Availability') ? '%' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Business Impact:</div>
                      <div className="text-white">{corr.impact}</div>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Recommendation:</div>
                      <div className="text-white">{corr.recommendation}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-4">
              {realTimeAlerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)} border-gray-700/50 p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <div>
                        <div className="text-white font-medium">{alert.message}</div>
                        <div className="text-sm text-gray-400">
                          {alert.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-beam-dark-accent/30 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">Revenue Impact</div>
                      <div className="text-lg font-bold text-red-400">
                        ${alert.revenue_impact.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-beam-dark-accent/30 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">Affected Customers</div>
                      <div className="text-lg font-bold text-white">
                        {alert.affected_customers.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-300">
                      <Zap className="h-4 w-4 mr-1" />
                      Auto-Remediate
                    </Button>
                    <Button size="sm" variant="outline" className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-300">
                      <Users className="h-4 w-4 mr-1" />
                      Escalate to NOC
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};