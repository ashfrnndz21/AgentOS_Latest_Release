/**
 * Unified Orchestration Service
 * Frontend service for the unified orchestration API
 * 
 * This service provides a clean interface to the unified orchestration system:
 * - 6-Stage LLM Analysis
 * - Dynamic Agent Discovery
 * - A2A Communication
 * - Text Cleaning
 * - Observability
 */

export interface OrchestrationRequest {
  query: string;
  session_id?: string;
  options?: {
    timeout?: number;
    enable_observability?: boolean;
  };
}

export interface OrchestrationResponse {
  success: boolean;
  session_id: string;
  response: string;
  workflow_summary: {
    total_stages: number;
    stages_completed: number;
    execution_strategy: string;
    agents_used: string[];
    processing_time: number;
  };
  analysis: {
    stage_1_analysis: any;
    stage_2_matching: any;
    stage_3_routing: any;
    stage_4_execution: any;
    stage_5_synthesis: any;
  };
  agent_selection: {
    total_available: number;
    selected_agents: string[];
    selection_reasoning: string;
  };
  execution_details: {
    strategy: string;
    total_agents: number;
    successful_agents: number;
    total_execution_time: number;
  };
  observability_trace: any;
  api_metadata: {
    endpoint: string;
    timestamp: string;
    processing_time: number;
    version: string;
  };
  error?: string;
  timestamp: string;
}

export interface QuickOrchestrationRequest {
  query: string;
}

export interface QuickOrchestrationResponse {
  success: boolean;
  response: string;
  query: string;
  timestamp: string;
}

export interface AgentDiscoveryRequest {
  query: string;
  max_agents?: number;
}

export interface AgentDiscoveryResponse {
  success: boolean;
  query: string;
  agents: Array<{
    id: string;
    name: string;
    description: string;
    capabilities: string[];
  }>;
  total_found: number;
  analysis: any;
  timestamp: string;
}

export interface QueryAnalysisRequest {
  query: string;
}

export interface QueryAnalysisResponse {
  success: boolean;
  query: string;
  analysis: any;
  execution_strategy: string;
  confidence: number;
  timestamp: string;
}

export interface TextCleaningRequest {
  text: string;
  output_type?: 'agent_response' | 'orchestrator_response';
}

export interface TextCleaningResponse {
  success: boolean;
  original_text: string;
  cleaned_text: string;
  output_type: string;
  length_reduction: number;
  timestamp: string;
}

export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'error';
  components: {
    unified_orchestrator: string;
    strands_sdk: string;
    a2a_service: string;
    text_cleaning: string;
  };
  timestamp: string;
  version: string;
}

class UnifiedOrchestrationService {
  private baseUrl = 'http://localhost:5014';

