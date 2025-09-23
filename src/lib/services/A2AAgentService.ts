/**
 * A2A Agent Service
 * Handles A2A agent operations and communication
 */

export interface A2AAgent {
  id: string;
  name: string;
  description: string;
  url: string;
  capabilities: string[];
  status: 'active' | 'unhealthy' | 'unreachable' | 'unknown';
  last_health_check?: string;
  registered_at: string;
  model?: string;
  tools?: string[];
}

class A2AAgentService {
  private registryUrl = 'http://localhost:5010';

  /**
   * Get all A2A agents from registry
   */
  async getA2AAgents(): Promise<A2AAgent[]> {
    try {
      const response = await fetch(`${this.registryUrl}/agents`);
      const data = await response.json();
      
      return (data.agents || []).map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        url: agent.url,
        capabilities: agent.capabilities || [],
        status: agent.status || 'unknown',
        last_health_check: agent.last_health_check,
        registered_at: agent.registered_at || new Date().toISOString(),
        model: agent.model,
        tools: agent.tools
      }));
    } catch (error) {
      console.error('Failed to get A2A agents:', error);
      return [];
    }
  }

  /**
   * Test connection to an A2A agent
   */
  async testAgentConnection(agent: A2AAgent): Promise<boolean> {
    try {
      const response = await fetch(`${agent.url}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.error(`Failed to test connection to ${agent.name}:`, error);
      return false;
    }
  }

  /**
   * Send message to an A2A agent
   */
  async sendMessageToAgent(agent: A2AAgent, message: string): Promise<{
    success: boolean;
    response?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${agent.url}/a2a/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          response: data.response || data.message || 'No response'
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to send message to ${agent.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get agent health status
   */
  async getAgentHealth(agent: A2AAgent): Promise<{
    status: 'active' | 'unhealthy' | 'unreachable' | 'unknown';
    details: string;
  }> {
    try {
      const isHealthy = await this.testAgentConnection(agent);
      
      if (isHealthy) {
        return { status: 'active', details: 'Agent is responding' };
      } else {
        return { status: 'unreachable', details: 'Agent not responding' };
      }
    } catch (error) {
      return { 
        status: 'unknown', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Register a new A2A agent
   */
  async registerAgent(agentData: Omit<A2AAgent, 'id' | 'registered_at'>): Promise<A2AAgent | null> {
    try {
      const response = await fetch(`${this.registryUrl}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...agentData,
          registered_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: data.id || agentData.name.toLowerCase().replace(/\s+/g, '_'),
          ...agentData,
          registered_at: new Date().toISOString()
        };
      } else {
        throw new Error(`Failed to register agent: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to register A2A agent:', error);
      return null;
    }
  }
}

export const a2aAgentService = new A2AAgentService();