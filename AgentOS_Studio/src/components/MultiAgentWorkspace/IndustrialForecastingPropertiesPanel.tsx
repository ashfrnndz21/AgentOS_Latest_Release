import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Node } from '@xyflow/react';
import { 
  X, 
  DollarSign,
  Settings, 
  Shield, 
  Database,
  Brain,
  Activity,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Globe,
  Target,
  Wrench,
  MessageSquare,
  Lock,
  CheckCircle
} from 'lucide-react';

interface IndustrialForecastingPropertiesPanelProps {
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
  marketsTracked?: number;
  forecastHorizon?: string;
  scenariosActive?: number;
  riskFactors?: number;
  indicatorsTracked?: number;
  projectsAnalyzed?: number;
  accuracy?: string;
  confidence?: string;
  probabilityRange?: string;
  riskLevel?: string;
  updateFrequency?: string;
  avgROI?: string;
}

const agentIcons: Record<string, any> = {
  'Market Intelligence Agent': Globe,
  'Financial Forecasting Agent': TrendingUp,
  'Scenario Analysis Agent': BarChart3,
  'Risk Assessment Agent': AlertTriangle,
  'Economic Indicator Agent': Target,
  'Project Finance Agent': DollarSign,
  'default': DollarSign
};

export const IndustrialForecastingPropertiesPanel: React.FC<IndustrialForecastingPropertiesPanelProps> = ({
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
      case 'forecasting': return 'text-blue-400 bg-blue-900/20 border-blue-400/30';
      case 'modeling': return 'text-purple-400 bg-purple-900/20 border-purple-400/30';
      case 'assessing': return 'text-red-400 bg-red-900/20 border-red-400/30';
      case 'monitoring': return 'text-cyan-400 bg-cyan-900/20 border-cyan-400/30';
      case 'analyzing': return 'text-emerald-400 bg-emerald-900/20 border-emerald-400/30';
      case 'orchestrating': return 'text-indigo-400 bg-indigo-900/20 border-indigo-400/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
    }
  };

  const getDefaultPrompt = (agentType: string) => {
    const prompts: Record<string, string> = {
      'Market Intelligence Agent': 'You are a Market Intelligence agent specialized in analyzing market conditions, trends, and competitive landscape. Monitor market data, detect emerging trends, analyze competitor activities, and provide insights for accurate financial forecasting.',
      'Financial Forecasting Agent': 'You are a Financial Forecasting agent that generates accurate financial predictions using advanced statistical and machine learning models. Perform time series analysis, regression modeling, Monte Carlo simulations, and predictive analytics.',
      'Scenario Analysis Agent': 'You are a Scenario Analysis agent that creates and analyzes multiple financial scenarios for comprehensive planning. Develop scenario models, conduct stress testing, perform sensitivity analysis, and execute what-if scenarios.',
      'Risk Assessment Agent': 'You are a Risk Assessment agent that identifies and quantifies financial risks across multiple dimensions. Calculate risk scores, perform VaR analysis, assess credit/market/operational risks, and provide risk mitigation strategies.',
      'Economic Indicator Agent': 'You are an Economic Indicator agent that monitors and analyzes key economic indicators affecting financial forecasts. Track economic data, analyze correlations, identify leading indicators, and assess economic impact.',
      'Project Finance Agent': 'You are a Project Finance agent that analyzes project financials and investment opportunities. Perform NPV analysis, calculate IRR, model cash flows, optimize capital structure, and evaluate investment returns.'
    };
    return prompts[agentType] || 'You are an AI agent designed to assist with financial forecasting and scenario analysis tasks.';
  };

  const getAvailableTools = (agentType: string) => {
    const tools: Record<string, string[]> = {
      'Market Intelligence Agent': ['Market Analysis', 'Trend Detection', 'Competitor Intelligence', 'Price Monitoring'],
      'Financial Forecasting Agent': ['Time Series Analysis', 'Regression Models', 'Monte Carlo Simulation', 'Predictive Analytics'],
      'Scenario Analysis Agent': ['Scenario Modeling', 'Stress Testing', 'Sensitivity Analysis', 'What-If Analysis'],
      'Risk Assessment Agent': ['Risk Scoring', 'VaR Calculation', 'Credit Risk', 'Market Risk', 'Operational Risk'],
      'Economic Indicator Agent': ['Economic Monitoring', 'Indicator Analysis', 'Correlation Detection', 'Leading Indicators'],
      'Project Finance Agent': ['NPV Analysis', 'IRR Calculation', 'Cash Flow Modeling', 'Capital Structure']
    };
    return tools[agentType] || ['Generic Tool', 'Data Processor', 'Analytics Engine', 'Report Generator'];
  };

  const getGuardrails = (agentType: string) => {
    const guardrails: Record<string, string[]> = {
      'Market Intelligence Agent': ['Data Accuracy', 'Market Compliance', 'Source Verification', 'Information Security'],
      'Financial Forecasting Agent': ['Model Validation', 'Forecast Bounds', 'Statistical Significance', 'Accuracy Thresholds'],
      'Scenario Analysis Agent': ['Scenario Validation', 'Probability Bounds', 'Realistic Assumptions', 'Model Constraints'],
      'Risk Assessment Agent': ['Risk Limits', 'Regulatory Compliance', 'Model Validation', 'Risk Thresholds'],
      'Economic Indicator Agent': ['Data Quality', 'Source Verification', 'Update Frequency', 'Correlation Validity'],
      'Project Finance Agent': ['Financial Standards', 'Approval Workflows', 'Calculation Accuracy', 'Regulatory Compliance']
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
      'Market Intelligence Agent': [
        { label: 'Markets Tracked', value: localData.marketsTracked || '47', color: 'text-blue-400' },
        { label: 'Accuracy', value: localData.accuracy || '94.2%', color: 'text-green-400' }
      ],
      'Financial Forecasting Agent': [
        { label: 'Forecast Horizon', value: localData.forecastHorizon || '24 months', color: 'text-purple-400' },
        { label: 'Confidence', value: localData.confidence || '89.7%', color: 'text-green-400' }
      ],
      'Scenario Analysis Agent': [
        { label: 'Active Scenarios', value: localData.scenariosActive || '12', color: 'text-orange-400' },
        { label: 'Probability Range', value: localData.probabilityRange || '95% CI', color: 'text-blue-400' }
      ],
      'Risk Assessment Agent': [
        { label: 'Risk Factors', value: localData.riskFactors || '23', color: 'text-red-400' },
        { label: 'Risk Level', value: localData.riskLevel || 'Medium', color: 'text-yellow-400' }
      ],
      'Economic Indicator Agent': [
        { label: 'Indicators Tracked', value: localData.indicatorsTracked || '156', color: 'text-cyan-400' },
        { label: 'Update Frequency', value: localData.updateFrequency || 'Real-time', color: 'text-green-400' }
      ],
      'Project Finance Agent': [
        { label: 'Projects Analyzed', value: localData.projectsAnalyzed || '34', color: 'text-emerald-400' },
        { label: 'Avg ROI', value: localData.avgROI || '18.7%', color: 'text-green-400' }
      ]
    };

    const metrics = agentMetrics[localData.agentType] || [
      { label: 'Success Rate', value: '91%', color: 'text-green-400' },
      { label: 'Avg Response', value: '180ms', color: 'text-blue-400' }
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
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-l border-yellow-400/20 flex flex-col text-white overflow-y-auto">
      <div className="p-4 border-b border-yellow-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700/30 rounded-lg">
              <IconComponent className="h-5 w-5 text-yellow-400" />
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
              <MessageSquare className="h-4 w-4 text-yellow-400" />
              <Label className="text-sm font-medium text-slate-300">System Prompt</Label>
            </div>
            <Textarea
              value={localData.prompt || getDefaultPrompt(localData.agentType)}
              onChange={(e) => setLocalData({...localData, prompt: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
              placeholder="Enter the system prompt for this agent..."
            />
            <div className="text-xs text-slate-400">
              Define the agent's role, capabilities, and behavior patterns for financial forecasting tasks.
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
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
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
                  <SelectItem value="llama-3-1-70b" className="text-white">Llama 3.1 70B</SelectItem>
                  <SelectItem value="mixtral-8x7b" className="text-white">Mixtral 8x7B</SelectItem>
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
                  value={localData.memory?.type || 'Time Series Store'}
                  onChange={(e) => setLocalData({
                    ...localData, 
                    memory: {...(localData.memory || {type: 'Time Series Store', size: '2GB', retention: '10 years'}), type: e.target.value}
                  })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="memorySize" className="text-sm">Size</Label>
                  <Input
                    id="memorySize"
                    value={localData.memory?.size || '2GB'}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      memory: {...(localData.memory || {type: 'Time Series Store', size: '2GB', retention: '10 years'}), size: e.target.value}
                    })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="retention" className="text-sm">Retention</Label>
                  <Input
                    id="retention"
                    value={localData.memory?.retention || '10 years'}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      memory: {...(localData.memory || {type: 'Time Series Store', size: '2GB', retention: '10 years'}), retention: e.target.value}
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
                  <div className="bg-yellow-400 h-2 rounded-full" style={{width: '76%'}}></div>
                </div>
                <span className="text-sm text-slate-300">76%</span>
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
                <div className="text-lg font-bold text-blue-400">94.8%</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
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