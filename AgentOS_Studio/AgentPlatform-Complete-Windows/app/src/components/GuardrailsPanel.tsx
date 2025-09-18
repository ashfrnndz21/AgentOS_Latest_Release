
import React from 'react';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { InfoPanel } from './AgentCard';

export type GuardrailType = {
  id: string;
  name: string;
  description: string;
  type: 'custom' | 'pii' | 'sensitive' | 'regex' | 'llm';
  active: boolean;
};

interface GuardrailsPanelProps {
  guardrails?: GuardrailType[];
}

export const GuardrailsPanel: React.FC<GuardrailsPanelProps> = ({ guardrails = [] }) => {
  // If no guardrails provided, show defaults
  const defaultGuardrails: GuardrailType[] = guardrails.length > 0 ? guardrails : [
    {
      id: 'pii-protection',
      name: 'PII Protection',
      description: 'Protects against leaking personally identifiable information',
      type: 'pii',
      active: true,
    },
    {
      id: 'sensitive-info',
      name: 'Sensitive Information Filter',
      description: 'Filters out sensitive company information',
      type: 'sensitive',
      active: true,
    },
    {
      id: 'content-filter',
      name: 'Content Moderation',
      description: 'Filters inappropriate content and ensures appropriate responses',
      type: 'custom',
      active: true,
    }
  ];

  const getGuardrailIcon = (type: GuardrailType['type']) => {
    switch (type) {
      case 'pii':
        return <Shield className="text-purple-400" />;
      case 'sensitive':
        return <Lock className="text-indigo-400" />;
      case 'custom':
      case 'regex':
      case 'llm':
      default:
        return <AlertTriangle className="text-amber-400" />;
    }
  };

  return (
    <InfoPanel title="Active Guardrails">
      <div className="space-y-4">
        {defaultGuardrails.map((guardrail) => (
          <div key={guardrail.id} className="p-3 bg-beam-dark rounded-md border border-gray-700">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getGuardrailIcon(guardrail.type)}
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">{guardrail.name}</h4>
                <p className="text-sm text-gray-400">{guardrail.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </InfoPanel>
  );
};
