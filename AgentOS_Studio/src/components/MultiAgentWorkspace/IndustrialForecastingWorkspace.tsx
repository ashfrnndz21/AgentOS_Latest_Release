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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { IndustrialWorkspaceHeader } from './IndustrialWorkspaceHeader';
import { IndustrialForecastingAgentPalette } from './IndustrialForecastingAgentPalette';
import { IndustrialForecastingPropertiesPanel } from './IndustrialForecastingPropertiesPanel';
import { IndustrialForecastingWorkflowToolbar } from './IndustrialForecastingWorkflowToolbar';
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

// Initial nodes for Industrial Financial Forecasting workflow
const initialNodes: Node[] = [
  {
    id: 'data-collection-agent',
    type: 'agent',
    position: { x: 100, y: 100 },
    data: {
      label: 'Data Collection Agent',
      agentType: 'Data Collection Agent',
      model: 'Claude 3.5 Sonnet',
      tools: ['Data Ingestion', 'API Integration', 'Database Connectivity'],
      guardrails: ['Data Privacy', 'Source Validation'],
      memory: true,
      reasoning: 'data-driven',
      status: 'collecting',
      description: 'Collects financial and market data from multiple sources',
      dataSources: ['ERP', 'CRM', 'Market Data', 'IoT Sensors'],
      recordsProcessed: 2400000,
      accuracy: '98.7%'
    }
  },
  {
    id: 'market-analysis-agent',
    type: 'agent',
    position: { x: 400, y: 100 },
    data: {
      label: 'Market Analysis Agent',
      agentType: 'Market Analysis Agent',
      model: 'Claude 3.5 Sonnet',
      tools: ['Market Research', 'Trend Analysis', 'Competitive Intelligence'],
      guardrails: ['Market Data Compliance', 'Analysis Standards'],
      memory: true,
      reasoning: 'analytical',
      status: 'analyzing',
      description: 'Analyzes market trends and competitive landscape',
      marketsAnalyzed: 45,
      trendAccuracy: '89.3%'
    }
  },
  {
    id: 'forecast-generation-agent',
    type: 'agent',
    position: { x: 700, y: 100 },
    data: {
      label: 'Forecast Generation Agent',
      agentType: 'Forecast Generation Agent',
      model: 'Claude 3.5 Sonnet',
      tools: ['Forecast Algorithms', 'Confidence Intervals', 'Scenario Planning'],
      guardrails: ['Forecast Accuracy', 'Confidence Thresholds'],
      memory: true,
      reasoning: 'predictive',
      status: 'forecasting',
      description: 'Generates financial forecasts and scenarios',
      forecastsGenerated: 1456,
      confidenceLevel: '92.8%'
    }
  },
  {
    id: 'forecasting-memory-core',
    type: 'memory',
    position: { x: 400, y: 300 },
    data: {
      label: 'Forecasting Memory Core',
      config: {
        type: 'financial-models',
        persistence: true,
        retention: '5 years'
      },
      status: 'active',
      size: '8.7 GB',
      records: 987654
    }
  }
];

// Define the relationships between agents
const initialEdges: Edge[] = [
  {
    id: 'e1',
    source: 'data-collection-agent',
    target: 'market-analysis-agent',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Market Data', status: 'active' }
  },
  {
    id: 'e2',
    source: 'market-analysis-agent',
    target: 'forecast-generation-agent',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Analysis Results', status: 'active' }
  },
  {
    id: 'e3',
    source: 'data-collection-agent',
    target: 'forecasting-memory-core',
    type: 'enhanced',
    data: { type: 'data', label: 'Raw Data', status: 'active' }
  }
];

export const IndustrialForecastingWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowMetrics, setWorkflowMetrics] = useState({
    complianceScore: 97,
    riskLevel: 'Medium',
    performanceScore: 89,
    validationErrors: [],
    revenueImpact: '$24.7M',
    forecastAccuracy: '87.3%',
    scenariosAnalyzed: 1456
  });

  // Simulate real-time workflow activity
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update edge animations to show workflow activity
      setEdges(edges => edges.map(edge => ({
        ...edge,
        animated: Math.random() > 0.3,
        data: {
          ...edge.data,
          metrics: {
            executionCount: (edge.data?.metrics?.executionCount || 0) + 1,
            avgDuration: Math.random() * 2 + 1,
            successRate: Math.random() * 20 + 80
          }
        }
      })));

      // Update workflow metrics periodically
      setWorkflowMetrics(prev => ({
        ...prev,
        scenariosAnalyzed: prev.scenariosAnalyzed + (Math.random() > 0.7 ? 1 : 0)
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
          label: 'New Connection',
          status: 'active'
        }
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
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
    
    // Animate all edges to show activity
    setEdges(edges => edges.map(edge => ({
      ...edge,
      animated: true,
      data: { ...edge.data, status: 'active' }
    })));

    // Update metrics after simulation
    setTimeout(() => {
      setWorkflowMetrics(prev => ({
        ...prev,
        complianceScore: Math.floor(Math.random() * 5) + 95,
        performanceScore: Math.floor(Math.random() * 15) + 85,
        revenueImpact: `$${(Math.random() * 10 + 20).toFixed(1)}M`
      }));
      
      setEdges(edges => edges.map(edge => ({
        ...edge,
        animated: false
      })));
      
      setIsRunning(false);
    }, 3000);
  }, [setEdges]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <IndustrialWorkspaceHeader />
      
      <div className="flex-1 flex">
        {/* Forecasting Agent Palette */}
        <IndustrialForecastingAgentPalette />
        
        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          <IndustrialForecastingWorkflowToolbar 
            isRunning={isRunning}
            onRun={runWorkflow}
            onStop={() => setIsRunning(false)}
            onExport={() => {}}
            onImport={() => {}}
            nodeCount={nodes.length}
            edgeCount={edges.length}
            metrics={workflowMetrics}
            onSave={() => {}}
            onLoad={() => {}}
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
            className="flex-1"
            style={{ background: 'transparent' }}
          >
            <Background 
              color="rgba(148, 163, 184, 0.1)"
              gap={20}
              size={1}
              style={{ backgroundColor: 'transparent' }}
            />
            <Controls 
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50"
              style={{ background: 'rgba(30, 41, 59, 0.2)' }}
            />
            <MiniMap 
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50"
              style={{ background: 'rgba(30, 41, 59, 0.2)' }}
              nodeColor="#64748b"
              maskColor="rgba(30, 41, 59, 0.6)"
            />
          </ReactFlow>
        </div>
        
        {/* Forecasting Properties Panel */}
        {showProperties && selectedNode && (
          <IndustrialForecastingPropertiesPanel
            selectedNode={selectedNode}
            updateNodeData={updateNodeData}
            onClose={() => setShowProperties(false)}
          />
        )}
      </div>
    </div>
  );
};