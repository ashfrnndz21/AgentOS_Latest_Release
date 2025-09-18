import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { StrandsWorkflowFormValues, StrandsModelOption, WorkflowStep } from '../types';
import { StrandsSDK } from '@/lib/frameworks/StrandsSDK';

export const useStrandsWorkflowForm = (onOpenChange: (open: boolean) => void) => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<StrandsModelOption | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('bedrock');
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);
  
  const defaultValues: StrandsWorkflowFormValues = {
    name: '',
    description: '',
    model: '',
    provider: 'bedrock',
    reasoning_patterns: {
      chain_of_thought: true,
      tree_of_thought: false,
      reflection: false,
      self_critique: false,
      multi_step_reasoning: false,
      analogical_reasoning: false,
    },
    memory: {
      working_memory: true,
      episodic_memory: false,
      semantic_memory: false,
      memory_consolidation: false,
      context_window_management: true,
    },
    tools: [],
    workflow_steps: [],
    guardrails: {
      content_filter: true,
      reasoning_validator: true,
      output_sanitizer: true,
      ethical_constraints: true,
    },
    performance_config: {
      max_reasoning_depth: 5,
      reflection_cycles: 2,
      temperature: 0.7,
      max_tokens: 4000,
    }
  };

  const form = useForm<StrandsWorkflowFormValues>({
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
    setStep(1);
    setSelectedModel(null);
    setSelectedProvider('bedrock');
    setIsSubmitting(false);
    form.reset(defaultValues);
    isUnmountedRef.current = false;
  }, [form, cleanup]);

  const nextStep = useCallback(() => {
    setStep(prev => Math.min(prev + 1, 6)); // 6 steps for Strands workflow
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleProviderChange = useCallback((provider: string) => {
    setSelectedProvider(provider);
    setSelectedModel(null);
    form.setValue('provider', provider as any);
    form.setValue('model', '');
  }, [form]);

  const handleReasoningPatternToggle = useCallback((pattern: string) => {
    const currentPatterns = form.getValues('reasoning_patterns');
    const newPatterns = {
      ...currentPatterns,
      [pattern]: !currentPatterns[pattern as keyof typeof currentPatterns]
    };
    form.setValue('reasoning_patterns', newPatterns);
  }, [form]);

  const handleMemoryToggle = useCallback((memoryType: string) => {
    const currentMemory = form.getValues('memory');
    const newMemory = {
      ...currentMemory,
      [memoryType]: !currentMemory[memoryType as keyof typeof currentMemory]
    };
    form.setValue('memory', newMemory);
  }, [form]);

  const handleToolToggle = useCallback((toolId: string) => {
    const currentTools = form.getValues('tools');
    const newTools = currentTools.includes(toolId)
      ? currentTools.filter(id => id !== toolId)
      : [...currentTools, toolId];
    form.setValue('tools', newTools);
  }, [form]);

  const handleWorkflowStepAdd = useCallback(() => {
    const currentSteps = form.getValues('workflow_steps');
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      name: `Step ${currentSteps.length + 1}`,
      type: 'reasoning',
      description: '',
      config: {},
      dependencies: [],
      parallel_execution: false
    };
    form.setValue('workflow_steps', [...currentSteps, newStep]);
  }, [form]);

  const handleWorkflowStepRemove = useCallback((stepId: string) => {
    const currentSteps = form.getValues('workflow_steps');
    const newSteps = currentSteps.filter(step => step.id !== stepId);
    form.setValue('workflow_steps', newSteps);
  }, [form]);

  const handleWorkflowStepUpdate = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    const currentSteps = form.getValues('workflow_steps');
    const newSteps = currentSteps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );
    form.setValue('workflow_steps', newSteps);
  }, [form]);

  const cancelSubmission = useCallback(() => {
    cleanup();
    setIsSubmitting(false);
    isUnmountedRef.current = true;
  }, [cleanup]);

  const onSubmit = useCallback(async (data: StrandsWorkflowFormValues) => {
    if (isSubmitting || isUnmountedRef.current) return;
    
    console.log('Strands form submission started with data:', data);
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!data.name.trim()) {
        throw new Error('Workflow name is required');
      }
      
      // Use default model if none selected
      if (!data.model) {
        console.log('No model selected, using default bedrock-claude-3-sonnet');
        data.model = 'bedrock-claude-3-sonnet';
      }

      // Create Strands SDK instance
      const strandsSDK = new StrandsSDK();
      
      // Build Strands configuration
      const strandsConfig = {
        name: data.name,
        description: data.description,
        model: {
          provider: 'bedrock' as const,
          model_id: data.model || 'bedrock-claude-3-sonnet',
          temperature: data.performance_config.temperature,
          max_tokens: data.performance_config.max_tokens,
        },
        reasoning_patterns: data.reasoning_patterns,
        memory: data.memory,
        tools: data.tools,
        guardrails: data.guardrails,
        workflow_steps: data.workflow_steps,
        performance_config: data.performance_config
      };

      console.log('Creating Strands workflow with config:', strandsConfig);

      // Create the Strands workflow
      const result = await strandsSDK.createAgent(strandsConfig);
      
      if (isUnmountedRef.current) return;

      // Success
      toast({
        title: "Strands Workflow Created Successfully! 🧠",
        description: `${data.name} is now ready with advanced reasoning capabilities`,
        duration: 5000,
      });

      // Close dialog after short delay
      submitTimeoutRef.current = setTimeout(() => {
        if (!isUnmountedRef.current) {
          onOpenChange(false);
          resetForm();
        }
      }, 1500);

    } catch (error) {
      if (isUnmountedRef.current) return;
      
      console.error('Strands workflow creation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Failed to Create Strands Workflow",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      
      setIsSubmitting(false);
    }
  }, [isSubmitting, toast, onOpenChange, resetForm]);

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
    handleReasoningPatternToggle,
    handleMemoryToggle,
    handleToolToggle,
    handleWorkflowStepAdd,
    handleWorkflowStepRemove,
    handleWorkflowStepUpdate,
    onSubmit: form.handleSubmit(onSubmit),
    cancelSubmission
  };
};