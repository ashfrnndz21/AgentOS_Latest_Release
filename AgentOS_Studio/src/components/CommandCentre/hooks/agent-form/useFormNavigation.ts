
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { AgentFormValues } from '../../CreateAgent/types';

export const useFormNavigation = (
  form: UseFormReturn<AgentFormValues>,
  step: number,
  setStep: (step: number) => void,
  isUnmountedRef: React.MutableRefObject<boolean>
) => {
  const { toast } = useToast();

  const nextStep = useCallback(() => {
    // Allow proceeding to next step without validations
    if (!isUnmountedRef.current) {
      console.log(`Moving from step ${step} to step ${Math.min(step + 1, 5)}`);
      setStep(Math.min(step + 1, 5));
    }
  }, [form, step, toast, setStep, isUnmountedRef]);

  const prevStep = useCallback(() => {
    if (!isUnmountedRef.current) {
      console.log(`Moving back from step ${step} to step ${Math.max(step - 1, 1)}`);
      setStep(Math.max(step - 1, 1));
    }
  }, [setStep, isUnmountedRef, step]);

  return { nextStep, prevStep };
};
