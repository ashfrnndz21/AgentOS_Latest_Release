/**
 * Strands SDK Integration
 * Based on: https://github.com/strands-agents/sdk-python
 * 
 * This implements the Strands agent creation patterns for advanced reasoning
 */

export interface StrandsAgentConfig {
  name: string;
  description: string;
  model: {
    provider: 'bedrock';
    model_id: string;
    temperature?: number;
    max_tokens?: number;
  };
  a2a_config?: {
    enabled: boolean;
    collaboration_mode: 'orchestrator' | 'participant' | 'both';
    max_concurrent_agents: number;
    communication_protocol: 'websocket' | 'rest' | 'both';
    auto_registration: boolean;
    discovery_scope: 'local' | 'global' | 'custom';
    custom_agents: string[];
    conversation_tracing: boolean;
    real_time_monitoring: boolean;
  };
  reasoning_patterns: {
    chain_of_thought: boolean;
    tree_of_thought: boolean;
    reflection: boolean;
    self_critique: boolean;
    multi_step_reasoning?: boolean;
    analogical_reasoning?: boolean;
  };
  memory: {
    working_memory: boolean;
    episodic_memory: boolean;
    semantic_memory: boolean;
    memory_consolidation: boolean;
    context_window_management?: boolean;
  };
  tools: string[];
  guardrails: {
    content_filter: boolean;
    reasoning_validator: boolean;
    output_sanitizer: boolean;
    ethical_constraints?: boolean;
  };
  workflow_steps?: any[];
  performance_config?: {
    max_reasoning_depth: number;
    reflection_cycles: number;
    temperature: number;
    max_tokens: number;
  };
}

export interface StrandsAgent {
  id: string;
  name: string;
  status: 'initializing' | 'ready' | 'running' | 'error';
  config: StrandsAgentConfig;
  metadata: {
    created_at: string;
    framework: 'strands';
    version: string;
    reasoning_capabilities: string[];
    memory_systems: string[];
    performance_metrics: {
      avg_reasoning_time: number;
      reasoning_accuracy: number;
      memory_efficiency: number;
    };
  };
}

