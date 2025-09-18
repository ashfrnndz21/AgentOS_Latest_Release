/**
 * Hook for managing Ollama agents for palette display
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

export const useOllamaAgentsForPalette = () => {
  const [agents, setAgents] = useState<PaletteAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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

  const fetchAgents = async (isAutoRefresh = false) => {
    // For auto-refresh, don't show loading spinner
    if (!isAutoRefresh) {
      setLoading(true);
    }
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
        

        // Always update agents and timestamp
        setAgents(transformedAgents);
        setLastRefresh(new Date());
      } else {

        setAgents([]);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch Ollama agents:', err);
      setError('Failed to load agents');
      setAgents([]);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  };

  // Create a new agent
  const createAgent = async (agentData: Partial<PaletteAgent>): Promise<PaletteAgent> => {
    try {
      const response = await fetch('/api/agents/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: agentData.name,
          role: agentData.role,
          description: agentData.description,
          model: agentData.model,
          systemPrompt: agentData.systemPrompt,
          temperature: agentData.temperature,
          maxTokens: agentData.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.agent) {
        const newAgent: PaletteAgent = {
          id: result.agent.id,
          name: result.agent.name,
          role: result.agent.role,
          description: result.agent.description,
          model: result.agent.model?.model_id,
          systemPrompt: result.agent.system_prompt,
          temperature: result.agent.temperature,
          maxTokens: result.agent.max_tokens,
          capabilities: extractCapabilities(result.agent),
          created_at: result.agent.created_at,
          updated_at: result.agent.updated_at
        };

        setAgents(prev => [...prev, newAgent]);
        return newAgent;
      }
      
      throw new Error('Failed to create agent');
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  };

  // Delete an agent
  const deleteAgent = async (agentId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/agents/ollama/${agentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setAgents(prev => prev.filter(agent => agent.id !== agentId));
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAgents();
    
    // Set up auto-refresh every 10 seconds to keep agents in sync (reduced frequency for better performance)
    const interval = setInterval(() => {
      fetchAgents(true); // Pass true for auto-refresh
    }, 10000);
    
    // Refresh when window gains focus (user switches back to tab)
    const handleFocus = () => {
      fetchAgents();
    };
    
    // Refresh when page becomes visible (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAgents();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty dependency array to run only once

  return {
    agents,
    loading,
    error,
    lastRefresh,
    refreshAgents: fetchAgents,
    createAgent,
    deleteAgent
  };
};