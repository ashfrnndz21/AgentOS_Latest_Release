
import React from 'react';
import { Brain } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface LangChainToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  apiKeyValid: boolean;
}

export const LangChainToggle: React.FC<LangChainToggleProps> = ({
  enabled,
  onChange,
  apiKeyValid
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Brain className={`h-4 w-4 ${enabled ? 'text-purple-400' : 'text-gray-500'}`} />
      <Label htmlFor="langchain-mode" className={`text-sm ${enabled ? 'text-white' : 'text-gray-400'}`}>
        LangChain Mode
      </Label>
      <Switch
        id="langchain-mode"
        checked={enabled}
        onCheckedChange={onChange}
        disabled={!apiKeyValid}
        className={!apiKeyValid ? 'cursor-not-allowed opacity-50' : ''}
      />
    </div>
  );
};
