import React, { useCallback, useState, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Controls, Background, MiniMap, Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Settings, FlaskConical, CheckCircle, AlertCircle, Clock, BookOpen, Cpu, TestTube, Brain } from 'lucide-react';

const SimpleAgentNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-lg rounded-lg bg-slate-800/90 border border-pink-400/30 min-w-[200px]">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
      <div className="font-medium text-white text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-slate-400">{data.agentType}</div>
    <div className="text-xs text-pink-300 mt-1">{data.status}</div>
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
  { id: 'literature-mining', type: 'agent', position: { x: 100, y: 100 }, data: { label: 'Literature Mining Agent', agentType: 'Literature Mining Agent', status: 'mining' }},
  { id: 'digital-twin', type: 'agent', position: { x: 500, y: 100 }, data: { label: 'Digital Twin Simulator', agentType: 'Digital Twin Simulator', status: 'simulating' }},
  { id: 'compound-analysis', type: 'agent', position: { x: 900, y: 100 }, data: { label: 'Compound Analysis Agent', agentType: 'Compound Analysis Agent', status: 'analyzing' }},
  { id: 'lab-coordination', type: 'agent', position: { x: 300, y: 400 }, data: { label: 'Lab Coordination Agent', agentType: 'Lab Coordination Agent', status: 'coordinating' }},
  { id: 'innovation-tracker', type: 'agent', position: { x: 700, y: 400 }, data: { label: 'Innovation Intelligence', agentType: 'Innovation Intelligence', status: 'tracking' }},
  { id: 'rd-coordinator', type: 'decision', position: { x: 500, y: 250 }, data: { label: 'R&D Coordinator', status: 'coordinating' }},
  { id: 'research-memory', type: 'memory', position: { x: 200, y: 550 }, data: { label: 'Research Memory', size: '15.7GB' }},
  { id: 'ip-compliance', type: 'guardrail', position: { x: 800, y: 550 }, data: { label: 'IP Compliance Guard', status: 'monitoring' }}
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'literature-mining', target: 'digital-twin', animated: true, style: { stroke: '#ec4899' }},
  { id: 'e2', source: 'digital-twin', target: 'compound-analysis', animated: true, style: { stroke: '#ec4899' }},
  { id: 'e3', source: 'compound-analysis', target: 'lab-coordination', animated: true, style: { stroke: '#ec4899' }},
  { id: 'e4', source: 'innovation-tracker', target: 'rd-coordinator', animated: true, style: { stroke: '#ec4899' }},
  { id: 'e5', source: 'rd-coordinator', target: 'research-memory', style: { stroke: '#ec4899' }},
  { id: 'e6', source: 'lab-coordination', target: 'ip-compliance', style: { stroke: '#ec4899' }}
];

export const IndustrialRDWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowMetrics] = useState({ papersAnalyzed: 15247, compoundsSimulated: 847, labCandidates: 23 });

  useEffect(() => {
    const interval = setInterval(() => {
      setEdges(edges => edges.map(edge => ({ ...edge, animated: Math.random() > 0.3 })));
    }, 2000);
    return () => clearInterval(interval);
  }, [setEdges]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#ec4899' }} as any, eds));
  }, [setEdges]);

  const runWorkflow = useCallback(() => {
    setIsRunning(true);
    setEdges(edges => edges.map(edge => ({ ...edge, animated: true })));
    setTimeout(() => setIsRunning(false), 3000);
  }, [setEdges]);

  const getExecutionStatus = () => {
    if (isRunning) return { status: 'discovering', color: 'text-pink-400', icon: Clock };
    return { status: 'ready', color: 'text-slate-400', icon: FlaskConical };
  };

  const executionStatus = getExecutionStatus();
  const StatusIcon = executionStatus.icon;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-pink-900/20 to-purple-900/20 text-slate-100 overflow-hidden">
      <div className="bg-slate-800/40 backdrop-blur-lg border-b border-pink-600/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-pink-400" />
              <h1 className="text-xl font-bold text-white">R&D Materials Discovery</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-pink-400/50 text-pink-300">Simulation & Optimization Pattern</Badge>
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <StatusIcon className={`w-4 h-4 ${executionStatus.color}`} />
                <span className={executionStatus.color}>{executionStatus.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={runWorkflow} disabled={isRunning} className="border-green-400/50 text-green-400 hover:bg-green-400/10">
              {isRunning ? <><div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2" />Discovering</> : <><Play className="w-4 h-4 mr-2" />Start Discovery</>}
            </Button>
            <Button variant="outline" size="sm" className="border-slate-400/50 text-slate-400 hover:bg-slate-400/10"><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 text-sm text-slate-400">
          <div className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-blue-400" /><span>{workflowMetrics.papersAnalyzed}+ papers analyzed</span></div>
          <div className="flex items-center gap-1"><TestTube className="w-4 h-4 text-purple-400" /><span>{workflowMetrics.compoundsSimulated} compounds simulated</span></div>
          <div className="flex items-center gap-1"><Cpu className="w-4 h-4 text-green-400" /><span>{workflowMetrics.labCandidates} lab candidates</span></div>
          <div className="flex items-center gap-1"><Brain className="w-4 h-4 text-pink-400" /><span>Energy Transition Focus</span></div>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView className="bg-gradient-to-br from-slate-900/50 via-pink-900/30 to-purple-900/50" style={{ backgroundColor: 'transparent' }}>
          <Background color="rgba(236, 72, 153, 0.1)" gap={40} size={1} style={{ backgroundColor: 'transparent', opacity: 0.3 }} />
          <Controls className="bg-slate-800/40 backdrop-blur-lg border border-pink-400/20 shadow-lg rounded-xl" />
          <MiniMap className="bg-slate-800/40 backdrop-blur-lg border border-pink-400/20 shadow-lg rounded-xl" nodeColor="#ec4899" maskColor="rgba(30, 41, 59, 0.6)" />
        </ReactFlow>
      </div>
      <div className="bg-slate-800/40 backdrop-blur-lg border-t border-pink-600/30 p-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4"><span>R&D Discovery: Active</span><span>Simulation Engine: Running</span><span>Lab Coordination: Standby</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div><span>Materials Discovery in Progress</span></div>
        </div>
      </div>
    </div>
  );
};