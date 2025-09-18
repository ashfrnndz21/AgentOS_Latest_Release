
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleArrowRight, Network, ChartLine, Layers3, Database, Cpu, ServerCog } from 'lucide-react';
import { CoreAgentFramework } from './agents/CoreAgentFramework';
import { RANIntelligenceAgent } from './agents/RANIntelligenceAgent';
import { CustomerAnalyticsAgent } from './agents/CustomerAnalyticsAgent';
import { ServiceImpactAgent } from './agents/ServiceImpactAgent';

interface NetworkAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'disabled';
  icon: React.ReactNode;
  description: string;
  capabilities: string[];
}

interface NetworkAgentsProps {
  onAgentClick?: (agentId: string) => void;
}

export const NetworkAgents: React.FC<NetworkAgentsProps> = ({ onAgentClick }) => {
  const [agents, setAgents] = useState<NetworkAgent[]>([
    {
      id: 'agent-1',
      name: 'Topology Agent',
      type: 'core',
      status: 'active',
      icon: <Network className="h-5 w-5 text-ptt-blue" />,
      description: 'Analyzes network structure and connectivity patterns',
      capabilities: ['Path analysis', 'Redundancy verification', 'Topology mapping']
    },
    {
      id: 'agent-2',
      name: 'Traffic Forecasting Agent',
      type: 'analytics',
      status: 'active',
      icon: <ChartLine className="h-5 w-5 text-ptt-blue" />,
      description: 'Predicts future traffic patterns based on historical data',
      capabilities: ['Growth analysis', 'Anomaly detection', 'Seasonal forecasting']
    },
    {
      id: 'agent-3',
      name: 'Capacity Planning Agent',
      type: 'planning',
      status: 'active',
      icon: <Layers3 className="h-5 w-5 text-ptt-blue" />,
      description: 'Plans network capacity based on forecasted demand',
      capabilities: ['Bottleneck identification', 'Upgrade recommendations', 'Cost optimization']
    },
    {
      id: 'agent-4',
      name: 'Customer Experience Agent',
      type: 'analytics',
      status: 'idle',
      icon: <Database className="h-5 w-5 text-ptt-blue" />,
      description: 'Correlates network metrics with customer experience',
      capabilities: ['Churn prediction', 'Service quality mapping', 'Experience scoring']
    },
    {
      id: 'agent-5',
      name: 'Network Optimization Agent',
      type: 'optimization',
      status: 'idle',
      icon: <Cpu className="h-5 w-5 text-ptt-blue" />,
      description: 'Optimizes network configuration for performance',
      capabilities: ['Traffic balancing', 'Resource allocation', 'Energy efficiency']
    },
    {
      id: 'agent-6',
      name: 'Failure Scenario Agent',
      type: 'resilience',
      status: 'disabled',
      icon: <ServerCog className="h-5 w-5 text-ptt-blue" />,
      description: 'Simulates network failures and recovery scenarios',
      capabilities: ['Fault simulation', 'Recovery time prediction', 'Resilience scoring']
    }
  ]);

  const activateAgent = (agentId: string) => {
    setAgents(
      agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'active' as const } 
          : agent
      )
    );
  };

  const deactivateAgent = (agentId: string) => {
    setAgents(
      agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: 'idle' as const } 
          : agent
      )
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="orchestra" className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6 bg-beam-dark-accent/40 border border-gray-700/50 rounded-xl p-1 gap-1">
          <TabsTrigger 
            value="orchestra" 
            className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white"
          >
            Agent Orchestra
          </TabsTrigger>
          <TabsTrigger 
            value="ran" 
            className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white"
          >
            RAN Intelligence
          </TabsTrigger>
          <TabsTrigger 
            value="customer" 
            className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white"
          >
            Customer Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="service" 
            className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white"
          >
            Service Impact
          </TabsTrigger>
          <TabsTrigger 
            value="core" 
            className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white"
          >
            Core Network
          </TabsTrigger>
          <TabsTrigger 
            value="capacity" 
            className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white"
          >
            Capacity Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="fleet" 
            className="rounded-lg flex items-center gap-2 data-[state=active]:bg-beam-blue data-[state=active]:text-white"
          >
            Agent Fleet
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orchestra" className="mt-0">
          <CoreAgentFramework />
        </TabsContent>
        
        <TabsContent value="ran" className="mt-0">
          <RANIntelligenceAgent />
        </TabsContent>
        
        <TabsContent value="customer" className="mt-0">
          <CustomerAnalyticsAgent />
        </TabsContent>
        
        <TabsContent value="service" className="mt-0">
          <ServiceImpactAgent />
        </TabsContent>
        
        <TabsContent value="core" className="mt-0">
          <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-12 text-center">
            <Network className="h-16 w-16 mx-auto mb-4 text-beam-blue" />
            <h3 className="text-xl font-semibold text-white mb-2">Core Network Agent</h3>
            <p className="text-gray-400">Advanced core network management coming soon...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="capacity" className="mt-0">
          <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-12 text-center">
            <ChartLine className="h-16 w-16 mx-auto mb-4 text-beam-blue" />
            <h3 className="text-xl font-semibold text-white mb-2">Capacity Performance Analyzer</h3>
            <p className="text-gray-400">ML-driven capacity analysis coming soon...</p>
          </div>
        </TabsContent>
        
        <TabsContent value="fleet" className="mt-0">
          <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-white">Network Agent Fleet</h2>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                    {agents.filter(a => a.status === 'active').length} Active
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3 py-1">
                    {agents.filter(a => a.status === 'idle').length} Idle
                  </Badge>
                  <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/30 px-3 py-1">
                    {agents.filter(a => a.status === 'disabled').length} Disabled
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <Card key={agent.id} className="bg-beam-dark-accent/50 border-gray-700/50 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-beam-dark-accent/70 p-2 rounded-lg">
                          {agent.icon}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{agent.name}</h3>
                          <div className="text-xs text-gray-400">{agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent</div>
                        </div>
                        <div className="ml-auto">
                          <div className={`h-2.5 w-2.5 rounded-full ${
                            agent.status === 'active' ? 'bg-green-500 animate-pulse' : 
                            agent.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">{agent.description}</p>
                      
                      <div className="mb-3">
                        <div className="text-xs text-gray-400 mb-1">Capabilities:</div>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.map((capability, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-ptt-red/10 border-ptt-red/20 text-gray-300">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-3">
                        {agent.status !== 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-300"
                            onClick={() => activateAgent(agent.id)}
                          >
                            Activate
                          </Button>
                        )}
                        {agent.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-300"
                            onClick={() => deactivateAgent(agent.id)}
                          >
                            Deactivate
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-ptt-red/10 hover:bg-ptt-red/20 border-ptt-red/30 text-white"
                        >
                          <CircleArrowRight className="h-4 w-4 mr-1" /> Deploy
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
