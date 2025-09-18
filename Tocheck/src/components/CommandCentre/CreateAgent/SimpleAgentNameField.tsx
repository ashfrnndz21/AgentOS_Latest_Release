import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SimpleAgentNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const SimpleAgentNameField: React.FC<SimpleAgentNameFieldProps> = ({ 
  value, 
  onChange 
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-white">Agent Name</Label>
      <Input 
        placeholder="Enter agent name" 
        className="bg-beam-dark border-gray-700 text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
      <p className="text-gray-400 text-sm">
        This will be the display name for your agent
      </p>
    </div>
  );
};