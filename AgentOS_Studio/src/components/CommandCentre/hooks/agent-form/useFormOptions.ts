
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AgentFormValues, ModelOption } from '../../CreateAgent/types';
import { roles } from '../../CreateAgent/toolsRolesData';

export const useFormOptions = (
  form: UseFormReturn<AgentFormValues>,
  setSelectedModel: (model: ModelOption | null) => void,
  setSelectedProvider: (provider: string) => void,
  isUnmountedRef: React.MutableRefObject<boolean>
) => {
  const handleProviderChange = useCallback((provider: string) => {
    if (!isUnmountedRef.current) {
      setSelectedProvider(provider);
      setSelectedModel(null);
      form.setValue('provider', provider);
      form.setValue('model', '');
    }
  }, [form, setSelectedProvider, setSelectedModel, isUnmountedRef]);

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

  return {
    handleProviderChange,
    handleRoleSelect,
    handleMemoryToggle,
    handleToolToggle
  };
};
