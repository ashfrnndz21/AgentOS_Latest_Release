/**
 * Core types for configurable workflow utilities
 */

export interface BaseCondition {
  id: string;
  field: 'content' | 'confidence' | 'topic' | 'user_intent' | 'agent_response' | 'custom';
  operator: 'contains' | 'equals' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with';
  value: string | number;
  caseSensitive?: boolean;
}

export interface DecisionCondition extends BaseCondition {
  action: 'route_to_agent' | 'route_to_human' | 'end_workflow' | 'trigger_tool';
  target: string; // Agent ID, human queue, or tool name
  priority: number; // Higher priority conditions are evaluated first
}

export interface DecisionNodeConfig {
  id: string;
  name: string;
  conditions: DecisionCondition[];
  defaultAction: {
    action: 'route_to_agent' | 'route_to_human' | 'end_workflow';
    target: string;
  };
  evaluationMode: 'first_match' | 'highest_priority' | 'all_conditions';
  description?: string;
}

export interface HandoffNodeConfig {
  id: string;
  name: string;
  strategy: 'expertise_based' | 'load_balanced' | 'round_robin' | 'conditional' | 'manual';
  sourceAgent?: string; // If specific source agent
  targetAgents: Array<{
    agentId: string;
    agentName: string;
    conditions?: BaseCondition[]; // When to route to this agent
    weight?: number; // For load balancing
  }>;
  contextHandling: {
    preservation: 'full' | 'summary' | 'key_points' | 'custom';
    compressionRatio?: number; // 0.1 to 1.0
    keyFields?: string[]; // Fields to always preserve
  };
  fallbackStrategy: {
    action: 'route_to_human' | 'route_to_default' | 'end_workflow';
    target?: string;
  };
  timeout?: number; // Seconds before fallback
  description?: string;
}

export interface AggregatorNodeConfig {
  id: string;
  name: string;
  inputAgents: Array<{
    agentId: string;
    agentName: string;
    weight: number; // 0.0 to 1.0
    required: boolean; // Must respond for aggregation
  }>;
  aggregationMethod: 'consensus' | 'weighted_average' | 'best_response' | 'majority_vote' | 'ai_judge';
  consensusThreshold?: number; // 0.0 to 1.0 - agreement threshold
  conflictResolution: 'highest_confidence' | 'highest_weight' | 'human_review' | 'ai_arbitration';
  timeout: number; // Seconds to wait for all responses
  minimumResponses: number; // Minimum responses needed
  outputFormat: 'combined' | 'ranked' | 'summary' | 'detailed';
  description?: string;
}

export interface GuardrailRule {
  id: string;
  name: string;
  type: 'content_filter' | 'safety_check' | 'compliance' | 'custom_validation';
  condition: BaseCondition;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'block' | 'warn' | 'modify' | 'escalate' | 'log_only';
  message?: string; // Message to show user
  enabled: boolean;
}

export interface GuardrailNodeConfig {
  id: string;
  name: string;
  rules: GuardrailRule[];
  escalationPolicy: {
    enabled: boolean;
    threshold: number; // Number of violations before escalation
    action: 'notify_human' | 'stop_workflow' | 'route_to_supervisor';
    target?: string; // Human queue or supervisor agent
  };
  logLevel: 'none' | 'violations_only' | 'all_checks';
  bypassConditions?: BaseCondition[]; // When to skip guardrails
  description?: string;
}

export interface HumanNodeConfig {
  id: string;
  name: string;
  inputType: 'text' | 'choice' | 'approval' | 'file_upload' | 'custom_form';
  prompt: string;
  choices?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  timeout: number; // Seconds before timeout
  timeoutAction: 'continue_workflow' | 'end_workflow' | 'route_to_fallback';
  fallbackTarget?: string;
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string; // Regex pattern
    customValidation?: string; // Custom validation logic
  };
  description?: string;
}

export interface MemoryNodeConfig {
  id: string;
  name: string;
  operation: 'store' | 'retrieve' | 'update' | 'delete';
  key: string; // Memory key
  value?: string; // For store/update operations
  scope: 'workflow' | 'session' | 'user' | 'global';
  persistence: 'temporary' | 'session' | 'permanent';
  encryption: boolean;
  accessControl: {
    readRoles: string[];
    writeRoles: string[];
  };
  ttl?: number; // Time to live in seconds
  description?: string;
}

export interface MonitorNodeConfig {
  id: string;
  name: string;
  metrics: Array<{
    name: string;
    type: 'counter' | 'gauge' | 'histogram' | 'timer';
    field: string; // What to monitor
    threshold?: {
      min?: number;
      max?: number;
      action: 'alert' | 'escalate' | 'stop_workflow';
    };
  }>;
  alerting: {
    enabled: boolean;
    channels: Array<{
      type: 'email' | 'slack' | 'webhook' | 'dashboard';
      target: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  };
  reportingInterval: number; // Seconds
  retentionPeriod: number; // Days
  description?: string;
}

export type UtilityNodeConfig = 
  | DecisionNodeConfig 
  | HandoffNodeConfig 
  | AggregatorNodeConfig 
  | GuardrailNodeConfig 
  | HumanNodeConfig 
  | MemoryNodeConfig 
  | MonitorNodeConfig;

export interface ConfiguredUtilityNode {
  id: string;
  type: 'decision' | 'handoff' | 'aggregator' | 'guardrail' | 'human' | 'memory' | 'monitor';
  position: { x: number; y: number };
  config: UtilityNodeConfig;
  isConfigured: boolean;
  lastModified: Date;
}