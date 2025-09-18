import React, { useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { StrandsWorkflowDialogContent } from './StrandsWorkflowDialogContent';
import { useStrandsWorkflowForm } from './hooks/useStrandsWorkflowForm';
import { StrandsModels } from './models';
import { strandsTools, reasoningPatterns, memoryTypes } from './strandsData';

interface CreateStrandsWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateStrandsWorkflowDialog: React.FC<CreateStrandsWorkflowDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const {
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
    onSubmit,
    cancelSubmission
  } = useStrandsWorkflowForm(onOpenChange);
  
  // Handle form reset when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
    
    // Cleanup on unmount or when closing
    return () => {
      if (isSubmitting) {
        cancelSubmission();
      }
    };
  }, [open, resetForm, isSubmitting, cancelSubmission]);

  // Handle dialog state changes
  const handleOpenChange = (newOpenState: boolean) => {
    // Don't allow closing during submission
    if (!newOpenState && isSubmitting) {
      console.log("Preventing dialog close during submission");
      return;
    }
    
    // Update the open state
    onOpenChange(newOpenState);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <StrandsWorkflowDialogContent
        open={open}
        onOpenChange={handleOpenChange}
        isSubmitting={isSubmitting}
        form={form}
        step={step}
        prevStep={prevStep}
        nextStep={nextStep}
        onSubmit={onSubmit}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedProvider={selectedProvider}
        handleProviderChange={handleProviderChange}
        handleReasoningPatternToggle={handleReasoningPatternToggle}
        handleMemoryToggle={handleMemoryToggle}
        handleToolToggle={handleToolToggle}
        handleWorkflowStepAdd={handleWorkflowStepAdd}
        handleWorkflowStepRemove={handleWorkflowStepRemove}
        handleWorkflowStepUpdate={handleWorkflowStepUpdate}
        StrandsModels={StrandsModels}
        strandsTools={strandsTools}
        reasoningPatterns={reasoningPatterns}
        memoryTypes={memoryTypes}
      />
    </Dialog>
  );
};