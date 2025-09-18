
import React from 'react';
import { Check, Cpu, DollarSign, ImageIcon, Lightbulb, Zap } from 'lucide-react';
import { ModelOption } from '../types';
import { CapabilityBar } from './CapabilityBar';

interface ModelItemProps {
  model: ModelOption;
  isSelected: boolean;
  onSelect: () => void;
}

export const ModelItem: React.FC<ModelItemProps> = ({
  model,
  isSelected,
  onSelect,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    // Prevent event bubbling to ensure selection works properly
    e.preventDefault();
    e.stopPropagation();
    
    // Call the selection handler
    onSelect();
  };

  return (
    <button
      type="button"
      className="w-full text-left flex flex-col p-3 border-b border-gray-700 hover:bg-beam-blue/10 focus:outline-none focus:bg-beam-blue/20"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-beam-blue" />
          <span className="font-medium">{model.name}</span>
          {model.badge && (
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
              {model.badge}
            </span>
          )}
        </div>
        {isSelected && <Check size={16} className="text-green-400" />}
      </div>
      
      <p className="text-sm text-gray-300 mt-1">{model.description}</p>
      
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-300 mb-1">
            <Lightbulb size={12} className="text-yellow-400" />
            Reasoning
          </div>
          <CapabilityBar score={model.capabilities.reasoning} />
        </div>
        
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-300 mb-1">
            <Zap size={12} className="text-blue-400" />
            Speed
          </div>
          <CapabilityBar score={model.capabilities.speed} />
        </div>
        
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-300 mb-1">
            <DollarSign size={12} className="text-green-400" />
            Cost
          </div>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <DollarSign 
                key={index} 
                size={12} 
                className={index < model.cost / 2 ? "text-green-400" : "text-gray-600"} 
              />
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-300 mb-1">
            <ImageIcon size={12} className="text-purple-400" />
            Multimodal
          </div>
          <div className="text-xs">
            {model.capabilities.multimodal ? 
              <span className="text-green-400">Supported</span> : 
              <span className="text-red-400">Not supported</span>
            }
          </div>
        </div>
      </div>
    </button>
  );
};
