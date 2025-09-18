
import React from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues, ModelOption, ToolOption, RoleOption } from './types';
import { AgentDialogHeader, AgentFormWrapper } from './components';

interface AgentDialogContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  form: UseFormReturn<AgentFormValues>;
  step: number;
  prevStep: () => void;
  nextStep: () => void;
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

export const AgentDialogContent: React.FC<AgentDialogContentProps> = ({
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

  // Handle dialog content click to prevent event bubbling
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <DialogContent 
      className="bg-beam-dark-accent border-gray-700 text-white sm:max-w-md z-50"
      onInteractOutside={(e) => {
        if (isSubmitting) {
          e.preventDefault();
        }
      }}
      onEscapeKeyDown={(e) => {
        if (isSubmitting) {
          e.preventDefault();
        }
      }}
      onClick={handleContentClick}
    >
      <AgentDialogHeader />
      
      <AgentFormWrapper 
        form={form}
        step={step}
        prevStep={prevStep}
        nextStep={nextStep}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
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
    </DialogContent>
  );
};
