import React, { useState } from 'react';
import { 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  BarChart3,
  Database,
  Shield,
  Brain,
  Search,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const TelcoCvmAgentPalette = () => {
  const [collapsed, setCollapsed] = useState(false);

  const cvmAgents = [
    {
      name: 'Customer Journey Mapper',
      icon: Search,
      description: 'Maps complete customer journeys across touchpoints and identifies friction points',
      status: 'active',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-700/30',
      model: 'GPT-4o + Journey Analytics',
      capabilities: ['Journey Mapping', 'Touchpoint Analysis', 'Friction Detection', 'Experience Optimization']
    },
    {
      name: 'CLV Prediction Engine',
      icon: TrendingUp,
      description: 'Predicts customer lifetime value and identifies high-value segments',
      status: 'analyzing',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-700/30',
      model: 'Claude 3 Opus + ML Models',
      capabilities: ['CLV Forecasting', 'Value Segmentation', 'Growth Potential', 'Risk Assessment']
    },
    {
      name: 'Next Best Action Agent',
      icon: Target,
      description: 'Recommends personalized next best actions for each customer interaction',
      status: 'active',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-700/30',
      model: 'GPT-4o + Decision Trees',
      capabilities: ['Action Recommendations', 'Personalization', 'Timing Optimization', 'Channel Selection']
    },
    {
      name: 'Churn Prevention Agent',
      icon: AlertTriangle,
      description: 'Identifies at-risk customers and executes automated retention campaigns',
      status: 'monitoring',
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-700/30',
      model: 'Claude 3 Opus + Risk Models',
      capabilities: ['Churn Scoring', 'Retention Campaigns', 'Win-back Strategies', 'Proactive Intervention']
    },
    {
      name: 'Revenue Optimization Agent',
      icon: DollarSign,
      description: 'Optimizes pricing, upselling, and cross-selling opportunities in real-time',
      status: 'optimizing',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-700/30',
      model: 'GPT-4o + Financial Models',
      capabilities: ['Dynamic Pricing', 'Upsell Triggers', 'Cross-sell Matching', 'Revenue Maximization']
    },
    {
      name: 'Campaign Performance Agent',
      icon: BarChart3,
      description: 'Monitors campaign performance and optimizes marketing spend in real-time',
      status: 'active',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-700/30',
      model: 'GPT-4 Turbo + Analytics',
      capabilities: ['Performance Tracking', 'Budget Optimization', 'ROI Analysis', 'Attribution Modeling']
    },
    {
      name: 'Customer Sentiment Agent',
      icon: Brain,
      description: 'Analyzes customer sentiment across all channels and predicts satisfaction trends',
      status: 'active',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-900/20',
      borderColor: 'border-indigo-700/30',
      model: 'Claude 3 Opus + NLP',
      capabilities: ['Sentiment Analysis', 'Social Listening', 'Satisfaction Prediction', 'Issue Detection']
    },
    {
      name: 'Data Enrichment Agent',
      icon: Database,
      description: 'Enriches customer profiles with external data and behavioral insights',
      status: 'processing',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-900/20',
      borderColor: 'border-emerald-700/30',
      model: 'GPT-4o + Data Pipeline',
      capabilities: ['Data Enrichment', 'Profile Building', 'External Integration', 'Quality Validation']
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
      case 'processing':
        return <Badge className="bg-emerald-900/20 text-emerald-300 border-emerald-700/30">Processing</Badge>;
      default:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-slate-800/40 backdrop-blur-lg border-r border-green-400/20 p-2">
        <button 
          onClick={() => setCollapsed(false)}
          className="w-full p-2 text-green-400 hover:text-white transition-colors rounded"
        >
          <Users className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-r border-green-400/20 flex flex-col">
      <div className="p-4 border-b border-green-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">CVM Agents</h2>
          </div>
          <button 
            onClick={() => setCollapsed(true)}
            className="text-green-400 hover:text-white transition-colors"
          >
            ←
          </button>
        </div>
        <p className="text-sm text-green-300/70 mt-1">Customer Value Management AI</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cvmAgents.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <Card 
              key={agent.name}
              className={`p-3 bg-slate-800/30 border ${agent.borderColor} hover:border-green-400/50 transition-all duration-200 hover:shadow-lg cursor-default`}
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
      
      <div className="p-4 border-t border-green-400/20">
        <div className="text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Active Agents:</span>
            <span className="text-green-400">8/8</span>
          </div>
          <div className="flex justify-between">
            <span>Workflow Status:</span>
            <span className="text-green-400">Running</span>
          </div>
          <div className="flex justify-between">
            <span>Performance:</span>
            <span className="text-cyan-400">94%</span>
          </div>
          <div className="flex justify-between">
            <span>Revenue Impact:</span>
            <span className="text-yellow-400">+$2.4M</span>
          </div>
        </div>
      </div>
    </div>
  );
};