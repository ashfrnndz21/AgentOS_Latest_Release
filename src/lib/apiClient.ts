// API Client for Ollama Terminal Integration

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
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
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }

  // Ollama endpoints
  async getOllamaModels() {
    return this.request('/api/ollama/models');
  }

  async executeOllamaCommand(command: string) {
    try {
      const result = await this.request('/api/ollama/terminal', {
        method: 'POST',
        body: JSON.stringify({ command })
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  async sendOllamaCommand(command: string) {
    return this.executeOllamaCommand(command);
  }

  async getOllamaStatus() {
    return this.request('/api/ollama/status');
  }

  async pullModel(modelName: string) {
    return this.request('/api/ollama/pull', {
      method: 'POST',
      body: JSON.stringify({ name: modelName })
    });
  }

  async generateResponse(model: string, prompt: string, options?: any) {
    return this.request('/api/ollama/generate', {
      method: 'POST',
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        ...options
      })
    });
  }

  async deleteModel(modelName: string) {
    return this.request('/api/ollama/delete', {
      method: 'DELETE',
      body: JSON.stringify({ name: modelName })
    });
  }

  async getPopularModels() {
    return this.request('/api/ollama/models/popular');
  }

  // Document/RAG endpoints
  async uploadDocument(formData: FormData) {
    return this.request('/api/rag/ingest', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }

  async queryDocuments(query: string, model?: string) {
    return this.request('/api/rag/query', {
      method: 'POST',
      body: JSON.stringify({ query, model })
    });
  }

  async getDocuments() {
    return this.request('/api/rag/documents');
  }

  async getRagStatus() {
    return this.request('/api/rag/status');
  }

  async deleteDocument(documentId: string) {
    return this.request(`/api/rag/documents/${documentId}`, {
      method: 'DELETE'
    });
  }

  // ===== STRANDS API METHODS =====
  
  // Strands Agents
  async getStrandsAgents() {
    return this.request('/api/strands/agents');
  }

  // Strands Workflows
  async createStrandsWorkflow(workflowData: any) {
    return this.request('/api/strands/workflows', {
      method: 'POST',
      body: JSON.stringify(workflowData)
    });
  }

  async executeStrandsWorkflow(workflowId: string, input: any) {
    return this.request(`/api/strands/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ input })
    });
  }

  async getStrandsWorkflowStatus(workflowId: string) {
    return this.request(`/api/strands/workflows/${workflowId}/status`);
  }

  // Strands Tools
  async getStrandsTools() {
    return this.request('/api/strands/tools');
  }

  async executeStrandsTool(toolName: string, params: any, context?: any) {
    return this.request(`/api/strands/tools/${toolName}/execute`, {
      method: 'POST',
      body: JSON.stringify({ params, context })
    });
  }
}

export const apiClient = new ApiClient('http://localhost:5002');
export default apiClient;