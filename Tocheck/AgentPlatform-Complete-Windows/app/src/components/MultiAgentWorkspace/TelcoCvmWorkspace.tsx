import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  Connection,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ModernWorkspaceHeader } from './ModernWorkspaceHeader';
import { TelcoCvmAgentPalette } from './TelcoCvmAgentPalette';
import { TelcoCvmPropertiesPanel } from './TelcoCvmPropertiesPanel';
import { TelcoCvmWorkflowToolbar } from './TelcoCvmWorkflowToolbar';
import { ModernAgentNode } from './nodes/ModernAgentNode';
import { ModernDecisionNode } from './nodes/ModernDecisionNode';
import { ModernGuardrailNode } from './nodes/ModernGuardrailNode';
import { ModernMemoryNode } from './nodes/ModernMemoryNode';
import { EnhancedConnectionEdge } from './edges/EnhancedConnectionEdge';

const nodeTypes = {
  agent: ModernAgentNode,
  decision: ModernDecisionNode,
  guardrail: ModernGuardrailNode,
  memory: ModernMemoryNode,
};

const edgeTypes = {
  enhanced: EnhancedConnectionEdge,
};

// Initial nodes for Telco CVM workflow matching wealth management structure
const initialNodes: Node[] = [
  {
    id: 'customer-data-agent',
    type: 'agent',
    position: { x: 100, y: 100 },
    data: {
      label: 'Customer Data Aggregator',
      agentType: 'Customer Data Aggregator',
      model: 'GPT-4o + Data Pipeline',
      tools: ['Data Integration', 'Real-time Processing', 'Quality Validation', 'Customer Profiling'],
      guardrails: ['Data Privacy', 'GDPR Compliance'],
      memory: true,
      reasoning: 'data-centric',
      status: 'active',
      description: 'Aggregates customer data from billing, usage, and touchpoints',
      capabilities: ['Data Integration', 'Real-time Processing', 'Quality Validation', 'Customer Profiling'],
      dataSources: ['Billing System', 'Usage Analytics', 'CRM', 'Support Tickets']
    }
  },
  {
    id: 'segmentation-agent',
    type: 'agent',
    position: { x: 500, y: 100 },
    data: {
      label: 'Dynamic Segmentation Engine',
      agentType: 'Dynamic Segmentation Engine',
      model: 'Claude 3 Opus + ML Models',
      tools: ['Behavioral Analysis', 'Segment Discovery', 'Profile Building', 'Pattern Recognition'],
      guardrails: ['Model Validation', 'Bias Prevention'],
      memory: true,
      reasoning: 'analytical',
      status: 'analyzing',
      description: 'Performs dynamic customer segmentation and behavioral analysis',
      confidence: 94,
      segments: 12
    }
  },
  {
    id: 'campaign-optimizer',
    type: 'agent',
    position: { x: 900, y: 100 },
    data: {
      label: 'Campaign Optimization Engine',
      agentType: 'Campaign Optimization Engine',
      model: 'GPT-4o + Optimization',
      tools: ['A/B Testing', 'Channel Optimization', 'Performance Tracking', 'Budget Allocation'],
      guardrails: ['Spending Limits', 'Regulatory Compliance'],
      memory: true,
      reasoning: 'optimization',
      status: 'active',
      description: 'Optimizes marketing campaigns and channel selection for maximum ROI',
      campaignsActive: 8,
      roi: '247%'
    }
  },
  {
    id: 'churn-predictor',
    type: 'agent',
    position: { x: 100, y: 400 },
    data: {
      label: 'AI Churn Prevention',
      agentType: 'AI Churn Prevention',
      model: 'Claude 3 Opus + Risk Models',
      tools: ['Risk Scoring', 'Retention Strategies', 'Early Warning', 'Intervention Planning'],
      guardrails: ['Risk Thresholds', 'Customer Privacy'],
      memory: true,
      reasoning: 'predictive',
      status: 'monitoring',
      description: 'Predicts customer churn risk and recommends retention strategies',
      riskCustomers: 1247,
      accuracy: '89%'
    }
  },
  {
    id: 'revenue-optimizer',
    type: 'agent',
    position: { x: 500, y: 400 },
    data: {
      label: 'Revenue Intelligence Hub',
      agentType: 'Revenue Intelligence Hub',
      model: 'GPT-4o + Financial Models',
      tools: ['Price Optimization', 'Upsell Detection', 'Revenue Forecasting', 'Margin Analysis'],
      guardrails: ['Pricing Rules', 'Market Compliance'],
      memory: true,
      reasoning: 'financial',
      status: 'optimizing',
      description: 'Identifies revenue optimization opportunities and pricing strategies',
      potentialIncrease: '$2.4M',
      opportunities: 342
    }
  },
  {
    id: 'performance-analyst',
    type: 'agent',
    position: { x: 900, y: 400 },
    data: {
      label: 'CVM Performance Monitor',
      agentType: 'CVM Performance Monitor',
      model: 'GPT-4 Turbo + Analytics',
      tools: ['KPI Monitoring', 'Trend Analysis', 'Report Generation', 'Dashboard Updates'],
      guardrails: ['Data Accuracy', 'Performance Standards'],
      memory: true,
      reasoning: 'analytical',
      status: 'active',
      description: 'Monitors CVM KPIs and provides actionable insights',
      metricsTracked: 47,
      alertsActive: 3
    }
  },
  // Central decision and memory nodes
  {
    id: 'cvm-decision-hub',
    type: 'decision',
    position: { x: 500, y: 250 },
    data: {
      label: 'CVM Decision Hub',
      config: {
        conditions: ['Customer Value', 'Churn Risk', 'Revenue Potential'],
        thresholds: { value: 0.8, risk: 0.3, revenue: 0.7 }
      },
      status: 'active'
    }
  },
  {
    id: 'cvm-memory-core',
    type: 'memory',
    position: { x: 300, y: 550 },
    data: {
      label: 'CVM Memory Core',
      config: {
        type: 'shared-memory',
        persistence: true,
        retention: '2 years'
      },
      status: 'active',
      size: '2.1GB',
      entries: 45678
    }
  },
  {
    id: 'compliance-guardrail',
    type: 'guardrail',
    position: { x: 700, y: 550 },
    data: {
      label: 'Telco Compliance Guard',
      config: {
        rules: ['GDPR', 'Telecom Regulations', 'Marketing Laws'],
        enforcement: 'strict'
      },
      status: 'monitoring',
      violations: 0,
      lastCheck: new Date().toISOString()
    }
  }
];

