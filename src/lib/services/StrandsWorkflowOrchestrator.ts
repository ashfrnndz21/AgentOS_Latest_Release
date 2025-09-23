import { Node, Edge, Connection } from '@xyflow/react';
import { PaletteAgent } from '@/hooks/useOllamaAgentsForPalette';
import { MCPTool } from '@/lib/services/MCPGatewayService';

// Core workflow types
export interface WorkflowContext {
  conversationHistory: any[];
  currentData: any;
  userPreferences: Record<string, any>;
  executionState: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  metadata: Record<string, any>;
}

export interface StrandsWorkflowNode extends Node {
  type: 'strands-agent' | 'strands-tool' | 'strands-decision' | 'strands-handoff' | 'strands-output' | 'strands-chat-interface';
  data: {
    // Common properties
    id: string;
    name: string;
    description?: string;
    
    // Agent-specific properties
    agent?: PaletteAgent;
    strandsConfig?: StrandsAgentConfig;
    
    // Tool-specific properties
    tool?: MCPTool;
    toolConfig?: ToolConfiguration;
    
    // Decision-specific properties
    decisionLogic?: DecisionConfiguration;
    
    // Execution state
    status: 'idle' | 'running' | 'completed' | 'error';
    lastExecution?: ExecutionResult;
    
    // Visual properties
    icon?: string;
    color?: string;
    badge?: string;
  };
}

export interface StrandsAgentConfig {
  reasoningPattern: 'sequential' | 'parallel' | 'conditional' | 'adaptive';
  contextManagement: {
    preserveMemory: boolean;
    compressionLevel: 'none' | 'summary' | 'key_points';
    maxContextLength: number;
  };
  toolAccess: {
    allowedTools: string[];
    toolSelectionStrategy: 'automatic' | 'explicit' | 'user_choice';
  };
  handoffStrategy: {
    contextTransfer: 'full' | 'compressed' | 'selective';
    expertiseMatching: boolean;
    loadBalancing: boolean;
  };
}

export interface ToolConfiguration {
  connectionSettings: Record<string, any>;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  errorHandling: {
    retryCount: number;
    fallbackAction: 'skip' | 'error' | 'alternative_tool';
  };
}

export interface DecisionConfiguration {
  type: 'rule_based' | 'ml_based' | 'agent_based' | 'hybrid';
  conditions: DecisionCondition[];
  confidenceThreshold: number;
  fallbackPath: string;
}

export interface DecisionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
  value: any;
  weight: number;
}

export interface ExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  executionTime: number;
  tokensUsed?: number;
  toolsUsed: string[];
  confidence?: number;
  metadata: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'error' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentNode?: string;
  executionPath: string[];
  results: Record<string, ExecutionResult>;
  context: WorkflowContext;
  metrics: ExecutionMetrics;
}

export interface ExecutionMetrics {
  totalExecutionTime: number;
  nodeExecutionTimes: Record<string, number>;
  totalTokensUsed: number;
  toolsUsed: string[];
  errorCount: number;
  successRate: number;
}

export interface NodeSuggestion {
  nodeType: string;
  name: string;
  description: string;
  confidence: number;
  reasoning: string;
  suggestedConfig?: any;
}

export interface ConnectionSuggestion {
  sourceNodeId: string;
  targetNodeId: string;
  confidence: number;
  reasoning: string;
  suggestedConditions?: any;
}

export class StrandsWorkflowOrchestrator {
  private workflows: Map<string, { nodes: StrandsWorkflowNode[], edges: Edge[] }> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private templates: Map<string, WorkflowTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  // Workflow Creation and Management
  createWorkflow(name: string, description?: string): string {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.workflows.set(workflowId, { nodes: [], edges: [] });
    return workflowId;
  }

