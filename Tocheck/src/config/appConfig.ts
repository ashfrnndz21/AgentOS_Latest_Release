export const appConfig = {
  // Backend API Configuration
  API_BASE_URL: 'http://localhost:5052',
  
  // Ollama Configuration
  OLLAMA_BASE_URL: 'http://localhost:11434',
  
  // Document Processing
  DOCUMENT_API_URL: 'http://localhost:5052/api/documents',
  RAG_API_URL: 'http://localhost:5052/api/rag',
  
  // Agent Services
  AGENT_API_URL: 'http://localhost:5052/api/agents',
  WORKFLOW_API_URL: 'http://localhost:5052/api/workflows',
  
  // MCP Gateway
  MCP_GATEWAY_URL: 'http://localhost:5052/api/mcp',
  
  // Strands Integration
  STRANDS_API_URL: 'http://localhost:5052/api/strands',
  
  // Connection Settings
  REQUEST_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  
  // Feature Flags
  FEATURES: {
    OLLAMA_INTEGRATION: true,
    DOCUMENT_PROCESSING: true,
    MULTI_AGENT_WORKSPACE: true,
    MCP_GATEWAY: true,
    STRANDS_FRAMEWORK: true
  }
};

export default appConfig;