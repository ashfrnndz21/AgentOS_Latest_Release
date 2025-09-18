import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Map, Plus, Trash2, Users, GitBranch, Zap } from 'lucide-react';

interface CreateMultiAgentWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AgentRole {
  id: string;
  name: string;
  type: 'coordinator' | 'specialist' | 'validator' | 'executor';
  description: string;
  capabilities: string[];
}

export const CreateMultiAgentWorkflowDialog: React.FC<CreateMultiAgentWorkflowDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [agents, setAgents] = useState<AgentRole[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agentTypes = [
    { value: 'coordinator', label: 'Coordinator', icon: Users, description: 'Orchestrates the workflow' },
    { value: 'specialist', label: 'Specialist', icon: Zap, description: 'Handles specific domain tasks' },
    { value: 'validator', label: 'Validator', icon: GitBranch, description: 'Validates outputs and decisions' },
    { value: 'executor', label: 'Executor', icon: Map, description: 'Executes final actions' }
  ];

  const addAgent = () => {
    const newAgent: AgentRole = {
      id: `agent_${Date.now()}`,
      name: `Agent ${agents.length + 1}`,
      type: 'specialist',
      description: '',
      capabilities: []
    };
    setAgents([...agents, newAgent]);
  };

  const removeAgent = (agentId: string) => {
    setAgents(agents.filter(agent => agent.id !== agentId));
  };

  const updateAgent = (agentId: string, updates: Partial<AgentRole>) => {
    setAgents(agents.map(agent => 
      agent.id === agentId ? { ...agent, ...updates } : agent
    ));
  };

  const handleSubmit = async () => {
    if (!workflowName.trim()) {
      toast({
        title: "Validation Error",
        description: "Workflow name is required",
        variant: "destructive"
      });
      return;
    }

    if (agents.length === 0) {
      toast({
        title: "Validation Error", 
        description: "At least one agent is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create multi-agent workflow
      const workflowConfig = {
        name: workflowName,
        description: workflowDescription,
        framework: 'multi-agent',
        config: {
          agents: agents,
          coordination_strategy: 'sequential',
          communication_protocol: 'message_passing',
          failure_handling: 'retry_with_fallback'
        }
      };

      console.log('Creating multi-agent workflow:', workflowConfig);

      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowConfig)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create multi-agent workflow');
      }

      const result = await response.json();

      toast({
        title: "Multi-Agent Workflow Created! 🤖",
        description: `${workflowName} with ${agents.length} agents is ready`,
        duration: 5000
      });

      // Reset form and close
      setWorkflowName('');
      setWorkflowDescription('');
      setAgents([]);
      onOpenChange(false);

    } catch (error) {
      console.error('Multi-agent workflow creation error:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-beam-dark border-gray-700">
        <DialogHeader className="pb-4 border-b border-gray-700">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Map size={24} className="text-orange-400" />
            Create Multi-Agent Workflow
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name" className="text-white">
                Workflow Name *
              </Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="e.g., Customer Support Workflow"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workflow-description" className="text-white">
                Description
              </Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe the workflow's purpose and how agents will collaborate..."
                rows={3}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Agents Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Workflow Agents</h3>
              <Button
                type="button"
                onClick={addAgent}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                Add Agent
              </Button>
            </div>

            {agents.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                <Users size={48} className="text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No agents configured yet</p>
                <Button
                  type="button"
                  onClick={addAgent}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus size={16} className="mr-2" />
                  Add First Agent
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {agents.map((agent, index) => {
                  const TypeIcon = agentTypes.find(t => t.value === agent.type)?.icon || Users;
                  
                  return (
                    <div key={agent.id} className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {index + 1}
                          </div>
                          <TypeIcon size={20} className="text-orange-400" />
                          <span className="text-white font-medium">Agent {index + 1}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAgent(agent.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white text-sm">Agent Name</Label>
                          <Input
                            value={agent.name}
                            onChange={(e) => updateAgent(agent.id, { name: e.target.value })}
                            placeholder="e.g., Customer Analyzer"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white text-sm">Agent Type</Label>
                          <Select
                            value={agent.type}
                            onValueChange={(value) => updateAgent(agent.id, { type: value as any })}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {agentTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                  <SelectItem key={type.value} value={type.value} className="text-white">
                                    <div className="flex items-center gap-2">
                                      <Icon size={16} />
                                      <div>
                                        <div>{type.label}</div>
                                        <div className="text-xs text-gray-400">{type.description}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white text-sm">Description</Label>
                        <Textarea
                          value={agent.description}
                          onChange={(e) => updateAgent(agent.id, { description: e.target.value })}
                          placeholder="Describe this agent's role and responsibilities..."
                          rows={2}
                          className="bg-gray-700 border-gray-600 text-white resize-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
            <h4 className="text-orange-300 font-medium mb-2">🤖 Multi-Agent Workflow Benefits</h4>
            <ul className="text-orange-200 text-sm space-y-1">
              <li>• Parallel processing for faster execution</li>
              <li>• Specialized agents for domain expertise</li>
              <li>• Fault tolerance through agent redundancy</li>
              <li>• Scalable coordination patterns</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!workflowName.trim() || agents.length === 0 || isSubmitting}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
          >
            {isSubmitting ? 'Creating...' : 'Create Multi-Agent Workflow'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};