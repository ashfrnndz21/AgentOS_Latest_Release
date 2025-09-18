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
import { NetworkTwinAgentPalette } from './NetworkTwinAgentPalette';
import { NetworkTwinPropertiesPanel } from './NetworkTwinPropertiesPanel';
import { NetworkTwinWorkflowToolbar } from './NetworkTwinWorkflowToolbar';
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

// Initial nodes for Network Twin workflow
const initialNodes: Node[] = [
  {
    id: 'ran-intelligence',
    type: 'agent',
    position: { x: 100, y: 100 },
    data: {
      label: 'RAN Intelligence Agent',
      agentType: 'RAN Intelligence Agent',
      model: 'GPT-4o + RF Analytics',
      tools: ['Signal Optimization', 'Coverage Analysis', 'Interference Detection', 'Capacity Planning'],
      guardrails: ['RF Safety', 'Regulatory Compliance'],
      memory: true,
      reasoning: 'analytical',
      status: 'active',
      description: 'Monitors and optimizes radio access network performance',
      capabilities: ['Signal Optimization', 'Coverage Analysis', 'Interference Detection', 'Capacity Planning'],
      activeSites: 420,
      coverageScore: 94
    }
  },
  {
    id: 'performance-monitor',
    type: 'agent',
    position: { x: 500, y: 100 },
    data: {
      label: 'Network Performance Monitor',
      agentType: 'Network Performance Monitor',
      model: 'Claude 3 Opus + Time Series',
      tools: ['KPI Monitoring', 'Anomaly Detection', 'Performance Trending', 'Alert Generation'],
      guardrails: ['Performance Thresholds', 'Alert Limits'],
      memory: true,
      reasoning: 'monitoring',
      status: 'active',
      description: 'Tracks KPIs across all cell sites and identifies performance issues',
      kpisTracked: 47,
      alertsActive: 3
    }
  },
  {
    id: 'maintenance-predictor',
    type: 'agent',
    position: { x: 900, y: 100 },
    data: {
      label: 'Predictive Maintenance Agent',
      agentType: 'Predictive Maintenance Agent',
      model: 'GPT-4o + Predictive Models',
      tools: ['Failure Prediction', 'Maintenance Scheduling', 'Resource Planning', 'Cost Optimization'],
      guardrails: ['Safety Protocols', 'Maintenance Windows'],
      memory: true,
      reasoning: 'predictive',
      status: 'analyzing',
      description: 'Predicts equipment failures and schedules maintenance',
      predictedFailures: 12,
      maintenanceScheduled: 8
    }
  },
  {
    id: 'coverage-optimizer',
    type: 'agent',
    position: { x: 100, y: 400 },
    data: {
      label: 'Coverage Optimization Agent',
      agentType: 'Coverage Optimization Agent',
      model: 'Claude 3 Opus + Geospatial',
      tools: ['Site Planning', 'Coverage Modeling', 'Interference Mitigation', 'Capacity Allocation'],
      guardrails: ['Zoning Laws', 'Environmental Impact'],
      memory: true,
      reasoning: 'optimization',
      status: 'optimizing',
      description: 'Optimizes cell site placement and coverage patterns',
      optimizationScore: 87,
      newSitesRecommended: 5
    }
  },
  {
    id: 'traffic-optimizer',
    type: 'agent',
    position: { x: 500, y: 400 },
    data: {
      label: 'Traffic Flow Optimizer',
      agentType: 'Traffic Flow Optimizer',
      model: 'GPT-4o + Traffic Analytics',
      tools: ['Load Balancing', 'Congestion Management', 'QoS Optimization', 'Bandwidth Allocation'],
      guardrails: ['SLA Requirements', 'QoS Standards'],
      memory: true,
      reasoning: 'optimization',
      status: 'active',
      description: 'Analyzes and optimizes network traffic patterns',
      congestionReduced: '23%',
      trafficOptimized: 2.4
    }
  },
  {
    id: 'fault-detector',
    type: 'agent',
    position: { x: 900, y: 400 },
    data: {
      label: 'Fault Detection Agent',
      agentType: 'Fault Detection Agent',
      model: 'Claude 3 Opus + Fault Analytics',
      tools: ['Fault Detection', 'Root Cause Analysis', 'Auto Recovery', 'Escalation Management'],
      guardrails: ['Recovery Protocols', 'Escalation Rules'],
      memory: true,
      reasoning: 'diagnostic',
      status: 'monitoring',
      description: 'Detects network faults and initiates recovery procedures',
      faultsDetected: 7,
      autoRecovered: 5
    }
  },
  // Central decision and memory nodes
  {
    id: 'network-decision-hub',
    type: 'decision',
    position: { x: 500, y: 250 },
    data: {
      label: 'Network Decision Hub',
      config: {
        conditions: ['Performance Score', 'Coverage Level', 'Fault Status'],
        thresholds: { performance: 0.85, coverage: 0.9, faults: 0.05 }
      },
      status: 'active'
    }
  },
  {
    id: 'network-memory-core',
    type: 'memory',
    position: { x: 300, y: 550 },
    data: {
      label: 'Network Memory Core',
      config: {
        type: 'time-series-memory',
        persistence: true,
        retention: '1 year'
      },
      status: 'active',
      size: '5.2GB',
      entries: 124567
    }
  },
  {
    id: 'telecom-compliance-guard',
    type: 'guardrail',
    position: { x: 700, y: 550 },
    data: {
      label: 'Telecom Compliance Guard',
      config: {
        rules: ['RF Safety', 'Telecom Regulations', 'Environmental Laws'],
        enforcement: 'strict'
      },
      status: 'monitoring',
      violations: 0,
      lastCheck: new Date().toISOString()
    }
  }
];

