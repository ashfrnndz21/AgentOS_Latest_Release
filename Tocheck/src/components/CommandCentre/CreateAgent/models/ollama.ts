// Ollama Local AI Models
import { ModelOption } from '../types';

export const ollamaModels: ModelOption[] = [
  {
    id: 'llama3.2',
    name: 'Llama 3.2',
    description: 'Meta\'s latest Llama model, great for general tasks',
    provider: 'ollama',
    contextWindow: 128000,
    pricing: { input: 0, output: 0 }, // Local models are free
    capabilities: {
      reasoning: 9,
      multimodal: false,
      speed: 7,
      knowledge: 8
    },
    cost: 0,
    badge: 'Local',
    isLocal: true
  },
  {
    id: 'llama3.2:1b',
    name: 'Llama 3.2 1B',
    description: 'Smaller, faster version of Llama 3.2',
    provider: 'ollama',
    contextWindow: 128000,
    pricing: { input: 0, output: 0 },
    capabilities: {
      reasoning: 7,
      multimodal: false,
      speed: 9,
      knowledge: 7
    },
    cost: 0,
    badge: 'Fast',
    isLocal: true
  },
  {
    id: 'mistral',
    name: 'Mistral 7B',
    description: 'High-quality model from Mistral AI',
    provider: 'ollama',
    contextWindow: 32000,
    pricing: { input: 0, output: 0 },
    capabilities: {
      reasoning: 8,
      multimodal: false,
      speed: 8,
      knowledge: 8
    },
    cost: 0,
    badge: 'Local',
    isLocal: true
  },
  {
    id: 'codellama',
    name: 'Code Llama',
    description: 'Specialized for code generation and analysis',
    provider: 'ollama',
    contextWindow: 16000,
    pricing: { input: 0, output: 0 },
    capabilities: {
      reasoning: 8,
      multimodal: false,
      speed: 7,
      knowledge: 9
    },
    cost: 0,
    badge: 'Code',
    isLocal: true
  },
  {
    id: 'phi3',
    name: 'Phi-3 Mini',
    description: 'Microsoft\'s efficient small language model',
    provider: 'ollama',
    contextWindow: 128000,
    pricing: { input: 0, output: 0 },
    capabilities: {
      reasoning: 7,
      multimodal: false,
      speed: 9,
      knowledge: 7
    },
    cost: 0,
    badge: 'Efficient',
    isLocal: true
  },
  {
    id: 'gemma2',
    name: 'Gemma 2',
    description: 'Google\'s Gemma 2 model',
    provider: 'ollama',
    contextWindow: 8192,
    pricing: { input: 0, output: 0 },
    capabilities: {
      reasoning: 8,
      multimodal: false,
      speed: 8,
      knowledge: 8
    },
    cost: 0,
    badge: 'Local',
    isLocal: true
  },
  {
    id: 'qwen2.5',
    name: 'Qwen 2.5',
    description: 'Alibaba\'s multilingual model',
    provider: 'ollama',
    contextWindow: 32000,
    pricing: { input: 0, output: 0 },
    capabilities: {
      reasoning: 8,
      multimodal: false,
      speed: 7,
      knowledge: 9
    },
    cost: 0,
    badge: 'Multilingual',
    isLocal: true
  },
  {
    id: 'llama3.2-vision',
    name: 'Llama 3.2 Vision',
    description: 'Llama with vision capabilities',
    provider: 'ollama',
    contextWindow: 128000,
    pricing: { input: 0, output: 0 },
    capabilities: {
      reasoning: 9,
      multimodal: true,
      speed: 6,
      knowledge: 8
    },
    cost: 0,
    badge: 'Vision',
    isLocal: true
  }
];