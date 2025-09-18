// Multi-Agent Orchestration Types
export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'processor' | 'decision' | 'integration' | 'terminal';
  label: string;
  config: AgentConfig;
  position: { x: number; y: number };
  inputSchema?: DataSchema;
  outputSchema?: DataSchema;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  metrics?: ExecutionMetrics;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: 'data' | 'control' | 'event' | 'error';
  condition?: string;
  dataMapping?: DataMapping;
  label?: string;
}

export interface DataSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, DataSchema>;
  required?: string[];
  description?: string;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
}

export interface AgentConfig {
  model?: string;
  systemPrompt?: string;
  tools?: string[];
  guardrails?: string[];
  memory?: boolean;
  reasoning?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface ExecutionMetrics {
  startTime?: number;
  endTime?: number;
  duration?: number;
  tokensUsed?: number;
  cost?: number;
  errorCount?: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: number;
  endTime?: number;
  currentNode?: string;
  context: Record<string, any>;
  metrics: ExecutionMetrics;
  errorLog?: string[];
}

export interface OrchestrationPattern {
  type: 'sequential' | 'parallel' | 'conditional' | 'loop' | 'fan-out' | 'fan-in';
  nodes: string[];
  conditions?: Record<string, string>;
  mergeStrategy?: 'all' | 'first' | 'majority';
}