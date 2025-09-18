
import { ModelOption } from '../types';

export const anthropicModels: ModelOption[] = [
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Anthropic\'s most powerful model for complex reasoning and analysis',
    capabilities: {
      reasoning: 10,
      multimodal: true,
      speed: 6,
      knowledge: 9,
    },
    cost: 9,
    badge: 'PREMIUM'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced model for everyday tasks with good efficiency',
    capabilities: {
      reasoning: 8,
      multimodal: true,
      speed: 7,
      knowledge: 8,
    },
    cost: 5,
    badge: 'BALANCED'
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fast and cost-effective model for simple tasks',
    capabilities: {
      reasoning: 7,
      multimodal: true,
      speed: 9,
      knowledge: 7,
    },
    cost: 2,
    badge: 'FAST'
  }
];
