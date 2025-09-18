/**
 * Ollama Components for AgentOS Platform
 * Local AI model integration components
 */

export { OllamaTerminal } from './OllamaTerminal';
export { OllamaModelSelector } from './OllamaModelSelector';
export { OllamaStatus } from './OllamaStatus';
export { OllamaTerminalDialog } from './OllamaTerminalDialog';
export { OllamaModelsDialog } from './OllamaModelsDialog';

// Re-export types and services for convenience
export type {
  OllamaModel,
  OllamaStatus as OllamaStatusType,
  OllamaGenerateRequest,
  OllamaGenerateResponse,
  PopularModel,
  TerminalCommandResult,
  OllamaAgentConfig
} from '@/lib/services/OllamaService';

export { ollamaService, OllamaUtils } from '@/lib/services/OllamaService';