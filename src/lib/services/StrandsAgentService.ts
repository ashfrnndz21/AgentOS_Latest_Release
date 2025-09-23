/**
 * Strands Agent Service
 * Frontend service for interacting with Strands Intelligence API
 * Handles advanced AI agent reasoning, multi-agent orchestration, and workflow execution
 */

export interface StrandsAgentConfig {
  id?: string;
  name: string;
  role: string;
  description: string;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  
  // Strands Reasoning Configuration
  reasoning_pattern: 'sequential' | 'adaptive' | 'parallel';
  reflection_enabled: boolean;
  chain_of_thought_depth: number;
  
  // Tool Configuration
  tools_config: any[];
  tool_selection_strategy: 'automatic' | 'explicit';
  mcp_servers: any[];
  
  // Multi-Agent Configuration
  agent_architecture: 'single' | 'supervisor' | 'swarm' | 'hierarchical';
  delegation_rules: any[];
  communication_protocol: 'direct' | 'message_passing' | 'shared_memory';
  
  // Observability Configuration
  telemetry_enabled: boolean;
  tracing_level: 'basic' | 'detailed' | 'debug';
  metrics_collection: string[];
  
  // Execution Configuration
  execution_mode: 'local' | 'cloud' | 'hybrid';
  resource_limits: any;
  error_handling: any;
  
  // Source Information
  source_type: 'strands_native' | 'adapted_from_ollama';
  source_agent_id?: string;
}

export interface StrandsAgent extends StrandsAgentConfig {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface DisplayableOllamaAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  model: string;
  personality?: string;
  expertise?: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
  updated_at?: string;
  source: 'ollama';
  capabilities: string[];
  has_guardrails: boolean;
  is_configured: boolean;
  // Full configuration for adaptation
  guardrails: {
    enabled: boolean;
    safety_level: string;
    content_filters: string[];
    rules: string[];
  };
  tools?: string[];
  memory?: {
    shortTerm: boolean;
    longTerm: boolean;
    contextual: boolean;
  };
  behavior?: {
    response_style: string;
    communication_tone: string;
  };
}

export interface StrandsExecutionResult {
  id: string;
  agentId: string;
  input: string;
  output: string;
  success: boolean;
  duration: number;
  tokensUsed: number;
  llmCalls: number;
  toolsUsed: string[];
  reflectionSteps: number;
  reasoningTrace: StrandsReasoningStep[];
  timestamp: string;
  metadata: {
    reasoning_pattern: string;
    model: string;
    total_steps: number;
    strategy: string;
  };
}

export interface StrandsReasoningStep {
  step: number;
  type: 'planning' | 'tool_execution' | 'reflection' | 'final_response' | 'assessment' | 'direct_response' | 'task_breakdown' | 'subtask_execution' | 'synthesis';
  prompt?: string;
  response?: string;
  tool?: string;
  input?: any;
  output?: any;
  tokens_used?: number;
  timestamp: string;
  subtask?: string;
}

export interface StrandsAgentMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  totalTokensUsed: number;
  averageTokensPerExecution: number;
  totalLLMCalls: number;
  averageLLMCallsPerExecution: number;
  totalToolCalls: number;
  totalReflections: number;
  lastExecution?: string;
  successRate: number;
}

export interface StrandsHealthStatus {
  strands_api: string;
  ollama_core: string;
  models_available: number;
  database: string;
  timestamp: string;
  error?: string;
}

class StrandsAgentService {
  private baseUrl = 'http://localhost:5004';
  
  constructor() {
    console.log('🧠 StrandsAgentService initialized');
  }

  // Health Check
  async getHealthStatus(): Promise<StrandsHealthStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/health`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get Strands health status:', error);
      throw error;
    }
  }

  // Agent Management
  async createStrandsAgent(config: Omit<StrandsAgentConfig, 'id'>): Promise<StrandsAgent> {
    try {
      console.log('🔄 Creating Strands agent:', config.name);
      
      const response = await fetch(`${this.baseUrl}/api/strands/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Strands agent created successfully:', result.agent.id);
      
