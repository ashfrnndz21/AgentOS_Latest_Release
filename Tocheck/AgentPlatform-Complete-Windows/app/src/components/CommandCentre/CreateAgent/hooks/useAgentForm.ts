
import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { AgentFormValues, ModelOption } from '../types';

export const useAgentForm = (onOpenChange: (open: boolean) => void) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);
  
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
    guardrails: {
      global: true,
      local: false,
    },
    databaseAccess: false
  };

  const form = useForm<AgentFormValues>({
    defaultValues,
    mode: 'onChange'
  });
  
  // Clean up on unmount
  const cleanup = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
  }, []);
  
  const resetForm = useCallback(() => {
    cleanup();
    
    // Safe state updates
    if (!isUnmountedRef.current) {
      setIsSubmitting(false);
      form.reset(defaultValues);
      setSelectedModel(null);
      setSelectedProvider('openai');
      setStep(1);
    }
  }, [form, cleanup]);

  const cancelSubmission = useCallback(() => {
    cleanup();
    
    if (!isUnmountedRef.current) {
      setIsSubmitting(false);
    }
  }, [cleanup]);

  const nextStep = useCallback(() => {
    // Allow user to navigate to the next step without validation
    if (!isUnmountedRef.current) {
      setStep(prev => Math.min(prev + 1, 5));
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

  const onSubmit = useCallback(async (values: AgentFormValues) => {
    // Only process submission if we're on the last step
    if (step !== 5) {
      nextStep();
      return;
    }
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    if (!isUnmountedRef.current) {
      setIsSubmitting(true);
    }
    
    try {
      console.log('Creating agent:', values);
      
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
          guardrails: values.guardrails,
          databaseAccess: values.databaseAccess
        }
      };
      
      console.log('Sending agent config to backend:', agentConfig);
      
      // Call backend API
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentConfig)
      });
      
      const result = await response.json();
      console.log('Backend response:', result);
      
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
      
      // Success case
      toast({
        title: "Agent Created Successfully",
        description: `${values.name || 'New Agent'} has been added to your workspace`,
      });
      
      // Close the dialog
      onOpenChange(false);
      
      // Reset form state after dialog is closed
      setTimeout(() => {
        resetForm();
      }, 100);
      
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to backend. Please ensure the backend server is running.",
        variant: "destructive"
      });
      
      if (!isUnmountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [selectedModel, toast, onOpenChange, step, nextStep, isSubmitting, resetForm]);

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
    onSubmit,
    cancelSubmission
  };
};

// Import this from elsewhere to avoid circular dependency
import { roles } from '../toolsRolesData';