  // Node Creation from Agent Palette
  createAgentNode(agent: PaletteAgent, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-agent',
      position,
      data: {
        id: nodeId,
        name: agent.name,
        description: agent.description,
        agent,
        strandsConfig: this.generateDefaultStrandsConfig(agent),
        status: 'idle',
        icon: agent.icon,
        color: this.getAgentColor(agent.role),
        badge: agent.guardrails ? 'Protected' : 'Basic'
      }
    };
  }

  // Tool Node Creation
  createToolNode(tool: MCPTool, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-tool',
      position,
      data: {
        id: nodeId,
        name: tool.name,
        description: tool.description,
        tool,
        toolConfig: this.generateDefaultToolConfig(tool),
        status: 'idle',
        icon: this.getToolIcon(tool.category),
        color: this.getToolColor(tool.category)
      }
    };
  }

  // Strands Native Tool Node Creation
  createStrandsToolNode(tool: any, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `strands_tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-tool',
      position,
      data: {
        id: nodeId,
        name: tool.name,
        description: tool.description,
        tool,
        toolConfig: {
          enabled: true,
          parameters: {},
          category: tool.category,
          complexity: tool.complexity,
          requiresApi: tool.requiresApi
        },
        status: 'idle',
        icon: this.getToolIcon(tool.category),
        color: tool.color || this.getToolColor(tool.category)
      }
    };
  }

  // External Tool Node Creation
  createExternalToolNode(tool: any, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `external_tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-tool',
      position,
      data: {
        id: nodeId,
        name: tool.name,
        description: tool.description,
        tool,
        toolConfig: {
          enabled: true,
          parameters: {},
          category: tool.category,
          apiConfig: tool.apiConfig,
          requiresApi: tool.requiresApi
        },
        status: 'idle',
        icon: this.getToolIcon(tool.category),
        color: tool.color || this.getToolColor(tool.category)
      }
    };
  }

  // Decision Node Creation
  createDecisionNode(name: string, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-decision',
      position,
      data: {
        id: nodeId,
        name,
        description: 'Intelligent decision point with Strands reasoning',
        decisionLogic: {
          type: 'rule_based',
          conditions: [],
          confidenceThreshold: 0.8,
          fallbackPath: 'default'
        },
        status: 'idle',
        icon: '🤔',
        color: '#f59e0b'
      }
    };
  }

  // Handoff Node Creation
  createHandoffNode(name: string, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `handoff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-handoff',
      position,
      data: {
        id: nodeId,
        name,
        description: 'Smart agent handoff with context transfer',
        status: 'idle',
        icon: '🔄',
        color: '#3b82f6'
      }
    };
  }

  // Human Node Creation
  createHumanNode(name: string, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `human_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-human',
      position,
      data: {
        id: nodeId,
        name,
        description: 'Human-in-the-loop input collection',
        status: 'idle',
        icon: '👤',
        color: '#f97316'
      }
    };
  }

  // Memory Node Creation
  createMemoryNode(name: string, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-memory',
      position,
      data: {
        id: nodeId,
        name,
        description: 'Shared memory and context storage',
        status: 'idle',
        icon: '🧠',
        color: '#10b981'
      }
    };
  }

  // Guardrail Node Creation
  createGuardrailNode(name: string, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `guardrail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-guardrail',
      position,
      data: {
        id: nodeId,
        name,
        description: 'Safety and compliance validation',
        status: 'idle',
        icon: '🛡️',
        color: '#dc2626'
      }
    };
  }

  // Aggregator Node Creation
  createAggregatorNode(name: string, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `aggregator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-aggregator',
      position,
      data: {
        id: nodeId,
        name,
        description: 'Multi-agent response aggregation',
        status: 'idle',
        icon: '🔀',
        color: '#8b5cf6'
      }
    };
  }

  // Monitor Node Creation
  createMonitorNode(name: string, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-monitor',
      position,
      data: {
        id: nodeId,
        name,
        description: 'Performance and behavior monitoring',
        status: 'idle',
        icon: '👁️',
        color: '#06b6d4'
      }
    };
  }

  // Chat Interface Node Creation
  createChatInterfaceNode(chatConfig: any, position: { x: number, y: number }): StrandsWorkflowNode {
    const nodeId = `chat_interface_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: nodeId,
      type: 'strands-chat-interface',
      position,
      data: {
        id: nodeId,
        name: chatConfig.name || 'Chat Interface',
        chatConfig,
        isConfigured: true,
        // Additional properties for compatibility
        description: 'Interactive chat interface for workflow communication',
        status: 'idle',
        icon: '💬',
        color: '#6366f1'
      }
    };
  }

  // Intelligent Node Suggestions
  suggestNextNodes(currentNode: StrandsWorkflowNode, context: WorkflowContext): NodeSuggestion[] {
    const suggestions: NodeSuggestion[] = [];

    if (currentNode.type === 'strands-agent') {
      // Suggest tools based on agent capabilities
      if (currentNode.data.agent?.capabilities.includes('Analysis')) {
        suggestions.push({
          nodeType: 'strands-tool',
          name: 'Database Query Tool',
          description: 'Query databases for analysis data',
          confidence: 0.9,
          reasoning: 'Analysis agents typically need data from databases'
        });
      }

      // Suggest decision points
      suggestions.push({
        nodeType: 'strands-decision',
        name: 'Quality Check',
        description: 'Validate agent output quality',
        confidence: 0.8,
        reasoning: 'Quality validation is recommended after agent processing'
      });

      // Suggest handoff to specialist agents
      suggestions.push({
        nodeType: 'strands-handoff',
        name: 'Specialist Handoff',
        description: 'Transfer to specialist agent',
        confidence: 0.7,
        reasoning: 'Complex tasks often require specialist expertise'
      });
    }

    if (currentNode.type === 'strands-tool') {
      // Suggest agents to process tool results
      suggestions.push({
        nodeType: 'strands-agent',
        name: 'Result Processor',
        description: 'Process and analyze tool results',
        confidence: 0.85,
        reasoning: 'Tool outputs typically need agent processing'
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Connection Validation
  validateConnection(source: StrandsWorkflowNode, target: StrandsWorkflowNode): { valid: boolean, reason?: string } {
    // Agent to Tool connections
    if (source.type === 'strands-agent' && target.type === 'strands-tool') {
      return { valid: true };
    }

    // Tool to Agent connections
    if (source.type === 'strands-tool' && target.type === 'strands-agent') {
      return { valid: true };
    }

    // Agent to Decision connections
    if (source.type === 'strands-agent' && target.type === 'strands-decision') {
      return { valid: true };
    }

    // Decision to Agent connections
    if (source.type === 'strands-decision' && target.type === 'strands-agent') {
      return { valid: true };
    }

    // Invalid connections
    if (source.type === 'strands-tool' && target.type === 'strands-tool') {
      return { valid: false, reason: 'Tools cannot connect directly to other tools' };
    }

    return { valid: true };
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, initialInput: any): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      startTime: new Date(),
      executionPath: [],
      results: {},
      context: {
        conversationHistory: [],
        currentData: initialInput,
        userPreferences: {},
        executionState: 'running',
        metadata: {}
      },
      metrics: {
        totalExecutionTime: 0,
        nodeExecutionTimes: {},
        totalTokensUsed: 0,
        toolsUsed: [],
        errorCount: 0,
        successRate: 0
      }
    };

    this.executions.set(executionId, execution);

    try {
      await this.executeWorkflowNodes(workflow, execution);
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.metrics.totalExecutionTime = execution.endTime.getTime() - execution.startTime.getTime();
    } catch (error) {
      execution.status = 'error';
      execution.endTime = new Date();
      console.error('Workflow execution failed:', error);
    }

    return execution;
  }

  private async executeWorkflowNodes(
    workflow: { nodes: StrandsWorkflowNode[], edges: Edge[] }, 
    execution: WorkflowExecution
  ): Promise<void> {
    // Find entry point (node with no incoming edges)
    const entryNodes = workflow.nodes.filter(node => 
      !workflow.edges.some(edge => edge.target === node.id)
    );

    if (entryNodes.length === 0) {
      throw new Error('No entry point found in workflow');
    }

    // Execute from entry point
    for (const entryNode of entryNodes) {
      await this.executeNode(entryNode, workflow, execution);
    }
  }

  private async executeNode(
    node: StrandsWorkflowNode, 
    workflow: { nodes: StrandsWorkflowNode[], edges: Edge[] },
    execution: WorkflowExecution
  ): Promise<void> {
    const startTime = Date.now();
    execution.executionPath.push(node.id);
    execution.currentNode = node.id;

    try {
      let result: ExecutionResult;

      switch (node.type) {
        case 'strands-agent':
          result = await this.executeAgentNode(node, execution.context);
          break;
        case 'strands-tool':
          result = await this.executeToolNode(node, execution.context);
          break;
        case 'strands-decision':
          result = await this.executeDecisionNode(node, execution.context);
          break;
        default:
          result = {
            success: true,
            output: execution.context.currentData,
            executionTime: 0,
            toolsUsed: [],
            metadata: {}
          };
      }

      execution.results[node.id] = result;
      execution.metrics.nodeExecutionTimes[node.id] = Date.now() - startTime;
      
      if (result.tokensUsed) {
        execution.metrics.totalTokensUsed += result.tokensUsed;
      }
      
      execution.metrics.toolsUsed.push(...result.toolsUsed);

      if (result.success) {
        execution.context.currentData = result.output;
        
        // Find and execute next nodes
        const nextEdges = workflow.edges.filter(edge => edge.source === node.id);
        for (const edge of nextEdges) {
          const nextNode = workflow.nodes.find(n => n.id === edge.target);
          if (nextNode) {
            await this.executeNode(nextNode, workflow, execution);
          }
        }
      } else {
        execution.metrics.errorCount++;
        throw new Error(`Node ${node.id} execution failed: ${result.error}`);
      }

    } catch (error) {
      execution.metrics.errorCount++;
      throw error;
    }
  }

  private async executeAgentNode(node: StrandsWorkflowNode, context: WorkflowContext): Promise<ExecutionResult> {
    // Simulate agent execution - integrate with your existing agent services
    const startTime = Date.now();
    
    try {
      // This would integrate with your OllamaAgentService
      const agentResult = {
        success: true,
        output: `Processed by ${node.data.name}: ${JSON.stringify(context.currentData)}`,
        executionTime: Date.now() - startTime,
        tokensUsed: Math.floor(Math.random() * 1000) + 100,
        toolsUsed: node.data.strandsConfig?.toolAccess.allowedTools || [],
        confidence: 0.9,
        metadata: {
          agentId: node.data.agent?.id,
          model: node.data.agent?.model,
          reasoning: 'Strands-powered intelligent processing'
        }
      };

      return agentResult;
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        toolsUsed: [],
        metadata: {}
      };
    }
  }

  private async executeToolNode(node: StrandsWorkflowNode, context: WorkflowContext): Promise<ExecutionResult> {
    // Simulate tool execution - integrate with your MCP services
    const startTime = Date.now();
    
    try {
      const toolResult = {
        success: true,
        output: `Tool ${node.data.name} processed: ${JSON.stringify(context.currentData)}`,
        executionTime: Date.now() - startTime,
        toolsUsed: [node.data.tool?.name || 'unknown'],
        metadata: {
          toolCategory: node.data.tool?.category,
          toolProvider: node.data.tool?.provider
        }
      };

      return toolResult;
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        toolsUsed: [],
        metadata: {}
      };
    }
  }

  private async executeDecisionNode(node: StrandsWorkflowNode, context: WorkflowContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Simulate decision logic
      const decision = Math.random() > 0.5; // Simple random decision for now
      
      return {
        success: true,
        output: { decision, reasoning: 'Strands-powered decision making' },
        executionTime: Date.now() - startTime,
        toolsUsed: [],
        confidence: 0.85,
        metadata: {
          decisionType: node.data.decisionLogic?.type,
          conditions: node.data.decisionLogic?.conditions?.length || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        toolsUsed: [],
        metadata: {}
      };
    }
  }

  // Helper methods
  private generateDefaultStrandsConfig(agent: PaletteAgent): StrandsAgentConfig {
    return {
      reasoningPattern: 'sequential',
      contextManagement: {
        preserveMemory: true,
        compressionLevel: 'summary',
        maxContextLength: 4000
      },
      toolAccess: {
        allowedTools: ['database', 'web_search', 'file_system'],
        toolSelectionStrategy: 'automatic'
      },
      handoffStrategy: {
        contextTransfer: 'compressed',
        expertiseMatching: true,
        loadBalancing: false
      }
    };
  }

  private generateDefaultToolConfig(tool: MCPTool): ToolConfiguration {
    return {
      connectionSettings: {},
      inputMapping: {},
      outputMapping: {},
      errorHandling: {
        retryCount: 3,
        fallbackAction: 'error'
      }
    };
  }

  private getAgentColor(role: string): string {
    const colorMap: Record<string, string> = {
      'assistant': '#3b82f6',
      'analyst': '#10b981',
      'writer': '#f59e0b',
      'researcher': '#8b5cf6',
      'coordinator': '#ef4444',
      'specialist': '#06b6d4'
    };
    
    const roleLower = role.toLowerCase();
    for (const [key, color] of Object.entries(colorMap)) {
      if (roleLower.includes(key)) {
        return color;
      }
    }
    
    return '#6b7280'; // Default gray
  }

  private getToolIcon(category: string): string {
    const iconMap: Record<string, string> = {
      'database': '🗄️',
      'api': '🔌',
      'file': '📁',
      'web': '🌐',
      'analysis': '📊',
      'communication': '💬'
    };
    
    return iconMap[category] || '🔧';
  }

  private getToolColor(category: string): string {
    const colorMap: Record<string, string> = {
      'database': '#059669',
      'api': '#dc2626',
      'file': '#7c3aed',
      'web': '#2563eb',
      'analysis': '#ea580c',
      'communication': '#9333ea'
    };
    
    return colorMap[category] || '#6b7280';
  }

  private initializeTemplates(): void {
    // Initialize workflow templates - will implement in next phase
  }

  // Getters
  getWorkflow(workflowId: string) {
    return this.workflows.get(workflowId);
  }

  getExecution(executionId: string) {
    return this.executions.get(executionId);
  }

  getAllExecutions() {
    return Array.from(this.executions.values());
  }
}

// Workflow template interface
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: Partial<StrandsWorkflowNode>[];
  edges: Partial<Edge>[];
  metadata: {
    author: string;
    version: string;
    tags: string[];
    industry?: string;
    useCase?: string;
  };
}