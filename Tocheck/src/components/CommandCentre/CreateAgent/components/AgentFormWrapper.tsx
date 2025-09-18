
import React from 'react';
import { Form } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues } from '../types';
import { StepContent } from '../StepContent';
import { StepNavigation } from '../StepNavigation';
import { ModelOption, ToolOption, RoleOption } from '../types';

interface AgentFormWrapperProps {
  form: UseFormReturn<AgentFormValues>;
  step: number;
  prevStep: () => void;
  nextStep: () => void;
  isSubmitting: boolean;
  onSubmit: (values: AgentFormValues) => void;
  selectedModel: ModelOption | null;
  setSelectedModel: (model: ModelOption | null) => void;
  selectedProvider: string;
  handleProviderChange: (provider: string) => void;
  handleRoleSelect: (roleId: string) => void;
  handleMemoryToggle: (memoryId: keyof AgentFormValues['memory'], checked: boolean) => void;
  handleToolToggle: (toolId: string, checked: boolean) => void;
  handleMCPToolToggle: (toolId: string, serverId: string, checked: boolean) => void;
  handleRAGEnabledChange: (enabled: boolean) => void;
  handleKnowledgeBasesChange: (bases: string[]) => void;
  handleRAGConfigChange: (config: any) => void;
  AIModels: Record<string, ModelOption[]>;
  tools: ToolOption[];
  roles: RoleOption[];
}

export const AgentFormWrapper: React.FC<AgentFormWrapperProps> = ({
  form,
  step,
  prevStep,
  nextStep,
  isSubmitting,
  onSubmit,
  selectedModel,
  setSelectedModel,
  selectedProvider,
  handleProviderChange,
  handleRoleSelect,
  handleMemoryToggle,
  handleToolToggle,
  handleMCPToolToggle,
  handleRAGEnabledChange,
  handleKnowledgeBasesChange,
  handleRAGConfigChange,
  AIModels,
  tools,
  roles,
}) => {
  // Form submit handler - only for final submission
  const handleFormSubmit = (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Only handle form submission on the last step
    if (step === 7 && !isSubmitting) {
      form.handleSubmit((values) => {
        onSubmit(values);
      })(e as any);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={handleFormSubmit} 
        className="space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <StepContent 
          step={step}
          form={form}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          selectedProvider={selectedProvider}
          handleProviderChange={handleProviderChange}
          handleRoleSelect={handleRoleSelect}
          handleMemoryToggle={handleMemoryToggle}
          handleToolToggle={handleToolToggle}
          handleMCPToolToggle={handleMCPToolToggle}
          handleRAGEnabledChange={handleRAGEnabledChange}
          handleKnowledgeBasesChange={handleKnowledgeBasesChange}
          handleRAGConfigChange={handleRAGConfigChange}
          AIModels={AIModels}
          tools={tools}
          roles={roles}
        />

        <StepNavigation 
          step={step}
          prevStep={prevStep}
          nextStep={nextStep}
          isLastStep={step === 7}
          isSubmitting={isSubmitting}
          totalSteps={7}
        />
      </form>
    </Form>
  );
};
