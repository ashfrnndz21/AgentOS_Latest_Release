import React from 'react';
import { Cpu, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ModelOption } from './types';
import { ProviderTabs } from './ModelSelector/ProviderTabs';
import { ModelItem } from './ModelSelector/ModelItem';

interface SimpleModelSelectorProps {
  selectedModel: ModelOption | null;
  setSelectedModel: (model: ModelOption | null) => void;
  selectedProvider: string;
  handleProviderChange: (provider: string) => void;
  handleModelChange: (model: string) => void;
  AIModels: Record<string, ModelOption[]>;
}

export const SimpleModelSelector: React.FC<SimpleModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  selectedProvider,
  handleProviderChange,
  handleModelChange,
  AIModels,
}) => {
  const handleModelSelect = (model: ModelOption) => {
    setSelectedModel(model);
    handleModelChange(model.id);
  };

  return (
    <div className="space-y-4">
      <Label className="text-white block">AI Provider</Label>
      <ProviderTabs 
        selectedProvider={selectedProvider}
        handleProviderChange={handleProviderChange}
      />

      <div className="space-y-2">
        <Label className="text-white">AI Model</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              className={`w-full justify-between bg-beam-dark border-gray-700 text-left ${!selectedModel ? 'text-gray-400' : 'text-white'}`}
            >
              {selectedModel ? (
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-beam-blue" />
                  {selectedModel.name}
                  {selectedModel.badge && (
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                      {selectedModel.badge}
                    </span>
                  )}
                </div>
              ) : (
                "Select a model (optional)"
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[300px] p-0 bg-beam-dark-accent border-gray-700 text-white"
            sideOffset={4}
            align="start"
          >
            <div className="max-h-[300px] overflow-y-auto">
              {AIModels[selectedProvider]?.map((model) => (
                <ModelItem
                  key={model.id}
                  model={model}
                  isSelected={selectedModel?.id === model.id}
                  onSelect={() => handleModelSelect(model)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <p className="text-gray-400 text-sm">
          Select the AI model that best fits your use case (optional)
        </p>
      </div>
    </div>
  );
};