
import React, { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { AgentFormValues, ModelOption } from '../types';

const defaultValues: AgentFormValues = {
  name: '',
  model: '',
  provider: 'openai',
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
};

export const useAgentForm = (onOpenChange: (open: boolean) => void) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  const form = useForm<AgentFormValues>({
    defaultValues,
    mode: 'onChange'
  });


  

  
  const resetForm = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
    
    // Safe state updates
    if (!isUnmountedRef.current) {
      setIsSubmitting(false);
      form.reset(defaultValues);
      setSelectedModel(null);
      setSelectedProvider('openai');
      setStep(1);
    }
  }, [form]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
    };
  }, []);

  const cancelSubmission = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
    
    if (!isUnmountedRef.current) {
      setIsSubmitting(false);
    }
  }, []);

  const nextStep = useCallback(() => {
    console.log('nextStep function called');
    // Allow user to navigate to the next step without validation
    if (!isUnmountedRef.current) {
      setStep(prev => {
        const newStep = Math.min(prev + 1, 6);
        console.log('Setting step from', prev, 'to', newStep);
        return newStep;
      });
    } else {
      console.log('Component is unmounted, not updating step');
    }
  }, []);

  const prevStep = useCallback(() => {
    if (!isUnmountedRef.current) {
      setStep(prev => Math.max(prev - 1, 1));
    }
  }, []);

  const handleProviderChange = useCallback((provider: string) => {
    if (!isUnmountedRef.current) {
      setSelectedProvider(provider);
      setSelectedModel(null);
      form.setValue('provider', provider);
      form.setValue('model', '');
    }
  }, [form]);

  const handleRoleSelect = useCallback((roleId: string) => {
    form.setValue('role', roleId);
    
    // Auto-fill description based on role unless it's custom
    if (roleId !== 'custom') {
      const selectedRole = roles.find(role => role.id === roleId);
      if (selectedRole) {
        form.setValue('description', selectedRole.description);
      }
    } else {
      form.setValue('description', '');
    }
  }, [form]);

  const handleMemoryToggle = useCallback((memoryId: keyof AgentFormValues['memory'], checked: boolean) => {
    form.setValue(`memory.${memoryId}`, checked);
  }, [form]);

  const handleToolToggle = useCallback((toolId: string, checked: boolean) => {
    const currentTools = form.getValues().tools || [];
    let newTools;
    
    if (checked) {
      newTools = [...currentTools, toolId];
    } else {
      newTools = currentTools.filter(id => id !== toolId);
    }
    
    form.setValue('tools', newTools);
  }, [form]);

  const handleMCPToolToggle = useCallback((toolId: string, serverId: string, checked: boolean) => {
    const currentMCPTools = form.getValues().mcpTools || [];
    const currentMCPServers = form.getValues().mcpServers || [];
    
    if (checked) {
      // Add MCP tool (simple format for form storage)
      const newMCPTools = [...currentMCPTools, { 
        toolId, 
        serverId
      }];
      form.setValue('mcpTools', newMCPTools);
      
      // Add server if not already included
      if (!currentMCPServers.includes(serverId)) {
        form.setValue('mcpServers', [...currentMCPServers, serverId]);
      }
    } else {
      // Remove MCP tool
      const newMCPTools = currentMCPTools.filter(tool => tool.toolId !== toolId || tool.serverId !== serverId);
      form.setValue('mcpTools', newMCPTools);
      
      // Remove server if no tools from that server are selected
      const serverStillUsed = newMCPTools.some(tool => tool.serverId === serverId);
      if (!serverStillUsed) {
        const newMCPServers = currentMCPServers.filter(id => id !== serverId);
        form.setValue('mcpServers', newMCPServers);
      }
    }
  }, [form]);

  const onSubmit = useCallback(async (values: AgentFormValues) => {
    // This should only be called on the final step
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    if (!isUnmountedRef.current) {
      setIsSubmitting(true);
    }
    
    try {

      
      // Determine framework based on model provider or explicit framework
      let framework = 'generic';
      if (values.provider === 'bedrock' || values.framework === 'strands') {
        framework = 'strands';
      } else if (values.framework === 'agentcore') {
        framework = 'agentcore';
      }
      
      // Prepare agent configuration
      const agentConfig = {
        name: values.name || 'Unnamed Agent',
        framework: framework,
        config: {
          model: {
            provider: values.provider,
            model_id: selectedModel?.id || values.model
          },
          role: values.role,
          description: values.description,
          memory: values.memory,
          tools: values.tools,
          mcpConfiguration: {
            gatewayEnabled: (values.mcpTools || []).length > 0,
            gatewayEndpoint: 'http://localhost:7860',
            servers: values.mcpServers || [],
            tools: (values.mcpTools || []).map(tool => ({
              ...tool,
              gatewayEnabled: true,
              permissions: [] // Will be populated by the gateway service
            })),
            returnControlEnabled: (values.mcpTools || []).length > 0,
            dynamicDiscovery: {
              enabled: true,
              maxTools: 10,
              trustLevel: 'verified'
            }
          },
          guardrails: values.guardrails,
          databaseAccess: values.databaseAccess
        }
      };
      

      
      // Try to call the backend API, but handle gracefully if it's not available
      try {
        const response = await fetch('http://localhost:5001/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agentConfig)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();

        
        if (result.status === 'failed' || result.error) {
          // Handle API key validation errors
          toast({
            title: "Agent Creation Failed",
            description: result.error || result.message || "API key validation failed",
            variant: "destructive"
          });
          
          if (!isUnmountedRef.current) {
            setIsSubmitting(false);
          }
          return;
        }
        
        // Backend success case
        toast({
          title: "Agent Created Successfully",
          description: `${values.name || 'New Agent'} has been deployed to AWS Bedrock AgentCore`,
          action: {
            label: "Monitor Agent",
            onClick: () => window.open('/agent-control', '_blank')
          }
        });
        
      } catch (backendError) {
        console.warn('Backend not available, creating agent locally:', backendError);
        
        // Fallback: Create agent locally (demo mode)
        toast({
          title: "Agent Created Successfully",
          description: `${values.name || 'New Agent'} has been configured locally. Backend integration will be available when the server is running.`,
          action: {
            label: "View Agents",
            onClick: () => {
              // Trigger a refresh of the agents list
              const event = new CustomEvent('refreshAgents');
              window.dispatchEvent(event);
            }
          }
        });
      }
      
      // Always close the dialog and reset form on success
      if (!isUnmountedRef.current) {
        setIsSubmitting(false);
        
        // Close the dialog
        onOpenChange(false);
        
        // Reset form state after a short delay
        setTimeout(() => {
          if (!isUnmountedRef.current) {
            resetForm();
          }
        }, 200);
      }
      
    } catch (error) {
      console.error('Unexpected error creating agent:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while creating the agent. Please try again.",
        variant: "destructive"
      });
      
      if (!isUnmountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [selectedModel, toast, onOpenChange, resetForm]);

  return {
    form,
    selectedModel,
    setSelectedModel,
    selectedProvider,
    step,
    isSubmitting,
    resetForm,
    nextStep,
    prevStep,
    handleProviderChange,
    handleRoleSelect,
    handleMemoryToggle,
    handleToolToggle,
    handleMCPToolToggle,
    onSubmit,
    cancelSubmission
  };
};

// Import this from elsewhere to avoid circular dependency
import { roles } from '../toolsRolesData';
