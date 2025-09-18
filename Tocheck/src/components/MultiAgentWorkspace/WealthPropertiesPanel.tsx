import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { X, Bot, Settings, Shield, Database, Brain, Activity, BarChart3, TrendingUp, Globe, Search, Code, Zap, Clock, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WealthPropertiesPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export const WealthPropertiesPanel: React.FC<WealthPropertiesPanelProps> = ({ node, onUpdateNode, onClose }) => {
  const [localData, setLocalData] = useState(node.data);

  const updateLocalData = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onUpdateNode(node.id, newData);
  };

  // Get agent-specific configurations based on agent type
  const getAgentDefaults = () => {
    const defaults: { [key: string]: any } = {
      'market-research-agent': {
        systemPrompt: `You are an AI Market Research Agent specializing in financial markets. Your role is to:
- Continuously monitor global markets, news, and economic indicators
- Identify emerging investment opportunities and potential risks
- Analyze market sentiment and economic data
- Provide real-time market intelligence to other agents

You have access to real-time financial data sources and must prioritize accuracy and timeliness in your analysis.`,
        tools: ['Real-time News Analysis', 'Economic Data Mining', 'Sentiment Analysis', 'Risk Detection'],
        guardrails: ['Data Source Verification', 'Market Hours Validation', 'Information Accuracy Checks'],
        memoryConfig: { type: 'episodic', size: 500, retention: 7 },
        taskCompletionCriteria: 'Market data processed, trends identified, alerts generated'
      },
      'trend-analysis-agent': {
        systemPrompt: `You are a Predictive Trend Analyzer using advanced machine learning to identify market patterns. Your responsibilities:
- Analyze historical and real-time market data for patterns
- Generate predictive models for future market movements
- Provide confidence scores for predictions
- Identify cross-asset correlations and volatility patterns

Use statistical models and machine learning algorithms to ensure high-accuracy predictions.`,
        tools: ['Pattern Recognition', 'Predictive Analytics', 'Cross-Asset Analysis', 'Volatility Forecasting'],
        guardrails: ['Model Validation', 'Confidence Thresholds', 'Backtesting Requirements'],
        memoryConfig: { type: 'semantic', size: 1000, retention: 30 },
        taskCompletionCriteria: 'Patterns identified, predictions generated with confidence scores'
      },
      'investment-advisor': {
        systemPrompt: `You are a Personalized Investment Advisor focused on client-specific recommendations. Your mission:
- Analyze complete financial profiles of clients
- Generate personalized investment strategies
- Optimize portfolios for tax efficiency and risk tolerance
- Ensure recommendations align with client goals and regulations

Always prioritize fiduciary duty and regulatory compliance in your recommendations.`,
        tools: ['Portfolio Analysis', 'Risk Assessment', 'Tax Optimization', 'Goal-Based Planning'],
        guardrails: ['Suitability Checks', 'Regulatory Compliance', 'Risk Tolerance Validation'],
        memoryConfig: { type: 'long-term', size: 800, retention: 365 },
        taskCompletionCriteria: 'Portfolio analyzed, recommendations generated, compliance verified'
      },
      'risk-sentinel': {
        systemPrompt: `You are an AI Risk Sentinel responsible for comprehensive risk monitoring. Your duties:
- Monitor global events and their potential market impact
- Analyze portfolio correlations and concentration risks
- Detect black swan events and stress test scenarios
- Generate real-time risk alerts and mitigation strategies

Maintain constant vigilance and provide early warning systems for all risk factors.`,
        tools: ['Geopolitical Analysis', 'Correlation Monitoring', 'Stress Testing', 'Black Swan Detection'],
        guardrails: ['Risk Limit Enforcement', 'Alert Threshold Management', 'False Positive Reduction'],
        memoryConfig: { type: 'episodic', size: 600, retention: 90 },
        taskCompletionCriteria: 'Risk factors monitored, alerts generated, mitigation strategies provided'
      },
      'web-intelligence-agent': {
        systemPrompt: `You are a Web Intelligence Aggregator gathering market sentiment and intelligence. Your scope:
- Crawl financial websites, forums, and social media for market sentiment
- Track insider trading patterns and unusual market activity
- Monitor regulatory announcements and policy changes
- Analyze social sentiment and its market impact

Ensure data quality and source reliability in all intelligence gathering.`,
        tools: ['Social Sentiment Analysis', 'Forum Monitoring', 'Insider Activity Tracking', 'Regulatory Monitoring'],
        guardrails: ['Source Reliability Checks', 'Information Quality Validation', 'Legal Compliance'],
        memoryConfig: { type: 'short-term', size: 300, retention: 14 },
        taskCompletionCriteria: 'Intelligence gathered, sentiment analyzed, signals generated'
      },
      'financial-health': {
        systemPrompt: `You are a Proactive Wealth Optimizer managing overall financial health. Your objectives:
- Monitor client portfolios across all accounts and assets
- Identify tax loss harvesting and optimization opportunities
- Implement automated rebalancing strategies
- Optimize cash management and asset allocation

Focus on maximizing after-tax returns while maintaining appropriate risk levels.`,
        tools: ['Multi-Account Analysis', 'Tax Loss Harvesting', 'Automated Rebalancing', 'Cash Management'],
        guardrails: ['Portfolio Limit Enforcement', 'Tax Compliance', 'Rebalancing Thresholds'],
        memoryConfig: { type: 'long-term', size: 1200, retention: 365 },
        taskCompletionCriteria: 'Optimization opportunities identified, actions executed, performance tracked'
      }
    };

    return defaults[node.id] || defaults['market-research-agent'];
  };

  const agentDefaults = getAgentDefaults();
  const currentData = { ...agentDefaults, ...localData };

  const renderAgentOverview = () => (
    <div className="space-y-4">
      <Card className="bg-slate-800/30 border-purple-400/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Bot className="h-4 w-4 text-purple-400" />
            Agent Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-400">Status</Label>
              <Badge className={`mt-1 ${
                currentData.status === 'active' ? 'bg-green-900/20 text-green-300' :
                currentData.status === 'analyzing' ? 'bg-blue-900/20 text-blue-300' :
                'bg-amber-900/20 text-amber-300'
              }`}>
                {currentData.status || 'Active'}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Model</Label>
              <p className="text-xs text-white mt-1">{currentData.model || 'GPT-4o'}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-slate-400">Description</Label>
            <p className="text-xs text-slate-300 mt-1">{currentData.description}</p>
          </div>
          
          {currentData.confidence && (
            <div>
              <Label className="text-xs text-slate-400">Confidence Score</Label>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={currentData.confidence} className="flex-1 h-2" />
                <span className="text-xs text-green-400">{currentData.confidence}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemPrompt = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-white">System Prompt</Label>
        <Textarea
          value={currentData.systemPrompt || agentDefaults.systemPrompt}
          onChange={(e) => updateLocalData('systemPrompt', e.target.value)}
          className="bg-slate-800/30 border-purple-400/20 text-white text-xs mt-2 min-h-[200px]"
          placeholder="Define the agent's role and behavior..."
        />
      </div>
      
      <div>
        <Label className="text-sm text-white">Reasoning Strategy</Label>
        <Select 
          value={currentData.reasoning || 'chain-of-thought'} 
          onValueChange={(value) => updateLocalData('reasoning', value)}
        >
          <SelectTrigger className="bg-slate-800/30 border-purple-400/20 text-white mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-purple-400/20">
            <SelectItem value="chain-of-thought">Chain of Thought</SelectItem>
            <SelectItem value="tree-of-thought">Tree of Thought</SelectItem>
            <SelectItem value="analytical">Analytical Reasoning</SelectItem>
            <SelectItem value="predictive">Predictive Analysis</SelectItem>
            <SelectItem value="risk-aware">Risk-Aware Reasoning</SelectItem>
            <SelectItem value="optimization">Optimization-Focused</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-white mb-3 block">Available Tools</Label>
        <div className="space-y-2">
          {(currentData.tools || agentDefaults.tools || []).map((tool: string, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-slate-800/30 rounded border border-purple-400/20">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-white">{tool}</span>
              </div>
              <Switch
                checked={true}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="text-sm text-white">Tool Execution Timeout (seconds)</Label>
        <Input
          type="number"
          value={currentData.toolTimeout || 30}
          onChange={(e) => updateLocalData('toolTimeout', parseInt(e.target.value))}
          className="bg-slate-800/30 border-purple-400/20 text-white mt-2"
        />
      </div>
    </div>
  );

  const renderMemoryConfiguration = () => (
    <div className="space-y-4">
      <Card className="bg-slate-800/30 border-purple-400/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-400" />
            Memory Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-400">Type</Label>
              <Select 
                value={currentData.memoryConfig?.type || agentDefaults.memoryConfig.type}
                onValueChange={(value) => updateLocalData('memoryConfig', { ...currentData.memoryConfig, type: value })}
              >
                <SelectTrigger className="bg-slate-700/30 border-slate-600 text-white text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="short-term">Short-term</SelectItem>
                  <SelectItem value="long-term">Long-term</SelectItem>
                  <SelectItem value="episodic">Episodic</SelectItem>
                  <SelectItem value="semantic">Semantic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Size (MB)</Label>
              <Input
                type="number"
                value={currentData.memoryConfig?.size || agentDefaults.memoryConfig.size}
                onChange={(e) => updateLocalData('memoryConfig', { 
                  ...currentData.memoryConfig, 
                  size: parseInt(e.target.value) 
                })}
                className="bg-slate-700/30 border-slate-600 text-white text-xs mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-slate-400">Retention (days)</Label>
            <Input
              type="number"
              value={currentData.memoryConfig?.retention || agentDefaults.memoryConfig.retention}
              onChange={(e) => updateLocalData('memoryConfig', { 
                ...currentData.memoryConfig, 
                retention: parseInt(e.target.value) 
              })}
              className="bg-slate-700/30 border-slate-600 text-white text-xs mt-1"
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Label className="text-xs text-slate-400">Persistent Storage</Label>
            <Switch
              checked={currentData.memory || true}
              onCheckedChange={(checked) => updateLocalData('memory', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGuardrails = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-white mb-3 block">Active Guardrails</Label>
        <div className="space-y-2">
          {(currentData.guardrails || agentDefaults.guardrails || []).map((guardrail: string, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-slate-800/30 rounded border border-amber-400/20">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-white">{guardrail}</span>
              </div>
              <Badge className="bg-green-900/20 text-green-300 text-xs">Active</Badge>
            </div>
          ))}
        </div>
      </div>
      
      <Card className="bg-slate-800/30 border-amber-400/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-white">Enforcement Level</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={currentData.enforcementLevel || 'strict'}
            onValueChange={(value) => updateLocalData('enforcementLevel', value)}
          >
            <SelectTrigger className="bg-slate-700/30 border-slate-600 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="advisory">Advisory</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="strict">Strict</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );

  const renderTaskCompletion = () => (
    <div className="space-y-4">
      <Card className="bg-slate-800/30 border-green-400/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-green-400" />
            Task Completion Design
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-slate-400">Completion Criteria</Label>
            <Textarea
              value={currentData.taskCompletionCriteria || agentDefaults.taskCompletionCriteria}
              onChange={(e) => updateLocalData('taskCompletionCriteria', e.target.value)}
              className="bg-slate-700/30 border-slate-600 text-white text-xs mt-1 min-h-[60px]"
              placeholder="Define when the task is considered complete..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-400">Max Execution Time (min)</Label>
              <Input
                type="number"
                value={currentData.maxExecutionTime || 15}
                onChange={(e) => updateLocalData('maxExecutionTime', parseInt(e.target.value))}
                className="bg-slate-700/30 border-slate-600 text-white text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Retry Attempts</Label>
              <Input
                type="number"
                value={currentData.maxRetries || 3}
                onChange={(e) => updateLocalData('maxRetries', parseInt(e.target.value))}
                className="bg-slate-700/30 border-slate-600 text-white text-xs mt-1"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Label className="text-xs text-slate-400">Auto-restart on Failure</Label>
            <Switch
              checked={currentData.autoRestart || false}
              onCheckedChange={(checked) => updateLocalData('autoRestart', checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      <div>
        <Label className="text-sm text-white">Success Metrics</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="text-center p-2 bg-green-900/20 rounded border border-green-400/20">
            <div className="text-lg font-bold text-green-400">96%</div>
            <div className="text-xs text-green-300">Success Rate</div>
          </div>
          <div className="text-center p-2 bg-blue-900/20 rounded border border-blue-400/20">
            <div className="text-lg font-bold text-blue-400">0.8s</div>
            <div className="text-xs text-blue-300">Avg Response</div>
          </div>
        </div>
      </div>
    </div>
  );

  const getIcon = () => {
    const iconMap: { [key: string]: any } = {
      'market-research-agent': Search,
      'trend-analysis-agent': BarChart3,
      'investment-advisor': TrendingUp,
      'risk-sentinel': Shield,
      'web-intelligence-agent': Globe,
      'financial-health': Activity,
      'wealth-decision-hub': Brain,
      'wealth-memory-core': Database,
      'compliance-guardrail': Shield
    };
    
    const IconComponent = iconMap[node.id] || Bot;
    return <IconComponent className="h-5 w-5 text-purple-400" />;
  };

  return (
    <div className="w-96 bg-slate-800/40 backdrop-blur-lg border-l border-purple-400/20 flex flex-col">
      <div className="p-4 border-b border-purple-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <div>
              <h2 className="text-sm font-semibold text-white">{currentData.label}</h2>
              <p className="text-xs text-purple-300">{node.type} configuration</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-purple-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700/30 m-2">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">Tasks</TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="overview" className="mt-0">
              {renderAgentOverview()}
            </TabsContent>
            
            <TabsContent value="config" className="mt-0">
              <Tabs defaultValue="prompt" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-700/30 mb-4">
                  <TabsTrigger value="prompt" className="text-xs">Prompt</TabsTrigger>
                  <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
                  <TabsTrigger value="memory" className="text-xs">Memory</TabsTrigger>
                  <TabsTrigger value="guards" className="text-xs">Guards</TabsTrigger>
                </TabsList>
                
                <TabsContent value="prompt">{renderSystemPrompt()}</TabsContent>
                <TabsContent value="tools">{renderTools()}</TabsContent>
                <TabsContent value="memory">{renderMemoryConfiguration()}</TabsContent>
                <TabsContent value="guards">{renderGuardrails()}</TabsContent>
              </Tabs>
            </TabsContent>
            
            <TabsContent value="performance" className="mt-0">
              {renderTaskCompletion()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};