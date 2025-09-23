/**
 * Safe Agent Import Service for Strands Intelligence Workspace
 * Provides read-only access to Ollama agents for import purposes
 * NO direct integration - transforms and creates independent Strands agents
 */

export interface ImportableAgent {
  // Read-only display data
  id: string;
  name: string;
  role?: string;
  description?: string;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  source: 'ollama';
  created_at?: string;
  
  // Safe metadata for display
  capabilities: string[];
  hasGuardrails: boolean;
  isConfigured: boolean;
}

export interface StrandsNativeAgent {
  // Independent Strands agent (no Ollama dependencies)
  id: string;
  name: string;
  role: string;
  description: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  
  // Strands-specific configuration
  strandsConfig: {
    reasoningPattern: 'sequential' | 'parallel' | 'adaptive';
    contextManagement: {
      preserveMemory: boolean;
      compressionLevel: 'none' | 'summary' | 'key_points';
      maxContextLength: number;
    };
    toolAccess: {
      allowedTools: string[];
      toolSelectionStrategy: 'automatic' | 'explicit';
    };
  };
  
  // Strands metadata
  source: 'imported_from_ollama' | 'strands_native';
  importedAt?: string;
  lastModified: string;
  isActive: boolean;
}

class StrandsAgentImportService {
  private strandsAgents: Map<string, StrandsNativeAgent> = new Map();
  
  constructor() {
    this.loadStrandsAgents();
  }

