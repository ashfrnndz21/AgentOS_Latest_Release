
// Model provider and configuration definitions
import { ModelProvider, ModelConfig } from './modelTypes';

// Model definitions for different providers
export const models: Record<ModelProvider, ModelConfig[]> = {
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      contextWindow: 128000,
      supportsVision: true,
      supportsFunctions: true,
      maxOutputTokens: 4096,
      costPer1kTokens: 0.01
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      contextWindow: 128000,
      supportsVision: true,
      supportsFunctions: true,
      maxOutputTokens: 4096,
      costPer1kTokens: 0.005
    }
  ],
  anthropic: [
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      contextWindow: 200000,
      supportsVision: true,
      supportsFunctions: true,
      maxOutputTokens: 4096,
      costPer1kTokens: 0.015
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      contextWindow: 200000,
      supportsVision: true,
      supportsFunctions: true,
      maxOutputTokens: 4096,
      costPer1kTokens: 0.008
    }
  ],
  google: [
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      contextWindow: 1000000,
      supportsVision: true,
      supportsFunctions: true,
      maxOutputTokens: 8192,
      costPer1kTokens: 0.0025
    }
  ],
  azure: [
    {
      id: 'azure-gpt-4',
      name: 'Azure GPT-4',
      provider: 'azure',
      contextWindow: 32768,
      supportsVision: false,
      supportsFunctions: true,
      maxOutputTokens: 4096,
      costPer1kTokens: 0.01
    }
  ],
  cohere: [
    {
      id: 'command-r',
      name: 'Command R',
      provider: 'cohere',
      contextWindow: 128000,
      supportsVision: false,
      supportsFunctions: false,
      maxOutputTokens: 4096,
      costPer1kTokens: 0.005
    }
  ],
  ollama: [
    {
      id: 'llama3-8b',
      name: 'Llama 3 (8B)',
      provider: 'ollama',
      contextWindow: 8192,
      supportsVision: false,
      supportsFunctions: false,
      maxOutputTokens: 2048,
      costPer1kTokens: 0
    },
    {
      id: 'llama3-70b',
      name: 'Llama 3 (70B)',
      provider: 'ollama',
      contextWindow: 8192,
      supportsVision: false,
      supportsFunctions: false,
      maxOutputTokens: 2048,
      costPer1kTokens: 0
    }
  ]
};
