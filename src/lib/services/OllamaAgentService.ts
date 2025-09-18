import { ollamaService } from './OllamaService';

export interface OllamaAgentConfig {
  id: string;
  name: string;
  role?: string;
  description?: string;
  model: string;
  personality?: string;
  expertise?: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  sdkType?: 'ollama' | 'strands-sdk';
  memory: {
    shortTerm: boolean;
    longTerm: boolean;
    contextual: boolean;
  };
  ragEnabled: boolean;
  knowledgeBases: string[];
  guardrails: {
    enabled: boolean;
    rules: string[];
    safetyLevel?: 'low' | 'medium' | 'high';
    contentFilters?: string[];
  };
  capabilities?: {
    conversation: boolean;
    analysis: boolean;
    creativity: boolean;
    reasoning: boolean;
  };
  behavior?: {
    response_style: string;
    communication_tone: string;
  };
  // Enhanced configurations from the creation dialog
  enhancedCapabilities?: {
    conversation: {
      enabled: boolean;
      level: 'basic' | 'intermediate' | 'advanced';
    };
    analysis: {
      enabled: boolean;
      level: 'basic' | 'intermediate' | 'advanced';
    };
    creativity: {
      enabled: boolean;
      level: 'basic' | 'intermediate' | 'advanced';
    };
    reasoning: {
      enabled: boolean;
      level: 'basic' | 'intermediate' | 'advanced';
    };
  };
  enhancedGuardrails?: {
    global: boolean;
    local: boolean;
    piiRedaction: {
      enabled: boolean;
      strategy: 'mask' | 'remove' | 'placeholder';
      customTypes: string[];
      customPatterns: string[];
      maskCharacter: string;
      placeholderText: string;
    };
    contentFilter: {
      enabled: boolean;
      level: 'basic' | 'moderate' | 'strict';
      customKeywords: string[];
      allowedDomains: string[];
      blockedPhrases: string[];
    };
    behaviorLimits: {
      enabled: boolean;
      customLimits: string[];
      responseMaxLength: number;
      requireApproval: boolean;
    };
    customRules: any[];
  };
  // Additional metadata
  createdAt?: string;
  updatedAt?: string;
  status?: string;
}

export interface AgentConversation {
  id: string;
  agentId: string;
  messages: AgentMessage[];
  context: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    duration?: number;
    tools_used?: string[];
    sources?: string[];
  };
}

export interface AgentExecution {
  id: string;
  agentId: string;
  input: string;
  output: string;
  success: boolean;
  duration: number;
  tokensUsed: number;
  error?: string;
  timestamp: Date;
  metadata: {
    model: string;
    temperature: number;
    tools_used: string[];
    context_length: number;
  };
}

export class OllamaAgentService {
  private ollamaService: OllamaService;
  private agents: Map<string, OllamaAgentConfig> = new Map();
  private conversations: Map<string, AgentConversation> = new Map();
  private executions: AgentExecution[] = [];

  constructor() {
    this.ollamaService = ollamaService;
    // Load from localStorage only (no Strands backend dependency)
    this.loadAgentsFromStorage();
    this.loadExecutionsFromStorage();
    
    console.log('🔄 OllamaAgentService initialized (local storage only, no Strands dependency)');
    
    // Setup periodic cleanup (every hour)
    setInterval(() => {
      this.cleanupOldConversations();
    }, 60 * 60 * 1000);
  }



