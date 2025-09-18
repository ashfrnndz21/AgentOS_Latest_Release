import { StrandsModelOption } from './types';

export const StrandsModels: StrandsModelOption[] = [
  // AWS Bedrock Models (Primary for Strands)
  {
    id: 'bedrock-claude-3-opus',
    name: 'Claude 3 Opus (Bedrock)',
    provider: 'bedrock',
    reasoning_capabilities: ['chain_of_thought', 'tree_of_thought', 'reflection', 'self_critique', 'analogical_reasoning'],
    context_window: 200000,
    supports_tool_use: true,
    supports_reflection: true
  },
  {
    id: 'bedrock-claude-3-sonnet',
    name: 'Claude 3 Sonnet (Bedrock)',
    provider: 'bedrock',
    reasoning_capabilities: ['chain_of_thought', 'reflection', 'multi_step_reasoning'],
    context_window: 200000,
    supports_tool_use: true,
    supports_reflection: true
  },
  {
    id: 'bedrock-claude-3-haiku',
    name: 'Claude 3 Haiku (Bedrock)',
    provider: 'bedrock',
    reasoning_capabilities: ['chain_of_thought', 'multi_step_reasoning'],
    context_window: 200000,
    supports_tool_use: true,
    supports_reflection: false
  },
  {
    id: 'bedrock-titan-text-premier',
    name: 'Titan Text Premier (Bedrock)',
    provider: 'bedrock',
    reasoning_capabilities: ['chain_of_thought', 'multi_step_reasoning'],
    context_window: 32000,
    supports_tool_use: true,
    supports_reflection: false
  },
  
  // OpenAI Models (Secondary support)
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    reasoning_capabilities: ['chain_of_thought', 'tree_of_thought', 'reflection', 'self_critique'],
    context_window: 128000,
    supports_tool_use: true,
    supports_reflection: true
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    reasoning_capabilities: ['chain_of_thought', 'reflection', 'multi_step_reasoning'],
    context_window: 8192,
    supports_tool_use: true,
    supports_reflection: true
  },
  
  // Anthropic Models (Secondary support)
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    reasoning_capabilities: ['chain_of_thought', 'tree_of_thought', 'reflection', 'self_critique', 'analogical_reasoning'],
    context_window: 200000,
    supports_tool_use: true,
    supports_reflection: true
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    reasoning_capabilities: ['chain_of_thought', 'reflection', 'multi_step_reasoning'],
    context_window: 200000,
    supports_tool_use: true,
    supports_reflection: true
  }
];

export const getModelsByProvider = (provider: string): StrandsModelOption[] => {
  return StrandsModels.filter(model => model.provider === provider);
};

export const getModelCapabilities = (modelId: string): string[] => {
  const model = StrandsModels.find(m => m.id === modelId);
  return model?.reasoning_capabilities || [];
};

export const supportsReasoningPattern = (modelId: string, pattern: string): boolean => {
  const model = StrandsModels.find(m => m.id === modelId);
  return model?.reasoning_capabilities.includes(pattern) || false;
};