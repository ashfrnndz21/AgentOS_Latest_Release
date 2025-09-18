
import { ModelOption } from '../types';
import { openaiModels } from './openai';
import { anthropicModels } from './anthropic';
import { metaModels } from './meta';
import { deepseekModels } from './deepseek';
import { amazonModels } from './amazon';
import { ollamaModels } from './ollama';

// Export all models in a grouped object
export const AIModels: Record<string, ModelOption[]> = {
  openai: openaiModels,
  anthropic: anthropicModels,
  meta: metaModels,
  deepseek: deepseekModels,
  amazon: amazonModels,
  ollama: ollamaModels
};

// Function to get dynamic Ollama models (will be used by components)
export const getDynamicOllamaModels = async (): Promise<ModelOption[]> => {
  try {
    // This will be called by components that need real-time Ollama models
    const { useOllamaModels } = await import('@/hooks/useOllamaModels');
    // Note: This is a placeholder - actual implementation will be in the hook
    return ollamaModels; // Fallback to static models
  } catch (error) {
    console.error('Failed to load dynamic Ollama models:', error);
    return ollamaModels; // Fallback to static models
  }
};

// Export individual model arrays for direct access
export {
  openaiModels,
  anthropicModels,
  metaModels,
  deepseekModels,
  amazonModels,
  ollamaModels
};
