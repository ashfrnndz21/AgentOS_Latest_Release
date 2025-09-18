import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ModernWorkspaceHeader } from './ModernWorkspaceHeader';
import { ModernBankingAgentPalette } from './ModernBankingAgentPalette';
import { EnhancedPropertiesPanel } from './PropertiesPanel';
import { BankingWorkflowToolbar } from './BankingWorkflowToolbar';
import { ComplianceMonitor } from './ComplianceMonitor';
import { RiskAssessmentPanel } from './RiskAssessmentPanel';
import { ModernAgentNode } from './nodes/ModernAgentNode';
import { ModernDecisionNode } from './nodes/ModernDecisionNode';
import { ModernMemoryNode } from './nodes/ModernMemoryNode';
import { ModernGuardrailNode } from './nodes/ModernGuardrailNode';
import { ComplianceNode } from './nodes/ComplianceNode';
import { RiskNode } from './nodes/RiskNode';
import { AuditNode } from './nodes/AuditNode';
import { EnhancedConnectionEdge } from './edges/EnhancedConnectionEdge';
import { workflowEngine } from './engines/WorkflowEngine';
import { WorkflowNode, WorkflowEdge, WorkflowExecution } from './types/orchestration';

const nodeTypes = {
  agent: ModernAgentNode,
  decision: ModernDecisionNode,
  memory: ModernMemoryNode,
  guardrail: ModernGuardrailNode,
  compliance: ComplianceNode,
  risk: RiskNode,
  audit: AuditNode,
};

