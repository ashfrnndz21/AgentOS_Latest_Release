import React, { useState } from 'react';
import { Search, BarChart3, TrendingUp, Shield, Globe, Activity, Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const WealthAgentPalette = () => {
  const [collapsed, setCollapsed] = useState(false);

  const wealthAgents = [
    {
      name: 'AI Market Research Agent',
      icon: Search,
      description: 'Continuously scans global markets, news, and economic indicators',
      status: 'active',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-700/30',
      model: 'GPT-4o + Web Research',
      capabilities: ['Real-time News Analysis', 'Economic Data Mining', 'Sentiment Analysis', 'Risk Detection']
    },
    {
      name: 'Predictive Trend Analyzer',
      icon: BarChart3,
      description: 'Uses machine learning to identify market patterns and predict future trends',
      status: 'analyzing',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-700/30',
      model: 'Claude 3 Opus + ML Models',
      capabilities: ['Pattern Recognition', 'Predictive Analytics', 'Cross-Asset Analysis', 'Volatility Forecasting']
    },
    {
      name: 'Personalized Investment Advisor',
      icon: TrendingUp,
      description: 'Analyzes complete financial profile and generates personalized recommendations',
      status: 'active',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-700/30',
      model: 'GPT-4o',
      capabilities: ['Portfolio Analysis', 'Risk Assessment', 'Tax Optimization', 'Goal-Based Planning']
    },
    {
      name: 'AI Risk Sentinel',
      icon: Shield,
      description: 'Advanced risk monitoring system that analyzes global events',
      status: 'monitoring',
      color: 'text-amber-400',
      bgColor: 'bg-amber-900/20',
      borderColor: 'border-amber-700/30',
      model: 'Claude 3 Opus + Risk Models',
      capabilities: ['Geopolitical Analysis', 'Correlation Monitoring', 'Stress Testing', 'Black Swan Detection']
    },
    {
      name: 'Web Intelligence Aggregator',
      icon: Globe,
      description: 'Crawls financial websites, forums, and social media for market intelligence',
      status: 'active',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-700/30',
      model: 'GPT-4o + Web Crawling',
      capabilities: ['Social Sentiment', 'Forum Analysis', 'Insider Tracking', 'Regulatory Monitoring']
    },
    {
      name: 'Proactive Wealth Optimizer',
      icon: Activity,
      description: 'Monitors overall financial health and identifies optimization opportunities',
      status: 'optimizing',
      color: 'text-green-500',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-700/30',
      model: 'GPT-4 Turbo',
      capabilities: ['Multi-Account Analysis', 'Tax Loss Harvesting', 'Rebalancing', 'Cash Management']
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

  if (collapsed) {
    return (
      <div className="w-12 bg-slate-800/40 backdrop-blur-lg border-r border-purple-400/20 p-2">
        <button 
          onClick={() => setCollapsed(false)}
          className="w-full p-2 text-purple-400 hover:text-white transition-colors rounded"
        >
          <Brain className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-r border-purple-400/20 flex flex-col">
      <div className="p-4 border-b border-purple-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Wealth Agents</h2>
          </div>
          <button 
            onClick={() => setCollapsed(true)}
            className="text-purple-400 hover:text-white transition-colors"
          >
            ←
          </button>
        </div>
        <p className="text-sm text-purple-300/70 mt-1">AI agents managing your wealth</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {wealthAgents.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <Card 
              key={agent.name}
              className={`p-3 bg-slate-800/30 border ${agent.borderColor} hover:border-purple-400/50 transition-all duration-200 hover:shadow-lg cursor-default`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${agent.bgColor} relative`}>
                    <IconComponent className={`h-4 w-4 ${agent.color}`} />
                    {agent.status === 'active' && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-xs">{agent.name}</h3>
                    {getStatusBadge(agent.status)}
                  </div>
                </div>
              </div>
              
              <p className="text-slate-400 text-xs mb-2">{agent.description}</p>
              
              <div className="text-xs text-slate-500 mb-2">
                Model: <span className="text-slate-300">{agent.model}</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 2).map((capability, index) => (
                  <Badge key={index} variant="outline" className="text-xs py-0 px-1 border-slate-600 text-slate-400">
                    {capability}
                  </Badge>
                ))}
                {agent.capabilities.length > 2 && (
                  <Badge variant="outline" className="text-xs py-0 px-1 border-slate-600 text-slate-400">
                    +{agent.capabilities.length - 2}
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-purple-400/20">
        <div className="text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Active Agents:</span>
            <span className="text-green-400">6/6</span>
          </div>
          <div className="flex justify-between">
            <span>Workflow Status:</span>
            <span className="text-purple-400">Running</span>
          </div>
          <div className="flex justify-between">
            <span>Performance:</span>
            <span className="text-blue-400">96%</span>
          </div>
        </div>
      </div>
    </div>
  );
};