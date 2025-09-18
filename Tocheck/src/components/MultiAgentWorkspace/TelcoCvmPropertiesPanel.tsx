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
  Bot, 
  Settings, 
  Shield, 
  Database,
  Brain,
  Activity,
  BarChart3,
  TrendingUp,
  Target,
  Search,
  Code,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  FileText,
  Wrench,
  MessageSquare,
  Lock
} from 'lucide-react';

interface TelcoCvmPropertiesPanelProps {
  node: Node;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: any) => void;
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
  dataSources?: string;
  refreshInterval?: number;
  segmentTypes?: string;
  minSegmentSize?: number;
  channels?: string;
  budgetLimit?: number;
  riskThreshold?: number;
  predictionWindow?: number;
  prompt?: string;
  tools?: string[];
  memory?: {
    type?: string;
    size?: string;
    retention?: string;
  };
  guardrails?: string[];
}

const agentIcons: Record<string, any> = {
  'customer-data-agent': Database,
  'segmentation-agent': Target,
  'campaign-optimizer': TrendingUp,
  'churn-predictor': AlertTriangle,
  'revenue-optimizer': DollarSign,
  'performance-analyst': BarChart3,
  'cvm-memory': Brain,
  'compliance-guardrail': Shield,
  'insight-engine': Search,
  'default': Bot
};

