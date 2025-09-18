import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Globe, 
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Shield,
  Target
} from 'lucide-react';

const ProcurementAnalytics = () => {
  const [activeScenario, setActiveScenario] = useState('base');
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  const runScenarioAnalysis = (scenario: string) => {
    setActiveScenario(scenario);
    setIsRunningAnalysis(true);
    setTimeout(() => setIsRunningAnalysis(false), 3000);
  };

  const projectData = {
    name: "Hydrogen Production Facility - Germany",
    value: "€1.2B",
    timeline: "2024-2029",
    currentROI: "12.5%",
    currentNPV: "€285M",
    paybackPeriod: "8.2 years"
  };

  const scenarios = {
    base: {
      name: "Base Case",
      roi: "12.5%",
      npv: "€285M",
      payback: "8.2 years",
      confidence: 85,
      risks: ["Standard market conditions", "Planned timeline", "Current regulations"]
    },
    energyCrisis: {
      name: "Energy Crisis",
      roi: "9.8%",
      npv: "€180M",
      payback: "10.1 years",
      confidence: 72,
      risks: ["50% increase in energy costs", "Supply chain disruptions", "Extended timeline"]
    },
    policySupport: {
      name: "Enhanced Policy Support",
      roi: "15.2%",
      npv: "€385M",
      payback: "6.8 years",
      confidence: 78,
      risks: ["Government incentives", "Accelerated depreciation", "Green certificates"]
    },
    supplyDisruption: {
      name: "Supply Chain Disruption",
      roi: "8.9%",
      npv: "€145M",
      payback: "11.3 years",
      confidence: 65,
      risks: ["Equipment delays", "Material shortages", "Increased costs"]
    }
  };

  const marketIntelligence = [
    {
      source: "Natural Gas Futures",
      value: "€42.5/MWh",
      change: "+15.2%",
      trend: "up",
      impact: "High",
      lastUpdate: "2 min ago"
    },
    {
      source: "Hydrogen Demand Forecast",
      value: "+18% YoY",
      change: "+3.2%",
      trend: "up",
      impact: "High",
      lastUpdate: "5 min ago"
    },
    {
      source: "EUR/USD Exchange",
      value: "1.0845",
      change: "-0.8%",
      trend: "down",
      impact: "Medium",
      lastUpdate: "1 min ago"
    },
    {
      source: "Steel Industry Demand",
      value: "Stable",
      change: "+2.1%",
      trend: "up",
      impact: "Medium",
      lastUpdate: "15 min ago"
    }
  ];

  const riskAlerts = [
    {
      type: "Geopolitical",
      severity: "High",
      message: "Russia-Ukraine conflict affecting gas supplies - 25% price spike detected",
      time: "12 min ago",
      recommendation: "Consider alternative energy sources and fixed-price contracts"
    },
    {
      type: "Supply Chain",
      severity: "Medium",
      message: "Key electrolyzer supplier reports 6-month production delay",
      time: "2 hours ago",
      recommendation: "Evaluate alternative suppliers and negotiate penalty clauses"
    },
    {
      type: "Regulatory",
      severity: "Low",
      message: "EU Green Deal funding application deadline approaching",
      time: "1 day ago",
      recommendation: "Submit application for potential €50M subsidy"
    }
  ];

  const agentActivities = [
    {
      agent: "Strategic Finance Analyst",
      status: "Active",
      lastAction: "Updated ROI projections based on energy price changes",
      confidence: 92,
      recommendations: 3
    },
    {
      agent: "Market Intelligence Agent",
      status: "Active",
      lastAction: "Detected 15% spike in natural gas futures",
      confidence: 88,
      recommendations: 2
    },
    {
      agent: "Geopolitical Risk Agent",
      status: "Alert",
      lastAction: "Identified supply chain disruption risk",
      confidence: 85,
      recommendations: 4
    },
    {
      agent: "Project Timeline Agent",
      status: "Monitoring",
      lastAction: "Tracked equipment delivery schedules",
      confidence: 90,
      recommendations: 1
    }
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Agentic Financial Forecasting & Scenario Analysis
              </h1>
              <p className="text-gray-300">
                Real-time financial forecasting for Air Liquide's Large Industries division
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Activity className="w-4 h-4 mr-1" />
                Live Analysis
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                4 Agents Active
              </Badge>
            </div>
          </div>
          
          {/* Project Overview */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                {projectData.name}
              </CardTitle>
              <CardDescription className="text-gray-300">
                Capital Investment: {projectData.value} | Timeline: {projectData.timeline}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{projectData.currentROI}</div>
                  <div className="text-sm text-gray-400">Current ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{projectData.currentNPV}</div>
                  <div className="text-sm text-gray-400">Net Present Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{projectData.paybackPeriod}</div>
                  <div className="text-sm text-gray-400">Payback Period</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scenarios" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-1">
            <TabsTrigger value="scenarios" className="rounded-lg">
              Scenario Analysis
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="rounded-lg">
              Market Intelligence
            </TabsTrigger>
            <TabsTrigger value="risks" className="rounded-lg">
              Risk Monitoring
            </TabsTrigger>
            <TabsTrigger value="agents" className="rounded-lg">
              Agent Network
            </TabsTrigger>
          </TabsList>

          {/* Scenario Analysis Tab */}
          <TabsContent value="scenarios" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Scenario Selection */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                    Scenario Models
                  </CardTitle>
                  <CardDescription>
                    Select a scenario to analyze financial impact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(scenarios).map(([key, scenario]) => (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        activeScenario === key
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                      }`}
                      onClick={() => runScenarioAnalysis(key)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{scenario.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {scenario.confidence}% confidence
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">ROI:</span>
                          <span className="ml-1 text-white font-medium">{scenario.roi}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">NPV:</span>
                          <span className="ml-1 text-white font-medium">{scenario.npv}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Payback:</span>
                          <span className="ml-1 text-white font-medium">{scenario.payback}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Scenario Results */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-blue-400" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>
                    {scenarios[activeScenario as keyof typeof scenarios].name} Impact Assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isRunningAnalysis ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-orange-400">
                        <Activity className="w-4 h-4 animate-pulse" />
                        Running scenario analysis...
                      </div>
                      <Progress value={75} className="w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-700/50 rounded-lg">
                          <div className="text-lg font-bold text-green-400">
                            {scenarios[activeScenario as keyof typeof scenarios].roi}
                          </div>
                          <div className="text-sm text-gray-400">Return on Investment</div>
                        </div>
                        <div className="p-3 bg-gray-700/50 rounded-lg">
                          <div className="text-lg font-bold text-blue-400">
                            {scenarios[activeScenario as keyof typeof scenarios].npv}
                          </div>
                          <div className="text-sm text-gray-400">Net Present Value</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-semibold text-white">Key Risk Factors:</h5>
                        {scenarios[activeScenario as keyof typeof scenarios].risks.map((risk, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            {risk}
                          </div>
                        ))}
                      </div>

                      <Button 
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        onClick={() => runScenarioAnalysis(activeScenario)}
                      >
                        Generate Detailed Report
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Market Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {marketIntelligence.map((item, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{item.source}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${
                          item.impact === 'High' 
                            ? 'border-red-500/30 text-red-400' 
                            : 'border-yellow-500/30 text-yellow-400'
                        }`}
                      >
                        {item.impact} Impact
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-white">{item.value}</span>
                      <div className={`flex items-center gap-1 ${
                        item.trend === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {item.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-sm font-medium">{item.change}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">Updated {item.lastUpdate}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Risk Monitoring Tab */}
          <TabsContent value="risks" className="space-y-6">
            <div className="space-y-4">
              {riskAlerts.map((alert, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'High' ? 'text-red-400' : 
                          alert.severity === 'Medium' ? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">
                            {alert.type}
                          </Badge>
                          <div className="text-sm text-gray-400">{alert.time}</div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          alert.severity === 'High' 
                            ? 'border-red-500/30 text-red-400' 
                            : alert.severity === 'Medium'
                            ? 'border-yellow-500/30 text-yellow-400'
                            : 'border-blue-500/30 text-blue-400'
                        }`}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-white mb-3">{alert.message}</p>
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <div className="text-sm text-gray-300">
                        <strong className="text-orange-400">Recommendation:</strong> {alert.recommendation}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Agent Network Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {agentActivities.map((agent, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{agent.agent}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${
                          agent.status === 'Active' 
                            ? 'border-green-500/30 text-green-400' 
                            : agent.status === 'Alert'
                            ? 'border-red-500/30 text-red-400'
                            : 'border-blue-500/30 text-blue-400'
                        }`}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{agent.lastAction}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Confidence:</span>
                        <span className="text-sm font-medium text-white">{agent.confidence}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Recommendations:</span>
                        <Badge variant="outline" className="text-xs">
                          {agent.recommendations}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProcurementAnalytics;