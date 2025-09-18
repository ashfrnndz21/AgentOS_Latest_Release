import React, { useState, useCallback, useEffect } from 'react';
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
import { WealthAgentPalette } from './WealthAgentPalette';
import { WealthPropertiesPanel } from './WealthPropertiesPanel';
import { BankingWorkflowToolbar } from './BankingWorkflowToolbar';
import { ModernAgentNode } from './nodes/ModernAgentNode';
import { ModernDecisionNode } from './nodes/ModernDecisionNode';
import { ModernMemoryNode } from './nodes/ModernMemoryNode';
import { ModernGuardrailNode } from './nodes/ModernGuardrailNode';
import { EnhancedConnectionEdge } from './edges/EnhancedConnectionEdge';

const nodeTypes = {
  agent: ModernAgentNode,
  decision: ModernDecisionNode,
  memory: ModernMemoryNode,
  guardrail: ModernGuardrailNode,
};

const edgeTypes = {
  enhanced: EnhancedConnectionEdge,
};

// Define the 6 wealth management agents with their relationships
const wealthAgentNodes: Node[] = [
  {
    id: 'market-research-agent',
    type: 'agent',
    position: { x: 100, y: 100 },
    data: {
      label: 'AI Market Research Agent',
      agentType: 'AI Market Research Agent',
      model: 'GPT-4o + Web Research',
      tools: ['Real-time News Analysis', 'Economic Data Mining', 'Sentiment Analysis', 'Risk Detection'],
      guardrails: ['Data Privacy', 'Source Verification'],
      memory: true,
      reasoning: 'chain-of-thought',
      status: 'active',
      description: 'Continuously scans global markets, news, and economic indicators',
      capabilities: ['Real-time News Analysis', 'Economic Data Mining', 'Sentiment Analysis', 'Risk Detection'],
      researchSources: ['Reuters', 'Bloomberg', 'SEC Filings', 'Fed Reports']
    },
  },
  {
    id: 'trend-analysis-agent',
    type: 'agent',
    position: { x: 500, y: 100 },
    data: {
      label: 'Predictive Trend Analyzer',
      agentType: 'Predictive Trend Analyzer',
      model: 'Claude 3 Opus + ML Models',
      tools: ['Pattern Recognition', 'Predictive Analytics', 'Cross-Asset Analysis', 'Volatility Forecasting'],
      guardrails: ['Model Validation', 'Confidence Thresholds'],
      memory: true,
      reasoning: 'analytical',
      status: 'analyzing',
      description: 'Uses machine learning to identify market patterns and predict future trends',
      confidence: 94
    },
  },
  {
    id: 'investment-advisor',
    type: 'agent',
    position: { x: 900, y: 100 },
    data: {
      label: 'Personalized Investment Advisor',
      agentType: 'Personalized Investment Advisor',
      model: 'GPT-4o',
      tools: ['Portfolio Analysis', 'Risk Assessment', 'Tax Optimization', 'Goal-Based Planning'],
      guardrails: ['Suitability Checks', 'Compliance Rules'],
      memory: true,
      reasoning: 'personalized',
      status: 'active',
      description: 'Analyzes complete financial profile and generates personalized recommendations'
    },
  },
  {
    id: 'risk-sentinel',
    type: 'agent',
    position: { x: 100, y: 400 },
    data: {
      label: 'AI Risk Sentinel',
      agentType: 'AI Risk Sentinel',
      model: 'Claude 3 Opus + Risk Models',
      tools: ['Geopolitical Analysis', 'Correlation Monitoring', 'Stress Testing', 'Black Swan Detection'],
      guardrails: ['Risk Limits', 'Alert Protocols'],
      memory: true,
      reasoning: 'risk-aware',
      status: 'monitoring',
      description: 'Advanced risk monitoring system that analyzes global events',
      riskFactors: 247
    },
  },
  {
    id: 'web-intelligence-agent',
    type: 'agent',
    position: { x: 500, y: 400 },
    data: {
      label: 'Web Intelligence Aggregator',
      agentType: 'Web Intelligence Aggregator',
      model: 'GPT-4o + Web Crawling',
      tools: ['Social Sentiment', 'Forum Analysis', 'Insider Tracking', 'Regulatory Monitoring'],
      guardrails: ['Source Reliability', 'Information Quality'],
      memory: true,
      reasoning: 'sentiment-analysis',
      status: 'active',
      description: 'Crawls financial websites, forums, and social media for market intelligence',
      signalStrength: 'High'
    },
  },
  {
    id: 'financial-health',
    type: 'agent',
    position: { x: 900, y: 400 },
    data: {
      label: 'Proactive Wealth Optimizer',
      agentType: 'Proactive Wealth Optimizer',
      model: 'GPT-4 Turbo',
      tools: ['Multi-Account Analysis', 'Tax Loss Harvesting', 'Rebalancing', 'Cash Management'],
      guardrails: ['Portfolio Limits', 'Tax Compliance'],
      memory: true,
      reasoning: 'optimization',
      status: 'optimizing',
      description: 'Monitors overall financial health and identifies optimization opportunities',
      potentialSavings: '$12,400'
    },
  },
  // Central decision and memory nodes
  {
    id: 'wealth-decision-hub',
    type: 'decision',
    position: { x: 500, y: 250 },
    data: {
      label: 'Wealth Decision Hub',
      config: {
        conditions: ['Risk Tolerance', 'Market Conditions', 'Client Goals'],
        thresholds: { risk: 0.7, confidence: 0.8 }
      },
      status: 'idle'
    },
  },
  {
    id: 'wealth-memory-core',
    type: 'memory',
    position: { x: 300, y: 550 },
    data: {
      label: 'Wealth Memory Core',
      config: {
        type: 'shared-memory',
        persistence: true,
        retention: '365 days'
      },
      status: 'active'
    },
  },
  {
    id: 'compliance-guardrail',
    type: 'guardrail',
    position: { x: 700, y: 550 },
    data: {
      label: 'Compliance Guardrail',
      config: {
        rules: ['SEC Regulations', 'FINRA Rules', 'Fiduciary Duty'],
        enforcement: 'strict'
      },
      status: 'monitoring'
    },
  }
];

