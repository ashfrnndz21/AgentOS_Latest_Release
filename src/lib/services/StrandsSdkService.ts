/**
 * Strands SDK Service
 * Handles Strands SDK agent operations and management
 */

export interface StrandsSdkAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  tools: string[];
  temperature?: number;
  maxTokens?: number;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
}

class StrandsSdkService {
  private baseUrl = 'http://localhost:5006';

  /**
   * Extract capabilities from agent data based on name and description
   */
  public extractCapabilities(agentData: {
    name: string;
    description: string;
    tools?: string[];
  }): string[] {
    const existingCapabilities = agentData.tools || [];
    
    // If capabilities already exist, return them
    if (existingCapabilities.length > 0) {
      return existingCapabilities;
    }

    const capabilities: string[] = [];
    const name = agentData.name.toLowerCase();
    const description = agentData.description.toLowerCase();

    // Weather-related capabilities
    const weatherIndicators = ['weather', 'temperature', 'rain', 'sunny', 'cloudy', 'forecast', 'climate'];
    if (weatherIndicators.some(indicator => name.includes(indicator) || description.includes(indicator))) {
      capabilities.push('weather_analysis', 'forecasting');
    }

    // Technical capabilities
    const technicalIndicators = ['technical', 'code', 'programming', 'software', 'development', 'debug', 'fix'];
    if (technicalIndicators.some(indicator => name.includes(indicator) || description.includes(indicator))) {
      capabilities.push('code_execution', 'technical_analysis');
    }

    // Math capabilities
    const mathIndicators = ['math', 'calculate', 'compute', 'number', 'equation', 'formula'];
    if (mathIndicators.some(indicator => name.includes(indicator) || description.includes(indicator))) {
      capabilities.push('calculator', 'mathematical_analysis');
    }

    // Research capabilities
    const researchIndicators = ['research', 'analyze', 'study', 'investigate', 'explore', 'find'];
    if (researchIndicators.some(indicator => name.includes(indicator) || description.includes(indicator))) {
      capabilities.push('research', 'analysis');
    }

    // File operations
    const fileIndicators = ['file', 'document', 'read', 'write', 'manage'];
    if (fileIndicators.some(indicator => name.includes(indicator) || description.includes(indicator))) {
      capabilities.push('file_operations');
    }

    // Tourism and travel capabilities
    const tourismIndicators = ['tourism', 'travel', 'tourist', 'destination', 'visit', 'holiday', 'vacation', 'beach', 'attraction'];
    if (tourismIndicators.some(indicator => name.includes(indicator) || description.includes(indicator))) {
      capabilities.push('tourism_guidance', 'travel_planning', 'destination_recommendation');
    }

    // Location-specific capabilities
    const singaporeIndicators = ['singapore', 'singapre', 'sg', 'singaporean'];
    if (singaporeIndicators.some(indicator => name.includes(indicator) || description.includes(indicator))) {
      capabilities.push('singapore_expertise', 'singapore_tourism', 'singapore_attractions');
    }

    const malaysiaIndicators = ['malaysia', 'malaysian', 'my', 'kuala lumpur', 'penang', 'langkawi', 'sabah', 'sarawak'];
    if (malaysiaIndicators.some(indicator => name.includes(indicator) || description.includes(indicator))) {
      capabilities.push('malaysia_expertise', 'malaysia_tourism', 'malaysia_attractions');
    }

    // Sports capabilities
    const sportsIndicators = ['sport', 'sports', 'fitness', 'exercise', 'athletic', 'gym', 'workout', 'cycling', 'hiking', 'surfing', 'running'];
    if (sportsIndicators.some(indicator => name.includes(indicator) || description.includes(indicator))) {
      capabilities.push('sports_analysis', 'fitness_guidance', 'sports_planning');
    }

    // Always add basic capabilities
    capabilities.push('think', 'current_time');

    return [...new Set(capabilities)]; // Remove duplicates
  }

