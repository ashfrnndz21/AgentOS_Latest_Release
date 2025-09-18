
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues, ModelOption, ToolOption, RoleOption } from './types';
import { AgentNameField } from './AgentNameField';
import { ModelSelector } from './ModelSelector';
import { RoleSelector } from './RoleSelector';
import { MemorySelector } from './MemorySelector';
import { ToolsGuardrails } from './ToolsGuardrails';
import MCPToolsSelection from './steps/MCPToolsSelection';
import { KnowledgeBaseStep } from './steps/KnowledgeBaseStep';
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
  handleMCPToolToggle: (toolId: string, serverId: string, checked: boolean) => void;
  handleRAGEnabledChange: (enabled: boolean) => void;
  handleKnowledgeBasesChange: (bases: string[]) => void;
  handleRAGConfigChange: (config: any) => void;
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
  handleMCPToolToggle,
  handleRAGEnabledChange,
  handleKnowledgeBasesChange,
  handleRAGConfigChange,
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
        <KnowledgeBaseStep
          ragEnabled={form.getValues().ragEnabled || false}
          onRAGEnabledChange={handleRAGEnabledChange}
          selectedKnowledgeBases={form.getValues().knowledgeBases || []}
          onKnowledgeBasesChange={handleKnowledgeBasesChange}
          ragConfig={form.getValues().ragConfig || {
            embeddingModel: 'nomic-embed-text',
            generationModel: 'llama2',
            chunkSize: 512,
            chunkOverlap: 50,
            similarityThreshold: 0.7,
            maxRetrievedChunks: 5,
            reranking: true,
          }}
          onRAGConfigChange={handleRAGConfigChange}
        />
      );
    case 4:
      return (
        <MemorySelector
          control={form.control}
          handleMemoryToggle={handleMemoryToggle}
          formValues={form.getValues()}
        />
      );
    case 5:
      return (
        <ToolsGuardrails 
          tools={tools}
          handleToolToggle={handleToolToggle}
          setValue={form.setValue}
          formValues={form.getValues()}
        />
      );
    case 6:
      return (
        <MCPToolsSelection
          selectedMCPTools={form.getValues().mcpTools || []}
          onMCPToolToggle={handleMCPToolToggle}
        />
      );
    case 7:
      return <CompletionScreen />;
    default:
      return null;
  }
};
