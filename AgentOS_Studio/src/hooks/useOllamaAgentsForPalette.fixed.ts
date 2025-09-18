/**
 * Fixed hook for managing Ollama agents for palette display
 * Provides agents from the existing agent management system with safe auto-refresh
 */

import { useState, useEffect, useCallback, useRef } from 'react';

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

export const useOllamaAgentsForPaletteFixed = () => {
  const [agents, setAgents] = useState<PaletteAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  // Use refs to avoid stale closures
  const agentsRef = useRef<PaletteAgent[]>([]);
  const mountedRef = useRef(true);

  // Extract capabilities from agent data
  const extractCapabilities = useCallback((agent: any): string[] => {
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
  }, []);

  const fetchAgents = useCallback(async (isAutoRefresh = false) => {
    // Don't fetch if component is unmounted
    if (!mountedRef.current) return;
    
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
      
      if (!mountedRef.current) return; // Check again after async operation
      
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
        
        // For auto-refresh, only update if there are actual changes
        if (isAutoRefresh) {
          const currentIds = agentsRef.current.map(a => a.id).sort().join(',');
          const newIds = transformedAgents.map(a => a.id).sort().join(',');
          
          if (currentIds !== newIds) {
            setAgents(transformedAgents);
            agentsRef.current = transformedAgents;
            setLastRefresh(new Date());
          }
        } else {
          setAgents(transformedAgents);
          agentsRef.current = transformedAgents;
          setLastRefresh(new Date());
        }
      } else {
        setAgents([]);
        agentsRef.current = [];
        setLastRefresh(new Date());
      }
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('Failed to fetch Ollama agents:', err);
      setError('Failed to load agents');
      setAgents([]);
      agentsRef.current = [];
    } finally {
      if (!mountedRef.current) return;
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  }, [extractCapabilities]);

  // Create a new agent
  const createAgent = useCallback(async (agentData: Partial<PaletteAgent>): Promise<PaletteAgent> => {
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

        if (mountedRef.current) {
          setAgents(prev => {
            const updated = [...prev, newAgent];
            agentsRef.current = updated;
            return updated;
          });
        }
        return newAgent;
      }
      
      throw new Error('Failed to create agent');
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }, [extractCapabilities]);

  // Delete an agent
  const deleteAgent = useCallback(async (agentId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/agents/ollama/${agentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (mountedRef.current) {
        setAgents(prev => {
          const updated = prev.filter(agent => agent.id !== agentId);
          agentsRef.current = updated;
          return updated;
        });
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchAgents();
    
    // Set up auto-refresh every 15 seconds (increased interval for stability)
    const interval = setInterval(() => {
      if (mountedRef.current) {
        fetchAgents(true);
      }
    }, 15000);
    
    // Refresh when window gains focus (user switches back to tab)
    const handleFocus = () => {
      if (mountedRef.current) {
        fetchAgents();
      }
    };
    
    // Refresh when page becomes visible (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden && mountedRef.current) {
        fetchAgents();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty dependency array - only run once

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