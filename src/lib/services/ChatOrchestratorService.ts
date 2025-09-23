/**
 * Chat Orchestrator Service
 * ========================
 * 
 * Frontend service for interacting with the Chat Orchestrator API.
 * Handles Direct LLM, Independent Agents, and Agent Palette chat types.
 */

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  session_id: string;
  chat_type: 'direct-llm' | 'independent-agent' | 'palette-agent';
  config: Record<string, any>;
  created_at: string;
  last_activity: string;
  status: string;
}

export interface ChatResponse {
  message_id: string;
  content: string;
  type: string;
  model?: string;
  agent_id?: string;
  agent_name?: string;
  tokens_used?: number;
  generation_time?: number;
  routing_confidence?: number;
  routing_reasoning?: string;
  execution_time?: number;
  tools_used?: string[];
}

export interface OllamaModel {
  name: string;
  size: number;
}

export interface PaletteAgent {
  id: string;
  name: string;
  description?: string;
  role?: string;
  capabilities?: string[];
  status?: string;
}

class ChatOrchestratorService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch(url, mergedOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Chat Orchestrator API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // Health and Configuration
  // ============================================================================

  async healthCheck(): Promise<{ status: string; ollama_connected: boolean }> {
    return this.request('/health');
  }

  async getModels(): Promise<OllamaModel[]> {
    const response = await this.request<{ models: OllamaModel[] }>('/api/chat/models');
    return response.models;
  }

  async getAgents(): Promise<PaletteAgent[]> {
    const response = await this.request<{ agents: PaletteAgent[] }>('/api/chat/agents');
    return response.agents;
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  async createSession(config: Record<string, any>): Promise<{ session_id: string; status: string; chat_type: string }> {
    return this.request('/api/chat/sessions', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async getSession(sessionId: string): Promise<ChatSession> {
    return this.request(`/api/chat/sessions/${sessionId}`);
  }

  async listSessions(): Promise<ChatSession[]> {
    const response = await this.request<{ sessions: ChatSession[] }>('/api/chat/sessions');
    return response.sessions;
  }

  // ============================================================================
  // Chat Operations
  // ============================================================================

  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    return this.request(`/api/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  async getChatHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    const response = await this.request<{ messages: ChatMessage[] }>(
      `/api/chat/sessions/${sessionId}/history?limit=${limit}`
    );
    return response.messages;
  }

  // ============================================================================
  // Convenience Methods for Different Chat Types
  // ============================================================================

  /**
   * Create a Direct LLM chat session
   */
  async createDirectLLMSession(config: {
    name: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<string> {
    const sessionConfig = {
      type: 'direct-llm',
      name: config.name,
      model: config.model,
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
      systemPrompt: config.systemPrompt || '',
      position: 'embedded',
      size: 'medium'
    };

    const result = await this.createSession(sessionConfig);
    return result.session_id;
  }

  /**
   * Create an Independent Agent chat session
   */
  async createIndependentAgentSession(config: {
    name: string;
    role: string;
    model: string;
    personality?: string;
    capabilities?: string[];
    temperature?: number;
    maxTokens?: number;
    guardrails?: boolean;
  }): Promise<string> {
    const sessionConfig = {
      type: 'independent-agent',
      name: config.name,
      role: config.role,
      model: config.model,
      personality: config.personality || '',
      capabilities: config.capabilities || [],
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
      guardrails: config.guardrails || false,
      systemPrompt: `You are ${config.name}, a ${config.role}. ${config.personality ? `Your personality: ${config.personality}` : ''}`,
      position: 'embedded',
      size: 'medium'
    };

    const result = await this.createSession(sessionConfig);
    return result.session_id;
  }

  /**
   * Create a Palette Agent chat session
   */
  async createPaletteAgentSession(config: {
    name: string;
    agentId: string;
    chatMode?: 'direct' | 'workflow-aware';
    contextSharing?: boolean;
    workflowTrigger?: boolean;
  }): Promise<string> {
    const sessionConfig = {
      type: 'palette-agent',
      name: config.name,
      agentId: config.agentId,
      chatMode: config.chatMode || 'direct',
      contextSharing: config.contextSharing || false,
      workflowTrigger: config.workflowTrigger || false,
      position: 'embedded',
      size: 'medium'
    };

    const result = await this.createSession(sessionConfig);
    return result.session_id;
  }

  // ============================================================================
  // Streaming Support (Future Enhancement)
  // ============================================================================

  /**
   * Send message with streaming response (placeholder for future implementation)
   */
  async sendMessageStream(
    sessionId: string, 
    message: string, 
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse> {
    // For now, fall back to regular message sending
    // TODO: Implement streaming when backend supports it
    const response = await this.sendMessage(sessionId, message);
    
    // Simulate streaming by chunking the response
    const words = response.content.split(' ');
    for (let i = 0; i < words.length; i++) {
      setTimeout(() => {
        onChunk(words[i] + ' ');
      }, i * 50); // 50ms delay between words
    }
    
    return response;
  }

  // ============================================================================
  // Error Handling and Utilities
  // ============================================================================

  /**
   * Test connection to the Chat Orchestrator API
   */
  async testConnection(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      return health.status === 'healthy';
    } catch (error) {
      console.error('Chat Orchestrator connection test failed:', error);
      return false;
    }
  }

  /**
   * Get chat type display information
   */
  getChatTypeInfo(chatType: string): { title: string; description: string; icon: string } {
    switch (chatType) {
      case 'direct-llm':
        return {
          title: 'Direct LLM Chat',
          description: 'Raw conversation with Ollama models with intelligent routing',
          icon: '🤖'
        };
      case 'independent-agent':
        return {
          title: 'Independent Chat Agent',
          description: 'Specialized chat agent with custom personality and capabilities',
          icon: '👤'
        };
      case 'palette-agent':
        return {
          title: 'Palette Agent Chat',
          description: 'Direct chat with existing workflow agents',
          icon: '🔗'
        };
      default:
        return {
          title: 'Unknown Chat Type',
          description: 'Unknown chat configuration',
          icon: '❓'
        };
    }
  }

  /**
   * Format chat response for display
   */
  formatChatResponse(response: ChatResponse): string {
    let formatted = response.content;
    
    // Add metadata if available
    if (response.type === 'routed-agent' && response.routing_reasoning) {
      formatted += `\n\n*[Routed to ${response.agent_name || response.agent_id} - ${response.routing_reasoning}]*`;
    }
    
    if (response.tools_used && response.tools_used.length > 0) {
      formatted += `\n\n*[Tools used: ${response.tools_used.join(', ')}]*`;
    }
    
    return formatted;
  }
}

// Export singleton instance
export const chatOrchestratorService = new ChatOrchestratorService();
export default chatOrchestratorService;