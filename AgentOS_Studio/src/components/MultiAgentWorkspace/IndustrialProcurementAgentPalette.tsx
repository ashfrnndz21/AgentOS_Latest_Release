import React from 'react';
import { Factory, Search, FileText, Handshake, Shield, Truck, CheckCircle, DollarSign, Database, Settings } from 'lucide-react';

const industrialAgents = [
  {
    id: 'supplier-research',
    name: 'Supplier Research Agent',
    type: 'Research & Discovery',
    status: 'Active',
    description: 'Research and identify potential suppliers from global networks',
    model: 'Claude 3.5 Sonnet + Data Mining',
    capabilities: ['Supplier Discovery', 'Capability Analysis', 'Geographic Coverage', 'Financial Stability'],
    icon: Search,
    color: 'text-blue-400'
  },
  {
    id: 'rfp-generation',
    name: 'RFP Generation Agent',
    type: 'Document Generation',
    status: 'Generating',
    description: 'Create detailed RFPs with technical specifications',
    model: 'Claude 3.5 Haiku + Templates',
    capabilities: ['Document Generation', 'Technical Specs', 'Compliance Check', 'Template Management'],
    icon: FileText,
    color: 'text-green-400'
  },
  {
    id: 'contract-negotiation',
    name: 'Contract Negotiation Agent',
    type: 'Strategic Negotiation',
    status: 'Negotiating',
    description: 'Execute negotiation strategies based on market conditions',
    model: 'Claude 3 Opus + Negotiation Logic',
    capabilities: ['Contract Analysis', 'Price Optimization', 'Terms Negotiation', 'Risk Mitigation'],
    icon: Handshake,
    color: 'text-purple-400'
  },
  {
    id: 'risk-monitoring',
    name: 'Risk Monitoring Agent',
    type: 'Risk Assessment',
    status: 'Monitoring',
    description: 'Continuously monitor supplier financial health and operational status',
    model: 'Amazon Titan + Risk Models',
    capabilities: ['Risk Scoring', 'Market Monitoring', 'Supplier Health', 'Alert Systems'],
    icon: Shield,
    color: 'text-red-400'
  },
  {
    id: 'logistics-coordination',
    name: 'Logistics Coordination Agent',
    type: 'Supply Chain Optimization',
    status: 'Coordinating',
    description: 'Optimize delivery routes and scheduling for materials',
    model: 'Llama 3.1 70B + Route Optimization',
    capabilities: ['Route Planning', 'Inventory Management', 'Delivery Tracking', 'Compliance Monitoring'],
    icon: Truck,
    color: 'text-cyan-400'
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance Agent',
    type: 'Quality Management',
    status: 'Auditing',
    description: 'Audit supplier quality management systems and ensure compliance',
    model: 'Mixtral 8x7B + QA Systems',
    capabilities: ['Quality Audits', 'Certification Tracking', 'Performance Monitoring', 'Corrective Actions'],
    icon: CheckCircle,
    color: 'text-emerald-400'
  },
  {
    id: 'cost-optimization',
    name: 'Cost Optimization Agent',
    type: 'Financial Analysis',
    status: 'Optimizing',
    description: 'Analyze total cost of ownership and identify cost reduction opportunities',
    model: 'Claude 3.5 Sonnet + Financial Models',
    capabilities: ['Cost Analysis', 'Price Benchmarking', 'Savings Identification', 'ROI Calculation'],
    icon: DollarSign,
    color: 'text-yellow-400'
  }
];

export const IndustrialProcurementAgentPalette = () => {
  const activeAgents = industrialAgents.filter(agent => agent.status === 'Active' || agent.status === 'Generating' || agent.status === 'Negotiating' || agent.status === 'Monitoring' || agent.status === 'Coordinating' || agent.status === 'Auditing' || agent.status === 'Optimizing');

  return (
    <div className="w-80 bg-slate-800/90 backdrop-blur-lg border-r border-orange-400/20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-orange-400/20">
        <div className="flex items-center gap-2 mb-2">
          <Factory className="h-5 w-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">Industrial Agents</h2>
        </div>
        <p className="text-sm text-gray-400">Procurement & Supply Chain AI</p>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {industrialAgents.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <div
              key={agent.id}
              className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-3 hover:border-orange-400/30 transition-all cursor-pointer group"
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
                      agent.status === 'Generating' ? 'bg-blue-400' :
                      agent.status === 'Negotiating' ? 'bg-purple-400' :
                      agent.status === 'Monitoring' ? 'bg-yellow-400' :
                      agent.status === 'Coordinating' ? 'bg-cyan-400' :
                      agent.status === 'Auditing' ? 'bg-emerald-400' :
                      agent.status === 'Optimizing' ? 'bg-orange-400' :
                      'bg-gray-400'
                    }`} />
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">{agent.type}</p>
                  <p className="text-xs text-gray-300 mb-2 line-clamp-2">{agent.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Model:</span>
                    <span className="text-orange-300 font-mono">{agent.model.split(' + ')[0]}</span>
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
      <div className="p-4 border-t border-orange-400/20 bg-slate-900/50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-orange-400">{activeAgents.length}</div>
            <div className="text-xs text-gray-400">Active Agents</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">94%</div>
            <div className="text-xs text-gray-400">Performance</div>
          </div>
        </div>
      </div>
    </div>
  );
};