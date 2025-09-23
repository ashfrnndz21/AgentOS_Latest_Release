/**
 * Unified Agent Client
 * Single client for all agent operations
 * Replaces: a2aClient, StrandsSDK, multiple API calls
 */

export interface UnifiedAgent {
  id: string;
  name: string;
  description: string;
  model_id: string;
  host: string;
  system_prompt: string;
  tools: string[];
  capabilities: string[];
  status: 'active' | 'inactive' | 'busy';
  framework: 'ollama' | 'strands' | 'a2a';
  a2a_enabled: boolean;
  a2a_agent_id?: string;
  ollama_config: Record<string, any>;
  strands_config: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_seen: string;
}

export interface UnifiedMessage {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  content: string;
  message_type: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  model_id: string;
  host?: string;
  system_prompt?: string;
  tools?: string[];
  capabilities?: string[];
  framework?: 'ollama' | 'strands' | 'a2a';
  a2a_enabled?: boolean;
  ollama_config?: Record<string, any>;
  strands_config?: Record<string, any>;
}

class UnifiedAgentClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5001') {
    this.baseUrl = baseUrl;
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get all agents with optional filtering
  async getAgents(filters?: {
    framework?: 'ollama' | 'strands' | 'a2a';
    a2a_enabled?: boolean;
  }): Promise<UnifiedAgent[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.framework) params.append('framework', filters.framework);
      if (filters?.a2a_enabled !== undefined) params.append('a2a_enabled', filters.a2a_enabled.toString());

      const response = await fetch(`${this.baseUrl}/api/agents?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.agents || [];
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      return [];
    }
  }

  // Get agents by framework
  async getOllamaAgents(): Promise<UnifiedAgent[]> {
    return this.getAgents({ framework: 'ollama' });
  }

  async getStrandsAgents(): Promise<UnifiedAgent[]> {
    return this.getAgents({ framework: 'strands' });
  }

  async getA2AAgents(): Promise<UnifiedAgent[]> {
    return this.getAgents({ a2a_enabled: true });
  }

  // Create agent
  async createAgent(agentData: CreateAgentRequest): Promise<UnifiedAgent> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    }
  }

  // Delete agent
  async deleteAgent(agentId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/${agentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
      throw error;
    }
  }

  // Send message between agents
  async sendMessage(fromAgentId: string, toAgentId: string, content: string): Promise<UnifiedMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_agent_id: fromAgentId,
          to_agent_id: toAgentId,
          content: content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // Get message history
  async getMessages(agentId?: string): Promise<UnifiedMessage[]> {
    try {
      const params = agentId ? `?agent_id=${agentId}` : '';
      const response = await fetch(`${this.baseUrl}/api/messages${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }
}

// Export singleton instance
export const unifiedAgentClient = new UnifiedAgentClient();
export default unifiedAgentClient;
