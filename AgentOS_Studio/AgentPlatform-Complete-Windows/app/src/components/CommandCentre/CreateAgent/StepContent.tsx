
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues, ModelOption, ToolOption, RoleOption } from './types';
import { AgentNameField } from './AgentNameField';
import { ModelSelector } from './ModelSelector';
import { RoleSelector } from './RoleSelector';
import { MemorySelector } from './MemorySelector';
import { ToolsGuardrails } from './ToolsGuardrails';
import { CompletionScreen } from './CompletionScreen';

interface StepContentProps {
  step: number;
  form: UseFormReturn<AgentFormValues>;
  selectedModel: ModelOption | null;
  setSelectedModel: (model: ModelOption | null) => void;
  selectedProvider: string;
  handleProviderChange: (provider: string) => void;
  handleRoleSelect: (roleId: string) => void;
  handleMemoryToggle: (memoryId: keyof AgentFormValues['memory'], checked: boolean) => void;
  handleToolToggle: (toolId: string, checked: boolean) => void;
  AIModels: Record<string, ModelOption[]>;
  tools: ToolOption[];
  roles: RoleOption[];
}

export const StepContent: React.FC<StepContentProps> = ({
  step,
  form,
  selectedModel,
  setSelectedModel,
  selectedProvider,
  handleProviderChange,
  handleRoleSelect,
  handleMemoryToggle,
  handleToolToggle,
  AIModels,
  tools,
  roles,
}) => {
  switch (step) {
    case 1:
      return (
        <div className="space-y-6">
          <AgentNameField control={form.control} />
          <ModelSelector 
            control={form.control}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedProvider={selectedProvider}
            handleProviderChange={handleProviderChange}
            AIModels={AIModels}
          />
        </div>
      );
    case 2:
      return (
        <RoleSelector 
          control={form.control}
          roles={roles}
          handleRoleSelect={handleRoleSelect}
          selectedRole={form.getValues().role}
        />
      );
    case 3:
      return (
        <MemorySelector
          control={form.control}
          handleMemoryToggle={handleMemoryToggle}
          formValues={form.getValues()}
        />
      );
    case 4:
      return (
        <ToolsGuardrails 
          tools={tools}
          handleToolToggle={handleToolToggle}
          setValue={form.setValue}
          formValues={form.getValues()}
        />
      );
    case 5:
      return <CompletionScreen />;
    default:
      return null;
  }
};
