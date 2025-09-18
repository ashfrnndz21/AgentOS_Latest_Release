import React, { useState, useEffect } from 'react';
import { Settings, Brain, Zap, Target, Layers, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ragService, type RAGConfig } from '@/lib/services/RAGService';
import { ollamaService } from '@/lib/services/OllamaService';
import { useIndustryContext } from '@/contexts/IndustryContext';

interface RAGConfigurationProps {
  config: RAGConfig;
  onConfigChange: (config: RAGConfig) => void;
  showAdvanced?: boolean;
  className?: string;
}

export const RAGConfiguration: React.FC<RAGConfigurationProps> = ({
  config,
  onConfigChange,
  showAdvanced = false,
  className = '',
}) => {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(showAdvanced);
  const { currentIndustry } = useIndustryContext();

  // Load available Ollama models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await ollamaService.listModels();
        const modelNames = models.map(m => m.name);
        setAvailableModels(modelNames);
      } catch (error) {
        console.error('Failed to load models:', error);
        // Fallback to common models
        setAvailableModels(['llama2', 'mistral', 'phi3', 'nomic-embed-text']);
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  const handleConfigChange = (updates: Partial<RAGConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const loadIndustryDefaults = () => {
    const industryConfig = ragService.getIndustryRAGConfig(currentIndustry);
    onConfigChange(industryConfig);
  };

  const resetToDefaults = () => {
    const defaultConfig: RAGConfig = {
      embeddingModel: 'nomic-embed-text',
      generationModel: 'llama2',
      chunkSize: 512,
      chunkOverlap: 50,
      similarityThreshold: 0.7,
      maxRetrievedChunks: 5,
      reranking: true,
    };
    onConfigChange(defaultConfig);
  };

  const getEmbeddingModels = () => {
    return availableModels.filter(model => 
      model.includes('embed') || model.includes('nomic')
    );
  };

  const getGenerationModels = () => {
    return availableModels.filter(model => 
      !model.includes('embed') && !model.includes('nomic')
    );
  };

  const getPerformanceLevel = () => {
    const { chunkSize, maxRetrievedChunks, reranking } = config;
    
    if (chunkSize <= 256 && maxRetrievedChunks <= 3 && !reranking) {
      return { level: 'Fast', color: 'text-green-400', description: 'Optimized for speed' };
    } else if (chunkSize >= 1024 || maxRetrievedChunks >= 8 || reranking) {
      return { level: 'Accurate', color: 'text-blue-400', description: 'Optimized for quality' };
    } else {
      return { level: 'Balanced', color: 'text-yellow-400', description: 'Good balance of speed and quality' };
    }
  };

  const performance = getPerformanceLevel();

  return (
    <TooltipProvider>
      <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings size={20} className="text-purple-400" />
              <h3 className="text-lg font-medium text-white">RAG Configuration</h3>
              <Badge className={`${performance.color} bg-transparent border-current`}>
                {performance.level}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={loadIndustryDefaults}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Industry Defaults
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {showAdvancedSettings ? 'Simple' : 'Advanced'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-1">{performance.description}</p>
        </div>

        <div className="p-4 space-y-6">
          {/* Model Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-white">Embedding Model</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle size={14} className="text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Model used to convert documents into vector embeddings</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={config.embeddingModel}
                onValueChange={(value) => handleConfigChange({ embeddingModel: value })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getEmbeddingModels().map(model => (
                    <SelectItem key={model} value={model}>
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-amber-400" />
                        {model}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-white">Generation Model</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle size={14} className="text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Model used to generate responses based on retrieved context</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={config.generationModel}
                onValueChange={(value) => handleConfigChange({ generationModel: value })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getGenerationModels().map(model => (
                    <SelectItem key={model} value={model}>
                      <div className="flex items-center gap-2">
                        <Brain size={14} className="text-purple-400" />
                        {model}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-white">Chunk Size</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle size={14} className="text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of tokens per document chunk (256-2048)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[config.chunkSize]}
                  onValueChange={([value]) => handleConfigChange({ chunkSize: value })}
                  min={256}
                  max={2048}
                  step={64}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>256</span>
                  <span className="text-white">{config.chunkSize} tokens</span>
                  <span>2048</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-white">Max Retrieved Chunks</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle size={14} className="text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Maximum number of relevant chunks to retrieve (1-20)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[config.maxRetrievedChunks]}
                  onValueChange={([value]) => handleConfigChange({ maxRetrievedChunks: value })}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1</span>
                  <span className="text-white">{config.maxRetrievedChunks} chunks</span>
                  <span>20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvancedSettings && (
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <Layers size={16} className="text-purple-400" />
                Advanced Settings
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-white">Chunk Overlap</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle size={14} className="text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of overlapping tokens between chunks</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    value={config.chunkOverlap}
                    onChange={(e) => handleConfigChange({ chunkOverlap: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={config.chunkSize / 2}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-white">Similarity Threshold</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle size={14} className="text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Minimum similarity score for chunk retrieval (0.0-1.0)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-2">
                    <Slider
                      value={[config.similarityThreshold]}
                      onValueChange={([value]) => handleConfigChange({ similarityThreshold: value })}
                      min={0.0}
                      max={1.0}
                      step={0.05}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0.0</span>
                      <span className="text-white">{config.similarityThreshold.toFixed(2)}</span>
                      <span>1.0</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-green-400" />
                  <div>
                    <Label className="text-white">Enable Reranking</Label>
                    <p className="text-xs text-gray-400">
                      Improve result quality with additional ranking
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.reranking}
                  onCheckedChange={(checked) => handleConfigChange({ reranking: checked })}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Reset to Defaults
            </Button>
            
            <div className="text-xs text-gray-500">
              Configuration will be applied to new RAG operations
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};