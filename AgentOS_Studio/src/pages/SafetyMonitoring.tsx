import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Thermometer,
  Gauge,
  Zap,
  Wind,
  Eye,
  Bell,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  Wrench,
  BarChart3
} from 'lucide-react';

const SafetyMonitoring = () => {
  const [alertCount, setAlertCount] = useState(3);
  const [systemStatus, setSystemStatus] = useState('operational');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const facilityOverview = {
    name: "Air Liquide Hydrogen Production Facility",
    location: "Düsseldorf, Germany",
    capacity: "50 tons/day",
    operationalStatus: "Normal",
    safetyScore: 94,
    lastIncident: "127 days ago",
    activePersonnel: 45
  };

  const safetyMetrics = [
    {
      name: "Pressure Systems",
      value: "Normal",
      reading: "145 bar",
      threshold: "< 200 bar",
      status: "safe",
      trend: "stable",
      lastCheck: "2 min ago"
    },
    {
      name: "Temperature Control",
      value: "Optimal",
      reading: "85°C",
      threshold: "< 120°C",
      status: "safe",
      trend: "stable",
      lastCheck: "1 min ago"
    },
    {
      name: "Gas Leak Detection",
      value: "Clear",
      reading: "0.02 ppm",
      threshold: "< 0.1 ppm",
      status: "safe",
      trend: "stable",
      lastCheck: "30 sec ago"
    },
    {
      name: "Electrical Systems",
      value: "Warning",
      reading: "High Load",
      threshold: "< 85% capacity",
      status: "warning",
      trend: "increasing",
      lastCheck: "5 min ago"
    }
  ];

  const activeAlerts = [
    {
      id: "ALT-001",
      severity: "Medium",
      type: "Equipment",
      title: "Compressor C-101 Vibration Anomaly",
      description: "Unusual vibration patterns detected in main hydrogen compressor",
      location: "Production Unit A",
      timestamp: "15 min ago",
      assignedTo: "Maintenance Team Alpha",
      estimatedResolution: "2 hours",
      recommendation: "Schedule immediate inspection and potential bearing replacement"
    },
    {
      id: "ALT-002",
      severity: "Low",
      type: "Environmental",
      title: "Ambient Temperature Rising",
      description: "External temperature approaching summer operational limits",
      location: "Facility Perimeter",
      timestamp: "45 min ago",
      assignedTo: "Operations Team",
      estimatedResolution: "Monitoring",
      recommendation: "Activate additional cooling systems if temperature exceeds 35°C"
    },
    {
      id: "ALT-003",
      severity: "High",
      type: "Safety",
      title: "Emergency Shower Station Offline",
      description: "Safety shower in Section B-2 not responding to activation test",
      location: "Production Unit B",
      timestamp: "1 hour ago",
      assignedTo: "Safety Team",
      estimatedResolution: "30 min",
      recommendation: "Immediate repair required - restrict access to affected area"
    }
  ];

  const predictiveInsights = [
    {
      equipment: "Electrolyzer Stack #3",
      prediction: "Membrane replacement needed",
      confidence: 87,
      timeframe: "14-21 days",
      impact: "Medium",
      costSaving: "€45,000",
      description: "Performance degradation pattern indicates membrane wear"
    },
    {
      equipment: "Cooling System Pump P-205",
      prediction: "Bearing failure risk",
      confidence: 92,
      timeframe: "7-10 days",
      impact: "High",
      costSaving: "€120,000",
      description: "Vibration analysis shows bearing deterioration"
    },
    {
      equipment: "Safety Valve SV-301",
      prediction: "Calibration drift detected",
      confidence: 78,
      timeframe: "30-45 days",
      impact: "Low",
      costSaving: "€8,000",
      description: "Pressure response time increasing gradually"
    }
  ];

  const agentNetwork = [
    {
      name: "Safety Monitor Agent",
      status: "Active",
      lastAction: "Detected compressor vibration anomaly",
      alertsGenerated: 12,
      accuracy: 94,
      uptime: "99.8%"
    },
    {
      name: "Predictive Maintenance Agent",
      status: "Active",
      lastAction: "Predicted electrolyzer membrane replacement",
      alertsGenerated: 8,
      accuracy: 89,
      uptime: "99.9%"
    },
    {
      name: "Emergency Response Agent",
      status: "Standby",
      lastAction: "Updated evacuation procedures",
      alertsGenerated: 2,
      accuracy: 96,
      uptime: "100%"
    },
    {
      name: "Compliance Checker",
      status: "Active",
      lastAction: "Verified safety shower functionality",
      alertsGenerated: 5,
      accuracy: 91,
      uptime: "99.7%"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'border-red-500/30 text-red-400 bg-red-500/10';
      case 'Medium': return 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10';
      case 'Low': return 'border-blue-500/30 text-blue-400 bg-blue-500/10';
      default: return 'border-gray-500/30 text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Industrial Safety & Predictive Maintenance
              </h1>
              <p className="text-gray-300">
                Multi-modal safety monitoring with autonomous response for Air Liquide facilities
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Shield className="w-4 h-4 mr-1" />
                Safety Score: {facilityOverview.safetyScore}%
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Activity className="w-4 h-4 mr-1" />
                {alertCount} Active Alerts
              </Badge>
            </div>
          </div>
          
          {/* Facility Overview */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                {facilityOverview.name}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {facilityOverview.location} | Capacity: {facilityOverview.capacity}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{facilityOverview.operationalStatus}</div>
                  <div className="text-sm text-gray-400">Operational Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{facilityOverview.activePersonnel}</div>
                  <div className="text-sm text-gray-400">Active Personnel</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{facilityOverview.lastIncident}</div>
                  <div className="text-sm text-gray-400">Last Incident</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {lastUpdate.toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-gray-400">Last Update</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-1">
            <TabsTrigger value="monitoring" className="rounded-lg">
              Real-time Monitoring
            </TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg">
              Active Alerts
            </TabsTrigger>
            <TabsTrigger value="predictive" className="rounded-lg">
              Predictive Insights
            </TabsTrigger>
            <TabsTrigger value="agents" className="rounded-lg">
              Agent Network
            </TabsTrigger>
          </TabsList>

          {/* Real-time Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {safetyMetrics.map((metric, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        {metric.name === 'Pressure Systems' && <Gauge className="w-4 h-4" />}
                        {metric.name === 'Temperature Control' && <Thermometer className="w-4 h-4" />}
                        {metric.name === 'Gas Leak Detection' && <Wind className="w-4 h-4" />}
                        {metric.name === 'Electrical Systems' && <Zap className="w-4 h-4" />}
                        {metric.name}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`${
                          metric.status === 'safe' 
                            ? 'border-green-500/30 text-green-400' 
                            : metric.status === 'warning'
                            ? 'border-yellow-500/30 text-yellow-400'
                            : 'border-red-500/30 text-red-400'
                        }`}
                      >
                        {metric.value}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Current Reading:</span>
                        <span className={`font-medium ${getStatusColor(metric.status)}`}>
                          {metric.reading}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Threshold:</span>
                        <span className="text-white">{metric.threshold}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Trend:</span>
                        <span className="text-white capitalize">{metric.trend}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        Last checked: {metric.lastCheck}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Active Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <Card key={alert.id} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'High' ? 'text-red-400' : 
                          alert.severity === 'Medium' ? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                        <div>
                          <h4 className="font-semibold text-white">{alert.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {alert.id}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {alert.type}
                            </Badge>
                            <span className="text-xs text-gray-400">{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-300 mb-3">{alert.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-gray-400 text-sm">Location:</span>
                        <span className="ml-2 text-white">{alert.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Assigned to:</span>
                        <span className="ml-2 text-white">{alert.assignedTo}</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-700/50 rounded-lg mb-3">
                      <div className="text-sm text-gray-300">
                        <strong className="text-orange-400">Recommendation:</strong> {alert.recommendation}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Est. Resolution: {alert.estimatedResolution}
                      </span>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Predictive Insights Tab */}
          <TabsContent value="predictive" className="space-y-6">
            <div className="space-y-4">
              {predictiveInsights.map((insight, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-orange-400" />
                          {insight.equipment}
                        </h4>
                        <p className="text-gray-300 mt-1">{insight.prediction}</p>
                      </div>
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-gray-400 text-sm">Timeframe:</span>
                        <div className="text-white font-medium">{insight.timeframe}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Impact:</span>
                        <div className={`font-medium ${
                          insight.impact === 'High' ? 'text-red-400' :
                          insight.impact === 'Medium' ? 'text-yellow-400' : 'text-blue-400'
                        }`}>
                          {insight.impact}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Cost Saving:</span>
                        <div className="text-green-400 font-medium">{insight.costSaving}</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                    
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Schedule Maintenance
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Agent Network Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {agentNetwork.map((agent, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{agent.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${
                          agent.status === 'Active' 
                            ? 'border-green-500/30 text-green-400' 
                            : 'border-blue-500/30 text-blue-400'
                        }`}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{agent.lastAction}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 text-xs">Alerts Generated:</span>
                        <div className="text-white font-medium">{agent.alertsGenerated}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Accuracy:</span>
                        <div className="text-green-400 font-medium">{agent.accuracy}%</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Uptime:</span>
                        <div className="text-blue-400 font-medium">{agent.uptime}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Status:</span>
                        <div className="text-white font-medium">{agent.status}</div>
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

export default SafetyMonitoring;