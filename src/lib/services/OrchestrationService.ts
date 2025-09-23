/**
 * Orchestration Service
 * Handles communication with the Central Orchestrator for multi-agent A2A communication
 */

export interface OrchestrationRequest {
  question: string;
  user: string;
}

export interface OrchestrationStep {
  step_type: string;
  timestamp: string;
  elapsed_seconds: number;
  details: Record<string, any>;
}

export interface OrchestrationLog {
  total_steps: number;
  total_time_seconds: number;
  steps: OrchestrationStep[];
  summary: {
    agents_contacted: number;
    routing_decisions: number;
    coordination_events: number;
    final_result: string;
  };
}

export interface AgentResponse {
  agent_name: string;
  execution_time: number;
  from_agent: string;
  original_message: string;
  response: string;
  status: string;
  timestamp: string;
}

export interface OrchestrationResult {
  question: string;
  selected_agents: string[];
  agent_responses: Record<string, AgentResponse>;
  final_response: string;
  orchestration_log: OrchestrationLog;
}

export interface AvailableAgent {
  name: string;
  url: string;
  capabilities: string[];
  status: string;
}

export interface AgentDiscoveryResult {
  available_agents: Record<string, AvailableAgent>;
  count: number;
}

class OrchestrationService {
  private baseUrl = 'http://localhost:8005';

  /**
   * Send a question to the orchestration service
   */
  async orchestrateQuestion(question: string, user: string = 'User'): Promise<OrchestrationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          user,
        }),
      });

      if (!response.ok) {
        throw new Error(`Orchestration failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Orchestration error:', error);
      throw error;
    }
  }

  /**
   * Get available agents from the orchestration service
   */
  async getAvailableAgents(): Promise<AgentDiscoveryResult> {
    try {
      const response = await fetch(`${this.baseUrl}/agents`);
      
      if (!response.ok) {
        throw new Error(`Agent discovery failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Agent discovery error:', error);
      throw error;
    }
  }

  /**
   * Get orchestration log
   */
  async getOrchestrationLog(): Promise<OrchestrationLog> {
    try {
      const response = await fetch(`${this.baseUrl}/orchestration/log`);
      
      if (!response.ok) {
        throw new Error(`Log retrieval failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Log retrieval error:', error);
      throw error;
    }
  }

  /**
   * Check if orchestration service is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const orchestrationService = new OrchestrationService();












