/**
 * Text Cleaning Service
 * Handles communication with the backend text cleaning service
 */

export interface CleaningRequest {
  text: string;
  output_type: 'agent_response' | 'orchestrator_response' | 'handoff_context' | 'general';
}

export interface CleaningResponse {
  success: boolean;
  original_text: string;
  cleaned_text: string;
  output_type: string;
  timestamp: string;
}

export interface CleaningStats {
  total_cleanings: number;
  successful_cleanings: number;
  failed_cleanings: number;
  average_cleaning_time: number;
  total_characters_processed: number;
  cleaning_success_rate: number;
}

export interface CleaningConfig {
  enabled: boolean;
  model: string;
  temperature: number;
  max_tokens: number;
  timeout: number;
}

export class TextCleaningService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5019') {
    this.baseUrl = baseUrl;
  }

  /**
   * Clean text using the text cleaning service
   */
  async cleanText(request: CleaningRequest): Promise<CleaningResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/clean-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Text cleaning failed:', error);
      throw error;
    }
  }

  /**
   * Get cleaning statistics
   */
  async getCleaningStats(): Promise<CleaningStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cleaning-stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get cleaning stats:', error);
      throw error;
    }
  }

  /**
   * Check if the text cleaning service is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Text cleaning service health check failed:', error);
      return false;
    }
  }

  /**
   * Clean multiple texts in batch
   */
  async cleanTextBatch(requests: CleaningRequest[]): Promise<CleaningResponse[]> {
    const promises = requests.map(request => this.cleanText(request));
    return Promise.all(promises);
  }

  /**
   * Clean agent response specifically
   */
  async cleanAgentResponse(text: string): Promise<string> {
    const response = await this.cleanText({
      text,
      output_type: 'agent_response'
    });
    return response.cleaned_text;
  }

  /**
   * Clean orchestrator response specifically
   */
  async cleanOrchestratorResponse(text: string): Promise<string> {
    const response = await this.cleanText({
      text,
      output_type: 'orchestrator_response'
    });
    return response.cleaned_text;
  }

  /**
   * Clean handoff context specifically
   */
  async cleanHandoffContext(text: string): Promise<string> {
    const response = await this.cleanText({
      text,
      output_type: 'handoff_context'
    });
    return response.cleaned_text;
  }
}

// Export singleton instance
export const textCleaningService = new TextCleaningService();
