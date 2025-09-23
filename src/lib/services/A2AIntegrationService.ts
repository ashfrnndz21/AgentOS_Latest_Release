import { A2AConversationTrace, ConversationStep, A2AAgent } from '@/components/CommandCentre/CreateStrandsWorkflow/types';

export class A2AIntegrationService {
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;
  private conversationCallbacks: ((trace: A2AConversationTrace) => void)[] = [];

  constructor(baseUrl: string = 'http://localhost:5008') {
    this.baseUrl = baseUrl;
  }

  // Register agent with A2A system
  async registerAgent(agentConfig: any): Promise<{ success: boolean; agentId: string; port: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentConfig),
      });

      if (!response.ok) {
        throw new Error(`Failed to register agent: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: result.status === 'success',
        agentId: result.agent.id,
        port: 5008
      };
    } catch (error) {
      console.error('Error registering agent:', error);
      throw error;
    }
  }

  // Get available agents
  async getAvailableAgents(): Promise<A2AAgent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/agents`);
      if (!response.ok) {
        throw new Error(`Failed to get agents: ${response.statusText}`);
      }
      const result = await response.json();
      return result.agents || [];
    } catch (error) {
      console.error('Error getting available agents:', error);
      return [];
    }
  }

  // Start A2A conversation
  async startConversation(query: string, agentIds: string[]): Promise<A2AConversationTrace> {
    try {
      const response = await fetch(`${this.baseUrl}/start-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          agent_ids: agentIds,
          enable_tracing: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }

  // Connect to real-time conversation updates
  connectToConversationUpdates(conversationId: string): void {
    if (this.wsConnection) {
      this.wsConnection.close();
    }

    const wsUrl = `ws://localhost:5008/conversation/${conversationId}`;
    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onopen = () => {
      console.log('Connected to conversation updates');
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'conversation_update') {
          this.conversationCallbacks.forEach(callback => callback(data.trace));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.wsConnection.onclose = () => {
      console.log('Disconnected from conversation updates');
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  // Subscribe to conversation updates
  onConversationUpdate(callback: (trace: A2AConversationTrace) => void): void {
    this.conversationCallbacks.push(callback);
  }

  // Unsubscribe from conversation updates
  offConversationUpdate(callback: (trace: A2AConversationTrace) => void): void {
    this.conversationCallbacks = this.conversationCallbacks.filter(cb => cb !== callback);
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  // Test A2A system connectivity
  async testConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/health`);
      return response.ok;
    } catch (error) {
      console.error('A2A system not available:', error);
      return false;
    }
  }

  // Get conversation history
  async getConversationHistory(limit: number = 10): Promise<A2AConversationTrace[]> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to get conversation history: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  // Stop conversation
  async stopConversation(conversationId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/conversations/${conversationId}/stop`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error stopping conversation:', error);
    }
  }
}

// Singleton instance
export const a2aIntegrationService = new A2AIntegrationService();
