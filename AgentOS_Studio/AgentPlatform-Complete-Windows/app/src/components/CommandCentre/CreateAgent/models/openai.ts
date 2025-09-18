
import { ModelOption } from '../types';

export const openaiModels: ModelOption[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Fast and efficient model with good reasoning capabilities',
    capabilities: {
      reasoning: 7,
      multimodal: true,
      speed: 9,
      knowledge: 7,
    },
    cost: 1,
    badge: 'FAST'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Powerful model with excellent reasoning and multimodal capabilities',
    capabilities: {
      reasoning: 9,
      multimodal: true,
      speed: 7,
      knowledge: 9,
    },
    cost: 5,
    badge: 'BALANCED'
  },
  {
    id: 'gpt-4.5-preview',
    name: 'GPT-4.5 Preview',
    provider: 'OpenAI',
    description: 'Most advanced model with superior reasoning for complex tasks',
    capabilities: {
      reasoning: 10,
      multimodal: true,
      speed: 6,
      knowledge: 10,
    },
    cost: 10,
    badge: 'POWERFUL'
  }
];
