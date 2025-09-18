import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowUp, ArrowDown, GitBranch } from 'lucide-react';
import { DecisionNodeConfig, DecisionCondition } from '@/types/WorkflowUtilityTypes';

interface DecisionNodeConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: DecisionNodeConfig) => void;
  initialConfig?: DecisionNodeConfig;
  availableAgents: Array<{ id: string; name: string; }>;
}

export const DecisionNodeConfigDialog: React.FC<DecisionNodeConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  availableAgents = []
}) => {
  const [config, setConfig] = useState<DecisionNodeConfig>({
    id: initialConfig?.id || `decision-${Date.now()}`,
    name: initialConfig?.name || 'Decision Point',
    conditions: initialConfig?.conditions || [],
    defaultAction: initialConfig?.defaultAction || {
      action: 'route_to_agent',
      target: availableAgents[0]?.id || ''
    },
    evaluationMode: initialConfig?.evaluationMode || 'first_match',
    description: initialConfig?.description || ''
  });

  const addCondition = () => {
    const newCondition: DecisionCondition = {
      id: `condition-${Date.now()}`,
      field: 'content',
      operator: 'contains',
      value: '',
      action: 'route_to_agent',
      target: availableAgents[0]?.id || '',
      priority: config.conditions.length + 1
    };
    setConfig(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const updateCondition = (index: number, updates: Partial<DecisionCondition>) => {
    setConfig(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, ...updates } : condition
      )
    }));
  };

  const removeCondition = (index: number) => {
    setConfig(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const moveCondition = (index: number, direction: 'up' | 'down') => {
    const newConditions = [...config.conditions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newConditions.length) {
      [newConditions[index], newConditions[targetIndex]] = [newConditions[targetIndex], newConditions[index]];
      // Update priorities
      newConditions.forEach((condition, i) => {
        condition.priority = i + 1;
      });
      setConfig(prev => ({ ...prev, conditions: newConditions }));
    }
  };

  const handleSave = () => {
    if (config.name.trim() && config.conditions.length > 0) {
      onSave(config);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-yellow-400" />
            Configure Decision Node
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Node Name
              </label>
              <Input
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter decision node name"
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Description (Optional)
              </label>
              <Input
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this decision node does"
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Evaluation Mode
              </label>
              <Select
                value={config.evaluationMode}
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, evaluationMode: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_match">First Match (Stop at first true condition)</SelectItem>
                  <SelectItem value="highest_priority">Highest Priority (Evaluate by priority order)</SelectItem>
                  <SelectItem value="all_conditions">All Conditions (Must match all conditions)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Decision Conditions</h3>
              <Button onClick={addCondition} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>

            {config.conditions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No conditions defined. Add a condition to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {config.conditions.map((condition, index) => (
                  <div key={condition.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        Condition {index + 1} (Priority: {condition.priority})
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveCondition(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveCondition(index, 'down')}
                          disabled={index === config.conditions.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCondition(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Field */}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Field</label>
                        <Select
                          value={condition.field}
                          onValueChange={(value: any) => updateCondition(index, { field: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="content">Message Content</SelectItem>
                            <SelectItem value="confidence">Confidence Score</SelectItem>
                            <SelectItem value="topic">Topic/Category</SelectItem>
                            <SelectItem value="user_intent">User Intent</SelectItem>
                            <SelectItem value="agent_response">Agent Response</SelectItem>
                            <SelectItem value="custom">Custom Field</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Operator */}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Operator</label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value: any) => updateCondition(index, { operator: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="starts_with">Starts With</SelectItem>
                            <SelectItem value="ends_with">Ends With</SelectItem>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Value */}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Value</label>
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                          placeholder="Enter value"
                          className="bg-gray-700 border-gray-600 text-sm"
                        />
                      </div>

                      {/* Action */}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Action</label>
                        <Select
                          value={condition.action}
                          onValueChange={(value: any) => updateCondition(index, { action: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="route_to_agent">Route to Agent</SelectItem>
                            <SelectItem value="route_to_human">Route to Human</SelectItem>
                            <SelectItem value="end_workflow">End Workflow</SelectItem>
                            <SelectItem value="trigger_tool">Trigger Tool</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Target */}
                    <div className="mt-3">
                      <label className="text-xs text-gray-400 mb-1 block">Target</label>
                      {condition.action === 'route_to_agent' ? (
                        <Select
                          value={condition.target}
                          onValueChange={(value) => updateCondition(index, { target: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Select agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAgents.map(agent => (
                              <SelectItem key={agent.id} value={agent.id}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={condition.target}
                          onChange={(e) => updateCondition(index, { target: e.target.value })}
                          placeholder="Enter target (queue, tool name, etc.)"
                          className="bg-gray-700 border-gray-600"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Default Action */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Default Action</h3>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Action</label>
                  <Select
                    value={config.defaultAction.action}
                    onValueChange={(value: any) => setConfig(prev => ({
                      ...prev,
                      defaultAction: { ...prev.defaultAction, action: value }
                    }))}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="route_to_agent">Route to Agent</SelectItem>
                      <SelectItem value="route_to_human">Route to Human</SelectItem>
                      <SelectItem value="end_workflow">End Workflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Target</label>
                  {config.defaultAction.action === 'route_to_agent' ? (
                    <Select
                      value={config.defaultAction.target}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        defaultAction: { ...prev.defaultAction, target: value }
                      }))}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAgents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={config.defaultAction.target}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        defaultAction: { ...prev.defaultAction, target: e.target.value }
                      }))}
                      placeholder="Enter target"
                      className="bg-gray-700 border-gray-600"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!config.name.trim() || config.conditions.length === 0}
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