
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { AgentFormValues, ModelOption } from '../CreateAgent/types';
import { 
  useFormSubmission,
  useFormNavigation,
  useFormCleanup,
  useFormOptions
} from './agent-form';

export const useAgentForm = (onOpenChange: (open: boolean) => void) => {
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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
  
  // Use our smaller hooks
  const { resetForm, cancelSubmission, submitTimeoutRef } = useFormCleanup(
    form,
    setIsSubmitting,
    setSelectedModel,
    setSelectedProvider,
    setStep,
    isUnmountedRef,
    defaultValues
  );
  
  const { nextStep, prevStep } = useFormNavigation(
    form,
    step,
    setStep,
    isUnmountedRef
  );
  
  const { 
    handleProviderChange, 
    handleRoleSelect, 
    handleMemoryToggle, 
    handleToolToggle 
  } = useFormOptions(
    form,
    setSelectedModel,
    setSelectedProvider,
    isUnmountedRef
  );
  
  const { onSubmit } = useFormSubmission(
    form,
    selectedModel,
    step,
    nextStep,
    isSubmitting,
    setIsSubmitting,
    onOpenChange,
    resetForm,
    isUnmountedRef
  );

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
