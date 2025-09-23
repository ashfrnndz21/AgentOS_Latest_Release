/**
 * A2A Workflow Orchestrator
 * Handles A2A workflow creation and management
 */

export interface A2AWorkflow {
  id: string;
  name: string;
  description: string;
  connections: A2AConnection[];
  createdAt: string;
  updatedAt: string;
}

export interface A2AConnection {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  messageType: string;
  condition?: string;
}

class A2AWorkflowOrchestrator {
  private workflows: Map<string, A2AWorkflow> = new Map();

  createWorkflow(name: string, description: string): string {
    const id = `a2a_workflow_${Date.now()}`;
    const workflow: A2AWorkflow = {
      id,
      name,
      description,
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.workflows.set(id, workflow);
    return id;
  }

  getWorkflow(id: string): A2AWorkflow | undefined {
    return this.workflows.get(id);
  }

  getAllWorkflows(): A2AWorkflow[] {
    return Array.from(this.workflows.values());
  }

  addConnection(workflowId: string, connection: Omit<A2AConnection, 'id'>): string {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const connectionId = `connection_${Date.now()}`;
    const newConnection: A2AConnection = {
      id: connectionId,
      ...connection
    };

    workflow.connections.push(newConnection);
    workflow.updatedAt = new Date().toISOString();
    
    return connectionId;
  }

  removeConnection(workflowId: string, connectionId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    const initialLength = workflow.connections.length;
    workflow.connections = workflow.connections.filter(conn => conn.id !== connectionId);
    workflow.updatedAt = new Date().toISOString();
    
    return workflow.connections.length < initialLength;
  }

  updateWorkflow(id: string, updates: Partial<Pick<A2AWorkflow, 'name' | 'description'>>): boolean {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      return false;
    }

    Object.assign(workflow, updates);
    workflow.updatedAt = new Date().toISOString();
    
    return true;
  }

  deleteWorkflow(id: string): boolean {
    return this.workflows.delete(id);
  }
}

export const a2aWorkflowOrchestrator = new A2AWorkflowOrchestrator();