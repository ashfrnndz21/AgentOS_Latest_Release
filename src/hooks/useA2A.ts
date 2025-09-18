import { useState, useEffect, useCallback, useRef } from 'react';
import { a2aClient, A2AAgent, A2AMessage, A2ARegistrationResult } from '@/lib/a2aClient';

export interface UseA2AReturn {
  // Agent management
  agents: A2AAgent[];
  agentsLoading: boolean;
  agentsError: string | null;
  refreshAgents: () => Promise<void>;
  
  // Message management
  messages: A2AMessage[];
  messagesLoading: boolean;
  messagesError: string | null;
  sendMessage: (fromAgentId: string, toAgentId: string, content: string) => Promise<void>;
  refreshMessages: (agentId?: string) => Promise<void>;
  
  // Real-time updates
  isConnected: boolean;
  connectionError: string | null;
  joinAgentRoom: (agentId: string) => void;
  leaveAgentRoom: (agentId: string) => void;
  
  // Strands integration
  strandsAgents: A2AAgent[];
  strandsAgentsLoading: boolean;
  refreshStrandsAgents: () => Promise<void>;
  sendStrandsMessage: (fromAgentId: string, toAgentId: string, content: string) => Promise<void>;
  
  // Main system integration
  mainSystemAgents: A2AAgent[];
  mainSystemAgentsLoading: boolean;
  refreshMainSystemAgents: () => Promise<void>;
  
  // Agent deletion
  deleteAgent: (agentId: string) => Promise<void>;
  
  // Health status
  healthStatus: 'healthy' | 'unhealthy' | 'checking';
  checkHealth: () => Promise<void>;
}

