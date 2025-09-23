import { ollamaService } from './OllamaService';
import { ollamaAgentService } from './OllamaAgentService';
import { useOllamaAgentsForPalette, PaletteAgent } from '@/hooks/useOllamaAgentsForPalette';
import { OLLAMA_MODELS } from '@/config/ollamaModels';

export interface ChatConfig {
  type: 'direct-llm' | 'independent-agent' | 'palette-agent';
  name: string;
  
  // Direct LLM Config
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  contextWindow?: number;
  
  // Independent Agent Config
  role?: string;
  personality?: string;
  capabilities?: string[];
  guardrails?: boolean;
  tools?: string[];
  
  // Palette Agent Config
  agentId?: string;
  chatMode?: 'direct' | 'workflow-aware';
  contextSharing?: boolean;
  workflowTrigger?: boolean;
  
  // UI Config
  position: 'overlay' | 'sidebar' | 'modal' | 'embedded';
  size: 'small' | 'medium' | 'large';
  autoOpen: boolean;
  minimizable: boolean;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system' | 'error';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    agentName?: string;
    capabilities?: string[];
    processingTime?: number;
  };
}

export interface ChatResponse {
  type: 'direct-llm' | 'independent-agent' | 'palette-agent';
  response: string;
  metadata: {
    model?: string;
    tokens?: number;
    agentName?: string;
    capabilities?: string[];
    processingTime?: number;
    confidence?: number;
  };
}

export interface WorkflowContext {
  workflowId: string;
  nodes: any[];
  edges: any[];
  executionHistory: any[];
  currentData: any;
  userPreferences: Record<string, any>;
}

export class FlexibleChatService {
  private conversationHistory: Map<string, ChatMessage[]> = new Map();
  private paletteAgents: PaletteAgent[] = [];

  constructor() {
    this.loadPaletteAgents();
  }

