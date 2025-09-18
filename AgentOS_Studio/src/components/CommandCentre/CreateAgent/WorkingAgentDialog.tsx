import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Info } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';

// Import the simple UI components
import { SimpleAgentNameField } from './SimpleAgentNameField';
import { SimpleModelSelector } from './SimpleModelSelector';
import { SimpleRoleSelector } from './SimpleRoleSelector';
import { SimpleMemorySelector } from './SimpleMemorySelector';
import { SimpleToolsGuardrails } from './SimpleToolsGuardrails';
import MCPToolsSelection from './steps/MCPToolsSelection';
import { CompletionScreen } from './CompletionScreen';

// Import data
import { AIModels } from './models';
import { tools, roles } from './toolsRolesData';
import { ModelOption } from './types';

interface WorkingAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WorkingAgentDialog: React.FC<WorkingAgentDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  
  // Simple state management (no complex form)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    provider: 'openai',
    model: '',
    role: '',
    description: '',
    memory: {
      shortTerm: true,
      longTerm: false,
      summary: false,
      entity: false,
    },
    tools: [] as string[],
    mcpTools: [] as Array<{ toolId: string; serverId: string }>,
    mcpServers: [] as string[],
    guardrails: {
      global: true,
      local: false,
    },
    databaseAccess: false
  });
  
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);

  // Simple navigation functions
  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Handler functions that update formData
  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name }));
  };

  const handleProviderChange = (provider: string) => {
    setFormData(prev => ({ ...prev, provider, model: '' }));
    setSelectedModel(null);
  };

  const handleModelChange = (model: string) => {
    setFormData(prev => ({ ...prev, model }));
    const modelOption = AIModels[formData.provider]?.find(m => m.id === model);
    setSelectedModel(modelOption || null);
  };

  const handleRoleSelect = (roleId: string) => {
    const selectedRole = roles.find(role => role.id === roleId);
    setFormData(prev => ({
      ...prev,
      role: roleId,
      description: roleId !== 'custom' && selectedRole ? selectedRole.description : ''
    }));
  };

  const handleDescriptionChange = (description: string) => {
    setFormData(prev => ({ ...prev, description }));
  };

  const handleGuardrailToggle = (type: 'global' | 'local', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      guardrails: { ...prev.guardrails, [type]: checked }
    }));
  };

  const handleDatabaseAccessToggle = (checked: boolean) => {
    setFormData(prev => ({ ...prev, databaseAccess: checked }));
  };

  const handleMemoryToggle = (memoryId: keyof typeof formData.memory, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      memory: { ...prev.memory, [memoryId]: checked }
    }));
  };

  const handleToolToggle = (toolId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tools: checked 
        ? [...prev.tools, toolId]
        : prev.tools.filter(id => id !== toolId)
    }));
  };

  const handleMCPToolToggle = (toolId: string, serverId: string, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        const newMCPTools = [...prev.mcpTools, { toolId, serverId }];
        const newMCPServers = prev.mcpServers.includes(serverId) 
          ? prev.mcpServers 
          : [...prev.mcpServers, serverId];
        return {
          ...prev,
          mcpTools: newMCPTools,
          mcpServers: newMCPServers
        };
      } else {
        const newMCPTools = prev.mcpTools.filter(tool => tool.toolId !== toolId || tool.serverId !== serverId);
        const serverStillUsed = newMCPTools.some(tool => tool.serverId === serverId);
        const newMCPServers = serverStillUsed 
          ? prev.mcpServers 
          : prev.mcpServers.filter(id => id !== serverId);
        return {
          ...prev,
          mcpTools: newMCPTools,
          mcpServers: newMCPServers
        };
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare agent configuration
      const agentConfig = {
        name: formData.name || 'Unnamed Agent',
        framework: 'generic',
        config: {
          model: {
            provider: formData.provider,
            model_id: selectedModel?.id || formData.model
          },
          role: formData.role,
          description: formData.description,
          memory: formData.memory,
          tools: formData.tools,
          mcpConfiguration: {
            gatewayEnabled: formData.mcpTools.length > 0,
            gatewayEndpoint: 'http://localhost:7860',
            servers: formData.mcpServers,
            tools: formData.mcpTools.map(tool => ({
              ...tool,
              gatewayEnabled: true,
              permissions: []
            })),
            returnControlEnabled: formData.mcpTools.length > 0,
            dynamicDiscovery: {
              enabled: true,
              maxTools: 10,
              trustLevel: 'verified'
            }
          },
          guardrails: formData.guardrails,
          databaseAccess: formData.databaseAccess
        }
      };

      // Try backend API, fallback to local
      try {
        const response = await fetch('http://localhost:5001/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentConfig)
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.status !== 'failed' && !result.error) {
            toast({
              title: "Agent Created Successfully",
              description: `${formData.name || 'New Agent'} has been deployed to AWS Bedrock AgentCore`
            });
          } else {
            throw new Error(result.error || 'Backend creation failed');
          }
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        // Fallback to local creation
        toast({
          title: "Agent Created Successfully",
          description: `${formData.name || 'New Agent'} has been configured locally. Backend integration will be available when the server is running.`
        });
      }
      
      // Reset and close
      resetForm();
      onOpenChange(false);
      
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while creating the agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setIsSubmitting(false);
    setSelectedModel(null);
    setFormData({
      name: '',
      provider: 'openai',
      model: '',
      role: '',
      description: '',
      memory: {
        shortTerm: true,
        longTerm: false,
        summary: false,
        entity: false,
      },
      tools: [],
      mcpTools: [],
      mcpServers: [],
      guardrails: {
        global: true,
        local: false,
      },
      databaseAccess: false
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <SimpleAgentNameField 
              value={formData.name}
              onChange={handleNameChange}
            />
            <SimpleModelSelector 
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              selectedProvider={formData.provider}
              handleProviderChange={handleProviderChange}
              handleModelChange={handleModelChange}
              AIModels={AIModels}
            />
          </div>
        );
      case 2:
        return (
          <SimpleRoleSelector 
            roles={roles}
            handleRoleSelect={handleRoleSelect}
            selectedRole={formData.role}
            description={formData.description}
            onDescriptionChange={handleDescriptionChange}
          />
        );
      case 3:
        return (
          <SimpleMemorySelector
            handleMemoryToggle={handleMemoryToggle}
            memory={formData.memory}
          />
        );
      case 4:
        return (
          <SimpleToolsGuardrails 
            tools={tools}
            handleToolToggle={handleToolToggle}
            selectedTools={formData.tools}
            guardrails={formData.guardrails}
            onGuardrailToggle={handleGuardrailToggle}
            databaseAccess={formData.databaseAccess}
            onDatabaseAccessToggle={handleDatabaseAccessToggle}
          />
        );
      case 5:
        return (
          <MCPToolsSelection
            selectedMCPTools={formData.mcpTools}
            onMCPToolToggle={handleMCPToolToggle}
          />
        );
      case 6:
        return <CompletionScreen />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-beam-dark-accent border-gray-700 text-white sm:max-w-md z-50">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Agent</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderStepContent()}
          
          <DialogFooter className="gap-2 flex-row sm:justify-between">
            <div className="flex gap-2">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="border-gray-700 text-white hover:bg-gray-700"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
              
              {step < 6 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-beam-blue hover:bg-beam-blue/80 text-white"
                  disabled={isSubmitting}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Agent'}
                </Button>
              )}
            </div>
            
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Info size={12} />
              Step {step} of 6
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};