import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Star,
  Code,
  MessageSquare,
  Globe,
  Eye,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ollamaService, OllamaModel, PopularModel } from '@/lib/services/OllamaService';
import { useToast } from '@/hooks/use-toast';

interface OllamaModelSelectorProps {
  selectedModel: string | null;
  onModelSelect: (model: string) => void;
  className?: string;
}

export const OllamaModelSelector: React.FC<OllamaModelSelectorProps> = ({
  selectedModel,
  onModelSelect,
  className = ''
}) => {
  const { toast } = useToast();
  const [installedModels, setInstalledModels] = useState<OllamaModel[]>([]);
  const [popularModels, setPopularModels] = useState<PopularModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ollamaStatus, setOllamaStatus] = useState<string>('checking');
  const [newModelName, setNewModelName] = useState('');
  const [isPulling, setIsPulling] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      // Check Ollama status
      const status = await ollamaService.getStatus();
      setOllamaStatus(status.status);
      
      if (status.status === 'running') {
        // Load installed models
        const modelList = await ollamaService.listModels();
        setInstalledModels(modelList);
        
        // Load popular models
        const popular = await ollamaService.getPopularModels();
        setPopularModels(popular);
      }
    } catch (error) {
      console.error('Failed to load Ollama models:', error);
      setOllamaStatus('error');
      toast({
        title: "Failed to Load Models",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const pullModel = async (modelName: string) => {
    setIsPulling(modelName);
    try {
      const result = await ollamaService.pullModel(modelName);
      
      if (result.status === 'success') {
        toast({
          title: "Model Downloaded",
          description: `Successfully pulled ${modelName}`,
        });
        await loadModels(); // Refresh the list
      } else {
        toast({
          title: "Download Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
    setIsPulling(null);
    setNewModelName('');
  };

  const deleteModel = async (modelName: string) => {
    setIsDeleting(modelName);
    try {
      const result = await ollamaService.deleteModel(modelName);
      
      if (result.status === 'success') {
        toast({
          title: "Model Removed",
          description: `Successfully removed ${modelName}`,
        });
        
        // Clear selection if deleted model was selected
        if (selectedModel === modelName) {
          onModelSelect('');
        }
        
        await loadModels(); // Refresh the list
      } else {
        toast({
          title: "Removal Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Removal Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
    setIsDeleting(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Code': return <Code size={14} className="text-blue-400" />;
      case 'Multimodal': return <Eye size={14} className="text-purple-400" />;
      case 'Multilingual': return <Globe size={14} className="text-green-400" />;
      default: return <MessageSquare size={14} className="text-gray-400" />;
    }
  };

  const getModelBadges = (model: OllamaModel) => {
    const badges = [];
    
    if (model.is_chat_model) {
      badges.push(
        <Badge key="chat" variant="outline" className="text-xs border-blue-600 text-blue-400">
          Chat
        </Badge>
      );
    }
    
    if (model.is_code_model) {
      badges.push(
        <Badge key="code" variant="outline" className="text-xs border-green-600 text-green-400">
          Code
        </Badge>
      );
    }
    
    badges.push(
      <Badge key="family" variant="outline" className="text-xs border-gray-600 text-gray-400">
        {model.family}
      </Badge>
    );
    
    return badges;
  };

  useEffect(() => {
    loadModels();
  }, []);

  if (ollamaStatus === 'not_running') {
    return (
      <div className={`bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={16} className="text-yellow-400" />
          <span className="font-medium text-yellow-400">Ollama Not Running</span>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          Ollama is not currently running. Please start Ollama to use local models.
        </p>
        <div className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded mb-3">
          $ ollama serve
        </div>
        <Button
          size="sm"
          onClick={loadModels}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <RefreshCw size={14} className="mr-2" />
          Check Again
        </Button>
      </div>
    );
  }

  if (ollamaStatus === 'error') {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={16} className="text-red-400" />
          <span className="font-medium text-red-400">Connection Error</span>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          Unable to connect to Ollama. Make sure Ollama is installed and running.
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={loadModels}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw size={14} className="mr-2" />
            Retry
          </Button>
          <Button
            size="sm"
            onClick={() => window.open('https://ollama.ai', '_blank')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Install Ollama
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-green-400" />
          <span className="font-medium">Ollama Models</span>
          <Badge className="bg-green-500/20 text-green-400">
            {ollamaStatus === 'running' ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={loadModels}
          disabled={isLoading}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <Tabs defaultValue="installed" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="installed" className="data-[state=active]:bg-gray-700">
            Installed ({installedModels.length})
          </TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-gray-700">
            Popular Models
          </TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="space-y-4">
          {/* Custom Model Pull */}
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="Model name (e.g., llama3.2, mistral, codellama)"
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && newModelName.trim() && pullModel(newModelName)}
              />
              <Button
                size="sm"
                onClick={() => pullModel(newModelName)}
                disabled={!newModelName.trim() || isPulling === newModelName}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPulling === newModelName ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
              </Button>
            </div>
          </div>

          {/* Installed Models List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {installedModels.map((model) => (
              <div
                key={model.name}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedModel === model.name
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                }`}
                onClick={() => onModelSelect(model.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{model.name}</span>
                      {selectedModel === model.name && (
                        <CheckCircle size={14} className="text-green-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-400">
                        {model.size_gb} GB
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400">
                        {new Date(model.modified_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {getModelBadges(model)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show model info (could open a modal)
                        toast({
                          title: "Model Info",
                          description: `${model.name} - ${model.size_gb}GB - ${model.family} family`,
                        });
                      }}
                      className="border-gray-600 text-gray-400 hover:bg-gray-700"
                    >
                      <Info size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteModel(model.name);
                      }}
                      disabled={isDeleting === model.name}
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      {isDeleting === model.name ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {installedModels.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-400">
              <Cpu size={32} className="mx-auto mb-2 opacity-50" />
              <p>No models installed</p>
              <p className="text-sm">Pull a model to get started</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid gap-3 max-h-80 overflow-y-auto">
            {popularModels.map((model) => {
              const isInstalled = installedModels.some(installed => installed.name === model.name);
              
              return (
                <div
                  key={model.name}
                  className="p-3 border border-gray-600 rounded-lg hover:bg-gray-800/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{model.name}</span>
                        {model.recommended && (
                          <Star size={14} className="text-yellow-400 fill-current" />
                        )}
                        {isInstalled && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            Installed
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-2">{model.description}</p>
                      
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(model.category)}
                        <span className="text-xs text-gray-400">{model.category}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{model.size}</span>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {isInstalled ? (
                        <Button
                          size="sm"
                          onClick={() => onModelSelect(model.name)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Select
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => pullModel(model.name)}
                          disabled={isPulling === model.name}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isPulling === model.name ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Download size={14} className="mr-1" />
                              Pull
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};