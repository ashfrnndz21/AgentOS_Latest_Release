import { useState, useEffect, useCallback } from 'react';
import { unifiedAgentClient, UnifiedAgent, UnifiedMessage, CreateAgentRequest } from '@/lib/unifiedAgentClient';

export interface UseUnifiedAgentsReturn {
  // Agent management
  agents: UnifiedAgent[];
  agentsLoading: boolean;
  agentsError: string | null;
  refreshAgents: () => Promise<void>;
  
  // Filtered agent lists
  ollamaAgents: UnifiedAgent[];
  strandsAgents: UnifiedAgent[];
  a2aAgents: UnifiedAgent[];
  
  // Agent operations
  createAgent: (agentData: CreateAgentRequest) => Promise<UnifiedAgent>;
  deleteAgent: (agentId: string) => Promise<void>;
  
  // Message management
  messages: UnifiedMessage[];
  messagesLoading: boolean;
  messagesError: string | null;
  sendMessage: (fromAgentId: string, toAgentId: string, content: string) => Promise<void>;
  refreshMessages: (agentId?: string) => Promise<void>;
  
  // Health status
  isHealthy: boolean;
  checkHealth: () => Promise<void>;
}

export const useUnifiedAgents = (): UseUnifiedAgentsReturn => {
  // Agent state
  const [agents, setAgents] = useState<UnifiedAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  
  // Filtered agent lists
  const [ollamaAgents, setOllamaAgents] = useState<UnifiedAgent[]>([]);
  const [strandsAgents, setStrandsAgents] = useState<UnifiedAgent[]>([]);
  const [a2aAgents, setA2aAgents] = useState<UnifiedAgent[]>([]);
  
  // Message state
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  
  // Health status
  const [isHealthy, setIsHealthy] = useState(false);

  // Health check
  const checkHealth = useCallback(async () => {
    try {
      const healthy = await unifiedAgentClient.checkHealth();
      setIsHealthy(healthy);
    } catch (error) {
      setIsHealthy(false);
    }
  }, []);

  // Refresh all agents
  const refreshAgents = useCallback(async () => {
    try {
      setAgentsLoading(true);
      setAgentsError(null);
      
      const [allAgents, ollama, strands, a2a] = await Promise.all([
        unifiedAgentClient.getAgents(),
        unifiedAgentClient.getOllamaAgents(),
        unifiedAgentClient.getStrandsAgents(),
        unifiedAgentClient.getA2AAgents()
      ]);
      
      setAgents(allAgents);
      setOllamaAgents(ollama);
      setStrandsAgents(strands);
      setA2aAgents(a2a);
      
    } catch (error) {
      setAgentsError(error instanceof Error ? error.message : 'Failed to fetch agents');
    } finally {
      setAgentsLoading(false);
    }
  }, []);

  // Create agent
  const createAgent = useCallback(async (agentData: CreateAgentRequest): Promise<UnifiedAgent> => {
    try {
      setAgentsError(null);
      const newAgent = await unifiedAgentClient.createAgent(agentData);
      await refreshAgents(); // Refresh the list
      return newAgent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create agent';
      setAgentsError(errorMessage);
      throw error;
    }
  }, [refreshAgents]);

  // Delete agent
  const deleteAgent = useCallback(async (agentId: string): Promise<void> => {
    try {
      setAgentsError(null);
      await unifiedAgentClient.deleteAgent(agentId);
      await refreshAgents(); // Refresh the list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete agent';
      setAgentsError(errorMessage);
      throw error;
    }
  }, [refreshAgents]);

  // Refresh messages
  const refreshMessages = useCallback(async (agentId?: string) => {
    try {
      setMessagesLoading(true);
      setMessagesError(null);
      const messagesData = await unifiedAgentClient.getMessages(agentId);
      setMessages(messagesData);
    } catch (error) {
      setMessagesError(error instanceof Error ? error.message : 'Failed to fetch messages');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (fromAgentId: string, toAgentId: string, content: string): Promise<void> => {
    try {
      setMessagesError(null);
      await unifiedAgentClient.sendMessage(fromAgentId, toAgentId, content);
      await refreshMessages(); // Refresh messages
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setMessagesError(errorMessage);
      throw error;
    }
  }, [refreshMessages]);

  // Load data on mount
  useEffect(() => {
    checkHealth();
    refreshAgents();
    refreshMessages();
  }, [checkHealth, refreshAgents, refreshMessages]);

  return {
    // Agent management
    agents,
    agentsLoading,
    agentsError,
    refreshAgents,
    
    // Filtered agent lists
    ollamaAgents,
    strandsAgents,
    a2aAgents,
    
    // Agent operations
    createAgent,
    deleteAgent,
    
    // Message management
    messages,
    messagesLoading,
    messagesError,
    sendMessage,
    refreshMessages,
    
    // Health status
    isHealthy,
    checkHealth,
  };
};

export default useUnifiedAgents;

