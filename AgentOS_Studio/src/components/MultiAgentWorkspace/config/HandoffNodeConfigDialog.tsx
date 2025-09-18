import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ArrowRight, Users } from 'lucide-react';
import { HandoffNodeConfig, BaseCondition } from '@/types/WorkflowUtilityTypes';

interface HandoffNodeConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: HandoffNodeConfig) => void;
  initialConfig?: HandoffNodeConfig;
  availableAgents: Array<{ id: string; name: string; expertise?: string[]; }>;
}

export const HandoffNodeConfigDialog: React.FC<HandoffNodeConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  availableAgents = []
}) => {
  const [config, setConfig] = useState<HandoffNodeConfig>({
    id: initialConfig?.id || `handoff-${Date.now()}`,
    name: initialConfig?.name || 'Agent Handoff',
    strategy: initialConfig?.strategy || 'expertise_based',
    sourceAgent: initialConfig?.sourceAgent || '',
    targetAgents: initialConfig?.targetAgents || [],
    contextHandling: initialConfig?.contextHandling || {
      preservation: 'full',
      compressionRatio: 1.0,
      keyFields: []
    },
    fallbackStrategy: initialConfig?.fallbackStrategy || {
      action: 'route_to_human',
      target: 'support-queue'
    },
    timeout: initialConfig?.timeout || 30,
    description: initialConfig?.description || ''
  });

  const addTargetAgent = () => {
    const availableAgent = availableAgents.find(agent => 
      !config.targetAgents.some(target => target.agentId === agent.id)
    );
    
    if (availableAgent) {
      setConfig(prev => ({
        ...prev,
        targetAgents: [...prev.targetAgents, {
          agentId: availableAgent.id,
          agentName: availableAgent.name,
          weight: 1.0,
          conditions: []
        }]
      }));
    }
  };

  const removeTargetAgent = (index: number) => {
    setConfig(prev => ({
      ...prev,
      targetAgents: prev.targetAgents.filter((_, i) => i !== index)
    }));
  };

  const updateTargetAgent = (index: number, updates: any) => {
    setConfig(prev => ({
      ...prev,
      targetAgents: prev.targetAgents.map((agent, i) => 
        i === index ? { ...agent, ...updates } : agent
      )
    }));
  };

  const addConditionToAgent = (agentIndex: number) => {
    const newCondition: BaseCondition = {
      id: `condition-${Date.now()}`,
      field: 'content',
      operator: 'contains',
      value: ''
    };
    
    updateTargetAgent(agentIndex, {
      conditions: [...(config.targetAgents[agentIndex].conditions || []), newCondition]
    });
  };

  const handleSave = () => {
    if (config.name.trim() && config.targetAgents.length > 0) {
      onSave(config);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-400" />
            Configure Handoff Node
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Node Name
              </label>
              <Input
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter handoff node name"
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Handoff Strategy
              </label>
              <Select
                value={config.strategy}
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, strategy: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expertise_based">Expertise Based</SelectItem>
                  <SelectItem value="load_balanced">Load Balanced</SelectItem>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                  <SelectItem value="manual">Manual Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Description (Optional)
            </label>
            <Input
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the handoff logic"
              className="bg-gray-800 border-gray-600"
            />
          </div>

          {/* Source Agent */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Source Agent (Optional)
            </label>
            <Select
              value={config.sourceAgent || 'any'}
              onValueChange={(value) => setConfig(prev => ({ ...prev, sourceAgent: value === 'any' ? undefined : value }))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue placeholder="Any agent (leave empty for any source)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Agent</SelectItem>
                {availableAgents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Agents */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Target Agents</h3>
              <Button 
                onClick={addTargetAgent} 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={config.targetAgents.length >= availableAgents.length}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Target Agent
              </Button>
            </div>

            {config.targetAgents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No target agents defined. Add at least one target agent.
              </div>
            ) : (
              <div className="space-y-4">
                {config.targetAgents.map((targetAgent, index) => (
                  <div key={targetAgent.agentId} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-400" />
                        <span className="font-medium text-white">{targetAgent.agentName}</span>
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          Target {index + 1}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTargetAgent(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {config.strategy === 'load_balanced' && (
                      <div className="mb-4">
                        <label className="text-sm text-gray-400 mb-2 block">
                          Weight: {targetAgent.weight?.toFixed(1) || 1.0}
                        </label>
                        <Slider
                          value={[targetAgent.weight || 1.0]}
                          onValueChange={([value]) => updateTargetAgent(index, { weight: value })}
                          min={0.1}
                          max={2.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    )}

                    {config.strategy === 'conditional' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-400">Routing Conditions</label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addConditionToAgent(index)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Condition
                          </Button>
                        </div>

                        {(targetAgent.conditions || []).map((condition, condIndex) => (
                          <div key={condition.id} className="bg-gray-700 p-3 rounded border border-gray-600">
                            <div className="grid grid-cols-3 gap-3">
                              <Select
                                value={condition.field}
                                onValueChange={(value: any) => {
                                  const updatedConditions = [...(targetAgent.conditions || [])];
                                  updatedConditions[condIndex] = { ...condition, field: value };
                                  updateTargetAgent(index, { conditions: updatedConditions });
                                }}
                              >
                                <SelectTrigger className="bg-gray-600 border-gray-500 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="content">Content</SelectItem>
                                  <SelectItem value="topic">Topic</SelectItem>
                                  <SelectItem value="confidence">Confidence</SelectItem>
                                  <SelectItem value="user_intent">User Intent</SelectItem>
                                </SelectContent>
                              </Select>

                              <Select
                                value={condition.operator}
                                onValueChange={(value: any) => {
                                  const updatedConditions = [...(targetAgent.conditions || [])];
                                  updatedConditions[condIndex] = { ...condition, operator: value };
                                  updateTargetAgent(index, { conditions: updatedConditions });
                                }}
                              >
                                <SelectTrigger className="bg-gray-600 border-gray-500 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="contains">Contains</SelectItem>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="greater_than">Greater Than</SelectItem>
                                  <SelectItem value="less_than">Less Than</SelectItem>
                                </SelectContent>
                              </Select>

                              <div className="flex gap-2">
                                <Input
                                  value={condition.value}
                                  onChange={(e) => {
                                    const updatedConditions = [...(targetAgent.conditions || [])];
                                    updatedConditions[condIndex] = { ...condition, value: e.target.value };
                                    updateTargetAgent(index, { conditions: updatedConditions });
                                  }}
                                  placeholder="Value"
                                  className="bg-gray-600 border-gray-500 text-sm"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const updatedConditions = (targetAgent.conditions || []).filter((_, i) => i !== condIndex);
                                    updateTargetAgent(index, { conditions: updatedConditions });
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Context Handling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Context Handling</h3>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Context Preservation</label>
                <Select
                  value={config.contextHandling.preservation}
                  onValueChange={(value: any) => setConfig(prev => ({
                    ...prev,
                    contextHandling: { ...prev.contextHandling, preservation: value }
                  }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Context</SelectItem>
                    <SelectItem value="summary">Summary Only</SelectItem>
                    <SelectItem value="key_points">Key Points</SelectItem>
                    <SelectItem value="custom">Custom Fields</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.contextHandling.preservation === 'summary' && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Compression Ratio: {config.contextHandling.compressionRatio?.toFixed(1) || 0.5}
                  </label>
                  <Slider
                    value={[config.contextHandling.compressionRatio || 0.5]}
                    onValueChange={([value]) => setConfig(prev => ({
                      ...prev,
                      contextHandling: { ...prev.contextHandling, compressionRatio: value }
                    }))}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}

              {config.contextHandling.preservation === 'custom' && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Key Fields to Preserve</label>
                  <Input
                    value={(config.contextHandling.keyFields || []).join(', ')}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      contextHandling: {
                        ...prev.contextHandling,
                        keyFields: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    }))}
                    placeholder="user_id, conversation_history, preferences"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Fallback & Timeout */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Timeout (seconds)
              </label>
              <Input
                type="number"
                value={config.timeout}
                onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30 }))}
                min={5}
                max={300}
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Fallback Action
              </label>
              <Select
                value={config.fallbackStrategy.action}
                onValueChange={(value: any) => setConfig(prev => ({
                  ...prev,
                  fallbackStrategy: { ...prev.fallbackStrategy, action: value }
                }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="route_to_human">Route to Human</SelectItem>
                  <SelectItem value="route_to_default">Route to Default Agent</SelectItem>
                  <SelectItem value="end_workflow">End Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!config.name.trim() || config.targetAgents.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};