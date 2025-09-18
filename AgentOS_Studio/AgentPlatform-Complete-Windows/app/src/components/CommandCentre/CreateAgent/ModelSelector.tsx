
import React, { useCallback } from 'react';
import { Cpu, Check, ChevronDown, Lightbulb, Zap, DollarSign, ImageIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { FormDescription, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModelOption } from './types';

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
  // Render capability bar with the given score (1-10)
  const renderCapabilityBar = (score: number, max: number = 10) => {
    return (
      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600" 
          style={{ width: `${(score / max) * 100}%` }}
        />
      </div>
    );
  };

  // Create a memoized handler for model selection
  const handleModelSelect = useCallback((model: ModelOption, onChange: (value: string) => void) => {
    console.log('Selecting model:', model.id, model.name);
    setSelectedModel(model);
    onChange(model.id);
  }, [setSelectedModel]);

  return (
    <div className="space-y-4">
      <FormLabel className="text-white block">AI Provider</FormLabel>
      <Tabs 
        defaultValue={selectedProvider} 
        value={selectedProvider}
        onValueChange={handleProviderChange}
        className="w-full"
      >
        <TabsList className="bg-beam-dark w-full grid grid-cols-5 gap-1">
          <TabsTrigger 
            value="openai" 
            className="data-[state=active]:bg-beam-blue/30 data-[state=active]:text-beam-blue-light"
          >
            OpenAI
          </TabsTrigger>
          <TabsTrigger 
            value="anthropic" 
            className="data-[state=active]:bg-beam-blue/30 data-[state=active]:text-beam-blue-light"
          >
            Anthropic
          </TabsTrigger>
          <TabsTrigger 
            value="meta" 
            className="data-[state=active]:bg-beam-blue/30 data-[state=active]:text-beam-blue-light"
          >
            Meta
          </TabsTrigger>
          <TabsTrigger 
            value="deepseek" 
            className="data-[state=active]:bg-beam-blue/30 data-[state=active]:text-beam-blue-light"
          >
            DeepSeek
          </TabsTrigger>
          <TabsTrigger 
            value="amazon" 
            className="data-[state=active]:bg-beam-blue/30 data-[state=active]:text-beam-blue-light"
          >
            Amazon
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <FormField
        control={control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">AI Model</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
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
                    "Select a model"
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[300px] p-0 bg-beam-dark-accent border-gray-700 text-white"
                sideOffset={4}
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
              >
                <div className="max-h-[300px] overflow-y-auto">
                  {AIModels[selectedProvider]?.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      className="w-full text-left flex flex-col p-3 border-b border-gray-700 hover:bg-beam-blue/10 focus:outline-none focus:bg-beam-blue/20"
                      onClick={() => handleModelSelect(model, field.onChange)}
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
                        {field.value === model.id && <Check size={16} className="text-green-400" />}
                      </div>
                      
                      <p className="text-sm text-gray-300 mt-1">{model.description}</p>
                      
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-300 mb-1">
                            <Lightbulb size={12} className="text-yellow-400" />
                            Reasoning
                          </div>
                          {renderCapabilityBar(model.capabilities.reasoning)}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-1 text-xs text-gray-300 mb-1">
                            <Zap size={12} className="text-blue-400" />
                            Speed
                          </div>
                          {renderCapabilityBar(model.capabilities.speed)}
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
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <FormDescription className="text-gray-400">
              Select the AI model that best fits your use case
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
};
