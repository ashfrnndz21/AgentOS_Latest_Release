
import React, { useCallback, useEffect } from 'react';
import { Cpu, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { ModelOption } from '../types';
import { ProviderTabs } from './ProviderTabs';
import { ModelItem } from './ModelItem';

interface ModelSelectorProps {
  control: Control<any>;
  selectedModel: ModelOption | null;
  setSelectedModel: (model: ModelOption | null) => void;
  selectedProvider: string;
  handleProviderChange: (provider: string) => void;
  AIModels: Record<string, ModelOption[]>;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  control,
  selectedModel,
  setSelectedModel,
  selectedProvider,
  handleProviderChange,
  AIModels,
}) => {
  // Create a memoized handler for model selection to prevent re-renders
  const handleModelSelect = useCallback((model: ModelOption, onChange: (value: string) => void) => {
    console.log('Selecting model:', model.id, model.name);
    setSelectedModel(model);
    onChange(model.id);
  }, [setSelectedModel]);
  
  // Add debugging log for available models
  useEffect(() => {
    console.log('Available models for provider:', selectedProvider, AIModels[selectedProvider]);
  }, [selectedProvider, AIModels]);

  return (
    <div className="space-y-4">
      <FormLabel className="text-white block">AI Provider</FormLabel>
      <ProviderTabs 
        selectedProvider={selectedProvider}
        handleProviderChange={handleProviderChange}
      />

      <FormField
        control={control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">AI Model</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className={`w-full justify-between bg-beam-dark border-gray-700 text-left ${!selectedModel ? 'text-gray-400' : 'text-white'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Model selector button clicked");
                  }}
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
                onInteractOutside={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("PopoverContent clicked, preventing propagation");
                }}
              >
                <div 
                  className="max-h-[300px] overflow-y-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Model list container clicked");
                  }}
                >
                  {AIModels[selectedProvider]?.map((model) => (
                    <ModelItem
                      key={model.id}
                      model={model}
                      isSelected={field.value === model.id}
                      onSelect={() => {
                        console.log("ModelItem clicked for model:", model.id);
                        // Directly call the handler here to ensure it's executed
                        handleModelSelect(model, field.onChange);
                      }}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <FormDescription className="text-gray-400">
              Select the AI model that best fits your use case (optional)
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
};
