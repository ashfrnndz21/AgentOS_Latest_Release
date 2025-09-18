import { useState, useEffect } from 'react';

// Helper functions to transform model data
const formatSize = (bytes: number): string => {
  if (!bytes) return 'Unknown';
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)}GB`;
};

const getModelDescription = (name: string): string => {
  const modelDescriptions: Record<string, string> = {
    'llama3.2:1b': 'Fast, lightweight model for basic tasks',
    'llama3.2:latest': 'Balanced performance and capability',
    'phi4-mini-reasoning:latest': 'Optimized for reasoning tasks',
    'deepseek-r1:latest': 'Advanced reasoning and code generation',
    'qwen2.5:latest': 'Multilingual model with strong performance',
    'gpt-oss:20b': 'Large open-source model'
  };
  
  return modelDescriptions[name] || 'Local Ollama model';
};

const getModelBadge = (name: string): string => {
  if (name.includes('mini') || name.includes('1b')) return 'Fast';
  if (name.includes('20b') || name.includes('large')) return 'Large';
  if (name.includes('reasoning')) return 'Reasoning';
  if (name.includes('code')) return 'Code';
  return 'General';
};

const getContextWindow = (name: string): number => {
  const contextWindows: Record<string, number> = {
    'llama3.2:1b': 128000,
    'llama3.2:latest': 128000,
    'phi4-mini-reasoning:latest': 128000,
    'deepseek-r1:latest': 128000,
    'qwen2.5:latest': 128000,
    'gpt-oss:20b': 32000
  };
  
  return contextWindows[name] || 32000;
};

const getModelCapabilities = (name: string): { reasoning: number; speed: number; knowledge: number } => {
  const capabilities: Record<string, { reasoning: number; speed: number; knowledge: number }> = {
    'llama3.2:1b': { reasoning: 6, speed: 9, knowledge: 7 },
    'llama3.2:latest': { reasoning: 8, speed: 7, knowledge: 8 },
    'phi4-mini-reasoning:latest': { reasoning: 9, speed: 8, knowledge: 7 },
    'deepseek-r1:latest': { reasoning: 9, speed: 6, knowledge: 9 },
    'qwen2.5:latest': { reasoning: 8, speed: 7, knowledge: 8 },
    'gpt-oss:20b': { reasoning: 9, speed: 5, knowledge: 9 }
  };
  
  return capabilities[name] || { reasoning: 7, speed: 7, knowledge: 7 };
};

export interface OllamaModel {
  id: string;
  name: string;
  family: string;
  size: string;
  digest: string;
  modified_at: string;
  description: string;
  badge: string;
  contextWindow?: number;
  capabilities?: {
    reasoning: number;
    speed: number;
    knowledge: number;
  };
}

export const useOllamaModels = () => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<'running' | 'not_running' | 'unknown'>('unknown');

  const fetchModels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:11434/api/tags', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Ollama service not available');
      }
      
      const data = await response.json();
      
      // Transform raw Ollama models to expected format
      const transformedModels = (data.models || []).map((model: any) => ({
        id: model.name,
        name: model.name,
        family: model.name.split(':')[0] || 'Unknown',
        size: formatSize(model.size),
        digest: model.digest,
        modified_at: model.modified_at,
        description: getModelDescription(model.name),
        badge: getModelBadge(model.name),
        contextWindow: getContextWindow(model.name),
        capabilities: getModelCapabilities(model.name)
      }));
      
      setModels(transformedModels);
      setOllamaStatus('running');
    } catch (err) {
      console.warn('Ollama not available:', err);
      setError('Ollama service not available');
      setOllamaStatus('not_running');
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return { 
    models, 
    isLoading, 
    error, 
    ollamaStatus,
    refreshModels: fetchModels 
  };
};