
import { useCallback, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues, ModelOption } from '../../CreateAgent/types';

export const useFormCleanup = (
  form: UseFormReturn<AgentFormValues>,
  setIsSubmitting: (value: boolean) => void, 
  setSelectedModel: (model: ModelOption | null) => void,
  setSelectedProvider: (provider: string) => void,
  setStep: (step: number) => void,
  isUnmountedRef: React.MutableRefObject<boolean>,
  defaultValues: AgentFormValues
) => {
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up timeouts
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
  }, [form, cleanup, setIsSubmitting, setSelectedModel, setSelectedProvider, setStep, isUnmountedRef, defaultValues]);

  const cancelSubmission = useCallback(() => {
    cleanup();
    
    if (!isUnmountedRef.current) {
      setIsSubmitting(false);
    }
  }, [cleanup, setIsSubmitting, isUnmountedRef]);

  return { resetForm, cancelSubmission, submitTimeoutRef };
};