// Define the relationships between CVM agents
const initialEdges: Edge[] = [
  {
    id: 'e1',
    source: 'customer-data-agent',
    target: 'segmentation-agent',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Customer Data Feed', status: 'active' }
  },
  {
    id: 'e2',
    source: 'segmentation-agent',
    target: 'campaign-optimizer',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Segment Insights', status: 'active' }
  },
  {
    id: 'e3',
    source: 'customer-data-agent',
    target: 'cvm-decision-hub',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Customer Intelligence', status: 'active' }
  },
  {
    id: 'e4',
    source: 'churn-predictor',
    target: 'cvm-decision-hub',
    type: 'enhanced',
    animated: true,
    data: { type: 'event', label: 'Churn Alerts', status: 'monitoring' }
  },
  {
    id: 'e5',
    source: 'segmentation-agent',
    target: 'churn-predictor',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Behavioral Patterns', status: 'active' }
  },
  {
    id: 'e6',
    source: 'cvm-decision-hub',
    target: 'campaign-optimizer',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Campaign Triggers', status: 'active' }
  },
  {
    id: 'e7',
    source: 'cvm-decision-hub',
    target: 'revenue-optimizer',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Revenue Opportunities', status: 'active' }
  },
  {
    id: 'e8',
    source: 'campaign-optimizer',
    target: 'cvm-memory-core',
    type: 'enhanced',
    data: { type: 'data', label: 'Campaign Results', status: 'active' }
  },
  {
    id: 'e9',
    source: 'revenue-optimizer',
    target: 'cvm-memory-core',
    type: 'enhanced',
    data: { type: 'data', label: 'Revenue Data', status: 'active' }
  },
  {
    id: 'e10',
    source: 'campaign-optimizer',
    target: 'compliance-guardrail',
    type: 'enhanced',
    data: { type: 'event', label: 'Compliance Check', status: 'monitoring' }
  },
  {
    id: 'e11',
    source: 'revenue-optimizer',
    target: 'compliance-guardrail',
    type: 'enhanced',
    data: { type: 'event', label: 'Pricing Validation', status: 'monitoring' }
  },
  {
    id: 'e12',
    source: 'performance-analyst',
    target: 'cvm-memory-core',
    type: 'enhanced',
    data: { type: 'data', label: 'Performance Metrics', status: 'active' }
  }
];