  /**
   * Get all Strands SDK agents
   */
  async getAgents(): Promise<StrandsSdkAgent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/agents`);
      const data = await response.json();
      
      return (data || []).map((agent: any) => ({
        id: agent.id || agent.name?.toLowerCase().replace(/\s+/g, '_'),
        name: agent.name || 'Unnamed Agent',
        description: agent.description || '',
        model: agent.model_id || agent.model || 'llama3.2:latest',
        systemPrompt: agent.system_prompt || agent.systemPrompt || '',
        tools: agent.tools || [],
        temperature: agent.sdk_config?.ollama_config?.temperature || 0.7,
        maxTokens: agent.sdk_config?.ollama_config?.max_tokens || 1000,
        status: agent.status || 'active',
        createdAt: agent.created_at || agent.createdAt || new Date().toISOString(),
        updatedAt: agent.updated_at || agent.updatedAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to get Strands SDK agents:', error);
      return [];
    }
  }

  /**
   * List all Strands SDK agents (alias for getAgents)
   */
  async listAgents(): Promise<StrandsSdkAgent[]> {
    return this.getAgents();
  }

  /**
   * Create a new Strands SDK agent
   */
  async createAgent(agentData: Omit<StrandsSdkAgent, 'id' | 'createdAt' | 'updatedAt'>): Promise<StrandsSdkAgent | null> {
    console.log('🚀 StrandsSdkService.createAgent called with:', agentData);
    try {
      const requestBody = {
        name: agentData.name,
        description: agentData.description,
        model_id: agentData.model,
        system_prompt: agentData.systemPrompt,
        tools: agentData.tools,
        ollama_config: {
          temperature: agentData.temperature,
          max_tokens: agentData.maxTokens
        }
      };
      
      console.log('🔄 Creating Strands SDK agent with data:', requestBody);
      
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Strands SDK agent created successfully:', data);
        
        // Validate that we got the expected response structure
        if (!data || !data.id) {
          console.error('❌ Invalid response structure:', data);
          throw new Error('Invalid response from backend - missing agent ID');
        }
        
        return {
          id: data.id,
          name: data.name || agentData.name,
          description: data.description || agentData.description,
          model: data.model_config?.model_id || agentData.model,
          systemPrompt: data.system_prompt || agentData.systemPrompt,
          tools: data.tools || agentData.tools,
          temperature: data.sdk_config?.ollama_config?.temperature || agentData.temperature,
          maxTokens: data.sdk_config?.ollama_config?.max_tokens || agentData.maxTokens,
          status: data.status || 'active',
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString()
        };
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to create Strands SDK agent:', response.status, errorText);
        throw new Error(`Failed to create agent: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Exception creating Strands SDK agent:', error);
      console.error('❌ Error details:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new Error('Service call failed: Request timeout - the service took too long to respond');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Service call failed: Network error - unable to connect to the service');
        } else if (error.message.includes('Load failed')) {
          throw new Error('Service call failed: Load failed - unable to reach the backend service');
        }
      }
      
      throw error; // Re-throw instead of returning null
    }
  }

  /**
   * Update an existing Strands SDK agent
   */
  async updateAgent(id: string, updates: Partial<StrandsSdkAgent>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/agents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to update agent ${id}:`, error);
      return false;
    }
  }

  /**
   * Delete a Strands SDK agent
   */
  async deleteAgent(id: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting agent ${id} from ${this.baseUrl}/api/strands-sdk/agents/${id}`);
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/agents/${id}`, {
        method: 'DELETE'
      });

      console.log(`🗑️ Delete response status: ${response.status}, ok: ${response.ok}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🗑️ Delete failed: ${response.status} - ${errorText}`);
      }

      return response.ok;
    } catch (error) {
      console.error(`🗑️ Failed to delete agent ${id}:`, error);
      return false;
    }
  }

  /**
   * Execute a Strands SDK agent
   */
  async executeAgent(id: string, input: string): Promise<{
    success: boolean;
    response?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/agents/${id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          response: data.response || data.output || 'No response'
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to execute agent ${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute a Strands SDK agent with progress updates (alias for executeAgent)
   */
  async executeAgentWithProgress(id: string, input: string, onProgress?: (progress: any) => void): Promise<{
    success: boolean;
    response?: string;
    error?: string;
  }> {
    try {
      // For now, use the regular execute method
      // In the future, this could be enhanced to use the streaming endpoint
      const result = await this.executeAgent(id, input);
      
      // Simulate progress callback if provided
      if (onProgress) {
        onProgress({ step: 'Executing agent...', progress: 50 });
        onProgress({ step: 'Processing response...', progress: 100 });
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to execute agent with progress ${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check service health status
   */
  async checkHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/health`);
      
      if (response.ok) {
        const data = await response.json();
        return { 
          status: data.status === 'healthy' ? 'healthy' : 'unhealthy', 
          details: data.message || 'Service is running' 
        };
      } else {
        return { status: 'unhealthy', details: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get agent health status
   */
  async getAgentHealth(id: string): Promise<{
    status: 'active' | 'inactive' | 'error';
    details: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/agents/${id}/health`);
      
      if (response.ok) {
        return { status: 'active', details: 'Agent is healthy' };
      } else {
        return { status: 'error', details: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { 
        status: 'error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Register agent for A2A communication
   */
  async registerAgentForA2A(agentId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/a2a/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ agent_id: agentId })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: data.message || 'Agent registered for A2A communication'
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
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
   * Register A2A agent with Frontend Agent Bridge for orchestration
   */
  async registerAgentWithFrontendBridge(agentId: string, agentData: {
    name: string;
    description: string;
    capabilities: string[];
  }): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch('http://localhost:5012/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: agentId,
          name: agentData.name,
          description: agentData.description,
          capabilities: agentData.capabilities
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: data.message || 'Agent registered with Frontend Agent Bridge'
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
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
   * Enhanced A2A registration that also registers with Frontend Agent Bridge
   */
  async registerAgentForA2AWithBridge(agentId: string, agentData: {
    name: string;
    description: string;
    capabilities: string[];
  }): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    a2aRegistered?: boolean;
    bridgeRegistered?: boolean;
  }> {
    try {
      // First register for A2A communication
      const a2aResult = await this.registerAgentForA2A(agentId);
      
      if (!a2aResult.success) {
        return {
          success: false,
          error: `A2A registration failed: ${a2aResult.error}`,
          a2aRegistered: false,
          bridgeRegistered: false
        };
      }

      // Then register with Frontend Agent Bridge
      const bridgeResult = await this.registerAgentWithFrontendBridge(agentId, agentData);
      
      if (!bridgeResult.success) {
        return {
          success: false,
          error: `Bridge registration failed: ${bridgeResult.error}`,
          a2aRegistered: true,
          bridgeRegistered: false
        };
      }

      return {
        success: true,
        message: 'Agent registered for A2A communication and Frontend Agent Bridge',
        a2aRegistered: true,
        bridgeRegistered: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        a2aRegistered: false,
        bridgeRegistered: false
      };
    }
  }

  /**
   * Get A2A registered agents
   */
  async getA2AAgents(): Promise<{
    success: boolean;
    agents?: any[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/a2a/agents`);

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          agents: data.agents || []
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
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
   * Remove agent from Frontend Agent Bridge
   */
  async removeAgentFromFrontendBridge(agentId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`http://localhost:5012/agent/${agentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Agent removed from Frontend Agent Bridge'
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
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
   * Remove agent from Agent Registry
   */
  async removeAgentFromRegistry(agentId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`http://localhost:5010/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Agent removed from Agent Registry'
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
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
   * Enhanced agent deletion with automatic cleanup
   */
  async deleteAgentWithCleanup(agentId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    cleanupResults?: {
      registryRemoved: boolean;
      bridgeRemoved: boolean;
    };
  }> {
    try {
      // First delete from Strands SDK service
      const deleteResult = await this.deleteAgent(agentId);
      
      if (!deleteResult) {
        return {
          success: false,
          error: 'Failed to delete agent from Strands SDK service'
        };
      }

      // Then clean up from other services
      const cleanupResults = {
        registryRemoved: false,
        bridgeRemoved: false
      };

      // Remove from Agent Registry
      try {
        const registryResult = await this.removeAgentFromRegistry(agentId);
        cleanupResults.registryRemoved = registryResult.success;
        if (!registryResult.success) {
          console.warn('Failed to remove from Agent Registry:', registryResult.error);
        }
      } catch (error) {
        console.warn('Error removing from Agent Registry:', error);
      }

      // Remove from Frontend Agent Bridge
      try {
        const bridgeResult = await this.removeAgentFromFrontendBridge(agentId);
        cleanupResults.bridgeRemoved = bridgeResult.success;
        if (!bridgeResult.success) {
          console.warn('Failed to remove from Frontend Agent Bridge:', bridgeResult.error);
        }
      } catch (error) {
        console.warn('Error removing from Frontend Agent Bridge:', error);
      }

      return {
        success: true,
        message: 'Agent deleted with automatic cleanup',
        cleanupResults
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const strandsSdkService = new StrandsSdkService();