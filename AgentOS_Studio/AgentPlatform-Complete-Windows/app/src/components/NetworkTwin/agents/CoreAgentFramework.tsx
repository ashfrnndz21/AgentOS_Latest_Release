import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Activity, Cpu, Network, TrendingUp, Users, Zap } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: 'ran' | 'core' | 'capacity' | 'service' | 'customer';
  status: 'active' | 'idle' | 'processing' | 'error';
  performance: number;
  lastAction: string;
  metrics: {
    requestsProcessed: number;
    averageResponseTime: number;
    successRate: number;
  };
}

interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'coordination' | 'data' | 'alert' | 'recommendation';
  content: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export const CoreAgentFramework: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'ran-001',
      name: 'RAN Intelligence Agent',
      type: 'ran',
      status: 'active',
      performance: 94,
      lastAction: 'Optimizing cell coverage in sector 7',
      metrics: { requestsProcessed: 2847, averageResponseTime: 120, successRate: 98.5 }
    },
    {
      id: 'core-001',
      name: 'Core Network Agent',
      type: 'core',
      status: 'processing',
      performance: 91,
      lastAction: 'Analyzing traffic routing patterns',
      metrics: { requestsProcessed: 1956, averageResponseTime: 95, successRate: 99.2 }
    },
    {
      id: 'capacity-001',
      name: 'Capacity Analyzer Agent',
      type: 'capacity',
      status: 'active',
      performance: 88,
      lastAction: 'Forecasting capacity needs for Q2',
      metrics: { requestsProcessed: 734, averageResponseTime: 280, successRate: 97.8 }
    },
    {
      id: 'service-001',
      name: 'Service Impact Agent',
      type: 'service',
      status: 'idle',
      performance: 96,
      lastAction: 'Completed SLA compliance check',
      metrics: { requestsProcessed: 445, averageResponseTime: 150, successRate: 99.7 }
    },
    {
      id: 'customer-001',
      name: 'Customer Analytics Agent',
      type: 'customer',
      status: 'active',
      performance: 89,
      lastAction: 'Processing churn prediction model',
      metrics: { requestsProcessed: 1233, averageResponseTime: 340, successRate: 94.2 }
    }
  ]);

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'msg-001',
      from: 'RAN Intelligence Agent',
      to: 'Capacity Analyzer Agent',
      type: 'data',
      content: 'Sharing updated cell utilization data for capacity planning',
      timestamp: new Date(Date.now() - 300000),
      priority: 'medium'
    },
    {
      id: 'msg-002',
      from: 'Service Impact Agent',
      to: 'Core Network Agent',
      type: 'alert',
      content: 'Potential service degradation detected in region North-East',
      timestamp: new Date(Date.now() - 180000),
      priority: 'high'
    },
    {
      id: 'msg-003',
      from: 'Customer Analytics Agent',
      to: 'RAN Intelligence Agent',
      type: 'recommendation',
      content: 'High-value customer experiencing poor signal quality in area ID: 4521',
      timestamp: new Date(Date.now() - 120000),
      priority: 'critical'
    }
  ]);

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'ran': return <Zap className="h-5 w-5" />;
      case 'core': return <Network className="h-5 w-5" />;
      case 'capacity': return <TrendingUp className="h-5 w-5" />;
      case 'service': return <Activity className="h-5 w-5" />;
      case 'customer': return <Users className="h-5 w-5" />;
      default: return <Cpu className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'idle': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        performance: Math.max(75, Math.min(100, agent.performance + (Math.random() - 0.5) * 4)),
        metrics: {
          ...agent.metrics,
          requestsProcessed: agent.metrics.requestsProcessed + Math.floor(Math.random() * 10),
          averageResponseTime: Math.max(50, agent.metrics.averageResponseTime + (Math.random() - 0.5) * 20)
        }
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAgentAction = (agentId: string, action: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, lastAction: action, status: 'processing' as const }
        : agent
    ));

    // Simulate processing time
    setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'active' as const }
          : agent
      ));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Orchestra Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Agent Orchestra Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div key={agent.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAgentIcon(agent.type)}
                      <span className="font-medium text-sm">{agent.name.split(' ')[0]}</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Performance</span>
                      <span>{agent.performance.toFixed(1)}%</span>
                    </div>
                    <Progress value={agent.performance} className="h-2" />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {agent.lastAction}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Requests</div>
                      <div className="font-medium">{agent.metrics.requestsProcessed.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Time</div>
                      <div className="font-medium">{agent.metrics.averageResponseTime}ms</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Performance</span>
                <span className="font-medium">92.4%</span>
              </div>
              <Progress value={92.4} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Agent Coordination</span>
                <span className="font-medium">98.1%</span>
              </div>
              <Progress value={98.1} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Data Processing</span>
                <span className="font-medium">95.7%</span>
              </div>
              <Progress value={95.7} className="h-2" />
            </div>

            <div className="pt-4 space-y-2">
              <div className="text-sm font-medium">Active Agents</div>
              <div className="text-2xl font-bold">{agents.filter(a => a.status === 'active').length}/{agents.length}</div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => handleAgentAction('system', 'Full system optimization')}
            >
              Optimize All Agents
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Inter-Agent Communication */}
      <Card>
        <CardHeader>
          <CardTitle>Inter-Agent Communication Stream</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`border-l-4 p-3 rounded ${getPriorityColor(message.priority)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {message.type}
                    </Badge>
                    <span className="text-sm font-medium">{message.from}</span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="text-sm">{message.to}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-gray-700">{message.content}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};