  // Agent Management
  clearAllAgents(): void {
    console.log('🧹 Clearing all agents and localStorage');
    
    const agentCount = this.agents.size;
    const conversationCount = this.conversations.size;
    const executionCount = this.executions.length;
    
    // Clear in-memory data
    this.agents.clear();
    this.conversations.clear();
    this.executions = [];
    
    // Clear localStorage
    try {
      localStorage.removeItem('ollama-agents');
      localStorage.removeItem('ollama-conversations');
      localStorage.removeItem('ollama-executions');
      console.log(`✅ Cleared ${agentCount} agents, ${conversationCount} conversations, ${executionCount} executions`);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
    
    // Also save empty state to ensure it's persisted
    this.saveAgentsToStorage();
    this.saveExecutionsToStorage();
  }

  async updateAgentModel(agentId: string, newModel: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    console.log(`Updating agent ${agent.name} model from "${agent.model}" to "${newModel}"`);
    
    agent.model = newModel;
    agent.updatedAt = new Date().toISOString();
    
    this.agents.set(agentId, agent);
    this.saveAgentsToStorage();
    
    console.log(`✅ Agent ${agent.name} model updated successfully`);
  }

  async createAgent(config: Omit<OllamaAgentConfig, 'id'>): Promise<OllamaAgentConfig> {
    console.log('🔄 Creating agent locally (no Strands dependency)');

    // Create agent locally only
    const agentConfig: OllamaAgentConfig = {
      id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      ...config,
      // Add metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    // CRITICAL VALIDATION: Ensure model is never empty
    if (!agentConfig.model || agentConfig.model.trim() === '') {
      console.error('❌ CRITICAL ERROR: Agent model is empty during creation!');
      console.error('Input config:', config);
      throw new Error('Agent model cannot be empty. Please select a valid model.');
    }

    // Debug log to verify all configuration is captured
    console.log('=== AGENT CREATION DEBUG ===');
    console.log('Input config model:', config.model);
    console.log('Final agent config model:', agentConfig.model);
    console.log('✅ Model validation passed');
    console.log('Creating agent with full configuration:', {
      name: agentConfig.name,
      model: agentConfig.model,
      hasEnhancedCapabilities: !!agentConfig.enhancedCapabilities,
      hasEnhancedGuardrails: !!agentConfig.enhancedGuardrails,
      guardrailsEnabled: agentConfig.guardrails?.enabled,
      temperature: agentConfig.temperature,
      maxTokens: agentConfig.maxTokens
    });
    console.log('=== END CREATION DEBUG ===');

    this.agents.set(agentConfig.id, agentConfig);
    this.saveAgentsToStorage();
    
    return agentConfig;
  }

  getAgent(agentId: string): OllamaAgentConfig | null {
    return this.agents.get(agentId) || null;
  }

  getAllAgents(): OllamaAgentConfig[] {
    return Array.from(this.agents.values());
  }

  async updateAgent(agentId: string, updates: Partial<OllamaAgentConfig>): Promise<OllamaAgentConfig> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const updatedAgent = { ...agent, ...updates };
    this.agents.set(agentId, updatedAgent);
    this.saveAgentsToStorage();

    return updatedAgent;
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    console.log('🗑️ Deleting agent:', agentId);
    
    const deleted = this.agents.delete(agentId);
    if (deleted) {
      // Also clean up related conversations and executions
      const conversationsToDelete = Array.from(this.conversations.entries())
        .filter(([_, conv]) => conv.agentId === agentId)
        .map(([id, _]) => id);
      
      conversationsToDelete.forEach(convId => this.conversations.delete(convId));
      
      this.executions = this.executions.filter(exec => exec.agentId !== agentId);
      
      // Save to storage
      this.saveAgentsToStorage();
      this.saveExecutionsToStorage();
      
      console.log('✅ Agent deleted successfully');
    } else {
      console.warn('⚠️ Agent not found for deletion');
    }
    
    return deleted;
  }



  // Conversation Management
  async createConversation(agentId: string): Promise<string> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    const conversation: AgentConversation = {
      id: conversationId,
      agentId,
      messages: [],
      context: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add system message if agent has system prompt
    if (agent.systemPrompt) {
      conversation.messages.push({
        id: `msg-${Date.now()}`,
        role: 'system',
        content: agent.systemPrompt,
        timestamp: new Date()
      });
    }

    this.conversations.set(conversationId, conversation);
    return conversationId;
  }

  getConversation(conversationId: string): AgentConversation | null {
    return this.conversations.get(conversationId) || null;
  }

  getAgentConversations(agentId: string): AgentConversation[] {
    return Array.from(this.conversations.values())
      .filter(conv => conv.agentId === agentId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Agent Execution
  async executeAgent(
    agentId: string, 
    input: string, 
    conversationId?: string
  ): Promise<AgentExecution> {
    const startTime = Date.now();
    const agent = this.agents.get(agentId);
    
    console.log('Executing agent:', agentId, 'Agent found:', !!agent);
    if (agent) {
      console.log('Agent details:', { 
        name: agent.name, 
        model: agent.model, 
        temperature: agent.temperature,
        maxTokens: agent.maxTokens 
      });
    }
    
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Get or create conversation
    let conversation: AgentConversation;
    if (conversationId) {
      const existingConv = this.conversations.get(conversationId);
      if (!existingConv || existingConv.agentId !== agentId) {
        throw new Error(`Conversation ${conversationId} not found or doesn't belong to agent ${agentId}`);
      }
      conversation = existingConv;
    } else {
      const newConvId = await this.createConversation(agentId);
      conversation = this.conversations.get(newConvId)!;
    }

    try {
      // Add user message to conversation
      const userMessage: AgentMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: input,
        timestamp: new Date()
      };
      conversation.messages.push(userMessage);

      // Build prompt with conversation history
      const prompt = this.buildPrompt(agent, conversation, input);

      // Execute with Ollama
      console.log('Executing agent with model:', agent.model, 'prompt length:', prompt.length);
      
      if (!agent.model) {
        throw new Error('Agent model is not defined');
      }
      
      const response = await this.ollamaService.generateResponse(agent.model, prompt, {
        temperature: agent.temperature,
        max_tokens: agent.maxTokens,
        system: agent.systemPrompt
      });

      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to generate response');
      }

      const duration = Date.now() - startTime;
      const tokensUsed = response.eval_count || 0;

      // Validate response against guardrails
      const validation = await this.validateResponse(response.response || '', agent.guardrails);
      
      let finalResponse = response.response || '';
      
      // If guardrails validation fails, modify the response
      if (!validation.valid) {
        console.warn(`Guardrails violation detected for agent ${agentId}:`, validation.issues);
        finalResponse = "I apologize, but I cannot provide that information as it violates my configured guidelines. Please ask me something else I can help you with.";
      }

      // Add assistant message to conversation
      const assistantMessage: AgentMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: finalResponse,
        timestamp: new Date(),
        metadata: {
          model: agent.model,
          tokens: tokensUsed,
          duration,
          tools_used: []
        }
      };
      conversation.messages.push(assistantMessage);
      conversation.updatedAt = new Date();

      // Create execution record
      const execution: AgentExecution = {
        id: `exec-${Date.now()}`,
        agentId,
        input,
        output: finalResponse,
        success: true,
        duration,
        tokensUsed,
        timestamp: new Date(),
        metadata: {
          model: agent.model,
          temperature: agent.temperature,
          tools_used: [],
          context_length: conversation.messages.length
        }
      };

      this.executions.push(execution);
      
      // Keep only last 1000 executions
      if (this.executions.length > 1000) {
        this.executions = this.executions.slice(-1000);
      }

      return execution;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Create failed execution record
      const execution: AgentExecution = {
        id: `exec-${Date.now()}`,
        agentId,
        input,
        output: '',
        success: false,
        duration,
        tokensUsed: 0,
        error: errorMessage,
        timestamp: new Date(),
        metadata: {
          model: agent.model,
          temperature: agent.temperature,
          tools_used: [],
          context_length: 0
        }
      };

      this.executions.push(execution);
      throw error;
    }
  }