export const TelcoCvmPropertiesPanel: React.FC<TelcoCvmPropertiesPanelProps> = ({
  node,
  onClose,
  onUpdateNode
}) => {
  const [localData, setLocalData] = useState<NodeData>(node.data as any);
  const IconComponent = agentIcons[localData.agentType] || agentIcons.default;

  const handleSave = () => {
    onUpdateNode(node.id, localData);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20 border-green-400/30';
      case 'inactive': return 'text-red-400 bg-red-900/20 border-red-400/30';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20 border-yellow-400/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
    }
  };

  const getDefaultPrompt = (agentType: string) => {
    const prompts: Record<string, string> = {
      'customer-journey-mapper': 'You are a Customer Journey Mapping agent specialized in analyzing customer touchpoints and interactions. Map comprehensive customer journeys, identify pain points, and optimize experience flows.',
      'clv-prediction-engine': 'You are a Customer Lifetime Value prediction agent. Analyze customer data to predict CLV, identify high-value segments, and recommend retention strategies.',
      'next-best-action': 'You are a Next Best Action recommendation agent. Analyze customer context and behavior to suggest optimal actions that maximize engagement and revenue.',
      'churn-prevention': 'You are a Churn Prevention agent. Identify at-risk customers, analyze churn indicators, and recommend proactive retention strategies.',
      'revenue-optimization': 'You are a Revenue Optimization agent. Analyze pricing strategies, upselling opportunities, and revenue streams to maximize customer value.',
      'campaign-performance': 'You are a Campaign Performance analysis agent. Track campaign metrics, analyze effectiveness, and optimize marketing strategies.',
      'customer-sentiment': 'You are a Customer Sentiment analysis agent. Process customer feedback, social media, and interactions to gauge sentiment and satisfaction.',
      'data-enrichment': 'You are a Data Enrichment agent. Collect, validate, and enhance customer data from multiple sources to create comprehensive profiles.'
    };
    return prompts[agentType] || 'You are an AI agent designed to assist with customer value management tasks.';
  };

  const getAvailableTools = (agentType: string) => {
    const tools: Record<string, string[]> = {
      'customer-journey-mapper': ['Journey Analyzer', 'Touchpoint Tracker', 'Experience Mapper', 'Pain Point Detector'],
      'clv-prediction-engine': ['ML Predictor', 'Cohort Analyzer', 'Value Calculator', 'Segment Profiler'],
      'next-best-action': ['Recommendation Engine', 'Context Analyzer', 'Action Optimizer', 'Engagement Tracker'],
      'churn-prevention': ['Risk Scorer', 'Pattern Detector', 'Retention Calculator', 'Alert System'],
      'revenue-optimization': ['Pricing Optimizer', 'Upsell Detector', 'Revenue Tracker', 'Opportunity Finder'],
      'campaign-performance': ['Metrics Tracker', 'A/B Tester', 'ROI Calculator', 'Performance Analyzer'],
      'customer-sentiment': ['Sentiment Analyzer', 'Text Processor', 'Social Monitor', 'Feedback Aggregator'],
      'data-enrichment': ['Data Validator', 'Source Integrator', 'Profile Builder', 'Quality Checker']
    };
    return tools[agentType] || ['Generic Tool', 'Data Processor', 'Analytics Engine', 'Report Generator'];
  };

  const getGuardrails = (agentType: string) => {
    const guardrails: Record<string, string[]> = {
      'customer-journey-mapper': ['PII Protection', 'Data Anonymization', 'Access Control', 'Journey Privacy'],
      'clv-prediction-engine': ['Bias Detection', 'Fair Modeling', 'Data Quality', 'Prediction Bounds'],
      'next-best-action': ['Ethical Recommendations', 'Customer Consent', 'Action Validation', 'Outcome Monitoring'],
      'churn-prevention': ['Privacy Compliance', 'Intervention Ethics', 'Data Retention', 'Customer Rights'],
      'revenue-optimization': ['Fair Pricing', 'Customer Value', 'Transparent Offers', 'Revenue Ethics'],
      'campaign-performance': ['Audience Protection', 'Content Moderation', 'Targeting Ethics', 'Performance Bounds'],
      'customer-sentiment': ['Sentiment Privacy', 'Content Security', 'Bias Monitoring', 'Response Ethics'],
      'data-enrichment': ['Source Validation', 'Data Accuracy', 'Privacy Shield', 'Quality Assurance']
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

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/30 p-3 rounded-lg">
          <div className="text-sm text-slate-400">Success Rate</div>
          <div className="text-lg font-semibold text-green-400">{localData.metrics?.success || 0}%</div>
        </div>
        <div className="bg-slate-700/30 p-3 rounded-lg">
          <div className="text-sm text-slate-400">Avg Response</div>
          <div className="text-lg font-semibold text-blue-400">{localData.metrics?.responseTime || 0}ms</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-l border-green-400/20 flex flex-col text-white overflow-y-auto">
      <div className="p-4 border-b border-green-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700/30 rounded-lg">
              <IconComponent className="h-5 w-5 text-green-400" />
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
              <MessageSquare className="h-4 w-4 text-green-400" />
              <Label className="text-sm font-medium text-slate-300">System Prompt</Label>
            </div>
            <Textarea
              value={localData.prompt || getDefaultPrompt(localData.agentType)}
              onChange={(e) => setLocalData({...localData, prompt: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
              placeholder="Enter the system prompt for this agent..."
            />
            <div className="text-xs text-slate-400">
              Define the agent's role, capabilities, and behavior patterns.
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
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">{tool}</span>
                </div>
              ))}
            </div>
            <Separator className="bg-slate-700" />
            <div>
              <Label htmlFor="model" className="text-sm">LLM Model</Label>
              <Input
                id="model"
                value={localData.config?.model || 'gpt-4'}
                onChange={(e) => setLocalData({
                  ...localData, 
                  config: {...(localData.config || {}), model: e.target.value}
                })}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
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
                    memory: {...(localData.memory || {type: 'Vector Store', size: '512MB', retention: '30 days'}), type: e.target.value}
                  })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="memorySize" className="text-sm">Size</Label>
                  <Input
                    id="memorySize"
                    value={localData.memory?.size || '512MB'}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      memory: {...(localData.memory || {type: 'Vector Store', size: '512MB', retention: '30 days'}), size: e.target.value}
                    })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="retention" className="text-sm">Retention</Label>
                  <Input
                    id="retention"
                    value={localData.memory?.retention || '30 days'}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      memory: {...(localData.memory || {type: 'Vector Store', size: '512MB', retention: '30 days'}), retention: e.target.value}
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
                  <div className="bg-purple-400 h-2 rounded-full" style={{width: '68%'}}></div>
                </div>
                <span className="text-sm text-slate-300">68%</span>
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
                <div className="text-lg font-bold text-blue-400">98.7%</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
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