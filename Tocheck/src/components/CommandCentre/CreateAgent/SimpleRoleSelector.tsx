import React from 'react';
import { Label } from '@/components/ui/label';
import { RoleOption } from './types';
import { Textarea } from '@/components/ui/textarea';

interface SimpleRoleSelectorProps {
  roles: RoleOption[];
  handleRoleSelect: (roleId: string) => void;
  selectedRole: string;
  description: string;
  onDescriptionChange: (description: string) => void;
}

export const SimpleRoleSelector: React.FC<SimpleRoleSelectorProps> = ({
  roles,
  handleRoleSelect,
  selectedRole,
  description,
  onDescriptionChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-white">Agent Role</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => handleRoleSelect(role.id)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedRole === role.id
                  ? 'border-beam-blue bg-beam-blue/10 text-white'
                  : 'border-gray-700 bg-beam-dark hover:border-gray-600 text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{role.icon}</span>
                <span className="font-medium">{role.name}</span>
              </div>
              <p className="text-sm text-gray-400">{role.description}</p>
            </button>
          ))}
        </div>
        <p className="text-gray-400 text-sm">
          Choose a role that best describes your agent's purpose
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Description</Label>
        <Textarea
          placeholder="Describe your agent's specific capabilities and purpose..."
          className="bg-beam-dark border-gray-700 text-white min-h-[100px]"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
        <p className="text-gray-400 text-sm">
          Provide a detailed description of what your agent should do
        </p>
      </div>
    </div>
  );
};