  // Build prompt with conversation history and system prompt
  private buildPrompt(agent: OllamaAgentConfig, conversation: AgentConversation, currentInput: string): string {
    let prompt = '';

    // Add system prompt if exists
    if (agent.systemPrompt) {
      prompt += `System: ${agent.systemPrompt}\n\n`;
    }

    // Add conversation history (last 10 messages to manage context)
    const recentMessages = conversation.messages
      .filter(msg => msg.role !== 'system')
      .slice(-10);

    for (const message of recentMessages) {
      if (message.role === 'user') {
        prompt += `Human: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }

    // Add current input
    prompt += `Human: ${currentInput}\n\nAssistant:`;

    return prompt;
  }

  private async validateResponse(response: string, guardrails: OllamaAgentConfig['guardrails']): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    if (!guardrails?.enabled) {
      return { valid: true, issues: [] };
    }

    const lowercaseResponse = response.toLowerCase();

    // Content filtering
    if (guardrails.contentFilters) {
      if (guardrails.contentFilters.includes('profanity')) {
        const profanityWords = ['damn', 'hell', 'shit', 'fuck'];
        if (profanityWords.some(word => lowercaseResponse.includes(word))) {
          issues.push('Contains inappropriate language');
        }
      }

      if (guardrails.contentFilters.includes('harmful')) {
        const harmfulPatterns = ['how to make', 'instructions for', 'steps to harm'];
        if (harmfulPatterns.some(pattern => lowercaseResponse.includes(pattern))) {
          issues.push('May contain harmful instructions');
        }
      }
    }

    // Custom rules validation
    if (guardrails.rules && Array.isArray(guardrails.rules)) {
      for (const rule of guardrails.rules) {
        if (typeof rule === 'string' && lowercaseResponse.includes(rule.toLowerCase())) {
          issues.push(`Violates custom rule: ${rule}`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Analytics and Monitoring
  getAgentMetrics(agentId: string): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageResponseTime: number;
    totalTokensUsed: number;
    averageTokensPerExecution: number;
    lastExecution?: Date;
  } {
    const agentExecutions = this.executions.filter(exec => exec.agentId === agentId);
    
    if (agentExecutions.length === 0) {
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageResponseTime: 0,
        totalTokensUsed: 0,
        averageTokensPerExecution: 0
      };
    }

    const successful = agentExecutions.filter(exec => exec.success);
    const failed = agentExecutions.filter(exec => !exec.success);
    const totalTokens = agentExecutions.reduce((sum, exec) => sum + exec.tokensUsed, 0);
    const totalDuration = agentExecutions.reduce((sum, exec) => sum + exec.duration, 0);

    return {
      totalExecutions: agentExecutions.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      averageResponseTime: totalDuration / agentExecutions.length,
      totalTokensUsed: totalTokens,
      averageTokensPerExecution: totalTokens / agentExecutions.length,
      lastExecution: agentExecutions[agentExecutions.length - 1]?.timestamp
    };
  }

  getAllExecutions(): AgentExecution[] {
    return [...this.executions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAgentExecutions(agentId: string): AgentExecution[] {
    return this.executions
      .filter(exec => exec.agentId === agentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Removed backend integration to eliminate Strands dependency
  // All agents are now stored locally only

  // Persistence
  private saveAgentsToStorage(): void {
    try {
      const agentsData = Array.from(this.agents.entries());
      localStorage.setItem('ollama-agents', JSON.stringify(agentsData));
      
      // Also save conversations
      const conversationsData = Array.from(this.conversations.entries());
      localStorage.setItem('ollama-conversations', JSON.stringify(conversationsData));
      
      console.log('Saved', agentsData.length, 'agents and', conversationsData.length, 'conversations to storage');
    } catch (error) {
      console.error('Failed to save agents to storage:', error);
    }
  }

  private loadAgentsFromStorage(): void {
    try {
      const stored = localStorage.getItem('ollama-agents');
      if (stored) {
        const agentsData = JSON.parse(stored);
        
        // Migrate and validate agents to ensure all required properties exist
        const migratedAgents = agentsData.map(([id, agent]: [string, any]) => {
          const migratedAgent = {
            ...agent,
            // Ensure guardrails property exists
            guardrails: agent.guardrails || {
              enabled: false,
              rules: [],
              safetyLevel: 'medium',
              contentFilters: []
            },
            // Ensure memory property exists
            memory: agent.memory || {
              shortTerm: true,
              longTerm: false,
              contextual: true
            },
            // Ensure other properties exist
            capabilities: agent.capabilities || {
              conversation: true,
              analysis: true,
              creativity: true,
              reasoning: true
            },
            behavior: agent.behavior || {
              response_style: 'helpful',
              communication_tone: 'professional'
            }
          };
          return [id, migratedAgent];
        });
        
        this.agents = new Map(migratedAgents);
        console.log('Loaded and migrated', agentsData.length, 'agents from storage');
        
        // Save the migrated agents back to storage
        this.saveAgentsToStorage();
      }
      
      // Also load conversations
      const conversationsStored = localStorage.getItem('ollama-conversations');
      if (conversationsStored) {
        const conversationsData = JSON.parse(conversationsStored);
        this.conversations = new Map(conversationsData.map(([id, conv]: [string, any]) => [
          id,
          {
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }
        ]));
        console.log('Loaded', conversationsData.length, 'conversations from storage');
      }
    } catch (error) {
      console.error('Failed to load agents from storage:', error);
    }
  }

  // Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    ollamaStatus: string;
    agentCount: number;
    activeConversations: number;
    totalExecutions: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let ollamaStatus = 'unknown';

    try {
      const status = await this.ollamaService.getStatus();
      ollamaStatus = status.status;
      
      if (status.status !== 'running') {
        errors.push('Ollama service is not running');
      }
    } catch (error) {
      errors.push(`Ollama health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const agentCount = this.agents.size;
    const activeConversations = this.conversations.size;
    const totalExecutions = this.executions.length;

    let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (errors.length > 0) {
      healthStatus = ollamaStatus === 'running' ? 'degraded' : 'unhealthy';
    }

    return {
      status: healthStatus,
      ollamaStatus,
      agentCount,
      activeConversations,
      totalExecutions,
      errors
    };
  }

  // Method to add execution (for direct Ollama calls)
  addExecution(execution: AgentExecution): void {
    this.executions.push(execution);
    
    // Keep only last 500 executions for better memory management
    if (this.executions.length > 500) {
      this.executions = this.executions.slice(-500);
    }
    
    // Debounce storage saves to avoid excessive localStorage writes
    this.debouncedSaveExecutions();
  }

  private saveExecutionsTimeout: NodeJS.Timeout | null = null;
  
  private debouncedSaveExecutions = () => {
    if (this.saveExecutionsTimeout) {
      clearTimeout(this.saveExecutionsTimeout);
    }
    
    this.saveExecutionsTimeout = setTimeout(() => {
      this.saveExecutionsToStorage();
    }, 1000); // Save after 1 second of inactivity
  };

  private saveExecutionsToStorage(): void {
    try {
      localStorage.setItem('ollama-executions', JSON.stringify(this.executions));
    } catch (error) {
      console.error('Failed to save executions to storage:', error);
    }
  }

  private loadExecutionsFromStorage(): void {
    try {
      const stored = localStorage.getItem('ollama-executions');
      if (stored) {
        const executionsData = JSON.parse(stored);
        // Only load recent executions (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        this.executions = executionsData
          .map((exec: any) => ({
            ...exec,
            timestamp: new Date(exec.timestamp)
          }))
          .filter((exec: AgentExecution) => exec.timestamp > thirtyDaysAgo)
          .slice(-500); // Keep only last 500
          
        console.log('Loaded', this.executions.length, 'recent executions from storage');
      }
    } catch (error) {
      console.error('Failed to load executions from storage:', error);
    }
  }

  // Cleanup old conversations periodically
  cleanupOldConversations(): void {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;
    
    for (const [id, conversation] of this.conversations.entries()) {
      if (conversation.updatedAt < sevenDaysAgo) {
        this.conversations.delete(id);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old conversations`);
      this.saveAgentsToStorage();
    }
  }
}

// Global instance
export const ollamaAgentService = new OllamaAgentService();