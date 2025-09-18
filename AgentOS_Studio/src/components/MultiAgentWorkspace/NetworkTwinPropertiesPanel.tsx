import React, { useState } from 'react';
import { X, Radio, Activity, Settings, MapPin, AlertTriangle, TrendingUp, MessageSquare, Wrench, Brain, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Node } from '@xyflow/react';

interface NetworkTwinPropertiesPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, newData: any) => void;
  onClose: () => void;
}

export const NetworkTwinPropertiesPanel = ({ node, onUpdateNode, onClose }: NetworkTwinPropertiesPanelProps) => {
  const [localData, setLocalData] = useState<any>(node.data);

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'RAN Intelligence Agent':
        return Radio;
      case 'Network Performance Monitor':
        return Activity;
      case 'Predictive Maintenance Agent':
        return Settings;
      case 'Coverage Optimization Agent':
        return MapPin;
      case 'Fault Detection Agent':
        return AlertTriangle;
      case 'Traffic Flow Optimizer':
        return TrendingUp;
      default:
        return Radio;
    }
  };

  const IconComponent = getAgentIcon(localData.agentType as string || '');

  const handleSave = () => {
    onUpdateNode(node.id, localData);
    onClose();
  };

  const updateLocalData = (key: string, value: any) => {
    setLocalData((prev: any) => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-900/20 border-green-700/30';
      case 'monitoring':
        return 'text-blue-400 bg-blue-900/20 border-blue-700/30';
      case 'analyzing':
        return 'text-purple-400 bg-purple-900/20 border-purple-700/30';
      case 'optimizing':
        return 'text-amber-400 bg-amber-900/20 border-amber-700/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-700/30';
    }
  };

  const getDefaultPrompt = (agentType: string) => {
    const prompts: Record<string, string> = {
      'RAN Intelligence Agent': 'You are a RAN Intelligence agent specialized in radio access network optimization. Monitor network performance, analyze coverage patterns, and optimize radio resources for maximum efficiency.',
      'Network Performance Monitor': 'You are a Network Performance monitoring agent. Track network KPIs, detect performance anomalies, and provide real-time insights into network health and quality of service.',
      'Predictive Maintenance Agent': 'You are a Predictive Maintenance agent for telecom networks. Analyze equipment health data, predict potential failures, and recommend proactive maintenance actions.',
      'Coverage Optimization Agent': 'You are a Coverage Optimization agent. Analyze signal strength patterns, identify coverage gaps, and recommend antenna adjustments and site placements.',
      'Fault Detection Agent': 'You are a Fault Detection agent. Monitor network elements for failures, classify fault types, and trigger appropriate remediation workflows.',
      'Traffic Flow Optimizer': 'You are a Traffic Flow optimization agent. Analyze network traffic patterns, predict congestion, and optimize routing and load balancing strategies.'
    };
    return prompts[agentType] || 'You are a Network Twin AI agent designed to assist with telecommunications network management and optimization.';
  };

  const getAvailableTools = (agentType: string) => {
    const tools: Record<string, string[]> = {
      'RAN Intelligence Agent': ['RAN Analyzer', 'Coverage Mapper', 'Signal Optimizer', 'Interference Detector'],
      'Network Performance Monitor': ['KPI Tracker', 'Latency Analyzer', 'Throughput Monitor', 'Quality Assessor'],
      'Predictive Maintenance Agent': ['Health Monitor', 'Failure Predictor', 'Maintenance Scheduler', 'Equipment Tracker'],
      'Coverage Optimization Agent': ['Signal Analyzer', 'Coverage Planner', 'Antenna Optimizer', 'Site Selector'],
      'Fault Detection Agent': ['Fault Scanner', 'Alert Generator', 'Root Cause Analyzer', 'Recovery Planner'],
      'Traffic Flow Optimizer': ['Traffic Analyzer', 'Load Balancer', 'Route Optimizer', 'Congestion Predictor']
    };
    return tools[agentType] || ['Network Scanner', 'Data Processor', 'Analytics Engine', 'Report Generator'];
  };

  const getGuardrails = (agentType: string) => {
    const guardrails: Record<string, string[]> = {
      'RAN Intelligence Agent': ['RF Safety Limits', 'Interference Protection', 'Power Control', 'Spectrum Compliance'],
      'Network Performance Monitor': ['Alert Thresholds', 'Data Privacy', 'Monitoring Bounds', 'Quality Gates'],
      'Predictive Maintenance Agent': ['Safety Protocols', 'Maintenance Windows', 'Equipment Limits', 'Service Continuity'],
      'Coverage Optimization Agent': ['RF Exposure Limits', 'Environmental Impact', 'Zoning Compliance', 'Neighbor Impact'],
      'Fault Detection Agent': ['False Positive Control', 'Escalation Rules', 'Service Protection', 'Recovery Bounds'],
      'Traffic Flow Optimizer': ['QoS Protection', 'Fair Usage', 'Network Stability', 'Service Level Agreements']
    };
    return guardrails[agentType] || ['Network Protection', 'Safety Compliance', 'Service Quality', 'Performance Bounds'];
  };

  return (
    <div className="w-96 bg-slate-800/40 backdrop-blur-lg border-l border-blue-400/20 flex flex-col">
      <div className="p-4 border-b border-blue-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-900/20">
              <IconComponent className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{localData.label as string}</h2>
              <Badge className={getStatusColor(localData.status as string)}>{localData.status as string}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
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
                value={localData.label as string || ''}
                onChange={(e) => updateLocalData('label', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localData.description as string || ''}
                onChange={(e) => updateLocalData('description', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <Separator className="bg-slate-700" />

            <div>
              <Label className="text-sm font-medium text-slate-300">Network Metrics</Label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {localData.activeSites && (
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-sm text-slate-400">Active Sites</div>
                    <div className="text-lg font-semibold text-white">{localData.activeSites as number}</div>
                  </div>
                )}
                {localData.coverageScore && (
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-sm text-slate-400">Coverage Score</div>
                    <div className="text-lg font-semibold text-green-400">{localData.coverageScore as number}%</div>
                  </div>
                )}
                {localData.kpisTracked && (
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-sm text-slate-400">KPIs Tracked</div>
                    <div className="text-lg font-semibold text-white">{localData.kpisTracked as number}</div>
                  </div>
                )}
                {localData.alertsActive && (
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-sm text-slate-400">Active Alerts</div>
                    <div className="text-lg font-semibold text-yellow-400">{localData.alertsActive as number}</div>
                  </div>
                )}
              </div>
            </div>

            {localData.capabilities && Array.isArray(localData.capabilities) && (
              <div>
                <Label className="text-sm font-medium text-slate-300">Capabilities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(localData.capabilities as string[]).map((capability: string, index: number) => (
                    <Badge key={index} variant="outline" className="border-slate-600 text-slate-400">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <Label className="text-sm font-medium text-slate-300">System Prompt</Label>
            </div>
            <Textarea
              value={localData.prompt as string || getDefaultPrompt(localData.agentType as string || '')}
              onChange={(e) => updateLocalData('prompt', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
              placeholder="Enter the system prompt for this agent..."
            />
            <div className="text-xs text-slate-400">
              Define the agent's role, capabilities, and behavior patterns for network management.
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="h-4 w-4 text-blue-400" />
              <Label className="text-sm font-medium text-slate-300">Available Tools</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {getAvailableTools(localData.agentType as string || '').map((tool, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded border border-slate-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">{tool}</span>
                </div>
              ))}
            </div>
            <Separator className="bg-slate-700" />
            <div>
              <Label htmlFor="model" className="text-sm">AI Model</Label>
              <Input
                id="model"
                value={localData.model as string || 'gpt-4'}
                onChange={(e) => updateLocalData('model', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
          </TabsContent>

          <TabsContent value="memory" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-purple-400" />
              <Label className="text-sm font-medium text-slate-300">Memory Configuration</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="memoryEnabled" className="text-slate-300">Memory Enabled</Label>
                <Switch
                  id="memoryEnabled"
                  checked={localData.memory as boolean || false}
                  onCheckedChange={(checked) => updateLocalData('memory', checked)}
                />
              </div>
              <div>
                <Label htmlFor="memoryType" className="text-sm">Memory Type</Label>
                <Input
                  id="memoryType"
                  value={localData.memoryType as string || 'Network Vector Store'}
                  onChange={(e) => updateLocalData('memoryType', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="memorySize" className="text-sm">Size</Label>
                  <Input
                    id="memorySize"
                    value={localData.memorySize as string || '1GB'}
                    onChange={(e) => updateLocalData('memorySize', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="retention" className="text-sm">Retention</Label>
                  <Input
                    id="retention"
                    value={localData.retention as string || '90 days'}
                    onChange={(e) => updateLocalData('retention', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="bg-slate-700/30 p-3 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">Memory Usage</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-600 rounded-full h-2">
                  <div className="bg-purple-400 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
                <span className="text-sm text-slate-300">45%</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guardrails" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-yellow-400" />
              <Label className="text-sm font-medium text-slate-300">Network Guardrails</Label>
            </div>
            <div className="space-y-2">
              {getGuardrails(localData.agentType as string || '').map((guardrail, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded border border-slate-600">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">{guardrail}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-700/30 p-3 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">Guardrail Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-slate-300">All guardrails active</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Separator className="bg-blue-400/20" />
      
      <div className="p-4 space-y-3">
        <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
        <Button variant="outline" onClick={onClose} className="w-full border-slate-600 text-slate-300">
          Cancel
        </Button>
      </div>
    </div>
  );
};