
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';

interface AgentNameFieldProps {
  control: Control<any>;
}

export const AgentNameField: React.FC<AgentNameFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-white">Agent Name</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter agent name" 
              className="bg-beam-dark border-gray-700 text-white"
              {...field} 
              required
            />
          </FormControl>
          <FormDescription className="text-gray-400">
            This will be the display name for your agent
          </FormDescription>
        </FormItem>
      )}
    />
  );
};
