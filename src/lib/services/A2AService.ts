/**
 * A2A (Agent-to-Agent) Service Integration
 * Handles communication with the A2A service for agent registration and management
 */

export interface A2AAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  capabilities: string[];
  status: 'active' | 'inactive';
  registered_at: string;
  last_seen: string;
}

export interface A2AMessage {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  from_agent_name: string;
  to_agent_name: string;
  content: string;
  type: string;
  timestamp: string;
  status: string;
}

export interface A2AConnection {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  connection_type: string;
  is_active: boolean;
  created_at: string;
}

export interface A2AStatus {
  registered: boolean;
  a2a_agent_id?: string;
  a2a_status?: string;
  connections?: number;
  last_message?: string;
}

class A2AService {
  private baseUrl = 'http://localhost:5008/api/a2a';

  /**
   * Check if A2A service is available
   */
  async checkHealth(): Promise<{ status: string; agents_registered: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`A2A service health check failed: ${response.status}`);
    } catch (error) {
      console.error('A2A service health check failed:', error);
      throw new Error('A2A service is not available');
    }
  }

  /**
   * Get all registered A2A agents
   */
  async getAgents(): Promise<A2AAgent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/agents`);
      if (response.ok) {
        const data = await response.json();
        return data.agents || [];
      }
      throw new Error(`Failed to fetch A2A agents: ${response.status}`);
    } catch (error) {
      console.error('Failed to fetch A2A agents:', error);
      return [];
    }
  }

  /**
   * Register an agent for A2A communication
   */
  async registerAgent(agentData: {
    id: string;
    name: string;
    description: string;
    model: string;
    capabilities: string[];
  }): Promise<A2AAgent> {
    try {
      const response = await fetch(`${this.baseUrl}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...agentData,
          status: 'active'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.agent;
      }
      throw new Error(`Failed to register agent: ${response.status}`);
    } catch (error) {
      console.error('Failed to register agent for A2A:', error);
      throw error;
    }
  }

  /**
   * Get specific agent by ID
   */
  async getAgent(agentId: string): Promise<A2AAgent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        return data.agent;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch A2A agent:', error);
      return null;
    }
  }

  /**
   * Create a connection between two agents
   */
  async createConnection(fromAgentId: string, toAgentId: string): Promise<A2AConnection> {
    try {
      const response = await fetch(`${this.baseUrl}/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_agent_id: fromAgentId,
          to_agent_id: toAgentId
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.connection;
      }
      throw new Error(`Failed to create connection: ${response.status}`);
    } catch (error) {
      console.error('Failed to create A2A connection:', error);
      throw error;
    }
  }

  /**
   * Send a message between agents
   */
  async sendMessage(
    fromAgentId: string, 
    toAgentId: string, 
    content: string, 
    messageType: string = 'message'
  ): Promise<A2AMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_agent_id: fromAgentId,
          to_agent_id: toAgentId,
          content,
          type: messageType
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message;
      }
      throw new Error(`Failed to send message: ${response.status}`);
    } catch (error) {
      console.error('Failed to send A2A message:', error);
      throw error;
    }
  }

  /**
   * Get message history for an agent
   */
  async getMessageHistory(agentId?: string): Promise<A2AMessage[]> {
    try {
      const url = agentId 
        ? `${this.baseUrl}/messages/history?agent_id=${agentId}`
        : `${this.baseUrl}/messages/history`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return data.messages || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch A2A message history:', error);
      return [];
    }
  }

  /**
   * Get A2A status for a specific agent
   */
  async getAgentA2AStatus(agentId: string): Promise<A2AStatus> {
    try {
      // Get all A2A agents and find the one we're looking for
      const allAgents = await this.getAgents();
      const agent = allAgents.find(a => a.id === agentId);
      const messages = await this.getMessageHistory(agentId);
      
      if (!agent) {
        return {
          registered: false,
          a2a_status: 'not_registered'
        };
      }

      // Get connections for this agent
      const connections = await this.getAgentConnections(agentId);

      // Get recent messages for this agent
      const recentMessages = messages
        .filter(msg => msg.from_agent_id === agentId || msg.to_agent_id === agentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        registered: true,
        a2a_agent_id: agent.id,
        a2a_status: agent.status,
        connections: connections.length,
        last_message: recentMessages[0]?.timestamp
      };
    } catch (error) {
      console.error('Failed to get A2A status for agent:', error);
      return {
        registered: false,
        a2a_status: 'error'
      };
    }
  }

  /**
   * Get connections for a specific agent
   */
  async getAgentConnections(agentId: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/connections/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        return data.connections || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch agent connections:', error);
      return [];
    }
  }

  /**
   * Unregister an agent from A2A
   */
  async unregisterAgent(agentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to unregister A2A agent:', error);
      return false;
    }
  }
}

export const a2aService = new A2AService();
