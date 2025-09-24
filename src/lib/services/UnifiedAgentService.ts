/**
 * Unified Agent Service
 * Provides a single interface to all agent systems
 */

export interface UnifiedAgent {
  id: string;
  name: string;
  description: string;
  model_id: string;
  framework: 'ollama' | 'strands' | 'a2a';
  status: 'active' | 'inactive' | 'error';
  a2a_enabled: boolean;
  created_at: string;
  tools: string[];
  capabilities: string[];
}

export interface UnifiedAgentResponse {
  agents: UnifiedAgent[];
  count: number;
  status: string;
  sources?: {
    ollama: number;
    strands: number;
    a2a: number;
  };
}

class UnifiedAgentService {
  private baseUrl = 'http://localhost:5015';

  /**
   * Get all agents from all systems
   */
  async getAllAgents(): Promise<UnifiedAgent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/unified/agents`);
      const data: UnifiedAgentResponse = await response.json();
      return data.agents || [];
    } catch (error) {
      console.error('Failed to get all agents:', error);
      return [];
    }
  }

  /**
   * Get only Ollama agents
   */
  async getOllamaAgents(): Promise<UnifiedAgent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/unified/agents/ollama`);
      const data: UnifiedAgentResponse = await response.json();
      return data.agents || [];
    } catch (error) {
      console.error('Failed to get Ollama agents:', error);
      return [];
    }
  }

  /**
   * Get only Strands agents
   */
  async getStrandsAgents(): Promise<UnifiedAgent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/unified/agents/strands`);
      const data: UnifiedAgentResponse = await response.json();
      return data.agents || [];
    } catch (error) {
      console.error('Failed to get Strands agents:', error);
      return [];
    }
  }

  /**
   * Get only A2A agents
   */
  async getA2AAgents(): Promise<UnifiedAgent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/unified/agents/a2a`);
      const data: UnifiedAgentResponse = await response.json();
      return data.agents || [];
    } catch (error) {
      console.error('Failed to get A2A agents:', error);
      return [];
    }
  }

  /**
   * Register an agent for A2A communication
   */
  async registerAgentForA2A(agentId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/unified/agents/${agentId}/register-a2a`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Agent registered for A2A communication'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to register agent'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Unregister an agent from A2A communication
   */
  async unregisterAgentFromA2A(agentId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/unified/agents/${agentId}/unregister-a2a`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Agent unregistered from A2A communication'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to unregister agent'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete an agent from all systems
   */
  async deleteAgent(agentId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    deleted_from?: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/unified/agents/${agentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Agent deleted successfully',
          deleted_from: data.deleted_from || []
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to delete agent'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/unified/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get agent statistics
   */
  async getAgentStats(): Promise<{
    total: number;
    by_framework: Record<string, number>;
    a2a_enabled: number;
    a2a_disabled: number;
  }> {
    try {
      const agents = await this.getAllAgents();
      
      const stats = {
        total: agents.length,
        by_framework: {} as Record<string, number>,
        a2a_enabled: 0,
        a2a_disabled: 0
      };

      agents.forEach(agent => {
        // Count by framework
        stats.by_framework[agent.framework] = (stats.by_framework[agent.framework] || 0) + 1;
        
        // Count A2A status
        if (agent.a2a_enabled) {
          stats.a2a_enabled++;
        } else {
          stats.a2a_disabled++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Failed to get agent stats:', error);
      return {
        total: 0,
        by_framework: {},
        a2a_enabled: 0,
        a2a_disabled: 0
      };
    }
  }
}

export const unifiedAgentService = new UnifiedAgentService();


