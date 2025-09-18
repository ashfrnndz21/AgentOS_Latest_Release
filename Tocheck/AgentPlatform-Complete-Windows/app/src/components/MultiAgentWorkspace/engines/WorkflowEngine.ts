import { WorkflowNode, WorkflowEdge, WorkflowExecution, DataSchema } from '../types/orchestration';

export class WorkflowEngine {
  private workflows: Map<string, { nodes: WorkflowNode[]; edges: WorkflowEdge[] }> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();

  /**
   * Validate workflow before execution
   */
  validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for trigger nodes
    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger node');
    }

    // Check for terminal nodes
    const terminalNodes = nodes.filter(n => n.type === 'terminal');
    if (terminalNodes.length === 0) {
      errors.push('Workflow must have at least one terminal node');
    }

    // Check for orphaned nodes
    const connectedNodeIds = new Set([
      ...edges.map(e => e.source),
      ...edges.map(e => e.target)
    ]);
    
    const orphanedNodes = nodes.filter(n => 
      n.type !== 'trigger' && !connectedNodeIds.has(n.id)
    );
    
    if (orphanedNodes.length > 0) {
      errors.push(`Orphaned nodes found: ${orphanedNodes.map(n => n.label).join(', ')}`);
    }

    // Check for cycles (basic implementation)
    if (this.hasCycles(nodes, edges)) {
      errors.push('Workflow contains cycles that may cause infinite loops');
    }

    // Validate data flow compatibility
    const dataFlowErrors = this.validateDataFlow(nodes, edges);
    errors.push(...dataFlowErrors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(
    workflowId: string,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    initialData: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const validation = this.validateWorkflow(nodes, edges);
    if (!validation.isValid) {
      throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
    }

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      workflowId,
      status: 'running',
      startTime: Date.now(),
      context: { ...initialData },
      metrics: {
        startTime: Date.now(),
        tokensUsed: 0,
        cost: 0,
        errorCount: 0
      },
      errorLog: []
    };

    this.executions.set(execution.id, execution);

    try {
      // Find trigger nodes and start execution
      const triggerNodes = nodes.filter(n => n.type === 'trigger');
      
      for (const triggerNode of triggerNodes) {
        await this.executeNode(triggerNode, nodes, edges, execution);
      }

      execution.status = 'completed';
      execution.endTime = Date.now();
      execution.metrics.endTime = Date.now();
      execution.metrics.duration = execution.endTime - execution.startTime;

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = Date.now();
      execution.errorLog?.push(`Execution failed: ${error}`);
    }

    return execution;
  }

  /**
   * Execute individual node
   */
  private async executeNode(
    node: WorkflowNode,
    allNodes: WorkflowNode[],
    allEdges: WorkflowEdge[],
    execution: WorkflowExecution
  ): Promise<void> {
    execution.currentNode = node.id;
    node.status = 'running';

    try {
      // Simulate node execution based on type
      const result = await this.simulateNodeExecution(node, execution.context);
      
      // Update context with node output
      execution.context[`${node.id}_output`] = result;
      
      node.status = 'completed';

      // Find and execute next nodes
      const outgoingEdges = allEdges.filter(e => e.source === node.id);
      
      for (const edge of outgoingEdges) {
        const shouldExecute = this.evaluateEdgeCondition(edge, execution.context);
        
        if (shouldExecute) {
          const targetNode = allNodes.find(n => n.id === edge.target);
          if (targetNode) {
            // Apply data mapping if specified
            if (edge.dataMapping) {
              this.applyDataMapping(edge.dataMapping, execution.context);
            }
            
            await this.executeNode(targetNode, allNodes, allEdges, execution);
          }
        }
      }

    } catch (error) {
      node.status = 'failed';
      execution.metrics.errorCount++;
      execution.errorLog?.push(`Node ${node.label} failed: ${error}`);
      
      // Look for error handling edges
      const errorEdges = allEdges.filter(e => e.source === node.id && e.type === 'error');
      for (const errorEdge of errorEdges) {
        const errorHandler = allNodes.find(n => n.id === errorEdge.target);
        if (errorHandler) {
          execution.context[`${node.id}_error`] = error;
          await this.executeNode(errorHandler, allNodes, allEdges, execution);
        }
      }
    }
  }

  /**
   * Simulate node execution based on type
   */
  private async simulateNodeExecution(
    node: WorkflowNode,
    context: Record<string, any>
  ): Promise<any> {
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    switch (node.type) {
      case 'trigger':
        return { triggered: true, timestamp: Date.now() };
      
      case 'processor':
        return {
          processed: true,
          model: node.config.model || 'gpt-4',
          result: `Processed by ${node.label}`
        };
      
      case 'decision':
        return {
          decision: Math.random() > 0.5 ? 'true' : 'false',
          confidence: Math.random()
        };
      
      case 'integration':
        return {
          integrated: true,
          data: `External data from ${node.label}`
        };
      
      case 'terminal':
        return {
          completed: true,
          finalResult: context
        };
      
      default:
        return { executed: true };
    }
  }

  /**
   * Evaluate edge condition
   */
  private evaluateEdgeCondition(edge: WorkflowEdge, context: Record<string, any>): boolean {
    if (!edge.condition) return true;
    
    try {
      // Simple condition evaluation (in practice, use a proper expression parser)
      const condition = edge.condition.replace(/\$\{([^}]+)\}/g, (_, key) => {
        return JSON.stringify(this.getNestedValue(context, key));
      });
      
      return Function('"use strict"; return (' + condition + ')')();
    } catch {
      return false;
    }
  }

  /**
   * Apply data mapping
   */
  private applyDataMapping(mapping: any, context: Record<string, any>): void {
    const sourceValue = this.getNestedValue(context, mapping.sourceField);
    this.setNestedValue(context, mapping.targetField, sourceValue);
  }

  /**
   * Check for cycles in workflow
   */
  private hasCycles(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (dfs(edge.target)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id) && dfs(node.id)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate data flow between nodes
   */
  private validateDataFlow(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
    const errors: string[] = [];
    
    for (const edge of edges) {
      if (edge.type !== 'data') continue;
      
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) continue;
      
      // Check if output schema matches input schema
      if (sourceNode.outputSchema && targetNode.inputSchema) {
        const compatible = this.areSchemaCompatible(
          sourceNode.outputSchema,
          targetNode.inputSchema
        );
        
        if (!compatible) {
          errors.push(
            `Data flow incompatibility between ${sourceNode.label} and ${targetNode.label}`
          );
        }
      }
    }
    
    return errors;
  }

  /**
   * Check schema compatibility
   */
  private areSchemaCompatible(outputSchema: DataSchema, inputSchema: DataSchema): boolean {
    // Basic schema compatibility check
    return outputSchema.type === inputSchema.type;
  }

  /**
   * Helper to get nested object value
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Helper to set nested object value
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Get workflow execution status
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all executions for a workflow
   */
  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(exec => exec.workflowId === workflowId);
  }
}

export const workflowEngine = new WorkflowEngine();