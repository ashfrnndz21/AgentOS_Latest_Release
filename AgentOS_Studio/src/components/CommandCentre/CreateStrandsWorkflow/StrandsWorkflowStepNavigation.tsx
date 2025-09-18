import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Brain } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { StrandsWorkflowFormValues } from './types';

interface StrandsWorkflowStepNavigationProps {
  step: number;
  totalSteps: number;
  prevStep: () => void;
  nextStep: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  form: UseFormReturn<StrandsWorkflowFormValues>;
}

export const StrandsWorkflowStepNavigation: React.FC<StrandsWorkflowStepNavigationProps> = ({
  step,
  totalSteps,
  prevStep,
  nextStep,
  onSubmit,
  isSubmitting,
  form
}) => {
  const isLastStep = step === totalSteps;
  const isFirstStep = step === 1;
  
  console.log(`Navigation render - step: ${step}, totalSteps: ${totalSteps}, isFirstStep: ${isFirstStep}, isLastStep: ${isLastStep}`);

  // Very permissive validation to allow easy progression
  const canProceed = () => {
    try {
      const values = form.getValues();
      console.log(`Step ${step} validation - form values:`, values);
      
      // For step 1, check if name exists and has content
      if (step === 1) {
        const hasName = values && values.name && values.name.trim().length > 0;
        console.log(`Step 1 can proceed: ${hasName}, name: "${values?.name || 'undefined'}"`);
        return hasName;
      }
      
      // All other steps can proceed
      console.log(`Step ${step} can proceed: true`);
      return true;
    } catch (error) {
      console.error('Error in canProceed validation:', error);
      return false;
    }
  };

  return (
    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          console.log('Previous button clicked!');
          prevStep();
        }}
        disabled={isFirstStep || isSubmitting}
        className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700"
      >
        <ChevronLeft size={16} />
        Previous
      </Button>

      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>Step {step} of {totalSteps}</span>
      </div>

      {isLastStep ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed() || isSubmitting}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating Workflow...
            </>
          ) : (
            <>
              <Brain size={16} />
              Create Strands Workflow
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={() => {
            console.log('Next button clicked!');
            nextStep();
          }}
          disabled={false}
          className="bg-gradient-to-r from-beam-blue to-blue-600 hover:opacity-90 text-white flex items-center gap-2"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      )}
    </div>
  );
};