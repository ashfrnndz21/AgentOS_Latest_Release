import React from 'react';
import { DollarSign, TrendingUp, BarChart3, AlertTriangle, Globe, Target } from 'lucide-react';

const forecastingAgents = [
  {
    id: 'market-intelligence',
    name: 'Market Intelligence Agent',
    type: 'Market Analysis',
    status: 'Active',
    description: 'Analyzes market conditions, trends, and competitive landscape for accurate forecasting',
    model: 'Claude 3.5 Sonnet + Market Data',
    capabilities: ['Market Analysis', 'Trend Detection', 'Competitor Intelligence', 'Price Monitoring'],
    icon: Globe,
    color: 'text-blue-400'
  },
  {
    id: 'financial-forecasting',
    name: 'Financial Forecasting Agent',
    type: 'Predictive Modeling',
    status: 'Forecasting',
    description: 'Generates accurate financial forecasts using advanced statistical and ML models',
    model: 'Claude 3 Opus + Financial Models',
    capabilities: ['Time Series Analysis', 'Regression Models', 'Monte Carlo Simulation', 'Predictive Analytics'],
    icon: TrendingUp,
    color: 'text-green-400'
  },
  {
    id: 'scenario-analysis',
    name: 'Scenario Analysis Agent',
    type: 'Scenario Modeling',
    status: 'Modeling',
    description: 'Creates and analyzes multiple financial scenarios for comprehensive planning',
    model: 'Amazon Titan + Scenario Engine',
    capabilities: ['Scenario Modeling', 'Stress Testing', 'Sensitivity Analysis', 'What-If Analysis'],
    icon: BarChart3,
    color: 'text-purple-400'
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment Agent',
    type: 'Risk Analysis',
    status: 'Assessing',
    description: 'Identifies and quantifies financial risks across multiple dimensions',
    model: 'Llama 3.1 70B + Risk Models',
    capabilities: ['Risk Scoring', 'VaR Calculation', 'Credit Risk', 'Market Risk', 'Operational Risk'],
    icon: AlertTriangle,
    color: 'text-red-400'
  },
  {
    id: 'economic-indicator',
    name: 'Economic Indicator Agent',
    type: 'Economic Monitoring',
    status: 'Monitoring',
    description: 'Monitors and analyzes key economic indicators affecting financial forecasts',
    model: 'Mixtral 8x7B + Economic Data',
    capabilities: ['Economic Monitoring', 'Indicator Analysis', 'Correlation Detection', 'Leading Indicators'],
    icon: Target,
    color: 'text-cyan-400'
  },
  {
    id: 'project-finance',
    name: 'Project Finance Agent',
    type: 'Financial Analysis',
    status: 'Analyzing',
    description: 'Analyzes project financials and investment opportunities',
    model: 'Claude 3.5 Haiku + Finance Models',
    capabilities: ['NPV Analysis', 'IRR Calculation', 'Cash Flow Modeling', 'Capital Structure'],
    icon: DollarSign,
    color: 'text-emerald-400'
  }
];

export const IndustrialForecastingAgentPalette = () => {
  const activeAgents = forecastingAgents.filter(agent => 
    ['Active', 'Forecasting', 'Modeling', 'Assessing', 'Monitoring', 'Analyzing'].includes(agent.status)
  );

  return (
    <div className="w-80 bg-slate-800/90 backdrop-blur-lg border-r border-yellow-400/20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-yellow-400/20">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">Financial Agents</h2>
        </div>
        <p className="text-sm text-gray-400">Forecasting & Scenario Analysis AI</p>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {forecastingAgents.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <div
              key={agent.id}
              className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-3 hover:border-yellow-400/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-800 flex-shrink-0">
                  <IconComponent className={`h-4 w-4 ${agent.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {agent.name}
                    </h3>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      agent.status === 'Active' ? 'bg-green-400' :
                      agent.status === 'Forecasting' ? 'bg-blue-400' :
                      agent.status === 'Modeling' ? 'bg-purple-400' :
                      agent.status === 'Assessing' ? 'bg-red-400' :
                      agent.status === 'Monitoring' ? 'bg-cyan-400' :
                      agent.status === 'Analyzing' ? 'bg-emerald-400' :
                      'bg-gray-400'
                    }`} />
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">{agent.type}</p>
                  <p className="text-xs text-gray-300 mb-2 line-clamp-2">{agent.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Model:</span>
                    <span className="text-yellow-300 font-mono">{agent.model.split(' + ')[0]}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-400">Capabilities:</span>
                    <span className="text-gray-300">+{agent.capabilities.length}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-yellow-400/20 bg-slate-900/50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-yellow-400">{activeAgents.length}</div>
            <div className="text-xs text-gray-400">Active Agents</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">91%</div>
            <div className="text-xs text-gray-400">Performance</div>
          </div>
        </div>
      </div>
    </div>
  );
};