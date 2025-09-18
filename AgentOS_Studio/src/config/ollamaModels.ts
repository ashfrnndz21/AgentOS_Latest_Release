/**
 * Ollama Models Configuration
 * Defines available Ollama models and their capabilities
 */

export interface OllamaModelConfig {
  id: string;
  name: string;
  description: string;
  size: string;
  capabilities: string[];
  contextWindow: number;
  temperature: {
    min: number;
    max: number;
    default: number;
  };
  maxTokens: {
    min: number;
    max: number;
    default: number;
  };
}

export const OLLAMA_MODELS: OllamaModelConfig[] = [
  {
    id: 'llama3.2:latest',
    name: 'Llama 3.2',
    description: 'Meta\'s latest Llama model with improved reasoning',
    size: '2.0GB',
    capabilities: ['text-generation', 'reasoning', 'conversation'],
    contextWindow: 128000,
    temperature: { min: 0, max: 2, default: 0.7 },
    maxTokens: { min: 1, max: 4000, default: 1000 }
  },
  {
    id: 'llama3.2:1b',
    name: 'Llama 3.2 1B',
    description: 'Smaller, faster Llama model for quick responses',
    size: '1.3GB',
    capabilities: ['text-generation', 'conversation'],
    contextWindow: 128000,
    temperature: { min: 0, max: 2, default: 0.7 },
    maxTokens: { min: 1, max: 2000, default: 800 }
  },
  {
    id: 'phi4-mini-reasoning:latest',
    name: 'Phi-4 Mini Reasoning',
    description: 'Microsoft\'s reasoning-optimized model',
    size: '2.7GB',
    capabilities: ['reasoning', 'analysis', 'problem-solving'],
    contextWindow: 128000,
    temperature: { min: 0, max: 1.5, default: 0.3 },
    maxTokens: { min: 1, max: 3000, default: 1200 }
  },
  {
    id: 'deepseek-r1:latest',
    name: 'DeepSeek R1',
    description: 'Advanced reasoning and code generation model',
    size: '8.9GB',
    capabilities: ['reasoning', 'code-generation', 'analysis'],
    contextWindow: 128000,
    temperature: { min: 0, max: 1.5, default: 0.4 },
    maxTokens: { min: 1, max: 4000, default: 1500 }
  },
  {
    id: 'qwen2.5:latest',
    name: 'Qwen 2.5',
    description: 'Multilingual model with strong performance',
    size: '4.7GB',
    capabilities: ['multilingual', 'reasoning', 'conversation'],
    contextWindow: 128000,
    temperature: { min: 0, max: 2, default: 0.7 },
    maxTokens: { min: 1, max: 4000, default: 1000 }
  }
];

export const getModelById = (id: string): OllamaModelConfig | undefined => {
  return OLLAMA_MODELS.find(model => model.id === id);
};

export const getModelsByCapability = (capability: string): OllamaModelConfig[] => {
  return OLLAMA_MODELS.filter(model => model.capabilities.includes(capability));
};

export const getDefaultModel = (): OllamaModelConfig => {
  return OLLAMA_MODELS[0]; // llama3.2:latest
};