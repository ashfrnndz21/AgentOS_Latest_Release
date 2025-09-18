
import React, { useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { AgentDialogContent } from './CreateAgent/AgentDialogContent';
import { useAgentForm } from './CreateAgent/hooks/useAgentForm';
import { AIModels } from './CreateAgent/models';
import { tools, roles } from './CreateAgent';

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAgentDialog: React.FC<CreateAgentDialogProps> = ({ 
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
    handleRoleSelect,
    handleMemoryToggle,
    handleToolToggle,
    onSubmit,
    cancelSubmission
  } = useAgentForm(onOpenChange);
  
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
      <AgentDialogContent
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
        handleRoleSelect={handleRoleSelect}
        handleMemoryToggle={handleMemoryToggle}
        handleToolToggle={handleToolToggle}
        AIModels={AIModels}
        tools={tools}
        roles={roles}
      />
    </Dialog>
  );
};
