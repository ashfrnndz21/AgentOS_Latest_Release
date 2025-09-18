import { useState, useEffect } from 'react';
import { ollamaAgentService, OllamaAgentConfig } from '@/lib/services/OllamaAgentService';
import { OLLAMA_MODELS } from '@/config/ollamaModels';

export interface PaletteAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'ollama';
  model: string;
  role: string;
  capabilities: string[];
  guardrails: boolean;
  originalAgent: OllamaAgentConfig;
}

export const useOllamaAgentsForPalette = () => {
  const [agents, setAgents] = useState<PaletteAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformOllamaAgentToPaletteAgent = (agent: OllamaAgentConfig): PaletteAgent => {
    // Extract model name (handle different model data structures)
    let modelName = OLLAMA_MODELS.DEFAULT; // Use default instead of 'Unknown'
    
    if (typeof agent.model === 'string') {
      // Validate the model name exists in our available models
      const cleanModelName = agent.model;
      modelName = OLLAMA_MODELS.isValid(cleanModelName) ? cleanModelName : OLLAMA_MODELS.DEFAULT;
    } else if (agent.model && typeof agent.model === 'object') {
      // Handle backend format: { provider: "ollama", model_id: "phi3:latest", host: "..." }
      const backendModelName = (agent.model as any).model_id || '';
      modelName = OLLAMA_MODELS.isValid(backendModelName) ? backendModelName : OLLAMA_MODELS.DEFAULT;
    }

    // Determine capabilities
    const capabilities: string[] = [];
    if (agent.capabilities) {
      if (agent.capabilities.conversation) capabilities.push('Chat');
      if (agent.capabilities.analysis) capabilities.push('Analysis');
      if (agent.capabilities.creativity) capabilities.push('Creative');
      if (agent.capabilities.reasoning) capabilities.push('Reasoning');
    }

    // Check if guardrails are enabled - handle multiple possible structures
    const hasBasicGuardrails = Boolean(
      agent.guardrails?.enabled || 
      agent.guardrails?.safety_level || 
      agent.guardrails?.safetyLevel ||
      (agent.guardrails && Object.keys(agent.guardrails).length > 0)
    );

    // Check for enhanced guardrails
    const enhancedGuardrails = agent.enhancedGuardrails || (agent as any).enhanced_guardrails;
    const hasEnhancedGuardrails = Boolean(enhancedGuardrails && (
      enhancedGuardrails.contentFilter?.enabled ||
      enhancedGuardrails.piiRedaction?.enabled ||
      enhancedGuardrails.customRules?.length > 0 ||
      enhancedGuardrails.behaviorLimits?.enabled
    ));

    const hasGuardrails = hasBasicGuardrails || hasEnhancedGuardrails;

    // Generate appropriate icon based on role/capabilities (keeping emoji for backward compatibility)
    const getAgentIcon = (role: string, capabilities: string[]): string => {
      const roleLower = role.toLowerCase();
      
      if (roleLower.includes('cvm') || roleLower.includes('customer')) return '💼';
      if (roleLower.includes('assistant') || roleLower.includes('personal')) return '🤖';
      if (roleLower.includes('analyst') || roleLower.includes('analysis')) return '📊';
      if (roleLower.includes('writer') || roleLower.includes('content')) return '✍️';
      if (roleLower.includes('researcher') || roleLower.includes('research')) return '🔍';
      if (roleLower.includes('coder') || roleLower.includes('developer')) return '💻';
      if (roleLower.includes('chat') || roleLower.includes('conversation')) return '💬';
      if (roleLower.includes('coordinator') || roleLower.includes('manager')) return '🎯';
      if (roleLower.includes('telecom') || roleLower.includes('telco')) return '📡';
      if (roleLower.includes('expert')) return '🎓';
      
      // Fallback based on capabilities
      if (capabilities.includes('Analysis')) return '📈';
      if (capabilities.includes('Creative')) return '🎨';
      if (capabilities.includes('Chat')) return '💭';
      
      return '🤖'; // Default robot icon
    };

    return {
      id: agent.id,
      name: agent.name,
      description: agent.role || agent.description || 'AI Agent',
      icon: getAgentIcon(agent.role || '', capabilities),
      type: 'ollama',
      model: modelName,
      role: agent.role || 'AI Assistant',
      capabilities,
      guardrails: hasGuardrails,
      originalAgent: agent
    };
  };

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load agents from the service
      await ollamaAgentService.loadAgentsFromBackend();
      
      // Load enhanced guardrails from localStorage and merge
      const enhancedGuardrailsData = localStorage.getItem('ollama-enhanced-guardrails');
      let enhancedGuardrails: Record<string, any> = {};
      
      if (enhancedGuardrailsData) {
        try {
          enhancedGuardrails = JSON.parse(enhancedGuardrailsData);
        } catch (error) {
          console.error('Failed to parse enhanced guardrails from localStorage:', error);
        }
      }
      
      const ollamaAgents = ollamaAgentService.getAllAgents();
      
      // Merge enhanced guardrails into agents
      const agentsWithEnhancedGuardrails = ollamaAgents.map(agent => {
        if (enhancedGuardrails[agent.id]) {
          return {
            ...agent,
            enhancedGuardrails: enhancedGuardrails[agent.id]
          };
        }
        return agent;
      });
      
      // Transform to palette format
      const paletteAgents = agentsWithEnhancedGuardrails.map(transformOllamaAgentToPaletteAgent);
      
      setAgents(paletteAgents);
    } catch (err) {
      console.error('Failed to load Ollama agents for palette:', err);
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  // Load agents on mount
  useEffect(() => {
    loadAgents();
  }, []);

  // Refresh function for manual reload
  const refreshAgents = () => {
    loadAgents();
  };

  return {
    agents,
    loading,
    error,
    refreshAgents
  };
};