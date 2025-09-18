
import React from 'react';
import { FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { RoleOption } from './types';
import { Textarea } from '@/components/ui/textarea';

interface RoleSelectorProps {
  control: Control<any>;
  roles: RoleOption[];
  handleRoleSelect: (roleId: string) => void;
  selectedRole: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  control,
  roles,
  handleRoleSelect,
  selectedRole,
}) => {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Agent Role</FormLabel>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {roles.map((role) => (
                <div 
                  key={role.id}
                  className={`border ${field.value === role.id ? 'border-beam-blue bg-beam-blue/10' : 'border-gray-700 bg-beam-dark'} 
                            rounded-md p-3 cursor-pointer hover:bg-gray-800 transition-colors flex flex-col`}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <div className="flex items-center gap-2">
                    {role.icon}
                    <span className="font-medium text-sm">{role.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{role.description}</p>
                </div>
              ))}
            </div>
            <FormDescription className="text-gray-400 mt-2">
              Select the primary role for your agent
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Agent Description</FormLabel>
            <FormDescription className="text-gray-400 mb-2">
              This description helps define the agent's purpose and capabilities
            </FormDescription>
            <Textarea 
              placeholder="Describe what this agent does..." 
              className="bg-beam-dark border-gray-700 text-white resize-none min-h-24"
              {...field} 
              required
            />
          </FormItem>
        )}
      />
    </div>
  );
};
