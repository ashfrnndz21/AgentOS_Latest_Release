import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  AlertTriangle, 
  Brain,
  Activity,
  Zap,
  Bot,
  Database,
  Shield,
  LineChart,
  PieChart,
  Settings,
  Wrench,
  Calculator,
  Globe
} from 'lucide-react';

interface ForecastingAgentPaletteProps {
  onAddAgent: (agentType: string) => void;
  onAddUtility: (nodeType: string) => void;
}

const forecastingAgents = [
  {
    id: 'demand-forecasting-specialist',
    name: 'Demand Forecasting Specialist',
    description: 'Predicts future demand using ML models and market data',
    icon: TrendingUp,
    category: 'Forecasting',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-400/30'
  },
  {
    id: 'market-analysis-specialist',
    name: 'Market Analysis Specialist',
    description: 'Analyzes market trends and competitive landscape',
    icon: BarChart3,
    category: 'Analysis',
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-400/30'
  },
  {
    id: 'scenario-modeling-specialist',
    name: 'Scenario Modeling Specialist',
    description: 'Creates and evaluates multiple business scenarios',
    icon: Target,
    category: 'Modeling',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-400/30'
  },
  {
    id: 'risk-assessment-specialist',
    name: 'Risk Assessment Specialist',
    description: 'Identifies and quantifies business risks',
    icon: AlertTriangle,
    category: 'Risk Analysis',
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-400/30'
  },
  {
    id: 'optimization-specialist',
    name: 'Optimization Specialist',
    description: 'Optimizes resource allocation and strategies',
    icon: Zap,
    category: 'Optimization',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-400/30'
  },
  {
    id: 'sensitivity-analysis-specialist',
    name: 'Sensitivity Analysis Specialist',
    description: 'Analyzes parameter sensitivity and impact',
    icon: Activity,
    category: 'Sensitivity',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-400/30'
  }
];

const orchestrationAgents = [
  {
    id: 'forecasting-orchestrator',
    name: 'Forecasting Orchestrator',
    description: 'Central agent coordinating all forecasting and analysis tasks',
    icon: Bot,
    category: 'Orchestration',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/20',
    borderColor: 'border-cyan-400/30'
  }
];

const analyticsNodes = [
  {
    id: 'data-processor',
    name: 'Data Processor',
    description: 'Processes and cleans forecasting data',
    icon: Calculator,
    category: 'Processing',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-900/20',
    borderColor: 'border-indigo-400/30'
  },
  {
    id: 'visualization-engine',
    name: 'Visualization Engine',
    description: 'Creates charts and visual forecasting reports',
    icon: PieChart,
    category: 'Visualization',
    color: 'text-pink-400',
    bgColor: 'bg-pink-900/20',
    borderColor: 'border-pink-400/30'
  },
  {
    id: 'external-data-connector',
    name: 'External Data Connector',
    description: 'Connects to external market data sources',
    icon: Globe,
    category: 'Integration',
    color: 'text-teal-400',
    bgColor: 'bg-teal-900/20',
    borderColor: 'border-teal-400/30'
  }
];

const utilityNodes = [
  {
    id: 'memory',
    name: 'Forecasting Memory',
    description: 'Historical data and model storage',
    icon: Database,
    color: 'text-indigo-400'
  },
  {
    id: 'guardrail',
    name: 'Model Validation Guard',
    description: 'Ensures forecast accuracy and reliability',
    icon: Shield,
    color: 'text-emerald-400'
  },
  {
    id: 'decision',
    name: 'Decision Node',
    description: 'Workflow decision and routing point',
    icon: Brain,
    color: 'text-pink-400'
  }
];

