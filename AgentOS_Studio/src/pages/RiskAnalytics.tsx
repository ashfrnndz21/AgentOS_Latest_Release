import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  BarChart3, 
  Activity,
  DollarSign,
  Users,
  Target,
  Zap,
  Brain
} from 'lucide-react';

export default function RiskAnalytics() {
  const riskMetrics = [
    { label: 'Portfolio Risk Score', value: '7.2/10', trend: 'up', color: 'text-red-500' },
    { label: 'Credit Risk Exposure', value: '$2.4M', trend: 'down', color: 'text-green-500' },
    { label: 'Market Volatility', value: '15.3%', trend: 'up', color: 'text-yellow-500' },
    { label: 'Compliance Score', value: '94%', trend: 'stable', color: 'text-blue-500' }
  ];

  const riskAgents = [
    {
      name: 'Credit Risk Analyzer',
      status: 'active',
      description: 'AI agent analyzing credit portfolios and default probabilities',
      metrics: { accuracy: '94%', processed: '1,247', alerts: 23 }
    },
    {
      name: 'Market Risk Monitor',
      status: 'active', 
      description: 'Real-time market risk assessment and volatility tracking',
      metrics: { accuracy: '91%', processed: '856', alerts: 12 }
    },
    {
      name: 'Operational Risk Guard',
      status: 'active',
      description: 'Operational risk detection and process compliance monitoring',
      metrics: { accuracy: '97%', processed: '2,134', alerts: 8 }
    },
    {
      name: 'Regulatory Compliance Bot',
      status: 'active',
      description: 'Automated regulatory compliance checking and reporting',
      metrics: { accuracy: '99%', processed: '567', alerts: 3 }
    }
  ];

  const recentAlerts = [
    { type: 'High', message: 'Credit concentration risk detected in Tech sector', time: '2 min ago' },
    { type: 'Medium', message: 'Market volatility spike in emerging markets', time: '15 min ago' },
    { type: 'Low', message: 'Compliance review required for new regulations', time: '1 hour ago' },
    { type: 'Medium', message: 'Operational risk threshold exceeded in trading', time: '2 hours ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-red-500" />
            Risk Analytics
          </h1>
          <p className="text-gray-400 mt-2">
            AI-powered risk assessment and monitoring across all business units
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-white border-gray-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Risk Dashboard
          </Button>
        </div>
      </div>

      {/* Risk Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {riskMetrics.map((metric, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{metric.label}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-6 h-6 text-red-500" />
                  ) : metric.trend === 'down' ? (
                    <TrendingUp className="w-6 h-6 text-green-500 rotate-180" />
                  ) : (
                    <Activity className="w-6 h-6 text-blue-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Risk Agents */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-red-500" />
              Active Risk Agents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskAgents.map((agent, index) => (
              <div key={index} className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    {agent.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-300 mb-3">{agent.description}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-400">
                    Accuracy: {agent.metrics.accuracy}
                  </span>
                  <span className="text-blue-400">
                    Processed: {agent.metrics.processed}
                  </span>
                  <span className="text-yellow-400">
                    Alerts: {agent.metrics.alerts}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Risk Alerts */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Recent Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <Badge 
                    variant="secondary" 
                    className={
                      alert.type === 'High' ? 'bg-red-600 text-white' :
                      alert.type === 'Medium' ? 'bg-yellow-600 text-white' :
                      'bg-blue-600 text-white'
                    }
                  >
                    {alert.type}
                  </Badge>
                  <span className="text-xs text-gray-400">{alert.time}</span>
                </div>
                <p className="text-sm text-gray-300">{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis Tools */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Risk Analysis Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg text-center">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Credit Risk Models</h3>
              <p className="text-sm text-gray-300">Advanced ML models for credit assessment</p>
              <Button variant="outline" size="sm" className="mt-3 text-white border-gray-600">
                Configure
              </Button>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg text-center">
              <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Market Risk Analytics</h3>
              <p className="text-sm text-gray-300">Real-time market risk monitoring</p>
              <Button variant="outline" size="sm" className="mt-3 text-white border-gray-600">
                Configure
              </Button>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg text-center">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Operational Risk</h3>
              <p className="text-sm text-gray-300">Process and operational risk detection</p>
              <Button variant="outline" size="sm" className="mt-3 text-white border-gray-600">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}