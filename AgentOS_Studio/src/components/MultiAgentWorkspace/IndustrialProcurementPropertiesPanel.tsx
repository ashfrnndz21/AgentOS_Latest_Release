import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Node } from '@xyflow/react';
import { 
  X, 
  Factory,
  Settings, 
  Shield, 
  Database,
  Brain,
  Activity,
  Search,
  FileText,
  Handshake,
  Truck,
  CheckCircle,
  DollarSign,
  Wrench,
  MessageSquare,
  Lock,
  TrendingUp,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IndustrialProcurementPropertiesPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, newData: any) => void;
  onClose: () => void;
}

interface AgentConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AgentMetrics {
  success?: number;
  responseTime?: number;
}

interface NodeData {
  label: string;
  description: string;
  agentType: string;
  status: string;
  size?: string;
  entries?: number;
  violations?: number;
  lastCheck?: string;
  metrics?: AgentMetrics;
  config?: AgentConfig;
  prompt?: string;
  tools?: string[];
  memory?: {
    type?: string;
    size?: string;
    retention?: string;
  };
  guardrails?: string[];
  capabilities?: string[];
  activeNegotiations?: number;
  suppliersMonitored?: number;
  activeShipments?: number;
  auditsCompleted?: number;
  optimizationProjects?: number;
  confidence?: number;
  accuracy?: string;
  complianceRate?: string;
  avgSavings?: string;
  onTimeDelivery?: string;
  potentialSavings?: string;
  riskAlerts?: number;
  templatesUsed?: number;
}

const agentIcons: Record<string, any> = {
  'Supplier Research Agent': Search,
  'RFP Generation Agent': FileText,
  'Contract Negotiation Agent': Handshake,
  'Risk Monitoring Agent': Shield,
  'Logistics Coordination Agent': Truck,
  'Quality Assurance Agent': CheckCircle,
  'Cost Optimization Agent': DollarSign,
  'default': Factory
};

