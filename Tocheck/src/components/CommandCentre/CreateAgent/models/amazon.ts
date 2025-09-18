
import { ModelOption } from '../types';

export const amazonModels: ModelOption[] = [
  {
    id: 'nova-lite',
    name: 'Nova Lite',
    provider: 'Amazon',
    description: 'Fast and efficient model for everyday business tasks',
    capabilities: {
      reasoning: 7,
      multimodal: false,
      speed: 9,
      knowledge: 7,
    },
    cost: 2,
    badge: 'FAST'
  },
  {
    id: 'nova-pro',
    name: 'Nova Pro',
    provider: 'Amazon',
    description: 'Powerful AI model with advanced reasoning capabilities',
    capabilities: {
      reasoning: 9,
      multimodal: true,
      speed: 7,
      knowledge: 9,
    },
    cost: 6,
    badge: 'PREMIUM'
  }
];
