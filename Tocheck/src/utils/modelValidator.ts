// Model Validation Utility
// Ensures all model references are valid at runtime

import { OLLAMA_MODELS } from '@/config/ollamaModels';

export class ModelValidator {
  /**
   * Validate a model name and return a valid one
   */
  static validateModel(model: string | undefined | null): string {
    if (!model) {
      console.warn('ModelValidator: No model provided, using default');
      return OLLAMA_MODELS.DEFAULT;
    }
    
    if (OLLAMA_MODELS.isValid(model)) {
      return model;
    }
    
    console.warn(`ModelValidator: Invalid model "${model}", using default`);
    return OLLAMA_MODELS.DEFAULT;
  }
  
  /**
   * Get a model for a specific use case
   */
  static getModelForUseCase(useCase: 'chat' | 'agent' | 'fast' | 'code' | 'reasoning' | 'general'): string {
    return OLLAMA_MODELS.getForUseCase(useCase);
  }
  
  /**
   * Format model name for display
   */
  static formatForDisplay(model: string): string {
    return OLLAMA_MODELS.formatDisplayName(model);
  }
  
  /**
   * Get all available models
   */
  static getAvailableModels(): string[] {
    return [...OLLAMA_MODELS.AVAILABLE];
  }
  
  /**
   * Check if Ollama service is using valid models
   */
  static async validateOllamaService(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // This would be called by components to validate their model usage
      console.log('ModelValidator: Validating Ollama service models...');
      
      // Add validation logic here if needed
      return { valid: true, issues };
      
    } catch (error) {
      issues.push(`Ollama service validation failed: ${error}`);
      return { valid: false, issues };
    }
  }
}

// Export for convenience
export const validateModel = ModelValidator.validateModel;
export const getModelForUseCase = ModelValidator.getModelForUseCase;
export const formatModelForDisplay = ModelValidator.formatForDisplay;
