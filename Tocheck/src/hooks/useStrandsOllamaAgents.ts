import { useState, useEffect } from 'react';
import { strandsOllamaAgentService, StrandsOllamaAgentConfig } from '@/lib/services/StrandsOllamaAgentService';
import { useOllamaModels } from './useOllamaModels';

export const useStrandsOllamaAgents = () => {
  const [agents, setAgents] = useState<StrandsOllamaAgentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { ollamaStatus } = useOllamaModels();

  const loadAgents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allAgents = strandsOllamaAgentService.getAllAgents();
      setAgents(allAgents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (config: Omit<StrandsOllamaAgentConfig, 'id' | 'created_at'>) => {
    try {
      const newAgent = await strandsOllamaAgentService.createAgent(config);
      setAgents(prev => [...prev, newAgent]);
      return newAgent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create agent';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAgent = async (agentId: string) => {
    try {
      const success = await strandsOllamaAgentService.deleteAgent(agentId);
      if (success) {
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete agent';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateAgent = async (agentId: string, updates: Partial<StrandsOllamaAgentConfig>) => {
    try {
      const updatedAgent = await strandsOllamaAgentService.updateAgent(agentId, updates);
      setAgents(prev => prev.map(agent => 
        agent.id === agentId ? updatedAgent : agent
      ));
      return updatedAgent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update agent';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getAgentMetrics = (agentId: string) => {
    return strandsOllamaAgentService.getAgentMetrics(agentId);
  };

  const getAgentExecutions = (agentId: string) => {
    return strandsOllamaAgentService.getAgentExecutions(agentId);
  };

  const executeAgent = async (
    agentId: string, 
    input: string, 
    conversationId?: string,
    reasoningType: 'chain_of_thought' | 'tree_of_thought' | 'reflection' = 'chain_of_thought'
  ) => {
    try {
      const execution = await strandsOllamaAgentService.executeAgent(
        agentId, 
        input, 
        conversationId, 
        reasoningType
      );
      
      // Update agent's last used time
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        agent.last_used = new Date().toISOString();
        setAgents(prev => prev.map(a => a.id === agentId ? agent : a));
      }
      
      return execution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute agent';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const createConversation = async (agentId: string) => {
    try {
      return await strandsOllamaAgentService.createConversation(agentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getConversation = (conversationId: string) => {
    return strandsOllamaAgentService.getConversation(conversationId);
  };

  const getAgentConversations = (agentId: string) => {
    return strandsOllamaAgentService.getAgentConversations(agentId);
  };

  const healthCheck = async () => {
    try {
      return await strandsOllamaAgentService.healthCheck();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshAgents = () => {
    loadAgents();
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // Calculate aggregate metrics
  const aggregateMetrics = {
    totalAgents: agents.length,
    totalExecutions: agents.reduce((sum, agent) => {
      const metrics = getAgentMetrics(agent.id);
      return sum + metrics.totalExecutions;
    }, 0),
    averageResponseTime: agents.length > 0 ? agents.reduce((sum, agent) => {
      const metrics = getAgentMetrics(agent.id);
      return sum + metrics.averageResponseTime;
    }, 0) / agents.length : 0,
    totalTokensUsed: agents.reduce((sum, agent) => {
      const metrics = getAgentMetrics(agent.id);
      return sum + metrics.totalTokensUsed;
    }, 0),
    averageConfidenceScore: agents.length > 0 ? agents.reduce((sum, agent) => {
      const metrics = getAgentMetrics(agent.id);
      return sum + metrics.averageConfidenceScore;
    }, 0) / agents.length : 0,
    successRate: (() => {
      const totalExecutions = agents.reduce((sum, agent) => {
        const metrics = getAgentMetrics(agent.id);
        return sum + metrics.totalExecutions;
      }, 0);
      const successfulExecutions = agents.reduce((sum, agent) => {
        const metrics = getAgentMetrics(agent.id);
        return sum + metrics.successfulExecutions;
      }, 0);
      return totalExecutions > 0 ? successfulExecutions / totalExecutions : 1;
    })()
  };

  return {
    agents,
    isLoading,
    error,
    ollamaStatus,
    aggregateMetrics,
    createAgent,
    deleteAgent,
    updateAgent,
    executeAgent,
    createConversation,
    getConversation,
    getAgentConversations,
    getAgentMetrics,
    getAgentExecutions,
    healthCheck,
    refreshAgents,
    clearError: () => setError(null)
  };
};