export const useA2A = (): UseA2AReturn => {
  // Agent state
  const [agents, setAgents] = useState<A2AAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  
  // Message state
  const [messages, setMessages] = useState<A2AMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  
  // Real-time connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Strands integration state
  const [strandsAgents, setStrandsAgents] = useState<A2AAgent[]>([]);
  const [strandsAgentsLoading, setStrandsAgentsLoading] = useState(false);
  
  // Main system agents state
  const [mainSystemAgents, setMainSystemAgents] = useState<A2AAgent[]>([]);
  const [mainSystemAgentsLoading, setMainSystemAgentsLoading] = useState(false);
  
  // Health status
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');
  
  // Refs for cleanup
  const wsConnectionRef = useRef<WebSocket | null>(null);
  const messageHandlerRef = useRef<((message: A2AMessage) => void) | null>(null);

  // Health check
  const checkHealth = useCallback(async () => {
    try {
      setHealthStatus('checking');
      await a2aClient.checkHealth();
      setHealthStatus('healthy');
      setConnectionError(null);
    } catch (error) {
      setHealthStatus('unhealthy');
      setConnectionError(error instanceof Error ? error.message : 'Health check failed');
    }
  }, []);

  // Agent management
  const refreshAgents = useCallback(async () => {
    try {
      setAgentsLoading(true);
      setAgentsError(null);
      const agentsData = await a2aClient.getAgents();
      setAgents(agentsData);
    } catch (error) {
      setAgentsError(error instanceof Error ? error.message : 'Failed to fetch agents');
    } finally {
      setAgentsLoading(false);
    }
  }, []);

  // Message management
  const refreshMessages = useCallback(async (agentId?: string) => {
    try {
      setMessagesLoading(true);
      setMessagesError(null);
      const messagesData = await a2aClient.getMessageHistory(agentId);
      setMessages(messagesData);
    } catch (error) {
      setMessagesError(error instanceof Error ? error.message : 'Failed to fetch messages');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (fromAgentId: string, toAgentId: string, content: string) => {
    try {
      setMessagesError(null);
      const newMessage = await a2aClient.sendMessage(fromAgentId, toAgentId, content);
      setMessages(prev => [newMessage, ...prev]);
    } catch (error) {
      setMessagesError(error instanceof Error ? error.message : 'Failed to send message');
      throw error;
    }
  }, []);

  // Strands integration
  const refreshStrandsAgents = useCallback(async () => {
    try {
      setStrandsAgentsLoading(true);
      // Get ALL Strands agents (not just A2A ones)
      const response = await fetch('http://localhost:5006/api/strands-sdk/agents');
      if (response.ok) {
        const data = await response.json();
        // Transform Strands agents to A2A format
        const transformedAgents = data.agents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          description: agent.description || '',
          model: agent.model_id || 'unknown',
          capabilities: agent.tools || [],
          status: agent.status === 'active' ? 'active' : 'inactive',
          registered_at: agent.created_at,
          last_seen: agent.updated_at,
          framework: 'Strands SDK',
          strands_agent: true,
          a2a_enabled: false // Will be determined by A2A registration
        }));
        
        // Mark agents as A2A enabled if they exist in A2A service
        // This is a simple check - in production you'd want to cross-reference IDs
        const a2aEnabledNames = ['Integration Test Agent', 'A2A Test Agent', 'Test Agent', 'Debug Test Agent'];
        transformedAgents.forEach(agent => {
          if (a2aEnabledNames.includes(agent.name)) {
            agent.a2a_enabled = true;
          }
        });
        setStrandsAgents(transformedAgents);
      }
    } catch (error) {
      console.error('Failed to fetch Strands agents:', error);
    } finally {
      setStrandsAgentsLoading(false);
    }
  }, []);

  const refreshMainSystemAgents = useCallback(async () => {
    try {
      setMainSystemAgentsLoading(true);
      const response = await fetch('http://localhost:5002/api/agents/ollama');
      if (response.ok) {
        const agentsData = await response.json();
        // Transform main system agents to A2A format
        const transformedAgents = agentsData.agents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          description: agent.description || '',
          model: agent.model?.model_id || 'unknown',
          capabilities: agent.expertise ? agent.expertise.split(', ') : [],
          status: 'active', // Main system agents are always active
          registered_at: agent.created_at,
          last_seen: agent.updated_at,
          framework: agent.role || 'Main System',
          main_system_agent: true
        }));
        setMainSystemAgents(transformedAgents);
      }
    } catch (error) {
      console.error('Failed to fetch main system agents:', error);
    } finally {
      setMainSystemAgentsLoading(false);
    }
  }, []);

  // Delete agent from all systems
  const deleteAgent = useCallback(async (agentId: string) => {
    try {
      console.log(`[Delete Agent] Deleting agent: ${agentId}`);
      
      // Get all agents to find the right IDs for each system
      const allAgents = [...agents, ...strandsAgents, ...mainSystemAgents];
      const agent = allAgents.find(a => a.id === agentId);
      
      if (!agent) {
        throw new Error('Agent not found');
      }
      
      const deletePromises = [];
      
      // Delete from A2A service (use original A2A ID if available)
      const a2aId = agent.a2a_agent_id || agentId;
      deletePromises.push(
        fetch(`http://localhost:5008/api/a2a/agents/${a2aId}`, {
          method: 'DELETE'
        }).catch(e => console.log('A2A delete failed:', e))
      );
      
      // Delete from main Ollama system
      deletePromises.push(
        fetch(`http://localhost:5002/api/agents/ollama/${agentId}`, {
          method: 'DELETE'
        }).catch(e => console.log('Ollama delete failed:', e))
      );
      
      // Delete from Strands SDK (skip if service is down)
      deletePromises.push(
        fetch(`http://localhost:5006/api/strands-sdk/agents/${agentId}`, {
          method: 'DELETE',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        }).catch(e => {
          console.log('Strands delete skipped (service down):', e.message);
          return Promise.resolve(); // Don't fail the whole operation
        })
      );
      
      // Execute all deletions in parallel
      await Promise.all(deletePromises);
      
      // Refresh all agent lists
      await Promise.all([
        refreshAgents(),
        refreshStrandsAgents(),
        refreshMainSystemAgents()
      ]);
      
      console.log(`[Delete Agent] Successfully deleted: ${agentId}`);
      
    } catch (error) {
      console.error('Failed to delete agent:', error);
      throw error;
    }
  }, [agents, strandsAgents, mainSystemAgents, refreshAgents, refreshStrandsAgents, refreshMainSystemAgents]);

  const sendStrandsMessage = useCallback(async (fromAgentId: string, toAgentId: string, content: string) => {
    try {
      setMessagesError(null);
      const result = await a2aClient.sendStrandsA2AMessage(fromAgentId, toAgentId, content);
      
      // Refresh messages to get the new one
      await refreshMessages();
      
      return result;
    } catch (error) {
      setMessagesError(error instanceof Error ? error.message : 'Failed to send Strands message');
      throw error;
    }
  }, [refreshMessages]);

  // Real-time connection management
  const joinAgentRoom = useCallback((agentId: string) => {
    a2aClient.joinAgentRoom(agentId);
  }, []);

  const leaveAgentRoom = useCallback((agentId: string) => {
    a2aClient.leaveAgentRoom(agentId);
  }, []);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: A2AMessage) => {
    setMessages(prev => [message, ...prev]);
  }, []);

  const handleWebSocketError = useCallback((error: Event) => {
    console.error('A2A WebSocket error:', error);
    setConnectionError('WebSocket connection error');
    setIsConnected(false);
  }, []);

  // Initialize connection and data
  useEffect(() => {
    // Check health and load initial data
    checkHealth();
    refreshAgents();
    refreshStrandsAgents();
    refreshMainSystemAgents();
    refreshMessages();

    // Set up WebSocket connection
    messageHandlerRef.current = handleWebSocketMessage;
    a2aClient.connectWebSocket(handleWebSocketMessage, handleWebSocketError);
    setIsConnected(true);

    // Cleanup on unmount
    return () => {
      a2aClient.disconnectWebSocket();
      setIsConnected(false);
    };
  }, [checkHealth, refreshAgents, refreshStrandsAgents, refreshMessages, handleWebSocketMessage, handleWebSocketError]);

  // Update connection status based on health
  useEffect(() => {
    if (healthStatus === 'healthy') {
      setIsConnected(true);
      setConnectionError(null);
    } else if (healthStatus === 'unhealthy') {
      setIsConnected(false);
    }
  }, [healthStatus]);

  return {
    // Agent management
    agents,
    agentsLoading,
    agentsError,
    refreshAgents,
    
    // Message management
    messages,
    messagesLoading,
    messagesError,
    sendMessage,
    refreshMessages,
    
    // Real-time updates
    isConnected,
    connectionError,
    joinAgentRoom,
    leaveAgentRoom,
    
    // Strands integration
    strandsAgents,
    strandsAgentsLoading,
    refreshStrandsAgents,
    sendStrandsMessage,
    
    // Main system integration
    mainSystemAgents,
    mainSystemAgentsLoading,
    refreshMainSystemAgents,
    
    // Agent deletion
    deleteAgent,
    
    // Health status
    healthStatus,
    checkHealth,
  };
};

export default useA2A;
