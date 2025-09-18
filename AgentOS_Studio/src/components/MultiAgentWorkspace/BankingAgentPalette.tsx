import React, { useState } from 'react';
import { Bot, Shield, Database, GitBranch, FileCheck, AlertTriangle, Gavel, Search, CreditCard, TrendingUp, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface BankingAgentPaletteProps {
  onAddAgent: (agentType: string) => void;
  onAddUtility: (nodeType: string) => void;
}

export const BankingAgentPalette: React.FC<BankingAgentPaletteProps> = ({ onAddAgent, onAddUtility }) => {
  const [collapsed, setCollapsed] = useState(false);

  const bankingAgents = [
    { 
      name: 'KYC Agent', 
      icon: FileCheck, 
      description: 'Customer identity verification and due diligence',
      compliance: ['KYC', 'AML'],
      tools: ['Document Scanner', 'Identity Verification']
    },
    { 
      name: 'AML Agent', 
      icon: Shield, 
      description: 'Anti-money laundering monitoring and reporting',
      compliance: ['AML', 'BSA'],
      tools: ['Transaction Monitor', 'SAR Generator']
    },
    { 
      name: 'Credit Underwriting Agent', 
      icon: CreditCard, 
      description: 'Automated credit assessment and risk scoring',
      compliance: ['FCRA', 'ECOA'],
      tools: ['Credit Scorer', 'Risk Calculator']
    },
    { 
      name: 'Fraud Detection Agent', 
      icon: AlertTriangle, 
      description: 'Real-time fraud pattern detection and prevention',
      compliance: ['PCI DSS', 'SOX'],
      tools: ['Pattern Analyzer', 'Real-time Monitor']
    },
    { 
      name: 'Regulatory Reporting Agent', 
      icon: Gavel, 
      description: 'Automated regulatory filings and compliance reports',
      compliance: ['CCAR', 'Dodd-Frank'],
      tools: ['Report Generator', 'Data Aggregator']
    },
    { 
      name: 'Customer Service Agent', 
      icon: Users, 
      description: 'Intelligent customer support and query resolution',
      compliance: ['TCPA', 'CFPB'],
      tools: ['NLP Engine', 'Sentiment Analysis']
    },
  ];

  const bankingUtilities = [
    { 
      name: 'compliance', 
      icon: Gavel, 
      description: 'Regulatory compliance checkpoint',
      features: ['Real-time monitoring', 'Audit trails']
    },
    { 
      name: 'risk', 
      icon: TrendingUp, 
      description: 'Risk assessment and scoring',
      features: ['Risk calculations', 'Threshold alerts']
    },
    { 
      name: 'audit', 
      icon: Search, 
      description: 'Audit trail and logging',
      features: ['Transaction logs', 'Compliance reporting']
    },
    { 
      name: 'decision', 
      icon: GitBranch, 
      description: 'Decision point in workflow',
      features: ['Conditional routing', 'Business rules']
    },
    { 
      name: 'memory', 
      icon: Database, 
      description: 'Secure data storage',
      features: ['Encrypted storage', 'Data retention policies']
    },
    { 
      name: 'guardrail', 
      icon: Lock, 
      description: 'Safety and compliance checks',
      features: ['Content filtering', 'Bias detection']
    },
  ];

  if (collapsed) {
    return (
      <div className="w-12 bg-beam-dark-accent border-r border-gray-700 p-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCollapsed(false)}
          className="w-full p-2 text-gray-400 hover:text-white"
        >
          <Bot className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-96 bg-beam-dark-accent border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Banking Agent Palette</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCollapsed(true)}
            className="text-gray-400 hover:text-white"
          >
            ←
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-1">Compliance-ready banking AI agents</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-beam-dark">
            <TabsTrigger value="agents" className="text-gray-300 data-[state=active]:text-white">
              Banking Agents
            </TabsTrigger>
            <TabsTrigger value="utilities" className="text-gray-300 data-[state=active]:text-white">
              Utilities
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="space-y-3 mt-4">
            {bankingAgents.map((agent) => (
              <Card 
                key={agent.name}
                className="p-4 bg-beam-dark border-gray-700 hover:border-beam-blue cursor-pointer transition-colors"
                onClick={() => onAddAgent(agent.name)}
              >
                <div className="flex items-start gap-3">
                  <agent.icon className="h-6 w-6 text-beam-blue mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white">{agent.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 mb-2">{agent.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {agent.compliance.map((comp) => (
                          <Badge key={comp} variant="secondary" className="text-xs bg-amber-900/30 text-amber-300 border-amber-600">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {agent.tools.slice(0, 2).map((tool) => (
                          <Badge key={tool} variant="outline" className="text-xs text-gray-400 border-gray-600">
                            {tool}
                          </Badge>
                        ))}
                        {agent.tools.length > 2 && (
                          <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                            +{agent.tools.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="utilities" className="space-y-3 mt-4">
            {bankingUtilities.map((node) => (
              <Card 
                key={node.name}
                className="p-3 bg-beam-dark border-gray-700 hover:border-beam-blue cursor-pointer transition-colors"
                onClick={() => onAddUtility(node.name)}
              >
                <div className="flex items-start gap-3">
                  <node.icon className="h-6 w-6 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white capitalize">{node.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 mb-2">{node.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {node.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs text-gray-400 border-gray-600">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};