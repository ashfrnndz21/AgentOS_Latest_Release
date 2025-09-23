// A2A (Agent-to-Agent) Service Client
// Handles communication with A2A service running on port 5008

export interface A2AAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'busy';
  registered_at: string;
  last_seen: string;
  strands_agent_id?: string;
  strands_data?: any;
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
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface A2AConnection {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  connection_type: string;
  is_active: boolean;
  created_at: string;
}

export interface A2ARegistrationResult {
  status: 'success' | 'error';
  strands_agent_id?: string;
  a2a_agent_id?: string;
  agent?: A2AAgent;
  error?: string;
}

class A2AClient {
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(baseUrl: string = 'http://localhost:5008') {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`A2A API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/api/a2a/health');
  }

  // Agent management
  async getAgents(): Promise<A2AAgent[]> {
    const response = await this.request('/api/a2a/agents');
    return response.agents || [];
  }

  async getAgent(agentId: string): Promise<A2AAgent> {
    const response = await this.request(`/api/a2a/agents/${agentId}`);
    return response.agent;
  }

  async registerAgent(agentData: Partial<A2AAgent>): Promise<A2ARegistrationResult> {
    const response = await this.request('/api/a2a/agents', {
      method: 'POST',
      body: JSON.stringify(agentData)
    });
    return response;
  }

  // Message management
  async sendMessage(fromAgentId: string, toAgentId: string, content: string, messageType: string = 'message'): Promise<A2AMessage> {
    const response = await this.request('/api/a2a/messages', {
      method: 'POST',
      body: JSON.stringify({
        from_agent_id: fromAgentId,
        to_agent_id: toAgentId,
        content,
        type: messageType
      })
    });
    return response.message;
  }

  async getMessageHistory(agentId?: string): Promise<A2AMessage[]> {
    const params = agentId ? `?agent_id=${agentId}` : '';
    const response = await this.request(`/api/a2a/messages/history${params}`);
    return response.messages || [];
  }

  // Connection management
  async createConnection(fromAgentId: string, toAgentId: string): Promise<A2AConnection> {
    const response = await this.request('/api/a2a/connections', {
      method: 'POST',
      body: JSON.stringify({
        from_agent_id: fromAgentId,
        to_agent_id: toAgentId
      })
    });
    return response.connection;
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage?: (message: A2AMessage) => void, onError?: (error: Event) => void) {
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/socket.io/?EIO=4&transport=websocket';
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('A2A WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'a2a_message' && onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.wsConnection.onclose = () => {
        console.log('A2A WebSocket disconnected');
        this.attemptReconnect(onMessage, onError);
      };

      this.wsConnection.onerror = (error) => {
        console.error('A2A WebSocket error:', error);
        if (onError) {
          onError(error);
        }
      };

    } catch (error) {
      console.error('Failed to create A2A WebSocket connection:', error);
      if (onError) {
        onError(error as Event);
      }
    }
  }

  private attemptReconnect(onMessage?: (message: A2AMessage) => void, onError?: (error: Event) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect A2A WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connectWebSocket(onMessage, onError);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max A2A WebSocket reconnection attempts reached');
    }
  }

  disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  // Join agent room for real-time updates
  joinAgentRoom(agentId: string) {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'join_agent_room',
        data: { agent_id: agentId }
      }));
    }
  }

  leaveAgentRoom(agentId: string) {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'leave_agent_room',
        data: { agent_id: agentId }
      }));
    }
  }

  // Strands SDK integration
  async getStrandsA2AAgents(): Promise<A2AAgent[]> {
    try {
      const response = await fetch('http://localhost:5006/api/strands-sdk/a2a/agents');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.agents || [];
    } catch (error) {
      console.error('Error getting Strands A2A agents:', error);
      return [];
    }
  }

  async sendStrandsA2AMessage(fromAgentId: string, toAgentId: string, content: string): Promise<any> {
    try {
      const response = await fetch('http://localhost:5006/api/strands-sdk/a2a/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_agent_id: fromAgentId,
          to_agent_id: toAgentId,
          content
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending Strands A2A message:', error);
      throw error;
    }
  }

  async getStrandsA2AMessageHistory(agentId?: string): Promise<A2AMessage[]> {
    try {
      const params = agentId ? `?agent_id=${agentId}` : '';
      const response = await fetch(`http://localhost:5006/api/strands-sdk/a2a/messages/history${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error getting Strands A2A message history:', error);
      return [];
    }
  }
}

export const a2aClient = new A2AClient();
export default a2aClient;






