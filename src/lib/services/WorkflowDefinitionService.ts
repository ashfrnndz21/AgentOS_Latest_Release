/**
 * Workflow Definition Service
 * Handles drag-and-drop workflow creation and A2A integration
 */

export interface WorkflowNode {
  id: string;
  type: 'agent' | 'connection' | 'gateway' | 'decision' | 'aggregator';
  agentId?: string; // For agent nodes
  position: { x: number; y: number };
  data: {
    label: string;
    status: 'idle' | 'running' | 'completed' | 'error';
    config?: any;
  };
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  type: 'a2a' | 'data' | 'control';
  config: {
    messageType?: 'request' | 'response' | 'notification';
    timeout?: number;
    retryCount?: number;
    conditions?: string[];
  };
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  metadata: {
    created_at: string;
    updated_at: string;
    version: string;
    author: string;
  };
}

export interface A2AWorkflowStep {
  stepId: string;
  agentId: string;
  action: 'send_message' | 'wait_response' | 'process_data' | 'coordinate';
  config: {
    message?: string;
    targetAgent?: string;
    timeout?: number;
    conditions?: string[];
  };
  dependencies: string[]; // Other step IDs this depends on
}

class WorkflowDefinitionService {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private currentWorkflowId: string | null = null;

  /**
   * Create a new workflow
   */
  createWorkflow(name: string, description: string): WorkflowDefinition {
    const id = `workflow_${Date.now()}`;
    const workflow: WorkflowDefinition = {
      id,
      name,
      description,
      nodes: [],
      connections: [],
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: '1.0.0',
        author: 'user'
      }
    };
    