const edgeTypes = {
  enhanced: EnhancedConnectionEdge,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const EnhancedMultiAgentWorkspaceBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [workflowMetrics, setWorkflowMetrics] = useState({
    complianceScore: 95,
    riskLevel: 'Low',
    auditReadiness: 88,
    performanceScore: 92,
    validationErrors: [] as string[],
  });

  const onConnect = useCallback(
    (params: Connection) => {
      // Determine connection type based on source and target node types
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      let connectionType: 'data' | 'control' | 'event' | 'error' = 'data';
      let connectionLabel = 'Data Flow';
      
      if (sourceNode?.type === 'decision') {
        connectionType = 'control';
        connectionLabel = params.sourceHandle === 'true' ? 'True Path' : 'False Path';
      } else if (sourceNode?.type === 'guardrail' || sourceNode?.type === 'compliance') {
        connectionType = 'control';
        connectionLabel = 'Validation Check';
      } else if (targetNode?.type === 'risk' || targetNode?.type === 'audit') {
        connectionType = 'event';
        connectionLabel = 'Monitoring Event';
      }

      const edge = {
        ...params,
        type: 'enhanced',
        animated: true,
        data: {
          type: connectionType,
          label: connectionLabel,
          status: 'idle' as const,
          metrics: {
            executionCount: 0,
            avgDuration: 0,
            successRate: 100
          }
        }
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges, nodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowProperties(true);
  }, []);

  const addBankingAgent = useCallback((agentType: string) => {
    const bankingAgentConfigs = {
      'KYC Agent': {
        tools: ['Document Scanner', 'Identity Verification', 'Sanctions Check'],
        guardrails: ['PII Protection', 'Data Retention Policy'],
        compliance: ['KYC Regulations', 'AML Requirements'],
      },
      'AML Agent': {
        tools: ['Transaction Monitor', 'Risk Scorer', 'SAR Generator'],
        guardrails: ['Regulatory Compliance', 'False Positive Reduction'],
        compliance: ['AML Laws', 'BSA Requirements'],
      },
      'Credit Underwriting Agent': {
        tools: ['Credit Scorer', 'Risk Calculator', 'Document Analyzer'],
        guardrails: ['Fair Lending', 'GDPR Compliance'],
        compliance: ['Fair Credit Reporting Act', 'Equal Credit Opportunity Act'],
      },
      'Fraud Detection Agent': {
        tools: ['Pattern Analyzer', 'Anomaly Detector', 'Real-time Monitor'],
        guardrails: ['Privacy Protection', 'Alert Threshold Management'],
        compliance: ['PCI DSS', 'SOX Compliance'],
      },
    };

    const config = bankingAgentConfigs[agentType as keyof typeof bankingAgentConfigs] || {
      tools: ['Generic Banking Tool'],
      guardrails: ['Basic Compliance'],
      compliance: ['Standard Banking Regulations'],
    };

    const newNode: Node = {
      id: `${agentType.toLowerCase().replace(' ', '-')}-${Date.now()}`,
      type: 'agent',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: agentType,
        agentType,
        model: 'gpt-4',
        tools: config.tools,
        guardrails: config.guardrails,
        compliance: config.compliance,
        memory: true,
        reasoning: 'chain-of-thought',
        bankingContext: true,
        // Enhanced orchestration properties
        nodeType: 'processor',
        inputSchema: {
          type: 'object',
          properties: {
            request: { type: 'string', description: 'Input request' },
            context: { type: 'object', description: 'Workflow context' }
          }
        },
        outputSchema: {
          type: 'object', 
          properties: {
            result: { type: 'string', description: 'Processing result' },
            metadata: { type: 'object', description: 'Result metadata' }
          }
        },
        status: 'idle' as const
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const addUtilityNode = useCallback((nodeType: string) => {
    let enhancedNodeType: 'trigger' | 'processor' | 'decision' | 'integration' | 'terminal' = 'processor';
    
    if (nodeType === 'decision') enhancedNodeType = 'decision';
    else if (nodeType === 'memory' || nodeType === 'guardrail') enhancedNodeType = 'integration';
    else if (nodeType === 'compliance' || nodeType === 'audit') enhancedNodeType = 'terminal';

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        config: {},
        bankingContext: true,
        nodeType: enhancedNodeType,
        status: 'idle' as const
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  const runWorkflow = useCallback(async () => {
    setIsRunning(true);
    
    // Validate workflow first
    const workflowNodes: WorkflowNode[] = nodes.map(node => ({
      id: node.id,
      type: (node.data.nodeType as 'trigger' | 'processor' | 'decision' | 'integration' | 'terminal') || 'processor',
      label: node.data.label as string,
      config: node.data as any,
      position: node.position,
      inputSchema: node.data.inputSchema as any,
      outputSchema: node.data.outputSchema as any,
      status: 'idle',
    }));

    const workflowEdges: WorkflowEdge[] = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: (edge.data?.type as 'data' | 'control' | 'event' | 'error') || 'data',
      condition: edge.data?.condition as string,
      label: edge.data?.label as string,
    }));

    const validation = workflowEngine.validateWorkflow(workflowNodes, workflowEdges);
    
    if (!validation.isValid) {
      setWorkflowMetrics(prev => ({
        ...prev,
        validationErrors: validation.errors
      }));
      setIsRunning(false);
      return;
    }

    try {
      // Update edge status to show activity
      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: { ...edge.data, status: 'active' }
      })));

      // Execute workflow
      const execution = await workflowEngine.executeWorkflow(
        `workflow-${Date.now()}`,
        workflowNodes,
        workflowEdges
      );
      
      setCurrentExecution(execution);
      
      // Update metrics
      setWorkflowMetrics(prev => ({
        ...prev,
        complianceScore: Math.floor(Math.random() * 20) + 80,
        riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        auditReadiness: Math.floor(Math.random() * 30) + 70,
        performanceScore: Math.floor(Math.random() * 25) + 75,
        validationErrors: []
      }));

      // Update edge status to success
      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: { 
          ...edge.data, 
          status: 'success',
          metrics: {
            executionCount: ((edge.data?.metrics as any)?.executionCount || 0) + 1,
            avgDuration: Math.random() * 1000 + 200,
            successRate: Math.random() * 30 + 70
          }
        }
      })));

    } catch (error) {
      console.error('Workflow execution failed:', error);
      
      // Update edge status to error
      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: { ...edge.data, status: 'error' }
      })));
    } finally {
      setIsRunning(false);
    }
  }, [nodes, edges, setEdges]);

  const exportWorkflow = useCallback(() => {
    const workflowData = {
      nodes,
      edges,
      metadata: {
        name: 'Banking Multi-Agent Workflow',
        version: '1.0',
        compliance: workflowMetrics,
        created: new Date().toISOString(),
      },
    };
    
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banking-workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, workflowMetrics]);

  return (
    <div className="h-screen max-w-7xl mx-auto flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-slate-100 overflow-hidden">
      <ModernWorkspaceHeader />
      
      <div className="flex-1 flex w-full h-full overflow-hidden">
        {/* Modern Banking Agent Palette */}
        <ModernBankingAgentPalette 
          onAddAgent={addBankingAgent}
          onAddUtility={addUtilityNode}
        />
        
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <BankingWorkflowToolbar 
            isRunning={isRunning}
            onRun={runWorkflow}
            onStop={() => setIsRunning(false)}
            onExport={exportWorkflow}
            nodeCount={nodes.length}
            connectionCount={edges.length}
            metrics={workflowMetrics}
            onShowCompliance={() => setShowCompliance(true)}
            onShowRiskAssessment={() => setShowRiskAssessment(true)}
          />
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-purple-900/50"
            style={{ backgroundColor: 'transparent' }}
          >
            <Background 
              color="rgba(100, 200, 255, 0.1)" 
              gap={40}
              size={1}
              style={{ backgroundColor: 'transparent', opacity: 0.3 }}
            />
            <Controls 
              className="bg-slate-800/40 backdrop-blur-lg border border-cyan-400/20 shadow-lg rounded-xl"
              style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(34, 211, 238, 0.2)' }}
            />
            <MiniMap 
              className="bg-slate-800/40 backdrop-blur-lg border border-cyan-400/20 shadow-lg rounded-xl"
              style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(34, 211, 238, 0.2)' }}
              nodeColor="#22d3ee"
              maskColor="rgba(30, 41, 59, 0.6)"
            />
          </ReactFlow>
        </div>
        
        {/* Enhanced Properties Panel */}
        {showProperties && selectedNode && (
          <EnhancedPropertiesPanel
            node={selectedNode}
            onUpdateNode={updateNodeData}
            onClose={() => setShowProperties(false)}
          />
        )}
      </div>
      
      {/* Compliance Monitor */}
      {showCompliance && (
        <ComplianceMonitor
          nodes={nodes}
          edges={edges}
          metrics={workflowMetrics}
          onClose={() => setShowCompliance(false)}
        />
      )}
      
      {/* Risk Assessment Panel */}
      {showRiskAssessment && (
        <RiskAssessmentPanel
          workflow={{ nodes, edges }}
          onClose={() => setShowRiskAssessment(false)}
        />
      )}
    </div>
  );
};