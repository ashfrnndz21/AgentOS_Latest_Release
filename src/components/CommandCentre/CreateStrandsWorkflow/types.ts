export interface StrandsWorkflowFormValues {
  name: string;
  description: string;
  model: string;
  provider: 'bedrock' | 'openai' | 'anthropic';
  a2a_config: A2AConfiguration;
  reasoning_patterns: {
    chain_of_thought: boolean;
    tree_of_thought: boolean;
    reflection: boolean;
    self_critique: boolean;
    multi_step_reasoning: boolean;
    analogical_reasoning: boolean;
  };
  memory: {
    working_memory: boolean;
    episodic_memory: boolean;
    semantic_memory: boolean;
    memory_consolidation: boolean;
    context_window_management: boolean;
  };
  tools: string[];
  workflow_steps: WorkflowStep[];
  guardrails: {
    content_filter: boolean;
    reasoning_validator: boolean;
    output_sanitizer: boolean;
    ethical_constraints: boolean;
  };
  performance_config: {
    max_reasoning_depth: number;
    reflection_cycles: number;
    temperature: number;
    max_tokens: number;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'reasoning' | 'tool_use' | 'memory_retrieval' | 'validation' | 'reflection';
  description: string;
  config: {
    reasoning_pattern?: string;
    tools?: string[];
    memory_type?: string;
    validation_criteria?: string[];
    reflection_depth?: number;
  };
  dependencies: string[];
  parallel_execution: boolean;
}

export interface StrandsModelOption {
  id: string;
  name: string;
  provider: 'bedrock' | 'openai' | 'anthropic';
  reasoning_capabilities: string[];
  context_window: number;
  supports_tool_use: boolean;
  supports_reflection: boolean;
}

export interface ReasoningPattern {
  id: string;
  name: string;
  description: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  use_cases: string[];
  compatible_models: string[];
}

export interface StrandsTool {
  id: string;
  name: string;
  description: string;
  category: 'reasoning' | 'data' | 'communication' | 'validation' | 'memory';
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  reasoning_integration: boolean;
}

export interface MemoryType {
  id: string;
  name: string;
  description: string;
  capacity: 'limited' | 'unlimited';
  persistence: 'session' | 'permanent';
  retrieval_methods: string[];
  consolidation_support: boolean;
}

// A2A Configuration Types
export interface A2AConfiguration {
  enabled: boolean;
  collaboration_mode: 'orchestrator' | 'participant' | 'both';
  max_concurrent_agents: number;
  communication_protocol: 'websocket' | 'rest' | 'both';
  auto_registration: boolean;
  discovery_scope: 'local' | 'global' | 'custom';
  custom_agents: string[];
  conversation_tracing: boolean;
  real_time_monitoring: boolean;
}

export interface A2AAgent {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'busy' | 'error';
  capabilities: string[];
  last_seen: string;
  port: number;
  collaboration_mode: 'orchestrator' | 'participant' | 'both';
}

// Conversation Tracing Types
export interface A2AConversationTrace {
  id: string;
  session_id: string;
  user_query: string;
  agents_involved: string[];
  conversation_flow: ConversationStep[];
  final_output: string;
  timestamp: string;
  duration_ms: number;
  success: boolean;
}

export interface ConversationStep {
  id: string;
  agent_id: string;
  agent_name: string;
  step_type: 'reasoning' | 'tool_use' | 'memory_retrieval' | 'agent_communication' | 'validation' | 'output_generation';
  input: string;
  output: string;
  reasoning: string;
  tools_used: string[];
  memory_accessed: string[];
  timestamp: string;
  duration_ms: number;
  parent_step_id?: string;
  child_step_ids: string[];
}

export interface A2AConversationUIProps {
  conversationTrace: A2AConversationTrace | null;
  isLive: boolean;
  onAgentClick: (agentId: string) => void;
  onStepClick: (stepId: string) => void;
  selectedStep: string | null;
  selectedAgent: string | null;
}