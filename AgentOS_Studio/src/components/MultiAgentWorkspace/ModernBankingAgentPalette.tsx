import React, { useState } from 'react';
import { Bot, Shield, Database, GitBranch, FileCheck, AlertTriangle, Gavel, Search, CreditCard, TrendingUp, Users, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ModernBankingAgentPaletteProps {
  onAddAgent: (agentType: string) => void;
  onAddUtility: (nodeType: string) => void;
}

export const ModernBankingAgentPalette: React.FC<ModernBankingAgentPaletteProps> = ({ onAddAgent, onAddUtility }) => {
  const [collapsed, setCollapsed] = useState(false);

  const bankingAgents = [
    { 
      name: 'KYC Agent', 
      icon: '🔍', 
      color: 'from-blue-400 to-blue-600',
      description: 'Customer identity verification',
      compliance: ['KYC', 'AML'],
      tools: ['Document Scanner', 'ID Verification']
    },
    { 
      name: 'AML Agent', 
      icon: '🛡️', 
      color: 'from-green-400 to-green-600',
      description: 'Anti-money laundering monitoring',
      compliance: ['AML', 'BSA'],
      tools: ['Transaction Monitor', 'SAR Generator']
    },
    { 
      name: 'Credit Underwriting Agent', 
      icon: '💳', 
      color: 'from-purple-400 to-purple-600',
      description: 'Automated credit assessment',
      compliance: ['FCRA', 'ECOA'],
      tools: ['Credit Scorer', 'Risk Calculator']
    },
    { 
      name: 'Fraud Detection Agent', 
      icon: '⚠️', 
      color: 'from-red-400 to-red-600',
      description: 'Real-time fraud detection',
      compliance: ['PCI DSS', 'SOX'],
      tools: ['Pattern Analyzer', 'Real-time Monitor']
    },
    { 
      name: 'Regulatory Reporting Agent', 
      icon: '📋', 
      color: 'from-yellow-400 to-yellow-600',
      description: 'Automated regulatory filings',
      compliance: ['CCAR', 'Dodd-Frank'],
      tools: ['Report Generator', 'Data Aggregator']
    },
    { 
      name: 'Customer Service Agent', 
      icon: '💬', 
      color: 'from-pink-400 to-pink-600',
      description: 'Intelligent customer support',
      compliance: ['TCPA', 'CFPB'],
      tools: ['NLP Engine', 'Sentiment Analysis']
    },
  ];

  const bankingUtilities = [
    { 
      name: 'compliance', 
      icon: '⚖️', 
      color: 'from-amber-400 to-orange-500',
      description: 'Regulatory compliance checkpoint',
      features: ['Real-time monitoring', 'Audit trails']
    },
    { 
      name: 'risk', 
      icon: '📊', 
      color: 'from-blue-400 to-indigo-500',
      description: 'Risk assessment and scoring',
      features: ['Risk calculations', 'Threshold alerts']
    },
    { 
      name: 'audit', 
      icon: '🔍', 
      color: 'from-purple-400 to-violet-500',
      description: 'Audit trail and logging',
      features: ['Transaction logs', 'Compliance reporting']
    },
    { 
      name: 'decision', 
      icon: '🔀', 
      color: 'from-amber-400 to-orange-500',
      description: 'Decision point in workflow',
      features: ['Conditional routing', 'Business rules']
    },
    { 
      name: 'memory', 
      icon: '💾', 
      color: 'from-blue-400 to-indigo-500',
      description: 'Secure data storage',
      features: ['Encrypted storage', 'Data retention policies']
    },
    { 
      name: 'guardrail', 
      icon: '🛡️', 
      color: 'from-emerald-400 to-teal-500',
      description: 'Safety and compliance checks',
      features: ['Content filtering', 'Bias detection']
    },
  ];

  if (collapsed) {
    return (
      <div className="w-12 bg-slate-800/40 backdrop-blur-sm border-r border-slate-600/30 p-2 shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCollapsed(false)}
          className="w-full p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-48 bg-slate-800/40 backdrop-blur-sm border-r border-slate-600/30 flex flex-col shadow-sm">
      <div className="p-2 border-b border-slate-600/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Agent Library</h2>
            <p className="text-[10px] text-slate-400">Banking AI</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCollapsed(true)}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/60 h-7">
            <TabsTrigger value="agents" className="text-slate-400 data-[state=active]:text-slate-100 text-xs">
              Agents
            </TabsTrigger>
            <TabsTrigger value="utilities" className="text-slate-400 data-[state=active]:text-slate-100 text-xs">
              Utils
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="space-y-1.5 mt-2">
            {bankingAgents.map((agent) => (
              <Card 
                key={agent.name}
                className="p-1 bg-slate-800/60 border border-slate-600/30 hover:border-cyan-400/50 hover:shadow-md cursor-pointer transition-all duration-200 rounded-md"
                onClick={() => onAddAgent(agent.name)}
              >
                <div className="flex items-start gap-1.5">
                  <div className={`p-0.5 rounded bg-gradient-to-br ${agent.color} flex-shrink-0`}>
                    <span className="text-[10px]">{agent.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[10px] font-semibold text-slate-100 truncate">{agent.name}</h3>
                    <p className="text-[8px] text-slate-400 mt-0.5 mb-1 line-clamp-1">{agent.description}</p>
                    
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap gap-0.5">
                        {agent.compliance.slice(0, 2).map((comp) => (
                          <Badge key={comp} className="text-[7px] px-0.5 py-0 bg-cyan-500/20 text-cyan-400 border-cyan-400/30 hover:bg-cyan-500/30">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="utilities" className="space-y-1.5 mt-2">
            {bankingUtilities.map((node) => (
              <Card 
                key={node.name}
                className="p-1 bg-slate-800/60 border border-slate-600/30 hover:border-cyan-400/50 hover:shadow-md cursor-pointer transition-all duration-200 rounded-md"
                onClick={() => onAddUtility(node.name)}
              >
                <div className="flex items-start gap-1.5">
                  <div className={`p-0.5 rounded bg-gradient-to-br ${node.color} flex-shrink-0`}>
                    <span className="text-[10px]">{node.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[10px] font-semibold text-slate-100 capitalize truncate">{node.name}</h3>
                    <p className="text-[8px] text-slate-400 mt-0.5 truncate">{node.description}</p>
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