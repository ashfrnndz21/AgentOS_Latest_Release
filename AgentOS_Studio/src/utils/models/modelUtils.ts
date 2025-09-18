
import { models } from './modelDefinitions';
import { ModelConfig, ModelProvider } from './modelTypes';
import { toast } from 'sonner';

/**
 * Gets the configuration for a specific model
 */
export const getModelConfig = (provider: ModelProvider, modelId: string): ModelConfig | null => {
  return models[provider].find(model => model.id === modelId) || null;
};

/**
 * Validates a local provider endpoint
 */
export const validateLocalEndpoint = async (provider: string, endpoint: string): Promise<boolean> => {
  try {
    // For Ollama, try to ping the server to validate the endpoint
    if (provider === 'ollama') {
      const response = await fetch(`${endpoint}/api/tags`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast.success(`Connected to ${provider} at ${endpoint}`);
        return true;
      } else {
        toast.error(`Failed to connect to ${provider} at ${endpoint}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error connecting to ${provider}:`, error);
    toast.error(`Failed to connect to ${provider} at ${endpoint}`);
    return false;
  }
};

/**
 * Load initial model selection from localStorage
 */
export const loadInitialModelSelection = (provider: ModelProvider): string | null => {
  const savedModel = localStorage.getItem(`${provider}-selected-model`);
  
  // If no model is saved but we have available models, return the first one
  if (!savedModel && models[provider]?.length > 0) {
    return models[provider][0].id;
  }
  
  return savedModel;
};

/**
 * Save model selection to localStorage
 */
export const saveModelSelection = (provider: ModelProvider, modelId: string | null): void => {
  if (modelId) {
    localStorage.setItem(`${provider}-selected-model`, modelId);
  }
};

/**
 * Save local endpoint to localStorage
 */
export const saveLocalEndpoint = (endpoint: string): void => {
  localStorage.setItem('ollama-endpoint', endpoint);
};