// Define the relationships between Network Twin agents
const initialEdges: Edge[] = [
  {
    id: 'e1',
    source: 'ran-intelligence',
    target: 'performance-monitor',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'RF Performance Data', status: 'active' }
  },
  {
    id: 'e2',
    source: 'performance-monitor',
    target: 'network-decision-hub',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'KPI Metrics', status: 'active' }
  },
  {
    id: 'e3',
    source: 'ran-intelligence',
    target: 'coverage-optimizer',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Coverage Analysis', status: 'active' }
  },
  {
    id: 'e4',
    source: 'maintenance-predictor',
    target: 'network-decision-hub',
    type: 'enhanced',
    animated: true,
    data: { type: 'event', label: 'Maintenance Alerts', status: 'monitoring' }
  },
  {
    id: 'e5',
    source: 'coverage-optimizer',
    target: 'traffic-optimizer',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Coverage Patterns', status: 'active' }
  },
  {
    id: 'e6',
    source: 'network-decision-hub',
    target: 'traffic-optimizer',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Traffic Control', status: 'active' }
  },
  {
    id: 'e7',
    source: 'fault-detector',
    target: 'network-decision-hub',
    type: 'enhanced',
    animated: true,
    data: { type: 'event', label: 'Fault Alerts', status: 'monitoring' }
  },
  {
    id: 'e8',
    source: 'performance-monitor',
    target: 'network-memory-core',
    type: 'enhanced',
    data: { type: 'data', label: 'Performance History', status: 'active' }
  },
  {
    id: 'e9',
    source: 'maintenance-predictor',
    target: 'network-memory-core',
    type: 'enhanced',
    data: { type: 'data', label: 'Maintenance Records', status: 'active' }
  },
  {
    id: 'e10',
    source: 'ran-intelligence',
    target: 'telecom-compliance-guard',
    type: 'enhanced',
    data: { type: 'event', label: 'RF Safety Check', status: 'monitoring' }
  },
  {
    id: 'e11',
    source: 'coverage-optimizer',
    target: 'telecom-compliance-guard',
    type: 'enhanced',
    data: { type: 'event', label: 'Zoning Compliance', status: 'monitoring' }
  },
  {
    id: 'e12',
    source: 'traffic-optimizer',
    target: 'network-memory-core',
    type: 'enhanced',
    data: { type: 'data', label: 'Traffic Patterns', status: 'active' }
  }
];

export const NetworkTwinWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowMetrics, setWorkflowMetrics] = useState({
    networkHealth: 94,
    coverageLevel: 'Excellent',
    performanceScore: 87,
    faultCount: 2,
    validationErrors: [] as string[],
    energySavings: '18.7%',
    sitesMonitored: 420,
    maintenanceScheduled: 8
  });

  // Simulate real-time network activity
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
        sitesMonitored: prev.sitesMonitored + Math.floor(Math.random() * 5),
        faultCount: Math.max(0, prev.faultCount + (Math.random() > 0.9 ? 1 : -1))
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
        networkHealth: Math.floor(Math.random() * 10) + 90,
        performanceScore: Math.floor(Math.random() * 15) + 85,
        energySavings: `${(Math.random() * 10 + 15).toFixed(1)}%`,
      }));
      
      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: { ...edge.data, status: 'success' }
      })));
      
      setIsRunning(false);
    }, 3000);
  }, [setEdges]);

  return (
    <div className="h-screen max-w-7xl mx-auto flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-slate-100 overflow-hidden">
      <ModernWorkspaceHeader />
      
      <div className="flex-1 flex w-full h-full overflow-hidden">
        {/* Network Agent Palette */}
        <NetworkTwinAgentPalette />
        
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <NetworkTwinWorkflowToolbar 
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
            className="bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-indigo-900/50"
            style={{ backgroundColor: 'transparent' }}
          >
            <Background 
              color="rgba(59, 130, 246, 0.1)" 
              gap={40}
              size={1}
              style={{ backgroundColor: 'transparent', opacity: 0.3 }}
            />
            <Controls 
              className="bg-slate-800/40 backdrop-blur-lg border border-blue-400/20 shadow-lg rounded-xl"
              style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
            />
            <MiniMap 
              className="bg-slate-800/40 backdrop-blur-lg border border-blue-400/20 shadow-lg rounded-xl"
              style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
              nodeColor="#3b82f6"
              maskColor="rgba(30, 41, 59, 0.6)"
            />
          </ReactFlow>
        </div>
        
        {/* Network Properties Panel */}
        {showProperties && selectedNode && (
          <NetworkTwinPropertiesPanel
            node={selectedNode}
            onUpdateNode={updateNodeData}
            onClose={() => setShowProperties(false)}
          />
        )}
      </div>
    </div>
  );
};