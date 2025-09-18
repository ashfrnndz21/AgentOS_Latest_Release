
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bot, TrendingUp, Shield, Activity, MessageSquare, Settings, Globe, BarChart3, Brain, Search } from 'lucide-react';
import { AgentChatDialog } from './AgentChatDialog';

export const WealthAgentsPanel = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'market-research-agent',
      name: 'AI Market Research Agent',
      description: 'Continuously scans global markets, news, and economic indicators to identify investment opportunities and risks',
      status: 'active',
      icon: Search,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-700/30',
      model: 'GPT-4o + Web Research',
      capabilities: ['Real-time News Analysis', 'Economic Data Mining', 'Sentiment Analysis', 'Risk Detection'],
      lastAction: 'Identified emerging tech opportunity in quantum computing - 15 min ago',
      researchSources: ['Reuters', 'Bloomberg', 'SEC Filings', 'Fed Reports']
    },
    {
      id: 'trend-analysis-agent',
      name: 'Predictive Trend Analyzer',
      description: 'Uses machine learning to identify market patterns and predict future trends across asset classes',
      status: 'analyzing',
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-700/30',
      model: 'Claude 3 Opus + ML Models',
      capabilities: ['Pattern Recognition', 'Predictive Analytics', 'Cross-Asset Analysis', 'Volatility Forecasting'],
      lastAction: 'Detected 78% probability of sector rotation into energy - 8 min ago',
      confidence: 94
    },
    {
      id: 'investment-advisor',
      name: 'Personalized Investment Advisor',
      description: 'Analyzes your complete financial profile and generates personalized investment recommendations',
      status: 'active',
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-700/30',
      model: 'GPT-4o',
      capabilities: ['Portfolio Analysis', 'Risk Assessment', 'Tax Optimization', 'Goal-Based Planning'],
      lastAction: 'Generated ESG-focused portfolio rebalancing strategy - 1 hour ago'
    },
    {
      id: 'risk-sentinel',
      name: 'AI Risk Sentinel',
      description: 'Advanced risk monitoring system that analyzes global events and their potential impact on your portfolio',
      status: 'monitoring',
      icon: Shield,
      color: 'text-amber-400',
      bgColor: 'bg-amber-900/20',
      borderColor: 'border-amber-700/30',
      model: 'Claude 3 Opus + Risk Models',
      capabilities: ['Geopolitical Analysis', 'Correlation Monitoring', 'Stress Testing', 'Black Swan Detection'],
      lastAction: 'All systems normal - Monitoring 247 risk factors',
      riskFactors: 247
    },
    {
      id: 'web-intelligence-agent',
      name: 'Web Intelligence Aggregator',
      description: 'Crawls financial websites, forums, and social media to gather market intelligence and sentiment data',
      status: 'active',
      icon: Globe,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-700/30',
      model: 'GPT-4o + Web Crawling',
      capabilities: ['Social Sentiment', 'Forum Analysis', 'Insider Tracking', 'Regulatory Monitoring'],
      lastAction: 'Detected unusual options activity in NVDA - High conviction signal',
      signalStrength: 'High'
    },
    {
      id: 'financial-health',
      name: 'Proactive Wealth Optimizer',
      description: 'Monitors overall financial health and identifies optimization opportunities across all accounts',
      status: 'optimizing',
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-700/30',
      model: 'GPT-4 Turbo',
      capabilities: ['Multi-Account Analysis', 'Tax Loss Harvesting', 'Rebalancing', 'Cash Management'],
      lastAction: 'Found $12,400 in tax-loss harvesting opportunities',
      potentialSavings: '$12,400'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-900/20 text-green-300 border-green-700/30">Active</Badge>;
      case 'monitoring':
        return <Badge className="bg-blue-900/20 text-blue-300 border-blue-700/30">Monitoring</Badge>;
      case 'analyzing':
        return <Badge className="bg-purple-900/20 text-purple-300 border-purple-700/30">Analyzing</Badge>;
      case 'optimizing':
        return <Badge className="bg-amber-900/20 text-amber-300 border-amber-700/30">Optimizing</Badge>;
      default:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center">
            <Brain className="mr-2 h-5 w-5 text-true-red" />
            AI Wealth Research Team
          </CardTitle>
          <p className="text-sm text-gray-400">6 agents actively managing your portfolio</p>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {agents.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <Card key={agent.id} className={`bg-beam-dark-accent/50 border ${agent.borderColor} hover:border-true-red/50 transition-all duration-200 hover:shadow-lg`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${agent.bgColor} relative`}>
                      <IconComponent className={`h-4 w-4 ${agent.color}`} />
                      {agent.status === 'active' && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white text-sm">{agent.name}</h3>
                      {getStatusBadge(agent.status)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <AgentChatDialog agent={agent} />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-gray-400 text-xs mb-3">{agent.description}</p>
                
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">
                    Model: <span className="text-gray-300">{agent.model}</span>
                  </div>
                  
                  {/* Special indicators for different agent types */}
                  {agent.confidence && (
                    <div className="text-xs">
                      <span className="text-gray-500">Confidence: </span>
                      <span className="text-green-400 font-medium">{agent.confidence}%</span>
                    </div>
                  )}
                  
                  {agent.riskFactors && (
                    <div className="text-xs">
                      <span className="text-gray-500">Monitoring: </span>
                      <span className="text-blue-400 font-medium">{agent.riskFactors} risk factors</span>
                    </div>
                  )}
                  
                  {agent.signalStrength && (
                    <div className="text-xs">
                      <span className="text-gray-500">Signal: </span>
                      <span className="text-amber-400 font-medium">{agent.signalStrength} conviction</span>
                    </div>
                  )}
                  
                  {agent.potentialSavings && (
                    <div className="text-xs">
                      <span className="text-gray-500">Identified: </span>
                      <span className="text-green-400 font-medium">{agent.potentialSavings} savings</span>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-2 p-2 bg-beam-dark-accent/30 rounded border-l-2 border-true-red/30">
                    {agent.lastAction}
                  </div>
                </div>
                
                {/* Show capabilities as small badges */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {agent.capabilities.slice(0, 2).map((capability, index) => (
                    <Badge key={index} variant="outline" className="text-xs py-0 px-2 border-gray-600 text-gray-400">
                      {capability}
                    </Badge>
                  ))}
                  {agent.capabilities.length > 2 && (
                    <Badge variant="outline" className="text-xs py-0 px-2 border-gray-600 text-gray-400">
                      +{agent.capabilities.length - 2} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
