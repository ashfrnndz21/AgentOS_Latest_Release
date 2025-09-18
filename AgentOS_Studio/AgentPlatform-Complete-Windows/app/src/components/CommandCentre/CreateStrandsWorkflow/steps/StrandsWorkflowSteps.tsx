import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { StrandsWorkflowFormValues, WorkflowStep } from '../types';
import { Plus, Trash2, GitBranch, Zap, Database, Shield, RotateCcw, Brain } from 'lucide-react';

interface StrandsWorkflowStepsProps {
  form: UseFormReturn<StrandsWorkflowFormValues>;
  handleWorkflowStepAdd: () => void;
  handleWorkflowStepRemove: (stepId: string) => void;
  handleWorkflowStepUpdate: (stepId: string, updates: Partial<WorkflowStep>) => void;
}

const stepTypeIcons = {
  reasoning: Brain,
  tool_use: Zap,
  memory_retrieval: Database,
  validation: Shield,
  reflection: RotateCcw
};

export const StrandsWorkflowSteps: React.FC<StrandsWorkflowStepsProps> = ({
  form,
  handleWorkflowStepAdd,
  handleWorkflowStepRemove,
  handleWorkflowStepUpdate
}) => {
  const { watch } = form;
  const workflowSteps = watch('workflow_steps');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-orange-600/20 rounded-full">
            <GitBranch size={32} className="text-orange-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white">Workflow Steps</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Define the sequence of reasoning and processing steps for your workflow
        </p>
      </div>

      <div className="space-y-4">
        {workflowSteps.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
            <GitBranch size={48} className="text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No workflow steps defined yet</p>
            <Button
              type="button"
              onClick={handleWorkflowStepAdd}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus size={16} className="mr-2" />
              Add First Step
            </Button>
          </div>
        ) : (
          <>
            {workflowSteps.map((step, index) => {
              const Icon = stepTypeIcons[step.type] || Brain;
              
              return (
                <div key={step.id} className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <Icon size={20} className="text-orange-400" />
                      <span className="text-white font-medium">Step {index + 1}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWorkflowStepRemove(step.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white text-sm">Step Name</label>
                      <Input
                        value={step.name}
                        onChange={(e) => handleWorkflowStepUpdate(step.id, { name: e.target.value })}
                        placeholder="e.g., Initial Analysis"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm">Step Type</label>
                      <Select
                        value={step.type}
                        onValueChange={(value) => handleWorkflowStepUpdate(step.id, { type: value as any })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="reasoning" className="text-white">
                            <div className="flex items-center gap-2">
                              <Brain size={16} />
                              Reasoning
                            </div>
                          </SelectItem>
                          <SelectItem value="tool_use" className="text-white">
                            <div className="flex items-center gap-2">
                              <Zap size={16} />
                              Tool Use
                            </div>
                          </SelectItem>
                          <SelectItem value="memory_retrieval" className="text-white">
                            <div className="flex items-center gap-2">
                              <Database size={16} />
                              Memory Retrieval
                            </div>
                          </SelectItem>
                          <SelectItem value="validation" className="text-white">
                            <div className="flex items-center gap-2">
                              <Shield size={16} />
                              Validation
                            </div>
                          </SelectItem>
                          <SelectItem value="reflection" className="text-white">
                            <div className="flex items-center gap-2">
                              <RotateCcw size={16} />
                              Reflection
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm">Description</label>
                    <Textarea
                      value={step.description}
                      onChange={(e) => handleWorkflowStepUpdate(step.id, { description: e.target.value })}
                      placeholder="Describe what this step accomplishes..."
                      rows={2}
                      className="bg-gray-700 border-gray-600 text-white resize-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`parallel-${step.id}`}
                      checked={step.parallel_execution}
                      onCheckedChange={(checked) => 
                        handleWorkflowStepUpdate(step.id, { parallel_execution: !!checked })
                      }
                    />
                    <label htmlFor={`parallel-${step.id}`} className="text-white text-sm">
                      Allow parallel execution with other steps
                    </label>
                  </div>
                </div>
              );
            })}

            <Button
              type="button"
              onClick={handleWorkflowStepAdd}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Plus size={16} className="mr-2" />
              Add Another Step
            </Button>
          </>
        )}
      </div>

      <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
        <h4 className="text-orange-300 font-medium mb-2">🔄 Workflow Design Tips</h4>
        <ul className="text-orange-200 text-sm space-y-1">
          <li>• Start with reasoning steps to analyze the problem</li>
          <li>• Use memory retrieval to access relevant context</li>
          <li>• Add validation steps to ensure quality</li>
          <li>• Include reflection steps for self-improvement</li>
          <li>• Enable parallel execution for independent steps</li>
        </ul>
      </div>
    </div>
  );
};