// Standardized Model Configuration
// Generated from actual Ollama models: 10 available

export const OLLAMA_MODELS = {
  // Available Models (verified)
  AVAILABLE: [
    "deepseek-r1:latest",
    "gpt-oss:20b",
    "qwen2.5:latest",
    "llama3.2:1b",
    "llama3.2:latest",
    "calebfahlgren/natural-functions:latest",
    "phi3:latest",
    "nomic-embed-text:latest",
    "mistral:latest",
    "openhermes:latest"
  ],
  
  // Recommended Defaults
  DEFAULT: "llama3.2:latest",
  FAST: "llama3.2:1b",
  QUALITY: "deepseek-r1:latest",
  
  // Use Cases
  CHAT_INTERFACE: "llama3.2:latest",
  AGENT_PROCESSING: "deepseek-r1:latest",
  QUICK_RESPONSES: "llama3.2:1b",
  CODE_TASKS: "deepseek-r1:latest",
  REASONING: "qwen2.5:latest",
  GENERAL: "phi3:latest",
  
  // Model Categories
  LLAMA_MODELS: ["llama3.2:1b", "llama3.2:latest"],
  PHI_MODELS: ["phi3:latest"],
  MISTRAL_MODELS: ["mistral:latest"],
  QWEN_MODELS: ["qwen2.5:latest"],
  DEEPSEEK_MODELS: ["deepseek-r1:latest"],
  
  // Validation
  isValid: (model: string): boolean => {
    return OLLAMA_MODELS.AVAILABLE.includes(model);
  },
  
  getDefault: (): string => OLLAMA_MODELS.DEFAULT,
  getFast: (): string => OLLAMA_MODELS.FAST,
  getQuality: (): string => OLLAMA_MODELS.QUALITY,
  
  // Get model by use case
  getForUseCase: (useCase: 'chat' | 'agent' | 'fast' | 'code' | 'reasoning' | 'general'): string => {
    switch (useCase) {
      case 'chat': return OLLAMA_MODELS.CHAT_INTERFACE;
      case 'agent': return OLLAMA_MODELS.AGENT_PROCESSING;
      case 'fast': return OLLAMA_MODELS.QUICK_RESPONSES;
      case 'code': return OLLAMA_MODELS.CODE_TASKS;
      case 'reasoning': return OLLAMA_MODELS.REASONING;
      case 'general': return OLLAMA_MODELS.GENERAL;
      default: return OLLAMA_MODELS.DEFAULT;
    }
  },
  
  // Format model name for display
  formatDisplayName: (model: string): string => {
    if (!model) return 'Unknown Model';
    
    // Handle special cases
    const modelMap: Record<string, string> = {
      'llama3.2:1b': 'Llama 3.2 (1B)',
      'llama3.2:latest': 'Llama 3.2 (Latest)',
      'phi3:latest': 'Phi-3 (Latest)',
      'mistral:latest': 'Mistral (Latest)',
      'qwen2.5:latest': 'Qwen 2.5 (Latest)',
      'deepseek-r1:latest': 'DeepSeek R1 (Latest)',
      'gpt-oss:20b': 'GPT-OSS (20B)',
      'openhermes:latest': 'OpenHermes (Latest)',
      'nomic-embed-text:latest': 'Nomic Embed Text',
      'calebfahlgren/natural-functions:latest': 'Natural Functions'
    };
    
    return modelMap[model] || model;
  },
  
  // Get model info
  getModelInfo: (model: string) => {
    const infoMap: Record<string, { size: string; description: string; speed: 'fast' | 'medium' | 'slow' }> = {
      'llama3.2:1b': { size: '1.2GB', description: 'Lightweight Llama model for fast inference', speed: 'fast' },
      'llama3.2:latest': { size: '1.9GB', description: 'Latest Llama 3.2 model with balanced performance', speed: 'medium' },
      'phi3:latest': { size: '2.2GB', description: 'Microsoft Phi-3 model optimized for efficiency', speed: 'medium' },
      'mistral:latest': { size: '3.8GB', description: 'Mistral model for general-purpose tasks', speed: 'medium' },
      'qwen2.5:latest': { size: '4.4GB', description: 'Qwen 2.5 model with strong reasoning capabilities', speed: 'medium' },
      'deepseek-r1:latest': { size: '4.9GB', description: 'DeepSeek R1 model for advanced reasoning and code', speed: 'slow' },
      'gpt-oss:20b': { size: '12.8GB', description: 'Large GPT-OSS model with 20B parameters', speed: 'slow' },
      'openhermes:latest': { size: '3.8GB', description: 'OpenHermes model for conversational AI', speed: 'medium' },
      'nomic-embed-text:latest': { size: '0.3GB', description: 'Text embedding model', speed: 'fast' },
      'calebfahlgren/natural-functions:latest': { size: '3.8GB', description: 'Natural functions specialized model', speed: 'medium' }
    };
    
    return infoMap[model] || { size: 'Unknown', description: 'Model information not available', speed: 'medium' as const };
  }
};

// Type definitions
export type OllamaModelName = typeof OLLAMA_MODELS.AVAILABLE[number];
export type ModelUseCase = 'chat' | 'agent' | 'fast' | 'code' | 'reasoning' | 'general';
export type ModelSpeed = 'fast' | 'medium' | 'slow';

// Export for backward compatibility
export default OLLAMA_MODELS;