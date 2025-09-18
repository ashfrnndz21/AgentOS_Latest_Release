
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle } from 'lucide-react';
import { Guardrail } from './GuardrailData';

interface GuardrailItemProps {
  guardrail: Guardrail;
  onToggle: (id: string) => void;
}

export const GuardrailItem: React.FC<GuardrailItemProps> = ({ guardrail, onToggle }) => {
  
  // Function to get severity icon based on severity level
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle size={14} className="text-red-400" />;
      case 'medium':
        return <AlertTriangle size={14} className="text-yellow-400" />;
      default:
        return <AlertTriangle size={14} className="text-blue-400" />;
    }
  };

  return (
    <div 
      key={guardrail.id} 
      className="p-3 rounded-lg border border-gray-700/50 bg-beam-dark-accent/20"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-medium">{guardrail.name}</h3>
            {getSeverityIcon(guardrail.severity)}
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
              {guardrail.category}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">{guardrail.description}</p>
        </div>
        <Switch 
          checked={guardrail.enabled} 
          onCheckedChange={() => onToggle(guardrail.id)}
          className="ml-4"
        />
      </div>
    </div>
  );
};
