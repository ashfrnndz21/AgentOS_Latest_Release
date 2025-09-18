/**
 * Strands-inspired type definitions for Ollama integration
 */

export interface StrandsOllamaAgent {
  id: string;
  name: string;
  model: string; // Ollama model (llama3.2, mistral, etc.)
  systemPrompt: string;
  tools: StrandsTool[];
  
  // Strands-specific properties
  reasoningPattern: 'sequential' | 'parallel' | 'conditional';
  contextManagement: {
    preserveMemory: boolean;
    maxContextLength: number;
    compressionLevel: 'none' | 'summary' | 'key_points';
  };
  
  // Integration with existing Ollama API
  ollamaConfig: {
    temperature: number;
    maxTokens: number;
    keepAlive: string;
  };
  
  // Agent capabilities
  capabilities: string[];
  category: 'research' | 'calculation' | 'documentation' | 'general';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface StrandsTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  category: 'calculator' | 'web_search' | 'file_system' | 'database' | 'custom' | 'mcp';
  
  // Integration with existing MCP tools
  mcpTool?: any; // MCPTool type from existing system
  
  // Strands-specific execution
  execute: (params: any, context: AgentContext) => Promise<any>;
}

export interface AgentContext {
  conversationHistory: any[];
  currentData: any;
  userPreferences: Record<string, any>;
  executionState: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  metadata: Record<string, any>;
}

export interface StrandsWorkflow {
  id: string;
  name: string;
  description: string;
  
  // Task-based approach (from Strands docs)
  tasks: StrandsTask[];
  
  // Agent assignments
  agents: StrandsOllamaAgent[];
  
  // Execution configuration
  executionConfig: {
    parallelExecution: boolean;
    maxConcurrentTasks: number;
    timeoutMs: number;
    retryPolicy: RetryPolicy;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface StrandsTask {
  taskId: string;
  description: string;
  systemPrompt: string;
  
  // Dependencies (from Strands workflow pattern)
  dependencies: string[];
  priority: number;
  
  // Agent assignment
  assignedAgent: string;
  
  // Input/Output mapping
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  
  // Tools available to this task
  availableTools: string[];
  
  // Execution state
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  retryOnError: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'error' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentTask?: string;
  executionPath: string[];
  results: Record<string, TaskResult>;
  context: AgentContext;
  metrics: ExecutionMetrics;
}

export interface TaskResult {
  success: boolean;
  output: any;
  error?: string;
  executionTime: number;
  tokensUsed?: number;
  toolsUsed: string[];
  confidence?: number;
  metadata: Record<string, any>;
}

export interface ExecutionMetrics {
  totalExecutionTime: number;
  taskExecutionTimes: Record<string, number>;
  totalTokensUsed: number;
  toolsUsed: string[];
  errorCount: number;
  successRate: number;
}

export interface NodeSuggestion {
  nodeType: string;
  name: string;
  description: string;
  confidence: number;
  reasoning: string;
  suggestedConfig?: any;
}

export interface ConnectionSuggestion {
  sourceNodeId: string;
  targetNodeId: string;
  confidence: number;
  reasoning: string;
  suggestedConditions?: any;
}