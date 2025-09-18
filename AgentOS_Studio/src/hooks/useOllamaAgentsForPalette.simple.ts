/**
 * Simplified hook for managing Ollama agents for palette display
 * Provides agents from the existing agent management system
 */

import { useState, useEffect } from 'react';

export interface PaletteAgent {
  id: string;
  name: string;
  role?: string;
  description?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  capabilities?: string[];
  created_at?: string;
  updated_at?: string;
}

export const useOllamaAgentsForPaletteSimple = () => {
  const [agents, setAgents] = useState<PaletteAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agents/ollama');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.agents) {
        // Transform agents to palette format
        const transformedAgents: PaletteAgent[] = data.agents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          role: agent.role,
          description: agent.description,
          model: agent.model?.model_id || agent.model,
          systemPrompt: agent.system_prompt,
          temperature: agent.temperature,
          maxTokens: agent.max_tokens,
          capabilities: extractCapabilities(agent),
          created_at: agent.created_at,
          updated_at: agent.updated_at
        }));
        
        setAgents(transformedAgents);
      } else {
        setAgents([]);
      }
    } catch (err) {
      console.error('Failed to fetch Ollama agents:', err);
      setError('Failed to load agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract capabilities from agent data
  const extractCapabilities = (agent: any): string[] => {
    const capabilities: string[] = [];
    
    // Extract from role and description
    const text = `${agent.role || ''} ${agent.description || ''}`.toLowerCase();
    
    if (text.includes('research') || text.includes('analysis') || text.includes('investigate')) {
      capabilities.push('research');
    }
    if (text.includes('calculation') || text.includes('math') || text.includes('compute')) {
      capabilities.push('calculation');
    }
    if (text.includes('documentation') || text.includes('writing') || text.includes('content')) {
      capabilities.push('documentation');
    }
    if (text.includes('coordination') || text.includes('management') || text.includes('orchestrat')) {
      capabilities.push('coordination');
    }
    if (text.includes('code') || text.includes('programming') || text.includes('development')) {
      capabilities.push('coding');
    }
    
    // If no specific capabilities found, add general
    if (capabilities.length === 0) {
      capabilities.push('general');
    }
    
    return capabilities;
  };

  useEffect(() => {
    fetchAgents();
  }, []); // Simple, no auto-refresh

  return {
    agents,
    loading,
    error,
    refreshAgents: fetchAgents
  };
};