export class StrandsSDK {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = '/api', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || '';
  }

  /**
   * Create a Strands agent with advanced reasoning patterns
   */
  async createAgent(config: StrandsAgentConfig): Promise<StrandsAgent> {
    console.log('StrandsSDK: Creating agent with config:', config);

    // Build Strands-specific configuration for backend
    const strandsConfig = {
      name: config.name,
      framework: 'strands',
      config: {
        model: config.model,
        a2a_config: config.a2a_config,
        reasoning_patterns: config.reasoning_patterns,
        memory: config.memory,
        tools: config.tools,
        guardrails: config.guardrails,
        workflow_steps: config.workflow_steps || [],
        performance_config: config.performance_config || {
          max_reasoning_depth: 5,
          reflection_cycles: 2,
          temperature: 0.7,
          max_tokens: 4000
        },
        reasoning_engine: {
          patterns: config.reasoning_patterns,
          memory_systems: config.memory,
          inference_strategy: this.buildInferenceStrategy(config.reasoning_patterns)
        },
        metadata: {
          framework_version: '1.0.0',
          reasoning_capabilities: this.getReasoningCapabilities(config.reasoning_patterns),
          memory_systems: this.getMemorySystems(config.memory),
          created_with: 'strands-workflow-ui'
        }
      }
    };

    console.log('StrandsSDK: Sending to backend:', strandsConfig);

    // Call Strands SDK API (port 5006) for real A2A integration
    const response = await fetch('http://localhost:5006/api/strands-sdk/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({
        name: config.name,
        description: config.description || '',
        model_id: config.model.model_id,
        host: 'http://localhost:11434', // Ollama host
        system_prompt: `You are ${config.name}, an advanced AI agent with reasoning capabilities. ${config.description || ''}`,
        tools: config.tools || [],
        ollama_config: {
          temperature: config.model.temperature || 0.7,
          top_p: 0.9,
          max_tokens: config.model.max_tokens || 4000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to create Strands workflow';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      console.error('StrandsSDK: Backend error:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('StrandsSDK: Backend response:', result);
    
    // A2A registration is now handled by the backend automatically
    if (result.a2a_registration) {
      console.log('StrandsSDK: A2A registration result:', result.a2a_registration);
      if (result.a2a_registration.status === 'success') {
        console.log('StrandsSDK: ✅ Agent successfully registered with A2A service');
      } else {
        console.warn('StrandsSDK: ⚠️ A2A registration failed:', result.a2a_registration.error);
      }
    }

    // Also register with main Ollama system (port 8000) for visibility in main UI
    try {
      console.log('StrandsSDK: Registering with main Ollama system...');
      const mainSystemResponse = await fetch('http://localhost:5002/api/agents/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: config.name,
          role: 'Strands AI Agent',
          description: config.description || '',
          model: config.model.model_id,
          personality: 'Advanced reasoning and problem-solving',
          expertise: config.tools?.join(', ') || 'General AI assistance',
          system_prompt: `You are ${config.name}, an advanced AI agent with reasoning capabilities. ${config.description || ''}`,
          temperature: config.model.temperature || 0.7,
          max_tokens: config.model.max_tokens || 4000,
          guardrails_enabled: config.guardrails?.enabled || false,
          safety_level: config.guardrails?.safetyLevel || 'medium',
          content_filters: JSON.stringify(config.guardrails?.contentFilters || []),
          custom_rules: JSON.stringify(config.guardrails?.rules || [])
        })
      });

      if (mainSystemResponse.ok) {
        const mainSystemResult = await mainSystemResponse.json();
        console.log('StrandsSDK: ✅ Agent registered with main Ollama system:', mainSystemResult.agent_id);
      } else {
        console.warn('StrandsSDK: ⚠️ Failed to register with main Ollama system:', mainSystemResponse.status);
      }
    } catch (error) {
      console.warn('StrandsSDK: ⚠️ Error registering with main Ollama system:', error);
      // Don't fail agent creation if main system registration fails
    }
    
    return {
      id: result.id,
      name: config.name,
      status: result.sdk_validated ? 'ready' : 'error',
      config,
      metadata: {
        created_at: new Date().toISOString(),
        framework: 'strands',
        version: '1.0.0',
        reasoning_capabilities: this.getReasoningCapabilities(config.reasoning_patterns),
        memory_systems: this.getMemorySystems(config.memory),
        performance_metrics: {
          avg_reasoning_time: 0,
          reasoning_accuracy: 0,
          memory_efficiency: 0
        }
      }
    };
  }

  /**
   * Register agent with A2A system
   */
  private async registerWithA2A(agentId: string, config: StrandsAgentConfig): Promise<void> {
    if (!config.a2a_config?.enabled) return;

    const a2aConfig = {
      agent_id: agentId,
      name: config.name,
      description: config.description,
      collaboration_mode: config.a2a_config.collaboration_mode,
      max_concurrent_agents: config.a2a_config.max_concurrent_agents,
      communication_protocol: config.a2a_config.communication_protocol,
      auto_registration: config.a2a_config.auto_registration,
      discovery_scope: config.a2a_config.discovery_scope,
      custom_agents: config.a2a_config.custom_agents,
      conversation_tracing: config.a2a_config.conversation_tracing,
      real_time_monitoring: config.a2a_config.real_time_monitoring,
      capabilities: this.getReasoningCapabilities(config.reasoning_patterns),
      memory_systems: this.getMemorySystems(config.memory),
      tools: config.tools,
      reasoning_patterns: config.reasoning_patterns
    };

    const response = await fetch('http://localhost:5008/api/a2a/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(a2aConfig)
    });

    if (!response.ok) {
      throw new Error(`Failed to register with A2A system: ${response.statusText}`);
    }
  }

  /**
   * Build inference strategy based on reasoning patterns
   */
  private buildInferenceStrategy(patterns: StrandsAgentConfig['reasoning_patterns']): string {
    const strategies = [];
    
    if (patterns.chain_of_thought) strategies.push('chain_of_thought');
    if (patterns.tree_of_thought) strategies.push('tree_of_thought');
    if (patterns.reflection) strategies.push('reflection');
    if (patterns.self_critique) strategies.push('self_critique');
    
    return strategies.length > 0 ? strategies.join('->') : 'basic_reasoning';
  }

  /**
   * Get reasoning capabilities from patterns
   */
  private getReasoningCapabilities(patterns: StrandsAgentConfig['reasoning_patterns']): string[] {
    const capabilities = [];
    
    if (patterns.chain_of_thought) capabilities.push('Chain-of-Thought Reasoning');
    if (patterns.tree_of_thought) capabilities.push('Tree-of-Thought Planning');
    if (patterns.reflection) capabilities.push('Reflective Analysis');
    if (patterns.self_critique) capabilities.push('Self-Critique & Validation');
    
    return capabilities;
  }

  /**
   * Get memory systems from configuration
   */
  private getMemorySystems(memory: StrandsAgentConfig['memory']): string[] {
    const systems = [];
    
    if (memory.working_memory) systems.push('Working Memory');
    if (memory.episodic_memory) systems.push('Episodic Memory');
    if (memory.semantic_memory) systems.push('Semantic Memory');
    if (memory.memory_consolidation) systems.push('Memory Consolidation');
    
    return systems;
  }

  /**
   * Check if AWS Bedrock credentials are available
   */
  private hasBedrockCredentials(): boolean {
    // In a real implementation, this would check environment variables
    // For demo purposes, we'll check via the health endpoint
    return true; // Will be validated by backend
  }

  /**
   * Execute reasoning with a Strands agent
   */
  async executeReasoning(agentId: string, prompt: string, options?: {
    reasoning_depth?: number;
    reflection_cycles?: number;
    critique_enabled?: boolean;
  }): Promise<{
    response: string;
    reasoning_trace: string[];
    confidence_score: number;
    execution_time: number;
  }> {
    const response = await fetch(`${this.baseUrl}/agents/${agentId}/reason`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({
        prompt,
        options: options || {}
      })
    });

    if (!response.ok) {
      throw new Error('Failed to execute reasoning');
    }

    return await response.json();
  }

  /**
   * Get agent performance metrics
   */
  async getAgentMetrics(agentId: string): Promise<{
    reasoning_performance: {
      avg_response_time: number;
      accuracy_score: number;
      reasoning_depth: number;
    };
    memory_usage: {
      working_memory_utilization: number;
      long_term_memory_size: number;
      consolidation_efficiency: number;
    };
    tool_usage: {
      tools_called: number;
      success_rate: number;
      avg_tool_latency: number;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/agents/${agentId}/metrics`);
    
    if (!response.ok) {
      throw new Error('Failed to get agent metrics');
    }

    return await response.json();
  }
}