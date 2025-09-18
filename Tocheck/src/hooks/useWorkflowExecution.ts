/**
 * React Hook for Multi-Agent Workflow Execution
 * Manages workflow creation, execution, and real-time monitoring
 */

import { useState, useCallback, useRef } from 'react';
import { workflowExecutionService, WorkflowDefinition, WorkflowExecutionResult } from '@/lib/services/WorkflowExecutionService';

export interface WorkflowExecutionState {
  isExecuting: boolean;
  currentSession?: string;
  status?: string;
  currentNode?: string;
  stepsCompleted: number;
  result?: any;
  error?: string;
  executionPath: Array<{
    step_id: string;
    node_name: string;
    node_type: string;
    agent_id?: string;
    output: any;
    completed_at?: string;
  }>;
}

export interface UseWorkflowExecutionReturn {
  // State
  executionState: WorkflowExecutionState;
  availableAgents: Record<string, any>;
  workflowDefinitions: Record<string, any>;
  
  // Actions
  registerAgent: (agent: any) => Promise<void>;
  testAgent: (agentId: string) => Promise<any>;
  createWorkflow: (workflow: WorkflowDefinition) => Promise<string>;
  executeWorkflow: (workflowId: string, userInput: string) => Promise<void>;
  quickExecute: (agentIds: string[], userInput: string) => Promise<void>;
  stopExecution: () => void;
  clearResults: () => void;
  
  // Utilities
  refreshAgents: () => Promise<void>;
  refreshWorkflows: () => Promise<void>;
  autoRegisterOllamaAgents: (ollamaAgents: any[]) => Promise<{ registered: number; errors: string[] }>;
}

export const useWorkflowExecution = (): UseWorkflowExecutionReturn => {
  const [executionState, setExecutionState] = useState<WorkflowExecutionState>({
    isExecuting: false,
    stepsCompleted: 0,
    executionPath: []
  });
  
  const [availableAgents, setAvailableAgents] = useState<Record<string, any>>({});
  const [workflowDefinitions, setWorkflowDefinitions] = useState<Record<string, any>>({});
  
  const monitoringRef = useRef<boolean>(false);

  /**
   * Register an agent for workflow execution
   */
  const registerAgent = useCallback(async (agent: any) => {
    try {
      const registration = {
        agent_id: agent.id,
        name: agent.name,
        role: agent.role || 'Assistant',
        model: agent.model || 'llama3',
        capabilities: agent.capabilities || [],
        temperature: 0.7,
        max_tokens: 1000
      };

      await workflowExecutionService.registerAgent(registration);
      await refreshAgents(); // Refresh the list
    } catch (error) {
      console.error('Failed to register agent:', error);
      throw error;
    }
  }, []);

  /**
   * Test connection to an agent
   */
  const testAgent = useCallback(async (agentId: string) => {
    try {
      return await workflowExecutionService.testAgent(agentId);
    } catch (error) {
      console.error('Failed to test agent:', error);
      throw error;
    }
  }, []);

  /**
   * Create a workflow definition
   */
  const createWorkflow = useCallback(async (workflow: WorkflowDefinition): Promise<string> => {
    try {
      const result = await workflowExecutionService.createWorkflow(workflow);
      await refreshWorkflows(); // Refresh the list
      return result.workflow_id;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  }, []);

  /**
   * Execute a workflow with real-time monitoring
   */
  const executeWorkflow = useCallback(async (workflowId: string, userInput: string) => {
    try {
      setExecutionState(prev => ({
        ...prev,
        isExecuting: true,
        status: 'starting',
        error: undefined,
        result: undefined,
        executionPath: []
      }));

      // Start execution
      const execution = await workflowExecutionService.executeWorkflow(workflowId, userInput);
      
      setExecutionState(prev => ({
        ...prev,
        currentSession: execution.session_id,
        status: 'running'
      }));

      // Start monitoring
      monitoringRef.current = true;
      
      workflowExecutionService.monitorWorkflowExecution(
        execution.session_id,
        // Status updates
        (status) => {
          if (!monitoringRef.current) return;
          
          setExecutionState(prev => ({
            ...prev,
            status: status.status,
            currentNode: status.current_node,
            stepsCompleted: status.steps_completed
          }));
        },
        // Completion
        (result) => {
          monitoringRef.current = false;
          
          setExecutionState(prev => ({
            ...prev,
            isExecuting: false,
            status: 'completed',
            result: result.result,
            executionPath: result.execution_path || []
          }));
        },
        // Error
        (error) => {
          monitoringRef.current = false;
          
          setExecutionState(prev => ({
            ...prev,
            isExecuting: false,
            status: 'error',
            error
          }));
        }
      );

    } catch (error) {
      setExecutionState(prev => ({
        ...prev,
        isExecuting: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  /**
   * Quick execute a linear workflow
   */
  const quickExecute = useCallback(async (agentIds: string[], userInput: string) => {
    try {
      setExecutionState(prev => ({
        ...prev,
        isExecuting: true,
        status: 'executing',
        error: undefined,
        result: undefined,
        executionPath: []
      }));

      const result = await workflowExecutionService.quickExecuteWorkflow(agentIds, userInput);
      
      setExecutionState(prev => ({
        ...prev,
        isExecuting: false,
        status: result.status,
        result: result.result,
        error: result.error,
        executionPath: result.execution_path || [],
        currentSession: result.session_id
      }));

    } catch (error) {
      setExecutionState(prev => ({
        ...prev,
        isExecuting: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  /**
   * Stop workflow execution
   */
  const stopExecution = useCallback(() => {
    monitoringRef.current = false;
    setExecutionState(prev => ({
      ...prev,
      isExecuting: false,
      status: 'cancelled'
    }));
  }, []);

  /**
   * Clear execution results
   */
  const clearResults = useCallback(() => {
    setExecutionState({
      isExecuting: false,
      stepsCompleted: 0,
      executionPath: []
    });
  }, []);

  /**
   * Refresh available agents
   */
  const refreshAgents = useCallback(async () => {
    try {
      const agents = await workflowExecutionService.getAvailableAgents();
      setAvailableAgents(agents.agents || {});
    } catch (error) {
      console.error('Failed to refresh agents:', error);
    }
  }, []);

  /**
   * Refresh workflow definitions
   */
  const refreshWorkflows = useCallback(async () => {
    try {
      const workflows = await workflowExecutionService.getWorkflowDefinitions();
      setWorkflowDefinitions(workflows.workflows || {});
    } catch (error) {
      console.error('Failed to refresh workflows:', error);
    }
  }, []);

  /**
   * Auto-register Ollama agents for workflow execution
   */
  const autoRegisterOllamaAgents = useCallback(async (ollamaAgents: any[]) => {
    try {
      return await workflowExecutionService.autoRegisterOllamaAgents(ollamaAgents);
    } catch (error) {
      console.error('Failed to auto-register agents:', error);
      throw error;
    }
  }, []);

  return {
    // State
    executionState,
    availableAgents,
    workflowDefinitions,
    
    // Actions
    registerAgent,
    testAgent,
    createWorkflow,
    executeWorkflow,
    quickExecute,
    stopExecution,
    clearResults,
    
    // Utilities
    refreshAgents,
    refreshWorkflows,
    autoRegisterOllamaAgents
  };
};