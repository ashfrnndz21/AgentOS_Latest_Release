/**
 * Enhanced Node Configuration Dialog
 * Provides real configuration options for workflow nodes
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Brain, 
  Bot, 
  Settings, 
  Zap, 
  Eye, 
  BarChart3,
  Shield,
  Clock,
  Database,
  GitBranch,
  Users,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

import { StrandsWorkflowNode } from '@/lib/services/StrandsWorkflowOrchestrator';

interface EnhancedNodeConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  node: StrandsWorkflowNode | null;
  onSave: (nodeId: string, config: any) => void;
}

export const EnhancedNodeConfigDialog: React.FC<EnhancedNodeConfigDialogProps> = ({
  isOpen,
  onClose,
  node,
  onSave
}) => {
  const [config, setConfig] = useState<any>({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (node) {
      setConfig(node.data || {});
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      onSave(node.id, config);
      onClose();
    }
  };

  const updateConfig = (updates: any) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  if (!node) return null;

  const renderAgentConfiguration = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Agent Name</Label>
              <Input
                value={config.name || ''}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="Enter agent name"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={config.description || ''}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Describe what this agent does"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Model</Label>
                <Select value={config.model} onValueChange={(value) => updateConfig({ model: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llama3.2:3b">Llama 3.2 3B</SelectItem>
                    <SelectItem value="llama3.2:7b">Llama 3.2 7B</SelectItem>
                    <SelectItem value="llama3.2:70b">Llama 3.2 70B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Temperature: {config.temperature || 0.7}</Label>
                <Slider
                  value={[config.temperature || 0.7]}
                  onValueChange={(value) => updateConfig({ temperature: value[0] })}
                  max={2}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={config.max_tokens || 1000}
                onChange={(e) => updateConfig({ max_tokens: parseInt(e.target.value) })}
                min={100}
                max={4000}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reasoning" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Strands Reasoning Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Reasoning Pattern</Label>
              <Select 
                value={config.reasoning_pattern} 
                onValueChange={(value) => updateConfig({ reasoning_pattern: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reasoning pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential - Step by step processing</SelectItem>
                  <SelectItem value="adaptive">Adaptive - Adjusts based on complexity</SelectItem>
                  <SelectItem value="parallel">Parallel - Concurrent processing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Reflection</Label>
                <p className="text-sm text-gray-500">Allow agent to reflect on its reasoning</p>
              </div>
              <Switch
                checked={config.reflection_enabled || false}
                onCheckedChange={(checked) => updateConfig({ reflection_enabled: checked })}
              />
            </div>

            <div>
              <Label>Chain of Thought Depth: {config.chain_of_thought_depth || 3}</Label>
              <Slider
                value={[config.chain_of_thought_depth || 3]}
                onValueChange={(value) => updateConfig({ chain_of_thought_depth: value[0] })}
                max={10}
                min={1}
                step={1}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum reasoning steps the agent can take
              </p>
            </div>

            <div>
              <Label>Context Management</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserve-memory"
                    checked={config.preserve_memory || false}
                    onCheckedChange={(checked) => updateConfig({ preserve_memory: checked })}
                  />
                  <Label htmlFor="preserve-memory">Preserve memory across executions</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="context-compression"
                    checked={config.context_compression || false}
                    onCheckedChange={(checked) => updateConfig({ context_compression: checked })}
                  />
                  <Label htmlFor="context-compression">Enable context compression</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tools" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Tool Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Available Tools</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  'database_query',
                  'web_search', 
                  'file_system',
                  'api_calls',
                  'knowledge_base',
                  'calculation'
                ].map((tool) => (
                  <div key={tool} className="flex items-center space-x-2">
                    <Checkbox
                      id={tool}
                      checked={config.enabled_tools?.includes(tool) || false}
                      onCheckedChange={(checked) => {
                        const currentTools = config.enabled_tools || [];
                        const newTools = checked 
                          ? [...currentTools, tool]
                          : currentTools.filter(t => t !== tool);
                        updateConfig({ enabled_tools: newTools });
                      }}
                    />
                    <Label htmlFor={tool} className="capitalize">
                      {tool.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Tool Selection Strategy</Label>
              <Select 
                value={config.tool_selection_strategy} 
                onValueChange={(value) => updateConfig({ tool_selection_strategy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic - Agent chooses tools</SelectItem>
                  <SelectItem value="explicit">Explicit - Predefined tool sequence</SelectItem>
                  <SelectItem value="user_choice">User Choice - Manual selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Timeout (seconds)</Label>
                <Input
                  type="number"
                  value={config.timeout_seconds || 30}
                  onChange={(e) => updateConfig({ timeout_seconds: parseInt(e.target.value) })}
                  min={5}
                  max={300}
                />
              </div>

              <div>
                <Label>Retry Attempts</Label>
                <Input
                  type="number"
                  value={config.retry_attempts || 3}
                  onChange={(e) => updateConfig({ retry_attempts: parseInt(e.target.value) })}
                  min={0}
                  max={10}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Telemetry</Label>
                <p className="text-sm text-gray-500">Collect performance metrics</p>
              </div>
              <Switch
                checked={config.telemetry_enabled || false}
                onCheckedChange={(checked) => updateConfig({ telemetry_enabled: checked })}
              />
            </div>

            <div>
              <Label>Log Level</Label>
              <Select 
                value={config.log_level} 
                onValueChange={(value) => updateConfig({ log_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - Essential logs only</SelectItem>
                  <SelectItem value="detailed">Detailed - Comprehensive logging</SelectItem>
                  <SelectItem value="debug">Debug - Full trace information</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const renderDecisionConfiguration = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Decision Logic Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Decision Type</Label>
            <Select 
              value={config.decision_type} 
              onValueChange={(value) => updateConfig({ decision_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select decision type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rule_based">Rule-Based - Condition evaluation</SelectItem>
                <SelectItem value="agent_based">Agent-Based - AI decision making</SelectItem>
                <SelectItem value="ml_based">ML-Based - Machine learning model</SelectItem>
                <SelectItem value="hybrid">Hybrid - Combined approach</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.decision_type === 'rule_based' && (
            <div>
              <Label>Conditions</Label>
              <div className="space-y-2 mt-2">
                {(config.conditions || []).map((condition, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <Select 
                      value={condition.field} 
                      onValueChange={(value) => {
                        const newConditions = [...(config.conditions || [])];
                        newConditions[index] = { ...condition, field: value };
                        updateConfig({ conditions: newConditions });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confidence">Confidence</SelectItem>
                        <SelectItem value="intent">Intent</SelectItem>
                        <SelectItem value="urgency">Urgency</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={condition.operator} 
                      onValueChange={(value) => {
                        const newConditions = [...(config.conditions || [])];
                        newConditions[index] = { ...condition, operator: value };
                        updateConfig({ conditions: newConditions });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={condition.value || ''}
                      onChange={(e) => {
                        const newConditions = [...(config.conditions || [])];
                        newConditions[index] = { ...condition, value: e.target.value };
                        updateConfig({ conditions: newConditions });
                      }}
                      placeholder="Value"
                      className="w-24"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newConditions = (config.conditions || []).filter((_, i) => i !== index);
                        updateConfig({ conditions: newConditions });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const newConditions = [...(config.conditions || []), {
                      field: 'confidence',
                      operator: 'greater_than',
                      value: '0.8',
                      weight: 1.0
                    }];
                    updateConfig({ conditions: newConditions });
                  }}
                >
                  Add Condition
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label>Confidence Threshold: {config.confidence_threshold || 0.8}</Label>
            <Slider
              value={[config.confidence_threshold || 0.8]}
              onValueChange={(value) => updateConfig({ confidence_threshold: value[0] })}
              max={1}
              min={0}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Fallback Path</Label>
            <Input
              value={config.fallback_path || ''}
              onChange={(e) => updateConfig({ fallback_path: e.target.value })}
              placeholder="Node ID for fallback"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNodeTypeConfiguration = () => {
    switch (node.type) {
      case 'strands-agent':
        return renderAgentConfiguration();
      case 'strands-decision':
        return renderDecisionConfiguration();
      default:
        return (
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Configuration options for this node type are coming soon.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700 text-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-400" />
            Configure {node.data?.name || 'Node'}
          </DialogTitle>
          <p className="text-sm text-gray-400">
            Configure this {node.type?.replace('strands-', '')} node for your workflow
          </p>
        </DialogHeader>

        <div className="py-4">
          {renderNodeTypeConfiguration()}
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfig(node.data || {})}>
              Reset
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};