  // SAFE: Read-only access to Ollama agents for display
  async getImportableAgents(): Promise<ImportableAgent[]> {
    try {
      // Use existing endpoint but with error isolation
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const response = await fetch('/api/agents/ollama', {
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data?.agents || !Array.isArray(data.agents)) {
        return [];
      }
      
      // Transform to safe display format
      return data.agents.map(this.transformToImportableAgent);
      
    } catch (error) {
      console.warn('Failed to load importable agents:', error);
      return []; // Graceful failure - no crash
    }
  }

  // SAFE: Transform Ollama agent to importable format
  private transformToImportableAgent(ollamaAgent: any): ImportableAgent {
    return {
      id: ollamaAgent.id || `unknown_${Date.now()}`,
      name: ollamaAgent.name || 'Unnamed Agent',
      role: ollamaAgent.role || 'Assistant',
      description: ollamaAgent.description || 'No description provided',
      model: ollamaAgent.model?.model_id || ollamaAgent.model || 'unknown',
      systemPrompt: ollamaAgent.system_prompt || '',
      temperature: ollamaAgent.temperature || 0.7,
      maxTokens: ollamaAgent.max_tokens || 1000,
      source: 'ollama',
      created_at: ollamaAgent.created_at,
      
      // Safe capability extraction
      capabilities: this.extractCapabilities(ollamaAgent),
      hasGuardrails: Boolean(ollamaAgent.guardrails?.enabled),
      isConfigured: Boolean(ollamaAgent.system_prompt)
    };
  }

  // SAFE: Extract capabilities without unsafe property access
  private extractCapabilities(agent: any): string[] {
    const capabilities: string[] = [];
    const text = `${agent.role || ''} ${agent.description || ''}`.toLowerCase();
    
    if (text.includes('research') || text.includes('analysis')) capabilities.push('Research');
    if (text.includes('writing') || text.includes('content')) capabilities.push('Writing');
    if (text.includes('code') || text.includes('programming')) capabilities.push('Coding');
    if (text.includes('chat') || text.includes('conversation')) capabilities.push('Chat');
    if (text.includes('calculation') || text.includes('math')) capabilities.push('Math');
    
    return capabilities.length > 0 ? capabilities : ['General'];
  }

  // CORE: Import and transform to independent Strands agent
  async importAgent(importableAgent: ImportableAgent, customConfig?: Partial<StrandsNativeAgent>): Promise<StrandsNativeAgent> {
    const strandsAgentId = `strands_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create completely independent Strands agent
    const strandsAgent: StrandsNativeAgent = {
      id: strandsAgentId,
      name: customConfig?.name || `${importableAgent.name} (Strands)`,
      role: customConfig?.role || importableAgent.role || 'Assistant',
      description: customConfig?.description || importableAgent.description || 'Imported from Ollama',
      model: importableAgent.model, // Only model name is shared
      systemPrompt: customConfig?.systemPrompt || importableAgent.systemPrompt || '',
      temperature: customConfig?.temperature || importableAgent.temperature || 0.7,
      maxTokens: customConfig?.maxTokens || importableAgent.maxTokens || 1000,
      
      // Strands-specific configuration (independent)
      strandsConfig: {
        reasoningPattern: 'sequential',
        contextManagement: {
          preserveMemory: true,
          compressionLevel: 'summary',
          maxContextLength: 4000
        },
        toolAccess: {
          allowedTools: ['web_search', 'file_system', 'calculator'],
          toolSelectionStrategy: 'automatic'
        }
      },
      
      // Metadata
      source: 'imported_from_ollama',
      importedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isActive: true
    };
    
    // Store in Strands system (completely separate from Ollama)
    this.strandsAgents.set(strandsAgentId, strandsAgent);
    this.saveStrandsAgents();
    
    console.log(`✅ Imported agent "${importableAgent.name}" as independent Strands agent`);
    return strandsAgent;
  }

  // Strands agent management (independent system)
  getStrandsAgents(): StrandsNativeAgent[] {
    return Array.from(this.strandsAgents.values());
  }

  getStrandsAgent(id: string): StrandsNativeAgent | null {
    return this.strandsAgents.get(id) || null;
  }

  updateStrandsAgent(id: string, updates: Partial<StrandsNativeAgent>): StrandsNativeAgent | null {
    const agent = this.strandsAgents.get(id);
    if (!agent) return null;
    
    const updatedAgent = {
      ...agent,
      ...updates,
      lastModified: new Date().toISOString()
    };
    
    this.strandsAgents.set(id, updatedAgent);
    this.saveStrandsAgents();
    return updatedAgent;
  }

  deleteStrandsAgent(id: string): boolean {
    const deleted = this.strandsAgents.delete(id);
    if (deleted) {
      this.saveStrandsAgents();
    }
    return deleted;
  }

  // Execute Strands agent (independent execution)
  async executeStrandsAgent(agentId: string, input: string): Promise<{
    success: boolean;
    output: string;
    error?: string;
    duration: number;
    tokensUsed: number;
    metadata: any;
  }> {
    const agent = this.strandsAgents.get(agentId);
    if (!agent) {
      throw new Error(`Strands agent ${agentId} not found`);
    }

    const startTime = Date.now();
    
    try {
      // Execute using Ollama API directly (no service dependencies)
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: agent.model,
          prompt: `${agent.systemPrompt}\n\nHuman: ${input}\n\nAssistant:`,
          stream: false,
          options: {
            temperature: agent.temperature,
            num_predict: agent.maxTokens
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const result = await response.json();
      const duration = Date.now() - startTime;

      return {
        success: true,
        output: result.response || '',
        duration,
        tokensUsed: result.eval_count || 0,
        metadata: {
          model: agent.model,
          strandsConfig: agent.strandsConfig,
          executionId: `exec_${Date.now()}`
        }
      };

    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        tokensUsed: 0,
        metadata: { model: agent.model }
      };
    }
  }

  // Persistence (separate from Ollama system)
  private saveStrandsAgents(): void {
    try {
      const agentsData = Array.from(this.strandsAgents.entries());
      localStorage.setItem('strands-native-agents', JSON.stringify(agentsData));
    } catch (error) {
      console.error('Failed to save Strands agents:', error);
    }
  }

  private loadStrandsAgents(): void {
    try {
      const stored = localStorage.getItem('strands-native-agents');
      if (stored) {
        const agentsData = JSON.parse(stored);
        this.strandsAgents = new Map(agentsData);
      }
    } catch (error) {
      console.error('Failed to load Strands agents:', error);
    }
  }
}

// Global instance
export const strandsAgentImportService = new StrandsAgentImportService();