export const TelcoCvmWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowMetrics, setWorkflowMetrics] = useState({
    complianceScore: 98,
    riskLevel: 'Low',
    auditReadiness: 94,
    performanceScore: 96,
    validationErrors: [] as string[],
    revenueImpact: '$2.4M',
    customersAnalyzed: 45678,
    campaignsOptimized: 12
  });

  // Simulate real-time agent activity matching wealth management
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update edge animation to show data flow
      setEdges(edges => edges.map(edge => ({
        ...edge,
        animated: Math.random() > 0.3, // 70% chance of animation
        data: {
          ...edge.data,
          metrics: {
            executionCount: ((edge.data?.metrics as any)?.executionCount || 0) + 1,
            avgDuration: Math.random() * 500 + 100,
            successRate: Math.random() * 20 + 80
          }
        }
      })));

      // Update metrics periodically
      setWorkflowMetrics(prev => ({
        ...prev,
        customersAnalyzed: prev.customersAnalyzed + Math.floor(Math.random() * 10),
        campaignsOptimized: prev.campaignsOptimized + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'enhanced',
        animated: true,
        data: {
          type: 'data',
          label: 'Custom Connection',
          status: 'active',
        }
      };
      setEdges((eds) => addEdge(edge as any, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowProperties(true);
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  const runWorkflow = useCallback(() => {
    setIsRunning(true);
    
    // Simulate workflow execution with enhanced edge activity
    setEdges(edges => edges.map(edge => ({
      ...edge,
      animated: true,
      data: { ...edge.data, status: 'active' }
    })));

    // Update metrics after 3 seconds
    setTimeout(() => {
      setWorkflowMetrics(prev => ({
        ...prev,
        complianceScore: Math.floor(Math.random() * 10) + 90,
        performanceScore: Math.floor(Math.random() * 15) + 85,
        revenueImpact: `$${(Math.random() * 2 + 2).toFixed(1)}M`,
      }));
      
      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: { ...edge.data, status: 'success' }
      })));
      
      setIsRunning(false);
    }, 3000);
  }, [setEdges]);

  return (
    <div className="h-screen max-w-7xl mx-auto flex flex-col bg-gradient-to-br from-slate-900 via-green-900 to-blue-900 text-slate-100 overflow-hidden">
      <ModernWorkspaceHeader />
      
      <div className="flex-1 flex w-full h-full overflow-hidden">
        {/* CVM Agent Palette */}
        <TelcoCvmAgentPalette />
        
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <TelcoCvmWorkflowToolbar 
            isRunning={isRunning}
            onRun={runWorkflow}
            onStop={() => setIsRunning(false)}
            onExport={() => {}}
            nodeCount={nodes.length}
            connectionCount={edges.length}
            metrics={workflowMetrics}
            onShowCompliance={() => {}}
            onShowRiskAssessment={() => {}}
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
            className="bg-gradient-to-br from-slate-900/50 via-green-900/30 to-blue-900/50"
            style={{ backgroundColor: 'transparent' }}
          >
            <Background 
              color="rgba(34, 197, 94, 0.1)" 
              gap={40}
              size={1}
              style={{ backgroundColor: 'transparent', opacity: 0.3 }}
            />
            <Controls 
              className="bg-slate-800/40 backdrop-blur-lg border border-green-400/20 shadow-lg rounded-xl"
              style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(34, 197, 94, 0.2)' }}
            />
            <MiniMap 
              className="bg-slate-800/40 backdrop-blur-lg border border-green-400/20 shadow-lg rounded-xl"
              style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(34, 197, 94, 0.2)' }}
              nodeColor="#22c55e"
              maskColor="rgba(30, 41, 59, 0.6)"
            />
          </ReactFlow>
        </div>
        
        {/* CVM Properties Panel */}
        {showProperties && selectedNode && (
          <TelcoCvmPropertiesPanel
            node={selectedNode}
            onUpdateNode={updateNodeData}
            onClose={() => setShowProperties(false)}
          />
        )}
      </div>
    </div>
  );
};