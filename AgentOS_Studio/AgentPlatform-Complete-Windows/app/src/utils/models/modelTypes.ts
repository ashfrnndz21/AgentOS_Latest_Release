
// Type definitions for model providers
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'cohere' | 'ollama';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  contextWindow: number;
  supportsVision: boolean;
  supportsFunctions: boolean;
  maxOutputTokens: number;
  costPer1kTokens: number;
}

// Re-export model definitions for backward compatibility
export { models } from './modelDefinitions';
