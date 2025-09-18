#!/bin/bash

echo "🔧 Creating simplified Industrial Workspaces..."

# Create simplified Financial Forecasting workspace
cat > src/components/MultiAgentWorkspace/IndustrialForecastingWorkspace.tsx << 'EOF'
import React, { useCallback, useState, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Controls, Background, MiniMap, Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Settings, DollarSign, CheckCircle, AlertCircle, Clock, TrendingUp, BarChart3, Brain, Globe, Target } from 'lucide-react';

const SimpleAgentNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-lg rounded-lg bg-slate-800/90 border border-yellow-400/30 min-w-[200px]">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
      <div className="font-medium text-white text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-slate-400">{data.agentType}</div>
    <div className="text-xs text-yellow-300 mt-1">{data.status}</div>
  </div>
);

const SimpleDecisionNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 shadow-lg rounded-lg bg-amber-800/90 border border-amber-400/30">
    <div className="font-medium text-white text-sm">{data.label}</div>
    <div className="text-xs text-amber-300">{data.status}</div>
  </div>
);

const SimpleMemoryNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 shadow-lg rounded-lg bg-green-800/90 border border-green-400/30">
    <div className="font-medium text-white text-sm">{data.label}</div>
    <div className="text-xs text-green-300">{data.size}</div>
  </div>
);

const SimpleGuardrailNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 shadow-lg rounded-lg bg-red-800/90 border border-red-400/30">
    <div className="font-medium text-white text-sm">{data.label}</div>
    <div className="text-xs text-red-300">{data.status}</div>
  </div>
);

const nodeTypes = { agent: SimpleAgentNode, decision: SimpleDecisionNode, guardrail: SimpleGuardrailNode, memory: SimpleMemoryNode };

const initialNodes: Node[] = [
  { id: 'market-intelligence', type: 'agent', position: { x: 100, y: 100 }, data: { label: 'Market Intelligence Agent', agentType: 'Market Intelligence Agent', status: 'active' }},
  { id: 'financial-forecasting', type: 'agent', position: { x: 500, y: 100 }, data: { label: 'Financial Forecasting Agent', agentType: 'Financial Forecasting Agent', status: 'forecasting' }},
  { id: 'scenario-analysis', type: 'agent', position: { x: 900, y: 100 }, data: { label: 'Scenario Analysis Agent', agentType: 'Scenario Analysis Agent', status: 'modeling' }},
  { id: 'risk-assessment', type: 'agent', position: { x: 100, y: 400 }, data: { label: 'Risk Assessment Agent', agentType: 'Risk Assessment Agent', status: 'assessing' }},
  { id: 'economic-indicator', type: 'agent', position: { x: 500, y: 400 }, data: { label: 'Economic Indicator Agent', agentType: 'Economic Indicator Agent', status: 'monitoring' }},
  { id: 'project-finance', type: 'agent', position: { x: 900, y: 400 }, data: { label: 'Project Finance Agent', agentType: 'Project Finance Agent', status: 'analyzing' }},
  { id: 'forecasting-coordinator', type: 'decision', position: { x: 500, y: 250 }, data: { label: 'Forecasting Coordinator', status: 'coordinating' }},
  { id: 'financial-memory', type: 'memory', position: { x: 300, y: 550 }, data: { label: 'Financial Memory', size: '8.2GB' }},
  { id: 'financial-compliance', type: 'guardrail', position: { x: 700, y: 550 }, data: { label: 'Financial Compliance', status: 'monitoring' }}
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'market-intelligence', target: 'financial-forecasting', animated: true, style: { stroke: '#f59e0b' }},
  { id: 'e2', source: 'financial-forecasting', target: 'scenario-analysis', animated: true, style: { stroke: '#f59e0b' }},
  { id: 'e3', source: 'forecasting-coordinator', target: 'scenario-analysis', animated: true, style: { stroke: '#f59e0b' }},
  { id: 'e4', source: 'risk-assessment', target: 'forecasting-coordinator', animated: true, style: { stroke: '#f59e0b' }},
  { id: 'e5', source: 'economic-indicator', target: 'market-intelligence', animated: true, style: { stroke: '#f59e0b' }},
  { id: 'e6', source: 'financial-forecasting', target: 'financial-memory', style: { stroke: '#f59e0b' }},
  { id: 'e7', source: 'project-finance', target: 'financial-compliance', style: { stroke: '#f59e0b' }}
];

