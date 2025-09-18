import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  AlertTriangle, 
  Zap,
  Bot,
  Database,
  Shield,
  Brain,
  Settings,
  Wrench,
  Activity
} from 'lucide-react';

interface ProcurementAgentPaletteProps {
  onAddAgent: (agentType: string) => void;
  onAddUtility: (nodeType: string) => void;
}

const procurementAgents = [
  {
    id: 'supplier-research-specialist',
    name: 'Supplier Research Specialist',
    description: 'Researches and vets suppliers from network',
    icon: Search,
    category: 'Research',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-400/30'
  },
  {
    id: 'rfp-generation-specialist',
    name: 'RFP Generation Specialist',
    description: 'Creates detailed RFPs with technical specs',
    icon: FileText,
    category: 'Documentation',
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-400/30'
  },
  {
    id: 'contract-negotiation-specialist',
    name: 'Contract Negotiation Specialist',
    description: 'Negotiates terms and optimizes contracts',
    icon: MessageSquare,
    category: 'Negotiation',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-400/30'
  },
  {
    id: 'audit-monitoring-specialist',
    name: 'Audit & Monitoring Specialist',
    description: 'Audits invoices and tracks deliveries',
    icon: BarChart3,
    category: 'Monitoring',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-400/30'
  },
  {
    id: 'risk-contingency-specialist',
    name: 'Risk & Contingency Specialist',
    description: 'Monitors risks and manages backup sourcing',
    icon: AlertTriangle,
    category: 'Risk Management',
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-400/30'
  },
  {
    id: 'logistics-transition-specialist',
    name: 'Logistics & Transition Specialist',
    description: 'Manages delivery routing and transitions',
    icon: Zap,
    category: 'Operations',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-400/30'
  }
];

const orchestrationAgents = [
  {
    id: 'hydrogen-supply-orchestrator',
    name: 'Supply Chain Orchestrator',
    description: 'Central agent coordinating all procurement tasks',
    icon: Bot,
    category: 'Orchestration',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/20',
    borderColor: 'border-cyan-400/30'
  }
];

const utilityNodes = [
  {
    id: 'memory',
    name: 'Memory Core',
    description: 'Centralized knowledge storage',
    icon: Database,
    color: 'text-indigo-400'
  },
  {
    id: 'guardrail',
    name: 'Compliance Guard',
    description: 'Safety and compliance monitoring',
    icon: Shield,
    color: 'text-emerald-400'
  },
  {
    id: 'decision',
    name: 'Decision Node',
    description: 'Workflow decision point',
    icon: Brain,
    color: 'text-pink-400'
  }
];

export const ProcurementAgentPalette: React.FC<ProcurementAgentPaletteProps> = ({
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
          <Wrench className="h-5 w-5 text-blue-400" />
          Procurement Agents
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Hydrogen Supply Chain Specialists
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700/30 m-2">
            <TabsTrigger value="agents" className="text-xs">Agents</TabsTrigger>
            <TabsTrigger value="orchestration" className="text-xs">Control</TabsTrigger>
            <TabsTrigger value="utilities" className="text-xs">Utils</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-2 p-2 mt-0">
            <div className="text-xs font-medium text-slate-400 mb-2 px-2">SPECIALIST AGENTS</div>
            {procurementAgents.map((agent) => {
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
            onClick={() => onAddAgent('supplier-research-specialist')}
          >
            <Search className="h-3 w-3 mr-1" />
            Research
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
            onClick={() => onAddAgent('contract-negotiation-specialist')}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Negotiate
          </Button>
        </div>
      </div>
    </div>
  );
};