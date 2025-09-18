import { useState, useEffect } from 'react';
import { 
  realStrandsService, 
  RealStrandsAgentConfig, 
  StrandsAgent, 
  StrandsExecution 
} from '@/lib/services/RealStrandsService';
import { useOllamaModels } from './useOllamaModels';

export const useRealStrandsAgents = () => {
  const [agents, setAgents] = useState<StrandsAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { ollamaStatus } = useOllamaModels();

  const loadAgents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allAgents = await realStrandsService.listAgents();
      setAgents(allAgents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (config: RealStrandsAgentConfig) => {
    try {
      const newAgent = await realStrandsService.createAgent(config);
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
      const success = await realStrandsService.deleteAgent(agentId);
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

  const executeAgent = async (agentId: string, message: string): Promise<StrandsExecution> => {
    try {
      const execution = await realStrandsService.executeAgent(agentId, message);
      
      // Update agent's last used time (if we had that field)
      // For now, we'll just refresh the agents list
      loadAgents();
      
      return execution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute agent';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getAgent = async (agentId: string) => {
    try {
      return await realStrandsService.getAgent(agentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get agent';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getConversations = async (agentId: string) => {
    try {
      return await realStrandsService.getConversations(agentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get conversations';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getAvailableModels = async () => {
    try {
      return await realStrandsService.getAvailableModels();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get models';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const healthCheck = async () => {
    try {
      return await realStrandsService.healthCheck();
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
    totalExecutions: agents.reduce((sum, agent) => sum + (agent.conversation_count || 0), 0),
    averageResponseTime: agents.length > 0 ? 
      agents.reduce((sum, agent) => sum + (agent.avg_response_time || 0), 0) / agents.length : 0,
    totalTokensUsed: agents.reduce((sum, agent) => sum + (agent.total_tokens_used || 0), 0),
    successRate: 1.0 // We'll calculate this from actual execution data later
  };

  return {
    agents,
    isLoading,
    error,
    ollamaStatus,
    aggregateMetrics,
    createAgent,
    deleteAgent,
    executeAgent,
    getAgent,
    getConversations,
    getAvailableModels,
    healthCheck,
    refreshAgents,
    clearError: () => setError(null)
  };
};