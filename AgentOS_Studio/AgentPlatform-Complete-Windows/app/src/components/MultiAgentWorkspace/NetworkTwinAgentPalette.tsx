import React, { useState } from 'react';
import { 
  Radio, 
  Radar, 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  BarChart3,
  MapPin,
  Shield,
  Brain,
  Zap,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const NetworkTwinAgentPalette = () => {
  const [collapsed, setCollapsed] = useState(false);

  const networkAgents = [
    {
      name: 'RAN Intelligence Agent',
      icon: Radar,
      description: 'Monitors and optimizes radio access network performance in real-time',
      status: 'active',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-700/30',
      model: 'GPT-4o + RF Analytics',
      capabilities: ['Signal Optimization', 'Coverage Analysis', 'Interference Detection', 'Capacity Planning']
    },
    {
      name: 'Network Performance Monitor',
      icon: Activity,
      description: 'Tracks KPIs across all cell sites and identifies performance degradation',
      status: 'monitoring',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-700/30',
      model: 'Claude 3 Opus + Time Series',
      capabilities: ['KPI Monitoring', 'Anomaly Detection', 'Performance Trending', 'Alert Generation']
    },
    {
      name: 'Predictive Maintenance Agent',
      icon: Settings,
      description: 'Predicts equipment failures and schedules optimal maintenance windows',
      status: 'analyzing',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-700/30',
      model: 'GPT-4o + Predictive Models',
      capabilities: ['Failure Prediction', 'Maintenance Scheduling', 'Resource Planning', 'Cost Optimization']
    },
    {
      name: 'Coverage Optimization Agent',
      icon: MapPin,
      description: 'Optimizes cell site placement and coverage patterns for maximum efficiency',
      status: 'optimizing',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-700/30',
      model: 'Claude 3 Opus + Geospatial',
      capabilities: ['Site Planning', 'Coverage Modeling', 'Interference Mitigation', 'Capacity Allocation']
    },
    {
      name: 'Traffic Flow Optimizer',
      icon: TrendingUp,
      description: 'Analyzes and optimizes network traffic patterns for peak performance',
      status: 'active',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-700/30',
      model: 'GPT-4o + Traffic Analytics',
      capabilities: ['Load Balancing', 'Congestion Management', 'QoS Optimization', 'Bandwidth Allocation']
    },
    {
      name: 'Fault Detection Agent',
      icon: AlertTriangle,
      description: 'Detects network faults and initiates automated recovery procedures',
      status: 'monitoring',
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-700/30',
      model: 'Claude 3 Opus + Fault Analytics',
      capabilities: ['Fault Detection', 'Root Cause Analysis', 'Auto Recovery', 'Escalation Management']
    },
    {
      name: 'Security Monitoring Agent',
      icon: Shield,
      description: 'Monitors network security and detects potential threats or breaches',
      status: 'active',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-700/30',
      model: 'GPT-4 Turbo + Security Analytics',
      capabilities: ['Threat Detection', 'Security Scanning', 'Compliance Monitoring', 'Incident Response']
    },
    {
      name: 'Energy Efficiency Agent',
      icon: Zap,
      description: 'Optimizes power consumption across network infrastructure for sustainability',
      status: 'optimizing',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-900/20',
      borderColor: 'border-emerald-700/30',
      model: 'GPT-4o + Energy Models',
      capabilities: ['Power Optimization', 'Green Operations', 'Carbon Tracking', 'Cost Reduction']
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
      <div className="w-12 bg-slate-800/40 backdrop-blur-lg border-r border-blue-400/20 p-2">
        <button 
          onClick={() => setCollapsed(false)}
          className="w-full p-2 text-blue-400 hover:text-white transition-colors rounded"
        >
          <Radio className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-r border-blue-400/20 flex flex-col">
      <div className="p-4 border-b border-blue-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Network Agents</h2>
          </div>
          <button 
            onClick={() => setCollapsed(true)}
            className="text-blue-400 hover:text-white transition-colors"
          >
            ←
          </button>
        </div>
        <p className="text-sm text-blue-300/70 mt-1">Digital Twin Network AI</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {networkAgents.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <Card 
              key={agent.name}
              className={`p-3 bg-slate-800/30 border ${agent.borderColor} hover:border-blue-400/50 transition-all duration-200 hover:shadow-lg cursor-default`}
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
      
      <div className="p-4 border-t border-blue-400/20">
        <div className="text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Active Agents:</span>
            <span className="text-blue-400">8/8</span>
          </div>
          <div className="flex justify-between">
            <span>Network Status:</span>
            <span className="text-green-400">Optimal</span>
          </div>
          <div className="flex justify-between">
            <span>Coverage:</span>
            <span className="text-cyan-400">94.2%</span>
          </div>
          <div className="flex justify-between">
            <span>Energy Savings:</span>
            <span className="text-yellow-400">18.7%</span>
          </div>
        </div>
      </div>
    </div>
  );
};