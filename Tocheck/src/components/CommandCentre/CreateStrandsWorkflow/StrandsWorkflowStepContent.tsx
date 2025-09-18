import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { StrandsWorkflowFormValues, StrandsModelOption, ReasoningPattern, StrandsTool, MemoryType } from './types';
import { StrandsBasicInfo } from './steps/StrandsBasicInfo';
import { StrandsModelConfig } from './steps/StrandsModelConfig';
import { StrandsReasoningPatterns } from './steps/StrandsReasoningPatterns';
import { StrandsMemoryConfig } from './steps/StrandsMemoryConfig';
import { StrandsWorkflowSteps } from './steps/StrandsWorkflowSteps';
import { StrandsToolsGuardrails } from './steps/StrandsToolsGuardrails';

interface StrandsWorkflowStepContentProps {
  step: number;
  form: UseFormReturn<StrandsWorkflowFormValues>;
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
  StrandsModels: StrandsModelOption[];
  strandsTools: StrandsTool[];
  reasoningPatterns: ReasoningPattern[];
  memoryTypes: MemoryType[];
}

export const StrandsWorkflowStepContent: React.FC<StrandsWorkflowStepContentProps> = ({
  step,
  form,
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
  StrandsModels,
  strandsTools,
  reasoningPatterns,
  memoryTypes
}) => {
  switch (step) {
    case 1:
      return <StrandsBasicInfo form={form} />;
    
    case 2:
      return (
        <StrandsModelConfig
          form={form}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          selectedProvider={selectedProvider}
          handleProviderChange={handleProviderChange}
          StrandsModels={StrandsModels}
        />
      );
    
    case 3:
      return (
        <StrandsReasoningPatterns
          form={form}
          handleReasoningPatternToggle={handleReasoningPatternToggle}
          reasoningPatterns={reasoningPatterns}
          selectedModel={selectedModel}
        />
      );
    
    case 4:
      return (
        <StrandsMemoryConfig
          form={form}
          handleMemoryToggle={handleMemoryToggle}
          memoryTypes={memoryTypes}
        />
      );
    
    case 5:
      return (
        <StrandsWorkflowSteps
          form={form}
          handleWorkflowStepAdd={handleWorkflowStepAdd}
          handleWorkflowStepRemove={handleWorkflowStepRemove}
          handleWorkflowStepUpdate={handleWorkflowStepUpdate}
        />
      );
    
    case 6:
      return (
        <StrandsToolsGuardrails
          form={form}
          handleToolToggle={handleToolToggle}
          strandsTools={strandsTools}
        />
      );
    
    default:
      return <div>Invalid step</div>;
  }
};