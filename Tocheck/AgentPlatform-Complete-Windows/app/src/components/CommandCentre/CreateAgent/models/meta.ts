
import { ModelOption } from '../types';

export const metaModels: ModelOption[] = [
  {
    id: 'llama-3-8b',
    name: 'Llama 3 8B',
    provider: 'Meta',
    description: 'Compact open-source model optimized for efficiency',
    capabilities: {
      reasoning: 6,
      multimodal: false,
      speed: 9,
      knowledge: 6,
    },
    cost: 1,
    badge: 'COMPACT'
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    description: 'Powerful open-source model with strong reasoning capabilities',
    capabilities: {
      reasoning: 8,
      multimodal: false,
      speed: 7,
      knowledge: 8,
    },
    cost: 3,
    badge: 'POWERFUL'
  },
  {
    id: 'llama-4-405b',
    name: 'Llama 4 405B',
    provider: 'Meta',
    description: 'Next-generation open-source model with exceptional capabilities',
    capabilities: {
      reasoning: 9,
      multimodal: true,
      speed: 6,
      knowledge: 9,
    },
    cost: 5,
    badge: 'ADVANCED'
  }
];