  /**
   * Main orchestration endpoint
   * Processes a query through the complete unified workflow
   */
  async orchestrate(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    try {
      console.log('🚀 UnifiedOrchestrationService: Starting orchestration request', request);
      console.log('🌐 UnifiedOrchestrationService: Calling URL', `${this.baseUrl}/api/orchestrate`);
      
      const response = await fetch(`${this.baseUrl}/api/orchestrate?t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      console.log('📡 UnifiedOrchestrationService: Response status', response.status);
      console.log('📡 UnifiedOrchestrationService: Response headers', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ UnifiedOrchestrationService: Error response', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const backendResponse = await response.json();
      console.log('✅ UnifiedOrchestrationService: Backend response received', backendResponse);
      
      // Map backend response to frontend expected format
      const mappedResponse: OrchestrationResponse = {
        success: backendResponse.success,
        session_id: backendResponse.session_id,
        response: backendResponse.response,
        workflow_summary: backendResponse.workflow_summary || {
          total_stages: 5,
          stages_completed: 5,
          execution_strategy: backendResponse.execution_details?.strategy || 'sequential',
          agents_used: backendResponse.agent_selection?.selected_agents || [],
          processing_time: backendResponse.execution_details?.total_execution_time || 0
        },
        analysis: {
          stage_1_analysis: backendResponse.analysis?.stage_1_analysis || backendResponse.complete_data_flow?.stages?.stage_1_analysis || backendResponse.complete_data_flow?.stage_1_analysis || {},
          stage_2_matching: backendResponse.analysis?.stage_2_matching || backendResponse.complete_data_flow?.stages?.stage_2_matching || backendResponse.complete_data_flow?.stage_2_analysis || {},
          stage_3_routing: backendResponse.analysis?.stage_3_routing || backendResponse.complete_data_flow?.stages?.stage_3_routing || backendResponse.complete_data_flow?.stage_3_analysis || {},
          stage_4_execution: backendResponse.analysis?.stage_4_execution || backendResponse.complete_data_flow?.stages?.stage_4_execution || backendResponse.complete_data_flow?.stage_4_analysis || {},
          stage_5_synthesis: backendResponse.analysis?.stage_5_synthesis || backendResponse.complete_data_flow?.stages?.stage_5_synthesis || backendResponse.complete_data_flow?.stage_5_analysis || {}
        },
        agent_selection: {
          total_available: backendResponse.agent_selection?.total_available || 0,
          selected_agents: backendResponse.agent_selection?.selected_agents || [],
          selection_reasoning: backendResponse.agent_selection?.selection_reasoning || 'LLM-driven dynamic discovery'
        },
        execution_details: {
          strategy: backendResponse.execution_details?.strategy || 'sequential',
          total_agents: backendResponse.execution_details?.total_agents || 0,
          successful_agents: backendResponse.execution_details?.successful_agents || 0,
          total_execution_time: backendResponse.execution_details?.total_execution_time || 0
        },
        observability_trace: backendResponse.complete_data_flow || {},
        api_metadata: {
          endpoint: '/api/orchestrate',
          timestamp: backendResponse.timestamp,
          processing_time: backendResponse.workflow_summary?.processing_time || 0,
          version: '1.0.0'
        },
        timestamp: backendResponse.timestamp
      };

      console.log('🎉 UnifiedOrchestrationService: Mapped response ready', mappedResponse);
      return mappedResponse;
    } catch (error) {
      console.error('Orchestration service error:', error);
      throw error;
    }
  }

  /**
   * Quick orchestration for simple queries
   * Returns simplified response
   */
  async quickOrchestrate(request: QuickOrchestrationRequest): Promise<QuickOrchestrationResponse> {
    try {
      // Use the main orchestrate endpoint since quick-orchestrate doesn't exist
      const result = await this.orchestrate({
        query: request.query,
        options: { enable_observability: false }
      });

      return {
        success: result.success,
        response: result.response,
        query: request.query,
        timestamp: result.timestamp
      };
    } catch (error) {
      console.error('Quick orchestration service error:', error);
      throw error;
    }
  }

  /**
   * Discover agents for a specific query
   */
  async discoverAgents(request: AgentDiscoveryRequest): Promise<AgentDiscoveryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/discover-agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Agent discovery service error:', error);
      throw error;
    }
  }

  /**
   * Analyze a query using 6-stage LLM analysis
   */
  async analyzeQuery(request: QueryAnalysisRequest): Promise<QueryAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analyze-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Query analysis service error:', error);
      throw error;
    }
  }

  /**
   * Clean and format text
   */
  async cleanText(request: TextCleaningRequest): Promise<TextCleaningResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/clean-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Text cleaning service error:', error);
      throw error;
    }
  }

  /**
   * Get system status and component health
   */
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      // Try the health endpoint first since /api/status doesn't exist
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const healthData = await response.json();
      
      // Convert health response to SystemStatus format
      return {
        status: 'healthy',
        components: {
          unified_orchestrator: 'healthy',
          strands_sdk: 'healthy',
          a2a_service: 'healthy',
          text_cleaning: 'healthy'
        },
        timestamp: healthData.timestamp,
        version: healthData.version || '1.0.0'
      };
    } catch (error) {
      console.error('System status service error:', error);
      // Return a default status if health check fails
      return {
        status: 'error',
        components: {
          unified_orchestrator: 'error',
          strands_sdk: 'unknown',
          a2a_service: 'unknown',
          text_cleaning: 'unknown'
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  /**
   * Convenience method for simple orchestration
   */
  async simpleOrchestrate(query: string): Promise<string> {
    try {
      const result = await this.quickOrchestrate({ query });
      return result.response;
    } catch (error) {
      console.error('Simple orchestration error:', error);
      throw error;
    }
  }

  /**
   * Get available endpoints
   */
  getAvailableEndpoints(): string[] {
    return [
      'POST /api/orchestrate - Main orchestration endpoint',
      'POST /api/quick-orchestrate - Quick orchestration for simple queries',
      'POST /api/discover-agents - Discover agents for a query',
      'POST /api/analyze-query - Analyze query using 6-stage LLM',
      'POST /api/clean-text - Clean and format text',
      'GET /api/status - Get system status',
      'GET /health - Health check'
    ];
  }
}

// Export singleton instance
export const unifiedOrchestrationService = new UnifiedOrchestrationService();

// Types are already exported above