// Define the relationships between agents
const wealthAgentEdges: Edge[] = [
  // Market Research feeds into Trend Analysis
  {
    id: 'e1',
    source: 'market-research-agent',
    target: 'trend-analysis-agent',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Market Data Feed', status: 'active' }
  },
  // Trend Analysis feeds into Investment Advisor
  {
    id: 'e2',
    source: 'trend-analysis-agent',
    target: 'investment-advisor',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Trend Insights', status: 'active' }
  },
  // Market Research feeds into Decision Hub
  {
    id: 'e3',
    source: 'market-research-agent',
    target: 'wealth-decision-hub',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Market Intelligence', status: 'active' }
  },
  // Risk Sentinel monitors everything
  {
    id: 'e4',
    source: 'risk-sentinel',
    target: 'wealth-decision-hub',
    type: 'enhanced',
    animated: true,
    data: { type: 'event', label: 'Risk Alerts', status: 'monitoring' }
  },
  // Web Intelligence feeds into Risk Sentinel
  {
    id: 'e5',
    source: 'web-intelligence-agent',
    target: 'risk-sentinel',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Market Sentiment', status: 'active' }
  },
  // Decision Hub controls Investment Advisor
  {
    id: 'e6',
    source: 'wealth-decision-hub',
    target: 'investment-advisor',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Investment Decisions', status: 'active' }
  },
  // Decision Hub controls Wealth Optimizer
  {
    id: 'e7',
    source: 'wealth-decision-hub',
    target: 'financial-health',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Optimization Triggers', status: 'active' }
  },
  // All agents connect to memory
  {
    id: 'e8',
    source: 'investment-advisor',
    target: 'wealth-memory-core',
    type: 'enhanced',
    data: { type: 'data', label: 'Client Data', status: 'active' }
  },
  {
    id: 'e9',
    source: 'financial-health',
    target: 'wealth-memory-core',
    type: 'enhanced',
    data: { type: 'data', label: 'Portfolio State', status: 'active' }
  },
  // Compliance monitoring
  {
    id: 'e10',
    source: 'investment-advisor',
    target: 'compliance-guardrail',
    type: 'enhanced',
    data: { type: 'event', label: 'Compliance Check', status: 'monitoring' }
  },
  {
    id: 'e11',
    source: 'financial-health',
    target: 'compliance-guardrail',
    type: 'enhanced',
    data: { type: 'event', label: 'Regulatory Validation', status: 'monitoring' }
  }
];

export const WealthManagementWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(wealthAgentNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(wealthAgentEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowMetrics, setWorkflowMetrics] = useState({
    complianceScore: 98,
    riskLevel: 'Low',
    auditReadiness: 94,
    performanceScore: 96,
    validationErrors: [] as string[],
  });

  // Simulate real-time agent activity
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
      setEdges((eds) => addEdge(edge, eds));
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
      }));
      
      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: { ...edge.data, status: 'success' }
      })));
      
      setIsRunning(false);
    }, 3000);
  }, [setEdges]);

  return (
    <div className="h-screen max-w-7xl mx-auto flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 text-slate-100 overflow-hidden">
      <ModernWorkspaceHeader />
      
      <div className="flex-1 flex w-full h-full overflow-hidden">
        {/* Wealth Agent Palette */}
        <WealthAgentPalette />
        
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <BankingWorkflowToolbar 
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
            className="bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-blue-900/50"
            style={{ backgroundColor: 'transparent' }}
          >
            <Background 
              color="rgba(147, 51, 234, 0.1)" 
              gap={40}
              size={1}
              style={{ backgroundColor: 'transparent', opacity: 0.3 }}
            />
            <Controls 
              className="bg-slate-800/40 backdrop-blur-lg border border-purple-400/20 shadow-lg rounded-xl"
              style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(147, 51, 234, 0.2)' }}
            />
            <MiniMap 
              className="bg-slate-800/40 backdrop-blur-lg border border-purple-400/20 shadow-lg rounded-xl"
              style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(147, 51, 234, 0.2)' }}
              nodeColor="#9333ea"
              maskColor="rgba(30, 41, 59, 0.6)"
            />
          </ReactFlow>
        </div>
        
        {/* Wealth Properties Panel */}
        {showProperties && selectedNode && (
          <WealthPropertiesPanel
            node={selectedNode}
            onUpdateNode={updateNodeData}
            onClose={() => setShowProperties(false)}
          />
        )}
      </div>
    </div>
  );
};