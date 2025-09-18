
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
  AIModels,
  tools,
  roles,
}) => {
  // Form submit handler with proper event handling
  const handleFormSubmit = (e: React.FormEvent) => {
    console.log("Form submit triggered");
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isSubmitting) {
      form.handleSubmit((values) => {
        console.log("Form submitted with values:", values);
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
          AIModels={AIModels}
          tools={tools}
          roles={roles}
        />

        <StepNavigation 
          step={step}
          prevStep={prevStep}
          nextStep={nextStep}
          isLastStep={step === 5}
          isSubmitting={isSubmitting}
          totalSteps={5}
        />
      </form>
    </Form>
  );
};
