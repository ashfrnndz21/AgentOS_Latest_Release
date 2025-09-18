import React, { useCallback, useState, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Controls, Background, MiniMap, Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Settings, Shield, CheckCircle, AlertCircle, Clock, Eye, Wrench, Activity, Phone, Camera, Thermometer } from 'lucide-react';

const SimpleAgentNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-lg rounded-lg bg-slate-800/90 border border-red-400/30 min-w-[200px]">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
      <div className="font-medium text-white text-sm">{data.label}</div>
    </div>
    <div className="text-xs text-slate-400">{data.agentType}</div>
    <div className="text-xs text-red-300 mt-1">{data.status}</div>
  </div>
);

const SimpleDecisionNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 shadow-lg rounded-lg bg-orange-800/90 border border-orange-400/30">
    <div className="font-medium text-white text-sm">{data.label}</div>
    <div className="text-xs text-orange-300">{data.status}</div>
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
  { id: 'multimodal-sensor', type: 'agent', position: { x: 100, y: 100 }, data: { label: 'Multi-Modal Sensor Agent', agentType: 'Multi-Modal Sensor Agent', status: 'monitoring' }},
  { id: 'predictive-maintenance', type: 'agent', position: { x: 500, y: 100 }, data: { label: 'Predictive Maintenance', agentType: 'Predictive Maintenance', status: 'predicting' }},
  { id: 'safety-monitor', type: 'agent', position: { x: 900, y: 100 }, data: { label: 'Safety Monitoring Agent', agentType: 'Safety Monitoring Agent', status: 'monitoring' }},
  { id: 'emergency-response', type: 'agent', position: { x: 100, y: 400 }, data: { label: 'Emergency Response', agentType: 'Emergency Response', status: 'standby' }},
  { id: 'equipment-health', type: 'agent', position: { x: 500, y: 400 }, data: { label: 'Equipment Health Agent', agentType: 'Equipment Health Agent', status: 'monitoring' }},
  { id: 'compliance-audit', type: 'agent', position: { x: 900, y: 400 }, data: { label: 'Compliance Audit Agent', agentType: 'Compliance Audit Agent', status: 'auditing' }},
  { id: 'safety-coordinator', type: 'decision', position: { x: 500, y: 250 }, data: { label: 'Safety Coordinator', status: 'coordinating' }},
  { id: 'safety-memory', type: 'memory', position: { x: 200, y: 550 }, data: { label: 'Safety Memory', size: '3.4GB' }},
  { id: 'safety-compliance', type: 'guardrail', position: { x: 800, y: 550 }, data: { label: 'Safety Compliance Guard', status: 'monitoring' }}
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'multimodal-sensor', target: 'safety-monitor', animated: true, style: { stroke: '#ef4444' }},
  { id: 'e2', source: 'predictive-maintenance', target: 'equipment-health', animated: true, style: { stroke: '#ef4444' }},
  { id: 'e3', source: 'safety-monitor', target: 'emergency-response', animated: true, style: { stroke: '#ef4444' }},
  { id: 'e4', source: 'safety-coordinator', target: 'emergency-response', animated: true, style: { stroke: '#ef4444' }},
  { id: 'e5', source: 'equipment-health', target: 'safety-memory', style: { stroke: '#ef4444' }},
  { id: 'e6', source: 'compliance-audit', target: 'safety-compliance', style: { stroke: '#ef4444' }}
];

export const IndustrialSafetyWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowMetrics] = useState({ sensorsActive: 342, equipmentMonitored: 156, safetyIncidents: 0, uptime: '99.7%' });

  useEffect(() => {
    const interval = setInterval(() => {
      setEdges(edges => edges.map(edge => ({ ...edge, animated: Math.random() > 0.3 })));
    }, 2000);
    return () => clearInterval(interval);
  }, [setEdges]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#ef4444' }} as any, eds));
  }, [setEdges]);

  const runWorkflow = useCallback(() => {
    setIsRunning(true);
    setEdges(edges => edges.map(edge => ({ ...edge, animated: true })));
    setTimeout(() => setIsRunning(false), 3000);
  }, [setEdges]);

  const getExecutionStatus = () => {
    if (isRunning) return { status: 'monitoring', color: 'text-red-400', icon: Clock };
    return { status: 'secure', color: 'text-green-400', icon: Shield };
  };

  const executionStatus = getExecutionStatus();
  const StatusIcon = executionStatus.icon;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-red-900/20 to-orange-900/20 text-slate-100 overflow-hidden">
      <div className="bg-slate-800/40 backdrop-blur-lg border-b border-red-600/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-400" />
              <h1 className="text-xl font-bold text-white">Safety & Predictive Maintenance</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-red-400/50 text-red-300">Multi-Modal Sensing & Action Pattern</Badge>
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <StatusIcon className={`w-4 h-4 ${executionStatus.color}`} />
                <span className={executionStatus.color}>{executionStatus.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={runWorkflow} disabled={isRunning} className="border-green-400/50 text-green-400 hover:bg-green-400/10">
              {isRunning ? <><div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2" />Monitoring</> : <><Play className="w-4 h-4 mr-2" />Start Monitoring</>}
            </Button>
            <Button variant="outline" size="sm" className="border-slate-400/50 text-slate-400 hover:bg-slate-400/10"><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 text-sm text-slate-400">
          <div className="flex items-center gap-1"><Camera className="w-4 h-4 text-blue-400" /><span>24 cameras active</span></div>
          <div className="flex items-center gap-1"><Thermometer className="w-4 h-4 text-orange-400" /><span>{workflowMetrics.sensorsActive} sensors online</span></div>
          <div className="flex items-center gap-1"><Activity className="w-4 h-4 text-green-400" /><span>{workflowMetrics.uptime} uptime</span></div>
          <div className="flex items-center gap-1"><Shield className="w-4 h-4 text-red-400" /><span>{workflowMetrics.safetyIncidents} incidents</span></div>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView className="bg-gradient-to-br from-slate-900/50 via-red-900/30 to-orange-900/50" style={{ backgroundColor: 'transparent' }}>
          <Background color="rgba(239, 68, 68, 0.1)" gap={40} size={1} style={{ backgroundColor: 'transparent', opacity: 0.3 }} />
          <Controls className="bg-slate-800/40 backdrop-blur-lg border border-red-400/20 shadow-lg rounded-xl" />
          <MiniMap className="bg-slate-800/40 backdrop-blur-lg border border-red-400/20 shadow-lg rounded-xl" nodeColor="#ef4444" maskColor="rgba(30, 41, 59, 0.6)" />
        </ReactFlow>
      </div>
      <div className="bg-slate-800/40 backdrop-blur-lg border-t border-red-600/30 p-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4"><span>Safety Monitoring: Active</span><span>Predictive Maintenance: Running</span><span>Emergency Response: Standby</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div><span>All Systems Monitored</span></div>
        </div>
      </div>
    </div>
  );
};