export const IndustrialForecastingWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowMetrics, setWorkflowMetrics] = useState({ forecastAccuracy: '89.3%', scenariosAnalyzed: 47, confidenceLevel: '92%' });

  useEffect(() => {
    const interval = setInterval(() => {
      setEdges(edges => edges.map(edge => ({ ...edge, animated: Math.random() > 0.3 })));
    }, 2000);
    return () => clearInterval(interval);
  }, [setEdges]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#f59e0b' }} as any, eds));
  }, [setEdges]);

  const runWorkflow = useCallback(() => {
    setIsRunning(true);
    setEdges(edges => edges.map(edge => ({ ...edge, animated: true })));
    setTimeout(() => setIsRunning(false), 3000);
  }, [setEdges]);

  const getExecutionStatus = () => {
    if (isRunning) return { status: 'analyzing', color: 'text-yellow-400', icon: Clock };
    return { status: 'ready', color: 'text-slate-400', icon: DollarSign };
  };

  const executionStatus = getExecutionStatus();
  const StatusIcon = executionStatus.icon;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-yellow-900/20 to-slate-800 text-slate-100 overflow-hidden">
      <div className="bg-slate-800/40 backdrop-blur-lg border-b border-yellow-600/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-yellow-400" />
              <h1 className="text-xl font-bold text-white">Financial Forecasting & Scenario Analysis</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-yellow-400/50 text-yellow-300">Predictive & Proactive Pattern</Badge>
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <StatusIcon className={`w-4 h-4 ${executionStatus.color}`} />
                <span className={executionStatus.color}>{executionStatus.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={runWorkflow} disabled={isRunning} className="border-green-400/50 text-green-400 hover:bg-green-400/10">
              {isRunning ? <><div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2" />Forecasting</> : <><Play className="w-4 h-4 mr-2" />Execute</>}
            </Button>
            <Button variant="outline" size="sm" className="border-slate-400/50 text-slate-400 hover:bg-slate-400/10"><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 text-sm text-slate-400">
          <div className="flex items-center gap-1"><Brain className="w-4 h-4 text-yellow-400" /><span>6 forecasting agents</span></div>
          <div className="flex items-center gap-1"><BarChart3 className="w-4 h-4 text-blue-400" /><span>6 analysis tasks</span></div>
          <div className="flex items-center gap-1"><Globe className="w-4 h-4 text-green-400" /><span>Real-time Data Integration</span></div>
          <div className="flex items-center gap-1"><Target className="w-4 h-4 text-purple-400" /><span>{workflowMetrics.forecastAccuracy} accuracy</span></div>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView className="bg-gradient-to-br from-slate-900/50 via-yellow-900/30 to-slate-800/50" style={{ backgroundColor: 'transparent' }}>
          <Background color="rgba(245, 158, 11, 0.1)" gap={40} size={1} style={{ backgroundColor: 'transparent', opacity: 0.3 }} />
          <Controls className="bg-slate-800/40 backdrop-blur-lg border border-yellow-400/20 shadow-lg rounded-xl" />
          <MiniMap className="bg-slate-800/40 backdrop-blur-lg border border-yellow-400/20 shadow-lg rounded-xl" nodeColor="#f59e0b" maskColor="rgba(30, 41, 59, 0.6)" />
        </ReactFlow>
      </div>
      <div className="bg-slate-800/40 backdrop-blur-lg border-t border-yellow-600/30 p-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4"><span>Predictive Pattern: Active</span><span>Data Sources: Real-time</span><span>Scenarios: Multi-dimensional</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div><span>Large Industries Financial Intelligence</span></div>
        </div>
      </div>
    </div>
  );
};
EOF

# Create simplified Recruitment workspace
cat > src/components/MultiAgentWorkspace/IndustrialRecruitmentWorkspace.tsx << 'EOF'
import React, { useCallback, useState, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Controls, Background, MiniMap, Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Settings, UserCheck, Users, Target, BookOpen, Award, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const SimpleAgentNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-lg rounded-lg bg-slate-800/90 border border-indigo-400/30 min-w-[200px]">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
      <div className="font-medium text-white text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-slate-400">{data.agentType}</div>
    <div className="text-xs text-indigo-300 mt-1">{data.status}</div>
  </div>
);

const SimpleDecisionNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 shadow-lg rounded-lg bg-purple-800/90 border border-purple-400/30">
    <div className="font-medium text-white text-sm">{data.label}</div>
    <div className="text-xs text-purple-300">{data.status}</div>
  </div>
);

const SimpleMemoryNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 shadow-lg rounded-lg bg-green-800/90 border border-green-400/30">
    <div className="font-medium text-white text-sm">{data.label}</div>
    <div className="text-xs text-green-300">{data.size}</div>
  </div>
);

const SimpleGuardrailNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 shadow-lg rounded-lg bg-red-800/90 border border-red-400/30">
    <div className="font-medium text-white text-sm">{data.label}</div>
    <div className="text-xs text-red-300">{data.status}</div>
  </div>
);

const nodeTypes = { agent: SimpleAgentNode, decision: SimpleDecisionNode, guardrail: SimpleGuardrailNode, memory: SimpleMemoryNode };

