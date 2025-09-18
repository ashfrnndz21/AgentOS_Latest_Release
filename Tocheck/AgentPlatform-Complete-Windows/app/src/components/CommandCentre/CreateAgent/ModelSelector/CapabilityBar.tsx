
import React from 'react';

interface CapabilityBarProps {
  score: number;
  max?: number;
}

export const CapabilityBar: React.FC<CapabilityBarProps> = ({ 
  score, 
  max = 10 
}) => {
  return (
    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-400 to-blue-600" 
        style={{ width: `${(score / max) * 100}%` }}
      />
    </div>
  );
};