export const IndustrialProcurementPropertiesPanel: React.FC<IndustrialProcurementPropertiesPanelProps> = ({
  node,
  onUpdateNode,
  onClose
}) => {
  const [localData, setLocalData] = useState<NodeData>(node.data as any);
  const IconComponent = agentIcons[localData.agentType] || agentIcons.default;

  const handleSave = () => {
    onUpdateNode(node.id, localData);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-green-400 bg-green-900/20 border-green-400/30';
      case 'generating': return 'text-blue-400 bg-blue-900/20 border-blue-400/30';
      case 'negotiating': return 'text-purple-400 bg-purple-900/20 border-purple-400/30';
      case 'monitoring': return 'text-yellow-400 bg-yellow-900/20 border-yellow-400/30';
      case 'coordinating': return 'text-cyan-400 bg-cyan-900/20 border-cyan-400/30';
      case 'auditing': return 'text-emerald-400 bg-emerald-900/20 border-emerald-400/30';
      case 'optimizing': return 'text-orange-400 bg-orange-900/20 border-orange-400/30';
      case 'orchestrating': return 'text-indigo-400 bg-indigo-900/20 border-indigo-400/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
    }
  };

  const getDefaultPrompt = (agentType: string) => {
    const prompts: Record<string, string> = {
      'Supplier Research Agent': 'You are a Supplier Research agent specialized in discovering and qualifying potential suppliers. Research supplier capabilities, financial stability, geographic coverage, and compliance status to build comprehensive supplier profiles.',
      'RFP Generation Agent': 'You are an RFP Generation agent that creates detailed Request for Proposal documents. Generate comprehensive RFPs with technical specifications, compliance requirements, and evaluation criteria tailored to industrial procurement needs.',
      'Contract Negotiation Agent': 'You are a Contract Negotiation agent that handles strategic negotiations. Analyze contract terms, optimize pricing, assess risks, and execute negotiation strategies to achieve favorable outcomes while maintaining supplier relationships.',
      'Risk Monitoring Agent': 'You are a Risk Monitoring agent that continuously assesses supplier risks. Monitor financial health, operational status, market conditions, and compliance to identify potential risks and recommend mitigation strategies.',
      'Logistics Coordination Agent': 'You are a Logistics Coordination agent that optimizes supply chain operations. Plan delivery routes, manage inventory, track shipments, and ensure compliance with safety and transport regulations.',
      'Quality Assurance Agent': 'You are a Quality Assurance agent that ensures supplier compliance and quality standards. Conduct audits, track certifications, monitor performance, and implement corrective actions to maintain quality excellence.',
      'Cost Optimization Agent': 'You are a Cost Optimization agent that identifies cost reduction opportunities. Analyze total cost of ownership, benchmark pricing, identify savings opportunities, and calculate ROI for optimization initiatives.'
    };
    return prompts[agentType] || 'You are an AI agent designed to assist with industrial procurement and supply chain management tasks.';
  };

  const getAvailableTools = (agentType: string) => {
    const tools: Record<string, string[]> = {
      'Supplier Research Agent': ['Web Search', 'Database Analysis', 'Risk Assessment', 'Supplier Profiling'],
      'RFP Generation Agent': ['Document Generation', 'Technical Specs', 'Compliance Check', 'Template Management'],
      'Contract Negotiation Agent': ['Contract Analysis', 'Price Optimization', 'Terms Negotiation', 'Risk Mitigation'],
      'Risk Monitoring Agent': ['Risk Scoring', 'Market Monitoring', 'Supplier Health', 'Alert Systems'],
      'Logistics Coordination Agent': ['Route Planning', 'Inventory Management', 'Delivery Tracking', 'Compliance Monitoring'],
      'Quality Assurance Agent': ['Quality Audits', 'Certification Tracking', 'Performance Monitoring', 'Corrective Actions'],
      'Cost Optimization Agent': ['Cost Analysis', 'Price Benchmarking', 'Savings Identification', 'ROI Calculation']
    };
    return tools[agentType] || ['Generic Tool', 'Data Processor', 'Analytics Engine', 'Report Generator'];
  };

  const getGuardrails = (agentType: string) => {
    const guardrails: Record<string, string[]> = {
      'Supplier Research Agent': ['Data Privacy', 'Supplier Verification', 'Information Security', 'Research Ethics'],
      'RFP Generation Agent': ['Regulatory Compliance', 'Standard Templates', 'Legal Review', 'Fair Competition'],
      'Contract Negotiation Agent': ['Contract Limits', 'Approval Workflows', 'Legal Compliance', 'Authority Bounds'],
      'Risk Monitoring Agent': ['Risk Thresholds', 'Escalation Rules', 'Data Protection', 'Alert Protocols'],
      'Logistics Coordination Agent': ['Safety Regulations', 'Transport Rules', 'Environmental Compliance', 'Route Safety'],
      'Quality Assurance Agent': ['Quality Standards', 'Certification Requirements', 'Audit Protocols', 'Compliance Rules'],
      'Cost Optimization Agent': ['Budget Limits', 'Approval Thresholds', 'Cost Validation', 'Savings Verification']
    };
    return guardrails[agentType] || ['Data Protection', 'Privacy Compliance', 'Security Control', 'Ethics Monitor'];
  };

  const getPerformanceMetrics = () => {
    if (node.type === 'memory') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Storage Size</div>
            <div className="text-lg font-semibold text-white">{localData.size || 'N/A'}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Entries</div>
            <div className="text-lg font-semibold text-white">{localData.entries?.toLocaleString() || 'N/A'}</div>
          </div>
        </div>
      );
    }

    if (node.type === 'guardrail') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Violations</div>
            <div className="text-lg font-semibold text-green-400">{localData.violations || 0}</div>
          </div>
          <div className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">Last Check</div>
            <div className="text-sm text-white">
              {localData.lastCheck ? new Date(localData.lastCheck).toLocaleTimeString() : 'N/A'}
            </div>
          </div>
        </div>
      );
    }

    // Agent-specific metrics
    const agentMetrics: Record<string, any> = {
      'Supplier Research Agent': [
        { label: 'Suppliers Found', value: '847', color: 'text-blue-400' },
        { label: 'Avg Research Time', value: '2.3h', color: 'text-green-400' }
      ],
      'RFP Generation Agent': [
        { label: 'Templates Used', value: localData.templatesUsed || '15', color: 'text-purple-400' },
        { label: 'Confidence', value: `${localData.confidence || 96}%`, color: 'text-green-400' }
      ],
      'Contract Negotiation Agent': [
        { label: 'Active Negotiations', value: localData.activeNegotiations || '5', color: 'text-orange-400' },
        { label: 'Avg Savings', value: localData.avgSavings || '12.3%', color: 'text-green-400' }
      ],
      'Risk Monitoring Agent': [
        { label: 'Suppliers Monitored', value: localData.suppliersMonitored || '847', color: 'text-yellow-400' },
        { label: 'Risk Alerts', value: localData.riskAlerts || '3', color: 'text-red-400' }
      ],
      'Logistics Coordination Agent': [
        { label: 'Active Shipments', value: localData.activeShipments || '23', color: 'text-cyan-400' },
        { label: 'On-Time Delivery', value: localData.onTimeDelivery || '98.7%', color: 'text-green-400' }
      ],
      'Quality Assurance Agent': [
        { label: 'Audits Completed', value: localData.auditsCompleted || '156', color: 'text-emerald-400' },
        { label: 'Compliance Rate', value: localData.complianceRate || '99.2%', color: 'text-green-400' }
      ],
      'Cost Optimization Agent': [
        { label: 'Potential Savings', value: localData.potentialSavings || '$2.8M', color: 'text-green-400' },
        { label: 'Projects Active', value: localData.optimizationProjects || '12', color: 'text-blue-400' }
      ]
    };

    const metrics = agentMetrics[localData.agentType] || [
      { label: 'Success Rate', value: '94%', color: 'text-green-400' },
      { label: 'Avg Response', value: '150ms', color: 'text-blue-400' }
    ];

    return (
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-slate-700/30 p-3 rounded-lg">
            <div className="text-sm text-slate-400">{metric.label}</div>
            <div className={`text-lg font-semibold ${metric.color}`}>{metric.value}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-l border-orange-400/20 flex flex-col text-white overflow-y-auto">
      <div className="p-4 border-b border-orange-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700/30 rounded-lg">
              <IconComponent className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{localData.label}</h3>
              <Badge className={getStatusColor(localData.status)}>
                {localData.status}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-700/30">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="prompt" className="text-xs">Prompt</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
            <TabsTrigger value="memory" className="text-xs">Memory</TabsTrigger>
            <TabsTrigger value="guardrails" className="text-xs">Guards</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="label">Agent Name</Label>
              <Input
                id="label"
                value={localData.label}
                onChange={(e) => setLocalData({...localData, label: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localData.description}
                onChange={(e) => setLocalData({...localData, description: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <Separator className="bg-slate-700" />

            <div>
              <Label className="text-sm font-medium text-slate-300">Performance Metrics</Label>
              <div className="mt-2">
                {getPerformanceMetrics()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-orange-400" />
              <Label className="text-sm font-medium text-slate-300">System Prompt</Label>
            </div>
            <Textarea
              value={localData.prompt || getDefaultPrompt(localData.agentType)}
              onChange={(e) => setLocalData({...localData, prompt: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
              placeholder="Enter the system prompt for this agent..."
            />
            <div className="text-xs text-slate-400">
              Define the agent's role, capabilities, and behavior patterns for industrial procurement tasks.
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="h-4 w-4 text-blue-400" />
              <Label className="text-sm font-medium text-slate-300">Available Tools</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {getAvailableTools(localData.agentType).map((tool, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded border border-slate-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">{tool}</span>
                </div>
              ))}
            </div>
            <Separator className="bg-slate-700" />
            <div>
              <Label htmlFor="model" className="text-sm">LLM Model</Label>
              <Select
                value={localData.config?.model || 'claude-3-5-sonnet'}
                onValueChange={(value) => setLocalData({
                  ...localData, 
                  config: {...(localData.config || {}), model: value}
                })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="claude-3-5-sonnet" className="text-white">Claude 3.5 Sonnet</SelectItem>
                  <SelectItem value="claude-3-5-haiku" className="text-white">Claude 3.5 Haiku</SelectItem>
                  <SelectItem value="claude-3-opus" className="text-white">Claude 3 Opus</SelectItem>
                  <SelectItem value="amazon-titan-text-express" className="text-white">Amazon Titan Text Express</SelectItem>
                  <SelectItem value="amazon-titan-text-lite" className="text-white">Amazon Titan Text Lite</SelectItem>
                  <SelectItem value="llama-3-1-70b" className="text-white">Llama 3.1 70B</SelectItem>
                  <SelectItem value="llama-3-1-8b" className="text-white">Llama 3.1 8B</SelectItem>
                  <SelectItem value="mixtral-8x7b" className="text-white">Mixtral 8x7B</SelectItem>
                  <SelectItem value="mixtral-8x22b" className="text-white">Mixtral 8x22B</SelectItem>
                  <SelectItem value="codestral-22b" className="text-white">Codestral 22B</SelectItem>
                  <SelectItem value="qwen-2-72b" className="text-white">Qwen 2 72B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="temperature" className="text-xs">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={localData.config?.temperature || 0.3}
                  onChange={(e) => setLocalData({
                    ...localData, 
                    config: {...(localData.config || {}), temperature: parseFloat(e.target.value)}
                  })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxTokens" className="text-xs">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={localData.config?.maxTokens || 2000}
                  onChange={(e) => setLocalData({
                    ...localData, 
                    config: {...(localData.config || {}), maxTokens: parseInt(e.target.value)}
                  })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-purple-400" />
              <Label className="text-sm font-medium text-slate-300">Memory Configuration</Label>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="memoryType" className="text-sm">Memory Type</Label>
                <Input
                  id="memoryType"
                  value={localData.memory?.type || 'Vector Store'}
                  onChange={(e) => setLocalData({
                    ...localData, 
                    memory: {...(localData.memory || {type: 'Vector Store', size: '1GB', retention: '5 years'}), type: e.target.value}
                  })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="memorySize" className="text-sm">Size</Label>
                  <Input
                    id="memorySize"
                    value={localData.memory?.size || '1GB'}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      memory: {...(localData.memory || {type: 'Vector Store', size: '1GB', retention: '5 years'}), size: e.target.value}
                    })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="retention" className="text-sm">Retention</Label>
                  <Input
                    id="retention"
                    value={localData.memory?.retention || '5 years'}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      memory: {...(localData.memory || {type: 'Vector Store', size: '1GB', retention: '5 years'}), retention: e.target.value}
                    })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="bg-slate-700/30 p-3 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">Memory Usage</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-600 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full" style={{width: '72%'}}></div>
                </div>
                <span className="text-sm text-slate-300">72%</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guardrails" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-yellow-400" />
              <Label className="text-sm font-medium text-slate-300">Safety Guardrails</Label>
            </div>
            <div className="space-y-2">
              {getGuardrails(localData.agentType).map((guardrail, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded border border-slate-600">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-yellow-400" />
                    <span className="text-sm text-slate-300">{guardrail}</span>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              ))}
            </div>
            <Separator className="bg-slate-700" />
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                <Shield className="h-5 w-5 text-green-400 mx-auto mb-1" />
                <div className="text-xs text-slate-400">Violations</div>
                <div className="text-lg font-bold text-green-400">{localData.violations || 0}</div>
              </div>
              <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                <CheckCircle className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <div className="text-xs text-slate-400">Compliance</div>
                <div className="text-lg font-bold text-blue-400">96.8%</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1 bg-orange-600 hover:bg-orange-700">
            Save Changes
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 border-slate-600 text-slate-300">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};