const initialNodes: Node[] = [
  { id: 'talent-sourcing', type: 'agent', position: { x: 100, y: 100 }, data: { label: 'Talent Sourcing Agent', agentType: 'Talent Sourcing Agent', status: 'active' }},
  { id: 'resume-screening', type: 'agent', position: { x: 500, y: 100 }, data: { label: 'Resume Screening Agent', agentType: 'Resume Screening Agent', status: 'screening' }},
  { id: 'interview-coordinator', type: 'agent', position: { x: 900, y: 100 }, data: { label: 'Interview Coordinator', agentType: 'Interview Coordinator', status: 'coordinating' }},
  { id: 'onboarding-assistant', type: 'agent', position: { x: 300, y: 400 }, data: { label: 'Onboarding Assistant', agentType: 'Onboarding Assistant', status: 'assisting' }},
  { id: 'career-development', type: 'agent', position: { x: 700, y: 400 }, data: { label: 'Career Development Agent', agentType: 'Career Development Agent', status: 'planning' }},
  { id: 'talent-coordinator', type: 'decision', position: { x: 500, y: 250 }, data: { label: 'Talent Coordinator', status: 'coordinating' }},
  { id: 'talent-memory', type: 'memory', position: { x: 200, y: 550 }, data: { label: 'Talent Memory', size: '1.2GB' }},
  { id: 'hr-compliance', type: 'guardrail', position: { x: 800, y: 550 }, data: { label: 'HR Compliance Guard', status: 'monitoring' }}
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'talent-sourcing', target: 'resume-screening', animated: true, style: { stroke: '#6366f1' }},
  { id: 'e2', source: 'resume-screening', target: 'interview-coordinator', animated: true, style: { stroke: '#6366f1' }},
  { id: 'e3', source: 'interview-coordinator', target: 'onboarding-assistant', animated: true, style: { stroke: '#6366f1' }},
  { id: 'e4', source: 'onboarding-assistant', target: 'career-development', animated: true, style: { stroke: '#6366f1' }},
  { id: 'e5', source: 'talent-coordinator', target: 'talent-memory', style: { stroke: '#6366f1' }},
  { id: 'e6', source: 'career-development', target: 'hr-compliance', style: { stroke: '#6366f1' }}
];

export const IndustrialRecruitmentWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowMetrics] = useState({ candidatesProcessed: 247, placementRate: '89%' });

  useEffect(() => {
    const interval = setInterval(() => {
      setEdges(edges => edges.map(edge => ({ ...edge, animated: Math.random() > 0.3 })));
    }, 2000);
    return () => clearInterval(interval);
  }, [setEdges]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1' }} as any, eds));
  }, [setEdges]);

  const runWorkflow = useCallback(() => {
    setIsRunning(true);
    setEdges(edges => edges.map(edge => ({ ...edge, animated: true })));
    setTimeout(() => setIsRunning(false), 3000);
  }, [setEdges]);

  const getExecutionStatus = () => {
    if (isRunning) return { status: 'recruiting', color: 'text-indigo-400', icon: Clock };
    return { status: 'ready', color: 'text-slate-400', icon: UserCheck };
  };

  const executionStatus = getExecutionStatus();
  const StatusIcon = executionStatus.icon;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-800 text-slate-100 overflow-hidden">
      <div className="bg-slate-800/40 backdrop-blur-lg border-b border-indigo-600/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-400" />
              <h1 className="text-xl font-bold text-white">Talent Management & Recruitment</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-indigo-400/50 text-indigo-300">Lifecycle Agent Pattern</Badge>
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <StatusIcon className={`w-4 h-4 ${executionStatus.color}`} />
                <span className={executionStatus.color}>{executionStatus.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={runWorkflow} disabled={isRunning} className="border-green-400/50 text-green-400 hover:bg-green-400/10">
              {isRunning ? <><div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2" />Processing</> : <><Play className="w-4 h-4 mr-2" />Execute</>}
            </Button>
            <Button variant="outline" size="sm" className="border-slate-400/50 text-slate-400 hover:bg-slate-400/10"><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 text-sm text-slate-400">
          <div className="flex items-center gap-1"><Users className="w-4 h-4 text-indigo-400" /><span>5 talent agents</span></div>
          <div className="flex items-center gap-1"><Target className="w-4 h-4 text-blue-400" /><span>5 lifecycle stages</span></div>
          <div className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-green-400" /><span>MyVoice Integration</span></div>
          <div className="flex items-center gap-1"><Award className="w-4 h-4 text-purple-400" /><span>{workflowMetrics.placementRate} placement rate</span></div>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView className="bg-gradient-to-br from-slate-900/50 via-indigo-900/30 to-slate-800/50" style={{ backgroundColor: 'transparent' }}>
          <Background color="rgba(99, 102, 241, 0.1)" gap={40} size={1} style={{ backgroundColor: 'transparent', opacity: 0.3 }} />
          <Controls className="bg-slate-800/40 backdrop-blur-lg border border-indigo-400/20 shadow-lg rounded-xl" />
          <MiniMap className="bg-slate-800/40 backdrop-blur-lg border border-indigo-400/20 shadow-lg rounded-xl" nodeColor="#6366f1" maskColor="rgba(30, 41, 59, 0.6)" />
        </ReactFlow>
      </div>
      <div className="bg-slate-800/40 backdrop-blur-lg border-t border-indigo-600/30 p-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4"><span>Lifecycle Pattern: Active</span><span>Talent Pool: Global</span><span>MyVoice: Integrated</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div><span>Industrial Talent Management System</span></div>
        </div>
      </div>
    </div>
  );
};
EOF

echo "✅ Simplified Industrial Workspaces created successfully!"