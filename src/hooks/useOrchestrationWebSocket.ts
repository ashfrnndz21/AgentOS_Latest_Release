import { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface OrchestrationEvent {
  type: string;
  payload: any;
  timestamp: string;
  session_id?: string;
}

interface AgentConversation {
  agent_id: string;
  agent_name: string;
  question: string;
  llm_response: string;
  execution_time: number;
  tools_available: string[];
  timestamp: string;
}

interface OrchestrationStep {
  step_type: string;
  timestamp: string;
  elapsed_seconds: number;
  details: any;
}

export const useOrchestrationWebSocket = (orchestrationServiceUrl: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<OrchestrationEvent | null>(null);
  const [orchestrationSteps, setOrchestrationSteps] = useState<OrchestrationStep[]>([]);
  const [agentConversations, setAgentConversations] = useState<AgentConversation[]>([]);
  const [orchestrationComplete, setOrchestrationComplete] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('WebSocket already connected.');
      return;
    }

    console.log(`Attempting to connect to WebSocket at ${orchestrationServiceUrl}`);
    const socket = io(orchestrationServiceUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected!');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected.');
      setIsConnected(false);
    });

    // Handle orchestration status updates
    socket.on('orchestration_status', (data: OrchestrationEvent) => {
      console.log('Received orchestration status:', data);
      setLastEvent(data);
    });

    // Handle real-time orchestration steps
    socket.on('orchestration_step', (data: OrchestrationEvent) => {
      console.log('Received orchestration step:', data);
      setLastEvent(data);
      if (data.payload) {
        setOrchestrationSteps(prev => [...prev, data.payload]);
      }
    });

    // Handle agent conversations with LLM responses
    socket.on('agent_conversation', (data: OrchestrationEvent) => {
      console.log('Received agent conversation:', data);
      setLastEvent(data);
      if (data.payload) {
        setAgentConversations(prev => [...prev, data.payload]);
      }
    });

    // Handle orchestration completion
    socket.on('orchestration_complete', (data: OrchestrationEvent) => {
      console.log('Received orchestration complete:', data);
      setLastEvent(data);
      setOrchestrationComplete(data.payload);
    });

    socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current = socket;
  }, [orchestrationServiceUrl]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting WebSocket.');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const joinOrchestrationSession = useCallback((sessionId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join_orchestration', { session_id: sessionId });
    }
  }, []);

  const clearOrchestrationData = useCallback(() => {
    setOrchestrationSteps([]);
    setAgentConversations([]);
    setOrchestrationComplete(null);
  }, []);

  useEffect(() => {
    // Initial connection attempt
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { 
    isConnected, 
    lastEvent, 
    orchestrationSteps,
    agentConversations,
    orchestrationComplete,
    connect, 
    disconnect,
    joinOrchestrationSession,
    clearOrchestrationData
  };
};