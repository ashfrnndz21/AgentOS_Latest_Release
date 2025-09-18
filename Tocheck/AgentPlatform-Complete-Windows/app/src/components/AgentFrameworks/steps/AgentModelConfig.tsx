import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Zap, Brain, Cloud } from 'lucide-react';

interface ModelConfig {
  provider: string;
  modelId: string;
}

interface AgentModelConfigProps {
  framework?: string;
  selectedModel?: ModelConfig;
  onModelSelect: (model: ModelConfig) => void;
  apiStatus?: {
    openai: boolean;
    anthropic: boolean;
    bedrock: boolean;
  };
}

const modelConfigurations = {
  generic: {
    openai: [
      { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model for complex tasks', tier: 'premium' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Faster GPT-4 with updated knowledge', tier: 'premium' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks', tier: 'standard' }
    ],
    anthropic: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most powerful Claude model', tier: 'premium' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed', tier: 'standard' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and lightweight', tier: 'standard' }
    ]
  },
  strands: {
    bedrock: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Advanced reasoning capabilities', tier: 'premium' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced reasoning performance', tier: 'standard' },
      { id: 'titan-text-express', name: 'Titan Text Express', description: 'AWS native text model', tier: 'standard' }
    ]
  },
  agentcore: {
    bedrock: [
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Optimized for agent workflows', tier: 'standard' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Enterprise-grade performance', tier: 'premium' },
      { id: 'titan-text-premier', name: 'Titan Text Premier', description: 'AWS optimized for agents', tier: 'premium' }
    ]
  }
};

export const AgentModelConfig: React.FC<AgentModelConfigProps> = ({
  framework = 'generic',
  selectedModel,
  onModelSelect,
  apiStatus
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>(
    selectedModel?.provider || (framework === 'generic' ? 'openai' : 'bedrock')
  );

  const getAvailableProviders = () => {
    if (framework === 'generic') {
      return [
        { id: 'openai', name: 'OpenAI', available: apiStatus?.openai || false, icon: Brain },
        { id: 'anthropic', name: 'Anthropic', available: apiStatus?.anthropic || false, icon: Zap }
      ];
    } else {
      return [
        { id: 'bedrock', name: 'AWS Bedrock', available: apiStatus?.bedrock || false, icon: Cloud }
      ];
    }
  };

  const getAvailableModels = () => {
    const frameworkModels = modelConfigurations[framework as keyof typeof modelConfigurations];
    if (!frameworkModels) return [];
    
    return frameworkModels[selectedProvider as keyof typeof frameworkModels] || [];
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    // Reset model selection when provider changes
    if (selectedModel?.provider !== provider) {
      const models = modelConfigurations[framework as keyof typeof modelConfigurations]?.[provider as keyof any];
      if (models && models.length > 0) {
        onModelSelect({ provider, modelId: models[0].id });
      }
    }
  };

  const handleModelChange = (modelId: string) => {
    onModelSelect({ provider: selectedProvider, modelId });
  };

  const providers = getAvailableProviders();
  const models = getAvailableModels();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Model Configuration</h3>
        <p className="text-sm text-gray-400">
          Select the AI model that will power your {framework} agent.
        </p>
      </div>

      {/* Provider Selection */}
      <Card className="bg-beam-dark-accent border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-base">AI Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {providers.map((provider) => {
              const IconComponent = provider.icon;
              const isSelected = selectedProvider === provider.id;
              
              return (
                <div
                  key={provider.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    provider.available
                      ? isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                      : 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => provider.available && handleProviderChange(provider.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-blue-400" />
                      <span className="font-medium text-white">{provider.name}</span>
                    </div>
                    {provider.available ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  
                  {!provider.available && (
                    <div className="text-xs text-red-400">
                      API key required
                    </div>
                  )}
                  
                  {isSelected && (
                    <Badge className="bg-blue-600 text-white text-xs mt-2">
                      Selected
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Model Selection */}
      {selectedProvider && models.length > 0 && (
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-base">Model Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedModel?.modelId || ''}
              onValueChange={handleModelChange}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="text-white">
                    <div className="flex items-center justify-between w-full">
                      <span>{model.name}</span>
                      <Badge 
                        variant="outline" 
                        className={`ml-2 text-xs ${
                          model.tier === 'premium' 
                            ? 'border-yellow-500 text-yellow-400' 
                            : 'border-gray-500 text-gray-400'
                        }`}
                      >
                        {model.tier}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Model Details */}
            {selectedModel?.modelId && (
              <div className="mt-4">
                {models
                  .filter(model => model.id === selectedModel.modelId)
                  .map(model => (
                    <Card key={model.id} className="bg-gray-800/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{model.name}</h4>
                          <Badge 
                            variant="outline"
                            className={
                              model.tier === 'premium' 
                                ? 'border-yellow-500 text-yellow-400' 
                                : 'border-gray-500 text-gray-400'
                            }
                          >
                            {model.tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{model.description}</p>
                      </CardContent>
                    </Card>
                  ))
                }
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configuration Summary */}
      {selectedModel && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Model Configuration</span>
            </div>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-green-300">Provider:</span>
                <span className="text-white ml-2">{selectedProvider}</span>
              </div>
              <div>
                <span className="text-green-300">Model:</span>
                <span className="text-white ml-2">{selectedModel.modelId}</span>
              </div>
              <div>
                <span className="text-green-300">Framework:</span>
                <span className="text-white ml-2">{framework}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};