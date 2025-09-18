import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { StrandsWorkflowFormValues, StrandsModelOption } from '../types';
import { Cloud, Cpu, Zap, Settings } from 'lucide-react';

interface StrandsModelConfigProps {
  form: UseFormReturn<StrandsWorkflowFormValues>;
  selectedModel: StrandsModelOption | null;
  setSelectedModel: (model: StrandsModelOption | null) => void;
  selectedProvider: string;
  handleProviderChange: (provider: string) => void;
  StrandsModels: StrandsModelOption[];
}

export const StrandsModelConfig: React.FC<StrandsModelConfigProps> = ({
  form,
  selectedModel,
  setSelectedModel,
  selectedProvider,
  handleProviderChange,
  StrandsModels
}) => {
  const { setValue, watch } = form;
  const performanceConfig = watch('performance_config');

  const providerModels = StrandsModels.filter(model => model.provider === selectedProvider);

  const handleModelSelect = (modelId: string) => {
    const model = StrandsModels.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      setValue('model', modelId);
      
      // Auto-adjust performance config based on model capabilities
      const currentConfig = performanceConfig;
      if (model.context_window > 100000) {
        // Large context models can handle more tokens
        updatePerformanceConfig('max_tokens', Math.min(8000, currentConfig.max_tokens));
      }
      
      // Advanced models can handle deeper reasoning
      if (model.reasoning_capabilities.includes('tree_of_thought')) {
        updatePerformanceConfig('max_reasoning_depth', Math.max(7, currentConfig.max_reasoning_depth));
      }
    }
  };

  const updatePerformanceConfig = (key: string, value: number) => {
    setValue('performance_config', {
      ...performanceConfig,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-600/20 rounded-full">
            <Cpu size={32} className="text-blue-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white">Model & Performance Configuration</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Select the AI model and configure performance parameters for optimal reasoning
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white">Provider *</Label>
          <Select value={selectedProvider} onValueChange={handleProviderChange}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="bedrock" className="text-white">
                <div className="flex items-center gap-2">
                  <Cloud size={16} className="text-orange-400" />
                  AWS Bedrock (Recommended)
                </div>
              </SelectItem>
              <SelectItem value="openai" className="text-white">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-green-400" />
                  OpenAI
                </div>
              </SelectItem>
              <SelectItem value="anthropic" className="text-white">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-blue-400" />
                  Anthropic
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Model *</Label>
          <Select value={selectedModel?.id || ''} onValueChange={handleModelSelect}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {providerModels.map((model) => (
                <SelectItem key={model.id} value={model.id} className="text-white">
                  <div className="space-y-1">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray-400">
                      Context: {model.context_window.toLocaleString()} tokens
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedModel && (
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Settings size={16} />
              Model Capabilities
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {selectedModel.reasoning_capabilities.map((capability) => (
                <div key={capability} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 capitalize">
                    {capability.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-white font-medium">Performance Parameters</h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-white">Temperature</Label>
              <span className="text-gray-400 text-sm">{performanceConfig.temperature}</span>
            </div>
            <Slider
              value={[performanceConfig.temperature]}
              onValueChange={([value]) => updatePerformanceConfig('temperature', value)}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-gray-500 text-xs">
              Lower values for more focused reasoning, higher for more creative thinking
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-white">Max Tokens</Label>
              <span className="text-gray-400 text-sm">{performanceConfig.max_tokens}</span>
            </div>
            <Slider
              value={[performanceConfig.max_tokens]}
              onValueChange={([value]) => updatePerformanceConfig('max_tokens', value)}
              max={8000}
              min={1000}
              step={500}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-white">Max Reasoning Depth</Label>
              <span className="text-gray-400 text-sm">{performanceConfig.max_reasoning_depth}</span>
            </div>
            <Slider
              value={[performanceConfig.max_reasoning_depth]}
              onValueChange={([value]) => updatePerformanceConfig('max_reasoning_depth', value)}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-white">Reflection Cycles</Label>
              <span className="text-gray-400 text-sm">{performanceConfig.reflection_cycles}</span>
            </div>
            <Slider
              value={[performanceConfig.reflection_cycles]}
              onValueChange={([value]) => updatePerformanceConfig('reflection_cycles', value)}
              max={5}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};