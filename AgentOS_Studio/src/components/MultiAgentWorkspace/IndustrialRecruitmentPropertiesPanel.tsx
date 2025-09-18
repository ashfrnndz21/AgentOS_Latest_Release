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
  UserCheck,
  Settings, 
  Shield, 
  Database,
  Brain,
  Activity,
  Search,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Wrench,
  MessageSquare,
  Lock,
  CheckCircle
} from 'lucide-react';

interface IndustrialRecruitmentPropertiesPanelProps {
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
  candidatesSourced?: number;
  resumesProcessed?: number;
  interviewsScheduled?: number;
  employeesOnboarded?: number;
  careerPathsCreated?: number;
  matchAccuracy?: string;
  responseTime?: string;
  satisfactionScore?: string;
  completionRate?: string;
  engagementRate?: string;
}

const agentIcons: Record<string, any> = {
  'Talent Sourcing Agent': Search,
  'Resume Screening Agent': FileText,
  'Interview Coordinator': Calendar,
  'Onboarding Assistant': Users,
  'Career Development Agent': TrendingUp,
  'default': UserCheck
};

export const IndustrialRecruitmentPropertiesPanel: React.FC<IndustrialRecruitmentPropertiesPanelProps> = ({
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
      case 'screening': return 'text-blue-400 bg-blue-900/20 border-blue-400/30';
      case 'coordinating': return 'text-purple-400 bg-purple-900/20 border-purple-400/30';
      case 'assisting': return 'text-cyan-400 bg-cyan-900/20 border-cyan-400/30';
      case 'developing': return 'text-emerald-400 bg-emerald-900/20 border-emerald-400/30';
      case 'orchestrating': return 'text-indigo-400 bg-indigo-900/20 border-indigo-400/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
    }
  };

  const getDefaultPrompt = (agentType: string) => {
    const prompts: Record<string, string> = {
      'Talent Sourcing Agent': 'You are a Talent Sourcing agent specialized in discovering and identifying top talent across multiple channels. Search talent databases, analyze candidate profiles, assess skills and experience, and provide market intelligence for strategic hiring decisions.',
      'Resume Screening Agent': 'You are a Resume Screening agent that analyzes resumes and candidate profiles using advanced NLP and matching algorithms. Evaluate skills, experience, cultural fit, and provide detailed candidate assessments with matching scores.',
      'Interview Coordinator': 'You are an Interview Coordinator that manages the entire interview process. Schedule interviews, coordinate with hiring panels, communicate with candidates, collect feedback, and ensure smooth interview experiences.',
      'Onboarding Assistant': 'You are an Onboarding Assistant that guides new employees through comprehensive onboarding processes. Manage documentation, coordinate training, track progress, and ensure successful integration into the organization.',
      'Career Development Agent': 'You are a Career Development agent that creates personalized career development paths and growth opportunities. Analyze skill gaps, recommend learning paths, track performance, and provide career guidance.'
    };
    return prompts[agentType] || 'You are an AI agent designed to assist with talent management and recruitment tasks.';
  };

  const getAvailableTools = (agentType: string) => {
    const tools: Record<string, string[]> = {
      'Talent Sourcing Agent': ['Multi-channel Sourcing', 'Candidate Profiling', 'Skills Assessment', 'Market Intelligence'],
      'Resume Screening Agent': ['Resume Analysis', 'Skills Matching', 'Experience Evaluation', 'Cultural Fit Assessment'],
      'Interview Coordinator': ['Interview Scheduling', 'Candidate Communication', 'Panel Coordination', 'Feedback Collection'],
      'Onboarding Assistant': ['Onboarding Workflows', 'Document Management', 'Training Coordination', 'Progress Tracking'],
      'Career Development Agent': ['Career Path Planning', 'Skill Gap Analysis', 'Learning Recommendations', 'Performance Tracking']
    };
    return tools[agentType] || ['Generic Tool', 'Data Processor', 'Analytics Engine', 'Report Generator'];
  };

  const getGuardrails = (agentType: string) => {
    const guardrails: Record<string, string[]> = {
      'Talent Sourcing Agent': ['Privacy Protection', 'GDPR Compliance', 'Bias Prevention', 'Data Security'],
      'Resume Screening Agent': ['Fair Assessment', 'Bias Detection', 'Privacy Compliance', 'Accuracy Standards'],
      'Interview Coordinator': ['Scheduling Ethics', 'Communication Standards', 'Privacy Protection', 'Process Fairness'],
      'Onboarding Assistant': ['Data Privacy', 'Process Compliance', 'Training Standards', 'Progress Monitoring'],
      'Career Development Agent': ['Development Ethics', 'Fair Opportunities', 'Privacy Protection', 'Performance Standards']
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
      'Talent Sourcing Agent': [
        { label: 'Candidates Sourced', value: localData.candidatesSourced || '1,247', color: 'text-blue-400' },
        { label: 'Match Accuracy', value: localData.matchAccuracy || '92.4%', color: 'text-green-400' }
      ],
      'Resume Screening Agent': [
        { label: 'Resumes Processed', value: localData.resumesProcessed || '3,456', color: 'text-purple-400' },
        { label: 'Response Time', value: localData.responseTime || '2.3s', color: 'text-blue-400' }
      ],
      'Interview Coordinator': [
        { label: 'Interviews Scheduled', value: localData.interviewsScheduled || '567', color: 'text-orange-400' },
        { label: 'Satisfaction Score', value: localData.satisfactionScore || '4.8/5', color: 'text-green-400' }
      ],
      'Onboarding Assistant': [
        { label: 'Employees Onboarded', value: localData.employeesOnboarded || '234', color: 'text-cyan-400' },
        { label: 'Completion Rate', value: localData.completionRate || '96.7%', color: 'text-green-400' }
      ],
      'Career Development Agent': [
        { label: 'Career Paths Created', value: localData.careerPathsCreated || '189', color: 'text-emerald-400' },
        { label: 'Engagement Rate', value: localData.engagementRate || '87.3%', color: 'text-green-400' }
      ]
    };

    const metrics = agentMetrics[localData.agentType] || [
      { label: 'Success Rate', value: '96%', color: 'text-green-400' },
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
    <div className="w-80 bg-slate-800/40 backdrop-blur-lg border-l border-indigo-400/20 flex flex-col text-white overflow-y-auto">
      <div className="p-4 border-b border-indigo-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700/30 rounded-lg">
              <IconComponent className="h-5 w-5 text-indigo-400" />
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
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              <Label className="text-sm font-medium text-slate-300">System Prompt</Label>
            </div>
            <Textarea
              value={localData.prompt || getDefaultPrompt(localData.agentType)}
              onChange={(e) => setLocalData({...localData, prompt: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
              placeholder="Enter the system prompt for this agent..."
            />
            <div className="text-xs text-slate-400">
              Define the agent's role, capabilities, and behavior patterns for talent management tasks.
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
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
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
                  value={localData.memory?.type || 'Candidate Profile Store'}
                  onChange={(e) => setLocalData({
                    ...localData, 
                    memory: {...(localData.memory || {type: 'Candidate Profile Store', size: '1.5GB', retention: '7 years'}), type: e.target.value}
                  })}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="memorySize" className="text-sm">Size</Label>
                  <Input
                    id="memorySize"
                    value={localData.memory?.size || '1.5GB'}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      memory: {...(localData.memory || {type: 'Candidate Profile Store', size: '1.5GB', retention: '7 years'}), size: e.target.value}
                    })}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="retention" className="text-sm">Retention</Label>
                  <Input
                    id="retention"
                    value={localData.memory?.retention || '7 years'}
                    onChange={(e) => setLocalData({
                      ...localData, 
                      memory: {...(localData.memory || {type: 'Candidate Profile Store', size: '1.5GB', retention: '7 years'}), retention: e.target.value}
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
                  <div className="bg-indigo-400 h-2 rounded-full" style={{width: '68%'}}></div>
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
                <div className="text-lg font-bold text-blue-400">97.2%</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
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