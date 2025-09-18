import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { StrandsWorkflowStepContent } from './StrandsWorkflowStepContent';
import { StrandsWorkflowStepNavigation } from './StrandsWorkflowStepNavigation';
import { UseFormReturn } from 'react-hook-form';
import { StrandsWorkflowFormValues, StrandsModelOption, ReasoningPattern, StrandsTool, MemoryType, A2AConfiguration } from './types';

interface StrandsWorkflowDialogContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  form: UseFormReturn<StrandsWorkflowFormValues>;
  step: number;
  prevStep: () => void;
  nextStep: () => void;
  onSubmit: () => void;
  selectedModel: StrandsModelOption | null;
  setSelectedModel: (model: StrandsModelOption | null) => void;
  selectedProvider: string;
  handleProviderChange: (provider: string) => void;
  handleReasoningPatternToggle: (pattern: string) => void;
  handleMemoryToggle: (memoryType: string) => void;
  handleToolToggle: (toolId: string) => void;
  handleWorkflowStepAdd: () => void;
  handleWorkflowStepRemove: (stepId: string) => void;
  handleWorkflowStepUpdate: (stepId: string, updates: any) => void;
  // A2A Configuration Handlers
  handleA2AToggle: (enabled: boolean) => void;
  handleA2ACollaborationModeChange: (mode: 'orchestrator' | 'participant' | 'both') => void;
  handleA2AProtocolChange: (protocol: 'websocket' | 'rest' | 'both') => void;
  handleA2ADiscoveryScopeChange: (scope: 'local' | 'global' | 'custom') => void;
  handleA2ACustomAgentsChange: (agents: string[]) => void;
  handleA2ASettingToggle: (setting: keyof A2AConfiguration, value: boolean) => void;
  StrandsModels: StrandsModelOption[];
  strandsTools: StrandsTool[];
  reasoningPatterns: ReasoningPattern[];
  memoryTypes: MemoryType[];
}

const stepTitles = [
  'Basic Information',
  'Model & Provider',
  'A2A Configuration',
  'Reasoning Patterns',
  'Memory Configuration',
  'Workflow Steps',
  'Tools & Guardrails',
  'Performance & A2A Settings'
];

export const StrandsWorkflowDialogContent: React.FC<StrandsWorkflowDialogContentProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  form,
  step,
  prevStep,
  nextStep,
  onSubmit,
  selectedModel,
  setSelectedModel,
  selectedProvider,
  handleProviderChange,
  handleReasoningPatternToggle,
  handleMemoryToggle,
  handleToolToggle,
  handleWorkflowStepAdd,
  handleWorkflowStepRemove,
  handleWorkflowStepUpdate,
  // A2A Configuration Handlers
  handleA2AToggle,
  handleA2ACollaborationModeChange,
  handleA2AProtocolChange,
  handleA2ADiscoveryScopeChange,
  handleA2ACustomAgentsChange,
  handleA2ASettingToggle,
  StrandsModels,
  strandsTools,
  reasoningPatterns,
  memoryTypes
}) => {
  const progress = (step / stepTitles.length) * 100;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] bg-beam-dark border-gray-700 flex flex-col">
      <DialogHeader className="pb-4 border-b border-gray-700 flex-shrink-0">
        <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
          🧠 Create Strands Agentic Workflow
        </DialogTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Step {step} of {stepTitles.length}: {stepTitles[step - 1]}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto py-4 min-h-0">
        <StrandsWorkflowStepContent
          step={step}
          form={form}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          selectedProvider={selectedProvider}
          handleProviderChange={handleProviderChange}
          handleReasoningPatternToggle={handleReasoningPatternToggle}
          handleMemoryToggle={handleMemoryToggle}
          handleToolToggle={handleToolToggle}
          handleWorkflowStepAdd={handleWorkflowStepAdd}
          handleWorkflowStepRemove={handleWorkflowStepRemove}
          handleWorkflowStepUpdate={handleWorkflowStepUpdate}
          // A2A Configuration Handlers
          handleA2AToggle={handleA2AToggle}
          handleA2ACollaborationModeChange={handleA2ACollaborationModeChange}
          handleA2AProtocolChange={handleA2AProtocolChange}
          handleA2ADiscoveryScopeChange={handleA2ADiscoveryScopeChange}
          handleA2ACustomAgentsChange={handleA2ACustomAgentsChange}
          handleA2ASettingToggle={handleA2ASettingToggle}
          StrandsModels={StrandsModels}
          strandsTools={strandsTools}
          reasoningPatterns={reasoningPatterns}
          memoryTypes={memoryTypes}
        />
      </div>

      <div className="flex-shrink-0">
        <StrandsWorkflowStepNavigation
          step={step}
          totalSteps={stepTitles.length}
          prevStep={prevStep}
          nextStep={nextStep}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          form={form}
        />
      </div>
    </DialogContent>
  );
};