export const ForecastingAgentPalette: React.FC<ForecastingAgentPaletteProps> = ({
  onAddAgent,
  onAddUtility
}) => {
  const [activeTab, setActiveTab] = useState('agents');

  const handleDragStart = (event: React.DragEvent, agentId: string, type: 'agent' | 'utility') => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: type,
      agentType: agentId
    }));
  };

  return (
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-r border-blue-400/20 flex flex-col text-white overflow-hidden">
      <div className="p-4 border-b border-blue-400/20">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <LineChart className="h-5 w-5 text-blue-400" />
          Forecasting Agents
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Scenario Analysis & Prediction Specialists
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700/30 m-2">
            <TabsTrigger value="agents" className="text-xs">Agents</TabsTrigger>
            <TabsTrigger value="orchestration" className="text-xs">Control</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
            <TabsTrigger value="utilities" className="text-xs">Utils</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-2 p-2 mt-0">
            <div className="text-xs font-medium text-slate-400 mb-2 px-2">FORECASTING SPECIALISTS</div>
            {forecastingAgents.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <Card
                  key={agent.id}
                  className={`${agent.bgColor} ${agent.borderColor} border cursor-pointer hover:bg-opacity-80 transition-all duration-200 hover:scale-105`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, agent.id, 'agent')}
                  onClick={() => onAddAgent(agent.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-slate-700/30`}>
                        <IconComponent className={`h-4 w-4 ${agent.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white leading-tight">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-tight">
                          {agent.description}
                        </p>
                        <Badge variant="outline" className={`mt-2 text-xs ${agent.color} ${agent.borderColor}`}>
                          {agent.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="orchestration" className="space-y-2 p-2 mt-0">
            <div className="text-xs font-medium text-slate-400 mb-2 px-2">ORCHESTRATION</div>
            {orchestrationAgents.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <Card
                  key={agent.id}
                  className={`${agent.bgColor} ${agent.borderColor} border cursor-pointer hover:bg-opacity-80 transition-all duration-200 hover:scale-105`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, agent.id, 'agent')}
                  onClick={() => onAddAgent(agent.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-slate-700/30`}>
                        <IconComponent className={`h-4 w-4 ${agent.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white leading-tight">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-tight">
                          {agent.description}
                        </p>
                        <Badge variant="outline" className={`mt-2 text-xs ${agent.color} ${agent.borderColor}`}>
                          {agent.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-2 p-2 mt-0">
            <div className="text-xs font-medium text-slate-400 mb-2 px-2">ANALYTICS ENGINES</div>
            {analyticsNodes.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <Card
                  key={agent.id}
                  className={`${agent.bgColor} ${agent.borderColor} border cursor-pointer hover:bg-opacity-80 transition-all duration-200 hover:scale-105`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, agent.id, 'agent')}
                  onClick={() => onAddAgent(agent.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-slate-700/30`}>
                        <IconComponent className={`h-4 w-4 ${agent.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white leading-tight">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-tight">
                          {agent.description}
                        </p>
                        <Badge variant="outline" className={`mt-2 text-xs ${agent.color} ${agent.borderColor}`}>
                          {agent.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="utilities" className="space-y-2 p-2 mt-0">
            <div className="text-xs font-medium text-slate-400 mb-2 px-2">INFRASTRUCTURE</div>
            {utilityNodes.map((utility) => {
              const IconComponent = utility.icon;
              return (
                <Card
                  key={utility.id}
                  className="bg-slate-700/20 border-slate-600/30 border cursor-pointer hover:bg-slate-700/30 transition-all duration-200 hover:scale-105"
                  draggable
                  onDragStart={(e) => handleDragStart(e, utility.id, 'utility')}
                  onClick={() => onAddUtility(utility.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-700/30">
                        <IconComponent className={`h-4 w-4 ${utility.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white leading-tight">
                          {utility.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-tight">
                          {utility.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t border-blue-400/20">
        <div className="text-xs text-slate-400 mb-2">QUICK ACTIONS</div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
            onClick={() => onAddAgent('demand-forecasting-specialist')}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Forecast
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
            onClick={() => onAddAgent('scenario-modeling-specialist')}
          >
            <Target className="h-3 w-3 mr-1" />
            Scenario
          </Button>
        </div>
      </div>
    </div>
  );
};