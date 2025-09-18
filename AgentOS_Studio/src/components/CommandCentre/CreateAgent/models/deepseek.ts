
import { ModelOption } from '../types';

export const deepseekModels: ModelOption[] = [
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'DeepSeek',
    description: 'Specialized for code generation and understanding',
    capabilities: {
      reasoning: 7,
      multimodal: false,
      speed: 8,
      knowledge: 7,
    },
    cost: 2,
    badge: 'CODE'
  },
  {
    id: 'deepseek-llm-7b',
    name: 'DeepSeek LLM 7B',
    provider: 'DeepSeek',
    description: 'Efficient general purpose model',
    capabilities: {
      reasoning: 6,
      multimodal: false,
      speed: 9,
      knowledge: 6,
    },
    cost: 1,
    badge: 'EFFICIENT'
  },
  {
    id: 'deepseek-llm-67b',
    name: 'DeepSeek LLM 67B',
    provider: 'DeepSeek',
    description: 'Powerful general purpose model with advanced reasoning',
    capabilities: {
      reasoning: 8,
      multimodal: false,
      speed: 7,
      knowledge: 8,
    },
    cost: 4,
    badge: 'ADVANCED'
  }
];
