
import { useCallback, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { AgentFormValues, ModelOption } from '../../CreateAgent/types';

export const useFormSubmission = (
  form: UseFormReturn<AgentFormValues>,
  selectedModel: ModelOption | null,
  step: number,
  nextStep: () => void,
  isSubmitting: boolean,
  setIsSubmitting: (value: boolean) => void,
  onOpenChange: (open: boolean) => void,
  resetForm: () => void,
  isUnmountedRef: React.MutableRefObject<boolean>
) => {
  const { toast } = useToast();
  
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
      
      // Show toast notification
      toast({
        title: "Agent Created",
        description: `${values.name} (${values.role}) has been added to your workspace with ${selectedModel?.name || 'default model'}`,
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
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive"
      });
      
      if (!isUnmountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [selectedModel, toast, onOpenChange, step, nextStep, isSubmitting, resetForm, setIsSubmitting, isUnmountedRef, form]);

  return { onSubmit };
};