      return result.agent;
    } catch (error) {
      console.error('Error creating Strands agent:', error);
      throw error;
    }
  }

  async getStrandsAgents(): Promise<StrandsAgent[]> {
    try {
      console.log('🔄 Fetching Strands agents from:', `${this.baseUrl}/api/strands/agents`);
      
      const response = await fetch(`${this.baseUrl}/api/strands/agents`);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Received data:', data);
      console.log('📊 Agents count:', data.agents?.length || 0);
      
      return data.agents || [];
    } catch (error) {
      console.error('❌ Failed to fetch Strands agents:', error);
      return [];
    }
  }

  async updateStrandsAgent(id: string, updates: Partial<StrandsAgentConfig>): Promise<StrandsAgent> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/agents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.agent;
    } catch (error) {
      console.error('Error updating Strands agent:', error);
      throw error;
    }
  }

  async deleteStrandsAgent(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/agents/${id}`, {
        method: 'DELETE'
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting Strands agent:', error);
      return false;
    }
  }

  // Agent Execution
  async executeStrandsAgent(agentId: string, input: string): Promise<StrandsExecutionResult> {
    try {
      console.log('🧠 Executing Strands agent:', agentId);
      
      const response = await fetch(`${this.baseUrl}/api/strands/agents/${agentId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Strands agent execution completed:', {
        success: result.success,
        duration: result.duration,
        tokens: result.tokensUsed,
        llmCalls: result.llmCalls,
        steps: result.reasoningTrace?.length || 0
      });
      
      return result;
    } catch (error) {
      console.error('Error executing Strands agent:', error);
      throw error;
    }
  }

  // Agent Metrics
  async getAgentMetrics(agentId: string): Promise<StrandsAgentMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/agents/${agentId}/metrics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get agent metrics:', error);
      throw error;
    }
  }

  // Ollama Agent Display (Read-Only)
  async getOllamaAgentsForDisplay(): Promise<DisplayableOllamaAgent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/ollama-agents`);
      
      if (!response.ok) {
        console.warn('Failed to fetch Ollama agents for display');
        return [];
      }
      
      const data = await response.json();
      return data.agents || [];
    } catch (error) {
      console.warn('Error fetching Ollama agents for display:', error);
      return [];
    }
  }

  // Agent Adaptation (Convert Ollama agent to Strands agent)
  async adaptOllamaAgentToStrands(
    ollamaAgent: DisplayableOllamaAgent, 
    strandsConfig: Partial<StrandsAgentConfig>
  ): Promise<StrandsAgent> {
    try {
      console.log('🔄 Adapting Ollama agent to Strands:', ollamaAgent.name);
      
      const adaptedConfig: Omit<StrandsAgentConfig, 'id'> = {
        // Basic info from Ollama agent
        name: strandsConfig.name || `${ollamaAgent.name} (Strands)`,
        role: strandsConfig.role || ollamaAgent.role,
        description: strandsConfig.description || ollamaAgent.description,
        system_prompt: strandsConfig.system_prompt || ollamaAgent.system_prompt,
        model: ollamaAgent.model,
        temperature: strandsConfig.temperature ?? ollamaAgent.temperature,
        max_tokens: strandsConfig.max_tokens ?? ollamaAgent.max_tokens,
        
        // Strands-specific configuration
        reasoning_pattern: strandsConfig.reasoning_pattern || 'sequential',
        reflection_enabled: strandsConfig.reflection_enabled ?? true,
        chain_of_thought_depth: strandsConfig.chain_of_thought_depth || 3,
        
        // Tool configuration
        tools_config: strandsConfig.tools_config || [],
        tool_selection_strategy: strandsConfig.tool_selection_strategy || 'automatic',
        mcp_servers: strandsConfig.mcp_servers || [],
        
        // Multi-agent configuration
        agent_architecture: strandsConfig.agent_architecture || 'single',
        delegation_rules: strandsConfig.delegation_rules || [],
        communication_protocol: strandsConfig.communication_protocol || 'direct',
        
        // Observability configuration
        telemetry_enabled: strandsConfig.telemetry_enabled ?? true,
        tracing_level: strandsConfig.tracing_level || 'basic',
        metrics_collection: strandsConfig.metrics_collection || [],
        
        // Execution configuration
        execution_mode: strandsConfig.execution_mode || 'local',
        resource_limits: strandsConfig.resource_limits || {},
        error_handling: strandsConfig.error_handling || {},
        
        // Source information
        source_type: 'adapted_from_ollama',
        source_agent_id: ollamaAgent.id
      };
      
      const strandsAgent = await this.createStrandsAgent(adaptedConfig);
      console.log('✅ Successfully adapted Ollama agent to Strands');
      
      return strandsAgent;
    } catch (error) {
      console.error('Error adapting Ollama agent to Strands:', error);
      throw error;
    }
  }

  // Utility Methods
  getReasoningPatternDescription(pattern: string): string {
    switch (pattern) {
      case 'sequential':
        return 'Step-by-step reasoning with planning, execution, and reflection';
      case 'adaptive':
        return 'Adapts reasoning strategy based on task complexity';
      case 'parallel':
        return 'Breaks tasks into parallel subtasks for faster processing';
      default:
        return 'Unknown reasoning pattern';
    }
  }

  getArchitectureDescription(architecture: string): string {
    switch (architecture) {
      case 'single':
        return 'Single agent handles all tasks independently';
      case 'supervisor':
        return 'Supervisor agent delegates to specialist agents';
      case 'swarm':
        return 'Multiple agents collaborate peer-to-peer';
      case 'hierarchical':
        return 'Multi-level agent hierarchy with delegation';
      default:
        return 'Unknown architecture';
    }
  }

  formatExecutionTime(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`;
    } else {
      return `${(milliseconds / 60000).toFixed(1)}m`;
    }
  }

  formatTokenCount(tokens: number): string {
    if (tokens < 1000) {
      return tokens.toString();
    } else if (tokens < 1000000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    } else {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
  }

  // Health check with retry
  async waitForService(maxAttempts: number = 10, delayMs: number = 2000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const health = await this.getHealthStatus();
        if (health.strands_api === 'running') {
          console.log('✅ Strands API is ready');
          return true;
        }
      } catch (error) {
        console.log(`⏳ Waiting for Strands API... (${attempt}/${maxAttempts})`);
      }
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    console.error('❌ Strands API failed to start');
    return false;
  }
}

// Global instance
export const strandsAgentService = new StrandsAgentService();