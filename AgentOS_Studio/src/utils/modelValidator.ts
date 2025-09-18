/**
 * Model Validator Utility
 * Validates Ollama model configurations and availability
 */

import { OLLAMA_MODELS, OllamaModelConfig } from '@/config/ollamaModels';

export interface ModelValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  model?: OllamaModelConfig;
}

/**
 * Validates if a model ID is valid and available
 */
export const validateModel = (modelId: string): ModelValidationResult => {
  const result: ModelValidationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  // Check if model ID is provided
  if (!modelId || typeof modelId !== 'string') {
    result.errors.push('Model ID is required and must be a string');
    return result;
  }

  // Check if model exists in our configuration
  const model = OLLAMA_MODELS.find(m => m.id === modelId);
  if (!model) {
    result.errors.push(`Model '${modelId}' is not found in available models`);
    result.warnings.push('Make sure the model is pulled in Ollama');
    return result;
  }

  // Model is valid
  result.isValid = true;
  result.model = model;

  return result;
};

/**
 * Validates model configuration parameters
 */
export const validateModelConfig = (
  modelId: string, 
  temperature?: number, 
  maxTokens?: number
): ModelValidationResult => {
  const result = validateModel(modelId);
  
  if (!result.isValid) {
    return result;
  }

  const model = result.model!;

  // Validate temperature
  if (temperature !== undefined) {
    if (temperature < model.temperature.min || temperature > model.temperature.max) {
      result.warnings.push(
        `Temperature ${temperature} is outside recommended range (${model.temperature.min}-${model.temperature.max})`
      );
    }
  }

  // Validate max tokens
  if (maxTokens !== undefined) {
    if (maxTokens < model.maxTokens.min || maxTokens > model.maxTokens.max) {
      result.warnings.push(
        `Max tokens ${maxTokens} is outside recommended range (${model.maxTokens.min}-${model.maxTokens.max})`
      );
    }
  }

  return result;
};

/**
 * Gets available models for a specific capability
 */
export const getModelsForCapability = (capability: string): OllamaModelConfig[] => {
  return OLLAMA_MODELS.filter(model => model.capabilities.includes(capability));
};

/**
 * Gets the best model for a specific use case
 */
export const getBestModelFor = (useCase: 'reasoning' | 'conversation' | 'code-generation' | 'analysis'): OllamaModelConfig => {
  switch (useCase) {
    case 'reasoning':
      return OLLAMA_MODELS.find(m => m.id === 'phi4-mini-reasoning:latest') || OLLAMA_MODELS[0];
    case 'code-generation':
      return OLLAMA_MODELS.find(m => m.id === 'deepseek-r1:latest') || OLLAMA_MODELS[0];
    case 'conversation':
      return OLLAMA_MODELS.find(m => m.id === 'llama3.2:latest') || OLLAMA_MODELS[0];
    case 'analysis':
      return OLLAMA_MODELS.find(m => m.id === 'qwen2.5:latest') || OLLAMA_MODELS[0];
    default:
      return OLLAMA_MODELS[0];
  }
};

/**
 * Checks if a model is suitable for a specific task
 */
export const isModelSuitableFor = (modelId: string, capability: string): boolean => {
  const model = OLLAMA_MODELS.find(m => m.id === modelId);
  return model ? model.capabilities.includes(capability) : false;
};