  private async loadPaletteAgents() {
    try {
      // Load agents from the service
      await ollamaAgentService.loadAgentsFromBackend();
      const agents = ollamaAgentService.getAllAgents();
      
      // Transform to palette format (simplified version)
      this.paletteAgents = agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.role || agent.description || 'AI Agent',
        icon: '🤖',
        type: 'ollama' as const,
        model: typeof agent.model === 'string' ? agent.model : OLLAMA_MODELS.DEFAULT,
        role: agent.role || 'AI Assistant',
        capabilities: [],
        guardrails: Boolean(agent.guardrails),
        originalAgent: agent
      }));
    } catch (error) {
      console.error('Failed to load palette agents:', error);
    }
  }

  async executeChat(
    config: ChatConfig,
    userMessage: string,
    conversationId: string = 'default',
    workflowContext?: WorkflowContext
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      let response: ChatResponse;
      
      switch (config.type) {
        case 'direct-llm':
          response = await this.executeDirectLLMChat(config, userMessage, conversationId);
          break;
          
        case 'independent-agent':
          response = await this.executeIndependentAgentChat(config, userMessage, conversationId);
          break;
          
        case 'palette-agent':
          response = await this.executePaletteAgentChat(config, userMessage, conversationId, workflowContext);
          break;
          
        default:
          throw new Error(`Unknown chat type: ${config.type}`);
      }
      
      // Add processing time to metadata
      response.metadata.processingTime = Date.now() - startTime;
      
      // Store message in conversation history
      this.addToConversationHistory(conversationId, {
        id: `user_${Date.now()}`,
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      });
      
      this.addToConversationHistory(conversationId, {
        id: `agent_${Date.now()}`,
        type: 'agent',
        content: response.response,
        timestamp: new Date(),
        metadata: response.metadata
      });
      
      return response;
      
    } catch (error) {
      console.error('Chat execution failed:', error);
      throw new Error(`Chat execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeDirectLLMChat(
    config: ChatConfig,
    message: string,
    conversationId: string
  ): Promise<ChatResponse> {
    if (!config.model) {
      throw new Error('Model not specified for direct LLM chat');
    }

    try {
      // Get conversation history
      const history = this.getConversationHistory(conversationId);
      const contextMessages = this.buildContextMessages(history, config.contextWindow || 10);
      
      // Build prompt from conversation
      let prompt = config.systemPrompt || 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.';
      
      // Add conversation context
      for (const msg of contextMessages) {
        if (msg.role === 'user') {
          prompt += `\n\nUser: ${msg.content}`;
        } else {
          prompt += `\n\nAssistant: ${msg.content}`;
        }
      }
      
      prompt += `\n\nUser: ${message}\n\nAssistant:`;

      // Call Ollama service
      const response = await ollamaService.generateResponse({
        model: config.model,
        prompt,
        options: {
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 1000
        }
      });

      if (response.status !== 'success' || !response.response) {
        throw new Error(response.message || 'Failed to generate response');
      }

      return {
        type: 'direct-llm',
        response: response.response,
        metadata: {
          model: config.model,
          tokens: response.eval_count || 0
        }
      };
      
    } catch (error) {
      console.error('Direct LLM chat failed:', error);
      throw new Error(`Direct LLM chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeIndependentAgentChat(
    config: ChatConfig,
    message: string,
    conversationId: string
  ): Promise<ChatResponse> {
    if (!config.model || !config.name || !config.role) {
      throw new Error('Incomplete configuration for independent agent chat');
    }

    try {
      // Get conversation history
      const history = this.getConversationHistory(conversationId);
      const contextMessages = this.buildContextMessages(history, config.contextWindow || 10);
      
      // Build enhanced system prompt
      const systemPrompt = this.buildIndependentAgentPrompt(config);
      
      // Build prompt from conversation
      let prompt = systemPrompt;
      
      // Add conversation context
      for (const msg of contextMessages) {
        if (msg.role === 'user') {
          prompt += `\n\nUser: ${msg.content}`;
        } else {
          prompt += `\n\nAssistant: ${msg.content}`;
        }
      }
      
      prompt += `\n\nUser: ${message}\n\nAssistant:`;

      // Call Ollama service
      const response = await ollamaService.generateResponse({
        model: config.model,
        prompt,
        options: {
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 1000
        }
      });

      if (response.status !== 'success' || !response.response) {
        throw new Error(response.message || 'Failed to generate response');
      }

      return {
        type: 'independent-agent',
        response: response.response,
        metadata: {
          model: config.model,
          agentName: config.name,
          capabilities: config.capabilities || [],
          tokens: response.eval_count || 0
        }
      };
      
    } catch (error) {
      console.error('Independent agent chat failed:', error);
      throw new Error(`Independent agent chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executePaletteAgentChat(
    config: ChatConfig,
    message: string,
    conversationId: string,
    workflowContext?: WorkflowContext
  ): Promise<ChatResponse> {
    if (!config.agentId) {
      throw new Error('Agent ID not specified for palette agent chat');
    }

    try {
      // Find the palette agent
      const agent = this.paletteAgents.find(a => a.id === config.agentId);
      if (!agent) {
        throw new Error(`Palette agent not found: ${config.agentId}`);
      }

      // Get conversation history
      const history = this.getConversationHistory(conversationId);
      const contextMessages = this.buildContextMessages(history, config.contextWindow || 10);
      
      // Build system prompt based on agent configuration
      const systemPrompt = this.buildPaletteAgentPrompt(agent, config, workflowContext);
      
      // Build messages array
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...contextMessages,
        { role: 'user' as const, content: message }
      ];

      // Build prompt from conversation
      let prompt = systemPrompt;
      
      // Add conversation context
      for (const msg of contextMessages) {
        if (msg.role === 'user') {
          prompt += `\n\nUser: ${msg.content}`;
        } else {
          prompt += `\n\nAssistant: ${msg.content}`;
        }
      }
      
      prompt += `\n\nUser: ${message}\n\nAssistant:`;

      // Call Ollama service with agent's model
      const response = await ollamaService.generateResponse({
        model: agent.model,
        prompt,
        options: {
          temperature: 0.7,
          max_tokens: 1000
        }
      });

      if (response.status !== 'success' || !response.response) {
        throw new Error(response.message || 'Failed to generate response');
      }

      return {
        type: 'palette-agent',
        response: response.response,
        metadata: {
          agentId: config.agentId,
          agentName: agent.name,
          model: agent.model,
          tokens: response.eval_count || 0
        }
      };
      
    } catch (error) {
      console.error('Palette agent chat failed:', error);
      throw new Error(`Palette agent chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildIndependentAgentPrompt(config: ChatConfig): string {
    let prompt = `You are ${config.name}, a ${config.role}.`;
    
    if (config.personality) {
      prompt += ` Your personality is: ${config.personality}.`;
    }
    
    if (config.capabilities && config.capabilities.length > 0) {
      prompt += ` Your key capabilities include: ${config.capabilities.join(', ')}.`;
    }
    
    prompt += ` Always respond in character and use your expertise to provide helpful, accurate assistance.`;
    
    if (config.guardrails) {
      prompt += ` Maintain professional standards and avoid inappropriate content.`;
    }
    
    return prompt;
  }

  private buildPaletteAgentPrompt(
    agent: PaletteAgent,
    config: ChatConfig,
    workflowContext?: WorkflowContext
  ): string {
    let prompt = `You are ${agent.name}, a ${agent.role}.`;
    
    if (agent.description) {
      prompt += ` ${agent.description}`;
    }
    
    if (agent.capabilities && agent.capabilities.length > 0) {
      prompt += ` Your capabilities include: ${agent.capabilities.join(', ')}.`;
    }
    
    // Add workflow context if available and enabled
    if (config.chatMode === 'workflow-aware' && workflowContext) {
      prompt += ` You are part of a workflow system with ${workflowContext.nodes.length} nodes.`;
      
      if (workflowContext.executionHistory.length > 0) {
        prompt += ` Recent workflow activity: ${workflowContext.executionHistory.slice(-3).map(h => h.summary).join(', ')}.`;
      }
    }
    
    // Add personality from original agent if available
    if (agent.originalAgent?.personality) {
      prompt += ` Your personality: ${agent.originalAgent.personality}.`;
    }
    
    prompt += ` Provide expert assistance within your domain of expertise.`;
    
    if (agent.guardrails) {
      prompt += ` Follow all safety guidelines and maintain professional standards.`;
    }
    
    return prompt;
  }

  private buildContextMessages(history: ChatMessage[], maxMessages: number): Array<{role: 'user' | 'assistant', content: string}> {
    const recentHistory = history.slice(-maxMessages * 2); // Get recent user/agent pairs
    const contextMessages: Array<{role: 'user' | 'assistant', content: string}> = [];
    
    for (const msg of recentHistory) {
      if (msg.type === 'user') {
        contextMessages.push({ role: 'user', content: msg.content });
      } else if (msg.type === 'agent') {
        contextMessages.push({ role: 'assistant', content: msg.content });
      }
    }
    
    return contextMessages;
  }

  private addToConversationHistory(conversationId: string, message: ChatMessage) {
    if (!this.conversationHistory.has(conversationId)) {
      this.conversationHistory.set(conversationId, []);
    }
    
    const history = this.conversationHistory.get(conversationId)!;
    history.push(message);
    
    // Keep only last 100 messages to prevent memory issues
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  private getConversationHistory(conversationId: string): ChatMessage[] {
    return this.conversationHistory.get(conversationId) || [];
  }

  public clearConversationHistory(conversationId: string) {
    this.conversationHistory.delete(conversationId);
  }

  public getAllConversations(): string[] {
    return Array.from(this.conversationHistory.keys());
  }

  public getConversationSummary(conversationId: string): {
    messageCount: number;
    lastActivity: Date | null;
    participants: string[];
  } {
    const history = this.getConversationHistory(conversationId);
    
    return {
      messageCount: history.length,
      lastActivity: history.length > 0 ? history[history.length - 1].timestamp : null,
      participants: [...new Set(history.map(m => m.metadata?.agentName || 'User').filter(Boolean))]
    };
  }
}