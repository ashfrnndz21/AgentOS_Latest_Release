import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { StrandsWorkflowFormValues, StrandsModelOption, ReasoningPattern, StrandsTool, MemoryType, A2AConfiguration } from './types';
import { StrandsBasicInfo } from './steps/StrandsBasicInfo';
import { StrandsModelConfig } from './steps/StrandsModelConfig';
import { A2AConfigurationStep } from './A2AConfigurationStep';
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
        <A2AConfigurationStep
          a2aConfig={form.watch('a2a_config')}
          onA2AToggle={handleA2AToggle}
          onCollaborationModeChange={handleA2ACollaborationModeChange}
          onProtocolChange={handleA2AProtocolChange}
          onDiscoveryScopeChange={handleA2ADiscoveryScopeChange}
          onCustomAgentsChange={handleA2ACustomAgentsChange}
          onSettingToggle={handleA2ASettingToggle}
        />
      );
    
    case 4:
      return (
        <StrandsReasoningPatterns
          form={form}
          handleReasoningPatternToggle={handleReasoningPatternToggle}
          reasoningPatterns={reasoningPatterns}
          selectedModel={selectedModel}
        />
      );
    
    case 5:
      return (
        <StrandsMemoryConfig
          form={form}
          handleMemoryToggle={handleMemoryToggle}
          memoryTypes={memoryTypes}
        />
      );
    
    case 6:
      return (
        <StrandsWorkflowSteps
          form={form}
          handleWorkflowStepAdd={handleWorkflowStepAdd}
          handleWorkflowStepRemove={handleWorkflowStepRemove}
          handleWorkflowStepUpdate={handleWorkflowStepUpdate}
        />
      );
    
    case 7:
      return (
        <StrandsToolsGuardrails
          form={form}
          handleToolToggle={handleToolToggle}
          strandsTools={strandsTools}
        />
      );
    
    case 8:
      return (
        <div className="space-y-4">
          <div className="text-center text-white">
            <h3 className="text-lg font-semibold mb-2">Performance & A2A Settings</h3>
          </div>
          {/* This step can be used for final performance configuration and A2A summary */}
        </div>
      );
    
    default:
      return <div>Invalid step</div>;
  }
};