
import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface StepNavigationProps {
  step: number;
  prevStep: () => void;
  nextStep: () => void;
  isLastStep: boolean;
  isSubmitting?: boolean;
  totalSteps?: number;
  submitText?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  step,
  prevStep,
  nextStep,
  isLastStep,
  isSubmitting = false,
  totalSteps = 4,
  submitText = 'Create Agent',
}) => {
  return (
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
        
        {!isLastStep ? (
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
            type="submit" 
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : submitText}
          </Button>
        )}
      </div>
      
      <div className="text-xs text-gray-400 flex items-center gap-1">
        <Info size={12} />
        Step {step} of {totalSteps}
      </div>
    </DialogFooter>
  );
};