    this.workflows.set(id, workflow);
    this.currentWorkflowId = id;
    return workflow;
  }

  /**
   * Add an agent node to the workflow
   */
  addAgentNode(workflowId: string, agentId: string, position: { x: number; y: number }): WorkflowNode {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const node: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: 'agent',
      agentId,
      position,
      data: {
        label: `Agent ${agentId}`,
        status: 'idle'
      }
    };

    workflow.nodes.push(node);
    workflow.metadata.updated_at = new Date().toISOString();
    return node;
  }

  /**
   * Add a connection between nodes
   */
  addConnection(
    workflowId: string, 
    sourceNodeId: string, 
    targetNodeId: string, 
    connectionType: 'a2a' | 'data' | 'control' = 'a2a',
    config: WorkflowConnection['config'] = {}
  ): WorkflowConnection {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const connection: WorkflowConnection = {
      id: `conn_${Date.now()}`,
      source: sourceNodeId,
      target: targetNodeId,
      type: connectionType,
      config: {
        messageType: 'request',
        timeout: 30,
        retryCount: 3,
        ...config
      }
    };

    workflow.connections.push(connection);
    workflow.metadata.updated_at = new Date().toISOString();
    return connection;
  }

  /**
   * Generate A2A workflow steps from the workflow definition
   */
  generateA2ASteps(workflowId: string): A2AWorkflowStep[] {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const steps: A2AWorkflowStep[] = [];
    const agentNodes = workflow.nodes.filter(node => node.type === 'agent');
    const connections = workflow.connections.filter(conn => conn.type === 'a2a');

    // Create a step for each agent node
    agentNodes.forEach((node, index) => {
      if (!node.agentId) return;

      const step: A2AWorkflowStep = {
        stepId: `step_${node.id}`,
        agentId: node.agentId,
        action: 'send_message',
        config: {
          message: `Execute task for ${node.data.label}`,
          timeout: 30
        },
        dependencies: []
      };

      // Find incoming connections to determine dependencies
      const incomingConnections = connections.filter(conn => conn.target === node.id);
      incomingConnections.forEach(conn => {
        const sourceNode = workflow.nodes.find(n => n.id === conn.source);
        if (sourceNode && sourceNode.agentId) {
          step.dependencies.push(`step_${sourceNode.id}`);
        }
      });

      steps.push(step);
    });

    return steps;
  }

  /**
   * Execute the workflow by sending A2A messages
   */
  async executeWorkflow(workflowId: string, initialMessage: string): Promise<{
    success: boolean;
    results: Array<{
      stepId: string;
      agentId: string;
      response: string;
      status: 'success' | 'error';
      responseTime: number;
    }>;
    executionLog: Array<{
      timestamp: string;
      stepId: string;
      event: string;
      details: string;
    }>;
  }> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const steps = this.generateA2ASteps(workflowId);
    const results: any[] = [];
    const executionLog: any[] = [];
    const startTime = Date.now();

    try {
      // Execute steps in dependency order
      const executedSteps = new Set<string>();
      const pendingSteps = [...steps];

      while (pendingSteps.length > 0) {
        const readySteps = pendingSteps.filter(step => 
          step.dependencies.every(dep => executedSteps.has(dep))
        );

        if (readySteps.length === 0) {
          throw new Error('Circular dependency detected in workflow');
        }

        // Execute ready steps in parallel
        const stepPromises = readySteps.map(async (step) => {
          const logEntry = {
            timestamp: new Date().toISOString(),
            stepId: step.stepId,
            event: 'STEP_START',
            details: `Starting execution of ${step.agentId}`
          };
          executionLog.push(logEntry);

          try {
            // Send message to A2A agent
            const response = await this.sendA2AMessage(step.agentId, step.config.message || initialMessage);
            
            const result = {
              stepId: step.stepId,
              agentId: step.agentId,
              response: response.message,
              status: 'success' as const,
              responseTime: response.responseTime
            };
            
            results.push(result);
            executedSteps.add(step.stepId);
            
            executionLog.push({
              timestamp: new Date().toISOString(),
              stepId: step.stepId,
              event: 'STEP_COMPLETE',
              details: `Completed execution of ${step.agentId}`
            });
            
            return result;
          } catch (error) {
            const result = {
              stepId: step.stepId,
              agentId: step.agentId,
              response: `Error: ${error}`,
              status: 'error' as const,
              responseTime: 0
            };
            
            results.push(result);
            executedSteps.add(step.stepId);
            
            executionLog.push({
              timestamp: new Date().toISOString(),
              stepId: step.stepId,
              event: 'STEP_ERROR',
              details: `Error in ${step.agentId}: ${error}`
            });
            
            return result;
          }
        });

        await Promise.all(stepPromises);
        
        // Remove executed steps from pending
        pendingSteps.splice(0, pendingSteps.length, 
          ...pendingSteps.filter(step => !executedSteps.has(step.stepId))
        );
      }

      return {
        success: true,
        results,
        executionLog
      };
    } catch (error) {
      return {
        success: false,
        results,
        executionLog: [
          ...executionLog,
          {
            timestamp: new Date().toISOString(),
            stepId: 'workflow',
            event: 'WORKFLOW_ERROR',
            details: `Workflow execution failed: ${error}`
          }
        ]
      };
    }
  }

  /**
   * Send message to A2A agent
   */
  private async sendA2AMessage(agentId: string, message: string): Promise<{
    message: string;
    responseTime: number;
  }> {
    // This would integrate with the A2A Agent Service
    // For now, simulate the response
    const startTime = Date.now();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    const responseTime = Date.now() - startTime;
    
    return {
      message: `Response from ${agentId}: ${message}`,
      responseTime
    };
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Update workflow
   */
  updateWorkflow(workflowId: string, updates: Partial<WorkflowDefinition>): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    Object.assign(workflow, updates);
    workflow.metadata.updated_at = new Date().toISOString();
  }

  /**
   * Delete workflow
   */
  deleteWorkflow(workflowId: string): void {
    this.workflows.delete(workflowId);
    if (this.currentWorkflowId === workflowId) {
      this.currentWorkflowId = null;
    }
  }
}

export const workflowDefinitionService = new WorkflowDefinitionService();











