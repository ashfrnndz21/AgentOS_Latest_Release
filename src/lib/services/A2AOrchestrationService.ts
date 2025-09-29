/**
 * A2A Orchestration Service
 * Handles communication with the enhanced orchestration API and observability system
 */

export interface OrchestrationRequest {
  query: string;
  contextual_analysis?: any;
  test_mode?: boolean;
}

export interface OrchestrationResponse {
  success: boolean;
  session_id: string;
  final_response: string;
  orchestration_summary: {
    execution_strategy: string;
    processing_time: number;
    reasoning_quality: string;
    stages_completed: number;
    total_stages: number;
  };
  stage_1_query_analysis: any;
  stage_2_sequence_definition: any;
  stage_3_execution_strategy: any;
  stage_4_agent_analysis: any;
  stage_5_agent_matching: any;
  stage_6_orchestration_plan: any;
  selected_agent: any;
  execution_details: any;
  raw_agent_response: any;
  agent_registry_analysis: any;
  observability_trace?: any;
  error?: string;
}

export interface ObservabilityTrace {
  session_id: string;
  query: string;
  start_time: string;
  end_time?: string;
  total_execution_time?: number;
  success: boolean;
  error?: string;
  orchestration_strategy?: string;
  agents_involved: string[];
  final_response?: string;
  handoffs: AgentHandoff[];
  events: A2AEvent[];
  context_evolution: any[];
}

export interface AgentHandoff {
  id: string;
  session_id: string;
  handoff_number: number;
  from_agent: {
    id: string;
    name: string;
  };
  to_agent: {
    id: string;
    name: string;
  };
  status: string;
  start_time: string;
  end_time?: string;
  execution_time?: number;
  context_transferred?: any;
  input_prepared?: string;
  output_received?: string;
  tools_used: string[];
  error?: string;
  metadata?: any;
}

export interface A2AEvent {
  id: string;
  session_id: string;
  event_type: string;
  timestamp: string;
  agent_id?: string;
  agent_name?: string;
  from_agent_id?: string;
  to_agent_id?: string;
  content?: string;
  context?: any;
  metadata?: any;
  execution_time?: number;
  status?: string;
  error?: string;
}

export interface ObservabilityMetrics {
  total_orchestrations: number;
  successful_orchestrations: number;
  failed_orchestrations: number;
  average_execution_time: number;
  average_handoffs_per_orchestration: number;
  most_used_agents: Record<string, number>;
  error_types: Record<string, number>;
  recent_performance: {
    success_rate: number;
    average_execution_time: number;
    sample_size: number;
  };
}

class A2AOrchestrationService {
  private baseUrl = 'http://localhost:5015';
  private observabilityUrl = 'http://localhost:5018';

  /**
   * Execute an orchestration query
   */
  async executeOrchestration(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/modern-orchestration/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Orchestration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Orchestration service error:', error);
      throw error;
    }
  }

  /**
   * Get observability trace for a session
   */
  async getObservabilityTrace(sessionId: string): Promise<ObservabilityTrace | null> {
    try {
      const response = await fetch(`${this.observabilityUrl}/api/a2a-observability/traces/${sessionId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch observability trace');
      }

      const data = await response.json();
      return data.trace;
    } catch (error) {
      console.error('Observability service error:', error);
      return null;
    }
  }

  /**
   * Get recent orchestration traces
   */
  async getRecentTraces(limit: number = 10): Promise<ObservabilityTrace[]> {
    try {
      const response = await fetch(`${this.observabilityUrl}/api/a2a-observability/traces?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent traces');
      }

      const data = await response.json();
      return data.traces || [];
    } catch (error) {
      console.error('Observability service error:', error);
      return [];
    }
  }

  /**
   * Get real-time trace updates
   */
  async getRealTimeTrace(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.observabilityUrl}/api/a2a-observability/real-time/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch real-time trace');
      }

      return await response.json();
    } catch (error) {
      console.error('Real-time trace error:', error);
      return null;
    }
  }

  /**
   * Get observability metrics
   */
  async getObservabilityMetrics(): Promise<ObservabilityMetrics | null> {
    try {
      const response = await fetch(`${this.observabilityUrl}/api/a2a-observability/metrics`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      return data.metrics;
    } catch (error) {
      console.error('Metrics service error:', error);
      return null;
    }
  }

  /**
   * Export trace data
   */
  async exportTraceData(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.observabilityUrl}/api/a2a-observability/export/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to export trace data');
      }

      return await response.json();
    } catch (error) {
      console.error('Export service error:', error);
      throw error;
    }
  }

  /**
   * Get observability health status
   */
  async getHealthStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.observabilityUrl}/api/a2a-observability/health`);
      
      if (!response.ok) {
        throw new Error('Observability service is not healthy');
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      return null;
    }
  }

  /**
   * Get handoff details for a session
   */
  async getHandoffDetails(sessionId: string): Promise<AgentHandoff[]> {
    try {
      const response = await fetch(`${this.observabilityUrl}/api/a2a-observability/handoffs?session_id=${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch handoff details');
      }

      const data = await response.json();
      return data.handoffs || [];
    } catch (error) {
      console.error('Handoff service error:', error);
      return [];
    }
  }

  /**
   * Get events for a session
   */
  async getSessionEvents(sessionId: string, limit: number = 50): Promise<A2AEvent[]> {
    try {
      const response = await fetch(`${this.observabilityUrl}/api/a2a-observability/events?session_id=${sessionId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch session events');
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Events service error:', error);
      return [];
    }
  }

  /**
   * Get context evolution for a session
   */
  async getContextEvolution(sessionId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.observabilityUrl}/api/a2a-observability/context-evolution/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch context evolution');
      }

      const data = await response.json();
      return data.context_evolution || [];
    } catch (error) {
      console.error('Context evolution service error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const a2aOrchestrationService = new A2AOrchestrationService();
